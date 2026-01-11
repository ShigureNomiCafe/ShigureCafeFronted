<template>
  <AuthLayout 
    :title="registrationSuccess ? '申请提交成功' : '创建新账号'" 
    :subtitle="registrationSuccess ? '' : '加入 猫咖，开启您的旅程'"
  >
    <!-- Success View -->
    <div v-if="registrationSuccess" class="text-center space-y-6">
      <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 animate-float">
        <svg class="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div class="text-left bg-white/60 p-6 rounded-xl border border-blue-100 shadow-sm">
        <p class="text-sm font-medium text-gray-700 mb-3">您的账号需要审核。请保存审核码：</p>
        <div class="flex items-center justify-between bg-blue-50/50 p-4 rounded-lg border border-blue-200 group hover:border-blue-300 transition-colors cursor-text">
          <code class="text-xl font-mono font-bold text-blue-700 select-all tracking-wider break-all mr-2">{{ auditCode }}</code>
          <button @click="copyAuditCode" class="p-2 hover:bg-blue-100 rounded-lg transition-all text-blue-500 hover:text-blue-700 active:scale-95 flex-shrink-0" title="复制审核码">
            <svg v-if="!copied" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </button>
        </div>
        <p class="text-xs text-gray-500 mt-3 leading-relaxed">
          请将此代码发送给管理员以激活您的账号。未审核的账号无法登录。
        </p>
      </div>
      <BaseButton
        label="返回登录页面"
        @click="router.push('/login')"
        full-width
      />
    </div>

    <!-- Registration Form -->
    <div v-else>
      <form class="mt-8 space-y-5" @submit.prevent="handleRegister">
        <div class="space-y-4">
          <BaseInput
            id="username"
            v-model="form.username"
            label="用户名"
            placeholder="3-50位字符，包含字母数字"
            required
          />

          <BaseInput
            id="nickname"
            v-model="form.nickname"
            label="昵称"
            placeholder="您的显示名称 (选填)"
          />
          
          <BaseInput
            id="email"
            v-model.trim="form.email"
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

          <BaseInput
            id="verificationCode"
            v-model="form.verificationCode"
            label="验证码"
            placeholder="请输入邮箱验证码"
            required
          />

          <BaseInput
            id="password"
            v-model="form.password"
            label="密码"
            type="password"
            placeholder="设置您的登录密码"
            required
          />

          <BaseInput
            id="confirmPassword"
            v-model="form.confirmPassword"
            label="确认密码"
            type="password"
            placeholder="请再次输入密码"
            required
          />
        </div>

        <BaseButton
          type="submit"
          :loading="loading"
          loading-text="正在提交注册..."
          label="立即注册"
          full-width
          class="mt-6"
        />
      </form>
      <div class="text-center text-sm mt-6">
        <router-link to="/login" class="font-medium text-blue-600 hover:text-indigo-500 transition-colors">
          已有账号？返回登录
        </router-link>
      </div>
    </div>
  </AuthLayout>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import api from '../api';
import { useToastStore } from '../stores/toast';
import AuthLayout from '../components/AuthLayout.vue';
import BaseInput from '../components/BaseInput.vue';
import BaseButton from '../components/BaseButton.vue';

const router = useRouter();
const toastStore = useToastStore();
const form = reactive({
  username: '',
  nickname: '',
  email: '',
  password: '',
  confirmPassword: '',
  verificationCode: ''
});

const loading = ref(false);
const sending = ref(false);
const countdown = ref(0);
const registrationSuccess = ref(false);
const auditCode = ref('');
const copied = ref(false);

const copyAuditCode = async () => {
  try {
    await navigator.clipboard.writeText(auditCode.value);
    copied.value = true;
    toastStore.success('复制成功', '审核码已复制到剪贴板');
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (err) {
    toastStore.error('复制失败', '请手动复制审核码');
  }
};

const sendCode = async () => {
  if (!form.email) {
    toastStore.error('发送失败', '请输入您的邮箱地址');
    return;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(form.email)) {
    toastStore.error('发送失败', '请输入有效的邮箱地址');
    return;
  }
  
  // Optimistic UI
  sending.value = true;

  try {
    await api.post('/auth/verification-codes', { email: form.email, type: 'REGISTER' });
    
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

const handleRegister = async () => {
  const usernameRegex = /^[a-zA-Z0-9-_]{3,50}$/;
  if (!usernameRegex.test(form.username)) {
    toastStore.error('注册失败', '用户名必须为3-50位，且只能包含字母、数字、连字符和下划线');
    return;
  }

  if (form.password !== form.confirmPassword) {
    toastStore.error('注册失败', '两次输入的密码不一致');
    return;
  }

  loading.value = true;
  try {
    const { confirmPassword, ...registerData } = form;
    const response: any = await api.post('/registrations', registerData);
    auditCode.value = response.auditCode;
    registrationSuccess.value = true;
    toastStore.success('注册申请已提交', '请保存您的审核码');
  } catch (e: any) {
    toastStore.error('注册失败', e.message || '请检查您填写的信息');
  } finally {
    loading.value = false;
  }
};
</script>