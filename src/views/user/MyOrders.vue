<!-- ==================== 我的订单页 ==================== -->
<template>
  <div class="my-orders">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">我的订单</h2>
    </div>

    <!-- 状态筛选 - 横向滚动 tabs -->
    <div class="tabs-scroll">
      <div class="tabs-wrapper">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          :class="['tab-item', { active: filterStatus === tab.value }]"
          @click="filterStatus = tab.value; pageNum = 1; fetchOrders()"
        >
          <span class="tab-label">{{ tab.label }}</span>
        </button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <span class="spinner"></span>
      <p>加载中...</p>
    </div>

    <!-- 空状态 -->
    <div v-else-if="!orders.length" class="empty-state">
      <div class="empty-illustration">
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="20" y="30" width="80" height="65" rx="8" stroke="#d9d9d9" stroke-width="2.5" fill="#fafafa"/>
          <line x1="20" y1="42" x2="100" y2="42" stroke="#d9d9d9" stroke-width="2.5"/>
          <line x1="35" y1="56" x2="85" y2="56" stroke="#e8e8e8" stroke-width="2" stroke-linecap="round"/>
          <line x1="35" y1="66" x2="70" y2="66" stroke="#e8e8e8" stroke-width="2" stroke-linecap="round"/>
          <line x1="35" y1="76" x2="60" y2="76" stroke="#e8e8e8" stroke-width="2" stroke-linecap="round"/>
          <circle cx="95" cy="85" r="18" fill="#f6f6f6" stroke="#d9d9d9" stroke-width="2"/>
          <line x1="89" y1="85" x2="101" y2="85" stroke="#d9d9d9" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
      <p class="empty-text">暂无订单</p>
      <p class="empty-hint">快去挑选心仪的商品吧</p>
    </div>

    <!-- 订单列表 -->
    <div v-else class="order-list">
      <div
        v-for="o in orders"
        :key="o.id"
        class="order-card"
        @click="$router.push(`/orders/${o.id}`)"
      >
        <!-- 卡片头部：订单号 + 状态 -->
        <div class="card-header">
          <div class="order-no">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            <span>{{ o.orderNo }}</span>
          </div>
          <span :class="['status-badge', statusBadgeClass(o.status)]">{{ statusText(o.status) }}</span>
        </div>

        <!-- 卡片中部：商品缩略图 -->
        <div class="card-body">
          <div class="product-items">
            <div v-for="item in (o.items || []).slice(0, 3)" :key="item.id" class="product-item">
              <div class="product-thumb">
                <img
                  v-if="item.productImage"
                  :src="item.productImage"
                  :alt="item.productName"
                  class="thumb-img"
                />
                <svg v-else width="32" height="32" viewBox="0 0 60 60" fill="none" class="thumb-placeholder">
                  <rect width="60" height="60" rx="8" fill="#f6f6f6"/>
                  <path d="M18 42L26 30L34 38L42 26L52 42H18Z" fill="#e0e0e0"/>
                  <circle cx="24" cy="20" r="5" fill="#e0e0e0"/>
                </svg>
              </div>
              <div class="product-name-qty">
                <span class="product-name">{{ item.productName }}</span>
                <span class="product-qty">x{{ item.quantity }}</span>
              </div>
            </div>
            <div v-if="(o.items || []).length > 3" class="product-more">
              +{{ (o.items || []).length - 3 }} 件
            </div>
          </div>
        </div>

        <!-- 卡片底部：总价 + 操作 -->
        <div class="card-footer">
          <div class="order-total">
            <span class="total-label">合计</span>
            <span class="total-price">¥{{ (o.payAmount || o.totalAmount || 0).toFixed(2) }}</span>
          </div>
          <div class="card-actions" @click.stop>
            <!-- 待付款：去付款 + 取消 -->
            <template v-if="o.status === 'PENDING_PAYMENT'">
              <button class="action-btn action-primary" @click="$router.push(`/payments/${o.id}`)">
                去付款
              </button>
              <button class="action-btn action-ghost" @click="handleCancel(o.id)">
                取消
              </button>
            </template>
            <!-- 已发货：确认收货 -->
            <button v-else-if="o.status === 'SHIPPED'" class="action-btn action-primary" @click="$router.push(`/orders/${o.id}`)">
              确认收货
            </button>
            <!-- 已完成：申请售后 + 评价 + 再次购买 -->
            <template v-else-if="o.status === 'COMPLETED'">
              <button class="action-btn action-ghost" @click="$router.push(`/orders/${o.id}`)">
                评价
              </button>
              <button class="action-btn action-outline" @click="$router.push(`/after-sales/apply/${o.id}`)">
                申请售后
              </button>
              <button class="action-btn action-outline" @click="$router.push('/products')">
                再次购买
              </button>
            </template>
            <!-- 已付款：查看详情 -->
            <button v-else-if="o.status === 'PAID'" class="action-btn action-outline" @click="$router.push(`/orders/${o.id}`)">
              查看详情
            </button>
            <!-- 其他状态 -->
            <button v-else class="action-btn action-outline" @click="$router.push(`/orders/${o.id}`)">
              查看详情
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination-wrap" v-if="totalPages > 1">
      <button :disabled="pageNum <= 1" @click="pageNum--; fetchOrders()" class="page-btn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <template v-for="i in totalPages" :key="i">
        <button
          v-if="i === 1 || i === totalPages || Math.abs(i - pageNum) <= 1"
          :class="['page-btn', { active: i === pageNum }]"
          @click="pageNum = i; fetchOrders()"
        >{{ i }}</button>
        <span v-else-if="i === 2 || i === totalPages - 1" class="page-dots">...</span>
      </template>
      <button :disabled="pageNum >= totalPages" @click="pageNum++; fetchOrders()" class="page-btn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '../../stores/user'
import { api } from '../../utils/api'

const userStore = useUserStore()
const orders = ref([])
const loading = ref(false)
const filterStatus = ref('')
const pageNum = ref(1)
const pageSize = ref(10)
const totalPages = ref(0)

const statusMap = {
  PENDING_PAYMENT: '待付款', PAID: '已付款', SHIPPED: '已发货',
  COMPLETED: '已完成', CANCELLED: '已取消', REFUNDED: '已退款'
}
const statusClassMap = {
  PENDING_PAYMENT: 'tag-warning', PAID: 'tag-info', SHIPPED: 'tag-primary',
  COMPLETED: 'tag-success', CANCELLED: 'tag-danger', REFUNDED: 'tag-refunded'
}

function statusText(s) { return statusMap[s] || s }
function statusClass(s) { return 'tag ' + (statusClassMap[s] || 'tag-info') }

const statusBadgeMap = {
  PENDING_PAYMENT: 'badge-orange', PAID: 'badge-blue', SHIPPED: 'badge-purple',
  COMPLETED: 'badge-green', CANCELLED: 'badge-gray', REFUNDED: 'badge-orange'
}
function statusBadgeClass(s) { return statusBadgeMap[s] || 'badge-gray' }

const tabs = [
  { label: '全部', value: '' },
  { label: '待付款', value: 'PENDING_PAYMENT' },
  { label: '已付款', value: 'PAID' },
  { label: '已发货', value: 'SHIPPED' },
  { label: '已完成', value: 'COMPLETED' },
  { label: '已退款', value: 'REFUNDED' }
]

async function fetchOrders() {
  loading.value = true
  try {
    const params = { userId: userStore.userId, pageNum: pageNum.value, pageSize: pageSize.value }
    if (filterStatus.value) params.status = filterStatus.value
    const data = await api.getUserOrders(params, userStore.token)
    orders.value = data?.records || []
    totalPages.value = data?.pages || Math.ceil((data?.total || 0) / pageSize.value)
  } catch { orders.value = [] }
  finally { loading.value = false }
}

async function handleCancel(id) {
  if (!confirm('确定要取消该订单吗？')) return
  try {
    await api.cancelOrder(id, userStore.token)
    fetchOrders()
  } catch (e) { alert(e.message) }
}

onMounted(fetchOrders)
</script>

<style scoped>
.my-orders {
  max-width: 720px;
  margin: 0 auto;
  padding-bottom: 32px;
}

/* 页面标题 */
.page-header {
  margin-bottom: 20px;
}
.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ===== 横向滚动标签栏 ===== */
.tabs-scroll {
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  margin-bottom: 16px;
  -webkit-overflow-scrolling: touch;
}
.tabs-scroll::-webkit-scrollbar {
  display: none;
}
.tabs-wrapper {
  display: flex;
  gap: 8px;
  padding-bottom: 4px;
}
.tab-item {
  flex-shrink: 0;
  padding: 10px 20px;
  border: none;
  border-radius: 22px;
  background: #fff;
  color: #666;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  white-space: nowrap;
}
.tab-item:hover {
  color: #ff2442;
  background: #fff5f6;
}
.tab-item.active {
  background: #ff2442;
  color: #fff;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(255,36,66,0.25);
}
.tab-label {
  position: relative;
}

/* ===== 加载状态 ===== */
.loading-state {
  text-align: center;
  padding: 100px 0;
  color: #999;
}
.loading-state p {
  margin-top: 16px;
  font-size: 14px;
}
.spinner {
  display: inline-block;
  width: 36px;
  height: 36px;
  border: 3px solid #f0f0f0;
  border-top-color: #ff2442;
  border-radius: 50%;
  animation: rotate 0.8s linear infinite;
}
@keyframes rotate {
  to { transform: rotate(360deg); }
}

/* ===== 空状态 ===== */
.empty-state {
  text-align: center;
  padding: 80px 24px;
}
.empty-illustration {
  margin-bottom: 20px;
}
.empty-text {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 6px;
}
.empty-hint {
  font-size: 13px;
  color: #999;
}

/* ===== 订单卡片列表 ===== */
.order-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.order-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  overflow: hidden;
  cursor: pointer;
  transition: box-shadow 0.25s ease, transform 0.25s ease;
}
.order-card:hover {
  box-shadow: 0 4px 18px rgba(0,0,0,0.08);
  transform: translateY(-1px);
}

/* 卡片头部 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid #f5f5f5;
}
.order-no {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #666;
}
.order-no svg {
  color: #999;
  flex-shrink: 0;
}

/* 状态徽章 */
.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.2px;
}
.badge-orange {
  background: #fff7e6;
  color: #ffb800;
}
.badge-blue {
  background: #e6f7ff;
  color: #1890ff;
}
.badge-purple {
  background: #f9f0ff;
  color: #722ed1;
}
.badge-green {
  background: #e6fae9;
  color: #07c160;
}
.badge-gray {
  background: #f5f5f5;
  color: #999;
}

/* 卡片中部：商品 */
.card-body {
  padding: 12px 16px;
}
.product-items {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.product-item {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fafafa;
  border-radius: 8px;
  padding: 8px 10px;
  flex: 1;
  min-width: 180px;
}
.product-thumb {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: #f6f6f6;
  display: flex;
  align-items: center;
  justify-content: center;
}
.thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.thumb-placeholder {
  display: block;
  width: 60px;
  height: 60px;
}
.product-name-qty {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.product-name {
  font-size: 13px;
  color: #1a1a1a;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.product-qty {
  font-size: 12px;
  color: #999;
}
.product-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 14px;
  background: #f6f6f6;
  border-radius: 8px;
  font-size: 12px;
  color: #999;
  white-space: nowrap;
}

/* 卡片底部 */
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px 16px;
  border-top: 1px solid #f5f5f5;
}
.order-total {
  display: flex;
  align-items: baseline;
  gap: 6px;
}
.total-label {
  font-size: 12px;
  color: #999;
}
.total-price {
  font-size: 18px;
  font-weight: 700;
  color: #ff2442;
}

/* 操作按钮 */
.card-actions {
  display: flex;
  gap: 8px;
}
.action-btn {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}
.action-primary {
  background: linear-gradient(135deg, #ff2442, #ff4d64);
  color: #fff;
  box-shadow: 0 3px 10px rgba(255,36,66,0.2);
}
.action-primary:hover {
  box-shadow: 0 5px 16px rgba(255,36,66,0.3);
  transform: translateY(-1px);
}
.action-ghost {
  background: transparent;
  color: #666;
  border: 1px solid #e0e0e0;
}
.action-ghost:hover {
  color: #ff2442;
  border-color: #ff2442;
  background: #fff5f6;
}
.action-outline {
  background: transparent;
  color: #ff2442;
  border: 1px solid #ff2442;
}
.action-outline:hover {
  background: #fff5f6;
}

/* ===== 分页 ===== */
.pagination-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  margin-top: 24px;
  padding-top: 20px;
}
.page-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #fff;
  color: #666;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.page-btn:hover:not(:disabled) {
  border-color: #ff2442;
  color: #ff2442;
}
.page-btn.active {
  background: #ff2442;
  color: #fff;
  border-color: #ff2442;
  font-weight: 600;
}
.page-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
.page-dots {
  width: 36px;
  text-align: center;
  color: #ccc;
  font-size: 14px;
  user-select: none;
}

/* ===== 响应式 ===== */
@media (max-width: 768px) {
  .my-orders {
    max-width: 100%;
    padding: 0 0 24px;
  }
  .page-title {
    font-size: 20px;
  }
  .tab-item {
    padding: 8px 16px;
    font-size: 13px;
  }
  .order-card {
    border-radius: 10px;
  }
  .card-footer {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
  .card-actions {
    justify-content: flex-end;
  }
  .product-item {
    min-width: 100%;
  }
}
</style>
