<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

onMounted(() => {
  // Check for existing session on app load
  authStore.checkAuth();
});
</script>

<style>
#app {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.navbar-brand {
  font-weight: bold;
}

.card {
  border: none;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.btn {
  border-radius: 0.375rem;
}

.form-control {
  border-radius: 0.375rem;
}

.alert {
  border: none;
  border-radius: 0.5rem;
}
</style>