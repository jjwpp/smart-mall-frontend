<!-- ==================== 个人中心页 ==================== -->
<template>
  <div class="profile-page">
    <!-- 头部卡片 - 渐变背景 + 用户信息 -->
    <div class="profile-header">
      <div class="header-bg"></div>
      <div class="header-content">
        <div class="avatar-circle">
          <span class="avatar-text">{{ (user?.nickname || user?.username || 'U')[0].toUpperCase() }}</span>
        </div>
        <h2 class="user-name">{{ user?.nickname || user?.username || '用户' }}</h2>
        <div class="member-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          <span>{{ user?.roles?.includes('ADMIN') ? '管理员' : '普通会员' }}</span>
        </div>
      </div>
    </div>

    <!-- 订单状态栏 -->
    <div class="order-stats">
      <div class="stat-item" @click="navigateTo('/orders?status=待付款')">
        <div class="stat-icon waiting">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="12" y1="10" x2="12" y2="16"/><line x1="9" y1="13" x2="15" y2="13"/></svg>
        </div>
        <span class="stat-label">待付款</span>
        <span class="stat-count">{{ orderCounts.PENDING_PAYMENT }}</span>
      </div>
      <div class="stat-item" @click="navigateTo('/orders?status=待发货')">
        <div class="stat-icon shipped">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M1 12h22"/><path d="M16 6l6 6-6 6"/><path d="M22 12H12"/></svg>
        </div>
        <span class="stat-label">已发货</span>
        <span class="stat-count">{{ orderCounts.SHIPPED }}</span>
      </div>
      <div class="stat-item" @click="navigateTo('/orders?status=已完成')">
        <div class="stat-icon completed">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <span class="stat-label">已完成</span>
        <span class="stat-count">{{ orderCounts.COMPLETED }}</span>
      </div>
      <div class="stat-item" @click="navigateTo('/orders?status=售后')">
        <div class="stat-icon service">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
        </div>
        <span class="stat-label">售后</span>
        <span class="stat-count">{{ orderCounts.AFTER_SALE }}</span>
      </div>
    </div>

    <!-- 菜单分组 - iOS 风格 -->
    <div class="menu-group" v-if="user">
      <div class="menu-item" @click="navigateTo('/orders')">
        <div class="menu-icon orders">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
        </div>
        <span class="menu-label">我的订单</span>
        <span class="menu-extra">查看全部</span>
        <svg class="menu-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
      </div>
      <div class="menu-item" @click="navigateTo('/addresses')">
        <div class="menu-icon addresses">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
        <span class="menu-label">收货地址</span>
        <svg class="menu-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
      </div>
      <div class="menu-item" @click="navigateTo('/my-reviews')">
        <div class="menu-icon reviews">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
        </div>
        <span class="menu-label">我的评价</span>
        <svg class="menu-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
      </div>
      <div class="menu-item" @click="navigateTo('/my-coupons')">
        <div class="menu-icon coupons">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="12" y1="10" x2="12" y2="16"/><line x1="15" y1="13" x2="9" y2="13"/></svg>
        </div>
        <span class="menu-label">我的优惠券</span>
        <svg class="menu-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
      </div>
    </div>

    <div class="menu-group">
      <div class="menu-item" @click="showEdit = true">
        <div class="menu-icon settings">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        </div>
        <span class="menu-label">编辑资料</span>
        <svg class="menu-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
      </div>
    </div>

    <!-- 退出登录按钮 -->
    <button class="btn-logout" @click="handleLogout">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
      退出登录
    </button>

    <!-- 编辑弹窗 -->
    <div class="dialog-overlay" v-if="showEdit" @click.self="showEdit = false">
      <div class="dialog">
        <div class="dialog-header">
          <h3>编辑个人资料</h3>
          <button class="dialog-close" @click="showEdit = false">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="form-group"><label>昵称</label><input v-model="editForm.nickname" placeholder="请输入昵称" /></div>
        <div class="form-group"><label>手机号</label><input v-model="editForm.phone" placeholder="请输入手机号" /></div>
        <div class="form-group"><label>邮箱</label><input v-model="editForm.email" placeholder="请输入邮箱" /></div>
        <div class="dialog-actions">
          <button class="btn-cancel" @click="showEdit = false">取消</button>
          <button class="btn-save" @click="saveProfile">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'
import { api } from '../../utils/api'

const router = useRouter()
const userStore = useUserStore()
const user = ref(userStore.currentUser)
const showEdit = ref(false)

// 各状态订单数量
const orderCounts = reactive({
  PENDING_PAYMENT: 0,
  SHIPPED: 0,
  COMPLETED: 0,
  AFTER_SALE: 0
})

async function fetchOrderCounts() {
  if (!userStore.isLoggedIn) return
  // 并行查询各状态订单数（pageSize=1 只取总数）
  const statuses = ['PENDING_PAYMENT', 'SHIPPED', 'COMPLETED']
  const results = await Promise.allSettled(
    statuses.map(s => api.getUserOrders({ userId: userStore.userId, pageSize: 1, status: s }, userStore.token))
  )
  results.forEach((r, i) => {
    if (r.status === 'fulfilled' && r.value) {
      orderCounts[statuses[i]] = r.value.total || 0
    }
  })
  // 售后：计算 CANCELLED + 退款相关
  try {
    const cancelled = await api.getUserOrders({ userId: userStore.userId, pageSize: 1, status: 'CANCELLED' }, userStore.token)
    orderCounts.AFTER_SALE = cancelled?.total || 0
  } catch { /* ignore */ }
}

onMounted(fetchOrderCounts)

const editForm = reactive({
  nickname: user.value?.nickname || '',
  phone: user.value?.phone || '',
  email: user.value?.email || ''
})

function saveProfile() {
  userStore.updateProfile({ ...editForm })
  user.value = userStore.currentUser
  showEdit.value = false
}

function handleLogout() {
  userStore.logout()
  router.push('/login')
}

function navigateTo(path) {
  router.push(path)
}
</script>

<style scoped>
/* ==================== 设计变量 ==================== */
.profile-page {
  --red: #ff2442;
  --red-dark: #e61f3a;
  --bg-gray: #f6f6f6;
  --card-bg: #ffffff;
  --text-main: #1a1a1a;
  --text-secondary: #666666;
  --text-muted: #999999;
  --border-color: #eeeeee;
}

/* ==================== 页面容器 ==================== */
.profile-page {
  max-width: 640px;
  margin: 0 auto;
  padding-bottom: 40px;
}

/* ==================== 头部卡片 ==================== */
.profile-header {
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  margin-bottom: 16px;
}

.header-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #ff2442 0%, #ff6b35 50%, #ff8c5a 100%);
}

.header-bg::after {
  content: '';
  position: absolute;
  top: -40%;
  right: -20%;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%);
}

.header-content {
  position: relative;
  z-index: 1;
  padding: 32px 24px 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.avatar-circle {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  border: 3px solid rgba(255, 255, 255, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
  transition: transform 0.3s;
}

.avatar-circle:hover {
  transform: scale(1.05);
}

.avatar-text {
  font-size: 30px;
  font-weight: 800;
  color: #fff;
  text-transform: uppercase;
}

.user-name {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 8px;
}

.member-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px);
  padding: 4px 14px;
  border-radius: 20px;
  font-size: 12px;
  color: #fff;
  font-weight: 600;
}

/* ==================== 订单状态栏 ==================== */
.order-stats {
  display: flex;
  justify-content: space-around;
  background: var(--card-bg);
  border-radius: 16px;
  padding: 20px 8px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: transform 0.2s;
  flex: 1;
}

.stat-item:hover {
  transform: translateY(-2px);
}

.stat-item:active {
  transform: scale(0.95);
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2px;
}

.stat-icon.waiting {
  background: rgba(255, 36, 66, 0.08);
  color: #ff2442;
}

.stat-icon.shipped {
  background: rgba(255, 159, 67, 0.08);
  color: #ff9f43;
}

.stat-icon.completed {
  background: rgba(46, 213, 115, 0.08);
  color: #2ed573;
}

.stat-icon.service {
  background: rgba(54, 162, 235, 0.08);
  color: #36a2eb;
}

.stat-label {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
}

.stat-count {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-main);
}

/* ==================== iOS 风格菜单分组 ==================== */
.menu-group {
  background: var(--card-bg);
  border-radius: 16px;
  margin-bottom: 16px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  cursor: pointer;
  transition: background 0.15s;
  position: relative;
}

.menu-item:not(:last-child)::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 56px;
  right: 0;
  height: 1px;
  background: var(--border-color);
}

.menu-item:active {
  background: var(--bg-gray);
}

.menu-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 14px;
  flex-shrink: 0;
}

.menu-icon.orders {
  background: rgba(255, 36, 66, 0.08);
  color: #ff2442;
}

.menu-icon.addresses {
  background: rgba(255, 159, 67, 0.08);
  color: #ff9f43;
}

.menu-icon.reviews {
  background: rgba(46, 213, 115, 0.08);
  color: #2ed573;
}

.menu-icon.coupons {
  background: rgba(155, 89, 182, 0.08);
  color: #9b59b6;
}

.menu-icon.settings {
  background: rgba(108, 117, 125, 0.08);
  color: #6c757d;
}

.menu-label {
  flex: 1;
  font-size: 15px;
  font-weight: 500;
  color: var(--text-main);
}

.menu-extra {
  font-size: 13px;
  color: var(--text-muted);
  margin-right: 6px;
}

.menu-arrow {
  color: #d0d0d0;
  flex-shrink: 0;
}

/* ==================== 退出登录按钮 ==================== */
.btn-logout {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 14px;
  background: var(--card-bg);
  border: none;
  border-radius: 16px;
  color: #ff2442;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.btn-logout:hover {
  background: rgba(255, 36, 66, 0.04);
}

.btn-logout:active {
  transform: scale(0.98);
}

/* ==================== 弹窗 ==================== */
.dialog-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
  animation: fadeIn 0.2s ease;
}

.dialog {
  background: #fff;
  border-radius: 20px;
  padding: 28px 28px 24px;
  width: 90%;
  max-width: 420px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.25s ease;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.dialog-header h3 {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-main);
}

.dialog-close {
  background: var(--bg-gray);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-muted);
  transition: all 0.2s;
}

.dialog-close:hover {
  background: #e8e8e8;
  color: var(--text-main);
}

.form-group {
  margin-bottom: 18px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 600;
}

.form-group input {
  width: 100%;
  padding: 12px 16px;
  border: 1.5px solid #e8e8e8;
  border-radius: 12px;
  font-size: 15px;
  color: var(--text-main);
  transition: all 0.25s;
  outline: none;
  background: #f8f8f8;
  font-family: inherit;
}

.form-group input:focus {
  border-color: #ff2442;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(255, 36, 66, 0.08);
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.btn-cancel {
  padding: 10px 24px;
  background: #f0f0f0;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.btn-cancel:hover {
  background: #e4e4e4;
}

.btn-save {
  padding: 10px 24px;
  background: linear-gradient(135deg, #ff2442, #ff6b35);
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.btn-save:hover {
  box-shadow: 0 4px 14px rgba(255, 36, 66, 0.3);
  transform: translateY(-1px);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px) scale(0.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

/* ==================== 响应式 ==================== */
@media (max-width: 480px) {
  .profile-page {
    padding: 0 0 30px;
  }
  .profile-header,
  .order-stats,
  .menu-group {
    border-radius: 12px;
  }
  .avatar-circle {
    width: 64px;
    height: 64px;
  }
  .avatar-text {
    font-size: 26px;
  }
  .user-name {
    font-size: 18px;
  }
}
</style>
