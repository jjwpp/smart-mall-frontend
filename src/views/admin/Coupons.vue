<!-- ==================== 管理端 - 优惠券管理 ==================== -->
<template>
  <div class="admin-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1677ff" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
          优惠券管理
        </h2>
        <span class="header-subtitle">创建和管理营销优惠券，设置发放规则和有效期</span>
      </div>
      <button class="btn-primary" @click="openDialog()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        新建优惠券
      </button>
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
          <rect x="15" y="12" width="50" height="56" rx="8" stroke="#d1d5db" stroke-width="2" fill="#f9fafb"/>
          <rect x="23" y="22" width="34" height="22" rx="4" stroke="#e5e7eb" stroke-width="1.5" fill="#fff"/>
          <circle cx="23" cy="56" r="6" stroke="#d1d5db" stroke-width="1.5" fill="#f9fafb"/>
          <circle cx="57" cy="56" r="6" stroke="#d1d5db" stroke-width="1.5" fill="#f9fafb"/>
          <line x1="29" y1="56" x2="51" y2="56" stroke="#e5e7eb" stroke-width="1.5" stroke-dasharray="3 3"/>
        </svg>
      </div>
      <p class="empty-title">暂无优惠券</p>
      <p class="empty-desc">点击「新建优惠券」创建营销活动</p>
    </div>

    <!-- Data Table -->
    <div v-else class="table-card">
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th class="th-id">ID</th>
              <th>名称</th>
              <th>类型</th>
              <th>门槛</th>
              <th>优惠</th>
              <th>发行</th>
              <th>已领</th>
              <th>有效期</th>
              <th>状态</th>
              <th class="th-actions">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in list" :key="c.id" class="table-row">
              <td class="col-id">{{ c.id }}</td>
              <td>
                <div class="coupon-name-cell">
                  <span class="coupon-icon-box">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                  </span>
                  <strong>{{ c.couponName }}</strong>
                </div>
              </td>
              <td>
                <span class="type-tag">{{ c.couponType === 1 ? '满减券' : '其他' }}</span>
              </td>
              <td class="col-condition">¥{{ c.conditionAmount }}</td>
              <td class="col-amount">¥{{ c.amount }}</td>
              <td>
                <span class="count-badge">{{ c.totalNum }}</span>
              </td>
              <td>
                <div class="progress-cell">
                  <span class="count-badge" :class="{ 'count-full': c.receiveNum >= c.totalNum }">{{ c.receiveNum }}</span>
                  <div class="mini-progress" v-if="c.totalNum > 0">
                    <div class="mini-progress-fill" :style="{ width: Math.min(100, c.receiveNum / c.totalNum * 100) + '%' }"></div>
                  </div>
                </div>
              </td>
              <td class="col-date-range">{{ c.startTime?.slice(0,10) }} ~ {{ c.expireTime?.slice(0,10) }}</td>
              <td>
                <span class="status-tag" :class="c.status === 1 ? 'tag-active' : 'tag-inactive'">
                  <span class="status-dot"></span>
                  {{ c.status === 1 ? '启用' : '禁用' }}
                </span>
              </td>
              <td>
                <div class="action-btns">
                  <button class="btn-link btn-link-edit" @click="openDialog(c)">编辑</button>
                  <button class="btn-link btn-link-delete" @click="handleDelete(c.id)">删除</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Dialog -->
    <div class="dialog-overlay" v-if="showDialog" @click.self="showDialog = false">
      <div class="dialog">
        <div class="dialog-header">
          <h3>{{ editingId ? '编辑优惠券' : '新建优惠券' }}</h3>
          <button class="dialog-close" @click="showDialog = false">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div class="dialog-body">
          <div class="form-grid-2">
            <div class="form-group"><label>名称</label><input v-model="form.couponName" placeholder="优惠券名称" /></div>
            <div class="form-group"><label>类型</label><select v-model.number="form.couponType"><option :value="1">满减券</option></select></div>
            <div class="form-group"><label>使用门槛</label><input v-model.number="form.conditionAmount" type="number" step="0.01" /></div>
            <div class="form-group"><label>优惠金额</label><input v-model.number="form.amount" type="number" step="0.01" /></div>
            <div class="form-group"><label>发行总量</label><input v-model.number="form.totalNum" type="number" /></div>
            <div class="form-group"><label>每人限领</label><input v-model.number="form.perLimit" type="number" /></div>
            <div class="form-group"><label>开始时间</label><input v-model="form.startTime" type="datetime-local" /></div>
            <div class="form-group"><label>过期时间</label><input v-model="form.expireTime" type="datetime-local" /></div>
            <div class="form-group"><label>状态</label><select v-model.number="form.status"><option :value="1">启用</option><option :value="0">禁用</option></select></div>
          </div>
        </div>

        <div class="dialog-footer">
          <button class="btn-cancel" @click="showDialog = false">取消</button>
          <button class="btn-confirm" @click="handleSave" :disabled="saving">
            <svg v-if="saving" class="spin-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-dashoffset="10"/></svg>
            {{ saving ? '保存中...' : '保存' }}
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
const saving = ref(false)
const showDialog = ref(false)
const editingId = ref(null)
const form = reactive({ couponName: '', couponType: 1, conditionAmount: 0, amount: 0, totalNum: 100, perLimit: 1, startTime: '', expireTime: '', status: 1 })

async function fetch() {
  loading.value = true
  try { const d = await api.getAdminCoupons({ pageNum: 1, pageSize: 100 }, userStore.token); list.value = d?.records || [] }
  catch { list.value = [] }
  finally { loading.value = false }
}

function openDialog(c) {
  if (c) {
    editingId.value = c.id
    Object.assign(form, {
      couponName: c.couponName, couponType: c.couponType, conditionAmount: c.conditionAmount,
      amount: c.amount, totalNum: c.totalNum, perLimit: c.perLimit,
      startTime: c.startTime?.slice(0, 16), expireTime: c.expireTime?.slice(0, 16), status: c.status
    })
  } else {
    editingId.value = null
    Object.assign(form, { couponName: '', couponType: 1, conditionAmount: 0, amount: 0, totalNum: 100, perLimit: 1, startTime: '', expireTime: '', status: 1 })
  }
  showDialog.value = true
}

async function handleSave() {
  saving.value = true
  try {
    const data = { ...form, startTime: form.startTime ? form.startTime + ':00' : null, expireTime: form.expireTime ? form.expireTime + ':00' : null }
    if (editingId.value) { await api.updateCoupon(editingId.value, data, userStore.token); toast.success('更新成功') }
    else { await api.createCoupon(data, userStore.token); toast.success('创建成功') }
    showDialog.value = false; fetch()
  } catch (e) { toast.error(e.message) }
  finally { saving.value = false }
}

async function handleDelete(id) {
  if (!confirm('确定删除？')) return
  try { await api.deleteCoupon(id, userStore.token); toast.success('已删除'); fetch() }
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

/* ==================== Primary Button ==================== */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
}

.btn-primary:hover {
  background: var(--primary-dark);
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
  width: 140px;
}

/* ==================== Coupon Name Cell ==================== */
.coupon-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.coupon-icon-box {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff7e6;
  color: var(--warning);
  border-radius: 6px;
  flex-shrink: 0;
}

/* ==================== Type Tag ==================== */
.type-tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background: #fffbe6;
  color: #d48806;
  border: 1px solid #ffe58f;
}

/* ==================== Amount Columns ==================== */
.col-condition {
  color: var(--text-secondary);
}

.col-amount {
  color: var(--danger);
  font-weight: 700;
  font-size: 14px;
}

.col-date-range {
  color: var(--text-muted);
  font-size: 13px;
  white-space: nowrap;
}

/* ==================== Count Badge & Progress ==================== */
.count-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
  background: #f5f5f5;
  color: var(--text-secondary);
}

.count-badge.count-full {
  background: #fff2f0;
  color: var(--danger);
}

.progress-cell {
  display: flex;
  flex-direction: column;
  gap: 5px;
  align-items: flex-start;
}

.mini-progress {
  width: 60px;
  height: 4px;
  border-radius: 2px;
  background: #f0f0f0;
  overflow: hidden;
}

.mini-progress-fill {
  height: 100%;
  border-radius: 2px;
  background: var(--primary);
  transition: width 0.3s ease;
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

.tag-active {
  background: #f6ffed;
  color: #389e0d;
  border: 1px solid #b7eb8f;
}
.tag-active .status-dot { background: var(--success); }

.tag-inactive {
  background: #fff2f0;
  color: #cf1322;
  border: 1px solid #ffccc7;
}
.tag-inactive .status-dot { background: var(--danger); }

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

.btn-link-edit {
  color: var(--primary);
}
.btn-link-edit:hover { color: var(--primary-dark); }

.btn-link-delete {
  color: var(--danger);
}
.btn-link-delete:hover { color: #cf1322; }

/* ==================== Dialog ==================== */
.dialog-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

.dialog {
  background: #fff;
  border-radius: 8px;
  width: 580px;
  max-width: 90vw;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 6px 16px rgba(0,0,0,0.08), 0 3px 6px -4px rgba(0,0,0,0.05);
  animation: slideUp 0.2s ease;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 0 24px;
}

.dialog-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-main);
  margin: 0;
}

.dialog-close {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  border-radius: 6px;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s;
}

.dialog-close:hover {
  background: #f5f5f5;
  color: var(--text-main);
}

.dialog-body {
  padding: 20px 24px;
}

.form-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 18px;
}

.form-grid-2 .form-group {
  margin-bottom: 16px;
}

.dialog-body .form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  color: var(--text-main);
  font-weight: 500;
}

.dialog-body .form-group input,
.dialog-body .form-group select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  color: var(--text-main);
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  background: #fff;
}

.dialog-body .form-group input:focus,
.dialog-body .form-group select:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.1);
}

.dialog-body .form-group input::placeholder {
  color: #bfbfbf;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px 20px 24px;
  border-top: 1px solid var(--border);
}

.btn-cancel {
  padding: 7px 18px;
  background: #fff;
  color: var(--text-secondary);
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.btn-confirm {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 20px;
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-confirm:hover:not(:disabled) {
  background: var(--primary-dark);
}

.btn-confirm:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spin-icon {
  animation: spin 0.8s linear infinite;
}

/* ==================== Animations ==================== */
@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
