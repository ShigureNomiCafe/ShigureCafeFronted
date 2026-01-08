<template>
  <div class="min-h-screen bg-gray-50">
    <NavBar />

    <div class="py-10 transition-all duration-500 ease-in-out">
      <header>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 class="text-3xl font-extrabold leading-tight text-gray-900 tracking-tight animate-[slide-up_0.5s_ease-out]">
            安全设置
          </h1>
        </div>
      </header>
      <main>
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8 mt-8 space-y-8">
          <!-- Password Section -->
          <div class="px-4 sm:px-0 animate-[slide-up_0.5s_ease-out_0.2s_both]">
            <div class="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-100">
              <div class="px-6 py-6 border-b border-gray-100 bg-gray-50/50">
                <h3 class="text-xl font-bold text-gray-900">密码修改</h3>
                <p class="mt-1 max-w-2xl text-sm text-gray-500">为了您的账户安全，建议定期更换密码。</p>
              </div>
              <div class="p-6">
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
                        class="block w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
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
                        class="block w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
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
                        class="block w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                      />
                    </div>
                  </div>

                  <div class="flex items-center justify-end">
                    <button 
                      type="submit" 
                      :disabled="passwordLoading"
                      class="w-full flex justify-center py-2 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                    >
                      {{ passwordLoading ? '修改中...' : '修改密码' }}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <!-- Email Section -->
          <div class="px-4 sm:px-0 animate-[slide-up_0.5s_ease-out_0.4s_both]">
            <div class="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-100">
              <div class="px-6 py-6 border-b border-gray-100 bg-gray-50/50">
                <h3 class="text-xl font-bold text-gray-900">邮箱管理</h3>
                <p class="mt-1 max-w-2xl text-sm text-gray-500">管理您的绑定邮箱，用于找回密码与安全通知。</p>
              </div>
              <div class="p-6">
                <div class="flex items-center justify-between">
                  <div>
                    <dt class="text-sm font-medium text-gray-500">当前绑定邮箱</dt>
                    <dd class="mt-1 text-lg font-semibold text-gray-900">{{ auth.user?.email }}</dd>
                  </div>
                  <button @click="showEmailModal = true" class="inline-flex items-center px-4 py-2 border border-blue-200 rounded-xl bg-blue-50 text-blue-700 text-sm font-bold hover:bg-blue-100 transition-colors">
                    更换邮箱
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Email 2FA Section -->
          <div class="px-4 sm:px-0 animate-[slide-up_0.5s_ease-out_0.6s_both]">
            <div class="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-100">
              <div class="px-6 py-6 border-b border-gray-100 bg-gray-50/50">
                <h3 class="text-xl font-bold text-gray-900">邮箱双重验证</h3>
                <p class="mt-1 max-w-2xl text-sm text-gray-500">开启后，登录时需提供发送至邮箱的验证码。</p>
              </div>
              <div class="p-6">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <div :class="[auth.user?.email2faEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700', 'px-3 py-1 rounded-full text-xs font-bold transition-colors duration-300']">
                      {{ auth.user?.email2faEnabled ? '已开启' : '未开启' }}
                    </div>
                    <span class="text-sm text-gray-600">邮箱验证状态</span>
                  </div>
                  <button 
                    @click="handleToggleEmail2FA" 
                    :disabled="toggleEmailLoading"
                    :class="[auth.user?.email2faEnabled ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100', 'inline-flex items-center px-4 py-2 border rounded-xl text-sm font-bold transition-all duration-200 disabled:opacity-50']"
                  >
                    {{ toggleEmailLoading ? '处理中...' : (auth.user?.email2faEnabled ? '关闭邮箱验证' : '开启邮箱验证') }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- TOTP 2FA Section -->
          <div class="px-4 sm:px-0 animate-[slide-up_0.5s_ease-out_0.7s_both]">
            <div class="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-100">
              <div class="px-6 py-6 border-b border-gray-100 bg-gray-50/50">
                <h3 class="text-xl font-bold text-gray-900">身份验证器 (TOTP)</h3>
                <p class="mt-1 max-w-2xl text-sm text-gray-500">开启后，登录时需提供身份验证器应用生成的代码。</p>
              </div>
              <div class="p-6">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <div :class="[auth.user?.totpEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700', 'px-3 py-1 rounded-full text-xs font-bold transition-colors duration-300']">
                      {{ auth.user?.totpEnabled ? '已开启' : '未开启' }}
                    </div>
                    <span class="text-sm text-gray-600">验证器状态</span>
                  </div>
                  <button 
                    @click="handle2FAAction" 
                    :disabled="toggleLoading"
                    :class="[auth.user?.totpEnabled ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100', 'inline-flex items-center px-4 py-2 border rounded-xl text-sm font-bold transition-all duration-200 disabled:opacity-50']"
                  >
                    {{ toggleLoading ? '处理中...' : (auth.user?.totpEnabled ? '关闭身份验证器' : '开启身份验证器') }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- TOTP Setup Modal -->
    <div v-if="showTotpModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <transition
          enter-active-class="ease-out duration-200"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
          leave-active-class="ease-in duration-150"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
          appear
        >
          <div class="fixed inset-0 bg-black/20 backdrop-blur-md" aria-hidden="true" @click="showTotpModal = false"></div>
        </transition>

        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <transition
          enter-active-class="ease-out duration-300"
          enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          enter-to-class="opacity-100 translate-y-0 sm:scale-100"
          leave-active-class="ease-in duration-200"
          leave-from-class="opacity-100 translate-y-0 sm:scale-100"
          leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          appear
        >
          <div class="relative inline-block align-middle bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all w-full sm:my-8 sm:align-middle sm:max-w-xl">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 class="text-xl leading-6 font-bold text-gray-900">开启双重验证 (TOTP)</h3>
              <div class="mt-4 space-y-6">
                <div class="space-y-4">
                  <p class="text-sm text-gray-600">
                    1. 使用您的身份验证器 (如 Google Authenticator) 扫描下方二维码：
                  </p>
                  <div class="flex justify-center p-4 bg-white border border-gray-100 rounded-2xl">
                    <qrcode-vue :value="totpSetupData.uri" :size="200" level="H" />
                  </div>
                  <div class="space-y-2">
                    <p class="text-xs text-gray-500 text-center">无法扫描二维码？您可以手动输入密钥：</p>
                    <div class="flex items-center justify-center space-x-2">
                      <code class="px-3 py-1 bg-gray-100 rounded text-sm font-mono text-gray-800">{{ totpSetupData.secret }}</code>
                    </div>
                  </div>
                </div>

                <div class="space-y-4 border-t border-gray-100 pt-6">
                  <p class="text-sm text-gray-600">
                    2. 请输入身份验证器生成的代码进行确认：
                  </p>
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
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button @click="handleConfirmTotp" :disabled="totpLoading || totpConfirmCode.length < 6" type="button" class="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 transition-colors">
                {{ totpLoading ? '正在验证...' : '验证并开启' }}
              </button>
              <button @click="showTotpModal = false" type="button" class="mt-3 w-full inline-flex justify-center rounded-xl border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors">
                取消
              </button>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <!-- Email Update Modal -->
    <div v-if="showEmailModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <!-- Backdrop Transition -->
        <transition
          enter-active-class="ease-out duration-200"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
          leave-active-class="ease-in duration-150"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
          appear
        >
          <div class="fixed inset-0 bg-black/20 backdrop-blur-md" aria-hidden="true" @click="showEmailModal = false"></div>
        </transition>

        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <transition
          enter-active-class="ease-out duration-300"
          enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          enter-to-class="opacity-100 translate-y-0 sm:scale-100"
          leave-active-class="ease-in duration-200"
          leave-from-class="opacity-100 translate-y-0 sm:scale-100"
          leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          appear
        >
          <div class="relative inline-block align-middle bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all w-full sm:my-8 sm:align-middle sm:max-w-xl">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 class="text-xl leading-6 font-bold text-gray-900" id="modal-title">修改绑定邮箱</h3>
              <div class="mt-4 space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">新邮箱地址</label>
                    <div class="flex rounded-xl shadow-sm">
                        <input v-model="newEmailForm.newEmail" type="email" class="flex-1 min-w-0 block w-full px-4 py-2 rounded-l-xl border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm border" placeholder="请输入新邮箱">
                        <button @click="sendCode" :disabled="sending || countdown > 0" class="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 rounded-r-xl bg-gray-50 text-gray-500 text-sm font-medium hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 transition-colors w-32 justify-center">
                            <svg v-if="sending" class="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {{ countdown > 0 ? `${countdown}s` : (sending ? '发送中...' : '获取验证码') }}
                        </button>
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">验证码</label>
                    <input v-model="newEmailForm.verificationCode" type="text" class="block w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="请输入验证码">
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button @click="handleUpdateEmail" :disabled="emailLoading" type="button" class="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 transition-colors">
                {{ emailLoading ? '保存中...' : '保存修改' }}
              </button>
              <button @click="showEmailModal = false" type="button" class="mt-3 w-full inline-flex justify-center rounded-xl border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors">
                取消
              </button>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <!-- Email 2FA Activation Modal -->
    <div v-if="showEmail2FAModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <transition
          enter-active-class="ease-out duration-200"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
          leave-active-class="ease-in duration-150"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
          appear
        >
          <div class="fixed inset-0 bg-black/20 backdrop-blur-md" aria-hidden="true" @click="showEmail2FAModal = false"></div>
        </transition>

        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <transition
          enter-active-class="ease-out duration-300"
          enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          enter-to-class="opacity-100 translate-y-0 sm:scale-100"
          leave-active-class="ease-in duration-200"
          leave-from-class="opacity-100 translate-y-0 sm:scale-100"
          leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          appear
        >
          <div class="relative inline-block align-middle bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all w-full sm:my-8 sm:align-middle sm:max-w-xl">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 class="text-xl leading-6 font-bold text-gray-900">开启邮箱双重验证</h3>
              <div class="mt-4 space-y-6">
                <p class="text-sm text-gray-600">
                  验证码已发送至您的邮箱：<span class="font-semibold text-gray-900">{{ auth.user?.email }}</span>。请输入 6 位动态验证码：
                </p>
                <div class="flex justify-between gap-2" @paste="handleEmail2FAPaste">
                  <input
                    v-for="(_, index) in email2FACodeDigits"
                    :key="index"
                    ref="email2FADigitInputs"
                    v-model="email2FACodeDigits[index]"
                    type="text"
                    maxlength="1"
                    inputmode="numeric"
                    pattern="[0-9]*"
                    class="w-full h-14 text-center text-2xl font-bold border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/50 transition-all duration-200"
                    @input="handleEmail2FADigitInput(index, $event)"
                    @keydown="handleEmail2FADigitKeyDown(index, $event)"
                  />
                </div>
                <div class="flex justify-center">
                    <button @click="sendEmail2FACode" :disabled="sending2FA || countdown2FA > 0" class="text-sm font-bold text-blue-600 hover:text-blue-700 disabled:opacity-50 transition-colors">
                        {{ countdown2FA > 0 ? `${countdown2FA}s 后可重新获取` : (sending2FA ? '发送中...' : '重新获取验证码') }}
                    </button>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button @click="confirmToggleEmail2FA" :disabled="toggleEmailLoading || email2FAConfirmCode.length < 6" type="button" class="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 transition-colors">
                {{ toggleEmailLoading ? '正在验证...' : '验证并开启' }}
              </button>
              <button @click="showEmail2FAModal = false" type="button" class="mt-3 w-full inline-flex justify-center rounded-xl border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors">
                取消
              </button>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useToastStore } from '../stores/toast';
import NavBar from '../components/NavBar.vue';
import QrcodeVue from 'qrcode.vue';
import api from '../api';

const auth = useAuthStore();
const toastStore = useToastStore();

// Password Logic
const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
});
const confirmPassword = ref('');
const passwordLoading = ref(false);

const handleChangePassword = async () => {
  if (passwordForm.value.newPassword !== confirmPassword.value) {
    toastStore.error('错误', '两次输入的新密码不一致');
    return;
  }

  if (!auth.user?.username) return;

  passwordLoading.value = true;
  try {
    await api.put(`/users/${auth.user.username}/password`, passwordForm.value);
    toastStore.success('修改成功', '您的密码已成功更新，下次登录请使用新密码。');
    // Clear form
    passwordForm.value.oldPassword = '';
    passwordForm.value.newPassword = '';
    confirmPassword.value = '';
  } catch (e: any) {
    toastStore.error('修改失败', e.message || '旧密码错误或系统异常');
  } finally {
    passwordLoading.value = false;
  }
};

// Email Logic
const showEmailModal = ref(false);
const newEmailForm = ref({ newEmail: '', verificationCode: '' });
const emailLoading = ref(false);
const sending = ref(false);
const countdown = ref(0);
const toggleLoading = ref(false);
const toggleEmailLoading = ref(false);

// 2FA TOTP Logic
const showTotpModal = ref(false);
const totpLoading = ref(false);
const totpSetupData = ref({ secret: '', uri: '' });

// Digit-by-digit input for TOTP/General confirmation
const codeDigits = ref(['', '', '', '', '', '']);
const digitInputs = ref<HTMLInputElement[]>([]);
const totpConfirmCode = computed(() => codeDigits.value.join(''));

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

// Email 2FA Activation Logic
const showEmail2FAModal = ref(false);
const sending2FA = ref(false);
const countdown2FA = ref(0);
const email2FACodeDigits = ref(['', '', '', '', '', '']);
const email2FADigitInputs = ref<HTMLInputElement[]>([]);
const email2FAConfirmCode = computed(() => email2FACodeDigits.value.join(''));

const handleEmail2FADigitInput = (index: number, e: Event) => {
  const input = e.target as HTMLInputElement;
  const value = input.value;
  if (value && index < 5) {
    email2FADigitInputs.value[index + 1]?.focus();
  }
};

const handleEmail2FADigitKeyDown = (index: number, e: KeyboardEvent) => {
  if (e.key === 'Backspace' && !email2FACodeDigits.value[index] && index > 0) {
    email2FADigitInputs.value[index - 1]?.focus();
  }
};

const handleEmail2FAPaste = (e: ClipboardEvent) => {
  const pastedData = e.clipboardData?.getData('text').slice(0, 6).replace(/[^0-9]/g, '');
  if (pastedData) {
    pastedData.split('').forEach((char, i) => {
      if (i < 6) email2FACodeDigits.value[i] = char;
    });
    const nextIndex = Math.min(pastedData.length, 5);
    email2FADigitInputs.value[nextIndex]?.focus();
  }
};

const sendEmail2FACode = async () => {
    if (!auth.user?.email) return;
    sending2FA.value = true;
    try {
        await api.post('/auth/verification-codes', { email: auth.user.email, type: '2FA' });
        toastStore.success('发送成功', '验证码已发送至您的邮箱。');
        countdown2FA.value = 60;
        const timer = setInterval(() => {
            countdown2FA.value--;
            if (countdown2FA.value <= 0) {
                clearInterval(timer);
            }
        }, 1000);
    } catch (e: any) {
        toastStore.error('发送失败', e.message || '系统异常');
    } finally {
        sending2FA.value = false;
    }
};

const handleToggleEmail2FA = async () => {
  if (auth.user?.email2faEnabled) {
    // Disable is direct
    toggleEmailLoading.value = true;
    try {
      await auth.toggleTwoFactor(false);
      toastStore.success('关闭成功', '邮箱双重验证已关闭。');
    } catch (e: any) {
      toastStore.error('操作失败', e.message || '系统异常');
    } finally {
      toggleEmailLoading.value = false;
    }
  } else {
    // Enable requires verification
    email2FACodeDigits.value = ['', '', '', '', '', ''];
    showEmail2FAModal.value = true;
    sendEmail2FACode();
  }
};

const confirmToggleEmail2FA = async () => {
  if (email2FAConfirmCode.value.length !== 6) {
    toastStore.error('错误', '请输入 6 位数字验证码');
    return;
  }

  toggleEmailLoading.value = true;
  try {
    await auth.toggleTwoFactor(true, email2FAConfirmCode.value);
    toastStore.success('开启成功', '邮箱双重验证已开启。');
    showEmail2FAModal.value = false;
  } catch (e: any) {
    toastStore.error('验证失败', e.message || '验证码错误，请重试');
  } finally {
    toggleEmailLoading.value = false;
  }
};

const handle2FAAction = async () => {
  if (auth.user?.totpEnabled) {
    // Disable 2FA
    toggleLoading.value = true;
    try {
      await api.delete(`/users/${auth.user.username}/2fa/totp`);
      toastStore.success('关闭成功', '身份验证器已成功关闭。');
      await auth.fetchCurrentUser();
    } catch (e: any) {
      toastStore.error('操作失败', e.message || '系统异常');
    } finally {
      toggleLoading.value = false;
    }
  } else {
    // Start Setup TOTP
    toggleLoading.value = true;
    try {
      const data = await api.get<any>(`/users/${auth.user?.username}/2fa/totp/setup`);
      totpSetupData.value = data;
      showTotpModal.value = true;
      codeDigits.value = ['', '', '', '', '', ''];
    } catch (e: any) {
      toastStore.error('初始化失败', e.message || '无法获取 TOTP 配置');
    } finally {
      toggleLoading.value = false;
    }
  }
};

const handleConfirmTotp = async () => {
  if (totpConfirmCode.value.length !== 6) {
    toastStore.error('错误', '请输入 6 位数字验证码');
    return;
  }

  totpLoading.value = true;
  try {
    await api.post(`/users/${auth.user?.username}/2fa/totp/confirm`, {
      secret: totpSetupData.value.secret,
      code: totpConfirmCode.value
    });
    toastStore.success('开启成功', '身份验证器已成功开启。');
    showTotpModal.value = false;
    await auth.fetchCurrentUser();
  } catch (e: any) {
    toastStore.error('验证失败', e.message || '验证码错误，请重试');
  } finally {
    totpLoading.value = false;
  }
};

const sendCode = async () => {
    if (!newEmailForm.value.newEmail) {
        toastStore.error('发送失败', '请输入新邮箱地址');
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmailForm.value.newEmail)) {
        toastStore.error('发送失败', '请输入有效的邮箱地址');
        return;
    }

    sending.value = true;
    
    try {
        await api.post('/auth/verification-codes', { email: newEmailForm.value.newEmail, type: 'UPDATE_EMAIL' });
        
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

const handleUpdateEmail = async () => {
    if (!auth.user?.username) return;
    emailLoading.value = true;
    try {
        await api.put(`/users/${auth.user.username}/email`, newEmailForm.value);
        toastStore.success('修改成功', '您的邮箱已成功更新。');
        showEmailModal.value = false;
        await auth.fetchCurrentUser(); // Refresh user data
    } catch (e: any) {
        toastStore.error('修改失败', e.message || '请检查您的验证码是否正确');
    } finally {
        emailLoading.value = false;
    }
};

onMounted(async () => {
  if (!auth.user) {
    await auth.fetchCurrentUser();
  }
});
</script>