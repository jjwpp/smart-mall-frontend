<!-- ==================== 我的优惠券 ==================== -->
<template>
  <div>
    <h2 class="mb-20">🎫 我的优惠券</h2>
    <div v-if="loading" class="loading-text">加载中...</div>
    <div v-else-if="!list.length" class="empty-state">
      <div class="icon">🎫</div><p>暂无优惠券</p>
      <router-link to="/coupons" class="btn-primary" style="display:inline-block;margin-top:12px">去领券中心</router-link>
    </div>
    <div v-else class="coupon-list">
      <div v-for="c in list" :key="c.id" class="coupon-item" :class="{ used: c.status !== 0 }">
        <div class="c-left">
          <div class="c-amount">¥{{ c.amount }}</div>
          <div class="c-condition">满{{ c.conditionAmount }}可用</div>
        </div>
        <div class="c-mid">
          <div class="c-name">{{ c.couponName }}</div>
          <div class="c-time">有效期至 {{ c.expireTime?.slice(0, 10) }}</div>
        </div>
        <div class="c-right">
          <span v-if="c.status === 0" class="tag tag-success">可使用</span>
          <span v-else-if="c.status === 1" class="tag tag-danger">已使用</span>
          <span v-else class="tag tag-default">已过期</span>
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
  if (!userStore.userId) return
  loading.value = true
  try { list.value = await api.getMyCoupons(userStore.userId, userStore.token) || [] }
  catch { list.value = [] }
  finally { loading.value = false }
}

onMounted(fetch)
</script>

<style scoped>
.coupon-list { display: flex; flex-direction: column; gap: 12px; }
.coupon-item { display: flex; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.coupon-item.used { opacity: 0.55; }
.c-left { width: 100px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: #fff; padding: 16px; }
.c-amount { font-size: 28px; font-weight: 800; }
.c-condition { font-size: 11px; opacity: 0.9; }
.c-mid { flex: 1; padding: 16px; display: flex; flex-direction: column; justify-content: center; background: #fff; }
.c-name { font-size: 15px; font-weight: 600; }
.c-time { font-size: 12px; color: #999; margin-top: 4px; }
.c-right { display: flex; align-items: center; padding: 16px; background: #fff; }
.tag-default { background: #eee; color: #999; }
</style>
