<template>
  <div 
    class="max-w-md w-full space-y-8 p-10 bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 transform transition-all duration-300 hover:shadow-3xl"
  >
    <div v-if="title || subtitle" class="text-center">
      <h2 v-if="title" class="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
        {{ title }}
      </h2>
      <p v-if="subtitle" class="mt-2 text-sm text-gray-600">
        {{ subtitle }}
      </p>
    </div>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string;
  subtitle?: string;
}

defineProps<Props>();
</script>
