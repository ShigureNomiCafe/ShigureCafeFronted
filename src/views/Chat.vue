<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <NavBar />
    
    <main class="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-64px)] flex flex-col">
      <div class="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col flex-1">
        <!-- Chat Header -->
        <div class="p-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
              <Gamepad2 class="w-6 h-6" />
            </div>
            <div>
              <h3 class="text-sm font-bold text-gray-900">{{ t('chat.game-relay', '游戏聊天转发') }}</h3>
              <p class="text-xs text-green-500 flex items-center">
                <span class="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
                {{ t('chat.connected', '已连接至服务器') }}
              </p>
            </div>
          </div>
          <div class="flex items-center space-x-2 text-xs text-gray-400">
            <Users class="w-4 h-4" />
            <span>12 {{ t('chat.online', '在线') }}</span>
          </div>
        </div>

        <!-- Messages Area -->
        <div class="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30">
          <div v-for="(msg, idx) in mockMessages" :key="idx" class="flex flex-col" :class="msg.isMe ? 'items-end' : 'items-start'">
            <div class="flex items-center space-x-2 mb-1" :class="msg.isMe ? 'flex-row-reverse space-x-reverse' : 'flex-row'">
              <span class="text-xs font-bold" :class="msg.isMe ? 'text-blue-600' : 'text-gray-700'">{{ msg.sender }}</span>
              <span class="text-[10px] text-gray-400">{{ msg.time }}</span>
            </div>
            <div class="px-4 py-2 rounded-2xl text-sm shadow-sm max-w-[85%]"
              :class="msg.isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'">
              <span v-if="!msg.isMe && msg.type === 'game'" class="inline-block px-1.5 py-0.5 rounded text-[10px] bg-indigo-100 text-indigo-700 font-bold mr-1.5 align-middle">GAME</span>
              {{ msg.content }}
            </div>
          </div>
        </div>

        <!-- Input Area -->
        <div class="p-4 bg-white border-t border-gray-100 shrink-0">
          <div class="flex items-end space-x-3">
            <div class="flex-1 relative">
              <textarea
                v-model="newMessage"
                rows="1"
                @input="adjustTextarea"
                @keydown.enter.prevent="handleSend"
                ref="textareaRef"
                :placeholder="t('chat.placeholder', '发送消息到游戏内...')"
                class="w-full border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none py-3 px-4 text-sm transition-all duration-200"
              ></textarea>
            </div>
            <button
              @click="handleSend"
              class="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:active:scale-100"
              :disabled="!newMessage.trim()"
            >
              <Send class="w-5 h-5" />
            </button>
          </div>
          <p class="mt-2 text-[10px] text-gray-400 text-center">
            {{ t('chat.tip', '消息将实时同步至 Minecraft 服务器聊天栏') }}
          </p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Gamepad2, Users, Send } from 'lucide-vue-next';
import NavBar from '../components/NavBar.vue';

const { t } = useI18n();
const newMessage = ref('');
const textareaRef = ref<HTMLTextAreaElement | null>(null);

const mockMessages = ref([
  { sender: 'System', content: '连接成功，正在同步游戏内消息...', time: '12:00', isMe: false, type: 'system' },
  { sender: 'Steve', content: '大家下午好！有人去挖矿吗？', time: '12:30', isMe: false, type: 'game' },
  { sender: 'Alex', content: '等我一下，我先整理个背包。', time: '12:31', isMe: false, type: 'game' },
  { sender: '我', content: '你们在哪个坐标？我也过去。', time: '12:32', isMe: true, type: 'web' },
  { sender: 'Steve', content: '就在出生点往南 500 米。', time: '12:33', isMe: false, type: 'game' },
]);

const adjustTextarea = () => {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto';
    textareaRef.value.style.height = Math.min(textareaRef.value.scrollHeight, 120) + 'px';
  }
};

const handleSend = () => {
  if (!newMessage.value.trim()) return;
  // 目前仅做展示
  mockMessages.value.push({
    sender: '我',
    content: newMessage.value,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isMe: true,
    type: 'web'
  });
  newMessage.value = '';
  if (textareaRef.value) textareaRef.value.style.height = 'auto';
};
</script>

<style scoped>
/* 自定义滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #d1d5db;
}
</style>