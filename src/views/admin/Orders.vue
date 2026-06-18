<!-- ==================== 管理端 - 订单管理 ==================== -->
<template>
  <div class="admin-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1677ff" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          订单管理
        </h2>
        <span class="header-subtitle">查看和管理所有订单，跟踪订单状态</span>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="filter-card">
      <div class="filter-row">
        <div class="filter-item">
          <span class="filter-label">状态筛选</span>
          <select v-model="searchStatus" @change="search" class="filter-select">
            <option value="">全部状态</option>
            <option value="PENDING_PAYMENT">待付款</option>
            <option value="PAID">已付款</option>
            <option value="SHIPPED">已发货</option>
            <option value="COMPLETED">已完成</option>
            <option value="REFUNDED">已退款</option>
            <option value="CANCELLED">已取消</option>
          </select>
        </div>
        <div class="filter-actions">
          <button class="btn-filter-search" @click="search">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            查询
          </button>
          <button class="btn-filter-reset" @click="searchStatus = ''; search()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
            重置
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-card">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="!list.length" class="empty-card">
      <div class="empty-illustration">
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          <rect x="12" y="8" width="56" height="64" rx="8" stroke="#d1d5db" stroke-width="2" fill="#f9fafb"/>
          <line x1="22" y1="24" x2="58" y2="24" stroke="#e5e7eb" stroke-width="2" stroke-linecap="round"/>
          <line x1="22" y1="34" x2="50" y2="34" stroke="#e5e7eb" stroke-width="2" stroke-linecap="round"/>
          <line x1="22" y1="44" x2="54" y2="44" stroke="#e5e7eb" stroke-width="2" stroke-linecap="round"/>
          <line x1="22" y1="54" x2="40" y2="54" stroke="#e5e7eb" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
      <p class="empty-title">暂无订单数据</p>
      <p class="empty-desc">订单数据将会在这里显示</p>
    </div>

    <!-- Data Table -->
    <div v-else class="table-card">
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th class="th-id">ID</th>
              <th>订单号</th>
              <th>用户ID</th>
              <th>地址ID</th>
              <th>总金额</th>
              <th>应付金额</th>
              <th>状态</th>
              <th>创建时间</th>
              <th class="th-actions">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="o in list" :key="o.id" class="table-row">
              <td class="col-id">{{ o.id }}</td>
              <td><code class="order-no-code">{{ o.orderNo?.slice(-8) }}</code></td>
              <td>{{ o.userId }}</td>
              <td>{{ o.addressId }}</td>
              <td class="col-amount">¥{{ o.totalAmount }}</td>
              <td class="col-pay-amount">¥{{ o.payAmount }}</td>
              <td>
                <span class="status-tag" :class="statusBadgeClass(o.status)">
                  <span class="status-dot"></span>
                  {{ statusText(o.status) }}
                </span>
              </td>
              <td class="col-date">{{ o.createdAt?.slice(0, 16) }}</td>
              <td>
                <div class="action-btns">
                  <button
                    v-if="o.status === 'PAID'"
                    class="btn-link btn-link-ship"
                    @click="updateStatus(o.id, 'SHIPPED')"
                  >发货</button>
                  <button
                    v-if="o.status === 'SHIPPED'"
                    class="btn-link btn-link-complete"
                    @click="updateStatus(o.id, 'COMPLETED')"
                  >完成</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="pagination-bar" v-if="totalPages > 1">
        <button :disabled="pageNum <= 1" @click="pageNum--; fetch()" class="page-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div class="page-numbers">
          <button
            v-for="i in totalPages"
            :key="i"
            :class="['page-num', { active: i === pageNum }]"
            @click="pageNum = i; fetch()"
          >{{ i }}</button>
        </div>
        <button :disabled="pageNum >= totalPages" @click="pageNum++; fetch()" class="page-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '../../stores/user'
import { useToast } from '../../composables/useToast'
import { api } from '../../utils/api'

const userStore = useUserStore()
const toast = useToast()
const list = ref([])
const loading = ref(false)
const searchStatus = ref('')
const pageNum = ref(1)
const pageSize = ref(10)
const totalPages = ref(0)

const statusMap = { PENDING_PAYMENT: '待付款', PAID: '已付款', SHIPPED: '已发货', COMPLETED: '已完成', CANCELLED: '已取消', REFUNDED: '已退款' }
const statusClassMap = {
  PENDING_PAYMENT: 'tag tag-warning', PAID: 'tag tag-info', SHIPPED: 'tag tag-primary',
  COMPLETED: 'tag tag-success', CANCELLED: 'tag tag-danger', REFUNDED: 'tag tag-refunded'
}
function statusText(s) { return statusMap[s] || s }
function statusClass(s) { return statusClassMap[s] || 'tag tag-info' }

function statusBadgeClass(s) {
  const m = {
    PENDING_PAYMENT: 'tag-warning',
    PAID: 'tag-info',
    SHIPPED: 'tag-processing',
    COMPLETED: 'tag-success',
    CANCELLED: 'tag-danger',
    REFUNDED: 'tag-refunded'
  }
  return m[s] || 'tag-info'
}

async function fetch() {
  loading.value = true
  try {
    const params = { pageNum: pageNum.value, pageSize: pageSize.value }
    if (searchStatus.value) params.status = searchStatus.value
    const data = await api.getAdminOrders(params, userStore.token)
    list.value = data?.records || []
    totalPages.value = data?.pages || Math.ceil((data?.total || 0) / pageSize.value)
  } catch { list.value = [] }
  finally { loading.value = false }
}

function search() { pageNum.value = 1; fetch() }

async function updateStatus(id, status) {
  try {
    await api.updateOrderStatus(id, status, userStore.token)
    toast.success(`订单状态已更新为「${statusText(status)}」`)
    fetch()
  } catch (e) { toast.error(e.message) }
}

onMounted(fetch)
</script>

<style scoped>
/* ==================== Design Tokens ==================== */
.admin-page {
  --primary: #1677ff;
  --primary-light: #e6f4ff;
  --primary-dark: #0958d9;
  --success: #52c41a;
  --warning: #faad14;
  --danger: #ff4d4f;
  --processing: #1677ff;
  --page-bg: #f5f7fa;
  --card-bg: #ffffff;
  --text-main: #1f1f1f;
  --text-secondary: #666;
  --text-muted: #999;
  --border: #f0f0f0;
  --card-shadow: 0 1px 2px rgba(0,0,0,0.03), 0 1px 6px -1px rgba(0,0,0,0.02);
  --card-radius: 8px;
  max-width: 1400px;
}

/* ==================== Page Header ==================== */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.page-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-main);
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  letter-spacing: -0.3px;
}

.header-subtitle {
  font-size: 13px;
  color: var(--text-muted);
  margin-left: 34px;
}

/* ==================== Filter Card ==================== */
.filter-card {
  background: var(--card-bg);
  border-radius: var(--card-radius);
  padding: 16px 20px;
  margin-bottom: 16px;
  box-shadow: var(--card-shadow);
  border: 1px solid var(--border);
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-label {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
  white-space: nowrap;
}

.filter-select {
  padding: 7px 32px 7px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 13px;
  color: var(--text-main);
  background: #fff;
  outline: none;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23999' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  min-width: 150px;
}

.filter-select:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.1);
}

.filter-actions {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

.btn-filter-search {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 7px 16px;
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-filter-search:hover {
  background: var(--primary-dark);
}

.btn-filter-reset {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 7px 16px;
  background: #fff;
  color: var(--text-secondary);
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-filter-reset:hover {
  border-color: var(--primary);
  color: var(--primary);
}

/* ==================== Loading ==================== */
.loading-card {
  background: var(--card-bg);
  border-radius: var(--card-radius);
  padding: 80px 24px;
  text-align: center;
  color: var(--text-muted);
  font-size: 14px;
  box-shadow: var(--card-shadow);
  border: 1px solid var(--border);
}

.loading-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #f0f0f0;
  border-top-color: var(--primary);
  border-radius: 50%;
  margin: 0 auto 14px;
  animation: spin 0.8s linear infinite;
}

/* ==================== Empty State ==================== */
.empty-card {
  background: var(--card-bg);
  border-radius: var(--card-radius);
  padding: 80px 24px;
  text-align: center;
  box-shadow: var(--card-shadow);
  border: 1px solid var(--border);
}

.empty-illustration {
  margin-bottom: 18px;
  display: flex;
  justify-content: center;
}

.empty-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-main);
  margin: 0 0 6px 0;
}

.empty-desc {
  font-size: 13px;
  color: var(--text-muted);
  margin: 0;
}

/* ==================== Table Card ==================== */
.table-card {
  background: var(--card-bg);
  border-radius: var(--card-radius);
  box-shadow: var(--card-shadow);
  border: 1px solid var(--border);
  overflow: hidden;
}

.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.data-table thead th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 13px;
  background: #fafafa;
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}

.data-table tbody td {
  padding: 13px 16px;
  color: var(--text-main);
  border-bottom: 1px solid #f5f5f5;
  vertical-align: middle;
}

.data-table tbody tr.table-row:nth-child(even) td {
  background: #fafafa;
}

.data-table tbody tr.table-row:hover td {
  background: #e6f4ff;
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

.th-id, .col-id {
  color: var(--text-muted) !important;
  font-size: 13px !important;
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
}

.th-actions {
  text-align: right;
  width: 120px;
}

.col-amount {
  color: var(--text-main);
  font-weight: 500;
}

.col-pay-amount {
  color: var(--danger);
  font-weight: 700;
  font-size: 14px;
}

.col-date {
  color: var(--text-muted);
  font-size: 13px;
  white-space: nowrap;
}

.order-no-code {
  background: #f5f5f5;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  color: var(--text-secondary);
  border: 1px solid #f0f0f0;
}

/* ==================== Status Tags ==================== */
.status-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.tag-warning {
  background: #fffbe6;
  color: #d48806;
  border: 1px solid #ffe58f;
}
.tag-warning .status-dot { background: #faad14; }

.tag-info {
  background: #e6f4ff;
  color: #0958d9;
  border: 1px solid #91caff;
}
.tag-info .status-dot { background: #1677ff; }

.tag-processing {
  background: #f9f0ff;
  color: #722ed1;
  border: 1px solid #d3adf7;
}
.tag-processing .status-dot { background: #722ed1; }

.tag-success {
  background: #f6ffed;
  color: #389e0d;
  border: 1px solid #b7eb8f;
}
.tag-success .status-dot { background: #52c41a; }

.tag-danger {
  background: #fff2f0;
  color: #cf1322;
  border: 1px solid #ffccc7;
}
.tag-danger .status-dot { background: #ff4d4f; }

.tag-refunded {
  background: #fff7e6;
  color: #d46b08;
  border: 1px solid #ffd591;
}
.tag-refunded .status-dot { background: #fa8c16; }

/* ==================== Action Buttons ==================== */
.action-btns {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: flex-end;
}

.btn-link {
  padding: 0;
  background: none;
  border: none;
  font-size: 13px;
  cursor: pointer;
  transition: color 0.2s;
  font-weight: 500;
}

.btn-link-ship {
  color: var(--primary);
}
.btn-link-ship:hover {
  color: var(--primary-dark);
}

.btn-link-complete {
  color: var(--success);
}
.btn-link-complete:hover {
  color: #389e0d;
}

/* ==================== Pagination ==================== */
.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 14px 20px;
  border-top: 1px solid var(--border);
}

.page-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background: #fff;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  border-color: var(--primary);
  color: var(--primary);
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 4px;
}

.page-num {
  min-width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background: #fff;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0 8px;
}

.page-num:hover:not(.active) {
  border-color: var(--primary);
  color: var(--primary);
}

.page-num.active {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
}

/* ==================== Animations ==================== */
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
