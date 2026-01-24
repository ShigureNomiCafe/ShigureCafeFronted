<template>
  <router-view v-slot="{ Component }">
    <transition name="fade-slide" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
  <ToastContainer />
  <BackToTop />
  <Turnstile />
</template>

<script setup lang="ts">
import ToastContainer from './components/ToastContainer.vue';
import BackToTop from './components/BackToTop.vue';
import Turnstile from './components/Turnstile.vue';
</script>