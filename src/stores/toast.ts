import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface Toast {
  id: number;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Toast[]>([]);
  let nextId = 0;

  const add = (toast: Omit<Toast, 'id'>) => {
    const id = nextId++;
    const duration = toast.duration ?? 3000;
    const newToast = { ...toast, id };
    toasts.value.push(newToast);

    if (duration > 0) {
      setTimeout(() => {
        remove(id);
      }, duration);
    }
  };

  const remove = (id: number) => {
    const index = toasts.value.findIndex((t) => t.id === id);
    if (index !== -1) {
      toasts.value.splice(index, 1);
    }
  };

  const success = (title: string, message?: string) => add({ type: 'success', title, message });
  const error = (title: string, message?: string) => add({ type: 'error', title, message });
  const info = (title: string, message?: string) => add({ type: 'info', title, message });

  return { toasts, add, remove, success, error, info };
});
