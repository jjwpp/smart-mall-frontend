<!-- ==================== 订单详情页 ==================== -->
<template>
  <div class="order-detail" v-if="!loading">
    <div v-if="!order" class="empty-state">
      <svg width="80" height="80" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="50" r="30" stroke="#d9d9d9" stroke-width="2.5" fill="#fafafa"/>
        <line x1="48" y1="50" x2="72" y2="50" stroke="#d9d9d9" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="60" y1="38" x2="60" y2="62" stroke="#d9d9d9" stroke-width="2.5" stroke-linecap="round"/>
        <text x="60" y="105" text-anchor="middle" fill="#999" font-size="13">订单不存在</text>
      </svg>
    </div>

    <template v-else>
      <!-- 页面标题 -->
      <div class="page-header">
        <button class="back-btn" @click="$router.back()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <h2 class="page-title">订单详情</h2>
      </div>

      <!-- ===== 状态追踪器 ===== -->
      <div class="status-tracker card">
        <div class="tracker-steps">
          <div
            v-for="(step, idx) in trackerSteps"
            :key="step.status"
            :class="['tracker-step', { done: step.done, current: step.current }]"
          >
            <div class="step-dot">
              <svg v-if="step.done" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
              <span v-else class="dot-inner"></span>
            </div>
            <div class="step-label">{{ step.label }}</div>
            <div v-if="step.date" class="step-date">{{ step.date }}</div>
          </div>
        </div>
      </div>

      <!-- ===== 订单信息卡片 ===== -->
      <div class="card info-card">
        <h3 class="card-section-title">订单信息</h3>
        <div class="info-grid">
          <div class="info-row">
            <span class="info-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </span>
            <span class="info-label">订单号</span>
            <span class="info-value">{{ order.orderNo }}</span>
          </div>
          <div class="info-row">
            <span class="info-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </span>
            <span class="info-label">创建时间</span>
            <span class="info-value">{{ order.createdAt?.slice(0, 16) || '-' }}</span>
          </div>
          <div class="info-row">
            <span class="info-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </span>
            <span class="info-label">状态</span>
            <span :class="['status-badge', statusBadge(order.status)]">{{ statusText(order.status) }}</span>
          </div>
          <div class="info-row">
            <span class="info-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
            </span>
            <span class="info-label">订单金额</span>
            <span class="info-value total-price">¥{{ (order.payAmount || order.totalAmount || 0).toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <!-- ===== 支付记录卡片 ===== -->
      <div v-if="paymentRecord" class="card info-card payment-record">
        <h3 class="card-section-title">支付信息</h3>
        <div class="info-grid">
          <div class="info-row">
            <span class="info-label">支付流水号</span>
            <span class="info-value">{{ paymentRecord.paymentNo }}</span>
          </div>
          <div v-if="paymentRecord.tradeNo" class="info-row">
            <span class="info-label">交易号</span>
            <span class="info-value">{{ paymentRecord.tradeNo }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">支付状态</span>
            <span :class="['status-badge', payStatusBadge(paymentRecord.status)]">{{ paymentStatusText(paymentRecord.status) }}</span>
            <span v-if="paymentRecord.paidAt" class="info-date">{{ paymentRecord.paidAt?.slice(0, 16) }}</span>
          </div>
        </div>
      </div>

      <!-- ===== 商品列表 ===== -->
      <div class="card">
        <h3 class="card-section-title">订单明细</h3>
        <div class="product-table">
          <div class="table-row table-header-row">
            <div class="col-product">商品信息</div>
            <div class="col-price">单价</div>
            <div class="col-qty">数量</div>
            <div class="col-subtotal">小计</div>
            <div v-if="order.status === 'COMPLETED' || order.status === 'REFUNDED'" class="col-action">评价</div>
          </div>
          <div v-for="item in items" :key="item.id" class="table-row">
            <div class="col-product">
              <div class="product-cell">
                <div class="p-thumb">
                  <img
                    v-if="item.productImage"
                    :src="item.productImage"
                    :alt="item.productName"
                    class="p-thumb-img"
                  />
                  <svg v-else width="36" height="36" viewBox="0 0 60 60" fill="none" class="p-thumb-placeholder">
                    <rect width="60" height="60" rx="8" fill="#f6f6f6"/>
                    <path d="M18 42L26 30L34 38L42 26L52 42H18Z" fill="#e0e0e0"/>
                  </svg>
                </div>
                <div class="p-info">
                  <span class="p-name">{{ item.productName }}</span>
                  <span v-if="item.skuName" class="p-sku">{{ item.skuName }}</span>
                </div>
              </div>
            </div>
            <div class="col-price">¥{{ (item.productPrice || 0).toFixed(2) }}</div>
            <div class="col-qty">x{{ item.quantity }}</div>
            <div class="col-subtotal subtotal-price">¥{{ ((item.productPrice || 0) * item.quantity).toFixed(2) }}</div>
            <div v-if="order.status === 'COMPLETED' || order.status === 'REFUNDED'" class="col-action">
              <button
                v-if="!reviewedItems[item.productId]"
                class="review-btn"
                @click="openReview(item)"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                评价
              </button>
              <span v-else class="reviewed-tag">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                已评价
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== 操作按钮栏 ===== -->
      <div class="action-bar">
        <div class="action-bar-inner">
          <button class="action-btn-back" @click="$router.back()">返回</button>
          <div class="action-bar-right">
            <button v-if="order.status === 'PENDING_PAYMENT'" class="action-btn action-btn-primary" @click="$router.push(`/payments/${order.id}`)">
              去付款
            </button>
            <button v-if="order.status === 'PENDING_PAYMENT'" class="action-btn action-btn-danger-ghost" @click="handleCancel">
              取消订单
            </button>
            <button v-if="order.status === 'SHIPPED'" class="action-btn action-btn-primary" @click="handleConfirmReceive">
              确认收货
            </button>
          </div>
        </div>
      </div>

      <!-- ===== 评价弹窗 ===== -->
      <div class="dialog-overlay" v-if="reviewingItem" @click.self="reviewingItem = null">
        <div class="review-dialog" @click.stop>
          <div class="dialog-header">
            <h3>评价商品</h3>
            <button class="dialog-close" @click="reviewingItem = null">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div class="dialog-body">
            <div class="review-product-card">
              <span class="review-pname">{{ reviewingItem.productName }}</span>
              <span v-if="reviewingItem.skuName" class="review-psku">{{ reviewingItem.skuName }}</span>
            </div>

            <!-- 星级评分 -->
            <div class="star-section">
              <span class="star-label">评分</span>
              <div class="stars-row">
                <button
                  v-for="s in 5"
                  :key="s"
                  :class="['star-btn', { active: s <= reviewRating }]"
                  @click="reviewRating = s"
                  @mouseenter="hoverStar = s"
                  @mouseleave="hoverStar = 0"
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" :fill="s <= (hoverStar || reviewRating) ? '#ffb800' : '#e0e0e0'" stroke="none">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                </button>
                <span class="star-hint">{{ ratingHints[reviewRating] || '点击星星评分' }}</span>
              </div>
            </div>

            <!-- 评价内容 -->
            <div class="form-group">
              <label>评价内容（选填）</label>
              <textarea
                v-model="reviewContent"
                placeholder="分享你的使用体验，帮助其他用户更好地了解这个商品..."
                rows="4"
                maxlength="500"
              ></textarea>
              <span class="char-count">{{ reviewContent.length }}/500</span>
            </div>
          </div>

          <div class="dialog-footer">
            <button class="btn-cancel" @click="reviewingItem = null">取消</button>
            <button class="btn-submit" :disabled="reviewRating === 0 || submittingReview" @click="submitReview">
              {{ submittingReview ? '提交中...' : '提交评价' }}
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>

  <div v-else class="loading-state">
    <span class="spinner"></span>
    <p>加载中...</p>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '../../stores/user'
import { api } from '../../utils/api'

const route = useRoute()
const userStore = useUserStore()
const order = ref(null)
const items = ref([])
const paymentRecord = ref(null)
const loading = ref(true)

// 评价状态
const reviewingItem = ref(null)
const reviewRating = ref(0)
const reviewContent = ref('')
const hoverStar = ref(0)
const submittingReview = ref(false)
const reviewedItems = reactive({})

const statusMap = { PENDING_PAYMENT: '待付款', PAID: '已付款', SHIPPED: '已发货', COMPLETED: '已完成', CANCELLED: '已取消', REFUNDED: '已退款' }
const statusClassMap = { PENDING_PAYMENT: 'tag tag-warning', PAID: 'tag tag-info', SHIPPED: 'tag tag-primary', COMPLETED: 'tag tag-success', CANCELLED: 'tag tag-danger', REFUNDED: 'tag tag-refunded' }
const payStatusMap = { UNPAID: '未支付', PAID: '已支付', REFUNDED: '已退款' }
const payStatusClassMap = { UNPAID: 'tag tag-warning', PAID: 'tag tag-success', REFUNDED: 'tag tag-info' }

const statusBadgeMap = {
  PENDING_PAYMENT: 'badge-orange', PAID: 'badge-blue', SHIPPED: 'badge-purple',
  COMPLETED: 'badge-green', CANCELLED: 'badge-gray', REFUNDED: 'badge-orange'
}
const payStatusBadgeMap = { UNPAID: 'badge-orange', PAID: 'badge-green', REFUNDED: 'badge-blue' }

const ratingHints = ['', '非常差', '比较差', '一般般', '还不错', '非常好']

const trackerStatusOrder = ['PENDING_PAYMENT', 'PAID', 'SHIPPED', 'COMPLETED']

function statusText(s) { return statusMap[s] || s }
function statusClass(s) { return statusClassMap[s] || 'tag tag-info' }
function paymentStatusText(s) { return payStatusMap[s] || s }
function paymentStatusClass(s) { return payStatusClassMap[s] || 'tag tag-info' }
function statusBadge(s) { return statusBadgeMap[s] || 'badge-gray' }
function payStatusBadge(s) { return payStatusBadgeMap[s] || 'badge-gray' }

const trackerSteps = ref([])
function buildTrackerSteps() {
  if (!order.value) return
  const labels = { PENDING_PAYMENT: '已下单', PAID: '已付款', SHIPPED: '已发货', COMPLETED: '已完成' }
  const isCancelled = order.value.status === 'CANCELLED'
  const isRefunded = order.value.status === 'REFUNDED'

  if (isCancelled) {
    trackerSteps.value = trackerStatusOrder.map((s) => ({
      status: s, label: labels[s], done: false, current: false, date: ''
    }))
    return
  }

  if (isRefunded) {
    // 已退款：前四步全部完成，最后追加"已退款"步骤
    trackerSteps.value = trackerStatusOrder.map((s) => ({
      status: s, label: labels[s], done: true, current: false, date: ''
    }))
    trackerSteps.value.push({
      status: 'REFUNDED', label: '已退款', done: false, current: true, date: ''
    })
    return
  }

  const currentIdx = trackerStatusOrder.indexOf(order.value.status)
  trackerSteps.value = trackerStatusOrder.map((s, idx) => ({
    status: s,
    label: labels[s],
    done: idx < currentIdx,
    current: idx === currentIdx,
    date: ''
  }))
}

async function fetchDetail() {
  loading.value = true
  try {
    const id = route.params.id
    order.value = await api.getOrderDetail(id, userStore.token)
    items.value = await api.getOrderItems(id, userStore.token) || []
    try {
      const payments = await api.getPaymentByOrder(id, userStore.token)
      paymentRecord.value = Array.isArray(payments) ? payments[0] : null
    } catch { paymentRecord.value = null }
    // 如果是已完成或已退款订单，加载已评价的商品
    if (order.value && (order.value.status === 'COMPLETED' || order.value.status === 'REFUNDED')) {
      await loadReviewedItems()
    }
    buildTrackerSteps()
  } catch { order.value = null }
  finally { loading.value = false }
}

async function loadReviewedItems() {
  try {
    const reviews = await api.getMyReviews(userStore.userId, userStore.token) || []
    reviews.forEach(r => {
      // 标记当前订单中已评价的商品
      if (r.orderId === order.value.id) {
        reviewedItems[r.productId] = true
      }
    })
  } catch { /* ignore */ }
}

function openReview(item) {
  reviewingItem.value = item
  reviewRating.value = 0
  reviewContent.value = ''
  hoverStar.value = 0
}

async function submitReview() {
  if (reviewRating.value === 0) return
  submittingReview.value = true
  try {
    await api.createReview({
      userId: userStore.userId,
      orderId: order.value.id,
      productId: reviewingItem.value.productId,
      rating: reviewRating.value,
      content: reviewContent.value.trim()
    }, userStore.token)
    reviewedItems[reviewingItem.value.productId] = true
    reviewingItem.value = null
  } catch (e) {
    alert('评价失败：' + (e.message || '未知错误'))
  } finally {
    submittingReview.value = false
  }
}

async function handleCancel() {
  if (!confirm('确定要取消该订单吗？')) return
  try {
    await api.cancelOrder(order.value.id, userStore.token)
    fetchDetail()
  } catch (e) { alert(e.message) }
}

async function handleConfirmReceive() {
  if (!confirm('确定已收到商品吗？')) return
  try {
    await api.confirmReceive(order.value.id, userStore.token)
    fetchDetail()
  } catch (e) { alert(e.message) }
}

onMounted(fetchDetail)
</script>

<style scoped>
.order-detail {
  max-width: 750px;
  margin: 0 auto;
  padding-bottom: 100px;
}

/* 页面标题 */
.page-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}
.back-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: #fff;
  border-radius: 10px;
  color: #666;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0,0,0,0.04);
  transition: all 0.2s ease;
}
.back-btn:hover {
  color: #ff2442;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
}
.page-title {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
}

/* ===== 卡片 ===== */
.card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 20px;
  margin-bottom: 14px;
}
.card-section-title {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ===== 状态追踪器 ===== */
.status-tracker {
  padding: 24px 20px;
}
.tracker-steps {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
}
.tracker-steps::before {
  content: '';
  position: absolute;
  top: 13px;
  left: 0;
  right: 0;
  height: 2px;
  background: #f0f0f0;
  z-index: 0;
}
.tracker-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  position: relative;
  z-index: 1;
  flex: 1;
  text-align: center;
}
.step-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #f6f6f6;
  border: 2px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}
.tracker-step.done .step-dot {
  background: #07c160;
  border-color: #07c160;
  color: #fff;
}
.tracker-step.current .step-dot {
  background: #ff2442;
  border-color: #ff2442;
  box-shadow: 0 0 0 4px rgba(255,36,66,0.15);
}
.tracker-step.done .step-dot svg {
  color: #fff;
}
.dot-inner {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #d9d9d9;
}
.tracker-step.current .dot-inner {
  background: #fff;
}
.step-label {
  font-size: 12px;
  font-weight: 600;
  color: #999;
  white-space: nowrap;
}
.tracker-step.done .step-label {
  color: #07c160;
}
.tracker-step.current .step-label {
  color: #ff2442;
}
.step-date {
  font-size: 11px;
  color: #ccc;
}

/* ===== 信息网格 ===== */
.info-card {
  background: #fff;
}
.info-grid {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.info-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid #fafafa;
}
.info-row:last-child {
  border-bottom: none;
}
.info-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #f6f6f6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  flex-shrink: 0;
}
.info-label {
  font-size: 13px;
  color: #999;
  flex-shrink: 0;
  width: 70px;
}
.info-value {
  font-size: 14px;
  color: #1a1a1a;
  font-weight: 500;
  flex: 1;
  word-break: break-all;
}
.total-price {
  font-size: 18px;
  font-weight: 700;
  color: #ff2442;
}
.info-date {
  font-size: 12px;
  color: #ccc;
  margin-left: auto;
}

.payment-record {
  border-left: 3px solid #ff2442;
}

/* ===== 状态徽章 ===== */
.status-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}
.badge-orange { background: #fff7e6; color: #ffb800; }
.badge-blue { background: #e6f7ff; color: #1890ff; }
.badge-purple { background: #f9f0ff; color: #722ed1; }
.badge-green { background: #e6fae9; color: #07c160; }
.badge-gray { background: #f5f5f5; color: #999; }

/* ===== 商品列表表格 ===== */
.product-table {
  width: 100%;
}
.table-row {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #fafafa;
  gap: 12px;
}
.table-row:last-child {
  border-bottom: none;
}
.table-header-row {
  padding: 8px 0;
  border-bottom: 2px solid #f0f0f0;
  font-size: 12px;
  color: #999;
  font-weight: 500;
  text-transform: none;
}
.col-product {
  flex: 2;
  min-width: 0;
}
.col-price {
  flex: 1;
  text-align: center;
  font-size: 13px;
  color: #666;
}
.col-qty {
  flex: 0 0 50px;
  text-align: center;
  font-size: 13px;
  color: #666;
}
.col-subtotal {
  flex: 1;
  text-align: right;
  font-size: 13px;
  color: #666;
}
.col-action {
  flex: 0 0 80px;
  text-align: right;
  display: flex;
  justify-content: flex-end;
}
.subtotal-price {
  color: #ff2442 !important;
  font-weight: 600 !important;
}

.product-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}
.p-thumb {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: #f6f6f6;
  display: flex;
  align-items: center;
  justify-content: center;
}
.p-thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.p-thumb-placeholder {
  display: block;
}
.p-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.p-name {
  font-size: 14px;
  font-weight: 500;
  color: #1a1a1a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.p-sku {
  font-size: 12px;
  color: #999;
}

/* 评价按钮 */
.review-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: 1px solid #ffb800;
  background: #fffbf0;
  color: #ffb800;
  font-size: 12px;
  font-weight: 500;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}
.review-btn:hover {
  background: #ffb800;
  color: #fff;
}
.reviewed-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #07c160;
  font-weight: 500;
}

/* ===== 底部操作栏 ===== */
.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-top: 1px solid #f0f0f0;
  box-shadow: 0 -4px 16px rgba(0,0,0,0.06);
  padding: 12px 16px;
  z-index: 50;
}
.action-bar-inner {
  max-width: 750px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.action-bar-right {
  display: flex;
  gap: 8px;
}
.action-btn {
  padding: 10px 24px;
  border-radius: 22px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}
.action-btn-back {
  padding: 10px 20px;
  background: transparent;
  border: 1px solid #e0e0e0;
  color: #666;
  border-radius: 22px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}
.action-btn-back:hover {
  border-color: #999;
  color: #1a1a1a;
}
.action-btn-primary {
  background: linear-gradient(135deg, #ff2442, #ff4d64);
  color: #fff;
  box-shadow: 0 3px 10px rgba(255,36,66,0.2);
}
.action-btn-primary:hover {
  box-shadow: 0 5px 16px rgba(255,36,66,0.3);
  transform: translateY(-1px);
}
.action-btn-danger-ghost {
  background: transparent;
  color: #ff2442;
  border: 1px solid #ff2442;
}
.action-btn-danger-ghost:hover {
  background: #fff5f6;
}

/* ===== 加载状态 ===== */
.loading-state {
  text-align: center;
  padding: 120px 0;
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
  padding: 100px 24px;
}

/* ===== 评价弹窗 ===== */
.dialog-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(3px);
  animation: fadeIn 0.2s ease;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.review-dialog {
  background: #fff;
  border-radius: 16px;
  width: 440px;
  max-width: 92vw;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0,0,0,0.18);
  animation: slideUp 0.25s ease;
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(16px) scale(0.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 0;
}
.dialog-header h3 {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
}
.dialog-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: #f6f6f6;
  border-radius: 50%;
  color: #999;
  cursor: pointer;
  transition: all 0.2s ease;
}
.dialog-close:hover {
  background: #e8e8e8;
  color: #1a1a1a;
}
.dialog-body {
  padding: 20px 24px 4px;
}
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 18px 24px 24px;
}

/* 弹窗-评价商品卡片 */
.review-product-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: #fafafa;
  border-radius: 10px;
  margin-bottom: 20px;
}
.review-pname {
  font-weight: 600;
  font-size: 15px;
  color: #1a1a1a;
}
.review-psku {
  font-size: 12px;
  color: #999;
  background: #f0f0f0;
  padding: 2px 8px;
  border-radius: 4px;
}

/* 星级评分 */
.star-section {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
}
.star-label {
  font-size: 14px;
  font-weight: 600;
  color: #666;
  padding-top: 4px;
  white-space: nowrap;
}
.stars-row {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}
.star-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  transition: transform 0.15s ease;
}
.star-btn:hover {
  transform: scale(1.15);
}
.star-hint {
  font-size: 13px;
  color: #ffb800;
  margin-left: 8px;
  font-weight: 500;
}

/* 评价文本域 */
.form-group {
  margin-bottom: 4px;
}
.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  color: #666;
  font-weight: 500;
}
textarea {
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid #e8e8e8;
  border-radius: 10px;
  font-size: 14px;
  color: #1a1a1a;
  outline: none;
  resize: vertical;
  font-family: inherit;
  line-height: 1.6;
  transition: border-color 0.2s ease;
}
textarea:focus {
  border-color: #ff2442;
  box-shadow: 0 0 0 3px rgba(255,36,66,0.06);
}
textarea::placeholder {
  color: #ccc;
}
.char-count {
  font-size: 12px;
  color: #ccc;
  float: right;
  margin-top: 6px;
}

/* 弹窗按钮 */
.btn-cancel {
  padding: 10px 24px;
  border: 1px solid #e0e0e0;
  background: #fff;
  color: #666;
  border-radius: 22px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}
.btn-cancel:hover {
  border-color: #999;
  color: #1a1a1a;
}
.btn-submit {
  padding: 10px 28px;
  border: none;
  background: linear-gradient(135deg, #ff2442, #ff4d64);
  color: #fff;
  border-radius: 22px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  box-shadow: 0 3px 10px rgba(255,36,66,0.2);
}
.btn-submit:hover:not(:disabled) {
  box-shadow: 0 5px 18px rgba(255,36,66,0.3);
  transform: translateY(-1px);
}
.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ===== 响应式 ===== */
@media (max-width: 768px) {
  .order-detail {
    padding-bottom: 90px;
  }
  .card {
    padding: 16px;
    border-radius: 10px;
    margin-bottom: 10px;
  }
  .tracker-steps {
    gap: 4px;
  }
  .step-label {
    font-size: 11px;
  }
  .table-row {
    gap: 6px;
    padding: 10px 0;
  }
  .table-header-row {
    font-size: 11px;
  }
  .col-qty {
    flex: 0 0 36px;
  }
  .col-action {
    flex: 0 0 60px;
  }
  .p-thumb {
    width: 40px;
    height: 40px;
  }
  .p-name {
    font-size: 13px;
  }
  .action-bar {
    padding: 10px 12px;
  }
  .action-btn {
    padding: 8px 16px;
    font-size: 13px;
  }
  .action-btn-back {
    padding: 8px 14px;
    font-size: 13px;
  }
}
</style>
