<!-- ==================== 支付记录页 ==================== -->
<template>
  <div>
    <h2 class="mb-20">💳 支付记录</h2>
    <div class="card">
      <div v-if="loading" class="loading-text">加载中...</div>
      <div v-else-if="!payments.length" class="empty-state">
        <div class="icon">💳</div><p>暂无支付记录</p>
      </div>
      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>支付流水号</th>
              <th>订单ID</th>
              <th>支付渠道</th>
              <th>金额</th>
              <th>状态</th>
              <th>支付时间</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in payments" :key="p.id">
              <td>{{ p.paymentNo }}</td>
              <td>{{ p.orderId }}</td>
              <td>{{ p.channel === 'ALIPAY_SANDBOX' ? '支付宝(沙箱)' : p.channel }}</td>
              <td style="color:var(--danger);font-weight:600">¥{{ p.amount }}</td>
              <td>
                <span :class="p.status === 'PAID' ? 'tag tag-success' : p.status === 'UNPAID' ? 'tag tag-warning' : 'tag tag-info'">
                  {{ p.status === 'PAID' ? '已支付' : p.status === 'UNPAID' ? '未支付' : p.status }}
                </span>
              </td>
              <td>{{ p.paidAt?.slice(0, 16) || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '../../stores/user'
import { api } from '../../utils/api'

const userStore = useUserStore()
const payments = ref([])
const loading = ref(false)

async function fetchPayments() {
  loading.value = true
  try {
    payments.value = await api.getUserPayments({ userId: userStore.userId }, userStore.token) || []
  } catch { payments.value = [] }
  finally { loading.value = false }
}

onMounted(fetchPayments)
</script>
