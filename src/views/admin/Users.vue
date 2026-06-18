<!-- ==================== 管理端 - 用户管理 ==================== -->
<template>
  <div class="admin-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1677ff" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          用户管理
        </h2>
        <span class="header-subtitle">管理系统用户，包括创建、编辑和权限控制</span>
      </div>
      <button class="btn-primary" @click="openDialog()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        新增用户
      </button>
    </div>

    <!-- Filter Card -->
    <div class="filter-card">
      <div class="filter-row">
        <div class="filter-item">
          <span class="filter-label">用户名</span>
          <input v-model="searchName" placeholder="搜索用户名..." @keyup.enter="search" class="filter-input" />
        </div>
        <div class="filter-item">
          <span class="filter-label">状态</span>
          <select v-model="searchStatus" @change="search" class="filter-select">
            <option :value="null">全部状态</option>
            <option :value="1">启用</option>
            <option :value="0">禁用</option>
          </select>
        </div>
        <div class="filter-actions">
          <button class="btn-filter-search" @click="search">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            查询
          </button>
          <button class="btn-filter-reset" @click="reset">
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
          <circle cx="40" cy="28" r="14" stroke="#d1d5db" stroke-width="2" fill="#f9fafb"/>
          <path d="M16 68c0-13.255 10.745-24 24-24s24 10.745 24 24" stroke="#d1d5db" stroke-width="2" fill="#f9fafb"/>
        </svg>
      </div>
      <p class="empty-title">暂无用户数据</p>
      <p class="empty-desc">点击「新增用户」添加第一个用户</p>
    </div>

    <!-- Data Table -->
    <div v-else class="table-card">
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th class="th-id">ID</th>
              <th>用户名</th>
              <th>昵称</th>
              <th>手机号</th>
              <th>邮箱</th>
              <th>状态</th>
              <th>创建时间</th>
              <th class="th-actions">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in list" :key="u.id" class="table-row">
              <td class="col-id">{{ u.id }}</td>
              <td>
                <div class="user-name-cell">
                  <span class="user-avatar-sm">{{ (u.nickname || u.username).charAt(0) }}</span>
                  <strong>{{ u.username }}</strong>
                </div>
              </td>
              <td>{{ u.nickname || '-' }}</td>
              <td>{{ u.phone || '-' }}</td>
              <td>{{ u.email || '-' }}</td>
              <td>
                <span class="status-tag" :class="u.status === 1 ? 'tag-active' : 'tag-inactive'">
                  <span class="status-dot"></span>
                  {{ u.status === 1 ? '启用' : '禁用' }}
                </span>
              </td>
              <td class="col-date">{{ u.createdAt?.slice(0, 10) }}</td>
              <td>
                <div class="action-btns">
                  <button class="btn-link btn-link-edit" @click="openDialog(u)">编辑</button>
                  <button class="btn-link btn-link-delete" @click="handleDelete(u.id)">删除</button>
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

    <!-- Edit Dialog -->
    <div class="dialog-overlay" v-if="showDialog" @click.self="showDialog = false">
      <div class="dialog">
        <div class="dialog-header">
          <h3>{{ editingId ? '编辑用户' : '新增用户' }}</h3>
          <button class="dialog-close" @click="showDialog = false">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div class="dialog-body">
          <div class="form-group"><label>用户名</label><input v-model="form.username" placeholder="请输入用户名" required /></div>
          <div class="form-group" v-if="!editingId"><label>密码</label><input v-model="form.password" type="password" placeholder="请输入密码" /></div>
          <div class="form-group"><label>昵称</label><input v-model="form.nickname" placeholder="请输入昵称" /></div>
          <div class="form-group"><label>手机号</label><input v-model="form.phone" placeholder="请输入手机号" /></div>
          <div class="form-group"><label>邮箱</label><input v-model="form.email" placeholder="请输入邮箱" /></div>
          <div class="form-group">
            <label>状态</label>
            <select v-model.number="form.status"><option :value="1">启用</option><option :value="0">禁用</option></select>
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
const pageNum = ref(1)
const pageSize = ref(10)
const totalPages = ref(0)
const searchName = ref('')
const searchStatus = ref(null)
const showDialog = ref(false)
const editingId = ref(null)
const form = reactive({ username: '', password: '', nickname: '', phone: '', email: '', status: 1 })

async function fetch() {
  loading.value = true
  try {
    const params = { pageNum: pageNum.value, pageSize: pageSize.value }
    if (searchName.value) params.name = searchName.value
    if (searchStatus.value !== null) params.status = searchStatus.value
    const data = await api.getAdminUsers(params, userStore.token)
    list.value = data?.records || []
    totalPages.value = data?.pages || Math.ceil((data?.total || 0) / pageSize.value)
  } catch { list.value = [] }
  finally { loading.value = false }
}

function search() { pageNum.value = 1; fetch() }
function reset() { searchName.value = ''; searchStatus.value = null; pageNum.value = 1; fetch() }

function openDialog(u) {
  if (u) {
    editingId.value = u.id
    Object.assign(form, { username: u.username, password: '', nickname: u.nickname, phone: u.phone || '', email: u.email || '', status: u.status })
  } else {
    editingId.value = null
    Object.assign(form, { username: '', password: '', nickname: '', phone: '', email: '', status: 1 })
  }
  showDialog.value = true
}

async function handleSave() {
  saving.value = true
  try {
    if (editingId.value) {
      await api.updateUser(editingId.value, form, userStore.token)
      toast.success('用户更新成功')
    } else {
      await api.createUser(form, userStore.token)
      toast.success('用户创建成功')
    }
    showDialog.value = false
    fetch()
  } catch (e) { toast.error(e.message) }
  finally { saving.value = false }
}

async function handleDelete(id) {
  if (!confirm('确定要删除该用户吗？此操作不可恢复。')) return
  try {
    await api.deleteUser(id, userStore.token)
    toast.success('用户已删除')
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

.filter-input {
  padding: 7px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 13px;
  color: var(--text-main);
  background: #fff;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  min-width: 200px;
}

.filter-input::placeholder {
  color: #bfbfbf;
}

.filter-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.1);
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
  min-width: 130px;
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
  width: 140px;
}

.col-date {
  color: var(--text-muted);
  font-size: 13px;
  white-space: nowrap;
}

/* ==================== User Avatar Cell ==================== */
.user-name-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar-sm {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--primary);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  text-transform: uppercase;
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
  color: var(--success);
  border: 1px solid #b7eb8f;
}

.tag-active .status-dot {
  background: var(--success);
}

.tag-inactive {
  background: #fff2f0;
  color: var(--danger);
  border: 1px solid #ffccc7;
}

.tag-inactive .status-dot {
  background: var(--danger);
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

.btn-link-edit {
  color: var(--primary);
}

.btn-link-edit:hover {
  color: var(--primary-dark);
}

.btn-link-delete {
  color: var(--danger);
}

.btn-link-delete:hover {
  color: #cf1322;
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
  width: 480px;
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
