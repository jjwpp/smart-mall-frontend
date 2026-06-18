<!-- ==================== 注册页 ==================== -->
<template>
  <div class="register-page">
    <!-- 注册卡片 -->
    <div class="register-card">
      <!-- Logo + 标题 -->
      <div class="register-header">
        <img src="@/pic/logo.png" alt="Smart Mall" class="register-logo" />
        <h1 class="register-title">创建账号</h1>
        <p class="register-desc">填写信息完成注册，开启智能购物之旅</p>
      </div>

      <form @submit.prevent="handleRegister" class="register-form">
        <!-- 用户名 -->
        <div class="input-group">
          <span class="input-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </span>
          <input v-model="form.username" type="text" placeholder="请输入用户名（3-64位）" required autofocus class="form-input" />
        </div>

        <!-- 密码 -->
        <div class="input-group">
          <span class="input-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </span>
          <input
            v-model="form.password"
            :type="showPwd ? 'text' : 'password'"
            placeholder="至少6位密码"
            required
            minlength="6"
            class="form-input"
          />
          <span class="toggle-pwd" @click="showPwd = !showPwd">
            <svg v-if="!showPwd" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          </span>
        </div>

        <!-- 密码强度提示 -->
        <div class="pwd-strength" v-if="form.password">
          <div class="strength-bars">
            <span :class="['bar', { active: form.password.length >= 1, weak: form.password.length > 0 && form.password.length < 6, medium: form.password.length >= 6 && form.password.length < 10, strong: form.password.length >= 10 }]"></span>
            <span :class="['bar', { active: form.password.length >= 6, medium: form.password.length >= 6 && form.password.length < 10, strong: form.password.length >= 10 }]"></span>
            <span :class="['bar', { active: form.password.length >= 10, strong: form.password.length >= 10 }]"></span>
          </div>
          <span class="strength-label" v-if="form.password.length < 6">密码太弱</span>
          <span class="strength-label medium-label" v-else-if="form.password.length < 10">中等强度</span>
          <span class="strength-label strong-label" v-else>高强度密码</span>
        </div>

        <!-- 昵称 -->
        <div class="input-group">
          <span class="input-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M4 21v-2a4 4 0 0 1 3-3.87" />
              <circle cx="12" cy="9" r="4" />
              <line x1="12" y1="2" x2="12" y2="4" />
              <line x1="12" y1="20" x2="12" y2="22" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            </svg>
          </span>
          <input v-model="form.nickname" type="text" placeholder="请输入昵称" required class="form-input" />
        </div>

        <!-- 手机号 -->
        <div class="input-group">
          <span class="input-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
              <line x1="12" y1="18" x2="12.01" y2="18" />
            </svg>
          </span>
          <input v-model="form.phone" type="tel" placeholder="请输入手机号（选填）" class="form-input" />
        </div>

        <!-- 邮箱 -->
        <div class="input-group">
          <span class="input-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </span>
          <input v-model="form.email" type="email" placeholder="请输入邮箱（选填）" class="form-input" />
        </div>

        <!-- 错误提示 -->
        <transition name="fade">
          <div v-if="error" class="error-msg">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <span>{{ error }}</span>
          </div>
        </transition>

        <!-- 注册按钮 -->
        <button class="btn-register" :disabled="loading" type="submit">
          <span v-if="loading" class="spinner"></span>
          <span>{{ loading ? '注册中...' : '注 册' }}</span>
        </button>
      </form>

      <!-- 底部链接 -->
      <div class="register-footer">
        <span>已有账号？</span>
        <router-link to="/login" class="link-login">立即登录</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../utils/api'

const router = useRouter()

const form = reactive({
  username: '',
  password: '',
  nickname: '',
  phone: '',
  email: ''
})
const loading = ref(false)
const error = ref('')
const showPwd = ref(false)

async function handleRegister() {
  error.value = ''
  if (form.password.length < 6) {
    error.value = '密码至少需要6位'
    return
  }
  loading.value = true
  try {
    await api.register(form)
    router.push({ name: 'Login', query: { registered: '1' } })
  } catch (e) {
    error.value = e.message || '注册失败'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* ==================== 设计变量 ==================== */
.register-page {
  --red: #ff2442;
  --red-dark: #e61f3a;
  --orange: #ff6b35;
  --bg-gray: #f6f6f6;
  --card-bg: #ffffff;
  --text-main: #1a1a1a;
  --text-secondary: #666666;
  --text-muted: #999999;
  --border-color: #e8e8e8;
  --input-bg: #f8f8f8;
  --radius: 12px;
  --radius-sm: 8px;
}

/* ==================== 页面容器 - 渐变背景 ==================== */
.register-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 24px;
  background: linear-gradient(135deg, #ff2442 0%, #ff6b35 50%, #ff8c5a 100%);
  position: relative;
  overflow: hidden;
}

.register-page::before {
  content: '';
  position: absolute;
  top: -30%;
  right: -20%;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%);
}

.register-page::after {
  content: '';
  position: absolute;
  bottom: -20%;
  left: -15%;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%);
}

/* ==================== 注册卡片 ==================== */
.register-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 440px;
  background: var(--card-bg);
  border-radius: 20px;
  padding: 40px 36px 32px;
  box-shadow: 0 20px 60px rgba(255, 36, 66, 0.25), 0 4px 16px rgba(0, 0, 0, 0.08);
  animation: cardIn 0.5s ease-out;
}

@keyframes cardIn {
  from { opacity: 0; transform: translateY(30px) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

/* ==================== Logo + 标题 ==================== */
.register-header {
  text-align: center;
  margin-bottom: 28px;
}

.register-logo {
  height: 48px;
  object-fit: contain;
  margin-bottom: 16px;
}

.register-title {
  font-size: 26px;
  font-weight: 800;
  color: var(--text-main);
  margin-bottom: 6px;
  letter-spacing: 1px;
}

.register-desc {
  font-size: 14px;
  color: var(--text-muted);
}

/* ==================== 表单 ==================== */
.register-form {
  display: flex;
  flex-direction: column;
}

/* ==================== 输入框组 ==================== */
.input-group {
  display: flex;
  align-items: center;
  border: 1.5px solid var(--border-color);
  border-radius: var(--radius);
  margin-bottom: 14px;
  transition: all 0.25s;
  background: var(--input-bg);
  position: relative;
  overflow: hidden;
}

.input-group:focus-within {
  border-color: #ff2442;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(255, 36, 66, 0.08);
}

.input-icon {
  display: flex;
  align-items: center;
  padding-left: 14px;
  color: var(--text-muted);
  flex-shrink: 0;
  transition: color 0.25s;
}

.input-group:focus-within .input-icon {
  color: #ff2442;
}

.form-input {
  flex: 1;
  border: none !important;
  background: transparent !important;
  padding: 12px 14px;
  font-size: 15px;
  color: var(--text-main);
  outline: none !important;
  box-shadow: none !important;
  min-width: 0;
  border-radius: 0 !important;
}

.form-input::placeholder {
  color: #c0c0c8;
}

.toggle-pwd {
  display: flex;
  align-items: center;
  padding-right: 14px;
  color: var(--text-muted);
  cursor: pointer;
  transition: color 0.2s;
}

.toggle-pwd:hover {
  color: #ff2442;
}

/* ==================== 密码强度指示器 ==================== */
.pwd-strength {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  padding: 0 4px;
}

.strength-bars {
  display: flex;
  gap: 4px;
  flex: 1;
}

.strength-bars .bar {
  height: 4px;
  flex: 1;
  border-radius: 2px;
  background: #e8e8e8;
  transition: all 0.3s;
}

.strength-bars .bar.active.weak {
  background: #ff2442;
}

.strength-bars .bar.active.medium {
  background: #ff9f43;
}

.strength-bars .bar.active.strong {
  background: #2ed573;
}

.strength-label {
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
  color: #ff2442;
}

.strength-label.medium-label {
  color: #ff9f43;
}

.strength-label.strong-label {
  color: #2ed573;
}

/* ==================== 错误提示 ==================== */
.error-msg {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  margin-bottom: 14px;
  background: rgba(255, 36, 66, 0.06);
  color: #ff2442;
  border: 1px solid rgba(255, 36, 66, 0.2);
}

/* ==================== 注册按钮 ==================== */
.btn-register {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #ff2442, #ff6b35);
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  letter-spacing: 2px;
  margin-top: 8px;
  font-family: inherit;
  position: relative;
  overflow: hidden;
}

.btn-register::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
  transition: left 0.5s;
}

.btn-register:hover:not(:disabled)::after {
  left: 100%;
}

.btn-register:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(255, 36, 66, 0.35);
}

.btn-register:active:not(:disabled) {
  transform: translateY(0);
}

.btn-register:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* spinner */
.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ==================== 底部链接 ==================== */
.register-footer {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: var(--text-muted);
}

.link-login {
  color: #ff2442;
  font-weight: 700;
  text-decoration: none;
  margin-left: 4px;
  transition: opacity 0.2s;
}

.link-login:hover {
  opacity: 0.75;
}

/* ==================== 过渡动画 ==================== */
.fade-enter-active, .fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ==================== 响应式 ==================== */
@media (max-width: 480px) {
  .register-card {
    padding: 32px 24px 28px;
    border-radius: 16px;
  }
  .register-title {
    font-size: 22px;
  }
  .input-group {
    margin-bottom: 12px;
  }
}
</style>
