<!-- ==================== 领券中心 ==================== -->
<template>
  <div>
    <h2 class="mb-20">🎫 领券中心</h2>
    <div v-if="loading" class="loading-text">加载中...</div>
    <div v-else-if="!list.length" class="empty-state">
      <div class="icon">🎫</div><p>暂无可领取的优惠券</p>
    </div>
    <div v-else class="coupon-grid">
      <div v-for="c in list" :key="c.id" class="coupon-card" :class="{ disabled: c.receiveNum >= c.totalNum }">
        <div class="coupon-left">
          <div class="coupon-amount">
            <span class="symbol">¥</span>
            <span class="num">{{ c.amount }}</span>
          </div>
          <div class="coupon-condition">满{{ c.conditionAmount }}可用</div>
        </div>
        <div class="coupon-right">
          <div class="coupon-name">{{ c.couponName }}</div>
          <div class="coupon-meta">有效期至 {{ c.expireTime?.slice(0, 10) }}</div>
          <div class="coupon-stock">已领 {{ c.receiveNum }}/{{ c.totalNum }}</div>
          <button
            class="btn-receive"
            :disabled="c.receiveNum >= c.totalNum || receiving[c.id]"
            @click="handleReceive(c)"
          >
            {{ receiving[c.id] ? '领取中...' : (c.receiveNum >= c.totalNum ? '已抢光' : '立即领取') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useUserStore } from '../../stores/user'
import { useToast } from '../../composables/useToast'
import { api } from '../../utils/api'

const userStore = useUserStore()
const toast = useToast()
const list = ref([])
const loading = ref(false)
const receiving = reactive({})

async function fetch() {
  if (!userStore.userId) return
  loading.value = true
  try {
    list.value = await api.getAvailableCoupons(userStore.userId) || []
  } catch { list.value = [] }
  finally { loading.value = false }
}

async function handleReceive(c) {
  receiving[c.id] = true
  try {
    await api.receiveCoupon(userStore.userId, c.id, userStore.token)
    toast.success('领取成功！')
    c.receiveNum++
  } catch (e) { toast.error(e.message) }
  finally { receiving[c.id] = false }
}

onMounted(fetch)
</script>

<style scoped>
.coupon-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 16px; }
.coupon-card { display: flex; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.06); transition: transform 0.2s; }
.coupon-card:hover { transform: translateY(-2px); }
.coupon-card.disabled { opacity: 0.6; }
.coupon-left {
  width: 120px; display: flex; flex-direction: column; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: #fff; padding: 20px 12px;
}
.coupon-amount { display: flex; align-items: baseline; }
.symbol { font-size: 18px; font-weight: 600; }
.num { font-size: 36px; font-weight: 800; }
.coupon-condition { font-size: 12px; margin-top: 4px; opacity: 0.9; }
.coupon-right { flex: 1; padding: 16px 20px; display: flex; flex-direction: column; justify-content: space-between; background: #fff; }
.coupon-name { font-size: 16px; font-weight: 700; color: #333; }
.coupon-meta { font-size: 12px; color: #999; margin-top: 4px; }
.coupon-stock { font-size: 12px; color: #999; }
.btn-receive {
  align-self: flex-end; padding: 6px 20px; border: none; border-radius: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff; font-weight: 600; cursor: pointer; font-size: 13px;
}
.btn-receive:disabled { background: #ccc; cursor: not-allowed; }
</style>
