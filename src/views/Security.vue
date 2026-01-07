<template>
  <div class="min-h-screen bg-gray-100">
    <NavBar />

    <div class="py-10">
      <header>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 class="text-3xl font-bold leading-tight text-gray-900">
            安全设置
          </h1>
        </div>
      </header>
      <main>
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div class="px-4 py-8 sm:px-0">
            <div class="bg-white shadow overflow-hidden sm:rounded-lg">
              <div class="px-4 py-5 sm:px-6">
                <h3 class="text-lg leading-6 font-medium text-gray-900">密码修改</h3>
                <p class="mt-1 max-w-2xl text-sm text-gray-500">为了您的账户安全，建议定期更换密码。</p>
              </div>
              <div class="border-t border-gray-200 px-4 py-5 sm:p-6">
                <form @submit.prevent="handleChangePassword" class="space-y-6 max-w-lg">
                  <div>
                    <label for="old-password" class="block text-sm font-medium text-gray-700">当前密码</label>
                    <div class="mt-1">
                      <input 
                        id="old-password" 
                        name="old-password" 
                        type="password" 
                        required 
                        v-model="passwordForm.oldPassword"
                        class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label for="new-password" class="block text-sm font-medium text-gray-700">新密码</label>
                    <div class="mt-1">
                      <input 
                        id="new-password" 
                        name="new-password" 
                        type="password" 
                        required 
                        v-model="passwordForm.newPassword"
                        class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label for="confirm-password" class="block text-sm font-medium text-gray-700">确认新密码</label>
                    <div class="mt-1">
                      <input 
                        id="confirm-password" 
                        name="confirm-password" 
                        type="password" 
                        required 
                        v-model="confirmPassword"
                        class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div class="flex items-center justify-end">
                    <button 
                      type="submit" 
                      :disabled="loading"
                      class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {{ loading ? '修改中...' : '修改密码' }}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useToastStore } from '../stores/toast';
import NavBar from '../components/NavBar.vue';
import api from '../api';

const auth = useAuthStore();
const toastStore = useToastStore();

const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
});
const confirmPassword = ref('');
const loading = ref(false);

onMounted(async () => {
  if (!auth.user) {
    await auth.fetchCurrentUser();
  }
});

const handleChangePassword = async () => {
  if (passwordForm.value.newPassword !== confirmPassword.value) {
    toastStore.error('错误', '两次输入的新密码不一致');
    return;
  }

  if (!auth.user?.username) return;

  loading.value = true;
  try {
    await api.put(`/users/${auth.user.username}/password`, passwordForm.value);
    toastStore.success('修改成功', '您的密码已成功更新，下次登录请使用新密码。');
    // Clear form
    passwordForm.value.oldPassword = '';
    passwordForm.value.newPassword = '';
    confirmPassword.value = '';
  } catch (e: any) {
    toastStore.error('修改失败', e.response?.data?.message || '旧密码错误或系统异常');
  } finally {
    loading.value = false;
  }
};
</script>
