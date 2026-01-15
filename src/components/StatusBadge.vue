<template>
  <span :class="[badgeClass, 'px-2.5 py-0.5 inline-flex text-xs font-medium rounded-full transition-colors duration-200']">
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { formatStatus } from '../utils/formatters';

const props = defineProps<{
  status: string;
  isExpired?: boolean;
}>();

const label = computed(() => {
  if (props.isExpired) return formatStatus('EXPIRED');
  return formatStatus(props.status);
});

const badgeClass = computed(() => {
  if (props.isExpired) return 'bg-gray-100 text-gray-800';
  
  switch (props.status?.toUpperCase()) {
    case 'ACTIVE':
      return 'bg-green-100 text-green-800';
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800';
    case 'BANNED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
});
</script>
