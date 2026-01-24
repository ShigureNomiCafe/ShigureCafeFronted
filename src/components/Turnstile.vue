<template>
  <Teleport to="body">
    <transition name="fade">
      <div v-show="store.isVisible"
        class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/20 backdrop-blur-md"
        @click="store.close">
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-[350px] transform transition-all"
          :class="store.isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'" @click.stop>
          <div class="text-center mb-6">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white">{{ $t('captcha.title') }}</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ $t('captcha.hint') }}</p>
          </div>

          <!-- Container is always kept in DOM -->
          <div class="turnstile-wrapper flex justify-center min-h-[65px]" ref="turnstileContainer"></div>

          <button @click="store.close"
            class="mt-6 w-full py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            {{ $t('captcha.cancel') }}
          </button>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useTurnstileStore } from '../stores/turnstile';

const store = useTurnstileStore();
const turnstileContainer = ref<HTMLElement | null>(null);
let widgetId: string | null = null;

const loadTurnstile = () => {
  if (window.turnstile) {
    renderWidget();
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
  script.async = true;
  script.defer = true;
  script.onload = renderWidget;
  document.head.appendChild(script);
};

const renderWidget = () => {
  if (!turnstileContainer.value || !window.turnstile || widgetId !== null) return;

  try {
    widgetId = window.turnstile.render(turnstileContainer.value, {
      sitekey: store.siteKey,
      execution: 'execute',
      appearance: 'always',
      callback: (token: string) => {
        store.onSuccess(token);
        // Reset after a delay so the next 'execute' starts fresh
        setTimeout(() => {
          if (widgetId) window.turnstile.reset(widgetId);
        }, 1000);
      },
      'error-callback': (error: any) => {
        store.onError(error);
        if (widgetId) window.turnstile.reset(widgetId);
      },
      'expired-callback': () => {
        if (widgetId) window.turnstile.reset(widgetId);
      },
    });
  } catch (e) {
    console.error('Failed to render Turnstile widget:', e);
  }
};

// When store triggers visibility, we call execute
watch(() => store.isVisible, (newVal) => {
  if (newVal && widgetId) {
    window.turnstile.execute(widgetId, {
      action: store.currentAction
    });
  }
});

onMounted(() => {
  // Always load and render on mount so it's ready and kept alive
  loadTurnstile();
});
</script>

<style scoped>
.turnstile-wrapper {
  min-height: 65px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

<script lang="ts">
declare global {
  interface Window {
    turnstile: any;
  }
}
</script>