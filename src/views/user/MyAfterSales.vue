<!-- 我的售后列表 -->
<template>
  <div class="page">
    <div class="page-header"><h2 class="page-title">我的售后</h2></div>

    <div v-if="loading" class="loading-state"><span class="spinner"></span><p>加载中...</p></div>

    <div v-else-if="!list.length" class="empty-state">
      <p class="empty-text">暂无售后记录</p>
    </div>

    <div v-else class="list">
      <div v-for="s in list" :key="s.id" class="card" @click="$router.push(`/after-sales/${s.id}`)">
        <div class="card-head">
          <span class="refund-no">{{ s.afterSaleNo }}</span>
          <span :class="['status-tag', statusBadgeClass(s.status)]">{{ statusText(s.status) }}</span>
        </div>
        <div class="card-body">
          <span class="reason">{{ s.reason || '未填写原因' }}</span>
        </div>
        <div class="card-foot">
          <span class="time">{{ s.createdAt?.slice(0, 16) }}</span>
          <span class="amount" v-if="s.refundAmount">退款 ¥{{ s.refundAmount }}</span>
        </div>
      </div>
    </div>

    <div class="pagination-wrap" v-if="totalPages > 1">
      <button :disabled="pageNum <= 1" @click="pageNum--; fetch()" class="page-btn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <template v-for="i in totalPages" :key="i">
        <button :class="['page-btn', { active: i === pageNum }]" @click="pageNum = i; fetch()" v-if="i === 1 || i === totalPages || Math.abs(i - pageNum) <= 1">{{ i }}</button>
        <span v-else-if="i === 2 || i === totalPages - 1" class="page-dots">...</span>
      </template>
      <button :disabled="pageNum >= totalPages" @click="pageNum++; fetch()" class="page-btn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
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
const pageNum = ref(1)
const pageSize = ref(10)
const totalPages = ref(0)

const statusMap = { PENDING_REVIEW: '待审核', APPROVED: '已通过', REJECTED: '已拒绝', COMPLETED: '已退款', CANCELLED: '已取消' }
const statusBadgeMap = { PENDING_REVIEW: 'badge-warning', APPROVED: 'badge-success', REJECTED: 'badge-danger', COMPLETED: 'badge-info', CANCELLED: 'badge-gray' }
function statusText(s) { return statusMap[s] || s }
function statusBadgeClass(s) { return statusBadgeMap[s] || 'badge-gray' }

async function fetch() {
  loading.value = true
  try {
    const data = await api.getMyAfterSales({ userId: userStore.userId, pageNum: pageNum.value, pageSize: pageSize.value }, userStore.token)
    list.value = data?.records || []
    totalPages.value = data?.pages || Math.ceil((data?.total || 0) / pageSize.value)
  } catch { list.value = [] }
  finally { loading.value = false }
}

onMounted(fetch)
</script>

<style scoped>
.page { max-width: 640px; margin: 0 auto; padding-bottom: 32px; }
.page-header { margin-bottom: 16px; }
.page-title { font-size: 22px; font-weight: 700; color: #1a1a1a; }
.loading-state { text-align: center; padding: 80px 0; color: #999; }
.spinner { display: inline-block; width: 32px; height: 32px; border: 3px solid #f0f0f0; border-top-color: #ff2442; border-radius: 50%; animation: spin .8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.empty-state { text-align: center; padding: 80px 0; color: #999; }
.empty-text { font-size: 14px; }
.list { display: flex; flex-direction: column; gap: 12px; }
.card { background: #fff; border-radius: 12px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,.04); cursor: pointer; transition: box-shadow .2s; }
.card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.08); }
.card-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.refund-no { font-size: 13px; color: #666; }
.card-body { margin-bottom: 8px; }
.reason { font-size: 14px; color: #333; }
.card-foot { display: flex; justify-content: space-between; align-items: center; }
.time { font-size: 12px; color: #999; }
.amount { font-size: 14px; font-weight: 700; color: #ff2442; }
.status-tag { padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; }
.badge-warning { background: #fff7e6; color: #faad14; }
.badge-success { background: #e6fae9; color: #07c160; }
.badge-danger { background: #fff2f0; color: #ff4d4f; }
.badge-info { background: #e6f4ff; color: #1677ff; }
.badge-gray { background: #f5f5f5; color: #999; }
.pagination-wrap { display: flex; justify-content: center; align-items: center; gap: 6px; margin-top: 24px; }
.page-btn { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border: 1px solid #e0e0e0; border-radius: 8px; background: #fff; color: #666; font-size: 13px; cursor: pointer; }
.page-btn:hover:not(:disabled) { border-color: #ff2442; color: #ff2442; }
.page-btn.active { background: #ff2442; color: #fff; border-color: #ff2442; }
.page-btn:disabled { opacity: .35; cursor: not-allowed; }
.page-dots { width: 36px; text-align: center; color: #ccc; }
</style>
