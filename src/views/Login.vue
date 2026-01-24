<template>
  <AuthLayout :title="show2FA ? t('auth.two-factor.title') : t('auth.login.title')"
    :subtitle="show2FA ? (useEmail ? t('auth.two-factor.email-subtitle', { email: auth.twoFactorEmail }) : t('auth.two-factor.app-subtitle')) : t('auth.login.subtitle')">
    <form v-if="!show2FA" class="mt-8 space-y-6" @submit.prevent="handleLogin">
      <div class="space-y-4">
        <BaseInput id="username" v-model="form.username" :label="t('auth.login.username-label')"
          :placeholder="t('auth.login.username-placeholder')" required />
        <BaseInput id="password" v-model="form.password" :label="t('auth.login.password-label')" type="password"
          :placeholder="t('auth.login.password-placeholder')" required />
      </div>

      <BaseButton type="submit" :loading="loading" :loading-text="t('auth.login.logging-in')"
        :label="t('auth.login.login-button')" full-width />
    </form>

    <form v-else class="mt-8 space-y-6" @submit.prevent="handleVerify2FA">
      <div class="space-y-4">
        <div class="group">
          <label class="block text-sm font-medium text-gray-700 mb-3 ml-1">{{ t('auth.two-factor.code-label') }}</label>
          <DigitInput v-model="twoFactorCode" @complete="handleVerify2FA" />

          <div v-if="useEmail" class="space-y-4">
            <div class="flex justify-center">
              <VerificationCodeButton ref="verificationCodeButtonRef" :email="auth.twoFactorEmail || ''" type="2FA"
                @click="onVerifyCodeClick" class="min-w-[140px]" />
            </div>
          </div>
          <div v-if="auth.hasTotp && auth.hasEmail2fa" class="mt-4 flex justify-center">
            <button @click="toggleMethod" type="button"
              class="text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors">
              {{ useEmail ? t('auth.two-factor.use-app') : t('auth.two-factor.use-email') }}
            </button>
          </div>
        </div>
      </div>



      <div>
        <BaseButton type="submit" :loading="loading" :disabled="twoFactorCode.length < 6"
          :loading-text="t('auth.two-factor.verifying')" :label="t('auth.two-factor.verify-button')" full-width />
        <button @click="show2FA = false" type="button"
          class="mt-4 w-full text-sm text-gray-500 hover:text-gray-700 transition-colors">
          {{ t('auth.two-factor.back-to-login') }}
        </button>
      </div>
    </form>

    <div v-if="!show2FA" class="flex items-center justify-between text-sm mt-4">
      <router-link to="/register" class="font-medium text-blue-600 hover:text-indigo-500 transition-colors">
        {{ t('auth.login.register-link') }}
      </router-link>
      <router-link to="/forgot-password" class="font-medium text-gray-500 hover:text-gray-700 transition-colors">
        {{ t('auth.login.forgot-password-link') }}
      </router-link>
    </div>
  </AuthLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
import { useToastStore } from '../stores/toast';
import { useI18n } from 'vue-i18n';
import AuthLayout from '../components/AuthLayout.vue';
import BaseInput from '../components/BaseInput.vue';
import BaseButton from '../components/BaseButton.vue';
import DigitInput from '../components/DigitInput.vue';
import VerificationCodeButton from '../components/VerificationCodeButton.vue';

import { useTurnstileStore } from '../stores/turnstile';

const { t } = useI18n();
const form = ref({ username: '', password: '', turnstileToken: '' });
const twoFactorCode = ref('');

const show2FA = ref(false);
const useEmail = ref(false);
const loading = ref(false);
const auth = useAuthStore();
const router = useRouter();
const toastStore = useToastStore();
const turnstileStore = useTurnstileStore();

const verificationCodeButtonRef = ref();

const onVerifyCodeClick = async () => {
  try {
    const token = await turnstileStore.verify('send_2fa_code');
    verificationCodeButtonRef.value?.handleClick(token);
  } catch (e) {
    // User cancelled or error
  }
};

const toggleMethod = () => {
  useEmail.value = !useEmail.value;
  twoFactorCode.value = '';
};

const handleLogin = async () => {
  loading.value = true;
  try {
    const token = await turnstileStore.verify('login');
    form.value.turnstileToken = token;

    const result = await auth.login(form.value);
    if (result.twoFactorRequired) {
      show2FA.value = true;
      // Prioritize TOTP if available
      if (auth.hasTotp) {
        useEmail.value = false;
      } else {
        useEmail.value = true;
      }
    } else {
      router.push('/dashboard');
    }
  } catch (e: any) {
    if (e.message !== 'User cancelled') {
      toastStore.error(t('auth.login.login-failed'), e.message || t('auth.login.login-failed-detail'));
    }
  } finally {
    loading.value = false;
  }
};

const handleVerify2FA = async () => {
  if (twoFactorCode.value.length < 6) return;
  loading.value = true;
  try {
    await auth.verify2FA(twoFactorCode.value);
    router.push('/dashboard');
  } catch (e: any) {
    toastStore.error(t('auth.two-factor.verify-failed'), e.message || t('auth.two-factor.verify-failed-detail'));
  } finally {
    loading.value = false;
  }
};
</script>
