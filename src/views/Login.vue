<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 sm:px-6 lg:px-8 transition-colors duration-500">
    <div class="max-w-md w-full space-y-8 p-10 bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 transform transition-all duration-500 hover:shadow-3xl">
      <div class="text-center">
        <h2 class="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
          {{ show2FA ? '二次验证' : '欢迎回来' }}
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          <template v-if="show2FA">
            {{ useEmail ? `请输入发送至 ${auth.twoFactorEmail} 的验证码` : '请输入 Authenticator App 中的验证码' }}
          </template>
          <template v-else>请登录您的账号</template>
        </p>
      </div>
      
      <form v-if="!show2FA" class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="space-y-4">
          <div class="group">
            <label for="username" class="block text-sm font-medium text-gray-700 mb-1 ml-1">用户名</label>
            <input v-model="form.username" id="username" type="text" required class="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:z-10 sm:text-sm transition-all duration-200 ease-in-out bg-white/50 focus:bg-white" placeholder="请输入用户名" />
          </div>
          <div class="group">
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1 ml-1">密码</label>
            <input v-model="form.password" id="password" type="password" required class="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:z-10 sm:text-sm transition-all duration-200 ease-in-out bg-white/50 focus:bg-white" placeholder="请输入密码" />
          </div>
        </div>

        <div>
          <button :disabled="loading" type="submit" class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 ease-out">
            <span v-if="loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ loading ? '登录中...' : '立即登录' }}
          </button>
        </div>
      </form>

      <form v-else class="mt-8 space-y-6" @submit.prevent="handleVerify2FA">
        <div class="space-y-4">
          <div class="group">
            <label class="block text-sm font-medium text-gray-700 mb-3 ml-1">验证码</label>
            <div class="flex justify-between gap-2" @paste="handlePaste">
              <input
                v-for="(_, index) in codeDigits"
                :key="index"
                ref="digitInputs"
                v-model="codeDigits[index]"
                type="text"
                maxlength="1"
                inputmode="numeric"
                pattern="[0-9]*"
                class="w-full h-14 text-center text-2xl font-bold border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/50 transition-all duration-200"
                @input="handleDigitInput(index, $event)"
                @keydown="handleDigitKeyDown(index, $event)"
              />
            </div>
            <div v-if="useEmail" class="mt-4 flex justify-center">
              <button @click="send2FACode" type="button" :disabled="sending || countdown > 0" class="whitespace-nowrap px-4 py-2.5 text-sm font-bold text-blue-600 border border-blue-200 bg-blue-50/50 rounded-xl hover:bg-blue-100 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 min-w-[140px] flex items-center justify-center">
                <svg v-if="sending" class="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ countdown > 0 ? `${countdown}s 后重新获取` : (sending ? '发送中...' : '获取验证码') }}
              </button>
            </div>
            <div v-if="auth.hasTotp && auth.hasEmail2fa" class="mt-4 flex justify-center">
              <button @click="toggleMethod" type="button" class="text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors">
                {{ useEmail ? '使用身份验证器验证' : '使用邮箱验证码验证' }}
              </button>
            </div>
          </div>
        </div>

        <div>
          <button :disabled="loading || twoFactorCode.length < 6" type="submit" class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 ease-out">
            <span v-if="loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ loading ? '验证中...' : '验证并登录' }}
          </button>
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
import { useToastStore } from '../stores/toast';

const form = ref({ username: '', password: '' });
const codeDigits = ref(['', '', '', '', '', '']);
const digitInputs = ref<HTMLInputElement[]>([]);
const twoFactorCode = computed(() => codeDigits.value.join(''));

const show2FA = ref(false);
const useEmail = ref(false);
const loading = ref(false);
const sending = ref(false);
const countdown = ref(0);
const auth = useAuthStore();
const router = useRouter();
const toastStore = useToastStore();

const toggleMethod = () => {
  useEmail.value = !useEmail.value;
  codeDigits.value = ['', '', '', '', '', ''];
  if (useEmail.value) {
    send2FACode();
  }
};

const handleDigitInput = (index: number, e: Event) => {
  const input = e.target as HTMLInputElement;
  const value = input.value;
  
  if (value && index < 5) {
    digitInputs.value[index + 1]?.focus();
  }
};

const handleDigitKeyDown = (index: number, e: KeyboardEvent) => {
  if (e.key === 'Backspace' && !codeDigits.value[index] && index > 0) {
    digitInputs.value[index - 1]?.focus();
  }
};

const handlePaste = (e: ClipboardEvent) => {
  const pastedData = e.clipboardData?.getData('text').slice(0, 6).replace(/[^0-9]/g, '');
  if (pastedData) {
    pastedData.split('').forEach((char, i) => {
      if (i < 6) codeDigits.value[i] = char;
    });
    const nextIndex = Math.min(pastedData.length, 5);
    digitInputs.value[nextIndex]?.focus();
  }
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
        send2FACode();
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

const send2FACode = async () => {
  if (!auth.twoFactorEmail) return;
  sending.value = true;
  try {
    await auth.send2FACode();
    toastStore.success('发送成功', '验证码已发送至您的邮箱');
    countdown.value = 60;
    const timer = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) {
        clearInterval(timer);
      }
    }, 1000);
  } catch (e: any) {
    toastStore.error('发送失败', e.message || '系统异常，请稍后重试');
  } finally {
    sending.value = false;
  }
};

const handleVerify2FA = async () => {
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

