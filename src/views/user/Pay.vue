<!-- ==================== 支付宝沙箱支付页 ==================== -->
<template>
  <div class="pay-page">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <span class="spinner"></span>
      <p>加载订单信息...</p>
    </div>

    <!-- 订单不存在 -->
    <div v-else-if="!order" class="empty-state">
      <svg width="80" height="80" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="50" r="30" stroke="#d9d9d9" stroke-width="2.5" fill="#fafafa"/>
        <line x1="48" y1="50" x2="72" y2="50" stroke="#d9d9d9" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="60" y1="38" x2="60" y2="62" stroke="#d9d9d9" stroke-width="2.5" stroke-linecap="round"/>
      </svg>
      <p>订单不存在</p>
    </div>

    <!-- 支付内容 -->
    <div v-else class="pay-container">
      <!-- ===== 已支付 ===== -->
      <div v-if="order.status === 'PAID'" class="result-card">
        <div class="result-icon-wrap success-icon">
          <svg width="56" height="56" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="40" cy="40" r="38" fill="#f0fdf4" stroke="#07c160" stroke-width="3"/>
            <polyline points="25,40 36,51 56,30" stroke="#07c160" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h2 class="result-title">支付成功</h2>
        <div class="result-meta">
          <div class="meta-row">
            <span class="meta-label">订单号</span>
            <span class="meta-value">{{ order.orderNo }}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">实付金额</span>
            <span class="meta-value meta-price">¥{{ (order.payAmount || order.totalAmount || 0).toFixed(2) }}</span>
          </div>
        </div>
        <router-link :to="`/orders/${order.id}`" class="result-link">
          查看订单详情
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </router-link>
      </div>

      <!-- ===== 非待付款（已取消等） ===== -->
      <div v-else-if="order.status !== 'PENDING_PAYMENT'" class="result-card">
        <div class="result-icon-wrap info-icon">
          <svg width="56" height="56" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="40" cy="40" r="38" fill="#f6f6f6" stroke="#d9d9d9" stroke-width="3"/>
            <line x1="40" y1="26" x2="40" y2="46" stroke="#999" stroke-width="3.5" stroke-linecap="round"/>
            <circle cx="40" cy="55" r="3" fill="#999"/>
          </svg>
        </div>
        <h2 class="result-title">{{ statusText(order.status) }}</h2>
        <p class="result-desc">该订单当前状态不支持支付</p>
        <router-link :to="`/orders/${order.id}`" class="result-link">
          查看订单
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </router-link>
      </div>

      <!-- ===== 待付款 ===== -->
      <div v-else class="pay-card">
        <!-- 订单摘要卡片 -->
        <div class="order-summary">
          <div class="summary-icon">
            <svg width="28" height="28" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="60" height="60" rx="16" fill="#fff5f6"/>
              <rect x="14" y="18" width="32" height="28" rx="4" fill="#ff2442" opacity="0.1" stroke="#ff2442" stroke-width="2"/>
              <text x="30" y="30" text-anchor="middle" font-size="9" fill="#ff2442" font-weight="700">SM</text>
              <text x="30" y="40" text-anchor="middle" font-size="7" fill="#ff2442">MALL</text>
            </svg>
          </div>
          <div class="summary-info">
            <div class="summary-merchant">Smart Mall 商城</div>
            <div class="summary-order-no">订单号：{{ order.orderNo }}</div>
          </div>
          <div class="summary-amount">
            <div class="amount-label">应付金额</div>
            <div class="amount-value">¥{{ (order.payAmount || order.totalAmount || 0).toFixed(2) }}</div>
          </div>
        </div>

        <!-- 支付方式 -->
        <div class="method-section">
          <h3 class="section-title">选择支付方式</h3>
          <div class="method-card selected">
            <div class="method-left">
              <div class="method-icon alipay-icon">
                <svg width="32" height="32" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="60" height="60" rx="14" fill="#1677ff"/>
                  <text x="30" y="38" text-anchor="middle" font-size="22" font-weight="700" fill="#fff" font-family="sans-serif">支</text>
                </svg>
              </div>
              <div class="method-info">
                <div class="method-name">支付宝</div>
                <div class="method-desc">推荐支付宝用户使用(wmnuct6386@sandbox.com)</div>
              </div>
            </div>
            <div class="method-check">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="#1677ff"/>
                <polyline points="7,12 10.5,15.5 17,9" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- 支付按钮 -->
        <div class="pay-actions">
          <button class="pay-btn" @click="goToPay" :disabled="payWindowOpened">
            <span v-if="!payWindowOpened" class="pay-btn-text">
              确认支付
              <span class="pay-btn-amount">¥{{ (order.payAmount || order.totalAmount || 0).toFixed(2) }}</span>
            </span>
            <span v-else class="pay-btn-text pay-btn-waiting">
              <span class="waiting-dots">
                <span></span><span></span><span></span>
              </span>
              请在新窗口完成支付...
            </span>
          </button>

          <p v-if="payWindowOpened" class="pay-refresh-hint">
            已完成支付？
            <a href="javascript:void(0)" @click="checkPayment">点击刷新状态</a>
          </p>

          <button class="pay-back-link" @click="$router.push(`/orders/${order.id}`)">
            暂不支付，查看订单
          </button>
        </div>

        <!-- 底部提示 -->
        <div class="pay-tips">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          <span>沙箱环境，使用沙箱账号 + 支付密码 <strong>111111</strong> 完成付款</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '../../stores/user'
import { api } from '../../utils/api'

const route = useRoute()
const userStore = useUserStore()

const order = ref(null)
const loading = ref(true)
const payWindowOpened = ref(false)
let pollTimer = null
let payWindow = null

const statusMap = {
  PENDING_PAYMENT: '待付款', PAID: '已付款', SHIPPED: '已发货',
  COMPLETED: '已完成', CANCELLED: '已取消'
}
function statusText(s) { return statusMap[s] || s }

onMounted(async () => {
  try {
    const id = route.params.orderId
    order.value = await api.getOrderDetail(id, userStore.token)
    if (order.value && order.value.status === 'PENDING_PAYMENT') {
      startPolling()
    }
  } catch (e) {
    console.error('加载订单失败', e)
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  clearInterval(pollTimer)
  if (payWindow && !payWindow.closed) {
    // don't close, user might still be paying
  }
})

function goToPay() {
  payWindowOpened.value = true
  // 在新窗口打开支付宝支付页面（后端返回 HTML form，自动跳转收银台）
  payWindow = window.open(
    `/api/pay/page/${order.value.id}`,
    'alipay',
    'width=800,height=600'
  )
  // 监听窗口关闭
  if (payWindow) {
    const checkClosed = setInterval(() => {
      if (payWindow.closed) {
        clearInterval(checkClosed)
        checkPayment()
      }
    }, 1000)
  }
}

function startPolling() {
  pollTimer = setInterval(async () => {
    try {
      const record = await api.queryPayStatus(order.value.id, userStore.token)
      if (record && record.status === 'PAID') {
        order.value = await api.getOrderDetail(order.value.id, userStore.token)
        clearInterval(pollTimer)
      }
    } catch { /* silent */ }
  }, 3000)
}

async function checkPayment() {
  try {
    const record = await api.queryPayStatus(order.value.id, userStore.token)
    if (record && record.status === 'PAID') {
      order.value = await api.getOrderDetail(order.value.id, userStore.token)
      payWindowOpened.value = false
    } else {
      alert('订单尚未支付，请在新窗口完成支付')
    }
  } catch (e) {
    alert('查询失败：' + (e.message || '未知错误'))
  }
}
</script>

<style scoped>
.pay-page {
  display: flex;
  justify-content: center;
  padding: 20px 16px;
  min-height: 60vh;
}

/* ===== 加载状态 ===== */
.loading-state {
  text-align: center;
  padding: 100px 0;
  color: #999;
  align-self: center;
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
  color: #999;
  align-self: center;
}
.empty-state p {
  margin-top: 12px;
  font-size: 14px;
}

/* ===== 主容器 ===== */
.pay-container {
  width: 460px;
  max-width: 100%;
}

/* ===== 支付卡片 ===== */
.pay-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
  overflow: hidden;
}

/* ===== 订单摘要 ===== */
.order-summary {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 24px;
  border-bottom: 1px solid #f5f5f5;
}
.summary-icon {
  flex-shrink: 0;
}
.summary-info {
  flex: 1;
  min-width: 0;
}
.summary-merchant {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4px;
}
.summary-order-no {
  font-size: 12px;
  color: #999;
}
.summary-amount {
  text-align: right;
  flex-shrink: 0;
}
.amount-label {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}
.amount-value {
  font-size: 24px;
  font-weight: 700;
  color: #ff2442;
}

/* ===== 支付方式区域 ===== */
.method-section {
  padding: 20px 24px;
}
.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 14px;
}

.method-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border: 2px solid #1677ff;
  border-radius: 12px;
  background: #f0f7ff;
  transition: all 0.2s ease;
}
.method-left {
  display: flex;
  align-items: center;
  gap: 14px;
}
.method-icon {
  flex-shrink: 0;
}
.alipay-icon svg {
  display: block;
}
.method-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.method-name {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}
.method-desc {
  font-size: 12px;
  color: #999;
}
.method-check {
  flex-shrink: 0;
}

/* ===== 支付按钮区域 ===== */
.pay-actions {
  padding: 0 24px 20px;
}

.pay-btn {
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #ff2442, #ff4d64);
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 6px 20px rgba(255,36,66,0.25);
  font-family: inherit;
}
.pay-btn:hover:not(:disabled) {
  box-shadow: 0 8px 28px rgba(255,36,66,0.35);
  transform: translateY(-2px);
}
.pay-btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 4px 14px rgba(255,36,66,0.2);
}
.pay-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  background: linear-gradient(135deg, #ccc, #b0b0b0);
  box-shadow: none;
}

.pay-btn-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.pay-btn-amount {
  font-size: 20px;
  font-weight: 700;
}
.pay-btn-waiting {
  gap: 10px;
}

/* 等待点动画 */
.waiting-dots {
  display: flex;
  gap: 4px;
  align-items: center;
}
.waiting-dots span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #fff;
  animation: dotPulse 1.4s infinite ease-in-out;
}
.waiting-dots span:nth-child(1) { animation-delay: 0s; }
.waiting-dots span:nth-child(2) { animation-delay: 0.2s; }
.waiting-dots span:nth-child(3) { animation-delay: 0.4s; }
@keyframes dotPulse {
  0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
  40% { opacity: 1; transform: scale(1); }
}

.pay-refresh-hint {
  text-align: center;
  margin-top: 14px;
  font-size: 13px;
  color: #1677ff;
}
.pay-refresh-hint a {
  color: #1677ff;
  text-decoration: underline;
  cursor: pointer;
  font-weight: 500;
}
.pay-refresh-hint a:hover {
  opacity: 0.8;
}

.pay-back-link {
  display: block;
  width: 100%;
  padding: 12px;
  margin-top: 10px;
  background: transparent;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  font-family: inherit;
}
.pay-back-link:hover {
  border-color: #999;
  color: #1a1a1a;
}

/* 底部提示 */
.pay-tips {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 14px 24px 20px;
  font-size: 12px;
  color: #999;
  text-align: center;
  border-top: 1px solid #f5f5f5;
}
.pay-tips svg {
  flex-shrink: 0;
  color: #ccc;
}
.pay-tips strong {
  color: #666;
}

/* ===== 结果卡片 ===== */
.result-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
  padding: 48px 32px;
  text-align: center;
}
.result-icon-wrap {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
}
.result-title {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 20px;
}
.result-desc {
  font-size: 14px;
  color: #999;
  margin-bottom: 20px;
}
.result-meta {
  display: inline-flex;
  flex-direction: column;
  gap: 10px;
  background: #fafafa;
  border-radius: 12px;
  padding: 16px 24px;
  margin-bottom: 24px;
  min-width: 240px;
}
.meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}
.meta-label {
  font-size: 13px;
  color: #999;
}
.meta-value {
  font-size: 14px;
  font-weight: 500;
  color: #1a1a1a;
}
.meta-price {
  font-size: 18px;
  font-weight: 700;
  color: #ff2442;
}
.result-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 24px;
  background: linear-gradient(135deg, #ff2442, #ff4d64);
  color: #fff;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
  box-shadow: 0 4px 14px rgba(255,36,66,0.2);
}
.result-link:hover {
  box-shadow: 0 6px 20px rgba(255,36,66,0.3);
  transform: translateY(-1px);
  opacity: 1;
}

/* ===== 响应式 ===== */
@media (max-width: 480px) {
  .pay-page {
    padding: 0;
    min-height: 100vh;
    align-items: flex-start;
  }
  .pay-container {
    width: 100%;
  }
  .pay-card {
    border-radius: 0;
    box-shadow: none;
  }
  .result-card {
    border-radius: 0;
    box-shadow: none;
    padding: 56px 20px;
  }
  .order-summary {
    padding: 18px 16px;
  }
  .method-section {
    padding: 16px;
  }
  .pay-actions {
    padding: 0 16px 16px;
  }
  .pay-tips {
    padding: 12px 16px 16px;
  }
}
</style>
