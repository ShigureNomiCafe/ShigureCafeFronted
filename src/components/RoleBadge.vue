<template>
  <span :class="[badgeClass, 'px-2.5 py-0.5 inline-flex text-xs font-medium rounded-full transition-colors duration-200']">
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { formatRole } from '../utils/formatters';

const props = defineProps<{
  role: string;
}>();

const label = computed(() => formatRole(props.role));

const badgeClass = computed(() => {
  switch (props.role?.toUpperCase()) {
    case 'ADMIN':
      return 'bg-purple-100 text-purple-800';
    case 'USER':
    default:
      return 'bg-blue-100 text-blue-800';
  }
});
</script>
