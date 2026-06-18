<!-- ==================== Smart Mall - AI 智能助手聊天界面 ==================== -->
<template>
  <div class="ai-chat-page">
    <!-- ===== 左侧：会话列表 ===== -->
    <aside class="ai-sidebar">
      <div class="sidebar-header">
        <h3>AI 助手</h3>
        <button class="btn-new-chat" @click="startNewChat">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          新对话
        </button>
      </div>

      <!-- 模式选择器 - 胶囊风格 -->
      <div class="mode-selector">
        <div class="mode-chips">
          <button
            v-for="m in modes"
            :key="m.value"
            :class="['mode-chip', { active: chatMode === m.value }]"
            @click="chatMode = m.value"
          >
            <span class="chip-emoji">{{ m.emoji }}</span>
            <span>{{ m.label }}</span>
          </button>
        </div>
      </div>

      <!-- 会话列表 -->
      <div class="session-list">
        <div class="list-title">历史会话</div>
        <div v-if="loadingSessions" class="list-status">
          <span class="mini-spinner"></span> 加载中...
        </div>
        <div v-else-if="sessions.length === 0" class="list-status">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" opacity="0.4"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <span>暂无历史会话</span>
        </div>
        <div
          v-for="s in sessions"
          :key="s.id"
          :class="['session-item', { active: s.id === currentSessionId }]"
          @click="switchSession(s)"
        >
          <div class="session-info">
            <span class="session-title">{{ s.title }}</span>
            <span class="session-date">{{ s.createdAt ? formatTime(s.createdAt) : '' }}</span>
          </div>
          <button class="btn-delete-session" @click.stop="handleDeleteSession(s.id)" title="删除">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>
    </aside>

    <!-- ===== 右侧：聊天主区域 ===== -->
    <div class="ai-main">
      <!-- 欢迎界面 -->
      <div class="chat-welcome" v-if="!currentSessionId && messages.length === 0">
        <div class="welcome-content">
          <div class="welcome-bot">
            <span class="bot-avatar">AI</span>
          </div>
          <h2>你好，我是 Smart Mall AI 助手</h2>
          <p>我可以帮你查询商品信息、推荐商品、解答售后问题</p>
          <div class="quick-actions">
            <button class="quick-chip" @click="sendQuick('推荐一些热门商品')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              推荐商品
            </button>
            <button class="quick-chip" @click="sendQuick('如何申请退款？')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              如何退款
            </button>
            <button class="quick-chip" @click="sendQuick('有什么优惠券？')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="12" y1="10" x2="12" y2="16"/><line x1="15" y1="13" x2="9" y2="13"/></svg>
              查看优惠
            </button>
            <button class="quick-chip" @click="sendQuick('商城有什么商品？')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              浏览商品
            </button>
          </div>
        </div>
      </div>

      <!-- 消息列表 -->
      <div class="messages-container" ref="msgContainer">
        <div class="messages-inner">
          <div
            v-for="(msg, idx) in messages"
            :key="idx"
            :class="['message-row', msg.role]"
          >
            <!-- AI 头像 -->
            <div class="message-avatar" v-if="msg.role === 'assistant'">
              <span class="ai-avatar-text">AI</span>
            </div>

            <div class="message-bubble">
              <div class="message-content" v-html="renderContent(msg.content)"></div>
              <div class="message-time">{{ msg.time }}</div>
            </div>

            <!-- 用户头像 -->
            <div class="message-avatar" v-if="msg.role === 'user'">
              <span class="user-avatar-text">
                {{ (userStore.currentUser?.nickname || userStore.currentUser?.username || 'U')[0].toUpperCase() }}
              </span>
            </div>
          </div>

          <!-- 工具调用状态提示 -->
          <div v-if="streaming && statusMsg" class="status-indicator">
            <span class="status-spinner"></span>
            <span>{{ statusMsg }}</span>
          </div>

          <!-- 流式输出中的消息 -->
          <div v-if="streaming && streamingContent" class="message-row assistant">
            <div class="message-avatar">
              <span class="ai-avatar-text">AI</span>
            </div>
            <div class="message-bubble">
              <div class="message-content" v-html="renderContent(streamingContent)"></div>
              <div class="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>

          <!-- 纯等待状态 -->
          <div v-if="streaming && !streamingContent && !statusMsg" class="message-row assistant">
            <div class="message-avatar">
              <span class="ai-avatar-text">AI</span>
            </div>
            <div class="message-bubble">
              <div class="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部输入区 -->
      <div class="chat-input-area">
        <div class="input-row">
          <textarea
            v-model="inputMessage"
            @keydown.enter.exact.prevent="sendMessage"
            @keydown.enter.shift.exact="inputMessage += '\n'"
            placeholder="输入你的问题... (Enter 发送，Shift+Enter 换行)"
            rows="1"
            ref="inputEl"
            :disabled="streaming"
          ></textarea>
          <button
            class="btn-send"
            @click="sendMessage"
            :disabled="!inputMessage.trim() || streaming"
          >
            <svg v-if="!streaming" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            <span v-else class="mini-spinner-send"></span>
          </button>
        </div>
        <div class="input-hint">
          {{ chatModeLabel }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, watch } from 'vue'
import { useUserStore } from '../../stores/user'
import { api } from '../../utils/api'

const userStore = useUserStore()

// ===== 状态 =====
const chatMode = ref('chat')
const inputMessage = ref('')
const streaming = ref(false)
const streamingContent = ref('')
const statusMsg = ref('')
const currentSessionId = ref(null)
const messages = ref([])
const sessions = ref([])
const loadingSessions = ref(false)
const msgContainer = ref(null)
const inputEl = ref(null)

const modes = [
  { value: 'chat', emoji: '💬', label: '自由对话' },
  { value: 'product_query', emoji: '📦', label: '商品问答' },
  { value: 'recommend', emoji: '🎯', label: '商品推荐' },
  { value: 'customer_service', emoji: '🎧', label: 'AI 客服' }
]

const chatModeLabel = computed(() => {
  const labels = {
    chat: '💬 自由对话',
    product_query: '📦 商品问答',
    recommend: '🎯 商品推荐',
    customer_service: '🎧 AI 客服'
  }
  return labels[chatMode.value] || '自由对话'
})

// ===== 生命周期 =====
onMounted(() => {
  loadSessions()
})

// ===== 会话管理 =====
async function loadSessions() {
  loadingSessions.value = true
  try {
    sessions.value = await api.getAiSessions(userStore.token) || []
  } catch (e) {
    console.error('加载会话失败', e)
  } finally {
    loadingSessions.value = false
  }
}

function startNewChat() {
  currentSessionId.value = null
  messages.value = []
  streamingContent.value = ''
  inputMessage.value = ''
  nextTick(() => inputEl.value?.focus())
}

async function switchSession(session) {
  currentSessionId.value = session.id
  messages.value = []
  streamingContent.value = ''
  try {
    const msgs = await api.getAiMessages(session.id, userStore.token)
    messages.value = (msgs || []).map(m => ({
      role: m.role,
      content: m.content,
      time: formatTime(m.createdAt)
    }))
  } catch (e) {
    console.error('加载消息失败', e)
  }
  await nextTick()
  scrollToBottom()
}

async function handleDeleteSession(sessionId) {
  if (!confirm('确定删除该会话吗？')) return
  try {
    await api.deleteAiSession(sessionId, userStore.token)
    if (currentSessionId.value === sessionId) {
      startNewChat()
    }
    await loadSessions()
  } catch (e) {
    console.error('删除会话失败', e)
  }
}

// ===== 发送消息 =====
async function sendMessage() {
  const text = inputMessage.value.trim()
  if (!text || streaming.value) return

  messages.value.push({
    role: 'user',
    content: text,
    time: formatTime(new Date().toISOString())
  })
  inputMessage.value = ''
  await nextTick()
  scrollToBottom()

  streaming.value = true
  streamingContent.value = ''

  try {
    const response = await api.chatStream({
      sessionId: currentSessionId.value,
      message: text,
      mode: chatMode.value
    }, userStore.token)

    if (!response.ok) {
      let errMsg = `HTTP ${response.status}`
      try { const err = await response.json(); errMsg = err.message || errMsg } catch {}
      throw new Error(errMsg)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      let currentEvent = 'message'
      for (const line of lines) {
        if (line.startsWith('event:')) {
          currentEvent = line.substring(6).trim()
          continue
        }
        if (line.startsWith('data:')) {
          const dataStr = line.substring(5).trim()
          try {
            const data = JSON.parse(dataStr)

            if (currentEvent === 'status') {
              statusMsg.value = typeof data === 'string' ? data : (data.message || dataStr)
            } else if (currentEvent === 'error') {
              throw new Error(typeof data === 'string' ? data : (data.message || '服务异常'))
            } else if (currentEvent === 'message' && data.content) {
              statusMsg.value = ''
              streamingContent.value += data.content
              await nextTick()
              scrollToBottom()
            } else if (currentEvent === 'done' && data.sessionId) {
              currentSessionId.value = data.sessionId
              loadSessions()
            }
          } catch (e) {
            if (e.message && !e.message.startsWith('Unexpected')) throw e
          }
        }
      }
    }
  } catch (e) {
    console.error('AI chat error:', e)
    if (e.message === 'Failed to fetch' || e.name === 'TypeError') {
      streamingContent.value += '\n\n⚠️ 无法连接 AI 服务，请确认服务已启动（端口 8203）'
    } else {
      streamingContent.value += '\n\n⚠️ ' + (e.message || '网络异常，请重试')
    }
  }

  if (streamingContent.value) {
    messages.value.push({
      role: 'assistant',
      content: streamingContent.value,
      time: formatTime(new Date().toISOString())
    })
  }
  streaming.value = false
  streamingContent.value = ''
  statusMsg.value = ''
  await nextTick()
  scrollToBottom()
}

function sendQuick(text) {
  inputMessage.value = text
  sendMessage()
}

// ===== 辅助函数 =====
function scrollToBottom() {
  if (msgContainer.value) {
    msgContainer.value.scrollTop = msgContainer.value.scrollHeight
  }
}

function formatTime(isoStr) {
  if (!isoStr) return ''
  const d = new Date(isoStr)
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
}

function renderContent(text) {
  if (!text) return ''
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/```(\w*)\n?([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/^### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^## (.+)$/gm, '<h3>$1</h3>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>')
  return html
}

// 自动调整输入框高度
watch(inputMessage, () => {
  nextTick(() => {
    if (inputEl.value) {
      inputEl.value.style.height = 'auto'
      inputEl.value.style.height = Math.min(inputEl.value.scrollHeight, 120) + 'px'
    }
  })
})
</script>

<style scoped>
/* ==================== 设计变量 ==================== */
.ai-chat-page {
  --red: #ff2442;
  --red-light: rgba(255, 36, 66, 0.1);
  --bg-gray: #f6f6f6;
  --card-bg: #ffffff;
  --text-main: #1a1a1a;
  --text-secondary: #666666;
  --text-muted: #999999;
  --border-color: #eeeeee;
  --sidebar-bg: #fafbfc;
}

/* ==================== 页面布局 ==================== */
.ai-chat-page {
  display: flex;
  height: calc(100vh - var(--header-height) - 80px);
  min-height: 600px;
  background: var(--card-bg);
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

/* ===== 左侧边栏 ===== */
.ai-sidebar {
  width: 280px;
  background: var(--sidebar-bg);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar-header {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-header h3 {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-main);
}

.btn-new-chat {
  display: flex;
  align-items: center;
  gap: 5px;
  background: linear-gradient(135deg, #ff2442, #ff6b35);
  color: #fff;
  padding: 7px 14px;
  font-size: 12px;
  border-radius: 20px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  white-space: nowrap;
  transition: all 0.2s;
  font-family: inherit;
}

.btn-new-chat:hover {
  box-shadow: 0 4px 12px rgba(255, 36, 66, 0.3);
  transform: scale(1.03);
}

/* ===== 模式选择器 - 胶囊风格 ===== */
.mode-selector {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
}

.mode-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.mode-chip {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 20px;
  border: 1.5px solid var(--border-color);
  background: #fff;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  font-family: inherit;
}

.mode-chip:hover {
  border-color: #ff2442;
  color: #ff2442;
}

.mode-chip.active {
  background: linear-gradient(135deg, #ff2442, #ff6b35);
  color: #fff;
  border-color: transparent;
  box-shadow: 0 2px 8px rgba(255, 36, 66, 0.25);
}

.chip-emoji {
  font-size: 13px;
}

/* ===== 会话列表 ===== */
.session-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.list-title {
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 600;
  padding: 6px 8px 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.list-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
  color: var(--text-muted);
  padding: 28px 0;
  font-size: 13px;
}

.session-item {
  display: flex;
  align-items: center;
  padding: 12px 14px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.15s;
  margin-bottom: 2px;
  gap: 8px;
}

.session-item:hover {
  background: rgba(255, 36, 66, 0.04);
}

.session-item.active {
  background: linear-gradient(135deg, rgba(255, 36, 66, 0.1), rgba(255, 107, 53, 0.08));
}

.session-item.active .session-title {
  color: #ff2442;
  font-weight: 600;
}

.session-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.session-title {
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text-main);
}

.session-date {
  font-size: 11px;
  color: var(--text-muted);
}

.btn-delete-session {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  opacity: 0;
  transition: all 0.15s;
  display: flex;
}

.session-item:hover .btn-delete-session {
  opacity: 0.5;
}

.btn-delete-session:hover {
  opacity: 1 !important;
  color: #ff2442;
  background: rgba(255, 36, 66, 0.08);
}

/* ===== 右侧聊天主区域 ===== */
.ai-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: #fff;
  position: relative;
}

/* ===== 欢迎界面 ===== */
.chat-welcome {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.welcome-content {
  text-align: center;
  max-width: 480px;
}

.welcome-bot {
  margin-bottom: 20px;
}

.bot-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff2442, #ff6b35);
  color: #fff;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -1px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.welcome-content h2 {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 8px;
}

.welcome-content p {
  color: var(--text-secondary);
  margin-bottom: 28px;
  font-size: 14px;
}

.quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.quick-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  border-radius: 24px;
  border: 1.5px solid var(--border-color);
  background: #fff;
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.quick-chip:hover {
  border-color: #ff2442;
  color: #ff2442;
  background: rgba(255, 36, 66, 0.03);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

/* ===== 消息区域 ===== */
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  scroll-behavior: smooth;
}

.messages-inner {
  max-width: 700px;
  margin: 0 auto;
}

.message-row {
  display: flex;
  gap: 10px;
  margin-bottom: 22px;
  animation: msgIn 0.3s ease;
}

@keyframes msgIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.message-row.user {
  flex-direction: row-reverse;
}

/* 头像 */
.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  align-self: flex-end;
  margin-bottom: 6px;
}

.ai-avatar-text {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  font-size: 14px;
  font-weight: 800;
}

.user-avatar-text {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ff2442, #ff6b35);
  color: #fff;
  font-size: 14px;
  font-weight: 800;
}

/* 气泡 */
.message-bubble {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 18px;
  position: relative;
}

.message-row.user .message-bubble {
  background: linear-gradient(135deg, #ff2442, #e61f3a);
  color: #fff;
  border-bottom-right-radius: 6px;
}

.message-row.assistant .message-bubble {
  background: #f0f2f5;
  color: var(--text-main);
  border-bottom-left-radius: 6px;
}

.message-content {
  font-size: 14px;
  line-height: 1.6;
  word-break: break-word;
}

/* Markdown 样式 */
.message-content :deep(h3) {
  font-size: 15px;
  font-weight: 700;
  margin: 10px 0 4px;
}

.message-content :deep(h4) {
  font-size: 14px;
  font-weight: 700;
  margin: 8px 0 4px;
}

.message-content :deep(li) {
  margin: 3px 0 3px 14px;
}

.message-content :deep(pre) {
  background: rgba(0, 0, 0, 0.06);
  padding: 10px 14px;
  border-radius: 10px;
  overflow-x: auto;
  margin: 8px 0;
  font-size: 13px;
  line-height: 1.5;
}

.message-content :deep(code) {
  background: rgba(0, 0, 0, 0.05);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 13px;
  font-family: 'Consolas', 'Courier New', monospace;
}

.message-row.user .message-content :deep(pre),
.message-row.user .message-content :deep(code) {
  background: rgba(255, 255, 255, 0.12);
}

.message-content :deep(strong) {
  font-weight: 700;
}

.message-time {
  font-size: 11px;
  opacity: 0.5;
  margin-top: 4px;
}

.message-row.assistant .message-time {
  text-align: left;
  color: var(--text-muted);
}

.message-row.user .message-time {
  text-align: right;
  color: rgba(255, 255, 255, 0.7);
}

/* ===== 工具调用状态 ===== */
.status-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 18px;
  margin: 6px auto;
  max-width: 700px;
  background: linear-gradient(135deg, rgba(255, 36, 66, 0.04), rgba(255, 107, 53, 0.04));
  border: 1px solid rgba(255, 36, 66, 0.12);
  border-radius: 14px;
  font-size: 13px;
  color: #ff2442;
  animation: pulseBorder 2s ease-in-out infinite;
}

.status-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 36, 66, 0.2);
  border-top-color: #ff2442;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes pulseBorder {
  0%, 100% { border-color: rgba(255, 36, 66, 0.12); }
  50% { border-color: rgba(255, 36, 66, 0.3); }
}

/* ===== 打字指示器 ===== */
.typing-indicator {
  display: flex;
  gap: 3px;
  padding: 4px 0 2px;
}

.typing-indicator span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #c0c0c8;
  animation: typingBounce 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) { animation-delay: 0s; }
.typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
.typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

@keyframes typingBounce {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.3; }
  30% { transform: translateY(-5px); opacity: 1; }
}

/* ===== 输入区 ===== */
.chat-input-area {
  padding: 16px 20px;
  border-top: 1px solid var(--border-color);
  background: var(--sidebar-bg);
}

.input-row {
  display: flex;
  gap: 10px;
  align-items: flex-end;
  max-width: 700px;
  margin: 0 auto;
}

.input-row textarea {
  flex: 1;
  padding: 12px 18px;
  border: 2px solid #e8e8e8;
  border-radius: 26px;
  font-size: 14px;
  resize: none;
  outline: none;
  transition: all 0.25s;
  line-height: 1.5;
  font-family: inherit;
  background: #fff;
  max-height: 120px;
}

.input-row textarea:focus {
  border-color: #ff2442;
  box-shadow: 0 0 0 4px rgba(255, 36, 66, 0.08);
}

.input-row textarea:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.input-row textarea::placeholder {
  color: #c0c0c8;
}

.btn-send {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #ff2442, #ff6b35);
  color: #fff;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-send:hover:not(:disabled) {
  transform: scale(1.06);
  box-shadow: 0 4px 16px rgba(255, 36, 66, 0.35);
}

.btn-send:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  background: #d0d0d0;
}

.mini-spinner-send {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

.mini-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid #e0e0e0;
  border-top-color: var(--text-muted);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.input-hint {
  text-align: center;
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 6px;
}

/* ===== 响应式 ===== */
@media (max-width: 768px) {
  .ai-chat-page {
    flex-direction: column;
    height: calc(100vh - var(--header-height) - 32px);
    border-radius: 0;
    box-shadow: none;
    border: none;
  }

  .ai-sidebar {
    width: 100%;
    max-height: 180px;
    border-right: none;
    border-bottom: 1px solid var(--border-color);
  }

  .message-bubble {
    max-width: 82%;
  }

  .chat-input-area {
    padding: 12px;
  }
}
</style>
