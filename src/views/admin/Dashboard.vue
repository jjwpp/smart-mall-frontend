<!-- 管理控制台 - 数据看板 -->
<template>
  <div class="dashboard">
    <div class="top-row">
      <h2 class="page-title">管理控制台</h2>
      <span class="today-date">{{ todayStr }}</span>
    </div>

    <!-- KPI 卡片 -->
    <div class="kpi-row">
      <div class="kpi-card">
        <div class="kpi-icon kpi-blue"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
        <div class="kpi-body"><span class="kpi-value">{{ stats.userCount ?? '-' }}</span><span class="kpi-label">用户总数</span></div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon kpi-green"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73L13 2.27a2 2 0 0 0-2 0L4 6.27A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg></div>
        <div class="kpi-body"><span class="kpi-value">{{ stats.productCount ?? '-' }}</span><span class="kpi-label">商品总数</span></div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon kpi-orange"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="3" width="16" height="18" rx="2"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="12" y2="16"/></svg></div>
        <div class="kpi-body"><span class="kpi-value">{{ stats.orderCount ?? '-' }}</span><span class="kpi-label">订单总数</span></div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon kpi-red"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>
        <div class="kpi-body"><span class="kpi-value">¥{{ fmtMoney(stats.todaySales) }}</span><span class="kpi-label">今日销售额</span></div>
      </div>
    </div>

    <!-- 图表区 2x2 -->
    <div class="charts-grid">
      <div class="chart-card">
        <h3 class="chart-title">销售趋势 <span class="unit">单位：元</span></h3>
        <div ref="ref1" class="chart-box"></div>
      </div>
      <div class="chart-card">
        <h3 class="chart-title">订单分布 <span class="unit">单位：个</span></h3>
        <div ref="ref2" class="chart-box"></div>
      </div>
      <div class="chart-card">
        <h3 class="chart-title">近7天订单量 <span class="unit">单位：个</span></h3>
        <div ref="ref3" class="chart-box"></div>
      </div>
      <div class="chart-card">
        <h3 class="chart-title">热销商品 Top 5 <span class="unit">单位：件</span></h3>
        <div ref="ref4" class="chart-box"></div>
      </div>
    </div>

    <!-- 快捷管理 -->
    <div class="quick-actions">
      <h3 class="section-title">快捷管理</h3>
      <div class="action-btns">
        <button v-for="a in actions" :key="a.path" class="action-btn" @click="$router.push(a.path)">{{ a.label }}</button>
      </div>
    </div>

    <!-- 底部信息 -->
    <div class="footer-bar">
      <span>Smart Mall © 2026</span><span class="dot">·</span><span>v1.0.0</span><span class="dot">·</span><span class="status-ok">● 运行状态正常</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useUserStore } from '../../stores/user'
import { api } from '../../utils/api'
import * as echarts from 'echarts'

const userStore = useUserStore()
const ref1 = ref(null); const ref2 = ref(null)
const ref3 = ref(null); const ref4 = ref(null)
const charts = []
const stats = ref({})
const todayStr = ref('')

const actions = [
  { label: '用户管理', path: '/admin/users' }, { label: '角色管理', path: '/admin/roles' },
  { label: '分类管理', path: '/admin/categories' }, { label: '商品管理', path: '/admin/products' },
  { label: '订单管理', path: '/admin/orders' }, { label: '支付管理', path: '/admin/payments' },
  { label: '评价管理', path: '/admin/reviews' },
]

const statusColorMap = { COMPLETED: '#52c41a', SHIPPED: '#1677ff', PAID: '#722ed1', PENDING_PAYMENT: '#faad14', CANCELLED: '#999', REFUNDED: '#ff4d4f' }
const statusNameMap = { COMPLETED: '已完成', SHIPPED: '已发货', PAID: '已付款', PENDING_PAYMENT: '待付款', CANCELLED: '已取消', REFUNDED: '已退款' }

function fmtMoney(v) { return (Number(v) || 0).toFixed(2) }

function formatDate() {
  const d = new Date()
  const days = ['日', '一', '二', '三', '四', '五', '六']
  todayStr.value = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 星期${days[d.getDay()]}`
}

async function fetchStats() {
  try { stats.value = await api.getDashboardStats(userStore.token); await nextTick(); renderAll() } catch { stats.value = {} }
}

function initChart(ref) {
  const el = ref.value; if (!el) return null
  const c = echarts.init(el); charts.push(c); return c
}

function renderAll() {
  charts.forEach(c => c.dispose()); charts.length = 0
  renderLine(); renderPie(); renderBar(); renderHot()
}

function renderLine() {
  const c = initChart(ref1); if (!c) return
  const d = stats.value.monthlySales || []
  c.setOption({
    tooltip: { trigger: 'axis', valueFormatter: v => '¥' + (v || 0).toFixed(2) },
    grid: { left: 50, right: 20, top: 10, bottom: 30 },
    xAxis: { type: 'category', data: d.map(i => i.month), axisLine: { lineStyle: { color: '#e0e0e0' } } },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: '#f0f0f0' } }, axisLabel: { formatter: '¥{value}' } },
    series: [{ data: d.map(i => i.amount), type: 'line', smooth: true, symbol: 'circle', symbolSize: 6, lineStyle: { color: '#1677ff', width: 2 }, itemStyle: { color: '#1677ff' }, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(22,119,255,0.25)' }, { offset: 1, color: 'rgba(22,119,255,0.02)' }]) } }]
  })
}

function renderPie() {
  const c = initChart(ref2); if (!c) return
  const d = (stats.value.orderStatusDistribution || []).map(i => ({ value: i.count, name: statusNameMap[i.status] || i.status, itemStyle: { color: statusColorMap[i.status] || '#d9d9d9' } }))
  c.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} 个 ({d}%)' },
    legend: { orient: 'vertical', right: 8, top: 'center', textStyle: { fontSize: 11 } },
    series: [{ type: 'pie', radius: ['45%', '72%'], center: ['38%', '50%'], avoidLabelOverlap: false, label: { show: false }, emphasis: { scaleSize: 8 }, data: d }]
  })
}

function renderBar() {
  const c = initChart(ref3); if (!c) return
  const d = stats.value.last7DaysOrders || []
  c.setOption({
    tooltip: { trigger: 'axis', valueFormatter: v => v + ' 个' },
    grid: { left: 40, right: 20, top: 10, bottom: 30 },
    xAxis: { type: 'category', data: d.map(i => i.date), axisLine: { lineStyle: { color: '#e0e0e0' } } },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: '#f0f0f0' } }, axisLabel: { formatter: '{value}个' } },
    series: [{ data: d.map(i => i.count), type: 'bar', barWidth: 22, itemStyle: { color: '#722ed1', borderRadius: [4, 4, 0, 0] } }]
  })
}

function renderHot() {
  const c = initChart(ref4); if (!c) return
  const d = stats.value.hotProducts || []
  c.setOption({
    tooltip: { trigger: 'axis', valueFormatter: v => v + ' 件' },
    grid: { left: 90, right: 30, top: 10, bottom: 20 },
    xAxis: { type: 'value', splitLine: { lineStyle: { color: '#f0f0f0' } }, axisLabel: { formatter: '{value}件' } },
    yAxis: { type: 'category', data: d.map(i => i.name).reverse(), inverse: true, axisLine: { show: false }, axisTick: { show: false } },
    series: [{
      data: d.map(i => i.sales).reverse(), type: 'bar', barWidth: 16,
      itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: '#ff2442' }, { offset: 1, color: '#ff7a45' }]), borderRadius: [0, 4, 4, 0] }
    }]
  })
}

function handleResize() { charts.forEach(c => c?.resize()) }

onMounted(() => { formatDate(); fetchStats(); window.addEventListener('resize', handleResize) })
onUnmounted(() => { window.removeEventListener('resize', handleResize); charts.forEach(c => c?.dispose()) })
</script>

<style scoped>
.dashboard { max-width: 1400px; }
.top-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
.page-title { font-size: 22px; font-weight: 700; color: #1a1a1a; margin: 0; }
.today-date { font-size: 14px; color: #999; }
.unit { font-size: 12px; color: #999; font-weight: 400; margin-left: 6px; }

.kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 20px; }
.kpi-card { background: #fff; border-radius: 10px; padding: 20px; display: flex; align-items: center; gap: 16px; box-shadow: 0 1px 4px rgba(0,0,0,.04); border: 1px solid #f0f0f0; }
.kpi-icon { width: 52px; height: 52px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.kpi-blue { background: #e6f4ff; color: #1677ff; }
.kpi-green { background: #f6ffed; color: #52c41a; }
.kpi-orange { background: #fff7e6; color: #faad14; }
.kpi-red { background: #fff2f0; color: #ff4d4f; }
.kpi-body { display: flex; flex-direction: column; }
.kpi-value { font-size: 26px; font-weight: 700; color: #1a1a1a; line-height: 1.2; }
.kpi-label { font-size: 13px; color: #999; margin-top: 2px; }

.charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
.chart-card { background: #fff; border-radius: 10px; padding: 16px 20px; box-shadow: 0 1px 4px rgba(0,0,0,.04); border: 1px solid #f0f0f0; }
.chart-title { font-size: 15px; font-weight: 600; color: #333; margin: 0 0 6px; }
.chart-box { width: 100%; height: 280px; }

.quick-actions { background: #fff; border-radius: 10px; padding: 18px 20px; margin-bottom: 20px; box-shadow: 0 1px 4px rgba(0,0,0,.04); border: 1px solid #f0f0f0; }
.section-title { font-size: 15px; font-weight: 600; color: #333; margin: 0 0 14px; }
.action-btns { display: flex; flex-wrap: wrap; gap: 10px; }
.action-btn { padding: 10px 22px; border: 1px solid #e0e0e0; border-radius: 8px; background: #fff; font-size: 14px; color: #333; cursor: pointer; transition: all .2s; font-family: inherit; }
.action-btn:hover { border-color: #1677ff; color: #1677ff; background: #f0f5ff; }

.footer-bar { text-align: center; padding: 16px 0; font-size: 13px; color: #999; }
.footer-bar .dot { margin: 0 8px; }
.status-ok { color: #52c41a; }

@media (max-width: 900px) { .kpi-row { grid-template-columns: repeat(2, 1fr); } .charts-grid { grid-template-columns: 1fr; } }
@media (max-width: 500px) { .kpi-row { grid-template-columns: 1fr; } }
</style>
