<template>
  <AuthLayout :title="show2FA ? '二次验证' : '欢迎回来'" :subtitle="show2FA ? (useEmail ? `请输入发送至 ${auth.twoFactorEmail} 的验证码` : '请输入 Authenticator App 中的验证码') : '请登录您的账号'">
    <form v-if="!show2FA" class="mt-8 space-y-6" @submit.prevent="handleLogin">
      <div class="space-y-4">
        <BaseInput
          id="username"
          v-model="form.username"
          label="用户名"
          placeholder="请输入用户名"
          required
        />
        <BaseInput
          id="password"
          v-model="form.password"
          label="密码"
          type="password"
          placeholder="请输入密码"
          required
        />
      </div>

      <BaseButton
        type="submit"
        :loading="loading"
        loading-text="登录中..."
        label="立即登录"
        full-width
      />
    </form>

    <form v-else class="mt-8 space-y-6" @submit.prevent="handleVerify2FA">
      <div class="space-y-4">
        <div class="group">
          <label class="block text-sm font-medium text-gray-700 mb-3 ml-1">验证码</label>
          <DigitInput v-model="twoFactorCode" @complete="handleVerify2FA" />
          
          <div v-if="useEmail" class="mt-4 flex justify-center">
            <VerificationCodeButton
              :email="auth.twoFactorEmail || ''"
              type="2FA"
              class="min-w-[140px]"
            />
          </div>
          <div v-if="auth.hasTotp && auth.hasEmail2fa" class="mt-4 flex justify-center">
            <button @click="toggleMethod" type="button" class="text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors">
              {{ useEmail ? '使用身份验证器验证' : '使用邮箱验证码验证' }}
            </button>
          </div>
        </div>
      </div>

      <div>
        <BaseButton
          type="submit"
          :loading="loading"
          :disabled="twoFactorCode.length < 6"
          loading-text="验证中..."
          label="验证并登录"
          full-width
        />
        <button @click="show2FA = false" type="button" class="mt-4 w-full text-sm text-gray-500 hover:text-gray-700 transition-colors">
          返回登录
        </button>
      </div>
    </form>

    <div v-if="!show2FA" class="flex items-center justify-between text-sm mt-4">
      <router-link to="/register" class="font-medium text-blue-600 hover:text-indigo-500 transition-colors">
        还没有账号？立即注册
      </router-link>
      <router-link to="/forgot-password" class="font-medium text-gray-500 hover:text-gray-700 transition-colors">
        忘记密码？
      </router-link>
    </div>
  </AuthLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
import { useToastStore } from '../stores/toast';
import AuthLayout from '../components/AuthLayout.vue';
import BaseInput from '../components/BaseInput.vue';
import BaseButton from '../components/BaseButton.vue';
import DigitInput from '../components/DigitInput.vue';
import VerificationCodeButton from '../components/VerificationCodeButton.vue';

const form = ref({ username: '', password: '' });
const twoFactorCode = ref('');

const show2FA = ref(false);
const useEmail = ref(false);
const loading = ref(false);
const auth = useAuthStore();
const router = useRouter();
const toastStore = useToastStore();

const toggleMethod = () => {
  useEmail.value = !useEmail.value;
  twoFactorCode.value = '';
};

const handleLogin = async () => {
  loading.value = true;
  try {
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
    toastStore.error('登录失败', e.message || '请检查您的用户名和密码');
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
    toastStore.error('验证失败', e.message || '验证码错误或已过期');
  } finally {
    loading.value = false;
  }
};
</script>


