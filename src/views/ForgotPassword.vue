<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg border border-gray-100">
      <div class="text-center">
        <h2 class="text-3xl font-extrabold text-gray-900">重置密码</h2>
        <p class="mt-2 text-sm text-gray-600">请输入您的邮箱以获取验证码</p>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleReset">
        <div class="rounded-md shadow-sm space-y-4">
          <!-- 邮箱输入和发送验证码 -->
          <div class="flex space-x-2">
            <input v-model="form.email" type="email" required class="appearance-none rounded-lg block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="电子邮箱" />
            <button @click="sendCode" type="button" :disabled="sending || countdown > 0" class="whitespace-nowrap px-3 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 disabled:opacity-50">
              {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
            </button>
          </div>

          <!-- 验证码 -->
          <input v-model="form.verificationCode" type="text" required class="appearance-none rounded-lg block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="验证码" />
          
          <!-- 新密码 -->
          <input v-model="form.newPassword" type="password" required class="appearance-none rounded-lg block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="新密码" />
        </div>

        <button :disabled="loading" type="submit" class="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors">
          {{ loading ? '重置中...' : '重置密码' }}
        </button>
      </form>
      <div class="text-center text-sm">
        <router-link to="/login" class="font-medium text-blue-600 hover:text-blue-500 transition-colors">
          记起密码了？返回登录
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import api from '../api';
import { useRouter } from 'vue-router';

const router = useRouter();
const form = ref({
  email: '',
  verificationCode: '',
  newPassword: ''
});

const loading = ref(false);
const sending = ref(false);
const countdown = ref(0);

const sendCode = async () => {
  if (!form.value.email) return alert('请输入邮箱');
  sending.value = true;
  try {
    await api.post('/auth/verification-codes', { email: form.value.email });
    alert('验证码已发送至您的邮箱');
    countdown.value = 60;
    const timer = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) clearInterval(timer);
    }, 1000);
  } catch (e: any) {
    alert(e.response?.data?.message || '验证码发送失败，请稍后重试');
  } finally {
    sending.value = false;
  }
};

const handleReset = async () => {
  loading.value = true;
  try {
    await api.post('/auth/password-reset', form.value);
    alert('密码重置成功，请使用新密码登录');
    router.push('/login');
  } catch (e: any) {
    alert(e.response?.data?.message || '重置失败，请检查验证码是否正确');
  } finally {
    loading.value = false;
  }
};
</script>
