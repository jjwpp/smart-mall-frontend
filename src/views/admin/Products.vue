<!-- ==================== 管理端 - 商品管理（含内嵌SKU管理） ==================== -->
<template>
  <div class="admin-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1677ff" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          商品管理
        </h2>
        <span class="header-subtitle">管理商品信息、SKU规格及上下架状态</span>
      </div>
      <button class="btn-primary" @click="openDialog()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        新增商品
      </button>
    </div>

    <!-- Filter Bar -->
    <div class="filter-card">
      <div class="filter-row">
        <div class="filter-item">
          <span class="filter-label">商品名称</span>
          <input v-model="searchName" placeholder="搜索商品..." @keyup.enter="search" class="filter-input" />
        </div>
        <div class="filter-item">
          <span class="filter-label">分类</span>
          <select v-model="searchCategoryId" @change="search" class="filter-select">
            <option :value="null">全部分类</option>
            <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>
        <div class="filter-item">
          <span class="filter-label">状态</span>
          <select v-model="searchStatus" @change="search" class="filter-select">
            <option :value="null">全部状态</option>
            <option :value="1">上架</option>
            <option :value="0">下架</option>
          </select>
        </div>
        <div class="filter-actions">
          <button class="btn-filter-search" @click="search">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            查询
          </button>
          <button class="btn-filter-reset" @click="reset">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
            重置
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-card">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="!list.length" class="empty-card">
      <div class="empty-illustration">
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          <rect x="12" y="8" width="56" height="56" rx="8" stroke="#d1d5db" stroke-width="2" fill="#f9fafb"/>
          <rect x="20" y="16" width="40" height="28" rx="4" stroke="#e5e7eb" stroke-width="1.5" fill="#fff"/>
          <line x1="20" y1="52" x2="60" y2="52" stroke="#e5e7eb" stroke-width="1.5"/>
          <circle cx="28" cy="58" r="4" stroke="#d1d5db" stroke-width="1.5" fill="#f9fafb"/>
          <line x1="34" y1="58" x2="52" y2="58" stroke="#e5e7eb" stroke-width="1.5"/>
        </svg>
      </div>
      <p class="empty-title">暂无商品数据</p>
      <p class="empty-desc">点击「新增商品」添加第一个商品</p>
    </div>

    <!-- Data Table -->
    <div v-else class="table-card">
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th class="th-id">ID</th>
              <th>封面</th>
              <th>商品名称</th>
              <th>分类</th>
              <th>价格</th>
              <th>库存</th>
              <th>SKU</th>
              <th>状态</th>
              <th class="th-actions">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in list" :key="p.id" class="table-row">
              <td class="col-id">{{ p.id }}</td>
              <td>
                <img v-if="p.coverUrl" :src="p.coverUrl" class="product-thumb" />
                <div v-else class="product-thumb-placeholder">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#bfbfbf" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                </div>
              </td>
              <td><strong class="product-name">{{ p.name }}</strong></td>
              <td>
                <span class="cat-tag">{{ getCategoryName(p.categoryId) }}</span>
              </td>
              <td><span class="col-price">¥{{ p.price }}</span></td>
              <td>{{ p.stock }}</td>
              <td>
                <span v-if="skuCounts[p.id]" class="sku-count-link" @click="openDialog(p)">{{ skuCounts[p.id] }} 个 SKU</span>
                <span v-else class="sku-count-none" @click="openDialog(p)">--</span>
              </td>
              <td>
                <span class="status-tag" :class="p.status === 1 ? 'tag-active' : 'tag-inactive'">
                  <span class="status-dot"></span>
                  {{ p.status === 1 ? '上架' : '下架' }}
                </span>
              </td>
              <td>
                <div class="action-btns">
                  <button class="btn-link btn-link-sku" @click="$router.push(`/admin/products/${p.id}/skus`)">SKU</button>
                  <button class="btn-link btn-link-edit" @click="openDialog(p)">编辑</button>
                  <button
                    :class="['btn-link', p.status === 1 ? 'btn-link-warning' : 'btn-link-success']"
                    @click="toggleStatus(p)"
                  >
                    {{ p.status === 1 ? '下架' : '上架' }}
                  </button>
                  <button class="btn-link btn-link-delete" @click="handleDelete(p.id)">删除</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="pagination-bar" v-if="totalPages > 1">
        <button :disabled="pageNum <= 1" @click="pageNum--; fetch()" class="page-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div class="page-numbers">
          <button
            v-for="i in totalPages"
            :key="i"
            :class="['page-num', { active: i === pageNum }]"
            @click="pageNum = i; fetch()"
          >{{ i }}</button>
        </div>
        <button :disabled="pageNum >= totalPages" @click="pageNum++; fetch()" class="page-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </div>

    <!-- ==================== Edit Dialog (with SKU Management) ==================== -->
    <div class="dialog-overlay" v-if="showDialog" @click.self="showDialog = false">
      <div class="dialog dialog-wide">
        <div class="dialog-header">
          <h3>{{ editingId ? '编辑商品' : '新增商品' }}</h3>
          <button class="dialog-close" @click="showDialog = false">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <!-- Product Basic Info -->
        <div class="dialog-body">
          <div class="form-grid">
            <div class="form-group"><label>名称 *</label><input v-model="form.name" placeholder="商品名称" /></div>
            <div class="form-group"><label>副标题</label><input v-model="form.subtitle" placeholder="商品副标题" /></div>
            <div class="form-group"><label>分类</label><select v-model.number="form.categoryId"><option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option></select></div>
            <div class="form-group"><label>价格</label><input v-model.number="form.price" type="number" step="0.01" /></div>
            <div class="form-group"><label>库存</label><input v-model.number="form.stock" type="number" /></div>
            <div class="form-group"><label>状态</label><select v-model.number="form.status"><option :value="1">上架</option><option :value="0">下架</option></select></div>
          </div>
          <div class="form-group">
            <label>封面图</label>
            <div class="upload-area">
              <input ref="fileInput" type="file" accept="image/*" @change="onFileChange" class="file-input" />
              <div class="upload-preview" v-if="previewUrl" @click="$refs.fileInput.click()" title="点击更换图片">
                <img :src="previewUrl" alt="封面预览" class="preview-img" />
                <div class="preview-overlay"><span>点击更换图片</span></div>
              </div>
              <div class="upload-placeholder" v-else @click="$refs.fileInput.click()">
                <div class="upload-placeholder-inner">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  <span class="upload-label">点击上传封面图片</span>
                  <span class="upload-hint">支持 JPG、PNG、WebP</span>
                </div>
              </div>
            </div>
          </div>
          <div class="form-group"><label>描述</label><textarea v-model="form.description" rows="3" placeholder="商品描述"></textarea></div>
        </div>

        <!-- SKU Management Section -->
        <div class="sku-section">
          <div class="sku-section-header">
            <h4>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1677ff" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
              SKU 管理
              <span class="sku-count-badge">{{ skus.length }}</span>
            </h4>
            <button class="btn-link btn-link-edit" @click="showSkuForm = !showSkuForm">
              {{ showSkuForm ? '取消' : '+ 新增SKU' }}
            </button>
          </div>

          <!-- Inline SKU Form -->
          <div v-if="showSkuForm" class="sku-inline-form">
            <div class="sku-form-grid">
              <input v-model="skuForm.skuName" placeholder="SKU名称（如: 红色-XL）" class="sku-form-input" />
              <input v-model="skuForm.specs" placeholder='规格JSON（如: {"颜色":"红色"}）' class="sku-form-input" />
              <div class="sku-img-upload">
                <input :ref="el => skuFileInput = el" type="file" accept="image/*" @change="onSkuFileChange" class="file-input" />
                <img v-if="skuPreviewUrl" :src="skuPreviewUrl" class="sku-preview-img" @click="skuFileInput.click()" title="点击更换" />
                <button v-else type="button" class="btn-pill-sm btn-pill-edit-bg" @click="skuFileInput.click()">图片</button>
                <button v-if="skuPreviewUrl" type="button" class="btn-pill-sm btn-pill-delete-bg" @click="skuPreviewUrl = ''; skuForm.imageUrl = ''; skuSelectedFile = null">x</button>
              </div>
              <input v-model.number="skuForm.price" type="number" step="0.01" placeholder="价格" class="sku-form-input" />
              <input v-model.number="skuForm.stock" type="number" placeholder="库存" class="sku-form-input" />
              <select v-model.number="skuForm.status" class="sku-form-select"><option :value="1">启用</option><option :value="0">禁用</option></select>
              <button class="btn-confirm-sm" @click="handleSkuSave" :disabled="skuSaving">{{ skuSaving ? '...' : '保存' }}</button>
            </div>
          </div>

          <!-- SKU List Table -->
          <div v-if="skus.length" class="sku-table-wrap">
            <table class="sku-table">
              <thead><tr><th>图片</th><th>名称</th><th>规格</th><th>价格</th><th>库存</th><th>状态</th><th>操作</th></tr></thead>
              <tbody>
                <tr v-for="s in skus" :key="s.id" class="sku-row">
                  <td>
                    <img v-if="s.imageUrl" :src="s.imageUrl" class="sku-thumb" />
                    <span v-else class="sku-thumb-empty">-</span>
                  </td>
                  <td><strong>{{ s.skuName }}</strong></td>
                  <td><span class="specs-text">{{ formatSpecs(s.specs) }}</span></td>
                  <td class="sku-price">¥{{ s.price }}</td>
                  <td>{{ s.stock }}</td>
                  <td>
                    <span class="status-tag status-tag-sm" :class="s.status === 1 ? 'tag-active' : 'tag-inactive'">
                      <span class="status-dot"></span>
                      {{ s.status === 1 ? '启用' : '禁用' }}
                    </span>
                  </td>
                  <td>
                    <div class="sku-actions">
                      <button class="btn-link btn-link-edit" @click="editSkuInline(s)">编辑</button>
                      <button class="btn-link btn-link-delete" @click="handleSkuDelete(s.id)">删除</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="sku-empty-hint">
            <span>{{ editingId ? '暂无SKU，请点击「新增SKU」添加规格' : '添加SKU规格，保存商品后生效' }}</span>
          </div>
        </div>

        <div class="dialog-footer">
          <button class="btn-cancel" @click="showDialog = false">取消</button>
          <button class="btn-confirm" @click="handleSave" :disabled="saving">
            <svg v-if="saving" class="spin-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-dashoffset="10"/></svg>
            {{ saving ? '保存中...' : '保存商品' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'
import { useToast } from '../../composables/useToast'
import { api } from '../../utils/api'

const userStore = useUserStore()
const toast = useToast()
const list = ref([])
const categories = ref([])
const loading = ref(false)
const saving = ref(false)
const pageNum = ref(1)
const pageSize = ref(10)
const totalPages = ref(0)
const searchName = ref('')
const searchCategoryId = ref(null)
const searchStatus = ref(null)
const showDialog = ref(false)
const editingId = ref(null)
const fileInput = ref(null)
const selectedFile = ref(null)
const previewUrl = ref('')
const originalCoverUrl = ref('')
const form = reactive({ name: '', subtitle: '', categoryId: null, price: 0, stock: 0, coverUrl: '', description: '', status: 1 })

// ---- SKU ----
const skus = ref([])
const skuCounts = reactive({})
const showSkuForm = ref(false)
const skuSaving = ref(false)
const skuFileInput = ref(null)
const skuSelectedFile = ref(null)
const skuPreviewUrl = ref('')
const skuForm = reactive({ skuName: '', specs: '', price: 0, stock: 0, status: 1, imageUrl: '' })

function getCategoryName(cid) {
  const c = categories.value.find(x => x.id === cid)
  return c ? c.name : cid
}

function formatSpecs(specs) {
  if (!specs) return '-'
  if (typeof specs === 'string') {
    try { const o = JSON.parse(specs); return Object.values(o).join(' / ') } catch { return specs }
  }
  return Object.values(specs).join(' / ')
}

async function fetchCategories() {
  try { categories.value = await api.getAdminCategories({}, userStore.token) || [] } catch {}
}

async function fetch() {
  loading.value = true
  try {
    const params = { pageNum: pageNum.value, pageSize: pageSize.value }
    if (searchName.value) params.name = searchName.value
    if (searchCategoryId.value) params.categoryId = searchCategoryId.value
    if (searchStatus.value !== null) params.status = searchStatus.value
    const data = await api.getAdminProducts(params, userStore.token)
    list.value = data?.records || []
    totalPages.value = data?.pages || Math.ceil((data?.total || 0) / pageSize.value)
    // Batch fetch SKU counts
    await fetchSkuCounts()
  } catch { list.value = [] }
  finally { loading.value = false }
}

async function fetchSkuCounts() {
  for (const p of list.value) {
    try {
      const s = await api.getAdminSkus(p.id, userStore.token)
      skuCounts[p.id] = s ? s.length : 0
    } catch { skuCounts[p.id] = 0 }
  }
}

function search() { pageNum.value = 1; fetch() }
function reset() { searchName.value = ''; searchCategoryId.value = null; searchStatus.value = null; pageNum.value = 1; fetch() }

function openDialog(p) {
  if (p) {
    editingId.value = p.id
    Object.assign(form, { name: p.name, subtitle: p.subtitle || '', categoryId: p.categoryId, price: p.price, stock: p.stock, coverUrl: p.coverUrl || '', description: p.description || '', status: p.status })
    previewUrl.value = p.coverUrl || ''
    originalCoverUrl.value = p.coverUrl || ''
    fetchSkus(p.id)
  } else {
    editingId.value = null
    Object.assign(form, { name: '', subtitle: '', categoryId: categories.value[0]?.id || null, price: 0, stock: 0, coverUrl: '', description: '', status: 1 })
    previewUrl.value = ''
    originalCoverUrl.value = ''
    skus.value = []
  }
  selectedFile.value = null
  showSkuForm.value = false
  resetSkuForm()
  if (fileInput.value) fileInput.value.value = ''
  showDialog.value = true
}

function onFileChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  selectedFile.value = file
  previewUrl.value = URL.createObjectURL(file)
  form.coverUrl = ''
}

async function handleSave() {
  saving.value = true
  try {
    const formData = new FormData()
    const productBlob = new Blob([JSON.stringify({
      name: form.name, subtitle: form.subtitle || '', categoryId: form.categoryId,
      price: form.price, stock: form.stock, coverUrl: form.coverUrl,
      description: form.description || '', status: form.status
    })], { type: 'application/json' })
    formData.append('product', productBlob)
    if (selectedFile.value) formData.append('file', selectedFile.value)

    if (editingId.value) {
      await api.updateProduct(editingId.value, formData, userStore.token)
      toast.success('商品更新成功')
      showDialog.value = false; fetch()
    } else {
      await api.createProduct(formData, userStore.token)
      toast.success('商品创建成功')
      // Re-fetch list to get the new ID, then switch to edit mode
      await fetch()
      const created = list.value.find(x => x.name === form.name)
      if (created) {
        editingId.value = created.id
        originalCoverUrl.value = created.coverUrl || ''
        previewUrl.value = created.coverUrl || ''
        // Batch create pending SKUs (added before product was saved)
        if (skus.value.length > 0) {
          let createdCount = 0
          for (const sku of skus.value) {
            try {
              await api.createSku(created.id, {
                skuName: sku.skuName,
                specs: sku.specs || '{}',
                imageUrl: sku.imageUrl || '',
                price: sku.price,
                stock: sku.stock,
                status: sku.status
              }, userStore.token)
              createdCount++
            } catch { /* skip failed SKU */ }
          }
          if (createdCount > 0) toast.success(`已创建 ${createdCount} 个SKU`)
        }
        await fetchSkus(created.id)
        return  // Keep dialog open to review SKUs
      }
      showDialog.value = false; fetch()
    }
  } catch (e) { toast.error(e.message) }
  finally { saving.value = false }
}

// ==================== SKU Operations ====================

async function fetchSkus(productId) {
  try {
    const data = await api.getAdminSkus(productId, userStore.token)
    skus.value = Array.isArray(data) ? data : []
    skuCounts[productId] = skus.value.length
  } catch { skus.value = [] }
}

function resetSkuForm() {
  Object.assign(skuForm, { skuName: '', specs: '', price: 0, stock: 0, status: 1, imageUrl: '' })
  skuSelectedFile.value = null
  skuPreviewUrl.value = ''
  if (skuFileInput.value) skuFileInput.value.value = ''
}

function onSkuFileChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  skuSelectedFile.value = file
  skuPreviewUrl.value = URL.createObjectURL(file)
  skuForm.imageUrl = ''
}

function editSkuInline(s) {
  showSkuForm.value = true
  Object.assign(skuForm, {
    skuName: s.skuName,
    specs: typeof s.specs === 'string' ? s.specs : JSON.stringify(s.specs || {}),
    price: s.price,
    stock: s.stock,
    status: s.status,
    imageUrl: s.imageUrl || ''
  })
  skuSelectedFile.value = null
  skuPreviewUrl.value = s.imageUrl || ''
  if (skuFileInput.value) skuFileInput.value.value = ''
  skuForm._editingId = s.id
}

async function handleSkuSave() {
  if (!skuForm.skuName.trim()) return toast.error('请输入SKU名称')
  skuSaving.value = true
  try {
    // Upload new image if selected
    let imageUrl = skuForm.imageUrl || ''
    if (skuSelectedFile.value) {
      imageUrl = await api.uploadFile(skuSelectedFile.value, userStore.token)
    }

    const data = {
      skuName: skuForm.skuName,
      specs: skuForm.specs || '{}',
      imageUrl: imageUrl,
      price: skuForm.price,
      stock: skuForm.stock,
      status: skuForm.status
    }

    if (skuForm._editingId) {
      // Editing an existing SKU
      if (editingId.value) {
        await api.updateSku(editingId.value, skuForm._editingId, data, userStore.token)
        toast.success('SKU已更新')
        await fetchSkus(editingId.value)
      } else {
        // New product - update in local array
        const idx = skus.value.findIndex(s => (s._tempId || s.id) === skuForm._editingId)
        if (idx >= 0) skus.value[idx] = { ...skus.value[idx], ...data, id: skuForm._editingId, _tempId: skuForm._editingId }
        toast.success('SKU已更新')
      }
    } else {
      // Creating new SKU
      if (editingId.value) {
        await api.createSku(editingId.value, data, userStore.token)
        toast.success('SKU已添加')
        await fetchSkus(editingId.value)
      } else {
        // New product - add to local array with temp ID
        const tempId = 'new_' + Date.now() + '_' + skus.value.length
        skus.value.push({ ...data, id: tempId, _tempId: tempId, imageUrl: imageUrl })
        toast.success('SKU已添加（保存商品后生效）')
      }
    }
    showSkuForm.value = false
    resetSkuForm()
  } catch (e) { toast.error(e.message) }
  finally { skuSaving.value = false }
}

async function handleSkuDelete(id) {
  if (!confirm('确定要删除该SKU吗？')) return
  try {
    if (editingId.value) {
      await api.deleteSku(editingId.value, id, userStore.token)
      toast.success('SKU已删除')
      await fetchSkus(editingId.value)
    } else {
      skus.value = skus.value.filter(s => (s._tempId || s.id) !== id)
      toast.success('SKU已删除')
    }
  } catch (e) { toast.error(e.message) }
}

// ==================== Other ====================

async function toggleStatus(p) {
  const newStatus = p.status === 1 ? 0 : 1
  try {
    await api.updateProductStatus(p.id, newStatus, userStore.token)
    toast.success(newStatus === 1 ? '商品已上架' : '商品已下架')
    fetch()
  } catch (e) { toast.error(e.message) }
}

async function handleDelete(id) {
  if (!confirm('确定要删除该商品吗？此操作不可恢复。')) return
  try { await api.deleteProduct(id, userStore.token); toast.success('商品已删除'); fetch() }
  catch (e) { toast.error(e.message) }
}

onMounted(() => { fetchCategories(); fetch() })
</script>

<style scoped>
/* ==================== Design Tokens ==================== */
.admin-page {
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
  max-width: 1400px;
}

/* ==================== Page Header ==================== */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.page-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-main);
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  letter-spacing: -0.3px;
}

.header-subtitle {
  font-size: 13px;
  color: var(--text-muted);
  margin-left: 34px;
}

/* ==================== Primary Button ==================== */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
}

.btn-primary:hover {
  background: var(--primary-dark);
}

/* ==================== Filter Card ==================== */
.filter-card {
  background: var(--card-bg);
  border-radius: var(--card-radius);
  padding: 16px 20px;
  margin-bottom: 16px;
  box-shadow: var(--card-shadow);
  border: 1px solid var(--border);
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-label {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
  white-space: nowrap;
}

.filter-input {
  padding: 7px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 13px;
  color: var(--text-main);
  background: #fff;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  min-width: 200px;
}

.filter-input::placeholder {
  color: #bfbfbf;
}

.filter-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.1);
}

.filter-select {
  padding: 7px 32px 7px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 13px;
  color: var(--text-main);
  background: #fff;
  outline: none;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23999' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  min-width: 130px;
}

.filter-select:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.1);
}

.filter-actions {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

.btn-filter-search {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 7px 16px;
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-filter-search:hover {
  background: var(--primary-dark);
}

.btn-filter-reset {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 7px 16px;
  background: #fff;
  color: var(--text-secondary);
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-filter-reset:hover {
  border-color: var(--primary);
  color: var(--primary);
}

/* ==================== Loading ==================== */
.loading-card {
  background: var(--card-bg);
  border-radius: var(--card-radius);
  padding: 80px 24px;
  text-align: center;
  color: var(--text-muted);
  font-size: 14px;
  box-shadow: var(--card-shadow);
  border: 1px solid var(--border);
}

.loading-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #f0f0f0;
  border-top-color: var(--primary);
  border-radius: 50%;
  margin: 0 auto 14px;
  animation: spin 0.8s linear infinite;
}

/* ==================== Empty State ==================== */
.empty-card {
  background: var(--card-bg);
  border-radius: var(--card-radius);
  padding: 80px 24px;
  text-align: center;
  box-shadow: var(--card-shadow);
  border: 1px solid var(--border);
}

.empty-illustration {
  margin-bottom: 18px;
  display: flex;
  justify-content: center;
}

.empty-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-main);
  margin: 0 0 6px 0;
}

.empty-desc {
  font-size: 13px;
  color: var(--text-muted);
  margin: 0;
}

/* ==================== Table Card ==================== */
.table-card {
  background: var(--card-bg);
  border-radius: var(--card-radius);
  box-shadow: var(--card-shadow);
  border: 1px solid var(--border);
  overflow: hidden;
}

.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.data-table thead th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 13px;
  background: #fafafa;
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}

.data-table tbody td {
  padding: 13px 16px;
  color: var(--text-main);
  border-bottom: 1px solid #f5f5f5;
  vertical-align: middle;
}

.data-table tbody tr.table-row:nth-child(even) td {
  background: #fafafa;
}

.data-table tbody tr.table-row:hover td {
  background: #e6f4ff;
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

.th-id, .col-id {
  color: var(--text-muted) !important;
  font-size: 13px !important;
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
}

.th-actions {
  text-align: right;
  width: 180px;
}

/* ==================== Product Table Specials ==================== */
.product-thumb {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: #fafafa;
}

.product-thumb-placeholder {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  border-radius: 6px;
  border: 1px solid var(--border);
}

.product-name {
  color: var(--text-main);
}

.cat-tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background: var(--primary-light);
  color: var(--primary);
  border: 1px solid #91caff;
}

.col-price {
  color: var(--danger);
  font-weight: 700;
  font-size: 14px;
}

.sku-count-link {
  color: var(--primary);
  cursor: pointer;
  font-weight: 500;
  font-size: 13px;
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--primary-light);
  transition: background 0.15s;
}
.sku-count-link:hover {
  background: #bae0ff;
}

.sku-count-none {
  color: var(--text-muted);
  cursor: pointer;
  font-size: 12px;
}

/* ==================== Status Tags ==================== */
.status-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.status-tag-sm {
  padding: 1px 8px;
  font-size: 11px;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.tag-active {
  background: #f6ffed;
  color: #389e0d;
  border: 1px solid #b7eb8f;
}
.tag-active .status-dot { background: var(--success); }

.tag-inactive {
  background: #fff2f0;
  color: #cf1322;
  border: 1px solid #ffccc7;
}
.tag-inactive .status-dot { background: var(--danger); }

/* ==================== Action Buttons ==================== */
.action-btns {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: flex-end;
}

.btn-link {
  padding: 0;
  background: none;
  border: none;
  font-size: 13px;
  cursor: pointer;
  transition: color 0.2s;
  font-weight: 500;
  white-space: nowrap;
}

.btn-link-sku {
  color: #722ed1;
}
.btn-link-sku:hover { color: #531dab; }

.btn-link-edit {
  color: var(--primary);
}
.btn-link-edit:hover { color: var(--primary-dark); }

.btn-link-delete {
  color: var(--danger);
}
.btn-link-delete:hover { color: #cf1322; }

.btn-link-success {
  color: var(--success);
}
.btn-link-success:hover { color: #389e0d; }

.btn-link-warning {
  color: var(--warning);
}
.btn-link-warning:hover { color: #d48806; }

/* ==================== Pagination ==================== */
.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 14px 20px;
  border-top: 1px solid var(--border);
}

.page-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background: #fff;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  border-color: var(--primary);
  color: var(--primary);
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 4px;
}

.page-num {
  min-width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background: #fff;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0 8px;
}

.page-num:hover:not(.active) {
  border-color: var(--primary);
  color: var(--primary);
}

.page-num.active {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
}

/* ==================== Dialog ==================== */
.dialog-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

.dialog {
  background: #fff;
  border-radius: 8px;
  width: 540px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 6px 16px rgba(0,0,0,0.08), 0 3px 6px -4px rgba(0,0,0,0.05);
  animation: slideUp 0.2s ease;
}

.dialog-wide {
  width: 820px;
  max-height: 92vh;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 0 24px;
}

.dialog-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-main);
  margin: 0;
}

.dialog-close {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  border-radius: 6px;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s;
}

.dialog-close:hover {
  background: #f5f5f5;
  color: var(--text-main);
}

.dialog-body {
  padding: 20px 24px;
}

.dialog-body .form-group {
  margin-bottom: 16px;
}

.dialog-body .form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  color: var(--text-main);
  font-weight: 500;
}

.dialog-body .form-group input,
.dialog-body .form-group select,
.dialog-body .form-group textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  color: var(--text-main);
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  background: #fff;
  font-family: inherit;
}

.dialog-body .form-group input:focus,
.dialog-body .form-group select:focus,
.dialog-body .form-group textarea:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.1);
}

.dialog-body .form-group input::placeholder,
.dialog-body .form-group textarea::placeholder {
  color: #bfbfbf;
}

.dialog-body .form-group textarea {
  resize: vertical;
  min-height: 72px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 18px;
}

/* ==================== Upload Area ==================== */
.upload-area {
  width: 100%;
}

.file-input {
  display: none;
}

.upload-placeholder {
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  background: #fafafa;
}

.upload-placeholder:hover {
  border-color: var(--primary);
  background: var(--primary-light);
}

.upload-placeholder-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 28px 16px;
  gap: 8px;
}

.upload-label {
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
}

.upload-hint {
  font-size: 12px;
  color: var(--text-muted);
}

.upload-preview {
  position: relative;
  display: inline-block;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #d9d9d9;
  cursor: pointer;
}

.preview-img {
  display: block;
  max-width: 220px;
  max-height: 160px;
  object-fit: cover;
  transition: filter 0.2s;
}

.preview-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
  color: #fff;
  font-size: 13px;
  font-weight: 500;
}

.upload-preview:hover .preview-overlay {
  opacity: 1;
}

.upload-preview:hover .preview-img {
  filter: brightness(0.8);
}

/* ==================== SKU Section ==================== */
.sku-section {
  border-top: 1px solid var(--border);
  padding: 0 24px 8px 24px;
}

.sku-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  margin-bottom: 12px;
}

.sku-section-header h4 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-main);
  display: flex;
  align-items: center;
  gap: 8px;
}

.sku-count-badge {
  font-size: 11px;
  background: var(--primary);
  color: #fff;
  padding: 1px 8px;
  border-radius: 10px;
  font-weight: 600;
  line-height: 1.6;
}

/* Inline SKU Form */
.sku-inline-form {
  background: #fafafa;
  padding: 14px;
  border-radius: 8px;
  margin-bottom: 14px;
  border: 1px solid var(--border);
}

.sku-form-grid {
  display: grid;
  grid-template-columns: 2fr 2fr auto 1fr 80px 72px auto;
  gap: 8px;
  align-items: center;
}

.sku-form-input {
  padding: 7px 10px;
  font-size: 13px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background: #fff;
  color: var(--text-main);
  outline: none;
  transition: border-color 0.2s;
  width: 100%;
}

.sku-form-input:focus {
  border-color: var(--primary);
}

.sku-form-select {
  padding: 7px 10px;
  font-size: 13px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background: #fff;
  color: var(--text-main);
  outline: none;
}

.sku-img-upload {
  display: flex;
  align-items: center;
  gap: 4px;
}

.sku-preview-img {
  width: 34px;
  height: 34px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #d9d9d9;
  cursor: pointer;
}

/* Small Pill Buttons */
.btn-pill-sm {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
}

.btn-pill-edit-bg {
  background: var(--primary-light);
  color: var(--primary);
}
.btn-pill-edit-bg:hover {
  background: #bae0ff;
}

.btn-pill-delete-bg {
  background: #fff2f0;
  color: var(--danger);
}
.btn-pill-delete-bg:hover {
  background: #ffd8d2;
}

.btn-confirm-sm {
  padding: 7px 14px;
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-confirm-sm:hover:not(:disabled) {
  background: var(--primary-dark);
}
.btn-confirm-sm:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* SKU Table */
.sku-table-wrap {
  max-height: 280px;
  overflow-y: auto;
  border: 1px solid var(--border);
  border-radius: 8px;
}

.sku-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.sku-table thead th {
  padding: 10px 12px;
  border-bottom: 1px solid var(--border);
  text-align: left;
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 12px;
  position: sticky;
  top: 0;
  background: #fafafa;
  z-index: 1;
}

.sku-table tbody td {
  padding: 10px 12px;
  border-bottom: 1px solid #f5f5f5;
  color: var(--text-main);
}

.sku-table tbody tr.sku-row:nth-child(even) td {
  background: #fafafa;
}

.sku-table tbody tr.sku-row:hover td {
  background: var(--primary-light);
}

.sku-table tbody tr:last-child td {
  border-bottom: none;
}

.sku-thumb {
  width: 38px;
  height: 38px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid var(--border);
}

.sku-thumb-empty {
  color: var(--text-muted);
  font-size: 11px;
}

.sku-price {
  color: var(--danger);
  font-weight: 600;
  font-size: 13px;
}

.specs-text {
  font-size: 12px;
  color: var(--text-secondary);
  max-width: 150px;
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sku-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sku-empty-hint {
  text-align: center;
  padding: 24px;
  color: var(--text-muted);
  font-size: 13px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid var(--border);
}

/* ==================== Dialog Footer ==================== */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px 20px 24px;
  border-top: 1px solid var(--border);
}

.btn-cancel {
  padding: 7px 18px;
  background: #fff;
  color: var(--text-secondary);
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.btn-confirm {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 20px;
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-confirm:hover:not(:disabled) {
  background: var(--primary-dark);
}

.btn-confirm:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spin-icon {
  animation: spin 0.8s linear infinite;
}

/* ==================== Animations ==================== */
@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
