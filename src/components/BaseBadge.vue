<template>
  <span :class="[
    colorClasses,
    'px-2.5 py-0.5 inline-flex text-xs font-medium rounded-full transition-colors duration-200 select-none'
  ]">
    <slot>{{ label }}</slot>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  label?: string;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple';
}>();

const colorClasses = computed(() => {
  switch (props.variant) {
    case 'success':
      return 'bg-green-100 text-green-800';
    case 'warning':
      return 'bg-yellow-100 text-yellow-800';
    case 'danger':
      return 'bg-red-100 text-red-800';
    case 'info':
      return 'bg-blue-100 text-blue-800';
    case 'purple':
      return 'bg-purple-100 text-purple-800';
    case 'neutral':
    default:
      return 'bg-gray-100 text-gray-800';
  }
});
</script>
