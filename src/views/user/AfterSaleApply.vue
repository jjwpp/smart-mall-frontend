<!-- 售后申请页 -->
<template>
  <div class="apply-page">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <h2 class="page-title">申请售后</h2>
    </div>

    <div v-if="loading" class="loading-state"><span class="spinner"></span><p>加载中...</p></div>

    <div v-else-if="orderItems.length" class="apply-content">
      <div class="section">
        <h3 class="section-title">订单商品</h3>
        <div v-for="item in orderItems" :key="item.id" class="item-card">
          <div class="item-info">
            <span class="item-name">{{ item.productName }}</span>
            <span class="item-sku" v-if="item.skuName">{{ item.skuName }}</span>
            <span class="item-qty">x{{ item.quantity }}</span>
            <span class="item-price">¥{{ item.productPrice }}</span>
          </div>
          <button v-if="appliedItems[item.id] === 'PENDING_REVIEW'" class="btn-status btn-review" disabled>审核中</button>
          <button v-else-if="appliedItems[item.id] === 'APPROVED'" class="btn-status btn-approved" disabled>已通过</button>
          <button v-else-if="appliedItems[item.id] === 'COMPLETED'" class="btn-status btn-refunded" disabled>已退款</button>
          <button
            v-else-if="currentItem && currentItem.id === item.id"
            class="btn-cancel" @click="currentItem = null">取消</button>
          <button
            v-else
            class="btn-apply" @click="currentItem = item">申请售后</button>
        </div>
      </div>

      <!-- 申请表单 -->
      <div v-if="currentItem" class="section form-section">
        <h3 class="section-title">售后信息</h3>

        <div class="form-group">
          <label class="form-label">售后类型</label>
          <div class="type-tabs">
            <button :class="['type-tab', { active: form.type === 'REFUND_ONLY' }]" @click="form.type = 'REFUND_ONLY'">仅退款</button>
            <button :class="['type-tab', { active: form.type === 'RETURN_REFUND' }]" @click="form.type = 'RETURN_REFUND'">退货退款</button>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">售后原因</label>
          <select v-model="form.reason" class="form-select">
            <option value="">请选择原因</option>
            <option>商品质量问题</option>
            <option>商品损坏</option>
            <option>发错货</option>
            <option>商品与描述不符</option>
            <option>其他原因</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">问题描述 <span class="limit">{{ form.description.length }}/200</span></label>
          <textarea v-model="form.description" class="form-textarea" rows="4" maxlength="200" placeholder="请描述您遇到的问题..."></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">凭证图片 <span class="limit">{{ images.length }}/3</span></label>
          <div class="image-upload">
            <div v-for="(url, i) in images" :key="i" class="image-preview">
              <img :src="url" class="preview-img" />
              <button class="img-remove" @click="images.splice(i, 1)">&times;</button>
            </div>
            <label v-if="images.length < 3" class="upload-btn">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              <input type="file" accept="image/*" hidden @change="handleUpload" />
            </label>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">退款金额</label>
          <div class="amount-display">¥{{ currentItem.productPrice }} x {{ currentItem.quantity }} = ¥{{ refundAmount }}</div>
        </div>

        <button class="submit-btn" :disabled="!canSubmit || submitting" @click="submitApply">
          {{ submitting ? '提交中...' : '提交申请' }}
        </button>
      </div>
    </div>

    <div v-else class="empty-state">
      <p class="empty-text">暂无订单商品</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'
import { api } from '../../utils/api'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const orderId = route.params.orderId
const orderItems = ref([])
const currentItem = ref(null)
const loading = ref(false)
const submitting = ref(false)
const appliedItems = ref({})
const images = ref([])

const form = ref({
  type: 'REFUND_ONLY',
  reason: '',
  description: '',
  refundAmount: 0
})

const refundAmount = computed(() => {
  if (!currentItem.value) return 0
  return (currentItem.value.productPrice * currentItem.value.quantity).toFixed(2)
})

const canSubmit = computed(() => form.value.reason && currentItem.value)

async function fetchItems() {
  loading.value = true
  try {
    const data = await api.getOrderItems(orderId, userStore.token)
    orderItems.value = data || []
    // 检查该订单已有售后（只标记进行中的，已拒绝/已取消的允许重新申请）
    const params = { userId: userStore.userId, orderId: orderId, pageSize: 50, pageNum: 1 }
    const sales = await api.getMyAfterSales(params, userStore.token)
    ;(sales?.records || []).forEach(s => {
      if (s.orderItemId) appliedItems.value[s.orderItemId] = s.status
    })
  } catch { orderItems.value = [] }
  finally { loading.value = false }
}

async function handleUpload(e) {
  const file = e.target.files[0]
  if (!file) return
  try {
    const url = await api.uploadFile(file, userStore.token)
    images.value.push(url)
  } catch (e) { alert('上传失败: ' + e.message) }
}

async function submitApply() {
  if (!canSubmit.value || submitting.value) return
  submitting.value = true
  try {
    await api.createAfterSale({
      userId: userStore.userId,
      orderId: Number(orderId),
      orderItemId: currentItem.value.id,
      type: form.value.type,
      reason: form.value.reason,
      description: form.value.description,
      imageUrls: JSON.stringify(images.value),
      refundAmount: parseFloat(refundAmount.value)
    }, userStore.token)
    alert('售后申请已提交')
    router.push('/after-sales')
  } catch (e) { alert(e.message) }
  finally { submitting.value = false }
}

onMounted(fetchItems)
</script>

<style scoped>
.apply-page { max-width: 640px; margin: 0 auto; padding-bottom: 32px; }
.page-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
.back-btn { width: 36px; height: 36px; border: none; background: #f5f5f5; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.page-title { font-size: 20px; font-weight: 700; }
.loading-state { text-align: center; padding: 80px 0; color: #999; }
.spinner { display: inline-block; width: 32px; height: 32px; border: 3px solid #f0f0f0; border-top-color: #ff2442; border-radius: 50%; animation: spin .8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.section { background: #fff; border-radius: 12px; padding: 16px; margin-bottom: 16px; box-shadow: 0 1px 4px rgba(0,0,0,.04); }
.section-title { font-size: 16px; font-weight: 600; margin-bottom: 12px; color: #1a1a1a; }
.item-card { display: flex; align-items: center; justify-content: space-between; padding: 12px; border: 1px solid #f0f0f0; border-radius: 8px; margin-bottom: 8px; }
.item-info { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.item-name { font-weight: 500; color: #1a1a1a; }
.item-sku { color: #999; font-size: 12px; }
.item-qty { color: #999; font-size: 13px; }
.item-price { color: #ff2442; font-weight: 600; }
.btn-apply, .btn-cancel { padding: 6px 16px; border-radius: 16px; font-size: 13px; border: none; cursor: pointer; font-weight: 500; flex-shrink: 0; }
.btn-apply { background: #ff2442; color: #fff; }
.btn-cancel { background: #f5f5f5; color: #666; }
.btn-status { padding: 6px 12px; border-radius: 16px; font-size: 12px; border: none; font-weight: 500; flex-shrink: 0; cursor: default; }
.btn-review { background: #fff7e6; color: #faad14; }
.btn-approved { background: #e6fae9; color: #07c160; }
.btn-refunded { background: #f6ffed; color: #07c160; }
.btn-applied { padding: 6px 12px; border-radius: 16px; font-size: 12px; border: none; background: #e6fae9; color: #07c160; font-weight: 500; flex-shrink: 0; cursor: default; }
.form-section { }
.form-group { margin-bottom: 14px; }
.form-label { display: flex; justify-content: space-between; font-size: 14px; font-weight: 500; color: #333; margin-bottom: 6px; }
.limit { font-weight: 400; color: #999; font-size: 12px; }
.form-select, .form-textarea { width: 100%; padding: 10px 12px; border: 1px solid #e0e0e0; border-radius: 8px; font-size: 14px; outline: none; font-family: inherit; }
.form-select:focus, .form-textarea:focus { border-color: #ff2442; }
.form-textarea { resize: vertical; }
.type-tabs { display: flex; gap: 8px; }
.type-tab { flex: 1; padding: 10px; border: 1px solid #e0e0e0; border-radius: 8px; font-size: 14px; cursor: pointer; background: #fff; transition: all .2s; font-family: inherit; }
.type-tab.active { border-color: #ff2442; background: #fff5f6; color: #ff2442; font-weight: 600; }
.image-upload { display: flex; gap: 8px; flex-wrap: wrap; }
.image-preview { position: relative; width: 80px; height: 80px; border-radius: 8px; overflow: hidden; }
.preview-img { width: 100%; height: 100%; object-fit: cover; }
.img-remove { position: absolute; top: 2px; right: 2px; width: 20px; height: 20px; border-radius: 50%; background: rgba(0,0,0,.5); color: #fff; border: none; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.upload-btn { width: 80px; height: 80px; border: 2px dashed #d9d9d9; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: border-color .2s; }
.upload-btn:hover { border-color: #ff2442; }
.amount-display { font-size: 16px; font-weight: 700; color: #ff2442; padding: 10px 12px; background: #fff5f6; border-radius: 8px; }
.submit-btn { width: 100%; padding: 14px; background: linear-gradient(135deg, #ff2442, #ff4d64); color: #fff; border: none; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer; font-family: inherit; }
.submit-btn:disabled { opacity: .5; cursor: not-allowed; }
.empty-state { text-align: center; padding: 80px 0; color: #999; }
.empty-text { font-size: 14px; }
</style>
