// ==================== Smart Mall - API 封装层 ====================
// 后端服务地址（开发环境通过 Vite proxy 转发，生产环境需配置实际地址）
const BASE_URLS = {
  system: 'http://localhost:8201',   // 系统服务：认证、用户、角色、地址
  product: 'http://localhost:8202',  // 商品服务：商品、分类、SKU、评价
  trade: 'http://localhost:8203'     // 交易服务：购物车、订单、支付
}

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl
  }

  async request(method, path, options = {}) {
    const { body, params, token } = options
    let url = `${this.baseUrl}${path}`

    // 使用 Vite proxy 时，开发环境直接用相对路径
    // 生产环境使用完整 URL
    if (import.meta.env.DEV) {
      url = path
    }

    if (params) {
      const qs = new URLSearchParams()
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          qs.append(key, val)
        }
      })
      const qsStr = qs.toString()
      if (qsStr) url += `?${qsStr}`
    }

    const headers = {}
    if (token) headers['Authorization'] = `Bearer ${token}`
    // FormData 不需要设置 Content-Type，浏览器会自动设置 boundary
    if (!(body instanceof FormData)) {
      headers['Content-Type'] = 'application/json'
    }

    const res = await fetch(url, {
      method,
      headers,
      body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined)
    })

    // 检查 HTTP 状态
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`)
    }

    const json = await res.json()

    // 检查业务状态码（后端使用 Result<T> 统一返回）
    if (json.code !== 200 && json.code !== 0 && json.code !== undefined) {
      throw new Error(json.message || '请求失败')
    }

    return json.data ?? json
  }

  get(path, params, token)    { return this.request('GET', path, { params, token }) }
  post(path, body, token)     { return this.request('POST', path, { body, token }) }
  put(path, body, token)      { return this.request('PUT', path, { body, token }) }
  delete(path, params, token) { return this.request('DELETE', path, { params, token }) }
}

// 各服务实例
const systemApi = new ApiClient(BASE_URLS.system)
const productApi = new ApiClient(BASE_URLS.product)
const tradeApi = new ApiClient(BASE_URLS.trade)

// ==================== API 接口集合 ====================
export const api = {
  // ---- 认证 ----
  getCaptcha: () => systemApi.get('/admin/login/captcha'),
  login: (data) => systemApi.post('/admin/login', data),
  // 邮箱验证码登录
  sendEmailCode: (data) => systemApi.post('/admin/login/sendEmailCode', data),
  emailLogin: (data) => systemApi.post('/admin/login/emailLogin', data),
  register: (data) => systemApi.post('/api/auth/register', data),
  getUserInfo: (token) => systemApi.get('/api/auth/me', null, token),

  // ---- 用户端：商品 ----
  getProducts: (params) => productApi.get('/user/products', params),
  getProductDetail: (id) => productApi.get(`/user/products/${id}`),
  getProductSkus: (id) => productApi.get(`/user/products/${id}/skus`),
  getCategories: () => productApi.get('/user/products/categories'),

  // ---- 用户端：购物车 ----
  getCartList: (userId, token) => tradeApi.get('/user/cart', { userId }, token),
  addToCart: (data, token) => tradeApi.post('/user/cart', data, token),
  updateCartItem: (id, data, token) => tradeApi.put(`/user/cart/${id}`, data, token),
  deleteCartItem: (id, token) => tradeApi.delete(`/user/cart/${id}`, null, token),
  clearCart: (userId, token) => tradeApi.delete('/user/cart/clear', { userId }, token),

  // ---- 用户端：订单 ----
  getUserOrders: (params, token) => tradeApi.get('/user/orders', params, token),
  getOrderDetail: (id, token) => tradeApi.get(`/user/orders/${id}`, null, token),
  getOrderItems: (id, token) => tradeApi.get(`/user/orders/${id}/items`, null, token),
  createOrder: (data, token) => tradeApi.post('/user/orders', data, token),
  checkout: (data, token) => tradeApi.post('/user/orders/checkout', data, token),
  cancelOrder: (id, token) => tradeApi.put(`/user/orders/${id}/cancel`, null, token),
  confirmReceive: (id, token) => tradeApi.put(`/user/orders/${id}/confirm`, null, token),

  // ---- 用户端：地址 ----
  getUserAddresses: (userId, token) => systemApi.get('/user/addresses', { userId }, token),
  createAddress: (data, token) => systemApi.post('/user/addresses', data, token),
  updateAddress: (id, data, token) => systemApi.put(`/user/addresses/${id}`, data, token),
  deleteAddress: (id, token) => systemApi.delete(`/user/addresses/${id}`, null, token),

  // ---- 用户端：支付 ----
  getUserPayments: (params, token) => tradeApi.get('/user/payments', params, token),
  payOrder: (data, token) => tradeApi.post('/user/payments', data, token),
  getPaymentByOrder: (orderId, token) => tradeApi.get(`/user/payments/order/${orderId}`, null, token),
  executePay: (paymentId, token) => tradeApi.post(`/user/payments/${paymentId}/pay`, null, token),
  payByOrderId: (orderId, token) => tradeApi.post(`/user/orders/${orderId}/pay`, null, token),
  createAlipayQrCode: (orderId, token) => {
    const url = `/api/pay/qrcode/${orderId}`
    return fetch(url, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json()).then(r => r.data?.qrCode || r.qrCode)
  },
  queryPayStatus: (orderId, token) => {
    const url = `/api/pay/status/${orderId}`
    return fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json()).then(r => r.data)
  },

  // ---- 用户端：评价 ----
  getProductReviews: (productId) => productApi.get(`/user/reviews/product/${productId}`),
  createReview: (data, token) => productApi.post('/user/reviews', data, token),
  getMyReviews: (userId, token) => productApi.get('/user/reviews/mine', { userId }, token),

  // ---- 管理端：用户 ----
  getAdminUsers: (params, token) => systemApi.get('/admin/users', params, token),
  createUser: (data, token) => systemApi.post('/admin/users', data, token),
  updateUser: (id, data, token) => systemApi.put(`/admin/users/${id}`, data, token),
  deleteUser: (id, token) => systemApi.delete(`/admin/users/${id}`, null, token),

  // ---- 管理端：角色 ----
  getAdminRoles: (params, token) => systemApi.get('/admin/roles', params, token),
  createRole: (data, token) => systemApi.post('/admin/roles', data, token),
  updateRole: (id, data, token) => systemApi.put(`/admin/roles/${id}`, data, token),
  deleteRole: (id, token) => systemApi.delete(`/admin/roles/${id}`, null, token),

  // ---- 管理端：用户-角色 ----
  getUserRoles: (userId, token) => systemApi.get('/admin/user-roles', { userId }, token),
  assignUserRole: (data, token) => systemApi.post('/admin/user-roles', data, token),
  removeUserRole: (userId, roleId, token) =>
    systemApi.delete('/admin/user-roles', { userId, roleId }, token),

  // ---- 文件上传（参考 lease 模式：先上传获取URL，再保存） ----
  uploadFile: (file, token) => {
    const formData = new FormData()
    formData.append('file', file)
    return productApi.post('/admin/file/upload', formData, token)
  },

  // ---- 管理端：商品 ----
  getAdminProducts: (params, token) => productApi.get('/admin/products', params, token),
  getAdminProductDetail: (id, token) => productApi.get(`/admin/products/${id}`, null, token),
  // data 可以是普通 JSON 对象，也可以是 FormData（上传文件时使用）
  createProduct: (data, token) => productApi.post('/admin/products', data, token),
  updateProduct: (id, data, token) => productApi.put(`/admin/products/${id}`, data, token),
  updateProductStatus: (id, status, token) =>
    productApi.put(`/admin/products/${id}/status`, null, { params: { status }, token }),
  deleteProduct: (id, token) => productApi.delete(`/admin/products/${id}`, null, token),

  // ---- 管理端：分类 ----
  getAdminCategories: (params, token) => productApi.get('/admin/categories', params, token),
  createCategory: (data, token) => productApi.post('/admin/categories', data, token),
  updateCategory: (id, data, token) => productApi.put(`/admin/categories/${id}`, data, token),
  deleteCategory: (id, token) => productApi.delete(`/admin/categories/${id}`, null, token),

  // ---- 管理端：SKU ----
  getAdminSkus: (productId, token) => productApi.get(`/admin/products/${productId}/skus`, null, token),
  createSku: (productId, data, token) =>
    productApi.post(`/admin/products/${productId}/skus`, data, token),
  updateSku: (productId, id, data, token) =>
    productApi.put(`/admin/products/${productId}/skus/${id}`, data, token),
  deleteSku: (productId, id, token) =>
    productApi.delete(`/admin/products/${productId}/skus/${id}`, null, token),

  // ---- 管理端：订单 ----
  getAdminOrders: (params, token) => tradeApi.get('/admin/orders', params, token),
  updateOrderStatus: (id, status, token) =>
    tradeApi.request('PUT', `/admin/orders/${id}/status?status=${status}`, { token }),

  // ---- 管理端：支付 ----
  getAdminPayments: (params, token) => tradeApi.get('/admin/payments', params, token),

  // ---- 管理端：评价 ----
  getAdminReviews: (params, token) => productApi.get('/admin/reviews', params, token),
  deleteReview: (id, token) => productApi.delete(`/admin/reviews/${id}`, null, token),

  // ---- 管理端：优惠券 ----
  getAdminCoupons: (params, token) => systemApi.get('/admin/coupons', params, token),
  createCoupon: (data, token) => systemApi.post('/admin/coupons', data, token),
  updateCoupon: (id, data, token) => systemApi.put(`/admin/coupons/${id}`, data, token),
  deleteCoupon: (id, token) => systemApi.delete(`/admin/coupons/${id}`, null, token),

  // ---- 用户端：售后 ----
  getMyAfterSales: (params, token) => tradeApi.get('/user/after-sales', params, token),
  getAfterSaleDetail: (id, token) => tradeApi.get(`/user/after-sales/${id}`, null, token),
  createAfterSale: (data, token) => tradeApi.post('/user/after-sales', data, token),
  cancelAfterSale: (id, userId, token) => tradeApi.request('PUT', `/user/after-sales/${id}/cancel`, { params: { userId }, token }),

  // ---- 管理端：售后 ----
  getAdminAfterSales: (params, token) => systemApi.get('/admin/after-sales', params, token),
  getAdminAfterSaleDetail: (id, token) => systemApi.get(`/admin/after-sales/${id}`, null, token),
  auditAfterSale: (id, data, token) => systemApi.request('PUT', `/admin/after-sales/${id}/audit`, { params: data, token }),
  completeAfterSale: (id, token) => systemApi.put(`/admin/after-sales/${id}/complete`, null, token),

  // ---- 用户端：优惠券 ----
  getAvailableCoupons: (userId) => productApi.get('/user/coupons', { userId }),
  receiveCoupon: (userId, couponId, token) => productApi.request('POST', `/user/coupons/${couponId}/receive?userId=${userId}`, { token }),
  getMyCoupons: (userId, token) => productApi.get('/user/my-coupons', { userId }, token),
  getUsableCoupons: (userId, totalAmount, token) => productApi.get('/user/coupons/usable', { userId, totalAmount }, token),

  // ---- AI 智能助手 (8203) ----
  // SSE 流式聊天（不走 ApiClient，直接 fetch 处理流）
  chatStream: (data, token) => {
    const url = '/api/ai/chat/stream'
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    })
  },
  getAiSessions: (token) => {
    const url = '/api/ai/sessions'
    return fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json()).then(r => r.data)
  },
  getAiMessages: (sessionId, token) => {
    const url = `/api/ai/sessions/${sessionId}/messages`
    return fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json()).then(r => r.data)
  },
  deleteAiSession: (sessionId, token) => {
    const url = `/api/ai/sessions/${sessionId}`
    return fetch(url, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json())
  }
}
