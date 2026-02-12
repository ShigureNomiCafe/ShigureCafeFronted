<template>
  <div class="h-screen bg-gray-50 flex flex-col overflow-hidden">
    <NavBar class="shrink-0" />

    <main class="flex-1 flex flex-col overflow-hidden py-4 sm:py-6">
      <AdminPageHeader :title="t('admin-logs.title')" v-model="logStore.filters.search" :loading="logStore.loading"
        :search-placeholder="t('admin-logs.filters.search-placeholder')" @refresh="fetchLogs(true)"
        class="relative z-50 shrink-0 mb-4 sm:mb-6">
        <template #extra>
          <BaseSelect v-model="logStore.filters.level" :options="levelOptions" class="min-w-[150px]"
            @change="handleFilterChange" />
          <BaseSelect v-model="logStore.filters.source" :options="sourceOptions" class="min-w-[150px]"
            @change="handleFilterChange" />
        </template>
      </AdminPageHeader>

      <div class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden pb-4 sm:pb-6">
        <BaseCard body-class="p-0 flex flex-col h-full overflow-hidden" class="h-full border-none shadow-sm ring-1 ring-gray-100">
          <!-- Terminal Container -->
          <div class="flex-1 flex flex-col bg-white overflow-hidden relative">
            
            <!-- Loading overlay for initial load -->
            <div v-if="logStore.loading && logStore.logs.length === 0"
              class="absolute inset-0 z-30 flex justify-center items-center bg-white/80 backdrop-blur-sm text-gray-400">
              <div class="flex flex-col items-center">
                <Loader2 class="h-8 w-8 animate-spin text-indigo-500 mb-2" />
                <span class="text-xs font-medium">{{ t('common.loading') }}</span>
              </div>
            </div>

            <!-- Control Header (Sticky) -->
            <div class="shrink-0 px-4 py-2.5 bg-gray-50/50 flex items-center justify-between border-b border-gray-100 z-20 backdrop-blur-sm">
              <div class="flex items-center space-x-3">
                <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{{ t('admin-logs.title') }}</span>
                <transition name="fade">
                  <div v-if="logStore.loading" class="flex items-center ml-2">
                    <Loader2 class="h-3 w-3 animate-spin text-indigo-500" />
                  </div>
                </transition>
              </div>
              
              <div class="flex items-center space-x-4">
                <button @click="toggleAutoScroll" 
                  class="flex items-center space-x-1.5 text-xs font-semibold transition-all hover:opacity-80"
                  :class="autoScroll ? 'text-indigo-600' : 'text-gray-400'">
                  <component :is="autoScroll ? Lock : Unlock" class="w-3.5 h-3.5" />
                  <span class="hidden sm:inline">{{ autoScroll ? '自动滚动已开启' : '自动滚动已关闭' }}</span>
                  <span class="sm:hidden">{{ autoScroll ? '滚动 ON' : '滚动 OFF' }}</span>
                </button>
              </div>
            </div>

            <!-- Log Scroll Area Container (Necessary for relative positioning of floating buttons) -->
            <div class="flex-1 relative overflow-hidden flex flex-col">
              <!-- Log Scroll Area -->
              <div ref="logContainer" 
                class="flex-1 overflow-y-auto overflow-x-hidden font-mono text-sm selection:bg-indigo-100 selection:text-indigo-900"
                @scroll="handleManualScroll">
                <div class="min-w-full inline-block align-middle">
                  <!-- Older logs loading indicator -->
                  <div v-if="logStore.loadingOlder" class="py-4 flex justify-center items-center border-b border-gray-50 bg-gray-50/30">
                    <div class="flex items-center space-x-2 text-indigo-500">
                      <Loader2 class="h-4 w-4 animate-spin" />
                      <span class="text-xs font-medium">{{ t('common.loading') }}</span>
                    </div>
                  </div>

                  <div v-for="log in logStore.logs" :key="log.id" 
                    class="group flex items-start space-x-3 px-4 py-1.5 hover:bg-indigo-50/30 transition-colors border-b border-gray-50/50 last:border-0 relative">
                    <span class="text-gray-400 shrink-0 select-none font-medium text-[12px] pt-0.5 w-[180px]">
                      {{ formatTimestamp(log.timestamp) }}
                    </span>
                    <div class="shrink-0 w-16 flex justify-center mt-0.5">
                      <BaseBadge :variant="getVariant(log.level)">
                        {{ log.level }}
                      </BaseBadge>
                    </div>
                    <div class="shrink-0 flex items-center mt-0.5">
                      <span class="px-2 py-0.5 rounded-md bg-gray-100 text-gray-800 font-mono text-[11px] font-bold tracking-tight">
                        {{ log.source }}
                      </span>
                    </div>
                    <span class="text-gray-700 break-all whitespace-pre-wrap flex-1 leading-relaxed text-[12px]">
                      {{ log.content }}
                    </span>
                  </div>
                  
                  <!-- Empty State within Terminal -->
                  <div v-if="logStore.logs.length === 0" class="absolute inset-0 flex flex-col items-center justify-center text-gray-300 pointer-events-none">
                    <ClipboardList class="h-16 w-16 text-gray-100 mb-4 stroke-[1]" />
                    <p class="italic text-sm font-medium">{{ t('admin-logs.no-logs') }}</p>
                  </div>
                </div>
              </div>
              
              <!-- Scroll to bottom float button -->
              <transition name="fade">
                <button v-if="showScrollBottomBtn" 
                  @click="scrollToBottom('smooth')"
                  class="absolute bottom-6 right-8 p-3 bg-white shadow-2xl ring-1 ring-gray-100 rounded-full text-indigo-600 hover:bg-indigo-50 active:translate-y-0.5 transition-all z-40 group">
                  <ArrowDown class="w-5 h-5 group-hover-animate-slide-down" />
                  <span class="absolute right-full mr-3 px-2 py-1 bg-gray-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">回到最底部</span>
                </button>
              </transition>
            </div>
          </div>
        </BaseCard>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, computed, watch, ref, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import NavBar from '../components/NavBar.vue';
import BaseCard from '../components/BaseCard.vue';
import BaseSelect from '../components/BaseSelect.vue';
import BaseBadge from '../components/BaseBadge.vue';
import AdminPageHeader from '../components/AdminPageHeader.vue';
import { useSystemLogStore } from '../stores/systemLog';
import { ClipboardList, Loader2, Lock, Unlock, ArrowDown } from 'lucide-vue-next';
import { formatDateTimePrecise } from '../utils/formatters';

const debounce = (fn: Function, delay: number) => {
  let timeoutId: number | null = null;
  return (...args: any[]) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      fn(...args);
    }, delay);
  };
};

const { t } = useI18n();
const logStore = useSystemLogStore();
const logContainer = ref<HTMLElement | null>(null);
const autoScroll = ref(true);
const showScrollBottomBtn = ref(false);
const isInitializing = ref(true);
let lastScrollTop = 0;
let pollingInterval: number | null = null;

const levelOptions = computed(() => [
  { label: t('admin-logs.filters.all-levels'), value: '' },
  { label: 'INFO', value: 'INFO' },
  { label: 'WARN', value: 'WARN' },
  { label: 'ERROR', value: 'ERROR' },
  { label: 'DEBUG', value: 'DEBUG' }
]);

const sourceOptions = computed(() => [
  { label: t('admin-logs.filters.all-sources'), value: '' },
  { label: 'ShigureCafeBackend', value: 'ShigureCafeBackend' },
  { label: 'ShigureCafeBot', value: 'ShigureCafeBot' },
  { label: 'ShigureCafePlugin', value: 'ShigureCafePlugin' }
]);

const formatTimestamp = (ts: number) => {
  return formatDateTimePrecise(ts);
};

const getVariant = (level: string) => {
  switch (level.toUpperCase()) {
    case 'ERROR': return 'danger';
    case 'WARN': return 'warning';
    case 'INFO': return 'info';
    case 'DEBUG': return 'purple';
    default: return 'neutral';
  }
};

const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
  if (logContainer.value) {
    nextTick(() => {
      if (logContainer.value) {
        logContainer.value.scrollTo({
          top: logContainer.value.scrollHeight,
          behavior
        });
      }
    });
  }
};

const handleManualScroll = async () => {
  if (!logContainer.value) return;
  
  const { scrollTop, scrollHeight, clientHeight } = logContainer.value;
  const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
  const isScrollingUp = scrollTop < lastScrollTop;
  lastScrollTop = scrollTop;
  
  showScrollBottomBtn.value = !isAtBottom;
  
  // Only disable auto-scroll if user is scrolling UP
  if (isScrollingUp && autoScroll.value && !isAtBottom) {
    autoScroll.value = false;
  }

  // Infinite scroll: load older logs when reaching threshold (60% from bottom = top 40%)
  if (isInitializing.value) return;

  const threshold = scrollHeight * 0.4;
  if (isScrollingUp && scrollTop < threshold && logStore.hasMoreOlder && !logStore.loadingOlder && !logStore.loading) {
    const oldScrollHeight = scrollHeight;
    await logStore.fetchOlderLogs();
    
    // After content is prepended, maintain scroll position
    nextTick(() => {
      if (logContainer.value) {
        const newScrollHeight = logContainer.value.scrollHeight;
        logContainer.value.scrollTop = newScrollHeight - oldScrollHeight + scrollTop;
      }
    });
  }
};

const toggleAutoScroll = () => {
  autoScroll.value = !autoScroll.value;
  if (autoScroll.value) {
    scrollToBottom();
  }
};

const fetchLogs = async (force: boolean = false) => {
  isInitializing.value = true;
  await logStore.fetchLogs(0, 100, force);
  
  if (autoScroll.value) {
    nextTick(() => {
      if (logContainer.value) {
        logContainer.value.scrollTop = logContainer.value.scrollHeight;
        // Small delay to ensure scroll event is processed before re-enabling infinite scroll
        setTimeout(() => {
          isInitializing.value = false;
        }, 100);
      }
    });
  } else {
    isInitializing.value = false;
  }
};

const startPolling = () => {
  if (pollingInterval) return;
  pollingInterval = window.setInterval(async () => {
    const oldLength = logStore.logs.length;
    await logStore.fetchLatestLogs();
    if (logStore.logs.length > oldLength && autoScroll.value) {
      scrollToBottom('smooth');
    }
  }, 3000);
};

const stopPolling = () => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
};

const handleFilterChange = () => {
  fetchLogs(true);
};

const debouncedFetch = debounce(() => {
  fetchLogs(true);
}, 500);

watch(() => logStore.filters.search, () => {
  debouncedFetch();
});

onMounted(() => {
  fetchLogs();
  startPolling();
});

onUnmounted(() => {
  stopPolling();
});
</script>

<style scoped>
.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 3px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: #d1d5db;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes slide-down {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(4px); }
}

.group:hover .group-hover-animate-slide-down {
  animation: slide-down 1.2s ease-in-out infinite;
}
</style>
