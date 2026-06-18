<!-- ==================== 管理端 - 支付管理 ==================== -->
<template>
  <div class="admin-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1677ff" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
          支付管理
        </h2>
        <span class="header-subtitle">查看所有支付记录与流水</span>
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
          <rect x="8" y="16" width="64" height="48" rx="8" stroke="#d1d5db" stroke-width="2" fill="#f9fafb"/>
          <line x1="8" y1="32" x2="72" y2="32" stroke="#d1d5db" stroke-width="1.5"/>
          <circle cx="60" cy="50" r="6" stroke="#d1d5db" stroke-width="1.5" fill="#f9fafb"/>
          <rect x="14" y="40" width="30" height="6" rx="3" stroke="#d1d5db" stroke-width="1" fill="#f9fafb"/>
          <rect x="14" y="50" width="20" height="6" rx="3" stroke="#d1d5db" stroke-width="1" fill="#f9fafb"/>
        </svg>
      </div>
      <p class="empty-title">暂无支付记录</p>
      <p class="empty-desc">支付流水将在此页面展示</p>
    </div>

    <!-- Data Table -->
    <div v-else class="table-card">
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th class="th-id">ID</th>
              <th>支付流水号</th>
              <th>订单ID</th>
              <th>渠道</th>
              <th>金额</th>
              <th>状态</th>
              <th>支付时间</th>
              <th>创建时间</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in list" :key="p.id" class="table-row">
              <td class="col-id">{{ p.id }}</td>
              <td><code class="payment-no">{{ p.paymentNo?.slice(-12) }}</code></td>
              <td>{{ p.orderId }}</td>
              <td>
                <span class="channel-tag" :class="p.channel === 'ALIPAY_SANDBOX' ? 'tag-alipay' : ''">
                  {{ p.channel === 'ALIPAY_SANDBOX' ? '支付宝(沙箱)' : p.channel }}
                </span>
              </td>
              <td><span class="pay-amount">¥{{ p.amount }}</span></td>
              <td>
                <span class="status-tag" :class="p.status === 'PAID' ? 'tag-paid' : p.status === 'UNPAID' ? 'tag-unpaid' : 'tag-refunded'">
                  <span class="status-dot"></span>
                  {{ p.status === 'PAID' ? '已支付' : p.status === 'UNPAID' ? '未支付' : '已退款' }}
                </span>
              </td>
              <td class="col-date">{{ p.paidAt?.slice(0, 16) || '-' }}</td>
              <td class="col-date">{{ p.createdAt?.slice(0, 16) }}</td>
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
import { api } from '../../utils/api'

const userStore = useUserStore()
const list = ref([])
const loading = ref(false)
const pageNum = ref(1)
const pageSize = ref(10)
const totalPages = ref(0)

async function fetch() {
  loading.value = true
  try {
    const data = await api.getAdminPayments({ pageNum: pageNum.value, pageSize: pageSize.value }, userStore.token)
    list.value = data?.records || []
    totalPages.value = data?.pages || Math.ceil((data?.total || 0) / pageSize.value)
  } catch { list.value = [] }
  finally { loading.value = false }
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
  margin-left: 32px;
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

.col-date {
  color: var(--text-muted);
  font-size: 13px;
  white-space: nowrap;
}

/* ==================== Payment No ==================== */
.payment-no {
  background: #fafafa;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  color: var(--text-secondary);
  border: 1px solid #e8e8e8;
}

/* ==================== Channel Tag ==================== */
.channel-tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background: var(--primary-light);
  color: var(--primary);
  border: 1px solid #91caff;
}

/* ==================== Amount ==================== */
.pay-amount {
  color: var(--danger);
  font-weight: 700;
  font-size: 14px;
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

.tag-paid {
  background: #f6ffed;
  color: #389e0d;
  border: 1px solid #b7eb8f;
}
.tag-paid .status-dot { background: var(--success); }

.tag-unpaid {
  background: #fffbe6;
  color: #d48806;
  border: 1px solid #ffe58f;
}
.tag-unpaid .status-dot { background: var(--warning); }

.tag-refunded {
  background: #f4f4f5;
  color: #8c8c8c;
  border: 1px solid #d9d9d9;
}
.tag-refunded .status-dot { background: #bfbfbf; }

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
