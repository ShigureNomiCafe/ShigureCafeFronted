<template>
  <BaseButton
    variant="secondary"
    @click="handleClick"
    :disabled="disabled || sending || countdown > 0"
    :loading="sending"
    loading-text="发送中..."
    :label="countdown > 0 ? `${countdown}s 后重新获取` : (label || '获取验证码')"
    v-bind="$attrs"
  />
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useVerificationStore } from '../stores/verification';
import BaseButton from './BaseButton.vue';

const props = defineProps<{
  email: string;
  type: 'REGISTER' | '2FA' | 'UPDATE_EMAIL' | 'RESET_PASSWORD';
  disabled?: boolean;
  label?: string;
}>();

const emit = defineEmits(['sent']);

const verificationStore = useVerificationStore();
const { sending, countdown } = storeToRefs(verificationStore);

const handleClick = async () => {
  const success = await verificationStore.sendCode(props.email, props.type);
  if (success) {
    emit('sent');
  }
};
</script>
