<template>
  <div class="container-fluid vh-100">
    <div class="row h-100">
      <div class="col-lg-6 d-none d-lg-block bg-primary bg-gradient">
        <div class="d-flex h-100 align-items-center justify-content-center">
          <div class="text-center text-white">
            <h1 class="display-4 fw-bold mb-4">Sirko POS</h1>
            <p class="lead mb-0">Multi-branch Point of Sale & Inventory Management</p>
          </div>
        </div>
      </div>
      <div class="col-lg-6">
        <div class="d-flex h-100 align-items-center justify-content-center">
          <div class="w-100" style="max-width: 400px;">
            <div class="card shadow">
              <div class="card-body p-4">
                <div class="text-center mb-4">
                  <h2 class="h3 mb-1">Welcome Back</h2>
                  <p class="text-muted">Sign in to your account</p>
                </div>

                <form @submit.prevent="handleLogin">
                  <div class="mb-3">
                    <label for="email" class="form-label">Email</label>
                    <input
                      id="email"
                      v-model="form.email"
                      type="email"
                      class="form-control"
                      :class="{ 'is-invalid': error }"
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  <div class="mb-4">
                    <label for="password" class="form-label">Password</label>
                    <input
                      id="password"
                      v-model="form.password"
                      type="password"
                      class="form-control"
                      :class="{ 'is-invalid': error }"
                      placeholder="Enter your password"
                      required
                    />
                    <div class="invalid-feedback" v-if="error">{{ error }}</div>
                  </div>

                  <button
                    type="submit"
                    class="btn btn-primary w-100 py-2 mb-3"
                    :disabled="loading"
                  >
                    <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                    {{ loading ? 'Signing in...' : 'Sign In' }}
                  </button>
                </form>

                <div class="text-center">
                  <small class="text-muted">
                    Demo Credentials:
                    <br />
                    Owner: owner@sirko.com / owner123
                    <br />
                    Manager: manager@sirko.com / manager123
                    <br />
                    Cashier: cashier@sirko.com / cashier123
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useToast } from 'vue-toastification';

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

const form = ref({
  email: '',
  password: '',
});

const loading = ref(false);
const error = ref('');

async function handleLogin() {
  loading.value = true;
  error.value = '';

  try {
    const result = await authStore.login(form.value);

    if (result.success) {
      toast.success('Login successful!');
      router.push('/dashboard');
    } else {
      error.value = result.error || 'Login failed';
      toast.error(error.value);
    }
  } catch (err: any) {
    error.value = err.message || 'An unexpected error occurred';
    toast.error(error.value);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.bg-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.card {
  border: none;
  border-radius: 1rem;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}
</style>