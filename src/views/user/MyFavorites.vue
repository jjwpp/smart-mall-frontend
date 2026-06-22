<template>
  <div class="page">
    <div class="page-header"><h2 class="page-title">❤️ 我的收藏</h2></div>

    <div v-if="loading" class="loading-state"><span class="spinner"></span></div>
    <div v-else-if="!list.length" class="empty-state">
      <p class="empty-text">暂无收藏</p>
      <button class="empty-btn" @click="$router.push('/products')">去逛逛</button>
    </div>

    <div v-else class="grid">
      <div class="card" v-for="p in list" :key="p.id" @click="$router.push(`/products/${p.id}`)">
        <div class="card-img">
          <img v-if="p.coverUrl" :src="p.coverUrl" :alt="p.name" />
          <span v-else>📦</span>
          <button class="fav-btn active" @click.stop="toggleFav(p.id)">❤️</button>
        </div>
        <div class="card-info">
          <div class="card-name">{{ p.name }}</div>
          <div class="card-bottom">
            <span class="card-price">¥{{ p.price }}</span>
            <span class="card-sales">已售 {{ p.sales || 0 }}</span>
          </div>
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
const list = ref([])
const loading = ref(false)

async function fetch() {
  loading.value = true
  try { list.value = await api.getMyFavorites(userStore.userId, userStore.token) || [] }
  catch { list.value = [] }
  finally { loading.value = false }
}

async function toggleFav(productId) {
  try {
    await api.toggleFavorite(productId, userStore.userId, userStore.token)
    fetch()
  } catch (e) { alert(e.message) }
}

onMounted(fetch)
</script>

<style scoped>
.page { max-width: 1200px; margin: 0 auto; padding-bottom: 32px; }
.page-header { margin-bottom: 20px; }
.page-title { font-size: 22px; font-weight: 700; }
.loading-state { text-align: center; padding: 80px; }
.spinner { display: inline-block; width: 32px; height: 32px; border: 3px solid #f0f0f0; border-top-color: #ff2442; border-radius: 50%; animation: spin .8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.empty-state { text-align: center; padding: 80px 0; }
.empty-text { font-size: 15px; color: #999; margin-bottom: 16px; }
.empty-btn { padding: 10px 24px; background: #ff2442; color: #fff; border: none; border-radius: 20px; font-size: 14px; cursor: pointer; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 14px; }
.card { background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,.04); cursor: pointer; transition: transform .2s; }
.card:hover { transform: translateY(-2px); }
.card-img { width: 100%; height: 170px; background: #f9f9f9; display: flex; align-items: center; justify-content: center; position: relative; }
.card-img img { width: 100%; height: 100%; object-fit: cover; }
.card-img span { font-size: 40px; }
.fav-btn { position: absolute; top: 8px; right: 8px; width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,.9); border: none; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.fav-btn.active { background: #fff; box-shadow: 0 2px 6px rgba(255,36,66,.25); }
.card-info { padding: 10px 12px 12px; }
.card-name { font-size: 14px; font-weight: 500; color: #333; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-bottom: 6px; }
.card-bottom { display: flex; justify-content: space-between; align-items: center; }
.card-price { font-size: 17px; font-weight: 700; color: #ff2442; }
.card-sales { font-size: 12px; color: #999; }
</style>
