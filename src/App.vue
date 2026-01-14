<template>
  <router-view v-slot="{ Component }">
    <transition name="fade-slide" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
  <ToastContainer />
  <BackToTop />
</template>

<script setup lang="ts">
import ToastContainer from './components/ToastContainer.vue';
import BackToTop from './components/BackToTop.vue';
</script>