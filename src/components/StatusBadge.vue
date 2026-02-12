<template>
  <BaseBadge :variant="badgeVariant">
    {{ label }}
  </BaseBadge>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { formatStatus } from '../utils/formatters';
import BaseBadge from './BaseBadge.vue';

const props = defineProps<{
  status: string;
  isExpired?: boolean;
}>();

const label = computed(() => {
  if (props.isExpired) return formatStatus('EXPIRED');
  return formatStatus(props.status);
});

const badgeVariant = computed(() => {
  if (props.isExpired) return 'neutral';
  
  switch (props.status?.toUpperCase()) {
    case 'ACTIVE':
      return 'success';
    case 'PENDING':
      return 'warning';
    case 'BANNED':
      return 'danger';
    default:
      return 'neutral';
  }
});
</script>
