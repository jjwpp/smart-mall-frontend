<!-- ==================== 购物车页 ==================== -->
<template>
  <div class="cart-page">
    <!-- 加载中 -->
    <div v-if="cartStore.loading" class="loading-text">加载中...</div>

    <!-- 空状态 -->
    <div v-else-if="!cartStore.items.length" class="cart-empty">
      <div class="empty-illustration">
        <div class="empty-cart-icon">🛒</div>
        <div class="empty-dots">
          <span></span><span></span><span></span>
        </div>
      </div>
      <h2 class="empty-title">购物车是空的</h2>
      <p class="empty-desc">快去挑选心仪的商品吧</p>
      <router-link to="/products" class="empty-btn">去逛逛</router-link>
    </div>

    <!-- 有商品 -->
    <template v-else>
      <!-- 头部 -->
      <div class="cart-header">
        <h2 class="cart-title">
          我的购物车
          <span class="cart-count">({{ cartStore.items.length }}件)</span>
        </h2>
        <button class="header-action" v-if="cartStore.items.length" @click="handleClear">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          清空
        </button>
      </div>

      <!-- 商品卡片列表 -->
      <div class="cart-items">
        <div v-for="item in cartStore.items" :key="item.id" class="cart-item-card">
          <!-- 复选框 -->
          <label class="check-wrap" @click.stop>
            <input
              type="checkbox"
              :checked="!!item.selected"
              @change="toggleSelect(item)"
            />
            <span class="check-mark">
              <svg v-if="item.selected" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
            </span>
          </label>

          <!-- 商品图片 -->
          <div class="item-thumb">
            <img
              v-if="item.skuImageUrl || item.coverUrl"
              :src="item.skuImageUrl || item.coverUrl"
              :alt="item.productName"
            />
            <span v-else class="thumb-placeholder">📦</span>
          </div>

          <!-- 商品信息 -->
          <div class="item-info">
            <div class="item-name">{{ item.productName || '商品#' + item.productId }}</div>
            <div class="item-meta">
              <span class="item-sku-tag" v-if="item.skuName">{{ item.skuName }}</span>
            </div>
            <div class="item-bottom">
              <span class="item-price">¥{{ formatPrice(item.productPrice) }}</span>
              <!-- 数量调节 -->
              <div class="qty-stepper">
                <button class="qty-btn" @click="qtyChange(item, -1)" :disabled="item.quantity <= 1">−</button>
                <span class="qty-val">{{ item.quantity }}</span>
                <button class="qty-btn qty-plus" @click="qtyChange(item, 1)">+</button>
              </div>
            </div>
          </div>

          <!-- 删除按钮 -->
          <button class="item-delete" @click="handleRemove(item.id)" aria-label="删除">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
          </button>
        </div>
      </div>

      <!-- 底部固定结算栏 -->
      <div class="cart-footer">
        <div class="footer-left">
          <label class="check-wrap" @click.stop>
            <input
              type="checkbox"
              :checked="allSelected"
              @change="toggleAll"
            />
            <span class="check-mark">
              <svg v-if="allSelected" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
            </span>
          </label>
          <span class="select-all-text">全选</span>
        </div>
        <div class="footer-right">
          <div class="total-block">
            <span class="total-label">合计：</span>
            <span class="total-price">
              <span class="total-symbol">¥</span>{{ formatPrice(cartStore.totalAmount) }}
            </span>
          </div>
          <button
            class="checkout-btn"
            :disabled="!selectedCount || checkingOut"
            @click="handleCheckout"
          >
            {{ checkingOut ? '结算中...' : `去结算(${selectedCount})` }}
          </button>
        </div>
      </div>
    </template>

    <!-- ===== 结算弹窗：选择收货地址 ===== -->
    <div class="dialog-overlay" v-if="showCheckoutDialog" @click.self="showCheckoutDialog = false">
      <div class="dialog" style="max-width:560px">
        <h3>📦 确认订单信息</h3>

        <!-- 收货地址 -->
        <div class="section-label">收货地址</div>
        <div v-if="addresses.length === 0" class="address-empty">
          <p>暂无收货地址</p>
          <router-link to="/addresses" class="btn-primary-sm" style="display:inline-block">去添加地址</router-link>
        </div>
        <div v-else class="address-list">
          <div
            v-for="addr in addresses"
            :key="addr.id"
            :class="['address-card', { selected: selectedAddressId === addr.id }]"
            @click="selectedAddressId = addr.id"
          >
            <div class="addr-radio">
              <span :class="['radio-dot', { active: selectedAddressId === addr.id }]"></span>
            </div>
            <div class="addr-info">
              <div class="addr-contact">
                <strong>{{ addr.receiverName }}</strong>
                <span>{{ addr.receiverPhone }}</span>
                <span v-if="addr.isDefault" class="tag tag-primary" style="margin-left:6px">默认</span>
              </div>
              <div class="addr-detail">{{ addr.province }}{{ addr.city }}{{ addr.district }} {{ addr.detail }}</div>
            </div>
          </div>
        </div>

        <!-- 优惠券 -->
        <div class="section-label" style="margin-top:16px">优惠券</div>
        <div v-if="usableCoupons.length === 0" class="coupon-empty">
          <span v-if="couponLoaded">暂无可用优惠券</span>
          <span v-else>加载中...</span>
        </div>
        <div v-else class="coupon-list">
          <div
            v-for="c in usableCoupons"
            :key="c.id"
            :class="['coupon-card', { selected: selectedCouponId === c.id }]"
            @click="selectedCouponId = selectedCouponId === c.id ? null : c.id"
          >
            <div class="coupon-left">
              <span class="coupon-amount">¥{{ c.amount }}</span>
              <span class="coupon-condition">满 ¥{{ c.conditionAmount }} 可用</span>
            </div>
            <div class="coupon-right">
              <div class="coupon-name">{{ c.couponName }}</div>
              <div class="coupon-expire">有效期至 {{ c.expireTime?.slice(0, 10) }}</div>
            </div>
            <div class="coupon-check">
              <span :class="['check-dot', { active: selectedCouponId === c.id }]">✓</span>
            </div>
          </div>
        </div>

        <!-- 订单摘要 -->
        <div class="section-label" style="margin-top:16px">订单摘要</div>
        <div class="order-summary">
          <div class="summary-row" v-for="item in cartStore.items.filter(i => i.selected)" :key="item.id">
            <span class="summary-name">{{ item.productName || '商品#' + item.productId }}
              <template v-if="item.skuName">（{{ item.skuName }}）</template>
              ×{{ item.quantity }}
            </span>
            <span class="summary-price">¥{{ formatPrice((item.productPrice || 0) * item.quantity) }}</span>
          </div>
          <div class="summary-row" v-if="discountAmount > 0">
            <span>优惠券抵扣</span>
            <span class="discount-text">-¥{{ formatPrice(discountAmount) }}</span>
          </div>
          <div class="summary-row total">
            <span>应付</span>
            <span class="total-price">¥{{ formatPrice(payAmount) }}</span>
          </div>
        </div>

        <div class="dialog-actions">
          <button class="btn-text" @click="showCheckoutDialog = false">取消</button>
          <button
            class="btn-warning"
            :disabled="!selectedAddressId || submitting"
            @click="confirmCheckout"
          >
            {{ submitting ? '提交中...' : '确认下单 ¥' + formatPrice(payAmount) }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../../stores/cart'
import { useUserStore } from '../../stores/user'
import { api } from '../../utils/api'

const router = useRouter()
const cartStore = useCartStore()
const userStore = useUserStore()

const checkingOut = ref(false)
const showCheckoutDialog = ref(false)
const submitting = ref(false)
const addresses = ref([])
const selectedAddressId = ref(null)
const usableCoupons = ref([])
const selectedCouponId = ref(null)
const couponLoaded = ref(false)

const selectedCount = computed(() => cartStore.items.filter(i => i.selected).length)
const allSelected = computed(() => cartStore.items.length > 0 && cartStore.items.every(i => i.selected))
const discountAmount = computed(() => {
  if (!selectedCouponId.value) return 0
  const c = usableCoupons.value.find(c => c.id === selectedCouponId.value)
  return c ? Number(c.amount) : 0
})
const payAmount = computed(() => Math.max(0, cartStore.totalAmount - discountAmount.value))

function formatPrice(p) {
  const num = Number(p)
  if (isNaN(num)) return '--'
  return num.toFixed(2)
}

async function toggleSelect(item) {
  try {
    await cartStore.updateItem(item.id, { selected: item.selected ? 0 : 1 })
  } catch { /* ignore */ }
}

async function toggleAll() {
  const newVal = allSelected.value ? 0 : 1
  const updates = cartStore.items.map(item =>
    cartStore.updateItem(item.id, { selected: newVal })
  )
  await Promise.all(updates)
}

async function qtyChange(item, delta) {
  const newQty = item.quantity + delta
  if (newQty < 1) return
  try {
    await cartStore.updateItem(item.id, { quantity: newQty })
  } catch { /* ignore */ }
}

async function handleRemove(id) {
  if (!confirm('确定要删除该商品吗？')) return
  await cartStore.removeItem(id)
}

async function handleClear() {
  if (!confirm('确定要清空购物车吗？')) return
  await cartStore.clearAll()
}

// ===== 结算流程 =====
async function handleCheckout() {
  if (!selectedCount.value) return
  checkingOut.value = true
  selectedCouponId.value = null
  couponLoaded.value = false
  usableCoupons.value = []

  // 并行加载地址和优惠券
  try {
    const [addrList, coupons] = await Promise.all([
      api.getUserAddresses(userStore.userId, userStore.token),
      api.getUsableCoupons(userStore.userId, cartStore.totalAmount, userStore.token)
    ])
    addresses.value = Array.isArray(addrList) ? addrList : []
    usableCoupons.value = Array.isArray(coupons) ? coupons : []
    const defaultAddr = addresses.value.find(a => a.isDefault)
    selectedAddressId.value = defaultAddr ? defaultAddr.id : (addresses.value[0]?.id || null)
  } catch (e) {
    console.error('加载结算信息失败', e)
    addresses.value = []
  }
  couponLoaded.value = true
  checkingOut.value = false
  showCheckoutDialog.value = true
}

async function confirmCheckout() {
  if (!selectedAddressId.value) return
  submitting.value = true

  try {
    const order = await api.checkout({
      userId: userStore.userId,
      addressId: selectedAddressId.value,
      couponId: selectedCouponId.value || undefined
    }, userStore.token)

    showCheckoutDialog.value = false
    cartStore.removeSelected()
    router.push(`/payments/${order.id}`)
  } catch (e) {
    alert('下单失败：' + (e.message || '未知错误'))
  } finally {
    submitting.value = false
  }
}

onMounted(() => { cartStore.fetchItems() })
</script>

<style scoped>
/* ==================== 页面容器 ==================== */
.cart-page {
  max-width: 900px;
  margin: 0 auto;
  padding-bottom: 100px;
}

/* ==================== 空状态 ==================== */
.cart-empty {
  text-align: center;
  padding: 100px 0;
}

.empty-illustration {
  position: relative;
  display: inline-block;
  margin-bottom: 24px;
}

.empty-cart-icon {
  font-size: 96px;
  line-height: 1;
  filter: grayscale(0.3);
  animation: cartFloat 3s ease-in-out infinite;
}

.empty-dots {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: 16px;
}
.empty-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #e0e0e0;
  animation: dotPulse 1.4s ease-in-out infinite;
}
.empty-dots span:nth-child(2) { animation-delay: 0.2s; }
.empty-dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes cartFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
@keyframes dotPulse {
  0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
  40% { opacity: 1; transform: scale(1.2); }
}

.empty-title {
  font-size: 20px;
  font-weight: 700;
  color: #333;
  margin-bottom: 8px;
}

.empty-desc {
  font-size: 14px;
  color: #999;
  margin-bottom: 24px;
}

.empty-btn {
  display: inline-block;
  padding: 12px 48px;
  background: linear-gradient(135deg, #ff2442, #ff4757);
  color: #fff;
  border-radius: 24px;
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
  box-shadow: 0 4px 14px rgba(255,36,66,0.3);
}
.empty-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255,36,66,0.4);
}

/* ==================== 头部 ==================== */
.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.cart-title {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  gap: 8px;
}

.cart-count {
  font-size: 15px;
  font-weight: 400;
  color: #999;
}

.header-action {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 8px 14px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  background: #fff;
  color: #999;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.header-action:hover {
  color: #ff2442;
  border-color: #ff2442;
}

/* ==================== 商品卡片列表 ==================== */
.cart-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cart-item-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 8px rgba(0,0,0,0.04);
  transition: box-shadow 0.2s ease;
  position: relative;
}
.cart-item-card:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
}

/* ==================== 自定义复选框 ==================== */
.check-wrap {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  cursor: pointer;
}
.check-wrap input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  pointer-events: none;
}

.check-mark {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid #d0d0d0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  background: #fff;
}
.check-wrap input:checked + .check-mark {
  background: #ff2442;
  border-color: #ff2442;
}
.check-wrap:hover .check-mark {
  border-color: #ff2442;
}

/* ==================== 商品缩略图 ==================== */
.item-thumb {
  width: 80px;
  height: 80px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
  background: #fafafa;
  border: 1px solid #f0f0f0;
}
.item-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.thumb-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: #ddd;
}

/* ==================== 商品信息 ==================== */
.item-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.item-name {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
}

.item-sku-tag {
  display: inline-block;
  padding: 2px 10px;
  background: #f5f5f5;
  color: #888;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.item-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-price {
  font-size: 17px;
  font-weight: 700;
  color: #ff2442;
}

/* ==================== 数量调节器 ==================== */
.qty-stepper {
  display: inline-flex;
  align-items: center;
  border: 1.5px solid #e8e8e8;
  border-radius: 8px;
  overflow: hidden;
}

.qty-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: #fafafa;
  color: #666;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.15s ease;
  padding: 0;
  border-radius: 0;
  line-height: 1;
}
.qty-btn:hover:not(:disabled) {
  background: #f0f0f0;
}
.qty-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
.qty-plus {
  color: #ff2442;
}

.qty-val {
  width: 36px;
  text-align: center;
  font-size: 14px;
  font-weight: 700;
  color: #333;
  user-select: none;
}

/* ==================== 删除按钮 ==================== */
.item-delete {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  color: #ccc;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
  flex-shrink: 0;
  padding: 0;
}
.item-delete:hover {
  color: #ff2442;
  background: #fff5f7;
}

/* ==================== 底部结算栏 ==================== */
.cart-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-top: 1px solid #f0f0f0;
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 50;
  box-shadow: 0 -2px 12px rgba(0,0,0,0.06);
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.select-all-text {
  font-size: 14px;
  color: #666;
  user-select: none;
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 14px;
}

.total-block {
  display: flex;
  align-items: baseline;
}

.total-label {
  font-size: 13px;
  color: #999;
}

.total-price {
  font-size: 24px;
  font-weight: 800;
  color: #ff2442;
  line-height: 1;
}

.total-symbol {
  font-size: 16px;
  font-weight: 600;
}

.checkout-btn {
  height: 44px;
  padding: 0 32px;
  border: none;
  border-radius: 22px;
  background: linear-gradient(135deg, #ff2442, #ff4757);
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  box-shadow: 0 4px 14px rgba(255,36,66,0.35);
}
.checkout-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(255,36,66,0.45);
}
.checkout-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* ==================== 结算弹窗 ==================== */
.section-label { font-size: 14px; font-weight: 700; color: #333; margin-bottom: 10px; }
.address-empty { text-align: center; padding: 20px; color: #999; }

.address-list { display: flex; flex-direction: column; gap: 8px; max-height: 200px; overflow-y: auto; }
.address-card { display: flex; gap: 12px; padding: 12px 14px; border: 2px solid #e8e8e8; border-radius: 10px; cursor: pointer; transition: all 0.2s; align-items: flex-start; }
.address-card:hover { border-color: #ff2442; }
.address-card.selected { border-color: #ff2442; background: #fff5f7; }

.addr-radio { padding-top: 2px; }
.radio-dot { width: 18px; height: 18px; border-radius: 50%; border: 2px solid #d0d0d0; display: inline-block; transition: all 0.2s; }
.radio-dot.active { border-color: #ff2442; background: #ff2442; box-shadow: inset 0 0 0 3px #fff; }

.addr-info { flex: 1; }
.addr-contact { font-size: 14px; margin-bottom: 4px; display: flex; gap: 8px; align-items: center; }
.addr-detail { font-size: 12px; color: #999; }

.order-summary { background: #f6f6f6; border-radius: 10px; padding: 12px 16px; }
.summary-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; }
.summary-row.total { border-top: 1px solid #e8e8e8; margin-top: 6px; padding-top: 10px; font-weight: 700; font-size: 15px; }
.summary-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-right: 12px; }
.summary-price { flex-shrink: 0; }
.discount-text { color: #4caf50; font-weight: 600; }

/* 优惠券 */
.coupon-empty { text-align: center; padding: 12px; color: #999; font-size: 13px; }
.coupon-list { display: flex; flex-direction: column; gap: 8px; max-height: 180px; overflow-y: auto; }
.coupon-card {
  display: flex; align-items: center; border: 2px solid #e8e8e8;
  border-radius: 10px; overflow: hidden; cursor: pointer; transition: all 0.2s;
}
.coupon-card:hover { border-color: #ff2442; }
.coupon-card.selected { border-color: #ff2442; background: #fff5f7; }
.coupon-left {
  width: 90px; flex-shrink: 0; text-align: center; padding: 10px 8px;
  background: linear-gradient(135deg, #fff5f7, #ffe0e5); border-right: 1px dashed #ffb3be;
}
.coupon-amount { font-size: 20px; font-weight: 700; color: #ff2442; display: block; }
.coupon-condition { font-size: 11px; color: #999; margin-top: 2px; display: block; }
.coupon-right { flex: 1; padding: 10px 12px; min-width: 0; }
.coupon-name { font-size: 14px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.coupon-expire { font-size: 11px; color: #999; margin-top: 4px; }
.coupon-check { width: 36px; text-align: center; flex-shrink: 0; }
.check-dot {
  width: 22px; height: 22px; border-radius: 50%; border: 2px solid #d0d0d0;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 12px; color: transparent; transition: all 0.2s;
}
.check-dot.active { border-color: #ff2442; background: #ff2442; color: #fff; }

/* ==================== 响应式 ==================== */
@media (max-width: 768px) {
  .cart-item-card {
    padding: 12px;
    gap: 10px;
  }
  .item-thumb {
    width: 72px;
    height: 72px;
    border-radius: 8px;
  }
  .item-name {
    font-size: 14px;
  }
  .item-price {
    font-size: 16px;
  }
  .checkout-btn {
    height: 40px;
    padding: 0 24px;
    font-size: 14px;
    border-radius: 20px;
  }
  .total-price {
    font-size: 20px;
  }
}
</style>
