<!-- ==================== 管理端 - 评价管理 ==================== -->
<template>
  <div class="admin-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1677ff" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          评价管理
        </h2>
        <span class="header-subtitle">查看和管理用户评价，维护商品口碑</span>
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
          <polygon points="40,10 48,32 72,32 53,46 60,68 40,55 20,68 27,46 8,32 32,32" stroke="#d1d5db" stroke-width="2" fill="#f9fafb"/>
        </svg>
      </div>
      <p class="empty-title">暂无评价数据</p>
      <p class="empty-desc">用户评价将会在这里显示</p>
    </div>

    <!-- Data Table -->
    <div v-else class="table-card">
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th class="th-id">ID</th>
              <th>用户ID</th>
              <th>商品ID</th>
              <th>订单ID</th>
              <th>评分</th>
              <th>内容</th>
              <th>创建时间</th>
              <th class="th-actions">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in list" :key="r.id" class="table-row">
              <td class="col-id">{{ r.id }}</td>
              <td>{{ r.userId }}</td>
              <td>{{ r.productId }}</td>
              <td>{{ r.orderId }}</td>
              <td>
                <div class="rating-stars">
                  <svg v-for="i in 5" :key="i" width="15" height="15" :viewBox="'0 0 24 24'" :fill="i <= r.rating ? '#faad14' : '#f0f0f0'" stroke="none">
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                  </svg>
                </div>
              </td>
              <td class="col-content" :title="r.content || ''">
                {{ r.content || '-' }}
              </td>
              <td class="col-date">{{ r.createdAt?.slice(0, 10) }}</td>
              <td>
                <div class="action-btns">
                  <button class="btn-link btn-link-delete" @click="handleDelete(r.id)">删除</button>
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
const pageNum = ref(1)
const pageSize = ref(10)
const totalPages = ref(0)

async function fetch() {
  loading.value = true
  try {
    const data = await api.getAdminReviews({ pageNum: pageNum.value, pageSize: pageSize.value }, userStore.token)
    list.value = data?.records || []
    totalPages.value = data?.pages || Math.ceil((data?.total || 0) / pageSize.value)
  } catch { list.value = [] }
  finally { loading.value = false }
}

async function handleDelete(id) {
  if (!confirm('确定要删除该评价吗？')) return
  try { await api.deleteReview(id, userStore.token); toast.success('评价已删除'); fetch() }
  catch (e) { toast.error(e.message) }
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

.th-actions {
  text-align: right;
  width: 100px;
}

.col-date {
  color: var(--text-muted);
  font-size: 13px;
  white-space: nowrap;
}

/* ==================== Rating Stars ==================== */
.rating-stars {
  display: flex;
  align-items: center;
  gap: 2px;
}

/* ==================== Content Column ==================== */
.col-content {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

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

.btn-link-delete {
  color: var(--danger);
}
.btn-link-delete:hover { color: #cf1322; }

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
