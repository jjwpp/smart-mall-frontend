<!-- 管理端 - 售后管理 -->
<template>
  <div class="admin-page">
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1677ff" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          售后管理
        </h2>
        <span class="header-subtitle">审核和处理用户的售后申请</span>
      </div>
    </div>

    <div class="filter-card">
      <div class="filter-row">
        <div class="filter-item">
          <span class="filter-label">状态筛选</span>
          <select v-model="searchStatus" @change="search" class="filter-select">
            <option value="">全部状态</option>
            <option value="PENDING_REVIEW">待审核</option>
            <option value="APPROVED">已通过</option>
            <option value="REJECTED">已拒绝</option>
            <option value="COMPLETED">已完成</option>
          </select>
        </div>
        <div class="filter-actions">
          <button class="btn-filter-search" @click="search">查询</button>
          <button class="btn-filter-reset" @click="searchStatus = ''; search()">重置</button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading-card"><div class="loading-spinner"></div><p>加载中...</p></div>

    <div v-else-if="!list.length" class="empty-card">
      <p class="empty-title">暂无售后数据</p>
    </div>

    <div v-else class="table-card">
      <div class="table-container">
        <table class="data-table">
          <thead><tr>
            <th>ID</th><th>售后单号</th><th>订单ID</th><th>用户ID</th><th>类型</th><th>原因</th><th>退款金额</th><th>状态</th><th>申请时间</th><th style="text-align:right">操作</th>
          </tr></thead>
          <tbody>
            <tr v-for="s in list" :key="s.id" class="table-row">
              <td class="col-id">{{ s.id }}</td>
              <td><code class="code">{{ s.afterSaleNo?.slice(-10) }}</code></td>
              <td>{{ s.orderId }}</td>
              <td>{{ s.userId }}</td>
              <td>{{ s.type === 'RETURN_REFUND' ? '退货退款' : '仅退款' }}</td>
              <td>{{ s.reason?.slice(0, 10) }}{{ s.reason?.length > 10 ? '...' : '' }}</td>
              <td class="col-amount">¥{{ s.refundAmount }}</td>
              <td><span :class="['status-tag', statusBadgeClass(s.status)]">{{ statusText(s.status) }}</span></td>
              <td class="col-date">{{ s.createdAt?.slice(0, 16) }}</td>
              <td>
                <div class="action-btns">
                  <button class="btn-link btn-link-detail" @click="showDetail(s)">详情</button>
                  <template v-if="s.status === 'PENDING_REVIEW'">
                    <button class="btn-link btn-link-approve" @click="audit(s.id, 'APPROVED')">通过</button>
                    <button class="btn-link btn-link-reject" @click="openReject(s)">拒绝</button>
                  </template>
                  <button v-if="s.status === 'APPROVED'" class="btn-link btn-link-complete" @click="complete(s.id)">完成</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pagination-bar" v-if="totalPages > 1">
        <button :disabled="pageNum <= 1" @click="pageNum--; fetch()" class="page-btn"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg></button>
        <div class="page-numbers"><button v-for="i in totalPages" :key="i" :class="['page-num', { active: i === pageNum }]" @click="pageNum = i; fetch()">{{ i }}</button></div>
        <button :disabled="pageNum >= totalPages" @click="pageNum++; fetch()" class="page-btn"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg></button>
      </div>
    </div>

    <!-- 详情抽屉 -->
    <div v-if="drawer.show" class="drawer-overlay" @click.self="drawer.show = false">
      <div class="drawer">
        <div class="drawer-head">
          <h3>售后详情 #{{ drawer.data?.id }}</h3>
          <button class="drawer-close" @click="drawer.show = false">&times;</button>
        </div>
        <div class="drawer-body" v-if="drawer.data">
          <div class="drawer-section"><span class="d-label">售后单号</span><span class="d-value">{{ drawer.data.afterSaleNo }}</span></div>
          <div class="drawer-section"><span class="d-label">订单ID</span><span class="d-value">{{ drawer.data.orderId }}</span></div>
          <div class="drawer-section"><span class="d-label">用户ID</span><span class="d-value">{{ drawer.data.userId }}</span></div>
          <div class="drawer-section"><span class="d-label">类型</span><span class="d-value">{{ drawer.data.type === 'RETURN_REFUND' ? '退货退款' : '仅退款' }}</span></div>
          <div class="drawer-section"><span class="d-label">原因</span><span class="d-value">{{ drawer.data.reason || '未填写' }}</span></div>
          <div class="drawer-section" v-if="drawer.data.description"><span class="d-label">问题描述</span><span class="d-value">{{ drawer.data.description }}</span></div>
          <div class="drawer-section" v-if="imageUrls.length"><span class="d-label">凭证图片</span><div class="d-images"><img v-for="(u,i) in imageUrls" :key="i" :src="u" class="d-img" /></div></div>
          <div class="drawer-section"><span class="d-label">退款金额</span><span class="d-value amount">¥{{ drawer.data.refundAmount }}</span></div>
          <div class="drawer-section"><span class="d-label">状态</span><span class="d-value"><span :class="['status-tag', statusBadgeClass(drawer.data.status)]">{{ statusText(drawer.data.status) }}</span></span></div>
          <div class="drawer-section" v-if="drawer.data.rejectReason"><span class="d-label">拒绝原因</span><span class="d-value reject-color">{{ drawer.data.rejectReason }}</span></div>
          <div class="drawer-section"><span class="d-label">申请时间</span><span class="d-value">{{ drawer.data.createdAt?.slice(0, 16) }}</span></div>
        </div>
      </div>
    </div>

    <!-- 拒绝弹窗 -->
    <div v-if="rejectDialog.show" class="dialog-overlay" @click.self="rejectDialog.show = false">
      <div class="dialog">
        <div class="dialog-head"><h4>审核拒绝</h4><button @click="rejectDialog.show = false">&times;</button></div>
        <div class="dialog-body">
          <label class="dialog-label">拒绝原因（必填）</label>
          <textarea v-model="rejectDialog.reason" class="dialog-textarea" rows="3" placeholder="请填写拒绝原因..."></textarea>
        </div>
        <div class="dialog-foot">
          <button class="btn-cancel" @click="rejectDialog.show = false">取消</button>
          <button class="btn-confirm" @click="doReject" :disabled="!rejectDialog.reason.trim()">确认拒绝</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '../../stores/user'
import { api } from '../../utils/api'
import { useToast } from '../../composables/useToast'

const userStore = useUserStore()
const toast = useToast()
const list = ref([])
const loading = ref(false)
const searchStatus = ref('')
const pageNum = ref(1)
const pageSize = ref(10)
const totalPages = ref(0)

const statusMap = { PENDING_REVIEW: '待审核', APPROVED: '已通过', REJECTED: '已拒绝', COMPLETED: '已退款', CANCELLED: '已取消' }
const statusBadgeMap = { PENDING_REVIEW: 'badge-warning', APPROVED: 'badge-success', REJECTED: 'badge-danger', COMPLETED: 'badge-info', CANCELLED: 'badge-gray' }
function statusText(s) { return statusMap[s] || s }
function statusBadgeClass(s) { return statusBadgeMap[s] || 'badge-gray' }

const drawer = ref({ show: false, data: null })
const imageUrls = computed(() => { try { return JSON.parse(drawer.value.data?.imageUrls || '[]') } catch { return [] } })
const rejectDialog = ref({ show: false, id: null, reason: '' })

function showDetail(row) { drawer.value.data = row; drawer.value.show = true }
function openReject(row) { rejectDialog.value = { show: true, id: row.id, reason: '' } }

async function fetch() {
  loading.value = true
  try {
    const params = { pageNum: pageNum.value, pageSize: pageSize.value }
    if (searchStatus.value) params.status = searchStatus.value
    const data = await api.getAdminAfterSales(params, userStore.token)
    list.value = data?.records || []
    totalPages.value = data?.pages || Math.ceil((data?.total || 0) / pageSize.value)
  } catch { list.value = [] }
  finally { loading.value = false }
}

function search() { pageNum.value = 1; fetch() }

async function audit(id, status) {
  try {
    await api.auditAfterSale(id, { status, reviewedBy: userStore.userId }, userStore.token)
    toast.success('审核完成')
    fetch()
  } catch (e) { toast.error(e.message) }
}

async function doReject() {
  if (!rejectDialog.value.reason.trim()) return
  try {
    await api.auditAfterSale(rejectDialog.value.id, { status: 'REJECTED', rejectReason: rejectDialog.value.reason, reviewedBy: userStore.userId }, userStore.token)
    toast.success('已拒绝')
    rejectDialog.value.show = false
    fetch()
  } catch (e) { toast.error(e.message) }
}

async function complete(id) {
  if (!confirm('确认完成该售后订单？')) return
  try {
    await api.completeAfterSale(id, userStore.token)
    toast.success('售后已完成')
    fetch()
  } catch (e) { toast.error(e.message) }
}

onMounted(fetch)
</script>

<style scoped>
.admin-page { --primary: #1677ff; --primary-light: #e6f4ff; --success: #52c41a; --warning: #faad14; --danger: #ff4d4f; --page-bg: #f5f7fa; --card-bg: #fff; --text-main: #1f1f1f; --text-secondary: #666; --text-muted: #999; --border: #f0f0f0; max-width: 1400px; }
.page-header { display: flex; justify-content: space-between; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #f0f0f0; }
.header-left { display: flex; flex-direction: column; gap: 4px; }
.page-title { font-size: 20px; font-weight: 700; display: flex; align-items: center; gap: 10px; margin: 0; }
.header-subtitle { font-size: 13px; color: var(--text-muted); margin-left: 34px; }
.filter-card { background: #fff; border-radius: 8px; padding: 16px 20px; margin-bottom: 16px; border: 1px solid var(--border); }
.filter-row { display: flex; align-items: center; gap: 16px; }
.filter-item { display: flex; align-items: center; gap: 10px; }
.filter-label { font-size: 13px; color: var(--text-secondary); font-weight: 500; white-space: nowrap; }
.filter-select { padding: 7px 32px 7px 12px; border: 1px solid #d9d9d9; border-radius: 6px; font-size: 13px; outline: none; appearance: none; background: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23999' stroke-width='1.5'/%3E%3C/svg%3E") no-repeat right 10px center; min-width: 150px; }
.filter-actions { display: flex; gap: 8px; margin-left: auto; }
.btn-filter-search, .btn-filter-reset { padding: 7px 16px; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer; border: none; }
.btn-filter-search { background: var(--primary); color: #fff; }
.btn-filter-reset { background: #fff; color: var(--text-secondary); border: 1px solid #d9d9d9; }
.loading-card, .empty-card { background: #fff; border-radius: 8px; padding: 80px; text-align: center; border: 1px solid var(--border); color: var(--text-muted); }
.loading-spinner { width: 36px; height: 36px; border: 3px solid #f0f0f0; border-top-color: var(--primary); border-radius: 50%; margin: 0 auto 14px; animation: spin .8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.table-card { background: #fff; border-radius: 8px; border: 1px solid var(--border); overflow: hidden; }
.table-container { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.data-table thead th { padding: 12px 16px; text-align: left; font-weight: 600; color: var(--text-secondary); font-size: 13px; background: #fafafa; border-bottom: 1px solid var(--border); white-space: nowrap; }
.data-table tbody td { padding: 13px 16px; border-bottom: 1px solid #f5f5f5; }
.data-table tbody tr:nth-child(even) td { background: #fafafa; }
.data-table tbody tr:hover td { background: #e6f4ff; }
.col-id { color: var(--text-muted); font-family: monospace; font-size: 13px; }
.col-amount { color: var(--danger); font-weight: 700; }
.col-date { color: var(--text-muted); font-size: 13px; white-space: nowrap; }
.code { background: #f5f5f5; padding: 2px 8px; border-radius: 4px; font-family: monospace; font-size: 12px; color: var(--text-secondary); }
.status-tag { display: inline-flex; align-items: center; padding: 2px 10px; border-radius: 4px; font-size: 12px; font-weight: 500; }
.badge-warning { background: #fffbe6; color: #d48806; }
.badge-success { background: #f6ffed; color: #389e0d; }
.badge-danger { background: #fff2f0; color: #cf1322; }
.badge-info { background: #e6f4ff; color: #0958d9; }
.badge-gray { background: #f5f5f5; color: #999; }
.action-btns { display: flex; gap: 8px; justify-content: flex-end; }
.btn-link { background: none; border: none; font-size: 13px; cursor: pointer; font-weight: 500; padding: 0; }
.btn-link-detail, .btn-link-complete { color: var(--primary); }
.btn-link-approve { color: var(--success); }
.btn-link-reject { color: var(--danger); }
.pagination-bar { display: flex; align-items: center; justify-content: flex-end; gap: 8px; padding: 14px 20px; border-top: 1px solid var(--border); }
.page-btn { width: 32px; height: 32px; border: 1px solid #d9d9d9; border-radius: 6px; background: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.page-btn:disabled { opacity: .4; cursor: not-allowed; }
.page-numbers { display: flex; gap: 4px; }
.page-num { min-width: 32px; height: 32px; border: 1px solid #d9d9d9; border-radius: 6px; background: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 500; padding: 0 8px; }
.page-num.active { background: var(--primary); color: #fff; border-color: var(--primary); }
.drawer-overlay, .dialog-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.4); z-index: 100; display: flex; justify-content: flex-end; }
.drawer { width: 420px; background: #fff; height: 100%; overflow-y: auto; animation: slideIn .25s ease; }
@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
.drawer-head { display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 1px solid #f0f0f0; }
.drawer-head h3 { margin: 0; font-size: 18px; font-weight: 700; }
.drawer-close { background: none; border: none; font-size: 24px; cursor: pointer; color: #999; }
.drawer-body { padding: 16px 20px; }
.drawer-section { padding: 10px 0; border-bottom: 1px solid #f5f5f5; }
.d-label { font-size: 13px; color: #999; display: block; margin-bottom: 4px; }
.d-value { font-size: 15px; color: var(--text-main); }
.d-value.amount { color: var(--danger); font-weight: 700; font-size: 18px; }
.reject-color { color: var(--danger); }
.d-images { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 6px; }
.d-img { width: 80px; height: 80px; border-radius: 6px; object-fit: cover; }
.dialog-overlay { align-items: center; justify-content: center; }
.dialog { background: #fff; border-radius: 12px; width: 420px; max-width: 90vw; animation: fadeIn .2s ease; }
@keyframes fadeIn { from { opacity: 0; transform: scale(.95); } to { opacity: 1; transform: scale(1); } }
.dialog-head { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid #f0f0f0; }
.dialog-head h4 { margin: 0; font-size: 16px; font-weight: 600; }
.dialog-body { padding: 16px 20px; }
.dialog-label { font-size: 14px; font-weight: 500; color: var(--text-main); margin-bottom: 8px; display: block; }
.dialog-textarea { width: 100%; padding: 10px 12px; border: 1px solid #d9d9d9; border-radius: 8px; font-size: 14px; resize: vertical; outline: none; font-family: inherit; }
.dialog-textarea:focus { border-color: var(--primary); }
.dialog-foot { display: flex; gap: 8px; justify-content: flex-end; padding: 16px 20px; border-top: 1px solid #f0f0f0; }
.btn-cancel, .btn-confirm { padding: 8px 20px; border-radius: 6px; font-size: 14px; cursor: pointer; font-weight: 500; }
.btn-cancel { background: #fff; border: 1px solid #d9d9d9; color: var(--text-secondary); }
.btn-confirm { background: var(--danger); border: none; color: #fff; }
.btn-confirm:disabled { opacity: .5; cursor: not-allowed; }
</style>
