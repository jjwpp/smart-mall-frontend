<template>
  <!-- ==================== Smart Mall 智能商城 - Vue3 前端框架 ==================== -->
  <div id="sm-app" :class="{ 'admin-mode': isAdminRoute }">
    <!-- ========== 顶部导航栏 ========== -->
    <header class="sm-header" v-if="!isLoginPage">
      <div class="header-inner">
        <div class="logo" @click="goHome">
          <span class="logo-icon">🛒</span>
          <span class="logo-text">Smart Mall</span>
        </div>

        <!-- 用户端导航 -->
        <nav class="main-nav" v-if="!isAdminRoute && isLoggedIn">
          <router-link to="/home">首页</router-link>
          <router-link to="/products">商品列表</router-link>
          <router-link to="/cart">购物车<span class="badge" v-if="cartCount">{{ cartCount }}</span></router-link>
          <router-link to="/orders">我的订单</router-link>
          <router-link to="/addresses">收货地址</router-link>
        </nav>

        <!-- 管理端导航 -->
        <nav class="main-nav" v-if="isAdminRoute && isLoggedIn">
          <router-link to="/admin/dashboard">控制台</router-link>
          <router-link to="/admin/users">用户管理</router-link>
          <router-link to="/admin/roles">角色管理</router-link>
          <router-link to="/admin/products">商品管理</router-link>
          <router-link to="/admin/categories">分类管理</router-link>
          <router-link to="/admin/orders">订单管理</router-link>
          <router-link to="/admin/payments">支付管理</router-link>
          <router-link to="/admin/reviews">评价管理</router-link>
        </nav>

        <div class="header-actions">
          <template v-if="isLoggedIn">
            <span class="user-info">👤 {{ currentUser?.nickname || currentUser?.username }}</span>
            <button class="btn-text" @click="logout">退出登录</button>
            <button class="btn-switch" v-if="currentUser?.isAdmin" @click="toggleAdmin">
              {{ isAdminRoute ? '切换用户端' : '切换管理端' }}
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
    <main class="sm-main" :class="{ 'no-header': isLoginPage }">
      <router-view
        @login-success="onLoginSuccess"
        @update-cart-count="updateCartCount"
      />
    </main>

    <!-- ========== 底部版权 ========== -->
    <footer class="sm-footer" v-if="!isLoginPage">
      <p>© 2026 Smart Mall · AI智能购物商城 · 工程化项目训练与开发创新实践</p>
    </footer>
  </div>
</template>

<script>
// ==================== Vue3 应用入口脚本 ====================
// 注意：此文件作为 Vite + Vue3 项目的 App.vue 使用
// 配套 main.js 需引入 Vue Router、Pinia 等

import { ref, computed, onMounted, watch, defineAsyncComponent } from 'vue'

// ==================== 路由配置 ====================
const routes = [
  // ---- 公共页面 ----
  { path: '/', redirect: '/home' },
  {
    path: '/login',
    name: 'Login',
    component: () => import('./views/Login.vue'),
    meta: { title: '登录', noAuth: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('./views/Register.vue'),
    meta: { title: '注册', noAuth: true }
  },

  // ---- 用户端页面 ----
  {
    path: '/home',
    name: 'Home',
    component: () => import('./views/user/Home.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/products',
    name: 'ProductList',
    component: () => import('./views/user/ProductList.vue'),
    meta: { title: '商品列表' }
  },
  {
    path: '/products/:id',
    name: 'ProductDetail',
    component: () => import('./views/user/ProductDetail.vue'),
    meta: { title: '商品详情' }
  },
  {
    path: '/cart',
    name: 'Cart',
    component: () => import('./views/user/Cart.vue'),
    meta: { title: '购物车' }
  },
  {
    path: '/orders',
    name: 'MyOrders',
    component: () => import('./views/user/MyOrders.vue'),
    meta: { title: '我的订单' }
  },
  {
    path: '/orders/:id',
    name: 'OrderDetail',
    component: () => import('./views/user/OrderDetail.vue'),
    meta: { title: '订单详情' }
  },
  {
    path: '/addresses',
    name: 'Addresses',
    component: () => import('./views/user/Addresses.vue'),
    meta: { title: '收货地址' }
  },
  {
    path: '/payments',
    name: 'MyPayments',
    component: () => import('./views/user/MyPayments.vue'),
    meta: { title: '支付记录' }
  },
  {
    path: '/reviews',
    name: 'MyReviews',
    component: () => import('./views/user/MyReviews.vue'),
    meta: { title: '我的评价' }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('./views/user/Profile.vue'),
    meta: { title: '个人中心' }
  },

  // ---- 管理端页面 ----
  {
    path: '/admin',
    redirect: '/admin/dashboard'
  },
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: () => import('./views/admin/Dashboard.vue'),
    meta: { title: '管理控制台', admin: true }
  },
  {
    path: '/admin/users',
    name: 'AdminUsers',
    component: () => import('./views/admin/Users.vue'),
    meta: { title: '用户管理', admin: true }
  },
  {
    path: '/admin/roles',
    name: 'AdminRoles',
    component: () => import('./views/admin/Roles.vue'),
    meta: { title: '角色管理', admin: true }
  },
  {
    path: '/admin/products',
    name: 'AdminProducts',
    component: () => import('./views/admin/Products.vue'),
    meta: { title: '商品管理', admin: true }
  },
  {
    path: '/admin/products/:productId/skus',
    name: 'AdminSkus',
    component: () => import('./views/admin/SkuManage.vue'),
    meta: { title: 'SKU管理', admin: true }
  },
  {
    path: '/admin/categories',
    name: 'AdminCategories',
    component: () => import('./views/admin/Categories.vue'),
    meta: { title: '分类管理', admin: true }
  },
  {
    path: '/admin/orders',
    name: 'AdminOrders',
    component: () => import('./views/admin/Orders.vue'),
    meta: { title: '订单管理', admin: true }
  },
  {
    path: '/admin/payments',
    name: 'AdminPayments',
    component: () => import('./views/admin/Payments.vue'),
    meta: { title: '支付管理', admin: true }
  },
  {
    path: '/admin/reviews',
    name: 'AdminReviews',
    component: () => import('./views/admin/Reviews.vue'),
    meta: { title: '评价管理', admin: true }
  }
]

// ==================== 全局状态 (简化版 store) ====================
const TOKEN_KEY = 'sm_token'
const USER_KEY = 'sm_user'

export function useStore() {
  const token = ref(localStorage.getItem(TOKEN_KEY) || '')
  const currentUser = ref(JSON.parse(localStorage.getItem(USER_KEY) || 'null'))
  const cartCount = ref(0)

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => currentUser.value?.roles?.includes('ADMIN'))

  function setAuth(t, user) {
    token.value = t
    currentUser.value = user
    localStorage.setItem(TOKEN_KEY, t)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  }

  function clearAuth() {
    token.value = ''
    currentUser.value = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  return { token, currentUser, cartCount, isLoggedIn, isAdmin, setAuth, clearAuth }
}

// ==================== API 封装层 ====================
const BASE_URLS = {
  system: 'http://localhost:8201',
  product: 'http://localhost:8202',
  trade: 'http://localhost:8203'
}

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl
  }

  async request(method, path, options = {}) {
    const { body, params, token } = options
    let url = `${this.baseUrl}${path}`

    if (params) {
      const qs = new URLSearchParams(params).toString()
      url += `?${qs}`
    }

    const headers = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    })

    const json = await res.json()
    if (json.code !== 200 && json.code !== 0) {
      throw new Error(json.message || '请求失败')
    }
    return json.data
  }

  get(path, params, token) { return this.request('GET', path, { params, token }) }
  post(path, body, token) { return this.request('POST', path, { body, token }) }
  put(path, body, token) { return this.request('PUT', path, { body, token }) }
  delete(path, token) { return this.request('DELETE', path, { token }) }
}

// 各服务 API 实例
const systemApi = new ApiClient(BASE_URLS.system)
const productApi = new ApiClient(BASE_URLS.product)
const tradeApi = new ApiClient(BASE_URLS.trade)

// ==================== API 接口集合 ====================
export const api = {
  // ---- 认证 ----
  login: (data) => systemApi.post('/api/auth/login', data),
  register: (data) => systemApi.post('/api/auth/register', data),

  // ---- 用户端：商品 ----
  getProducts: (params) => productApi.get('/user/products', params),
  getProductDetail: (id) => productApi.get(`/user/products/${id}`),
  getProductSkus: (id) => productApi.get(`/user/products/${id}/skus`),
  getCategories: () => productApi.get('/user/products/categories'),

  // ---- 用户端：购物车 ----
  getCartList: (userId, token) => tradeApi.get('/user/cart', { userId }, token),
  addToCart: (data, token) => tradeApi.post('/user/cart', data, token),
  updateCartItem: (id, data, token) => tradeApi.put(`/user/cart/${id}`, data, token),
  deleteCartItem: (id, token) => tradeApi.delete(`/user/cart/${id}`, token),
  clearCart: (userId, token) => tradeApi.delete('/user/cart/clear', { userId }, token),

  // ---- 用户端：订单 ----
  getUserOrders: (params, token) => tradeApi.get('/user/orders', params, token),
  getOrderDetail: (id, token) => tradeApi.get(`/user/orders/${id}`, token),
  getOrderItems: (id, token) => tradeApi.get(`/user/orders/${id}/items`, token),
  createOrder: (data, token) => tradeApi.post('/user/orders', data, token),
  cancelOrder: (id, token) => tradeApi.put(`/user/orders/${id}/cancel`, {}, token),

  // ---- 用户端：地址 ----
  getUserAddresses: (userId, token) => systemApi.get('/user/addresses', { userId }, token),
  createAddress: (data, token) => systemApi.post('/user/addresses', data, token),
  updateAddress: (id, data, token) => systemApi.put(`/user/addresses/${id}`, data, token),
  deleteAddress: (id, token) => systemApi.delete(`/user/addresses/${id}`, token),

  // ---- 用户端：支付 ----
  getUserPayments: (params, token) => tradeApi.get('/user/payments', params, token),
  payOrder: (data, token) => tradeApi.post('/user/payments', data, token),

  // ---- 用户端：评价 ----
  getProductReviews: (productId) => productApi.get(`/user/reviews`, { productId }),
  createReview: (data, token) => productApi.post('/user/reviews', data, token),

  // ---- 管理端：用户 ----
  getAdminUsers: (params, token) => systemApi.get('/admin/users', params, token),
  createUser: (data, token) => systemApi.post('/admin/users', data, token),
  updateUser: (id, data, token) => systemApi.put(`/admin/users/${id}`, data, token),
  deleteUser: (id, token) => systemApi.delete(`/admin/users/${id}`, token),

  // ---- 管理端：角色 ----
  getAdminRoles: (params, token) => systemApi.get('/admin/roles', params, token),
  createRole: (data, token) => systemApi.post('/admin/roles', data, token),
  updateRole: (id, data, token) => systemApi.put(`/admin/roles/${id}`, data, token),
  deleteRole: (id, token) => systemApi.delete(`/admin/roles/${id}`, token),

  // ---- 管理端：用户-角色 ----
  getUserRoles: (userId, token) => systemApi.get('/admin/user-roles', { userId }, token),
  assignUserRole: (data, token) => systemApi.post('/admin/user-roles', data, token),
  removeUserRole: (id, token) => systemApi.delete(`/admin/user-roles/${id}`, token),

  // ---- 管理端：商品 ----
  getAdminProducts: (params, token) => productApi.get('/admin/products', params, token),
  createProduct: (data, token) => productApi.post('/admin/products', data, token),
  updateProduct: (id, data, token) => productApi.put(`/admin/products/${id}`, data, token),
  updateProductStatus: (id, status, token) => productApi.put(`/admin/products/${id}/status`, { status }, token),
  deleteProduct: (id, token) => productApi.delete(`/admin/products/${id}`, token),

  // ---- 管理端：分类 ----
  getAdminCategories: (params, token) => productApi.get('/admin/categories', params, token),
  createCategory: (data, token) => productApi.post('/admin/categories', data, token),
  updateCategory: (id, data, token) => productApi.put(`/admin/categories/${id}`, data, token),
  deleteCategory: (id, token) => productApi.delete(`/admin/categories/${id}`, token),

  // ---- 管理端：SKU ----
  getAdminSkus: (productId, token) => productApi.get(`/admin/products/${productId}/skus`, token),
  createSku: (productId, data, token) => productApi.post(`/admin/products/${productId}/skus`, data, token),
  updateSku: (productId, id, data, token) => productApi.put(`/admin/products/${productId}/skus/${id}`, data, token),
  deleteSku: (productId, id, token) => productApi.delete(`/admin/products/${productId}/skus/${id}`, token),

  // ---- 管理端：订单 ----
  getAdminOrders: (params, token) => tradeApi.get('/admin/orders', params, token),
  updateOrderStatus: (id, status, token) => tradeApi.put(`/admin/orders/${id}/status`, { status }, token),

  // ---- 管理端：支付 ----
  getAdminPayments: (params, token) => tradeApi.get('/admin/payments', params, token),

  // ---- 管理端：评价 ----
  getAdminReviews: (params, token) => productApi.get('/admin/reviews', params, token),
  deleteReview: (id, token) => productApi.delete(`/admin/reviews/${id}`, token)
}

export default {
  name: 'SmApp',
  setup() {
    const store = useStore()

    const isLoginPage = computed(() => {
      return window.location.hash.includes('/login') || window.location.hash.includes('/register')
    })

    const isAdminRoute = computed(() => {
      return window.location.hash.includes('/admin')
    })

    function goHome() {
      if (store.isAdmin.value) {
        window.location.hash = '#/admin/dashboard'
      } else {
        window.location.hash = '#/home'
      }
    }

    function toggleAdmin() {
      if (isAdminRoute.value) {
        window.location.hash = '#/home'
      } else {
        window.location.hash = '#/admin/dashboard'
      }
    }

    function onLoginSuccess(user) {
      store.setAuth(user.token, user)
      if (user.roles?.includes('ADMIN')) {
        window.location.hash = '#/admin/dashboard'
      } else {
        window.location.hash = '#/home'
      }
    }

    function logout() {
      store.clearAuth()
      window.location.hash = '#/login'
    }

    function updateCartCount(count) {
      store.cartCount.value = count
    }

    onMounted(() => {
      // 初始化：检查登录状态，加载购物车数量
      if (store.isLoggedIn.value && !store.isAdmin.value) {
        api.getCartList(store.currentUser.value.id, store.token.value)
          .then(list => { store.cartCount.value = list?.length || 0 })
          .catch(() => {})
      }
    })

    return {
      isLoginPage,
      isAdminRoute,
      isLoggedIn: store.isLoggedIn,
      currentUser: store.currentUser,
      cartCount: store.cartCount,
      goHome,
      toggleAdmin,
      onLoginSuccess,
      logout,
      updateCartCount
    }
  }
}
</script>

<style>
/* ==================== 全局样式 ==================== */
:root {
  --primary: #409eff;
  --primary-dark: #3a8ee6;
  --success: #67c23a;
  --warning: #e6a23c;
  --danger: #f56c6c;
  --info: #909399;
  --bg: #f5f7fa;
  --bg-white: #ffffff;
  --text: #303133;
  --text-secondary: #606266;
  --text-light: #909399;
  --border: #dcdfe6;
  --radius: 8px;
  --shadow: 0 2px 12px rgba(0,0,0,0.08);
  --header-height: 60px;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: 'Helvetica Neue', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  color: var(--text);
  background: var(--bg);
  line-height: 1.6;
}

a { color: var(--primary); text-decoration: none; }
a:hover { opacity: 0.8; }

/* ===== 布局 ===== */
#sm-app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.sm-header {
  height: var(--header-height);
  background: var(--bg-white);
  border-bottom: 1px solid var(--border);
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-inner {
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 24px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}
.logo-icon { font-size: 24px; }
.logo-text { font-size: 18px; font-weight: 700; color: var(--primary); }

.main-nav {
  display: flex;
  gap: 4px;
  flex: 1;
}
.main-nav a {
  padding: 8px 14px;
  color: var(--text-secondary);
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
  position: relative;
}
.main-nav a:hover,
.main-nav a.router-link-active {
  color: var(--primary);
  background: rgba(64,158,255,0.08);
}
.badge {
  position: absolute;
  top: 2px;
  right: 2px;
  background: var(--danger);
  color: #fff;
  font-size: 11px;
  border-radius: 10px;
  padding: 1px 6px;
  min-width: 18px;
  text-align: center;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
.user-info { font-size: 14px; color: var(--text-secondary); }

.sm-main {
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 20px;
}
.sm-main.no-header { padding-top: 40px; }

.sm-footer {
  text-align: center;
  padding: 20px;
  color: var(--text-light);
  font-size: 13px;
  border-top: 1px solid var(--border);
  margin-top: 40px;
}

/* ===== 按钮 ===== */
button {
  cursor: pointer;
  border: none;
  outline: none;
  font-size: 14px;
  border-radius: 6px;
  padding: 8px 20px;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--primary);
  color: #fff;
}
.btn-primary:hover { background: var(--primary-dark); }

.btn-primary-sm {
  background: var(--primary);
  color: #fff;
  padding: 6px 14px;
  font-size: 13px;
  border-radius: 4px;
}
.btn-primary-sm:hover { background: var(--primary-dark); }

.btn-success { background: var(--success); color: #fff; }
.btn-danger { background: var(--danger); color: #fff; }
.btn-warning { background: var(--warning); color: #fff; }

.btn-text {
  background: transparent;
  color: var(--primary);
  padding: 6px 10px;
}
.btn-switch {
  background: var(--bg);
  color: var(--text-secondary);
  padding: 6px 12px;
  font-size: 12px;
}

.btn-sm { padding: 5px 12px; font-size: 12px; }

/* ===== 卡片 ===== */
.card {
  background: var(--bg-white);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 20px;
  margin-bottom: 16px;
}

/* ===== 表单 ===== */
.form-group {
  margin-bottom: 16px;
}
.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
}

input, textarea, select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 14px;
  color: var(--text);
  transition: border-color 0.2s;
  outline: none;
  background: #fff;
}
input:focus, textarea:focus, select:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(64,158,255,0.15);
}

/* ===== 表格 ===== */
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
th, td {
  padding: 12px 14px;
  text-align: left;
  border-bottom: 1px solid var(--border);
}
th {
  background: var(--bg);
  font-weight: 600;
  color: var(--text-secondary);
}
tr:hover td { background: #fafafa; }

/* ===== 标签 ===== */
.tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}
.tag-success { background: rgba(103,194,58,0.12); color: var(--success); }
.tag-warning { background: rgba(230,162,60,0.12); color: var(--warning); }
.tag-danger { background: rgba(245,108,108,0.12); color: var(--danger); }
.tag-info { background: rgba(144,147,153,0.12); color: var(--info); }
.tag-primary { background: rgba(64,158,255,0.12); color: var(--primary); }

/* ===== 分页 ===== */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  margin-top: 20px;
}
.pagination button {
  background: #fff;
  border: 1px solid var(--border);
  padding: 6px 12px;
  font-size: 13px;
  border-radius: 4px;
}
.pagination button.active {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
}
.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ===== 搜索栏 ===== */
.search-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  align-items: center;
  flex-wrap: wrap;
}
.search-bar input,
.search-bar select {
  width: auto;
  min-width: 180px;
}

/* ===== 商品卡片网格 ===== */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}

.product-card {
  background: #fff;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}
.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.12);
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
  color: #ccc;
}
.product-card .info {
  padding: 14px;
}
.product-card .name {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.product-card .subtitle {
  font-size: 12px;
  color: var(--text-light);
  margin-bottom: 8px;
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
  color: var(--danger);
  font-size: 18px;
  font-weight: 700;
}
.product-card .price::before { content: '¥'; font-size: 13px; }
.product-card .sales {
  font-size: 12px;
  color: var(--text-light);
}

/* ===== 管理端模式 ===== */
.admin-mode .sm-header {
  border-bottom: 2px solid var(--warning);
}
.admin-mode .logo-text {
  color: var(--warning);
}

/* ===== 弹窗/对话框 ===== */
.dialog-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.dialog {
  background: #fff;
  border-radius: var(--radius);
  padding: 24px;
  min-width: 420px;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0,0,0,0.16);
}
.dialog h3 {
  font-size: 18px;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}
.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}

/* ===== 加载状态 ===== */
.loading-text {
  text-align: center;
  color: var(--text-light);
  padding: 60px 0;
  font-size: 14px;
}

/* ===== 空状态 ===== */
.empty-state {
  text-align: center;
  padding: 60px 0;
  color: var(--text-light);
}
.empty-state .icon { font-size: 48px; margin-bottom: 12px; }
.empty-state p { font-size: 14px; }

/* ===== 提示消息 ===== */
.toast {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  border-radius: 6px;
  color: #fff;
  font-size: 14px;
  z-index: 2000;
  animation: toastIn 0.3s ease;
}
.toast-success { background: var(--success); }
.toast-error { background: var(--danger); }
.toast-warning { background: var(--warning); }

@keyframes toastIn {
  from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}

/* ===== 响应式 ===== */
@media (max-width: 768px) {
  .header-inner { gap: 10px; padding: 0 10px; }
  .main-nav a { padding: 6px 8px; font-size: 12px; }
  .sm-main { padding: 12px; }
  .product-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; }
  table { font-size: 12px; }
  th, td { padding: 8px 6px; }
  .dialog { min-width: auto; width: 90%; }
}

@media (max-width: 480px) {
  .search-bar { flex-direction: column; }
  .search-bar input, .search-bar select { width: 100%; }
}
</style>
