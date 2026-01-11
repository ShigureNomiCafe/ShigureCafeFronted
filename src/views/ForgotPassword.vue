<template>
  <AuthLayout title="重置密码" subtitle="请输入您的邮箱以获取验证码">
    <form class="mt-8 space-y-6" @submit.prevent="handleReset">
      <div class="space-y-4">
        <!-- 邮箱输入和发送验证码 -->
        <BaseInput
          id="email"
          v-model="form.email"
          label="电子邮箱"
          type="email"
          placeholder="your@email.com"
          required
          show-button
        >
          <template #button>
            <BaseButton
              variant="secondary"
              @click="sendCode"
              :disabled="sending || countdown > 0"
              :loading="sending"
              loading-text="发送中..."
              :label="countdown > 0 ? `${countdown}s` : '获取验证码'"
              class="w-32"
            />
          </template>
        </BaseInput>

        <!-- 验证码 -->
        <BaseInput
          id="code"
          v-model="form.verificationCode"
          label="验证码"
          autocomplete="one-time-code"
          placeholder="请输入验证码"
          required
        />
        
        <!-- 新密码 -->
        <BaseInput
          id="newPassword"
          v-model="form.newPassword"
          label="新密码"
          type="password"
          placeholder="设置新密码"
          required
        />

        <!-- 确认密码 -->
        <BaseInput
          id="confirmPassword"
          v-model="form.confirmPassword"
          label="确认密码"
          type="password"
          placeholder="请再次输入新密码"
          required
        />
      </div>

      <BaseButton
        type="submit"
        :loading="loading"
        loading-text="正在重置..."
        label="重置密码"
        full-width
      />
    </form>
    <div class="text-center text-sm mt-4">
      <router-link to="/login" class="font-medium text-blue-600 hover:text-indigo-500 transition-colors">
        记起密码了？返回登录
      </router-link>
    </div>
  </AuthLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import api from '../api';
import { useRouter } from 'vue-router';
import { useToastStore } from '../stores/toast';
import AuthLayout from '../components/AuthLayout.vue';
import BaseInput from '../components/BaseInput.vue';
import BaseButton from '../components/BaseButton.vue';

const router = useRouter();
const toastStore = useToastStore();
const form = ref({
  email: '',
  verificationCode: '',
  newPassword: '',
  confirmPassword: ''
});

const loading = ref(false);
const sending = ref(false);
const countdown = ref(0);

const sendCode = async () => {
  if (!form.value.email) {
    toastStore.error('发送失败', '请输入您的邮箱地址');
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(form.value.email)) {
    toastStore.error('发送失败', '请输入有效的邮箱地址');
    return;
  }

  // Optimistic UI
  sending.value = true;

  try {
    await api.post('/auth/verification-codes', { email: form.value.email, type: 'RESET_PASSWORD' });

    sending.value = false;
    toastStore.success('发送成功', '验证码已发送至您的邮箱，请注意查收。');
    countdown.value = 60;
    const timer = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) {
        clearInterval(timer);
      }
    }, 1000);
  } catch (e: any) {
    toastStore.error('发送失败', e.message || '请求失败，请稍后重试');
    sending.value = false;
  }
};

const handleReset = async () => {
  if (form.value.newPassword !== form.value.confirmPassword) {
    toastStore.error('重置失败', '两次输入的密码不一致');
    return;
  }

  loading.value = true;
  try {
    const { confirmPassword, ...resetData } = form.value;
    await api.post('/auth/password-reset', resetData);
    toastStore.success('操作成功', '密码已重置，请使用新密码登录。');
    router.push('/login');
  } catch (e: any) {
    toastStore.error('重置失败', e.message || '请检查验证码是否正确');
  } finally {
    loading.value = false;
  }
};
</script>