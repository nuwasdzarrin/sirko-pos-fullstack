import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';
import type { User, LoginCredentials } from '@/types/auth';

const API_BASE_URL = '/api/v1';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem('token'));
  const loading = ref(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => !!token.value && !!user.value);

  // Configure axios defaults
  if (token.value) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
  }

  async function login(credentials: LoginCredentials) {
    loading.value = true;
    error.value = null;

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
      const { token: newToken, user: userData } = response.data.data;

      token.value = newToken;
      user.value = userData;
      localStorage.setItem('token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

      return { success: true };
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Login failed';
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    try {
      await axios.post(`${API_BASE_URL}/auth/logout`);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      token.value = null;
      user.value = null;
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    }
  }

  async function checkAuth() {
    if (!token.value) return false;

    try {
      const response = await axios.get(`${API_BASE_URL}/auth/me`);
      user.value = response.data.data;
      return true;
    } catch (err) {
      logout();
      return false;
    }
  }

  function hasRole(role: string): boolean {
    return user.value?.role === role;
  }

  function hasPermission(permission: string): boolean {
    if (!user.value) return false;

    const rolePermissions = {
      owner: ['read', 'write', 'delete', 'manage_users', 'manage_branches'],
      manager: ['read', 'write', 'manage_inventory', 'view_reports'],
      cashier: ['read', 'process_sales'],
    };

    return rolePermissions[user.value.role as keyof typeof rolePermissions]?.includes(permission) || false;
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    checkAuth,
    hasRole,
    hasPermission,
  };
});