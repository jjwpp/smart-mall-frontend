<!-- ==================== 首页 - 现代电商风格 ==================== -->
<template>
  <div class="home-page">
    <!-- ========== 搜索栏 - 吸顶 pill 风格 ========== -->
    <div class="search-section">
      <div class="search-pill" @click="focusSearch">
        <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          ref="searchInputRef"
          v-model="keyword"
          type="text"
          placeholder="搜索心仪好物..."
          class="search-input"
          @keyup.enter="search"
        />
        <button v-if="keyword" class="search-clear" @click.stop="keyword = ''; search()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        <button class="search-btn" @click="search">搜索</button>
      </div>
    </div>

    <!-- ========== 轮播图 ========== -->
    <div class="carousel" @mouseenter="pauseAuto" @mouseleave="resumeAuto">
      <div class="carousel-viewport">
        <div
          class="carousel-track"
          :style="{ transform: `translateX(-${currentSlide * 100}%)` }"
        >
          <div
            class="carousel-slide"
            v-for="(img, idx) in banners"
            :key="idx"
          >
            <img :src="img" :alt="'Banner ' + (idx + 1)" class="slide-img" />
            <div class="slide-overlay">
              <div class="slide-tag">{{ bannerTags[idx] }}</div>
              <div class="slide-title">{{ bannerTitles[idx] }}</div>
              <div class="slide-subtitle">{{ bannerSubtitles[idx] }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 指示器 -->
      <div class="carousel-dots">
        <button
          v-for="(img, idx) in banners"
          :key="idx"
          :class="['dot', { active: idx === currentSlide }]"
          @click="goToSlide(idx)"
        ></button>
      </div>

      <!-- 箭头 -->
      <button class="carousel-arrow prev" @click="prevSlide">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <button class="carousel-arrow next" @click="nextSlide">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
      </button>

      <!-- 进度条 -->
      <div class="carousel-progress">
        <div class="progress-bar" :style="{ width: progressPercent + '%' }"></div>
      </div>
    </div>

    <!-- ========== 分类导航 - 横向滚动 pills ========== -->
    <div class="category-section" v-if="categories.length">
      <div class="category-scroll">
        <button
          :class="['category-pill', { active: selectedCategory === null }]"
          @click="selectedCategory = null; fetchProducts()"
        >
          <span class="pill-emoji">🔥</span>
          <span>全部</span>
        </button>
        <button
          v-for="cat in categories"
          :key="cat.id"
          :class="['category-pill', { active: selectedCategory === cat.id }]"
          @click="selectedCategory = cat.id; fetchProducts()"
        >
          <span class="pill-emoji">{{ getCatEmoji(cat.name, cat.id) }}</span>
          <span>{{ cat.name }}</span>
        </button>
      </div>
    </div>

    <!-- ========== 热销商品 ========== -->
    <div class="hot-section" v-if="hotProducts.length">
      <div class="hot-header">
        <div class="hot-title-row">
          <span class="hot-icon">🔥</span>
          <h2 class="hot-title">热销爆款</h2>
          <span class="hot-badge">TOP {{ hotProducts.length }}</span>
        </div>
      </div>
      <div class="hot-scroll">
        <div
          class="hot-card"
          v-for="p in hotProducts"
          :key="p.id"
          @click="$router.push(`/products/${p.id}`)"
        >
          <div class="hot-card-img">
            <img v-if="p.coverUrl" :src="p.coverUrl" :alt="p.name" loading="lazy" />
            <span v-else>📦</span>
            <div class="hot-rank-badge" v-if="p.sales">已售{{ p.sales }}</div>
          </div>
          <div class="hot-card-info">
            <div class="hot-card-name">{{ p.name }}</div>
            <div class="hot-card-price">¥{{ p.price }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ========== 商品区域标题 ========== -->
    <div class="section-header">
      <div class="header-left">
        <span class="header-icon">🛍️</span>
        <h2 class="header-title">{{ selectedCategory ? '分类商品' : '为你推荐' }}</h2>
        <span class="header-badge">{{ products.length }} 件好物</span>
      </div>
      <div class="header-right">
        <button class="sort-btn" @click="pageNum = 1; fetchProducts()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="14" y2="12"/><line x1="4" y1="18" x2="8" y2="18"/></svg>
          刷新
        </button>
      </div>
    </div>

    <!-- ========== 商品网格 ========== -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>正在加载好物...</p>
    </div>

    <div v-else-if="!products.length" class="empty-state">
      <div class="empty-illustration">
        <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
          <rect x="20" y="30" width="60" height="50" rx="8" stroke="#ddd" stroke-width="2.5" fill="#f9f9f9"/>
          <line x1="38" y1="48" x2="62" y2="48" stroke="#ddd" stroke-width="2.5" stroke-linecap="round"/>
          <line x1="33" y1="58" x2="67" y2="58" stroke="#eee" stroke-width="2" stroke-linecap="round"/>
          <line x1="40" y1="66" x2="60" y2="66" stroke="#eee" stroke-width="2" stroke-linecap="round"/>
          <circle cx="70" cy="28" r="12" fill="#f0f0f0" stroke="#ddd" stroke-width="2"/>
          <line x1="65" y1="28" x2="75" y2="28" stroke="#ccc" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
      </div>
      <p class="empty-title">暂无商品</p>
      <p class="empty-desc">换个关键词或分类试试吧</p>
      <button class="empty-btn" @click="keyword = ''; selectedCategory = null; fetchProducts()">查看全部商品</button>
    </div>

    <div v-else class="product-grid">
      <div
        class="product-card"
        v-for="p in products"
        :key="p.id"
        @click="$router.push(`/products/${p.id}`)"
      >
        <div class="card-image-wrap">
          <img
            v-if="p.coverUrl"
            :src="p.coverUrl"
            :alt="p.name"
            class="card-image"
            loading="lazy"
          />
          <div v-else class="card-image-placeholder">
            <span>📦</span>
            <span class="placeholder-text">暂无图片</span>
          </div>
          <div class="card-image-tag" v-if="p.subtitle">{{ p.subtitle }}</div>
        </div>
        <div class="card-body">
          <div class="card-name">{{ p.name }}</div>
          <div class="card-meta">
            <span class="card-sales">🔥 已售 {{ p.sales || 0 }}</span>
          </div>
          <div class="card-footer">
            <div class="card-price">
              <span class="price-symbol">¥</span>
              <span class="price-value">{{ formatPrice(p.price) }}</span>
            </div>
            <button class="card-buy-btn" @click.stop="$router.push(`/products/${p.id}`)">
              立即抢购
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ========== 分页 ========== -->
    <div class="pagination" v-if="totalPages > 1">
      <button
        class="page-btn prev-btn"
        :disabled="pageNum <= 1"
        @click="pageNum--; fetchProducts(); scrollToTop()"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        <span>上一页</span>
      </button>

      <div class="page-numbers">
        <button
          v-for="i in displayPages"
          :key="i"
          :class="['page-num', { active: i === pageNum, ellipsis: i === '...' }]"
          :disabled="i === '...'"
          @click="i !== '...' && (pageNum = i, fetchProducts(), scrollToTop())"
        >{{ i }}</button>
      </div>

      <button
        class="page-btn next-btn"
        :disabled="pageNum >= totalPages"
        @click="pageNum++; fetchProducts(); scrollToTop()"
      >
        <span>下一页</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { api } from '../../utils/api'
import b1 from '../../pic/b1.png'
import b2 from '../../pic/b2.png'
import b3 from '../../pic/b3.png'

// ======== 轮播 ========
const banners = [b1, b2, b3]
const bannerTags = ['限时特惠', '新品首发', '爆款推荐']
const bannerTitles = ['品质生活节', '潮流新品季', '超值好物榜']
const bannerSubtitles = ['全场低至5折，错过再等一年', '最新潮流单品，限时特价', '万人好评，口碑爆款']

const currentSlide = ref(0)
const progressPercent = ref(0)
let autoTimer = null
let progressTimer = null

function nextSlide() {
  currentSlide.value = (currentSlide.value + 1) % banners.length
  resetProgress()
}
function prevSlide() {
  currentSlide.value = (currentSlide.value - 1 + banners.length) % banners.length
  resetProgress()
}
function goToSlide(idx) {
  currentSlide.value = idx
  resetProgress()
}

function resetProgress() {
  progressPercent.value = 0
  clearInterval(progressTimer)
  startProgress()
}

function startProgress() {
  progressTimer = setInterval(() => {
    progressPercent.value += 0.5
    if (progressPercent.value >= 100) {
      progressPercent.value = 0
    }
  }, 20)
}

function pauseAuto() {
  clearInterval(autoTimer)
  clearInterval(progressTimer)
}
function resumeAuto() {
  autoTimer = setInterval(nextSlide, 4000)
  startProgress()
}

onMounted(() => {
  autoTimer = setInterval(nextSlide, 4000)
  startProgress()
})
onUnmounted(() => {
  clearInterval(autoTimer)
  clearInterval(progressTimer)
})

// ======== 搜索 ========
const keyword = ref('')
const searchInputRef = ref(null)
function focusSearch() {
  searchInputRef.value?.focus()
}

// ======== 商品数据 ========
const products = ref([])
const hotProducts = ref([])
const categories = ref([])
const selectedCategory = ref(null)
const pageNum = ref(1)
const pageSize = ref(12)
const totalPages = ref(0)
const loading = ref(false)

async function fetchHotProducts() {
  try { hotProducts.value = await api.getHotProducts() || [] } catch { /* ignore */ }
}

async function fetchCategories() {
  try {
    categories.value = await api.getCategories() || []
  } catch { /* ignore */ }
}

async function fetchProducts() {
  loading.value = true
  try {
    const params = { pageNum: pageNum.value, pageSize: pageSize.value }
    if (keyword.value) params.keyword = keyword.value
    if (selectedCategory.value) params.categoryId = selectedCategory.value
    const data = await api.getProducts(params)
    products.value = data?.records || []
    totalPages.value = data?.pages || Math.ceil((data?.total || 0) / pageSize.value)
  } catch {
    products.value = []
  } finally {
    loading.value = false
  }
}

function search() {
  pageNum.value = 1
  fetchProducts()
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// ======== 分页显示 ========
const displayPages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = pageNum.value
  const maxShow = 7

  if (total <= maxShow) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    pages.push(1)
    if (current > 3) pages.push('...')
    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (current < total - 2) pages.push('...')
    pages.push(total)
  }
  return pages
})

// ======== 分类表情映射 ========
const catEmojiMap = {
  '手机': '📱', '数码': '💻', '电脑': '🖥️', '家电': '🏠',
  '服装': '👗', '男装': '👔', '女装': '👚', '鞋靴': '👟',
  '箱包': '🎒', '美妆': '💄', '护肤': '🧴', '个护': '🪥',
  '食品': '🍜', '零食': '🍿', '饮料': '🥤', '生鲜': '🥬',
  '母婴': '👶', '玩具': '🧸', '运动': '⚽', '户外': '🏕️',
  '图书': '📚', '文具': '✏️', '办公': '🖨️', '家具': '🛋️',
  '厨具': '🍳', '家纺': '🛏️', '灯具': '💡', '日用': '🧹',
  '汽车': '🚗', '配件': '🔧', '珠宝': '💎', '手表': '⌚',
  '宠物': '🐾', '鲜花': '🌸', '绿植': '🌿', '医药': '💊',
  '保健': '💪', '水果': '🍎', '蔬菜': '🥦', '肉禽': '🥩',
  '海鲜': '🦐', '乳品': '🥛', '酒类': '🍷', '茶叶': '🍵'
}
const defaultEmojis = ['✨', '🎁', '🏷️', '🌟', '💝', '🎯', '🔮', '📌', '🎪', '💫']
function getCatEmoji(name, id) {
  for (const [key, emoji] of Object.entries(catEmojiMap)) {
    if (name && name.includes(key)) return emoji
  }
  return defaultEmojis[id % defaultEmojis.length]
}

// ======== 价格格式化 ========
function formatPrice(price) {
  if (price === undefined || price === null) return '0.00'
  const num = Number(price)
  if (isNaN(num)) return String(price)
  return num.toFixed(2)
}

onMounted(() => {
  fetchHotProducts()
  fetchCategories()
  fetchProducts()
})
</script>

<style scoped>
/* ==================== 设计变量 ==================== */
.home-page {
  --hp-red: #ff2442;
  --hp-red-light: #fff0f3;
  --hp-red-dark: #e01e3a;
  --hp-orange: #ff6b35;
  --hp-bg: #f6f6f6;
  --hp-white: #ffffff;
  --hp-text: #1a1a1a;
  --hp-text-secondary: #666666;
  --hp-text-light: #999999;
  --hp-border: #f0f0f0;
  --hp-shadow-card: 0 2px 8px rgba(0, 0, 0, 0.04);
  --hp-shadow-hover: 0 8px 24px rgba(0, 0, 0, 0.1);
  --hp-shadow-pill: 0 2px 12px rgba(0, 0, 0, 0.06);
  --hp-radius-card: 12px;
  --hp-radius-btn: 8px;
  --hp-radius-pill: 24px;
  --hp-radius-lg: 16px;
  --hp-transition: 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

/* ==================== 搜索栏 ==================== */
.search-section {
  position: sticky;
  top: 72px;
  z-index: 50;
  padding: 12px 0 16px;
  background: linear-gradient(180deg, var(--hp-bg) 60%, transparent);
  backdrop-filter: blur(8px);
}

.search-pill {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--hp-white);
  border-radius: var(--hp-radius-pill);
  padding: 12px 20px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.03);
  transition: all var(--hp-transition);
  cursor: text;
  max-width: 640px;
  margin: 0 auto;
}
.search-pill:focus-within {
  box-shadow: 0 4px 24px rgba(255, 36, 66, 0.12), 0 0 0 2px rgba(255, 36, 66, 0.15);
  transform: translateY(-1px);
}

.search-icon {
  color: var(--hp-text-light);
  flex-shrink: 0;
  transition: color var(--hp-transition);
}
.search-pill:focus-within .search-icon {
  color: var(--hp-red);
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 15px;
  color: var(--hp-text);
  background: transparent;
  font-family: inherit;
  min-width: 0;
}
.search-input::placeholder {
  color: #bbb;
  font-size: 14px;
}

.search-clear {
  background: none;
  border: none;
  cursor: pointer;
  color: #bbb;
  padding: 4px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--hp-transition);
  flex-shrink: 0;
}
.search-clear:hover {
  color: var(--hp-text-secondary);
  background: #f0f0f0;
}

.search-btn {
  background: var(--hp-red);
  color: #fff;
  border: none;
  padding: 8px 22px;
  border-radius: var(--hp-radius-pill);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--hp-transition);
  flex-shrink: 0;
  font-family: inherit;
  white-space: nowrap;
}
.search-btn:hover {
  background: var(--hp-red-dark);
  box-shadow: 0 4px 14px rgba(255, 36, 66, 0.35);
  transform: scale(1.03);
}
.search-btn:active {
  transform: scale(0.97);
}

/* ==================== 轮播图 ==================== */
.carousel {
  position: relative;
  width: 100%;
  height: 400px;
  border-radius: var(--hp-radius-lg);
  overflow: hidden;
  background: #e8e8e8;
  margin-bottom: 24px;
  box-shadow: var(--hp-shadow-card);
}

.carousel-viewport {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.carousel-track {
  display: flex;
  height: 100%;
  transition: transform 0.55s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.carousel-slide {
  min-width: 100%;
  height: 100%;
  position: relative;
}

.slide-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.slide-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 60px 40px 40px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.55));
  color: #fff;
}

.slide-tag {
  display: inline-block;
  background: var(--hp-red);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 14px;
  border-radius: var(--hp-radius-pill);
  margin-bottom: 10px;
  letter-spacing: 1px;
}

.slide-title {
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 4px;
  letter-spacing: 0.5px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.slide-subtitle {
  font-size: 14px;
  opacity: 0.9;
  letter-spacing: 0.3px;
}

/* 指示器 dots */
.carousel-dots {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 2;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.45);
  border: none;
  cursor: pointer;
  transition: all 0.35s ease;
  padding: 0;
  outline: none;
  backdrop-filter: blur(4px);
}
.dot:hover {
  background: rgba(255, 255, 255, 0.75);
}
.dot.active {
  background: #fff;
  width: 28px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

/* 箭头 */
.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.88);
  color: #333;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;
  z-index: 2;
  backdrop-filter: blur(6px);
}
.carousel-arrow:hover {
  background: #fff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}
.carousel:hover .carousel-arrow {
  opacity: 1;
}
.carousel-arrow.prev { left: 16px; }
.carousel-arrow.next { right: 16px; }

/* 进度条 */
.carousel-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(255, 255, 255, 0.2);
  z-index: 2;
}
.progress-bar {
  height: 100%;
  background: var(--hp-red);
  transition: width 0.05s linear;
  border-radius: 0 1.5px 1.5px 0;
}

/* ==================== 分类导航 ==================== */
.category-section {
  margin-bottom: 24px;
  padding: 4px 0;
}

.category-scroll {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding: 6px 4px;
  scroll-behavior: smooth;
}
.category-scroll::-webkit-scrollbar {
  display: none;
}

.category-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border-radius: var(--hp-radius-pill);
  border: 1.5px solid var(--hp-border);
  background: var(--hp-white);
  color: var(--hp-text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: all var(--hp-transition);
  font-family: inherit;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}
.category-pill:hover {
  border-color: #ffb3bf;
  color: var(--hp-red);
  background: var(--hp-red-light);
  transform: translateY(-2px);
  box-shadow: var(--hp-shadow-pill);
}
.category-pill.active {
  background: var(--hp-red);
  color: #fff;
  border-color: var(--hp-red);
  font-weight: 700;
  box-shadow: 0 4px 16px rgba(255, 36, 66, 0.3);
}
.category-pill.active:hover {
  background: var(--hp-red-dark);
  border-color: var(--hp-red-dark);
}

.pill-emoji {
  font-size: 16px;
  line-height: 1;
}

/* ==================== 热销爆款 ==================== */
.hot-section {
  margin-bottom: 28px;
}
.hot-header {
  margin-bottom: 14px;
}
.hot-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.hot-icon { font-size: 22px; }
.hot-title {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}
.hot-badge {
  font-size: 12px;
  background: linear-gradient(135deg, #ff2442, #ff7a45);
  color: #fff;
  padding: 2px 10px;
  border-radius: 12px;
  font-weight: 600;
}
.hot-scroll {
  display: flex;
  gap: 14px;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding-bottom: 4px;
}
.hot-scroll::-webkit-scrollbar { display: none; }
.hot-card {
  flex-shrink: 0;
  width: 150px;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,.06);
  cursor: pointer;
  transition: transform .2s, box-shadow .2s;
}
.hot-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 18px rgba(0,0,0,.1);
}
.hot-card-img {
  width: 150px;
  height: 150px;
  background: #f9f9f9;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}
.hot-card-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.hot-card-img span {
  font-size: 36px;
}
.hot-rank-badge {
  position: absolute;
  bottom: 6px;
  right: 6px;
  background: rgba(0,0,0,.55);
  color: #fff;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
}
.hot-card-info {
  padding: 10px 12px 12px;
}
.hot-card-name {
  font-size: 13px;
  font-weight: 500;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 4px;
}
.hot-card-price {
  font-size: 16px;
  font-weight: 700;
  color: #ff2442;
}

/* ==================== 区域标题 ==================== */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 14px;
  border-bottom: 2px solid #f5f5f5;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-icon {
  font-size: 22px;
}

.header-title {
  font-size: 20px;
  font-weight: 800;
  color: var(--hp-text);
  margin: 0;
}

.header-badge {
  font-size: 12px;
  color: var(--hp-text-light);
  background: #f5f5f5;
  padding: 3px 12px;
  border-radius: var(--hp-radius-pill);
  font-weight: 500;
}

.header-right {
  display: flex;
  gap: 8px;
}

.sort-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 7px 16px;
  border: 1.5px solid var(--hp-border);
  border-radius: var(--hp-radius-pill);
  background: var(--hp-white);
  color: var(--hp-text-secondary);
  font-size: 13px;
  cursor: pointer;
  font-family: inherit;
  transition: all var(--hp-transition);
}
.sort-btn:hover {
  border-color: #ccc;
  color: var(--hp-text);
  background: #fafafa;
}

/* ==================== 商品网格 ==================== */
.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
}

/* ==================== 商品卡片 ==================== */
.product-card {
  background: var(--hp-white);
  border-radius: var(--hp-radius-card);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--hp-shadow-card);
  border: 1px solid #f5f5f5;
}
.product-card:hover {
  transform: translateY(-6px);
  box-shadow: var(--hp-shadow-hover);
  border-color: #ffe0e0;
}
.product-card:active {
  transform: translateY(-2px);
}

.card-image-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  background: #fafafa;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.4s ease;
}
.product-card:hover .card-image {
  transform: scale(1.06);
}

.card-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #ddd;
  font-size: 42px;
  gap: 4px;
}
.placeholder-text {
  font-size: 12px;
  color: #ccc;
}

.card-image-tag {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(8px);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 4px;
  max-width: calc(100% - 20px);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  letter-spacing: 0.3px;
}

.card-body {
  padding: 14px 14px 16px;
}

.card-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--hp-text);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 8px;
  min-height: 38px;
}

.card-meta {
  margin-bottom: 12px;
}

.card-sales {
  font-size: 12px;
  color: var(--hp-text-light);
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.card-price {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.price-symbol {
  font-size: 13px;
  font-weight: 700;
  color: var(--hp-red);
}

.price-value {
  font-size: 22px;
  font-weight: 800;
  color: var(--hp-red);
  line-height: 1;
  letter-spacing: -0.5px;
}

.card-buy-btn {
  background: linear-gradient(135deg, var(--hp-red), var(--hp-red-dark));
  color: #fff;
  border: none;
  padding: 7px 16px;
  border-radius: var(--hp-radius-btn);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all var(--hp-transition);
  font-family: inherit;
  white-space: nowrap;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}
.card-buy-btn:hover {
  box-shadow: 0 4px 14px rgba(255, 36, 66, 0.4);
  transform: scale(1.05);
}
.card-buy-btn:active {
  transform: scale(0.95);
}

/* ==================== 加载状态 ==================== */
.loading-state {
  text-align: center;
  padding: 80px 20px;
}

.loading-spinner {
  width: 44px;
  height: 44px;
  border: 3.5px solid #f0f0f0;
  border-top-color: var(--hp-red);
  border-radius: 50%;
  margin: 0 auto 18px;
  animation: hp-spin 0.7s linear infinite;
}

.loading-state p {
  color: var(--hp-text-light);
  font-size: 14px;
  margin: 0;
}

@keyframes hp-spin {
  to { transform: rotate(360deg); }
}

/* ==================== 空状态 ==================== */
.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-illustration {
  margin-bottom: 20px;
}

.empty-title {
  font-size: 17px;
  font-weight: 700;
  color: var(--hp-text);
  margin: 0 0 6px;
}

.empty-desc {
  font-size: 14px;
  color: var(--hp-text-light);
  margin: 0 0 20px;
}

.empty-btn {
  background: var(--hp-red);
  color: #fff;
  border: none;
  padding: 10px 28px;
  border-radius: var(--hp-radius-pill);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all var(--hp-transition);
}
.empty-btn:hover {
  background: var(--hp-red-dark);
  box-shadow: 0 4px 14px rgba(255, 36, 66, 0.35);
}

/* ==================== 分页 ==================== */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  margin-top: 36px;
  padding-top: 24px;
  border-top: 1px solid #f5f5f5;
  flex-wrap: wrap;
}

.page-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 10px 18px;
  border: 1.5px solid #e8e8e8;
  border-radius: var(--hp-radius-btn);
  background: var(--hp-white);
  color: var(--hp-text-secondary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--hp-transition);
  font-family: inherit;
}
.page-btn:hover:not(:disabled) {
  border-color: var(--hp-red);
  color: var(--hp-red);
  background: var(--hp-red-light);
}
.page-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 4px;
  align-items: center;
}

.page-num {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid #e8e8e8;
  border-radius: var(--hp-radius-btn);
  background: var(--hp-white);
  color: var(--hp-text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--hp-transition);
  font-family: inherit;
  padding: 0;
}
.page-num:hover:not(:disabled):not(.ellipsis) {
  border-color: var(--hp-red);
  color: var(--hp-red);
}
.page-num.active {
  background: var(--hp-red);
  color: #fff;
  border-color: var(--hp-red);
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(255, 36, 66, 0.3);
}
.page-num.ellipsis {
  cursor: default;
  border: none;
  background: transparent;
  color: #ccc;
  font-size: 16px;
}

/* ==================== 响应式 - 平板 ==================== */
@media (max-width: 1024px) {
  .product-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
  }

  .carousel {
    height: 320px;
  }

  .slide-title {
    font-size: 24px;
  }

  .slide-overlay {
    padding: 50px 30px 30px;
  }
}

/* ==================== 响应式 - 手机 ==================== */
@media (max-width: 768px) {
  .search-section {
    top: 60px;
    padding: 8px 0 12px;
  }

  .search-pill {
    padding: 10px 16px;
    margin: 0 8px;
  }

  .search-input {
    font-size: 14px;
  }

  .search-btn {
    padding: 7px 16px;
    font-size: 13px;
  }

  .carousel {
    height: 200px;
    border-radius: 12px;
    margin-bottom: 18px;
  }

  .slide-overlay {
    padding: 40px 20px 24px;
  }

  .slide-tag {
    font-size: 10px;
    padding: 3px 10px;
  }

  .slide-title {
    font-size: 18px;
  }

  .slide-subtitle {
    font-size: 12px;
  }

  .carousel-arrow {
    width: 34px;
    height: 34px;
  }

  .carousel-arrow.prev { left: 8px; }
  .carousel-arrow.next { right: 8px; }

  .carousel-arrow svg {
    width: 16px;
    height: 16px;
  }

  .category-pill {
    padding: 8px 16px;
    font-size: 13px;
  }

  .pill-emoji {
    font-size: 14px;
  }

  .product-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .card-body {
    padding: 10px 10px 12px;
  }

  .card-name {
    font-size: 13px;
    min-height: 34px;
    margin-bottom: 6px;
  }

  .price-value {
    font-size: 18px;
  }

  .card-buy-btn {
    padding: 5px 12px;
    font-size: 11px;
  }

  .section-header {
    margin-bottom: 14px;
    padding-bottom: 10px;
  }

  .header-title {
    font-size: 17px;
  }

  .header-badge {
    display: none;
  }

  .pagination {
    gap: 4px;
    margin-top: 24px;
    padding-top: 16px;
  }

  .page-btn {
    padding: 8px 14px;
    font-size: 12px;
  }

  .page-num {
    width: 34px;
    height: 34px;
    font-size: 13px;
  }
}

/* ==================== 响应式 - 小屏手机 ==================== */
@media (max-width: 380px) {
  .product-grid {
    gap: 8px;
  }

  .card-body {
    padding: 8px 8px 10px;
  }

  .card-name {
    font-size: 12px;
    min-height: 30px;
  }

  .price-value {
    font-size: 16px;
  }

  .price-symbol {
    font-size: 11px;
  }

  .card-buy-btn {
    padding: 4px 10px;
    font-size: 10px;
    letter-spacing: 0;
  }

  .category-pill {
    padding: 7px 12px;
    font-size: 12px;
  }

  .category-scroll {
    gap: 8px;
  }

  .carousel {
    height: 180px;
  }
}
</style>
