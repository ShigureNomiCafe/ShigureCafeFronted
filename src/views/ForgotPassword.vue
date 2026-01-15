<template>
  <AuthLayout :title="t('auth.forgot-password.title')" :subtitle="t('auth.forgot-password.subtitle')">
    <form class="mt-8 space-y-6" @submit.prevent="handleReset">
      <div class="space-y-4">
        <!-- 邮箱输入和发送验证码 -->
        <BaseInput id="email" v-model="form.email" :label="t('auth.forgot-password.email-label')" type="email"
          :placeholder="t('auth.forgot-password.email-placeholder')" required show-button>
          <template #button>
            <VerificationCodeButton :email="form.email" type="RESET_PASSWORD" class="w-32" />
          </template>
        </BaseInput>

        <!-- 验证码 -->
        <BaseInput id="code" v-model="form.verificationCode" :label="t('auth.forgot-password.code-label')"
          autocomplete="one-time-code" :placeholder="t('auth.forgot-password.code-placeholder')" required />

        <!-- 新密码 -->
        <BaseInput id="newPassword" v-model="form.newPassword" :label="t('auth.forgot-password.new-password-label')"
          type="password" :placeholder="t('auth.forgot-password.new-password-placeholder')" required />

        <!-- 确认密码 -->
        <BaseInput id="confirmPassword" v-model="form.confirmPassword"
          :label="t('auth.forgot-password.confirm-password-label')" type="password"
          :placeholder="t('auth.forgot-password.confirm-password-placeholder')" required />
      </div>

      <BaseButton type="submit" :loading="loading" :loading-text="t('auth.forgot-password.resetting')"
        :label="t('auth.forgot-password.reset-button')" full-width />
    </form>
    <div class="text-center text-sm mt-4">
      <router-link to="/login" class="font-medium text-blue-600 hover:text-indigo-500 transition-colors">
        {{ t('auth.forgot-password.back-to-login') }}
      </router-link>
    </div>
  </AuthLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import api from '../api';
import { useRouter } from 'vue-router';
import { useToastStore } from '../stores/toast';
import AuthLayout from '../components/AuthLayout.vue';
import BaseInput from '../components/BaseInput.vue';
import BaseButton from '../components/BaseButton.vue';
import VerificationCodeButton from '../components/VerificationCodeButton.vue';

const { t } = useI18n();
const router = useRouter();
const toastStore = useToastStore();
const form = ref({
  email: '',
  verificationCode: '',
  newPassword: '',
  confirmPassword: ''
});

const loading = ref(false);

const handleReset = async () => {
  if (form.value.newPassword !== form.value.confirmPassword) {
    toastStore.error(t('auth.forgot-password.reset-failed'), t('auth.forgot-password.password-mismatch'));
    return;
  }

  loading.value = true;
  try {
    const { confirmPassword, ...resetData } = form.value;
    await api.post('/auth/password-reset', resetData);
    toastStore.success(t('auth.forgot-password.reset-success'), t('auth.forgot-password.reset-success-message'));
    router.push('/login');
  } catch (e: any) {
    toastStore.error(t('auth.forgot-password.reset-failed'), e.message || t('auth.forgot-password.check-code-message'));
  } finally {
    loading.value = false;
  }
};
</script>