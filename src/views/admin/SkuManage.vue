<!-- ==================== 管理端 - SKU管理 ==================== -->
<template>
  <div class="admin-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1677ff" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
          SKU 管理
        </h2>
        <span class="header-subtitle">商品 #{{ productId }}</span>
      </div>
      <div class="header-actions">
        <button class="btn-back" @click="$router.back()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          返回
        </button>
        <button class="btn-primary" @click="openDialog()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          新增SKU
        </button>
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
          <path d="M60 24H40l-3-6H20a4 4 0 0 0-4 4v32a4 4 0 0 0 4 4h40a4 4 0 0 0 4-4V28a4 4 0 0 0-4-4z" stroke="#d1d5db" stroke-width="2" fill="#f9fafb"/>
          <rect x="24" y="36" width="32" height="16" rx="4" stroke="#d1d5db" stroke-width="1.5" fill="#fff"/>
          <line x1="30" y1="42" x2="50" y2="42" stroke="#e5e7eb" stroke-width="1"/>
          <line x1="30" y1="46" x2="44" y2="46" stroke="#e5e7eb" stroke-width="1"/>
        </svg>
      </div>
      <p class="empty-title">暂无SKU数据</p>
      <p class="empty-desc">点击「新增SKU」为该商品添加规格</p>
    </div>

    <!-- Data Table -->
    <div v-else class="table-card">
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th class="th-id">ID</th>
              <th>SKU名称</th>
              <th>规格</th>
              <th>价格</th>
              <th>库存</th>
              <th>状态</th>
              <th class="th-actions">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in list" :key="s.id" class="table-row">
              <td class="col-id">{{ s.id }}</td>
              <td><strong>{{ s.skuName }}</strong></td>
              <td>
                <span class="specs-text">{{ typeof s.specs === 'object' ? JSON.stringify(s.specs) : (s.specs || '-') }}</span>
              </td>
              <td class="sku-price">¥{{ s.price }}</td>
              <td>{{ s.stock }}</td>
              <td>
                <span class="status-tag" :class="s.status === 1 ? 'tag-active' : 'tag-inactive'">
                  <span class="status-dot"></span>
                  {{ s.status === 1 ? '启用' : '禁用' }}
                </span>
              </td>
              <td>
                <div class="action-btns">
                  <button class="btn-link btn-link-edit" @click="openDialog(s)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    编辑
                  </button>
                  <button class="btn-link btn-link-delete" @click="handleDelete(s.id)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    删除
                  </button>
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
          <h3>{{ editingId ? '编辑SKU' : '新增SKU' }}</h3>
          <button class="dialog-close" @click="showDialog = false">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="dialog-body">
          <div class="form-group"><label>SKU名称</label><input v-model="form.skuName" placeholder="如: 红色-XL" /></div>
          <div class="form-group"><label>规格(JSON)</label><input v-model="form.specs" placeholder='{"颜色":"红色","尺寸":"XL"}' /></div>
          <div class="form-group"><label>价格</label><input v-model.number="form.price" type="number" step="0.01" /></div>
          <div class="form-group"><label>库存</label><input v-model.number="form.stock" type="number" /></div>
          <div class="form-group">
            <label>状态</label>
            <select v-model.number="form.status" class="form-select">
              <option :value="1">启用</option>
              <option :value="0">禁用</option>
            </select>
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
import { useRoute } from 'vue-router'
import { useUserStore } from '../../stores/user'
import { useToast } from '../../composables/useToast'
import { api } from '../../utils/api'

const route = useRoute()
const userStore = useUserStore()
const toast = useToast()
const productId = route.params.productId
const list = ref([])
const loading = ref(false)
const saving = ref(false)
const showDialog = ref(false)
const editingId = ref(null)
const form = reactive({ skuName: '', specs: '', price: 0, stock: 0, status: 1 })

async function fetch() {
  loading.value = true
  try { list.value = await api.getAdminSkus(productId, userStore.token) || [] }
  catch { list.value = [] }
  finally { loading.value = false }
}

function openDialog(s) {
  if (s) {
    editingId.value = s.id
    Object.assign(form, {
      skuName: s.skuName, specs: typeof s.specs === 'string' ? s.specs : JSON.stringify(s.specs || {}),
      price: s.price, stock: s.stock, status: s.status
    })
  } else {
    editingId.value = null
    Object.assign(form, { skuName: '', specs: '', price: 0, stock: 0, status: 1 })
  }
  showDialog.value = true
}

async function handleSave() {
  saving.value = true
  try {
    const data = { ...form }
    if (data.specs && typeof data.specs === 'string') {
      try { data.specs = JSON.parse(data.specs) } catch { /* keep as string */ }
    }
    if (editingId.value) {
      await api.updateSku(productId, editingId.value, data, userStore.token)
      toast.success('SKU更新成功')
    } else {
      await api.createSku(productId, data, userStore.token)
      toast.success('SKU创建成功')
    }
    showDialog.value = false; fetch()
  } catch (e) { toast.error(e.message) }
  finally { saving.value = false }
}

async function handleDelete(id) {
  if (!confirm('确定要删除该SKU吗？')) return
  try { await api.deleteSku(productId, id, userStore.token); toast.success('SKU已删除'); fetch() }
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

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* ==================== Back Button ==================== */
.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  background: #fff;
  color: var(--text-secondary);
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-back:hover {
  border-color: var(--primary);
  color: var(--primary);
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
  width: 160px;
}

/* ==================== SKU Price ==================== */
.sku-price {
  color: var(--danger);
  font-weight: 700;
  font-size: 14px;
}

/* ==================== Specs Text ==================== */
.specs-text {
  font-size: 12px;
  color: var(--text-secondary);
  background: #fafafa;
  padding: 3px 8px;
  border-radius: 4px;
  max-width: 220px;
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  border: 1px solid #e8e8e8;
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
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0;
  background: none;
  border: none;
  font-size: 13px;
  cursor: pointer;
  transition: color 0.2s;
  font-weight: 500;
  white-space: nowrap;
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
  border-radius: 12px;
  width: 480px;
  max-width: 90vw;
  max-height: 90vh;
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

.dialog-body .form-group {
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
.dialog-body .form-group .form-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  color: var(--text-main);
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  background: #fff;
  font-family: inherit;
}

.dialog-body .form-group .form-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23999' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  cursor: pointer;
}

.dialog-body .form-group input:focus,
.dialog-body .form-group .form-select:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.1);
}

.dialog-body .form-group input::placeholder {
  color: #bfbfbf;
}

.dialog-body .form-group:last-child {
  margin-bottom: 0;
}

/* ==================== Dialog Footer ==================== */
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
