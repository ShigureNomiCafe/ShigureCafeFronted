import { ref, onUnmounted } from 'vue';
import { useToastStore } from '../stores/toast';
import api from '../api';

export function useVerificationCode() {
  const toastStore = useToastStore();
  const sending = ref(false);
  const countdown = ref(0);
  let timer: any = null;

  const startCountdown = (seconds: number = 60) => {
    countdown.value = seconds;
    if (timer) clearInterval(timer);
    timer = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) {
        if (timer) clearInterval(timer);
      }
    }, 1000);
  };

  const sendCode = async (email: string, type: 'REGISTER' | '2FA' | 'UPDATE_EMAIL' | 'RESET_PASSWORD') => {
    if (!email) {
      toastStore.error('发送失败', '请输入邮箱地址');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toastStore.error('发送失败', '请输入有效的邮箱地址');
      return false;
    }

    sending.value = true;
    try {
      await api.post('/auth/verification-codes', { email, type });
      toastStore.success('发送成功', '验证码已发送至您的邮箱，请注意查收。');
      startCountdown();
      return true;
    } catch (e: any) {
      toastStore.error('发送失败', e.message || '请求失败，请稍后重试');
      return false;
    } finally {
      sending.value = false;
    }
  };

  onUnmounted(() => {
    if (timer) clearInterval(timer);
  });

  return {
    sending,
    countdown,
    sendCode,
    startCountdown
  };
}
