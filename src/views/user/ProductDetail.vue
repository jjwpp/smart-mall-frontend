<!-- ==================== 商品详情页 ==================== -->
<template>
  <div v-if="loading" class="loading-text">加载中...</div>
  <div v-else-if="!product" class="empty-state"><div class="icon">📦</div><p>商品不存在</p></div>
  <div v-else class="product-detail">
    <!-- 桌面端：左右布局 -->
    <div class="detail-layout">
      <!-- 左侧：商品图片 -->
      <div class="detail-gallery">
        <!-- 主图 -->
        <div class="main-image-wrap">
          <img
            v-if="selectedSku?.imageUrl || product.coverUrl"
            :src="selectedSku?.imageUrl || product.coverUrl"
            :alt="product.name"
            class="main-image"
          />
          <div v-else class="main-image-placeholder">📦</div>
        </div>
        <!-- SKU 迷你图库 -->
        <div class="sku-gallery" v-if="skus.length > 0">
          <div
            v-for="sku in skus"
            :key="sku.id"
            :class="['sku-thumb', { 'sku-thumb-active': selectedSku?.id === sku.id }]"
            @click="selectedSku = sku"
          >
            <img v-if="sku.imageUrl" :src="sku.imageUrl" :alt="sku.skuName" />
            <span v-else>📦</span>
          </div>
        </div>
      </div>

      <!-- 右侧：商品信息 -->
      <div class="detail-info">
        <!-- 商品名 -->
        <h1 class="product-title">{{ product.name }}</h1>
        <p class="product-subtitle" v-if="product.subtitle">{{ product.subtitle }}</p>

        <!-- 价格区 -->
        <div class="price-area">
          <div class="price-row">
            <span class="price-symbol">¥</span>
            <span class="price-value">{{ product.price }}</span>
            <span class="sales-badge" v-if="product.sales">已售 {{ product.sales }}</span>
            <span :class="['status-tag', product.status === 1 ? 'status-on' : 'status-off']">
              {{ product.status === 1 ? '在售' : '已下架' }}
            </span>
          </div>
          <div class="stock-row">
            <span>库存 {{ product.stock || 0 }} 件</span>
          </div>
        </div>

        <!-- SKU 选择 -->
        <div class="sku-section" v-if="skus.length">
          <div class="section-label">规格选择</div>
          <div class="sku-chip-list">
            <button
              v-for="sku in skus"
              :key="sku.id"
              :class="['sku-chip', { 'sku-chip-active': selectedSku?.id === sku.id }]"
              @click="selectedSku = sku"
            >
              <img v-if="sku.imageUrl" :src="sku.imageUrl" class="sku-chip-img" />
              <span class="sku-chip-name">{{ sku.skuName }}</span>
              <span class="sku-chip-price">¥{{ sku.price }}</span>
            </button>
          </div>
        </div>

        <!-- 数量 -->
        <div class="qty-section">
          <span class="section-label">数量</span>
          <div class="qty-stepper">
            <button class="qty-btn" @click="qty > 1 && qty--" :disabled="qty <= 1" aria-label="减少">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
            <span class="qty-value">{{ qty }}</span>
            <button class="qty-btn qty-btn-plus" @click="qty++" aria-label="增加">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
          </div>
        </div>

        <!-- 操作按钮（桌面端） -->
        <div class="action-buttons desktop-actions">
          <button :class="['btn-fav', { favorited }]" @click="toggleFav">
            {{ favorited ? '❤️' : '🤍' }} {{ favorited ? '已收藏' : '收藏' }}
          </button>
          <button class="btn-cart" @click="addToCart">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            加入购物车
          </button>
          <button class="btn-buy" @click="buyNow">立即购买</button>
        </div>

        <!-- 消息 -->
        <p v-if="msg" :class="['msg-tip', msgType === 'success' ? 'msg-success' : 'msg-error']">{{ msg }}</p>
      </div>
    </div>

    <!-- 商品描述（可折叠） -->
    <div class="info-card" v-if="product.description">
      <div class="card-header" @click="descOpen = !descOpen">
        <h3 class="card-title">商品详情</h3>
        <svg :class="['arrow-icon', { open: descOpen }]" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
      </div>
      <transition name="collapse">
        <div v-if="descOpen" class="card-body" v-html="product.description"></div>
      </transition>
    </div>

    <!-- 商品评价 -->
    <div class="info-card">
      <div class="card-header" @click="reviewsOpen = !reviewsOpen">
        <h3 class="card-title">用户评价</h3>
        <span class="review-count" v-if="reviews.length">{{ reviews.length }} 条</span>
        <svg :class="['arrow-icon', { open: reviewsOpen }]" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
      </div>
      <transition name="collapse">
        <div v-if="reviewsOpen">
          <div v-if="!reviews.length" class="empty-reviews">
            <div class="empty-reviews-icon">✍️</div>
            <p>暂无评价，快来成为第一个评价的人吧</p>
          </div>
          <div v-else class="review-list">
            <div v-for="r in reviews" :key="r.id" class="review-item">
              <div class="review-avatar">
                <span>{{ (r.userName || r.username || '匿')[0] }}</span>
              </div>
              <div class="review-body">
                <div class="review-head">
                  <span class="review-stars">
                    <svg v-for="n in 5" :key="n" width="14" height="14" viewBox="0 0 24 24" :fill="n <= r.rating ? '#ff9500' : '#e0e0e0'" stroke="none">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26"/>
                    </svg>
                  </span>
                  <span class="review-date">{{ r.createdAt?.slice(0, 10) }}</span>
                </div>
                <p class="review-content" v-if="r.content">{{ r.content }}</p>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>

    <!-- 移动端底部固定栏 -->
    <div class="mobile-bar">
      <div class="mobile-bar-left">
        <span class="mobile-bar-price">
          <span class="price-symbol">¥</span>{{ product.price }}
        </span>
      </div>
      <div class="mobile-bar-right">
        <button class="btn-cart" @click="addToCart">加入购物车</button>
        <button class="btn-buy" @click="buyNow">立即购买</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'
import { useCartStore } from '../../stores/cart'
import { api } from '../../utils/api'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const cartStore = useCartStore()

const product = ref(null)
const skus = ref([])
const selectedSku = ref(null)
const qty = ref(1)
const reviews = ref([])
const loading = ref(true)
const msg = ref('')
const msgType = ref('')
const favorited = ref(false)
const descOpen = ref(true)
const reviewsOpen = ref(true)

async function fetchDetail() {
  loading.value = true
  try {
    const id = route.params.id
    product.value = await api.getProductDetail(id)
    skus.value = await api.getProductSkus(id) || []
    if (skus.value.length) selectedSku.value = skus.value[0]
    const revData = await api.getProductReviews(id)
    reviews.value = revData?.records || revData || []
  } catch (e) {
    msg.value = '加载商品信息失败'
    msgType.value = 'error'
  } finally {
    loading.value = false
  }
}

async function toggleFav() {
  if (!userStore.userId) return alert('请先登录')
  try {
    const r = await api.toggleFavorite(route.params.id, userStore.userId, userStore.token)
    favorited.value = r?.favorited || false
  } catch (e) { alert(e.message) }
}

async function addToCart() {
  if (!userStore.isLoggedIn) { router.push('/login'); return }
  msg.value = ''
  try {
    await cartStore.addItem({
      userId: userStore.userId,
      productId: product.value.id,
      skuId: selectedSku.value?.id || null,
      quantity: qty.value,
      selected: 1
    })
    msg.value = '已加入购物车！'
    msgType.value = 'success'
  } catch (e) {
    msg.value = e.message || '添加失败'
    msgType.value = 'error'
  }
}

function buyNow() {
  if (!userStore.isLoggedIn) { router.push('/login'); return }
  addToCart().then(() => router.push('/cart'))
}

onMounted(fetchDetail)
</script>

<style scoped>
/* ==================== 变量 ==================== */
.pd-red { color: #ff2442; }

/* ==================== 布局 ==================== */
.product-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding-bottom: 80px;
}

.detail-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  background: #fff;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}

@media (max-width: 768px) {
  .detail-layout {
    grid-template-columns: 1fr;
    gap: 24px;
    padding: 0;
    background: transparent;
    box-shadow: none;
    border-radius: 0;
  }
}

/* ==================== 图片区 ==================== */
.detail-gallery {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.main-image-wrap {
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 12px;
  overflow: hidden;
  background: #fafafa;
  border: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.main-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;
}
.main-image:hover {
  transform: scale(1.02);
}

.main-image-placeholder {
  font-size: 80px;
  color: #ddd;
}

/* SKU 迷你图库 */
.sku-gallery {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.sku-thumb {
  width: 64px;
  height: 64px;
  border-radius: 8px;
  border: 2px solid #e8e8e8;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
}
.sku-thumb:hover {
  border-color: #ff2442;
}
.sku-thumb-active {
  border-color: #ff2442;
  box-shadow: 0 0 0 2px rgba(255,36,66,0.15);
}
.sku-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.sku-thumb span {
  font-size: 24px;
  color: #ccc;
}

/* ==================== 信息区 ==================== */
.product-title {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.4;
  margin-bottom: 6px;
}
.product-subtitle {
  font-size: 14px;
  color: #999;
  margin-bottom: 16px;
}

/* 价格 */
.price-area {
  background: linear-gradient(135deg, #fff5f7, #fff0f2);
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 20px;
}

.price-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
  flex-wrap: wrap;
}

.price-symbol {
  font-size: 18px;
  font-weight: 700;
  color: #ff2442;
}

.price-value {
  font-size: 38px;
  font-weight: 800;
  color: #ff2442;
  line-height: 1;
  letter-spacing: -1px;
}

.sales-badge {
  display: inline-block;
  background: #ff2442;
  color: #fff;
  font-size: 12px;
  padding: 2px 10px;
  border-radius: 10px;
  font-weight: 500;
  margin-left: 8px;
  vertical-align: middle;
}

.status-tag {
  display: inline-block;
  font-size: 12px;
  padding: 2px 10px;
  border-radius: 10px;
  font-weight: 500;
  margin-left: 6px;
}
.status-on {
  background: #e8f5e9;
  color: #4caf50;
}
.status-off {
  background: #f5f5f5;
  color: #999;
}

.stock-row {
  margin-top: 8px;
  font-size: 13px;
  color: #999;
}

/* 通用区段标签 */
.section-label {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
}

/* ==================== SKU 选择 ==================== */
.sku-section {
  margin-bottom: 20px;
}

.sku-chip-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.sku-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 2px solid #e8e8e8;
  border-radius: 24px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 13px;
}
.sku-chip:hover {
  border-color: #ff8593;
}
.sku-chip-active {
  border-color: #ff2442;
  background: #fff5f7;
  box-shadow: 0 2px 8px rgba(255,36,66,0.12);
}

.sku-chip-img {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  object-fit: cover;
}

.sku-chip-name {
  font-weight: 500;
  color: #333;
}
.sku-chip-active .sku-chip-name {
  color: #ff2442;
}

.sku-chip-price {
  color: #ff2442;
  font-weight: 600;
}

/* ==================== 数量选择器 ==================== */
.qty-section {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}
.qty-section .section-label {
  margin-bottom: 0;
  white-space: nowrap;
}

.qty-stepper {
  display: inline-flex;
  align-items: center;
  border: 2px solid #e8e8e8;
  border-radius: 10px;
  overflow: hidden;
  background: #fff;
}

.qty-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  border: none;
  cursor: pointer;
  transition: all 0.15s ease;
  color: #666;
  padding: 0;
  border-radius: 0;
}
.qty-btn:hover:not(:disabled) {
  background: #f0f0f0;
  color: #333;
}
.qty-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
.qty-btn-plus {
  color: #ff2442;
}

.qty-value {
  width: 52px;
  text-align: center;
  font-size: 16px;
  font-weight: 700;
  color: #333;
  user-select: none;
}

/* ==================== 操作按钮 ==================== */
.action-buttons {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.btn-cart {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 180px;
  height: 48px;
  border: 2px solid #ff2442;
  border-radius: 24px;
  background: #fff;
  color: #ff2442;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0 24px;
}
.btn-cart:hover {
  background: #fff5f7;
  box-shadow: 0 4px 12px rgba(255,36,66,0.1);
}

.btn-buy {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 180px;
  height: 48px;
  border: none;
  border-radius: 24px;
  background: linear-gradient(135deg, #ff2442, #ff4757);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0 24px;
  box-shadow: 0 4px 14px rgba(255,36,66,0.35);
}
.btn-buy:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(255,36,66,0.45);
}

/* 桌面端显示 */
.desktop-actions {
  display: flex;
}
@media (max-width: 768px) {
  .desktop-actions {
    display: none;
  }
}

/* 消息提示 */
.msg-tip {
  font-size: 13px;
  padding: 8px 0;
  animation: msgFadeIn 0.3s ease;
}
.msg-success {
  color: #4caf50;
}
.msg-error {
  color: #ff2442;
}

@keyframes msgFadeIn {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ==================== 信息卡片（描述/评价） ==================== */
.info-card {
  background: #fff;
  border-radius: 12px;
  margin-top: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 24px;
  cursor: pointer;
  user-select: none;
  transition: background 0.15s ease;
}
.card-header:hover {
  background: #fafafa;
}

.card-title {
  font-size: 17px;
  font-weight: 700;
  color: #1a1a1a;
  flex: 1;
  margin: 0;
  padding: 0;
  border: none;
}

.review-count {
  font-size: 13px;
  color: #999;
}

.arrow-icon {
  flex-shrink: 0;
  color: #bbb;
  transition: transform 0.25s ease;
}
.arrow-icon.open {
  transform: rotate(180deg);
}

.card-body {
  padding: 0 24px 24px;
  line-height: 1.8;
  color: #555;
  font-size: 14px;
}
.card-body :deep(img) {
  max-width: 100%;
  border-radius: 8px;
}

/* 折叠过渡 */
.collapse-enter-active,
.collapse-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}
.collapse-enter-from,
.collapse-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}

/* ==================== 评价区 ==================== */
.empty-reviews {
  text-align: center;
  padding: 40px 0;
  color: #bbb;
}
.empty-reviews-icon {
  font-size: 40px;
  margin-bottom: 10px;
}
.empty-reviews p {
  font-size: 14px;
}

.review-list {
  padding: 0 24px 24px;
}

.review-item {
  display: flex;
  gap: 14px;
  padding: 16px 0;
  border-bottom: 1px solid #f5f5f5;
}
.review-item:last-child {
  border-bottom: none;
}

.review-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff2442, #ff6b81);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 600;
  flex-shrink: 0;
}

.review-body {
  flex: 1;
  min-width: 0;
}

.review-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.review-stars {
  display: flex;
  gap: 2px;
}

.review-date {
  font-size: 12px;
  color: #bbb;
}

.review-content {
  font-size: 14px;
  color: #555;
  line-height: 1.6;
  word-break: break-word;
}

/* ==================== 移动端底部固定栏 ==================== */
.mobile-bar {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-top: 1px solid #f0f0f0;
  padding: 10px 16px;
  padding-bottom: calc(10px + env(safe-area-inset-bottom));
  z-index: 50;
  box-shadow: 0 -2px 12px rgba(0,0,0,0.06);
}

.mobile-bar-left {
  display: flex;
  align-items: center;
}

.mobile-bar-price {
  font-size: 24px;
  font-weight: 800;
  color: #ff2442;
}
.mobile-bar-price .price-symbol {
  font-size: 16px;
}

.mobile-bar-right {
  display: flex;
  gap: 10px;
}

.mobile-bar-right .btn-cart,
.mobile-bar-right .btn-buy {
  width: auto;
  height: 40px;
  font-size: 14px;
  padding: 0 20px;
  border-radius: 20px;
}

@media (max-width: 768px) {
  .mobile-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .product-detail {
    padding-bottom: 80px;
  }
  .info-card {
    border-radius: 0;
    margin-left: -16px;
    margin-right: -16px;
  }
}
</style>
