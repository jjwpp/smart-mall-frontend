<!-- ==================== 管理控制台 ==================== -->
<template>
  <div class="dashboard">
    <!-- 面包屑 + 欢迎头部 -->
    <div class="dash-breadcrumb">
      <span class="breadcrumb-item">首页</span>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
      <span class="breadcrumb-item active">管理控制台</span>
    </div>

    <div class="dash-header">
      <div class="header-left">
        <h2 class="header-title">管理控制台</h2>
        <p class="header-subtitle">欢迎回来，{{ userStore.currentUser?.nickname || userStore.currentUser?.username }}</p>
      </div>
      <div class="header-date">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1677ff" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        <span>{{ today }}</span>
      </div>
    </div>

    <!-- ===== 统计卡片 ===== -->
    <div class="stat-grid">
      <!-- 用户总数 - Blue -->
      <div class="stat-card">
        <div class="stat-icon-wrap stat-icon-blue">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <div class="stat-body">
          <div class="stat-value">{{ animated.users }}</div>
          <div class="stat-label">用户总数</div>
        </div>
        <div class="stat-accent stat-accent-blue"></div>
      </div>

      <!-- 商品总数 - Green -->
      <div class="stat-card">
        <div class="stat-icon-wrap stat-icon-green">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
            <line x1="12" y1="22.08" x2="12" y2="12"/>
          </svg>
        </div>
        <div class="stat-body">
          <div class="stat-value">{{ animated.products }}</div>
          <div class="stat-label">商品总数</div>
        </div>
        <div class="stat-accent stat-accent-green"></div>
      </div>

      <!-- 订单总数 - Orange -->
      <div class="stat-card">
        <div class="stat-icon-wrap stat-icon-orange">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
        </div>
        <div class="stat-body">
          <div class="stat-value">{{ animated.orders }}</div>
          <div class="stat-label">订单总数</div>
        </div>
        <div class="stat-accent stat-accent-orange"></div>
      </div>

      <!-- 今日销售额 - Red -->
      <div class="stat-card">
        <div class="stat-icon-wrap stat-icon-red">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <rect x="2" y="4" width="20" height="16" rx="2"/>
            <line x1="12" y1="10" x2="12" y2="16"/>
            <line x1="15" y1="13" x2="9" y2="13"/>
          </svg>
        </div>
        <div class="stat-body">
          <div class="stat-value">{{ animated.payments }}</div>
          <div class="stat-label">今日销售额</div>
        </div>
        <div class="stat-accent stat-accent-red"></div>
      </div>
    </div>

    <!-- ===== 图表区域 ===== -->
    <div class="charts-grid">
      <div class="panel chart-panel">
        <h3 class="panel-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1677ff" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          销售趋势
        </h3>
        <div class="chart-placeholder">
          <div class="chart-fake-line">
            <svg width="100%" height="100%" viewBox="0 0 600 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#1677ff" stop-opacity="0.15"/>
                  <stop offset="100%" stop-color="#1677ff" stop-opacity="0.02"/>
                </linearGradient>
              </defs>
              <path d="M0,160 L50,140 L100,155 L150,120 L200,100 L250,115 L300,70 L350,85 L400,50 L450,60 L500,30 L550,40 L600,20" fill="none" stroke="#1677ff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M0,160 L50,140 L100,155 L150,120 L200,100 L250,115 L300,70 L350,85 L400,50 L450,60 L500,30 L550,40 L600,20 L600,200 L0,200 Z" fill="url(#lineGrad)"/>
              <circle cx="600" cy="20" r="4" fill="#1677ff"/>
              <circle cx="500" cy="30" r="4" fill="#1677ff"/>
              <circle cx="400" cy="50" r="4" fill="#1677ff"/>
              <circle cx="300" cy="70" r="4" fill="#1677ff"/>
              <circle cx="200" cy="100" r="4" fill="#1677ff"/>
              <circle cx="100" cy="155" r="4" fill="#1677ff"/>
            </svg>
          </div>
          <div class="chart-axis-labels">
            <span>1月</span><span>2月</span><span>3月</span><span>4月</span><span>5月</span><span>6月</span>
          </div>
        </div>
      </div>

      <div class="panel chart-panel">
        <h3 class="panel-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1677ff" stroke-width="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
          订单分布
        </h3>
        <div class="chart-placeholder">
          <div class="chart-fake-donut">
            <svg width="140" height="140" viewBox="0 0 140 140">
              <circle cx="70" cy="70" r="50" fill="none" stroke="#f0f0f0" stroke-width="20"/>
              <circle cx="70" cy="70" r="50" fill="none" stroke="#1677ff" stroke-width="20" stroke-dasharray="157 314" stroke-dashoffset="0" transform="rotate(-90 70 70)" stroke-linecap="round"/>
              <circle cx="70" cy="70" r="50" fill="none" stroke="#52c41a" stroke-width="20" stroke-dasharray="78 314" stroke-dashoffset="-157" transform="rotate(-90 70 70)" stroke-linecap="round"/>
              <circle cx="70" cy="70" r="50" fill="none" stroke="#faad14" stroke-width="20" stroke-dasharray="47 314" stroke-dashoffset="-235" transform="rotate(-90 70 70)" stroke-linecap="round"/>
              <circle cx="70" cy="70" r="50" fill="none" stroke="#ff4d4f" stroke-width="20" stroke-dasharray="31 314" stroke-dashoffset="-282" transform="rotate(-90 70 70)" stroke-linecap="round"/>
            </svg>
            <div class="donut-legend">
              <div class="legend-item"><span class="legend-dot" style="background:#1677ff"></span>已完成 50%</div>
              <div class="legend-item"><span class="legend-dot" style="background:#52c41a"></span>已发货 25%</div>
              <div class="legend-item"><span class="legend-dot" style="background:#faad14"></span>待付款 15%</div>
              <div class="legend-item"><span class="legend-dot" style="background:#ff4d4f"></span>已取消 10%</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== 快捷入口 ===== -->
    <div class="panel quick-panel">
      <h3 class="panel-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1677ff" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        快捷管理入口
      </h3>
      <div class="quick-links">
        <router-link to="/admin/users" class="ql-item">
          <div class="ql-icon-wrap ql-bg-blue">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          </div>
          <span class="ql-text">用户管理</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </router-link>
        <router-link to="/admin/roles" class="ql-item">
          <div class="ql-icon-wrap ql-bg-purple">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <span class="ql-text">角色管理</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </router-link>
        <router-link to="/admin/categories" class="ql-item">
          <div class="ql-icon-wrap ql-bg-green">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
          </div>
          <span class="ql-text">分类管理</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </router-link>
        <router-link to="/admin/products" class="ql-item">
          <div class="ql-icon-wrap ql-bg-orange">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>
          </div>
          <span class="ql-text">商品管理</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </router-link>
        <router-link to="/admin/orders" class="ql-item">
          <div class="ql-icon-wrap ql-bg-cyan">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <span class="ql-text">订单管理</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </router-link>
        <router-link to="/admin/payments" class="ql-item">
          <div class="ql-icon-wrap ql-bg-teal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="12" y1="10" x2="12" y2="16"/><line x1="15" y1="13" x2="9" y2="13"/></svg>
          </div>
          <span class="ql-text">支付管理</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </router-link>
        <router-link to="/admin/reviews" class="ql-item">
          <div class="ql-icon-wrap ql-bg-yellow">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          </div>
          <span class="ql-text">评价管理</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </router-link>
      </div>
    </div>

    <!-- ===== 系统信息 ===== -->
    <div class="panel sys-panel">
      <h3 class="panel-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1677ff" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        系统信息
      </h3>
      <div class="sys-info-list">
        <div class="si-row">
          <span class="si-label">系统名称</span>
          <span class="si-value">Smart Mall 智能商城</span>
        </div>
        <div class="si-row">
          <span class="si-label">后端框架</span>
          <span class="si-value">Spring Boot 3 + MyBatis-Plus</span>
        </div>
        <div class="si-row">
          <span class="si-label">前端框架</span>
          <span class="si-value">Vue 3 + Vite + Pinia</span>
        </div>
        <div class="si-row">
          <span class="si-label">数据库</span>
          <span class="si-value">MySQL 8.0 (smart_mall)</span>
        </div>
        <div class="si-row">
          <span class="si-label">当前时间</span>
          <span class="si-value">{{ now }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, onUnmounted } from 'vue'
import { useUserStore } from '../../stores/user'
import { api } from '../../utils/api'

const userStore = useUserStore()
const stats = reactive({ users: 0, products: 0, orders: 0, payments: 0 })
const animated = reactive({ users: 0, products: 0, orders: 0, payments: 0 })
const today = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })
const now = ref(new Date().toLocaleString('zh-CN'))
let clockTimer = null

function animateValue(key, target) {
  const start = animated[key]
  const diff = target - start
  const duration = 600
  const step = Math.ceil(diff / (duration / 16))
  let current = start
  const timer = setInterval(() => {
    current += step
    if ((step > 0 && current >= target) || (step < 0 && current <= target)) {
      animated[key] = target
      clearInterval(timer)
    } else {
      animated[key] = current
    }
  }, 16)
}

onMounted(async () => {
  const token = userStore.token
  try {
    const [users, products, orders, payments] = await Promise.all([
      api.getAdminUsers({ pageNum: 1, pageSize: 1 }, token).catch(() => ({ total: 0 })),
      api.getAdminProducts({ pageNum: 1, pageSize: 1 }, token).catch(() => ({ total: 0 })),
      api.getAdminOrders({ pageNum: 1, pageSize: 1 }, token).catch(() => ({ total: 0 })),
      api.getAdminPayments({ pageNum: 1, pageSize: 1 }, token).catch(() => ({ total: 0 }))
    ])
    stats.users = users?.total || 0
    stats.products = products?.total || 0
    stats.orders = orders?.total || 0
    stats.payments = payments?.total || 0
    animateValue('users', stats.users)
    animateValue('products', stats.products)
    animateValue('orders', stats.orders)
    animateValue('payments', stats.payments)
  } catch {}

  clockTimer = setInterval(() => {
    now.value = new Date().toLocaleString('zh-CN')
  }, 1000)
})

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer)
})
</script>

<style scoped>
/* ==================== Design Tokens ==================== */
.dashboard {
  --primary: #1677ff;
  --primary-light: #e6f4ff;
  --primary-dark: #0958d9;
  --success: #52c41a;
  --warning: #faad14;
  --danger: #ff4d4f;
  --page-bg: #f5f7fa;
  --card-bg: #ffffff;
  --text-main: #1f1f1f;
  --text-secondary: #666;
  --text-muted: #999;
  --border: #f0f0f0;
  --card-shadow: 0 1px 2px rgba(0,0,0,0.03), 0 1px 6px -1px rgba(0,0,0,0.02);
  --card-radius: 8px;
}

/* ==================== Container ==================== */
.dashboard {
  animation: fadeIn 0.35s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ==================== Breadcrumb ==================== */
.dash-breadcrumb {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  font-size: 13px;
}

.breadcrumb-item {
  color: var(--text-muted);
}

.breadcrumb-item.active {
  color: var(--text-main);
  font-weight: 500;
}

/* ==================== Welcome Header ==================== */
.dash-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-main);
  margin: 0 0 4px 0;
  letter-spacing: -0.3px;
}

.header-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
}

.header-date {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-secondary);
  background: var(--card-bg);
  padding: 10px 18px;
  border-radius: var(--card-radius);
  box-shadow: var(--card-shadow);
  white-space: nowrap;
  border: 1px solid var(--border);
}

/* ==================== Stat Cards ==================== */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: var(--card-bg);
  border-radius: var(--card-radius);
  padding: 20px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: var(--card-shadow);
  border: 1px solid var(--border);
  transition: box-shadow 0.25s;
  position: relative;
  overflow: hidden;
}

.stat-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
}

.stat-icon-wrap {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon-blue { background: #e6f4ff; color: #1677ff; }
.stat-icon-green { background: #f6ffed; color: #52c41a; }
.stat-icon-orange { background: #fff7e6; color: #faad14; }
.stat-icon-red { background: #fff2f0; color: #ff4d4f; }

.stat-body {
  flex: 1;
}

.stat-value {
  font-size: 30px;
  font-weight: 700;
  color: var(--text-main);
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
}

.stat-label {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 2px;
}

.stat-accent {
  width: 3px;
  height: 40px;
  border-radius: 2px;
  opacity: 0.5;
  flex-shrink: 0;
}

.stat-accent-blue { background: #1677ff; }
.stat-accent-green { background: #52c41a; }
.stat-accent-orange { background: #faad14; }
.stat-accent-red { background: #ff4d4f; }

/* ==================== Charts Area ==================== */
.charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.chart-panel {
  min-height: 280px;
}

.chart-placeholder {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.chart-fake-line {
  height: 180px;
  margin-bottom: 8px;
}

.chart-fake-line svg {
  display: block;
  width: 100%;
  height: 100%;
}

.chart-axis-labels {
  display: flex;
  justify-content: space-between;
  padding: 0 8px;
  font-size: 11px;
  color: var(--text-muted);
}

.chart-fake-donut {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 28px;
  padding: 20px 0;
}

.donut-legend {
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 13px;
  color: var(--text-secondary);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* ==================== Panel ==================== */
.panel {
  background: var(--card-bg);
  border-radius: var(--card-radius);
  padding: 24px;
  box-shadow: var(--card-shadow);
  border: 1px solid var(--border);
  margin-bottom: 16px;
}

.panel-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-main);
  margin: 0 0 20px 0;
  padding-bottom: 14px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ==================== Quick Links ==================== */
.quick-links {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 10px;
}

.ql-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  background: #fafbfc;
  border-radius: var(--card-radius);
  transition: background 0.2s;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  border: 1px solid transparent;
}

.ql-item:hover {
  background: var(--primary-light);
  color: var(--primary);
  border-color: var(--primary);
}

.ql-item svg:last-child {
  margin-left: auto;
  opacity: 0;
  transition: opacity 0.2s;
}

.ql-item:hover svg:last-child {
  opacity: 1;
}

.ql-icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ql-bg-blue { background: #e6f4ff; color: #1677ff; }
.ql-bg-purple { background: #f9f0ff; color: #722ed1; }
.ql-bg-green { background: #f6ffed; color: #52c41a; }
.ql-bg-orange { background: #fff7e6; color: #faad14; }
.ql-bg-cyan { background: #e6fffb; color: #13c2c2; }
.ql-bg-teal { background: #e6fffb; color: #08979c; }
.ql-bg-yellow { background: #fffbe6; color: #d48806; }

.ql-text {
  font-weight: 600;
}

/* ==================== System Info ==================== */
.sys-info-list {
  display: flex;
  flex-direction: column;
}

.si-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid #f5f5f5;
}

.si-row:last-child {
  border-bottom: none;
}

.si-label {
  font-size: 13px;
  color: var(--text-muted);
  font-weight: 500;
}

.si-value {
  font-size: 14px;
  color: var(--text-main);
  font-weight: 600;
}

/* ==================== Responsive ==================== */
@media (max-width: 1200px) {
  .stat-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stat-grid {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }

  .stat-card {
    padding: 16px;
  }

  .stat-icon-wrap {
    width: 44px;
    height: 44px;
    border-radius: 10px;
  }

  .stat-value {
    font-size: 24px;
  }

  .header-date {
    display: none;
  }

  .header-title {
    font-size: 20px;
  }

  .quick-links {
    grid-template-columns: 1fr 1fr;
  }

  .chart-fake-donut {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .stat-grid {
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .quick-links {
    grid-template-columns: 1fr;
  }
}
</style>
