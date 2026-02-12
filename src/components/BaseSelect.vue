<template>
  <div class="relative" ref="selectRef">
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-1">{{ label }}</label>
    <button @click="isOpen = !isOpen" type="button" :disabled="disabled"
      class="relative w-full bg-white/50 border border-gray-300 rounded-xl shadow-sm pl-4 pr-10 py-2.5 text-left cursor-default focus:outline-none focus:border-blue-500 sm:text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      :class="[error ? 'border-red-300' : 'border-gray-300']">
      <span class="block truncate font-medium text-gray-900">
        {{ selectedOptionLabel || placeholder }}
      </span>
      <span class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <ChevronDown class="h-4 w-4 text-gray-400 transition-transform duration-300" :class="{ 'rotate-180': isOpen }" />
      </span>
    </button>

    <transition enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 scale-95 -translate-y-2" enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition ease-in duration-150" leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 -translate-y-2">
      <div v-if="isOpen"
        class="absolute z-60 mt-1 w-full bg-white/95 backdrop-blur-lg shadow-xl max-h-60 rounded-xl py-1 text-base overflow-auto focus:outline-none sm:text-sm border border-gray-100">
        <div v-for="option in options" :key="option.value" @click="selectOption(option)"
          class="cursor-pointer select-none relative py-2.5 pl-4 pr-9 hover:bg-blue-50 transition-colors"
          :class="modelValue === option.value ? 'text-blue-600 bg-blue-50/50' : 'text-gray-900'">
          <span class="block truncate" :class="{ 'font-bold': modelValue === option.value }">
            {{ option.label }}
          </span>
          <span v-if="modelValue === option.value" class="absolute inset-y-0 right-0 flex items-center pr-4">
            <Check class="h-4 w-4" />
          </span>
        </div>
      </div>
    </transition>
    <p v-if="error" class="mt-1 text-xs text-red-600">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { ChevronDown, Check } from 'lucide-vue-next';

interface Option {
  label: string;
  value: any;
}

const props = defineProps<{
  modelValue: any;
  options: Option[];
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}>();

const emit = defineEmits(['update:modelValue', 'change']);

const isOpen = ref(false);
const selectRef = ref<HTMLElement | null>(null);

const selectedOptionLabel = computed(() => {
  const option = props.options.find(opt => opt.value === props.modelValue);
  return option ? option.label : '';
});

const selectOption = (option: Option) => {
  emit('update:modelValue', option.value);
  emit('change', option.value);
  isOpen.value = false;
};

const handleClickOutside = (event: MouseEvent) => {
  if (selectRef.value && !selectRef.value.contains(event.target as Node)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  window.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside);
});
</script>
