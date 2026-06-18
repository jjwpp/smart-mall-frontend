<!-- ==================== 登录页 ==================== -->
<template>
  <div class="login-page">
    <!-- 登录卡片 -->
    <div class="login-card">
      <!-- Logo + 标题 -->
      <div class="login-header">
        <img src="@/pic/logo.png" alt="Smart Mall" class="login-logo" />
        <h1 class="login-title">欢迎回来</h1>
        <p class="login-desc">登录您的账号以继续</p>
      </div>

      <!-- 登录方式切换 - 胶囊标签 -->
      <div class="login-tabs">
        <button
          :class="['tab-pill', { active: loginMode === 'password' }]"
          @click="switchMode('password')"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          密码登录
        </button>
        <button
          :class="['tab-pill', { active: loginMode === 'email' }]"
          @click="switchMode('email')"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 4l-10 8L2 4"/></svg>
          邮箱登录
        </button>
      </div>

      <!-- ==================== 密码登录表单 ==================== -->
      <form v-if="loginMode === 'password'" @submit.prevent="handleLogin" class="login-form">
        <div class="input-group">
          <span class="input-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </span>
          <input v-model="form.username" type="text" placeholder="请输入用户名" required autofocus class="form-input" />
        </div>

        <div class="input-group">
          <span class="input-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </span>
          <input v-model="form.password" :type="showPwd ? 'text' : 'password'" placeholder="请输入密码" required class="form-input" />
          <span class="toggle-pwd" @click="showPwd = !showPwd">
            <svg v-if="!showPwd" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
            </svg>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          </span>
        </div>

        <div class="captcha-row">
          <div class="input-group captcha-input-group">
            <span class="input-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><path d="M3 9h18M9 3v18" />
              </svg>
            </span>
            <input v-model="form.captchaCode" type="text" placeholder="验证码" required maxlength="4" class="form-input" autocomplete="off" />
          </div>
          <div class="captcha-img" @click="refreshCaptcha" title="点击刷新验证码">
            <img v-if="captcha.image" :src="captcha.image" alt="验证码" />
            <div v-else class="captcha-placeholder">
              <span v-if="captchaLoading">加载中...</span>
              <span v-else>点击获取</span>
            </div>
          </div>
        </div>

        <transition name="fade"><div v-if="error" class="error-msg"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg><span>{{ error }}</span></div></transition>
        <transition name="fade"><div v-if="successMsg" class="success-msg"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg><span>{{ successMsg }}</span></div></transition>

        <button class="btn-login" :disabled="loading" type="submit">
          <span v-if="loading" class="spinner"></span>
          <span>{{ loading ? '登录中...' : '登 录' }}</span>
        </button>
      </form>

      <!-- ==================== 邮箱验证码登录表单 ==================== -->
      <form v-if="loginMode === 'email'" @submit.prevent="handleEmailLogin" class="login-form">
        <div class="input-group">
          <span class="input-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 4l-10 8L2 4" />
            </svg>
          </span>
          <input v-model="emailForm.email" type="email" placeholder="请输入邮箱地址" required autofocus class="form-input" autocomplete="email" />
        </div>

        <div class="captcha-row">
          <div class="input-group captcha-input-group">
            <span class="input-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><path d="M3 9h18M9 3v18" />
              </svg>
            </span>
            <input v-model="emailForm.code" type="text" placeholder="请输入6位验证码" required maxlength="6" class="form-input" autocomplete="one-time-code" />
          </div>
          <button type="button" class="code-btn" :disabled="countdown > 0 || sending" @click="handleSendCode">
            <span v-if="sending" class="spinner-sm"></span>
            <span v-else-if="countdown > 0">{{ countdown }}s后重试</span>
            <span v-else>获取验证码</span>
          </button>
        </div>

        <transition name="fade"><div v-if="error" class="error-msg"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg><span>{{ error }}</span></div></transition>
        <transition name="fade"><div v-if="successMsg" class="success-msg"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg><span>{{ successMsg }}</span></div></transition>

        <button class="btn-login" :disabled="loading" type="submit">
          <span v-if="loading" class="spinner"></span>
          <span>{{ loading ? '验证中...' : '登 录' }}</span>
        </button>
      </form>

      <!-- 底部链接 -->
      <div class="login-footer">
        <span>还没有账号？</span>
        <router-link to="/register" class="link-register">立即注册</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../stores/user'
import { api } from '../utils/api'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// ---- 登录模式 ----
const loginMode = ref('password')  // 'password' | 'email'

// ---- 密码登录 ----
const form = reactive({ username: '', password: '', captchaCode: '' })
const captcha = reactive({ image: '', key: '' })
const captchaLoading = ref(false)
const showPwd = ref(false)

// ---- 邮箱验证码登录 ----
const emailForm = reactive({ email: '', code: '' })
const countdown = ref(0)
const sending = ref(false)
let countdownTimer = null

// ---- 公共状态 ----
const loading = ref(false)
const error = ref('')
const successMsg = ref('')

onMounted(() => {
  if (route.query.registered === '1') {
    successMsg.value = '注册成功！请登录'
  }
  refreshCaptcha()
})

// ==================== 模式切换 ====================
function switchMode(mode) {
  loginMode.value = mode
  error.value = ''
  successMsg.value = ''
  if (mode === 'password') {
    refreshCaptcha()
  }
}

// ==================== 密码登录 ====================
async function refreshCaptcha() {
  captchaLoading.value = true
  try {
    const data = await api.getCaptcha()
    captcha.image = data.image
    captcha.key = data.key
    form.captchaCode = ''
    error.value = ''
  } catch (e) {
    error.value = '获取验证码失败，请刷新重试'
  } finally {
    captchaLoading.value = false
  }
}

async function handleLogin() {
  error.value = ''
  successMsg.value = ''
  loading.value = true

  try {
    const jwt = await api.login({
      username: form.username,
      password: form.password,
      captchaKey: captcha.key,
      captchaCode: form.captchaCode
    })

    if (!jwt || typeof jwt !== 'string') {
      throw new Error('登录响应异常：未获取到 Token')
    }

    await fetchUserAndRedirect(jwt, { username: form.username })
  } catch (e) {
    error.value = e.message || '登录失败，请检查用户名和密码'
    refreshCaptcha()
  } finally {
    loading.value = false
  }
}

// ==================== 邮箱验证码登录 ====================
async function handleSendCode() {
  error.value = ''
  successMsg.value = ''

  if (!emailForm.email) {
    error.value = '请输入邮箱地址'
    return
  }

  sending.value = true
  try {
    await api.sendEmailCode({ email: emailForm.email })
    successMsg.value = '验证码已发送，请查收邮件'
    startCountdown()
  } catch (e) {
    error.value = e.message || '验证码发送失败'
  } finally {
    sending.value = false
  }
}

function startCountdown() {
  countdown.value = 60
  clearInterval(countdownTimer)
  countdownTimer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(countdownTimer)
      countdownTimer = null
    }
  }, 1000)
}

async function handleEmailLogin() {
  error.value = ''
  successMsg.value = ''
  loading.value = true

  try {
    const response = await api.emailLogin({
      email: emailForm.email,
      code: emailForm.code
    })

    const token = response.token || response
    if (!token || typeof token !== 'string') {
      throw new Error('登录响应异常：未获取到 Token')
    }

    // 后端返回完整的 LoginResponse（含 user 信息）
    const userInfo = response.user
    const user = userInfo ? {
      id: userInfo.id,
      username: userInfo.username,
      nickname: userInfo.nickname,
      phone: userInfo.phone,
      email: userInfo.email,
      status: userInfo.status,
      roles: userInfo.roles || ['USER']
    } : { username: emailForm.email.split('@')[0], roles: ['USER'] }

    userStore.setAuth(token, user)

    const redirect = route.query.redirect
      || (user.roles?.includes('ADMIN') ? '/admin/dashboard' : '/home')
    router.push(redirect)
  } catch (e) {
    error.value = e.message || '登录失败，请检查验证码'
  } finally {
    loading.value = false
  }
}

// ==================== 公共方法 ====================
async function fetchUserAndRedirect(jwt, fallbackUser) {
  let user = fallbackUser
  try {
    const userInfo = await api.getUserInfo(jwt)
    if (userInfo) {
      user = {
        id: userInfo.id,
        username: userInfo.username,
        nickname: userInfo.nickname,
        phone: userInfo.phone,
        email: userInfo.email,
        status: userInfo.status,
        roles: userInfo.roles || ['USER']
      }
    }
  } catch (e) {
    console.warn('获取用户信息失败，使用默认值', e)
  }

  userStore.setAuth(jwt, user)

  const redirect = route.query.redirect
    || (user.roles?.includes('ADMIN') ? '/admin/dashboard' : '/home')
  router.push(redirect)
}
</script>

<style scoped>
/* ==================== 设计变量 ==================== */
.login-page {
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
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 24px;
  background: linear-gradient(135deg, #ff2442 0%, #ff6b35 50%, #ff8c5a 100%);
  position: relative;
  overflow: hidden;
}

.login-page::before {
  content: '';
  position: absolute;
  top: -30%;
  right: -20%;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%);
}

.login-page::after {
  content: '';
  position: absolute;
  bottom: -20%;
  left: -15%;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%);
}

/* ==================== 登录卡片 ==================== */
.login-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 420px;
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
.login-header {
  text-align: center;
  margin-bottom: 28px;
}

.login-logo {
  height: 48px;
  object-fit: contain;
  margin-bottom: 16px;
}

.login-title {
  font-size: 26px;
  font-weight: 800;
  color: var(--text-main);
  margin-bottom: 6px;
  letter-spacing: 1px;
}

.login-desc {
  font-size: 14px;
  color: var(--text-muted);
}

/* ==================== 胶囊标签切换 ==================== */
.login-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 28px;
  background: var(--bg-gray);
  border-radius: 28px;
  padding: 4px;
}

.tab-pill {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 11px 16px;
  border: none;
  border-radius: 24px;
  background: transparent;
  color: var(--text-muted);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
}

.tab-pill.active {
  background: linear-gradient(135deg, #ff2442, #ff6b35);
  color: #fff;
  box-shadow: 0 4px 12px rgba(255, 36, 66, 0.3);
}

.tab-pill:hover:not(.active) {
  color: #ff2442;
  background: rgba(255, 36, 66, 0.06);
}

/* ==================== 表单 ==================== */
.login-form {
  display: flex;
  flex-direction: column;
}

/* ==================== 输入框组 ==================== */
.input-group {
  display: flex;
  align-items: center;
  border: 1.5px solid var(--border-color);
  border-radius: var(--radius);
  margin-bottom: 16px;
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
  padding: 13px 14px;
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

/* ==================== 验证码行 ==================== */
.captcha-row {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  align-items: stretch;
}

.captcha-input-group {
  flex: 1;
  margin-bottom: 0;
}

.captcha-img {
  width: 110px;
  height: 48px;
  border-radius: var(--radius);
  overflow: hidden;
  cursor: pointer;
  flex-shrink: 0;
  border: 1.5px solid var(--border-color);
  background: #f0f0f4;
  position: relative;
}

.captcha-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.captcha-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: var(--text-muted);
}

.captcha-img:hover {
  border-color: #ff2442;
}

/* ==================== 获取验证码按钮 ==================== */
.code-btn {
  width: 120px;
  height: 48px;
  padding: 0 8px;
  border: none !important;
  background: linear-gradient(135deg, #ff2442, #ff6b35);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  border-radius: var(--radius) !important;
  flex-shrink: 0;
  transition: all 0.25s;
  font-family: inherit;
}

.code-btn:hover:not(:disabled) {
  box-shadow: 0 4px 14px rgba(255, 36, 66, 0.3);
  transform: translateY(-1px);
}

.code-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ==================== 错误/成功提示 ==================== */
.error-msg, .success-msg {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  margin-bottom: 16px;
}

.error-msg {
  background: rgba(255, 36, 66, 0.06);
  color: #ff2442;
  border: 1px solid rgba(255, 36, 66, 0.2);
}

.success-msg {
  background: rgba(82, 196, 26, 0.06);
  color: #52c41a;
  border: 1px solid rgba(82, 196, 26, 0.2);
}

/* ==================== 登录按钮 ==================== */
.btn-login {
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
  margin-top: 4px;
  font-family: inherit;
  position: relative;
  overflow: hidden;
}

.btn-login::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
  transition: left 0.5s;
}

.btn-login:hover:not(:disabled)::after {
  left: 100%;
}

.btn-login:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(255, 36, 66, 0.35);
}

.btn-login:active:not(:disabled) {
  transform: translateY(0);
}

.btn-login:disabled {
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

.spinner-sm {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ==================== 底部链接 ==================== */
.login-footer {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: var(--text-muted);
}

.link-register {
  color: #ff2442;
  font-weight: 700;
  text-decoration: none;
  margin-left: 4px;
  transition: opacity 0.2s;
}

.link-register:hover {
  opacity: 0.75;
}

/* ==================== 过渡动画 ==================== */
.fade-enter-active, .fade-leave-active { transition: all 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-8px); }

/* ==================== 响应式 ==================== */
@media (max-width: 480px) {
  .login-card {
    padding: 32px 24px 28px;
    border-radius: 16px;
  }
  .login-title {
    font-size: 22px;
  }
  .tab-pill {
    font-size: 13px;
    padding: 9px 12px;
  }
  .captcha-img {
    width: 96px;
  }
  .code-btn {
    width: 100px;
    font-size: 12px;
  }
}
</style>
