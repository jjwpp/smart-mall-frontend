<!-- ==================== 我的评价页 ==================== -->
<template>
  <div>
    <h2 class="mb-20">⭐ 我的评价</h2>
    <div class="card">
      <div v-if="loading" class="loading-text">加载中...</div>
      <div v-else-if="!reviews.length" class="empty-state">
        <div class="icon">⭐</div><p>暂无评价</p>
        <router-link to="/orders" class="btn-primary" style="display:inline-block;margin-top:12px">去订单看看</router-link>
      </div>
      <div v-else>
        <div v-for="r in reviews" :key="r.id" class="review-item">
          <div class="review-header">
            <div class="review-product">
              <span class="review-product-name">{{ getProductName(r.productId) }}</span>
              <span class="review-rating">{{ '★'.repeat(r.rating) }}{{ '☆'.repeat(5 - r.rating) }}</span>
            </div>
            <button class="btn-text btn-sm" style="color:var(--danger)" @click="handleDelete(r.id)">删除</button>
          </div>
          <p class="review-content" v-if="r.content">{{ r.content }}</p>
          <p class="review-meta">订单 #{{ r.orderId }} · {{ r.createdAt?.slice(0, 10) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '../../stores/user'
import { api } from '../../utils/api'

const userStore = useUserStore()
const reviews = ref([])
const loading = ref(false)
const productNames = ref({})

onMounted(async () => {
  loading.value = true
  try {
    reviews.value = await api.getMyReviews(userStore.userId, userStore.token) || []
    // 加载商品名称
    const names = {}
    await Promise.all(
      reviews.value.map(async (r) => {
        if (!names[r.productId]) {
          try {
            const p = await api.getProductDetail(r.productId)
            names[r.productId] = p?.name || ('商品#' + r.productId)
          } catch { names[r.productId] = '商品#' + r.productId }
        }
      })
    )
    productNames.value = names
  } catch { reviews.value = [] }
  finally { loading.value = false }
})

function getProductName(productId) {
  return productNames.value[productId] || ('商品#' + productId)
}

async function handleDelete(id) {
  if (!confirm('确定删除该评价吗？')) return
  try {
    await api.deleteReview(id, userStore.token)
    reviews.value = reviews.value.filter(r => r.id !== id)
  } catch (e) { alert(e.message) }
}
</script>

<style scoped>
.review-item { padding: 16px 0; border-bottom: 1px solid var(--border-light); }
.review-item:last-child { border-bottom: none; }
.review-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.review-product { display: flex; align-items: center; gap: 12px; }
.review-product-name { font-weight: 600; font-size: 15px; }
.review-rating { color: #f5a623; font-size: 16px; letter-spacing: 2px; }
.review-content { color: var(--text); line-height: 1.6; margin-bottom: 6px; }
.review-meta { color: var(--text-light); font-size: 12px; }
</style>
