<template>
  <div class="admin-layout">
    <!-- Left Sidebar -->
    <aside
      class="admin-sidebar"
      :class="{ collapsed }"
      :style="{ width: collapsed ? '64px' : '220px' }"
    >
      <!-- Logo -->
      <div class="sidebar-logo">
        <img src="@/pic/logo.png" alt="Smart Mall" class="sidebar-logo-img" />
        <span v-show="!collapsed" class="logo-text">Smart Mall</span>
      </div>

      <!-- Menu Items -->
      <nav class="sidebar-nav">
        <ul class="menu-list">
          <li v-for="item in menuItems" :key="item.key">
            <router-link
              :to="item.path"
              class="menu-item"
              :class="{ active: isActive(item.path) }"
            >
              <span class="menu-icon" v-html="item.icon"></span>
              <span v-show="!collapsed" class="menu-label">{{ item.label }}</span>
            </router-link>
          </li>
        </ul>
      </nav>

      <!-- Collapse Toggle -->
      <div class="sidebar-toggle" @click="toggleCollapse">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path v-if="!collapsed" d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
          <path v-else d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z" />
        </svg>
      </div>
    </aside>

    <!-- Main Area -->
    <div class="admin-main" :style="{ marginLeft: collapsed ? '64px' : '220px' }">
      <!-- Top Navbar -->
      <header class="admin-topbar">
        <div class="topbar-left">
          <!-- Hamburger -->
          <button class="hamburger-btn" @click="toggleCollapse">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <!-- Breadcrumb -->
          <nav class="breadcrumb">
            <span class="breadcrumb-item">Dashboard</span>
            <span class="breadcrumb-separator">/</span>
            <span class="breadcrumb-item active">Sub Page</span>
          </nav>
        </div>

        <div class="topbar-right">
          <!-- Return to Mall -->
          <a class="return-link" href="/">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            返回商城
          </a>

          <!-- User Dropdown -->
          <div class="user-dropdown" ref="userDropdownRef">
            <button class="user-trigger" @click="showUserMenu = !showUserMenu">
              <span class="user-avatar">A</span>
              <span class="user-name">Admin</span>
              <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" class="dropdown-arrow" :class="{ open: showUserMenu }">
                <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z" />
              </svg>
            </button>

            <div v-if="showUserMenu" class="user-menu">
              <div class="menu-item">个人中心</div>
              <div class="menu-item">系统设置</div>
              <div class="menu-divider"></div>
              <div class="menu-item logout" @click="handleLogout">退出登录</div>
            </div>
          </div>
        </div>
      </header>

      <!-- Content Area -->
      <main class="admin-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const collapsed = ref(false)
const showUserMenu = ref(false)
const userDropdownRef = ref(null)

const menuItems = [
  {
    key: 'dashboard',
    label: '控制台',
    path: '/admin/dashboard',
    icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <rect x="3" y="3" width="8" height="8" rx="1.5" />
      <rect x="13" y="3" width="8" height="8" rx="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" />
      <rect x="13" y="13" width="8" height="8" rx="1.5" />
    </svg>`
  },
  {
    key: 'users',
    label: '用户管理',
    path: '/admin/users',
    icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <circle cx="12" cy="7" r="4" />
      <path d="M5.5 21.5C5.5 17.36 8.69 14 12 14c3.31 0 6.5 3.36 6.5 7.5" stroke="currentColor" stroke-width="2" fill="none" />
    </svg>`
  },
  {
    key: 'roles',
    label: '角色管理',
    path: '/admin/roles',
    icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M12 2L3 7v6c0 5.25 3.83 10.15 9 11 5.17-.85 9-5.75 9-11V7l-9-5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
      <polyline points="8 12 11 15 16 9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    </svg>`
  },
  {
    key: 'products',
    label: '商品管理',
    path: '/admin/products',
    icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M21 16V8a2 2 0 0 0-1-1.73L13 2.27a2 2 0 0 0-2 0L4 6.27A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      <line x1="12" y1="22.08" x2="12" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    </svg>`
  },
  {
    key: 'categories',
    label: '分类管理',
    path: '/admin/categories',
    icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <rect x="2" y="3" width="8" height="6" rx="1" fill="none" stroke="currentColor" stroke-width="2" />
      <rect x="14" y="3" width="8" height="6" rx="1" fill="none" stroke="currentColor" stroke-width="2" />
      <rect x="2" y="13" width="8" height="8" rx="1" fill="none" stroke="currentColor" stroke-width="2" />
      <rect x="14" y="13" width="8" height="8" rx="1" fill="none" stroke="currentColor" stroke-width="2" />
      <line x1="6" y1="9" x2="6" y2="11" stroke="currentColor" stroke-width="2" />
      <line x1="6" y1="11" x2="10" y2="11" stroke="currentColor" stroke-width="2" />
      <line x1="18" y1="9" x2="18" y2="11" stroke="currentColor" stroke-width="2" />
    </svg>`
  },
  {
    key: 'orders',
    label: '订单管理',
    path: '/admin/orders',
    icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <rect x="4" y="3" width="16" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="2" />
      <line x1="8" y1="8" x2="16" y2="8" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      <line x1="8" y1="16" x2="12" y2="16" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    </svg>`
  },
  {
    key: 'after-sales',
    label: '售后管理',
    path: '/admin/after-sales',
    icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M21 12a9 9 0 1 1-9-9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      <path d="M21 3v6h-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    </svg>`
  },
  {
    key: 'payments',
    label: '支付管理',
    path: '/admin/payments',
    icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <rect x="2" y="4" width="20" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="2" />
      <line x1="2" y1="10" x2="22" y2="10" stroke="currentColor" stroke-width="2" />
      <rect x="12" y="14" width="8" height="4" rx="0.5" fill="#1677ff" />
      <line x1="4" y1="14" x2="8" y2="14" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      <line x1="4" y1="17" x2="8" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    </svg>`
  },
  {
    key: 'reviews',
    label: '评价管理',
    path: '/admin/reviews',
    icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
    </svg>`
  },
  {
    key: 'coupons',
    label: '优惠券管理',
    path: '/admin/coupons',
    icon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M20 12V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      <circle cx="8" cy="12" r="2" fill="none" stroke="currentColor" stroke-width="1.5" />
      <path d="M14 13l-4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      <circle cx="14" cy="20" r="2" fill="none" stroke="#1677ff" stroke-width="1.5" />
      <circle cx="20" cy="14" r="2" fill="none" stroke="#1677ff" stroke-width="1.5" />
      <circle cx="20" cy="20" r="2" fill="none" stroke="#1677ff" stroke-width="1.5" />
      <path d="M16 20h4v-4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>`
  }
]

function toggleCollapse () {
  collapsed.value = !collapsed.value
}

function isActive (path) {
  return route.path.startsWith(path)
}

function handleLogout () {
  showUserMenu.value = false
  router.push('/login')
}

function handleClickOutside (event) {
  if (userDropdownRef.value && !userDropdownRef.value.contains(event.target)) {
    showUserMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* ========== Layout ========== */
.admin-layout {
  display: flex;
  min-height: 100vh;
}

/* ========== Sidebar ========== */
.admin-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 100;
  background: #001529;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: width 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Logo */
.sidebar-logo {
  display: flex;
  align-items: center;
  height: 48px;
  padding: 0 16px;
  white-space: nowrap;
  overflow: hidden;
}

.sidebar-logo-img {
  height: 32px;
  object-fit: contain;
  flex-shrink: 0;
}

.logo-text {
  margin-left: 10px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
}

/* Menu */
.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.menu-list {
  list-style: none;
  margin: 0;
  padding: 8px 0;
}

.menu-item {
  display: flex;
  align-items: center;
  height: 44px;
  padding: 0 16px;
  margin: 0 8px 4px 8px;
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.65);
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.menu-item:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.08);
}

.menu-item.active {
  color: #fff;
  background: #1677ff;
}

.menu-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  line-height: 0;
}

.menu-icon :deep(svg) {
  width: 18px;
  height: 18px;
}

.menu-label {
  margin-left: 10px;
  font-size: 14px;
  line-height: 1;
}

/* Collapse toggle at sidebar bottom */
.sidebar-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 48px;
  color: rgba(255, 255, 255, 0.65);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
}

.sidebar-toggle:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.08);
}

/* ========== Main Area ========== */
.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  transition: margin-left 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* ========== Topbar ========== */
.admin-topbar {
  position: sticky;
  top: 0;
  z-index: 99;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  padding: 0 16px;
  background: #ffffff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

/* Hamburger button */
.hamburger-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: #333;
  cursor: pointer;
  transition: background 0.2s;
}

.hamburger-btn:hover {
  background: #f0f0f0;
}

/* Breadcrumb */
.breadcrumb {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.45);
}

.breadcrumb-item {
  color: rgba(0, 0, 0, 0.45);
}

.breadcrumb-item.active {
  color: rgba(0, 0, 0, 0.85);
}

.breadcrumb-separator {
  margin: 0 8px;
  color: rgba(0, 0, 0, 0.3);
}

/* Return to mall link */
.return-link {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #1677ff;
  text-decoration: none;
  cursor: pointer;
  white-space: nowrap;
}

.return-link:hover {
  opacity: 0.8;
}

/* User dropdown */
.user-dropdown {
  position: relative;
}

.user-trigger {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  transition: background 0.2s;
}

.user-trigger:hover {
  background: #f0f0f0;
}

.user-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #1677ff;
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  flex-shrink: 0;
}

.user-name {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.85);
}

.dropdown-arrow {
  transition: transform 0.2s;
  color: rgba(0, 0, 0, 0.3);
}

.dropdown-arrow.open {
  transform: rotate(180deg);
}

.user-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  min-width: 140px;
  background: #ffffff;
  border-radius: 6px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  padding: 4px 0;
  z-index: 200;
}

.user-menu .menu-item {
  padding: 8px 16px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.85);
  cursor: pointer;
  white-space: nowrap;
  margin: 0;
  border-radius: 0;
  transition: background 0.2s;
}

.user-menu .menu-item:hover {
  background: #f5f5f5;
}

.user-menu .menu-item.logout {
  color: #ff4d4f;
}

.menu-divider {
  height: 1px;
  margin: 4px 0;
  background: #f0f0f0;
}

/* ========== Content Area ========== */
.admin-content {
  flex: 1;
  background: #f5f7fa;
  padding: 24px;
}
</style>
