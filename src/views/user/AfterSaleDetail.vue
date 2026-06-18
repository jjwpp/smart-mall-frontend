<!-- 售后详情页 -->
<template>
  <div class="page">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <h2 class="page-title">售后详情</h2>
    </div>

    <div v-if="loading" class="loading-state"><span class="spinner"></span></div>

    <div v-else-if="detail" class="content">
      <div class="section">
        <div class="section-head">
          <span class="label">售后单号</span>
          <span :class="['status-tag', statusBadgeClass(detail.status)]">{{ statusText(detail.status) }}</span>
        </div>
        <span class="value mono">{{ detail.afterSaleNo }}</span>
      </div>

      <div class="section" v-if="detail.orderId">
        <span class="label">关联订单</span>
        <span class="value mono">{{ detail.orderId }}</span>
      </div>

      <div class="section">
        <span class="label">售后类型</span>
        <span class="value">{{ detail.type === 'RETURN_REFUND' ? '退货退款' : '仅退款' }}</span>
      </div>

      <div class="section">
        <span class="label">申请原因</span>
        <span class="value">{{ detail.reason || '未填写' }}</span>
      </div>

      <div class="section" v-if="detail.description">
        <span class="label">问题描述</span>
        <span class="value">{{ detail.description }}</span>
      </div>

      <div class="section" v-if="imageUrls.length">
        <span class="label">凭证图片</span>
        <div class="images">
          <img v-for="(u, i) in imageUrls" :key="i" :src="u" class="proof-img" @click="previewImg = u" />
        </div>
      </div>

      <div class="section" v-if="detail.refundAmount">
        <span class="label">退款金额</span>
        <span class="value amount">¥{{ detail.refundAmount }}</span>
      </div>

      <div class="section">
        <span class="label">申请时间</span>
        <span class="value">{{ detail.createdAt?.slice(0, 16) }}</span>
      </div>

      <!-- 审核结果 -->
      <div class="section result-section" v-if="detail.status === 'REJECTED'">
        <div class="result-header">
          <span class="result-icon reject-icon">✕</span>
          <span class="result-title reject-color">审核拒绝</span>
        </div>
        <div class="result-body" v-if="detail.rejectReason">
          <span class="label">拒绝原因</span>
          <span class="value">{{ detail.rejectReason }}</span>
        </div>
      </div>

      <div class="section result-section" v-if="detail.status === 'APPROVED' || detail.status === 'COMPLETED'">
        <div class="result-header">
          <span class="result-icon approve-icon">✓</span>
          <span class="result-title approve-color">{{ detail.status === 'COMPLETED' ? '售后完成' : '审核通过' }}</span>
        </div>
      </div>

      <button v-if="detail.status === 'PENDING_REVIEW'" class="cancel-btn" @click="handleCancel">取消申请</button>
    </div>

    <!-- 图片预览 -->
    <div v-if="previewImg" class="preview-overlay" @click="previewImg = null">
      <img :src="previewImg" class="preview-full" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '../../stores/user'
import { api } from '../../utils/api'

const route = useRoute()
const userStore = useUserStore()
const detail = ref(null)
const loading = ref(false)
const previewImg = ref(null)

const imageUrls = computed(() => {
  try { return JSON.parse(detail.value?.imageUrls || '[]') } catch { return [] }
})

const statusMap = { PENDING_REVIEW: '待审核', APPROVED: '已通过', REJECTED: '已拒绝', COMPLETED: '已完成', CANCELLED: '已取消' }
const statusBadgeMap = { PENDING_REVIEW: 'badge-warning', APPROVED: 'badge-success', REJECTED: 'badge-danger', COMPLETED: 'badge-info', CANCELLED: 'badge-gray' }
function statusText(s) { return statusMap[s] || s }
function statusBadgeClass(s) { return statusBadgeMap[s] || 'badge-gray' }

async function fetch() {
  loading.value = true
  try { detail.value = await api.getAfterSaleDetail(route.params.id, userStore.token) }
  catch { detail.value = null }
  finally { loading.value = false }
}

async function handleCancel() {
  if (!confirm('确定要取消该售后申请吗？')) return
  try {
    await api.cancelAfterSale(detail.value.id, userStore.userId, userStore.token)
    alert('已取消')
    fetch()
  } catch (e) { alert(e.message) }
}

onMounted(fetch)
</script>

<style scoped>
.page { max-width: 640px; margin: 0 auto; padding-bottom: 32px; }
.page-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
.back-btn { width: 36px; height: 36px; border: none; background: #f5f5f5; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.page-title { font-size: 20px; font-weight: 700; }
.loading-state { text-align: center; padding: 80px; }
.spinner { display: inline-block; width: 32px; height: 32px; border: 3px solid #f0f0f0; border-top-color: #ff2442; border-radius: 50%; animation: spin .8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.content { display: flex; flex-direction: column; gap: 0; }
.section { background: #fff; padding: 14px 16px; border-bottom: 1px solid #f5f5f5; display: flex; flex-direction: column; gap: 4px; }
.section:first-of-type { border-radius: 12px 12px 0 0; }
.section:last-of-type { border-radius: 0 0 12px 12px; border-bottom: none; margin-bottom: 12px; }
.section-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
.label { font-size: 13px; color: #999; }
.value { font-size: 15px; color: #1a1a1a; }
.mono { font-family: 'SF Mono', 'Consolas', monospace; font-size: 13px; }
.amount { color: #ff2442; font-weight: 700; font-size: 18px; }
.status-tag { padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; }
.badge-warning { background: #fff7e6; color: #faad14; }
.badge-success { background: #e6fae9; color: #07c160; }
.badge-danger { background: #fff2f0; color: #ff4d4f; }
.badge-info { background: #e6f4ff; color: #1677ff; }
.badge-gray { background: #f5f5f5; color: #999; }
.images { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 6px; }
.proof-img { width: 80px; height: 80px; border-radius: 8px; object-fit: cover; cursor: pointer; }
.result-section { background: #fff8f8; border-left: 3px solid #ff4d4f; }
.result-section:has(.approve-color) { background: #f6ffed; border-left-color: #07c160; }
.result-header { display: flex; align-items: center; gap: 8px; }
.result-icon { width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; }
.reject-icon { background: #ff4d4f; color: #fff; }
.approve-icon { background: #07c160; color: #fff; }
.result-title { font-size: 16px; font-weight: 600; }
.reject-color { color: #ff4d4f; }
.approve-color { color: #07c160; }
.result-body { margin-top: 8px; }
.cancel-btn { padding: 14px; background: #fff; color: #ff4d4f; border: 1px solid #ff4d4f; border-radius: 10px; font-size: 15px; cursor: pointer; font-family: inherit; margin-top: 12px; }
.preview-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.8); display: flex; align-items: center; justify-content: center; z-index: 999; }
.preview-full { max-width: 90vw; max-height: 90vh; border-radius: 8px; }
</style>
