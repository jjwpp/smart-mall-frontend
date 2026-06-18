<!-- ==================== 商品列表页 ==================== -->
<template>
  <div>
    <h2 class="mb-20">📋 商品列表</h2>

    <!-- 搜索筛选 -->
    <div class="card">
      <div class="search-bar">
        <input v-model="keyword" placeholder="搜索商品名称..." @keyup.enter="search" />
        <select v-model="selectedCategory" @change="search">
          <option :value="null">全部分类</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
        </select>
        <button class="btn-primary" @click="search">搜索</button>
        <button class="btn-text" @click="reset">重置</button>
      </div>
    </div>

    <!-- 商品网格 -->
    <div v-if="loading" class="loading-text">加载中...</div>
    <div v-else-if="!products.length" class="empty-state">
      <div class="icon">📦</div><p>暂无商品</p>
    </div>
    <div v-else class="product-grid">
      <div class="product-card" v-for="p in products" :key="p.id" @click="$router.push(`/products/${p.id}`)">
        <div class="cover">
          <img v-if="p.coverUrl" :src="p.coverUrl" :alt="p.name" style="width:100%;height:100%;object-fit:cover" />
          <span v-else>📦</span>
        </div>
        <div class="info">
          <div class="name">{{ p.name }}</div>
          <div class="subtitle">{{ p.subtitle || '' }}</div>
          <div class="bottom">
            <span class="price">{{ p.price }}</span>
            <span class="sales">已售 {{ p.sales || 0 }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="pagination" v-if="totalPages > 1">
      <button :disabled="pageNum <= 1" @click="pageNum--; fetchProducts()">上一页</button>
      <button v-for="i in totalPages" :key="i" :class="{ active: i === pageNum }" @click="pageNum = i; fetchProducts()">{{ i }}</button>
      <button :disabled="pageNum >= totalPages" @click="pageNum++; fetchProducts()">下一页</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '../../utils/api'

const keyword = ref('')
const selectedCategory = ref(null)
const categories = ref([])
const products = ref([])
const pageNum = ref(1)
const pageSize = ref(12)
const totalPages = ref(0)
const loading = ref(false)

async function fetchCategories() {
  try { categories.value = await api.getCategories() || [] } catch {}
}
async function fetchProducts() {
  loading.value = true
  try {
    const params = { pageNum: pageNum.value, pageSize: pageSize.value }
    if (keyword.value) params.keyword = keyword.value
    if (selectedCategory.value) params.categoryId = selectedCategory.value
    const data = await api.getProducts(params)
    products.value = data?.records || []
    totalPages.value = data?.pages || Math.ceil((data?.total || 0) / pageSize.value)
  } catch { products.value = [] }
  finally { loading.value = false }
}
function search() { pageNum.value = 1; fetchProducts() }
function reset() {
  keyword.value = ''
  selectedCategory.value = null
  pageNum.value = 1
  fetchProducts()
}
onMounted(() => { fetchCategories(); fetchProducts() })
</script>
