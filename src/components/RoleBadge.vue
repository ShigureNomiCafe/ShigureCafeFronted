<template>
  <BaseBadge :variant="badgeVariant">
    {{ label }}
  </BaseBadge>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { formatRole } from '../utils/formatters';
import BaseBadge from './BaseBadge.vue';

const props = defineProps<{
  role: string;
}>();

const label = computed(() => formatRole(props.role));

const badgeVariant = computed(() => {
  switch (props.role?.toUpperCase()) {
    case 'ADMIN':
      return 'purple';
    case 'USER':
    default:
      return 'info';
  }
});
</script>
