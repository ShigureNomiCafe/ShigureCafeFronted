<template>
  <BaseButton variant="secondary" :disabled="disabled || sending || countdown > 0" :loading="sending"
    :loading-text="t('verification.sending')"
    :label="countdown > 0 ? t('verification.resend-after', { count: countdown }) : (label || t('verification.get-code'))"
    v-bind="$attrs" />
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useVerificationStore } from '../stores/verification';
import { useI18n } from 'vue-i18n';
import BaseButton from './BaseButton.vue';

const props = defineProps<{
  email: string;
  type: 'REGISTER' | '2FA' | 'UPDATE_EMAIL' | 'RESET_PASSWORD';
  disabled?: boolean;
  label?: string;
  turnstileToken?: string;
}>();

const emit = defineEmits(['sent', 'success', 'error']);

const { t } = useI18n();
const verificationStore = useVerificationStore();
const { sending, countdown } = storeToRefs(verificationStore);

const handleClick = async (token?: string) => {
  const success = await verificationStore.sendCode(props.email, props.type, token || props.turnstileToken);
  if (success) {
    emit('sent');
    emit('success');
  } else {
    emit('error');
  }
};

defineExpose({ handleClick });
</script>