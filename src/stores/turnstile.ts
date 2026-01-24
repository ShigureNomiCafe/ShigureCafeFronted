import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useTurnstileStore = defineStore('turnstile', () => {
  const isVisible = ref(false);
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
  const currentAction = ref('');

  // Use promise-based approach to return token to caller
  let resolvePromise: ((token: string) => void) | null = null;
  let rejectPromise: ((reason: any) => void) | null = null;

  const verify = (action: string = ''): Promise<string> => {
    currentAction.value = action;
    isVisible.value = true;

    return new Promise((resolve, reject) => {
      resolvePromise = resolve;
      rejectPromise = reject;
    });
  };

  const onSuccess = (token: string) => {
    if (resolvePromise) {
      resolvePromise(token);
      resolvePromise = null;
      rejectPromise = null;
    }
    // Delay closing for better UX
    setTimeout(() => {
      isVisible.value = false;
    }, 500);
  };

  const onError = (error: any) => {
    if (rejectPromise) {
      rejectPromise(error);
      resolvePromise = null;
      rejectPromise = null;
    }
    isVisible.value = false;
  };

  const close = () => {
    isVisible.value = false;
    if (rejectPromise) {
      rejectPromise(new Error('User cancelled'));
      resolvePromise = null;
      rejectPromise = null;
    }
  };

  return {
    isVisible,
    siteKey,
    currentAction,
    verify,
    onSuccess,
    onError,
    close
  };
});
