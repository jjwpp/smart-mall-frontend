// ==================== Smart Mall - 路由配置 ====================
import { createRouter, createWebHashHistory } from 'vue-router'
import { useUserStore } from '../stores/user'

const routes = [
  // ---- 公共页面 ----
  { path: '/', redirect: '/home' },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { title: '登录', noAuth: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue'),
    meta: { title: '注册', noAuth: true }
  },

  // ---- 用户端页面 ----
  {
    path: '/home',
    name: 'Home',
    component: () => import('../views/user/Home.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/products',
    name: 'ProductList',
    component: () => import('../views/user/ProductList.vue'),
    meta: { title: '商品列表' }
  },
  {
    path: '/products/:id',
    name: 'ProductDetail',
    component: () => import('../views/user/ProductDetail.vue'),
    meta: { title: '商品详情' }
  },
  {
    path: '/cart',
    name: 'Cart',
    component: () => import('../views/user/Cart.vue'),
    meta: { title: '购物车' }
  },
  {
    path: '/orders',
    name: 'MyOrders',
    component: () => import('../views/user/MyOrders.vue'),
    meta: { title: '我的订单' }
  },
  {
    path: '/orders/:id',
    name: 'OrderDetail',
    component: () => import('../views/user/OrderDetail.vue'),
    meta: { title: '订单详情' }
  },
  {
    path: '/payments/:orderId',
    name: 'Pay',
    component: () => import('../views/user/Pay.vue'),
    meta: { title: '支付订单' }
  },
  {
    path: '/addresses',
    name: 'Addresses',
    component: () => import('../views/user/Addresses.vue'),
    meta: { title: '收货地址' }
  },
  {
    path: '/payments',
    name: 'MyPayments',
    component: () => import('../views/user/MyPayments.vue'),
    meta: { title: '支付记录' }
  },
  {
    path: '/reviews',
    name: 'MyReviews',
    component: () => import('../views/user/MyReviews.vue'),
    meta: { title: '我的评价' }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/user/Profile.vue'),
    meta: { title: '个人中心' }
  },
  {
    path: '/coupons',
    name: 'CouponCenter',
    component: () => import('../views/user/CouponCenter.vue'),
    meta: { title: '领券中心' }
  },
  {
    path: '/my-coupons',
    name: 'MyCoupons',
    component: () => import('../views/user/MyCoupons.vue'),
    meta: { title: '我的优惠券' }
  },
      {
        path: '/after-sales',
        name: 'MyAfterSales',
        component: () => import('../views/user/MyAfterSales.vue'),
        meta: { title: '我的售后' }
      },
      {
        path: '/after-sales/apply/:orderId',
        name: 'AfterSaleApply',
        component: () => import('../views/user/AfterSaleApply.vue'),
        meta: { title: '申请售后' }
      },
      {
        path: '/after-sales/:id',
        name: 'AfterSaleDetail',
        component: () => import('../views/user/AfterSaleDetail.vue'),
        meta: { title: '售后详情' }
      },
  {
    path: '/ai',
    name: 'AiChat',
    component: () => import('../views/user/AiChat.vue'),
    meta: { title: 'AI 智能助手' }
  },

  // ---- 管理端页面 (AdminLayout 包裹) ----
  {
    path: '/admin',
    component: () => import('../components/AdminLayout.vue'),
    redirect: '/admin/dashboard',
    meta: { admin: true },
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('../views/admin/Dashboard.vue'),
        meta: { title: '管理控制台' }
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('../views/admin/Users.vue'),
        meta: { title: '用户管理' }
      },
      {
        path: 'roles',
        name: 'AdminRoles',
        component: () => import('../views/admin/Roles.vue'),
        meta: { title: '角色管理' }
      },
      {
        path: 'products',
        name: 'AdminProducts',
        component: () => import('../views/admin/Products.vue'),
        meta: { title: '商品管理' }
      },
      {
        path: 'products/:productId/skus',
        name: 'AdminSkus',
        component: () => import('../views/admin/SkuManage.vue'),
        meta: { title: 'SKU管理' }
      },
      {
        path: 'categories',
        name: 'AdminCategories',
        component: () => import('../views/admin/Categories.vue'),
        meta: { title: '分类管理' }
      },
      {
        path: 'orders',
        name: 'AdminOrders',
        component: () => import('../views/admin/Orders.vue'),
        meta: { title: '订单管理' }
      },
      {
        path: 'payments',
        name: 'AdminPayments',
        component: () => import('../views/admin/Payments.vue'),
        meta: { title: '支付管理' }
      },
      {
        path: 'reviews',
        name: 'AdminReviews',
        component: () => import('../views/admin/Reviews.vue'),
        meta: { title: '评价管理' }
      },
      {
        path: 'after-sales',
        name: 'AdminAfterSales',
        component: () => import('../views/admin/AfterSales.vue'),
        meta: { title: '售后管理' }
      },
      {
        path: 'coupons',
        name: 'AdminCoupons',
        component: () => import('../views/admin/Coupons.vue'),
        meta: { title: '优惠券管理' }
      }
    ]
  },

  // ---- 404 ----
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue'),
    meta: { title: '404', noAuth: true }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

// 路由守卫：鉴权 + 管理端权限校验
router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - Smart Mall` : 'Smart Mall'

  const userStore = useUserStore()

  // 无需登录的页面直接放行
  if (to.meta.noAuth) {
    return next()
  }

  // 需要登录但未登录 → 跳转登录页
  if (!userStore.isLoggedIn) {
    return next({ name: 'Login', query: { redirect: to.fullPath } })
  }

  // 管理端页面需要管理员角色（检查 matched 路由链，meta.admin 在父级 /admin 上）
  if (to.matched.some(r => r.meta.admin) && !userStore.currentUser?.roles?.includes('ADMIN')) {
    return next({ name: 'Home' })
  }

  // 管理员不能进入用户端页面
  if (!to.matched.some(r => r.meta.admin) && userStore.currentUser?.roles?.includes('ADMIN') &&
      to.name !== 'Home' && to.name !== 'AdminDashboard') {
    return next({ name: 'AdminDashboard' })
  }

  next()
})

export default router
