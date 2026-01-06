<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg border border-gray-100">
      <div class="text-center">
        <h2 class="text-3xl font-extrabold text-gray-900">欢迎回来</h2>
        <p class="mt-2 text-sm text-gray-600">请登录您的账号</p>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="rounded-md shadow-sm space-y-4">
          <div>
            <label for="username" class="sr-only">用户名</label>
            <input v-model="form.username" id="username" type="text" required class="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" placeholder="用户名" />
          </div>
          <div>
            <label for="password" class="sr-only">密码</label>
            <input v-model="form.password" id="password" type="password" required class="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" placeholder="密码" />
          </div>
        </div>

        <div>
          <button :disabled="loading" type="submit" class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors">
            {{ loading ? '登录中...' : '登录' }}
          </button>
        </div>
      </form>
      <div class="flex items-center justify-between text-sm">
        <router-link to="/register" class="font-medium text-blue-600 hover:text-blue-500 transition-colors">
          还没有账号？立即注册
        </router-link>
        <router-link to="/forgot-password" class="font-medium text-gray-600 hover:text-gray-500 transition-colors">
          忘记密码？
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const form = ref({ username: '', password: '' });
const loading = ref(false);
const auth = useAuthStore();
const router = useRouter();

const handleLogin = async () => {
  loading.value = true;
  try {
    await auth.login(form.value);
    router.push('/dashboard');
  } catch (e: any) {
    alert(e.response?.data?.message || '登录失败，请检查用户名或密码');
  } finally {
    loading.value = false;
  }
};
</script>
