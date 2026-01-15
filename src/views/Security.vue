<template>
  <div class="min-h-screen bg-gray-50">
    <NavBar />

    <div class="py-10 transition-all duration-500 ease-in-out">
      <header>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 class="text-3xl font-extrabold leading-tight text-gray-900 tracking-tight animate-slide-up">
            {{ $t('security.title') }}
          </h1>
        </div>
      </header>
      <main>
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8 mt-8 space-y-8">
          <!-- Password Section -->
          <div class="px-4 sm:px-0 animate-slide-up animate-delay-50">
            <BaseCard :title="$t('security.password.title')" :subtitle="$t('security.password.subtitle')">
              <form @submit.prevent="handleChangePassword" class="space-y-6 max-w-lg">
                <BaseInput v-model="passwordForm.oldPassword" :label="$t('security.password.old-password')"
                  type="password" required />
                <BaseInput v-model="passwordForm.newPassword" :label="$t('security.password.new-password')"
                  type="password" required />
                <BaseInput v-model="confirmPassword" :label="$t('security.password.confirm-password')" type="password"
                  required />
                <div class="flex items-center justify-end">
                  <BaseButton type="submit" :loading="passwordLoading" :label="$t('security.password.submit')"
                    :loading-text="$t('security.password.submitting')" full-width />
                </div>
              </form>
            </BaseCard>
          </div>

          <!-- Email Section -->
          <div class="px-4 sm:px-0 animate-slide-up animate-delay-100">
            <BaseCard :title="$t('security.email.title')" :subtitle="$t('security.email.subtitle')">
              <div class="flex items-center justify-between">
                <div>
                  <dt class="text-sm font-medium text-gray-500">{{ $t('security.email.current-label') }}</dt>
                  <dd class="mt-1 text-lg font-semibold text-gray-900">{{ auth.user?.email }}</dd>
                </div>
                <BaseButton variant="secondary" @click="showEmailModal = true"
                  :label="$t('security.email.change-button')" />
              </div>
            </BaseCard>
          </div>

          <!-- Email 2FA Section -->
          <div class="px-4 sm:px-0 animate-slide-up animate-delay-150">
            <BaseCard :title="$t('security.email-2fa.title')" :subtitle="$t('security.email-2fa.subtitle')">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div
                    :class="[auth.user?.email2faEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700', 'px-3 py-1 rounded-full text-xs font-bold transition-colors duration-300']">
                    {{ auth.user?.email2faEnabled ? $t('security.status.enabled') : $t('security.status.disabled') }}
                  </div>
                  <span class="text-sm text-gray-600">{{ $t('security.email-2fa.status-label') }}</span>
                </div>
                <BaseButton @click="handleToggleEmail2FA" :disabled="toggleEmailLoading"
                  :variant="auth.user?.email2faEnabled ? 'danger' : 'secondary'"
                  :label="auth.user?.email2faEnabled ? $t('security.email-2fa.disable') : $t('security.email-2fa.enable')"
                  :loading="toggleEmailLoading" />
              </div>
            </BaseCard>
          </div>

          <!-- TOTP 2FA Section -->
          <div class="px-4 sm:px-0 animate-slide-up animate-delay-200">
            <BaseCard :title="$t('security.totp.title')" :subtitle="$t('security.totp.subtitle')">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div
                    :class="[auth.user?.totpEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700', 'px-3 py-1 rounded-full text-xs font-bold transition-colors duration-300']">
                    {{ auth.user?.totpEnabled ? $t('security.status.enabled') : $t('security.status.disabled') }}
                  </div>
                  <span class="text-sm text-gray-600">{{ $t('security.totp.status-label') }}</span>
                </div>
                <BaseButton @click="handle2FAAction" :disabled="toggleLoading"
                  :variant="auth.user?.totpEnabled ? 'danger' : 'secondary'"
                  :label="auth.user?.totpEnabled ? $t('security.totp.disable') : $t('security.totp.enable')"
                  :loading="toggleLoading" />
              </div>
            </BaseCard>
          </div>
        </div>
      </main>
    </div>

    <!-- TOTP Setup Modal -->
    <Modal :show="showTotpModal" :title="$t('security.totp.modal-title')" @close="showTotpModal = false">
      <div class="space-y-6">
        <div class="space-y-4">
          <p class="text-sm text-gray-600">
            {{ $t('security.totp.step1') }}
          </p>
          <div class="flex justify-center p-4 bg-white border border-gray-100 rounded-2xl">
            <qrcode-vue :value="totpSetupData.uri" :size="200" level="H" />
          </div>
          <div class="space-y-2">
            <p class="text-xs text-gray-500 text-center">{{ $t('security.totp.manual-tip') }}</p>
            <div class="flex items-center justify-center space-x-2">
              <code
                class="px-3 py-1 bg-gray-100 rounded text-sm font-mono text-gray-800">{{ totpSetupData.secret }}</code>
            </div>
          </div>
        </div>

        <div class="space-y-4 border-t border-gray-100 pt-6">
          <p class="text-sm text-gray-600">
            {{ $t('security.totp.step2') }}
          </p>
          <DigitInput v-model="totpConfirmCode" />
        </div>
      </div>
      <template #footer>
        <BaseButton @click="handleConfirmTotp" :disabled="totpConfirmCode.length < 6" :loading="totpLoading"
          :label="$t('security.totp.confirm-button')" :loading-text="$t('security.totp.confirming')" />
        <BaseButton variant="outline" @click="showTotpModal = false" :label="$t('common.cancel')" />
      </template>
    </Modal>

    <!-- Email Update Modal -->
    <Modal :show="showEmailModal" :title="$t('security.email.modal-title')" @close="showEmailModal = false">
      <div class="space-y-4">
        <BaseInput v-model="newEmailForm.newEmail" :label="$t('security.email.new-email-label')" type="email"
          :placeholder="$t('security.email.new-email-placeholder')" show-button>
          <template #button>
            <VerificationCodeButton :email="newEmailForm.newEmail" type="UPDATE_EMAIL" class="w-32" />
          </template>
        </BaseInput>
        <BaseInput v-model="newEmailForm.verificationCode" :label="$t('security.email.code-label')"
          :placeholder="$t('security.email.code-placeholder')" autocomplete="one-time-code" />
      </div>
      <template #footer>
        <BaseButton @click="handleUpdateEmail" :loading="emailLoading" :label="$t('security.email.save')"
          :loading-text="$t('security.email.saving')" />
        <BaseButton variant="outline" @click="showEmailModal = false" :label="$t('common.cancel')" />
      </template>
    </Modal>

    <!-- Email 2FA Activation Modal -->
    <Modal :show="showEmail2FAModal" :title="$t('security.email-2fa.modal-title')" @close="showEmail2FAModal = false">
      <div class="space-y-6">
        <p class="text-sm text-gray-600">
          {{ $t('security.email-2fa.modal-desc').split('{email}')[0] }}<span class="font-semibold text-gray-900">{{
            auth.user?.email }}</span>{{ $t('security.email-2fa.modal-desc').split('{email}')[1] }}
        </p>
        <DigitInput v-model="email2FAConfirmCode" />
        <div class="flex justify-center">
          <button @click="sendEmail2FACode" :disabled="sending2FA || countdown2FA > 0"
            class="text-sm font-bold text-blue-600 hover:text-blue-700 disabled:opacity-50 transition-colors">
            {{ countdown2FA > 0 ? $t('security.email-2fa.resend-after', { count: countdown2FA }) : (sending2FA ?
              $t('security.email-2fa.resending') : $t('security.email-2fa.resend')) }}
          </button>
        </div>
      </div>
      <template #footer>
        <BaseButton @click="confirmToggleEmail2FA" :disabled="email2FAConfirmCode.length < 6"
          :loading="toggleEmailLoading" :label="$t('security.totp.confirm-button')"
          :loading-text="$t('security.totp.confirming')" />
        <BaseButton variant="outline" @click="showEmail2FAModal = false" :label="$t('common.cancel')" />
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '../stores/auth';
import { useToastStore } from '../stores/toast';
import { useVerificationStore } from '../stores/verification';
import NavBar from '../components/NavBar.vue';
import QrcodeVue from 'qrcode.vue';
import BaseCard from '../components/BaseCard.vue';
import BaseInput from '../components/BaseInput.vue';
import BaseButton from '../components/BaseButton.vue';
import VerificationCodeButton from '../components/VerificationCodeButton.vue';
import Modal from '../components/Modal.vue';
import DigitInput from '../components/DigitInput.vue';
import api from '../api';

const { t } = useI18n();
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
    toastStore.error(t('common.error'), t('security.messages.password-mismatch'));
    return;
  }

  if (!auth.user?.username) return;

  passwordLoading.value = true;
  try {
    await api.put(`/users/${auth.user.username}/password`, passwordForm.value);
    toastStore.success(t('security.messages.password-success'), t('security.messages.password-success-detail'));
    // Clear form
    passwordForm.value.oldPassword = '';
    passwordForm.value.newPassword = '';
    confirmPassword.value = '';
  } catch (e: any) {
    toastStore.error(t('security.messages.password-failed'), e.message || t('security.messages.password-failed-detail'));
  } finally {
    passwordLoading.value = false;
  }
};

// Email Logic
const showEmailModal = ref(false);
const newEmailForm = ref({ newEmail: '', verificationCode: '' });
const emailLoading = ref(false);
const toggleLoading = ref(false);
const toggleEmailLoading = ref(false);

// 2FA TOTP Logic
const showTotpModal = ref(false);
const totpLoading = ref(false);
const totpSetupData = ref({ secret: '', uri: '' });
const totpConfirmCode = ref('');

// Email 2FA Activation Logic
const showEmail2FAModal = ref(false);
const email2FAConfirmCode = ref('');
const verificationStore = useVerificationStore();
const { sending: sending2FA, countdown: countdown2FA } = storeToRefs(verificationStore);

const sendEmail2FACode = async () => {
  if (!auth.user?.email) return;
  await verificationStore.sendCode(auth.user.email, '2FA');
};

const handleToggleEmail2FA = async () => {
  if (auth.user?.email2faEnabled) {
    // Disable is direct
    toggleEmailLoading.value = true;
    try {
      await auth.toggleTwoFactor(false);
      toastStore.success(t('security.messages.email-2fa-disable-success'), t('security.messages.email-2fa-disable-detail'));
    } catch (e: any) {
      toastStore.error(t('security.messages.action-failed'), e.message || t('security.messages.system-error'));
    } finally {
      toggleEmailLoading.value = false;
    }
  } else {
    // Enable requires verification
    email2FAConfirmCode.value = '';
    showEmail2FAModal.value = true;
    sendEmail2FACode();
  }
};

const confirmToggleEmail2FA = async () => {
  if (email2FAConfirmCode.value.length !== 6) {
    toastStore.error(t('common.error'), t('security.messages.code-invalid'));
    return;
  }

  toggleEmailLoading.value = true;
  try {
    await auth.toggleTwoFactor(true, email2FAConfirmCode.value);
    toastStore.success(t('security.messages.email-2fa-enable-success'), t('security.messages.email-2fa-enable-detail'));
    showEmail2FAModal.value = false;
  } catch (e: any) {
    toastStore.error(t('security.messages.verify-failed'), e.message || t('security.messages.verify-failed-detail'));
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
      toastStore.success(t('security.messages.totp-disable-success'), t('security.messages.totp-disable-detail'));
      await auth.fetchCurrentUser();
    } catch (e: any) {
      toastStore.error(t('security.messages.action-failed'), e.message || t('security.messages.system-error'));
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
      totpConfirmCode.value = '';
    } catch (e: any) {
      toastStore.error(t('security.messages.totp-setup-failed'), e.message || t('security.messages.totp-setup-failed-detail'));
    } finally {
      toggleLoading.value = false;
    }
  }
};

const handleConfirmTotp = async () => {
  if (totpConfirmCode.value.length !== 6) {
    toastStore.error(t('common.error'), t('security.messages.code-invalid'));
    return;
  }

  totpLoading.value = true;
  try {
    await api.post(`/users/${auth.user?.username}/2fa/totp/confirm`, {
      secret: totpSetupData.value.secret,
      code: totpConfirmCode.value
    });
    toastStore.success(t('security.messages.totp-enable-success'), t('security.messages.totp-enable-detail'));
    showTotpModal.value = false;
    await auth.fetchCurrentUser();
  } catch (e: any) {
    toastStore.error(t('security.messages.verify-failed'), e.message || t('security.messages.verify-failed-detail'));
  } finally {
    totpLoading.value = false;
  }
};

const handleUpdateEmail = async () => {
  if (!auth.user?.username) return;
  emailLoading.value = true;
  try {
    await api.put(`/users/${auth.user.username}/email`, newEmailForm.value);
    toastStore.success(t('security.messages.email-update-success'), t('security.messages.email-update-detail'));
    showEmailModal.value = false;
    await auth.fetchCurrentUser(); // Refresh user data
  } catch (e: any) {
    toastStore.error(t('security.messages.email-update-failed'), e.message || t('security.messages.email-update-failed-detail'));
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
