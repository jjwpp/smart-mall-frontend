<!-- ==================== Smart Mall - 根组件 ==================== -->
<template>
  <div id="sm-app">
    <!-- ========== Toast 通知 ========== -->
    <div class="toast-container">
      <transition-group name="toast">
        <div
          v-for="t in toasts"
          :key="t.id"
          :class="['toast', 'toast-' + t.type]"
          @click="removeToast(t.id)"
        >
          <span class="toast-icon">
            <svg v-if="t.type === 'success'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <svg v-else-if="t.type === 'error'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            <svg v-else-if="t.type === 'warning'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          </span>
          <span>{{ t.message }}</span>
        </div>
      </transition-group>
    </div>

    <!-- ========== 顶部导航栏（管理端隐藏，由 AdminLayout 自行提供） ========== -->
    <header class="sm-header" v-if="!isLoginPage && !isAdminRoute">
      <div class="header-inner">
        <div class="logo" @click="goHome">
          <img src="@/pic/logo.png" alt="Smart Mall" class="logo-img" />
        </div>

        <!-- 用户端导航 -->
        <nav class="main-nav" v-if="userStore.isLoggedIn">
          <router-link to="/home">首页</router-link>
          <router-link to="/products">商品列表</router-link>
          <router-link to="/cart">
            购物车
            <span class="badge" v-if="cartCount">{{ cartCount }}</span>
          </router-link>
          <router-link to="/orders">我的订单</router-link>
          <router-link to="/coupons">领券中心</router-link>
          <router-link to="/my-coupons">我的优惠券</router-link>
          <router-link to="/ai" class="ai-nav-link">🤖 AI 助手</router-link>
        </nav>

        <div class="header-actions">
          <template v-if="userStore.isLoggedIn">
            <span class="user-info">
              <span class="avatar-dot"></span>
              {{ userStore.currentUser?.nickname || userStore.currentUser?.username }}
            </span>
            <router-link to="/profile" class="btn-text">个人中心</router-link>
            <button class="btn-text" @click="handleLogout">退出</button>
            <button
              class="btn-switch"
              v-if="userStore.currentUser?.roles?.includes('ADMIN')"
              @click="toggleAdmin"
            >
              {{ isAdminRoute ? '🏠 用户端' : '⚙️ 管理端' }}
            </button>
          </template>
          <template v-else>
            <router-link to="/login" class="btn-text">登录</router-link>
            <router-link to="/register" class="btn-primary-sm">注册</router-link>
          </template>
        </div>
      </div>
    </header>

    <!-- ========== 主内容区 ========== -->
    <!-- 管理端：AdminLayout 自带布局，不包裹 sm-main -->
    <!-- 用户端：包裹在 sm-main 中提供 max-width、padding 等 -->
    <router-view v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <main v-if="!isAdminRoute" class="sm-main" :class="{ 'no-header': isLoginPage }">
          <component :is="Component" />
        </main>
        <component v-else :is="Component" />
      </transition>
    </router-view>

    <!-- ========== 底部（管理端隐藏） ========== -->
    <footer class="sm-footer" v-if="!isLoginPage && !isAdminRoute">
      <p>© 2026 Smart Mall · AI智能购物商城 · 工程化项目训练与开发创新实践</p>
    </footer>
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from './stores/user'
import { useCartStore } from './stores/cart'
import { useToast } from './composables/useToast'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const cartStore = useCartStore()
const { toasts, remove: removeToast } = useToast()

const cartCount = computed(() => cartStore.count)

const isLoginPage = computed(() => {
  return route.path === '/login' || route.path === '/register'
})

const isAdminRoute = computed(() => {
  return route.path.startsWith('/admin')
})

function goHome() {
  if (userStore.currentUser?.roles?.includes('ADMIN')) {
    router.push('/admin/dashboard')
  } else {
    router.push('/home')
  }
}

function toggleAdmin() {
  if (isAdminRoute.value) {
    router.push('/home')
  } else {
    router.push('/admin/dashboard')
  }
}

function handleLogout() {
  userStore.logout()
  cartStore.clear()
  router.push('/login')
}

onMounted(() => {
  if (userStore.isLoggedIn) {
    cartStore.fetchCount()
  }
})

watch(() => userStore.isLoggedIn, (val) => {
  if (val) cartStore.fetchCount()
})
</script>

<style>
/* ==================== Smart Mall – Modern Minimal E-commerce Design System ==================== */

/* ---------- CSS Variables ---------- */
:root {
  --primary: #ff2442;
  --primary-dark: #e02020;
  --primary-light: #fff0f3;
  --secondary: #1a1a2e;
  --accent: #ff6b35;
  --success: #07c160;
  --success-light: #e8f9ef;
  --warning: #ffb800;
  --warning-light: #fff8e6;
  --danger: #ff2442;
  --danger-light: #fff0f3;
  --info: #909399;
  --info-light: #f4f4f5;
  --bg: #f6f6f6;
  --bg-white: #ffffff;
  --text: #1a1a1a;
  --text-secondary: #666666;
  --text-light: #999999;
  --border: #eeeeee;
  --border-light: #f0f0f0;
  --radius: 12px;
  --radius-lg: 16px;
  --radius-sm: 8px;
  --shadow: 0 2px 12px rgba(0,0,0,0.06);
  --shadow-lg: 0 8px 30px rgba(0,0,0,0.10);
  --shadow-card: 0 2px 8px rgba(0,0,0,0.04);
  --header-height: 56px;
  --sidebar-width: 220px;
  --transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* ---------- Reset ---------- */
*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  -webkit-text-size-adjust: 100%;
}

body {
  font-family: 'Inter', 'PingFang SC', 'Microsoft YaHei', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: var(--text);
  background: var(--bg);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

a {
  color: var(--primary);
  text-decoration: none;
  transition: color var(--transition);
}
a:hover {
  color: var(--primary-dark);
}

/* ---------- Layout ---------- */
#sm-app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.sm-header {
  height: var(--header-height);
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  border-bottom: 1px solid var(--border-light);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-inner {
  max-width: 1400px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 24px;
  gap: 20px;
}

.logo {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  flex-shrink: 0;
  transition: opacity var(--transition);
}
.logo:hover { opacity: 0.8; }
.logo-img { height: 68px; object-fit: contain; }

.main-nav {
  display: flex;
  gap: 4px;
  flex: 1;
  overflow-x: auto;
  scrollbar-width: none;
}
.main-nav::-webkit-scrollbar { display: none; }
.main-nav a {
  padding: 7px 14px;
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
  font-size: 13.5px;
  transition: all var(--transition);
  position: relative;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: 500;
}
.main-nav a:hover {
  color: var(--primary);
  background: var(--primary-light);
}
.main-nav a.router-link-active {
  color: var(--primary);
  background: var(--primary-light);
  font-weight: 600;
}
.nav-icon { font-size: 14px; }

.admin-nav a.router-link-active {
  color: #fff;
  background: var(--primary);
  border-radius: var(--radius-sm);
}

.badge {
  position: absolute;
  top: -2px;
  right: -4px;
  background: var(--danger);
  color: #fff;
  font-size: 10px;
  border-radius: 10px;
  padding: 1px 6px;
  min-width: 18px;
  text-align: center;
  font-weight: 700;
  box-shadow: 0 2px 6px rgba(255, 36, 66, 0.35);
}

.ai-nav-link {
  background: linear-gradient(135deg, #ff2442 0%, #ff6b35 100%) !important;
  color: #fff !important;
  border-radius: 20px !important;
  padding: 6px 16px !important;
  font-weight: 600 !important;
  transition: all 0.25s ease !important;
}
.ai-nav-link:hover {
  opacity: 0.92 !important;
  transform: scale(1.04);
  background: linear-gradient(135deg, #ff2442 0%, #ff6b35 100%) !important;
  color: #fff !important;
  box-shadow: 0 4px 14px rgba(255, 36, 66, 0.35);
}
.ai-nav-link.router-link-active {
  background: linear-gradient(135deg, #e02020 0%, #ff6b35 100%) !important;
  color: #fff !important;
  box-shadow: 0 4px 16px rgba(255, 36, 66, 0.45);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}
.user-info {
  font-size: 13px;
  color: var(--text-secondary);
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
}
.avatar-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--success);
  display: inline-block;
  box-shadow: 0 0 0 2px rgba(7, 193, 96, 0.2);
}

.sm-main {
  flex: 1;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 24px;
}
.sm-main.no-header {
  padding: 0;
  max-width: none;
}

.sm-footer {
  text-align: center;
  padding: 20px;
  color: var(--text-light);
  font-size: 12.5px;
  border-top: 1px solid var(--border-light);
  margin-top: 40px;
  background: var(--bg-white);
}

/* ---------- Page Transitions ---------- */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* ---------- Buttons ---------- */
button {
  cursor: pointer;
  border: none;
  outline: none;
  font-size: 14px;
  border-radius: var(--radius-sm);
  padding: 8px 20px;
  transition: all 0.2s ease;
  font-family: inherit;
  font-weight: 500;
  position: relative;
  overflow: hidden;
}

.btn-primary {
  background: var(--primary);
  color: #fff;
  font-weight: 600;
  border-radius: var(--radius);
}
.btn-primary:hover {
  background: var(--primary-dark);
  box-shadow: 0 4px 14px rgba(255, 36, 66, 0.35);
  transform: translateY(-1px);
}
.btn-primary:active {
  transform: translateY(0) scale(0.98);
}

.btn-primary-sm {
  background: var(--primary);
  color: #fff;
  padding: 6px 16px;
  font-size: 13px;
  border-radius: var(--radius);
  font-weight: 600;
}
.btn-primary-sm:hover {
  background: var(--primary-dark);
  box-shadow: 0 3px 10px rgba(255, 36, 66, 0.3);
  transform: translateY(-1px);
}

.btn-success {
  background: var(--success);
  color: #fff;
  font-weight: 600;
  border-radius: var(--radius);
}
.btn-success:hover {
  opacity: 0.9;
  box-shadow: 0 4px 14px rgba(7, 193, 96, 0.35);
  transform: translateY(-1px);
}

.btn-danger {
  background: var(--danger);
  color: #fff;
  font-weight: 600;
  border-radius: var(--radius);
}
.btn-danger:hover {
  opacity: 0.9;
  box-shadow: 0 4px 14px rgba(255, 36, 66, 0.35);
  transform: translateY(-1px);
}

.btn-warning {
  background: var(--warning);
  color: #fff;
  font-weight: 600;
  border-radius: var(--radius);
}
.btn-warning:hover {
  opacity: 0.9;
  box-shadow: 0 4px 14px rgba(255, 184, 0, 0.35);
  transform: translateY(-1px);
}

.btn-text {
  background: transparent;
  color: var(--text-secondary);
  padding: 6px 12px;
  font-weight: 500;
  border-radius: var(--radius-sm);
}
.btn-text:hover {
  background: var(--bg);
  color: var(--primary);
}

.btn-switch {
  background: var(--bg);
  color: var(--text-secondary);
  padding: 6px 16px;
  font-size: 12px;
  border-radius: 20px;
  border: 1px solid var(--border);
  font-weight: 500;
}
.btn-switch:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: var(--primary-light);
}

.btn-sm {
  padding: 5px 14px;
  font-size: 12px;
  border-radius: var(--radius-sm);
}

button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

/* ---------- Cards ---------- */
.card {
  background: var(--bg-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  padding: 24px;
  margin-bottom: 20px;
  border: 1px solid var(--border-light);
  transition: box-shadow 0.25s ease, transform 0.25s ease;
}
.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.card-title {
  font-size: 17px;
  font-weight: 700;
  margin-bottom: 20px;
  padding-bottom: 14px;
  border-bottom: 1.5px solid var(--border-light);
  color: var(--text);
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ---------- Forms ---------- */
.form-group { margin-bottom: 18px; }
.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 600;
}

input,
textarea,
select {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 14px;
  color: var(--text);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  outline: none;
  background: var(--bg-white);
  font-family: inherit;
}
input:focus,
textarea:focus,
select:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(255, 36, 66, 0.08);
}
input::placeholder,
textarea::placeholder {
  color: #c0c4cc;
}

/* ---------- Tables ---------- */
.table-wrap {
  overflow-x: auto;
  border-radius: var(--radius);
  border: 1px solid var(--border-light);
  background: var(--bg-white);
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
th {
  padding: 14px 16px;
  text-align: left;
  border-bottom: 1.5px solid var(--border);
  font-weight: 600;
  color: var(--text-secondary);
  white-space: nowrap;
  font-size: 12.5px;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  background: #fafafa;
}
td {
  padding: 13px 16px;
  border-bottom: 1px solid var(--border-light);
  color: var(--text);
}
tr:last-child td { border-bottom: none; }
tr:hover td { background: #fafafa; }
tr { transition: background var(--transition); }

/* ---------- Tags / Badges ---------- */
.tag {
  display: inline-block;
  padding: 4px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.2px;
  line-height: 1.4;
}
.tag-success {
  background: var(--success-light);
  color: var(--success);
}
.tag-warning {
  background: var(--warning-light);
  color: #cc9400;
}
.tag-danger {
  background: var(--danger-light);
  color: var(--danger);
}
.tag-info {
  background: var(--info-light);
  color: var(--info);
}
.tag-primary {
  background: var(--primary-light);
  color: var(--primary);
}

/* ---------- Pagination ---------- */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--border-light);
}
.pagination button {
  background: var(--bg-white);
  border: 1px solid var(--border);
  padding: 8px 14px;
  font-size: 13px;
  border-radius: var(--radius-sm);
  min-width: 38px;
  transition: all var(--transition);
  font-weight: 500;
}
.pagination button:hover:not(:disabled) {
  border-color: var(--primary);
  color: var(--primary);
  background: var(--primary-light);
}
.pagination button.active {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
  box-shadow: 0 3px 10px rgba(255, 36, 66, 0.3);
  font-weight: 700;
}
.pagination button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

/* ---------- Search Bar ---------- */
.search-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  align-items: center;
  flex-wrap: wrap;
  padding: 16px;
  background: var(--bg-white);
  border-radius: var(--radius);
  border: 1px solid var(--border-light);
}
.search-bar input,
.search-bar select {
  width: auto;
  min-width: 160px;
}

/* ---------- Dialog ---------- */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}
.dialog {
  background: var(--bg-white);
  border-radius: var(--radius-lg);
  padding: 28px;
  min-width: 460px;
  max-width: 620px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.18);
  animation: dialogSlideUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.dialog h3 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 24px;
  padding-bottom: 14px;
  border-bottom: 1.5px solid var(--border-light);
  color: var(--text);
}
.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 18px;
  border-top: 1px solid var(--border-light);
}
.dialog-actions button {
  min-width: 80px;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes dialogSlideUp {
  from { opacity: 0; transform: translateY(24px) scale(0.96); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

/* ---------- Loading ---------- */
.loading-text {
  text-align: center;
  color: var(--text-light);
  padding: 80px 0;
  font-size: 15px;
}
.loading-text::before {
  content: '';
  display: block;
  width: 36px;
  height: 36px;
  border: 3px solid var(--border-light);
  border-top-color: var(--primary);
  border-radius: 50%;
  margin: 0 auto 16px;
  animation: spin 0.75s linear infinite;
}

/* ---------- Empty State ---------- */
.empty-state {
  text-align: center;
  padding: 80px 0;
  color: var(--text-light);
}
.empty-state .icon {
  font-size: 56px;
  margin-bottom: 16px;
  opacity: 0.7;
}
.empty-state p { font-size: 15px; }

/* ---------- Toast (bottom-right, pill-shaped) ---------- */
.toast-container {
  position: fixed;
  bottom: 28px;
  right: 28px;
  z-index: 3000;
  display: flex;
  flex-direction: column-reverse;
  gap: 10px;
  max-width: 380px;
}

.toast {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 13px 22px;
  border-radius: 28px;
  color: #fff;
  font-size: 13.5px;
  font-weight: 600;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.18);
  cursor: pointer;
  min-width: 240px;
  backdrop-filter: blur(10px);
  transition: box-shadow 0.2s ease;
}
.toast:hover {
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25);
}
.toast-icon {
  display: flex;
  flex-shrink: 0;
}
.toast-success {
  background: linear-gradient(135deg, #07c160, #06ad56);
}
.toast-error {
  background: linear-gradient(135deg, #ff2442, #e02020);
}
.toast-warning {
  background: linear-gradient(135deg, #ffb800, #f0a500);
}
.toast-info {
  background: linear-gradient(135deg, #666666, #4a4a4a);
}

.toast-enter-active {
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.toast-leave-active {
  transition: all 0.2s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.9);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(60px) scale(0.9);
}

/* ---------- Admin Mode ---------- */
.admin-mode .sm-header {
  border-bottom: 2px solid var(--primary);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: saturate(180%) blur(20px);
}
.admin-mode .sm-main {
  background: transparent;
}

/* ---------- Product Grid ---------- */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}
.product-card {
  background: var(--bg-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  overflow: hidden;
  transition: all 0.25s ease;
  cursor: pointer;
  border: 1px solid transparent;
}
.product-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--border-light);
}
.product-card .cover {
  width: 100%;
  height: 200px;
  object-fit: cover;
  background: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  color: #ddd;
}
.product-card .info { padding: 16px; }
.product-card .name {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text);
}
.product-card .subtitle {
  font-size: 12px;
  color: var(--text-light);
  margin-bottom: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.product-card .bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.product-card .price {
  color: var(--primary);
  font-size: 20px;
  font-weight: 800;
}
.product-card .price::before {
  content: '\FFE5';
  font-size: 13px;
  font-weight: 700;
}
.product-card .sales {
  font-size: 12px;
  color: var(--text-light);
  background: var(--bg);
  padding: 2px 8px;
  border-radius: 10px;
}

/* ---------- Utility ---------- */
.text-center { text-align: center; }
.text-right  { text-align: right; }
.mt-12 { margin-top: 12px; }
.mt-20 { margin-top: 20px; }
.mb-12 { margin-bottom: 12px; }
.mb-20 { margin-bottom: 20px; }
.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.flex-center {
  display: flex;
  align-items: center;
  gap: 8px;
}
.gap-8  { gap: 8px; }
.gap-12 { gap: 12px; }

/* ---------- Headings ---------- */
h2 {
  font-size: 22px;
  font-weight: 700;
  color: var(--text);
  display: flex;
  align-items: center;
  gap: 8px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ---------- Responsive ---------- */
@media (max-width: 768px) {
  .header-inner { gap: 8px; padding: 0 12px; }
  .main-nav a { padding: 6px 8px; font-size: 12px; }
  .nav-icon { display: none; }
  .sm-main { padding: 16px; }
  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
  }
  table { font-size: 12px; }
  th,
  td { padding: 10px 8px; }
  .dialog {
    min-width: auto;
    width: 92%;
    padding: 20px;
  }
  .search-bar { flex-direction: column; }
  .search-bar input,
  .search-bar select {
    width: 100%;
    min-width: auto;
  }
}

@media (max-width: 480px) {
  .toast-container {
    left: 12px;
    right: 12px;
    bottom: 16px;
    max-width: none;
  }
  .toast { min-width: auto; }
}
</style>
