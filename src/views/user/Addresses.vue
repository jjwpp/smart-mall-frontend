<!-- ==================== 收货地址页 ==================== -->
<template>
  <div>
    <div class="flex-between mb-20">
      <h2>📍 收货地址</h2>
      <button class="btn-primary" @click="openDialog()">新增地址</button>
    </div>

    <div v-if="loading" class="loading-text">加载中...</div>
    <div v-else-if="!addresses.length" class="empty-state">
      <div class="icon">📍</div><p>暂无收货地址</p>
    </div>
    <div v-else class="address-grid">
      <div v-for="addr in addresses" :key="addr.id" class="card address-card" :class="{ 'is-default': addr.isDefault }">
        <div class="flex-between mb-12">
          <span style="font-weight:600">{{ addr.receiverName }}</span>
          <span class="tag tag-primary" v-if="addr.isDefault">默认</span>
        </div>
        <p>{{ addr.receiverPhone }}</p>
        <p style="color:var(--text-light)">{{ addr.province }}{{ addr.city }}{{ addr.district }} {{ addr.detail }}</p>
        <div class="flex-center gap-8 mt-12">
          <button class="btn-text btn-sm" @click="openDialog(addr)">编辑</button>
          <button class="btn-text btn-sm" style="color:var(--danger)" @click="handleDelete(addr.id)">删除</button>
          <button
            v-if="!addr.isDefault"
            class="btn-text btn-sm"
            @click="setDefault(addr)"
          >设为默认</button>
        </div>
      </div>
    </div>

    <!-- 编辑弹窗 -->
    <div class="dialog-overlay" v-if="showDialog" @click.self="showDialog = false">
      <div class="dialog">
        <h3>{{ editingId ? '编辑地址' : '新增地址' }}</h3>
        <div class="form-group"><label>收货人</label><input v-model="form.receiverName" required /></div>
        <div class="form-group"><label>手机号</label><input v-model="form.receiverPhone" required /></div>
        <div class="form-group"><label>省份</label><input v-model="form.province" /></div>
        <div class="form-group"><label>城市</label><input v-model="form.city" /></div>
        <div class="form-group"><label>区县</label><input v-model="form.district" /></div>
        <div class="form-group"><label>详细地址</label><textarea v-model="form.detail" rows="2"></textarea></div>
        <div class="form-group">
          <label><input type="checkbox" v-model="form.isDefault" :true-value="1" :false-value="0" /> 设为默认地址</label>
        </div>
        <div class="dialog-actions">
          <button class="btn-text" @click="showDialog = false">取消</button>
          <button class="btn-primary" @click="handleSave" :disabled="saving">{{ saving ? '保存中...' : '保存' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useUserStore } from '../../stores/user'
import { api } from '../../utils/api'

const userStore = useUserStore()
const addresses = ref([])
const loading = ref(false)
const saving = ref(false)
const showDialog = ref(false)
const editingId = ref(null)

const form = reactive({
  receiverName: '', receiverPhone: '', province: '',
  city: '', district: '', detail: '', isDefault: 0
})

async function fetchAddresses() {
  loading.value = true
  try {
    addresses.value = await api.getUserAddresses(userStore.userId, userStore.token) || []
  } catch { addresses.value = [] }
  finally { loading.value = false }
}

function openDialog(addr) {
  if (addr) {
    editingId.value = addr.id
    Object.assign(form, {
      receiverName: addr.receiverName || '',
      receiverPhone: addr.receiverPhone || '',
      province: addr.province || '',
      city: addr.city || '',
      district: addr.district || '',
      detail: addr.detail || '',
      isDefault: addr.isDefault || 0
    })
  } else {
    editingId.value = null
    Object.assign(form, {
      receiverName: '', receiverPhone: '', province: '',
      city: '', district: '', detail: '', isDefault: 0
    })
  }
  showDialog.value = true
}

async function handleSave() {
  saving.value = true
  try {
    const data = {
      userId: userStore.userId,
      ...form
    }
    if (editingId.value) {
      await api.updateAddress(editingId.value, data, userStore.token)
    } else {
      await api.createAddress(data, userStore.token)
    }
    showDialog.value = false
    fetchAddresses()
  } catch (e) { alert(e.message) }
  finally { saving.value = false }
}

async function handleDelete(id) {
  if (!confirm('确定要删除该地址吗？')) return
  try { await api.deleteAddress(id, userStore.token); fetchAddresses() }
  catch (e) { alert(e.message) }
}

async function setDefault(addr) {
  try {
    await api.updateAddress(addr.id, { ...addr, isDefault: 1 }, userStore.token)
    fetchAddresses()
  } catch (e) { alert(e.message) }
}

onMounted(fetchAddresses)
</script>

<style scoped>
.address-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}
.address-card.is-default {
  border: 2px solid var(--primary);
}
</style>
