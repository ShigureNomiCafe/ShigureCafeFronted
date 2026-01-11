<template>
  <div 
    :class="[
      'bg-white shadow-lg rounded-2xl overflow-hidden transition-all duration-300',
      borderClass,
      hoverable ? 'hover:shadow-xl hover:-translate-y-1 cursor-pointer' : ''
    ]"
    @click="$emit('click')"
  >
    <div v-if="$slots.header || title" class="px-6 py-6 border-b border-gray-100 bg-gray-50/50">
      <slot name="header">
        <h3 class="text-xl font-bold text-gray-900">{{ title }}</h3>
        <p v-if="subtitle" class="mt-1 max-w-2xl text-sm text-gray-500">{{ subtitle }}</p>
      </slot>
    </div>
    <div :class="['p-6', bodyClass]">
      <slot></slot>
    </div>
    <div v-if="$slots.footer" class="bg-gray-50 px-6 py-3 border-t border-gray-100">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  title?: string;
  subtitle?: string;
  hoverable?: boolean;
  bodyClass?: string;
  border?: string | boolean;
}

const props = withDefaults(defineProps<Props>(), {
  hoverable: false,
  bodyClass: '',
  border: 'border border-gray-100'
});

defineEmits(['click']);

const borderClass = computed(() => {
  if (props.border === false) return '';
  if (props.border === true || props.border === '') return 'border border-gray-100';
  return props.border;
});
</script>