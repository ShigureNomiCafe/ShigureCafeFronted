<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 sm:px-6 lg:px-8 transition-colors duration-500">
    <div 
      class="max-w-md w-full space-y-8 p-10 bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 transform transition-all duration-500 hover:shadow-3xl"
      :class="animate ? 'animate-[fade_0.5s_ease-out]' : ''"
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
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string;
  subtitle?: string;
  animate?: boolean;
}

withDefaults(defineProps<Props>(), {
  animate: true
});
</script>
