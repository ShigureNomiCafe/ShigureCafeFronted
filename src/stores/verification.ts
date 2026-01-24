import { defineStore } from 'pinia';
import { useToastStore } from './toast';
import api from '../api';
import i18n from '../locales';

const { t } = i18n.global;

export const useVerificationStore = defineStore('verification', {
  state: () => ({
    sending: false,
    countdown: 0,
    timer: null as any,
  }),
  actions: {
    startCountdown(seconds: number = 60) {
      this.countdown = seconds;
      if (this.timer) clearInterval(this.timer);
      this.timer = setInterval(() => {
        this.countdown--;
        if (this.countdown <= 0) {
          if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
          }
        }
      }, 1000);
    },

    async sendCode(email: string, type: 'REGISTER' | '2FA' | 'UPDATE_EMAIL' | 'RESET_PASSWORD', turnstileToken?: string) {
      const toastStore = useToastStore();

      if (!email) {
        toastStore.error(t('verification.messages.send-failed'), t('verification.messages.enter-email'));
        return false;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toastStore.error(t('verification.messages.send-failed'), t('verification.messages.invalid-email'));
        return false;
      }

      if (!turnstileToken) {
        toastStore.error(t('verification.messages.send-failed'), t('verification.messages.captcha-required'));
        return false;
      }

      this.sending = true;
      try {
        await api.post('/auth/verification-codes', { email, type, turnstileToken });
        toastStore.success(t('verification.messages.send-success'), t('verification.messages.send-success-detail'));
        this.startCountdown();
        return true;
      } catch (e: any) {
        toastStore.error(t('verification.messages.send-failed'), e.message || t('verification.messages.request-failed'));
        return false;
      } finally {
        this.sending = false;
      }
    },
  },
});
