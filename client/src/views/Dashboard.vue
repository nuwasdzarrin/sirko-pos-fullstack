<template>
  <div class="container-fluid py-4">
    <div class="row mb-4">
      <div class="col-12">
        <h1 class="h3 mb-0">Dashboard</h1>
        <p class="text-muted mb-0">Welcome back, {{ authStore.user?.name }}!</p>
      </div>
    </div>

    <div class="row g-4">
      <!-- Daily Sales Card -->
      <div class="col-md-3">
        <div class="card">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="card-subtitle text-muted">Daily Sales</h6>
                <h3 class="card-title mb-0">Rp {{ formatCurrency(dailySales) }}</h3>
              </div>
              <div class="text-primary">
                <i class="bi bi-cash-stack fs-2"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Transactions Card -->
      <div class="col-md-3">
        <div class="card">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="card-subtitle text-muted">Transactions</h6>
                <h3 class="card-title mb-0">{{ transactionCount }}</h3>
              </div>
              <div class="text-success">
                <i class="bi bi-receipt fs-2"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Low Stock Card -->
      <div class="col-md-3">
        <div class="card">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="card-subtitle text-muted">Low Stock Items</h6>
                <h3 class="card-title mb-0">{{ lowStockItems }}</h3>
              </div>
              <div class="text-warning">
                <i class="bi bi-exclamation-triangle fs-2"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Total Products Card -->
      <div class="col-md-3">
        <div class="card">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="card-subtitle text-muted">Total Products</h6>
                <h3 class="card-title mb-0">{{ totalProducts }}</h3>
              </div>
              <div class="text-info">
                <i class="bi bi-box fs-2"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="row mt-4">
      <div class="col-12">
        <div class="card">
          <div class="card-header">
            <h5 class="card-title mb-0">Quick Actions</h5>
          </div>
          <div class="card-body">
            <div class="row g-3">
              <div class="col-md-3">
                <router-link to="/pos" class="btn btn-primary btn-lg w-100">
                  <i class="bi bi-cart-plus me-2"></i>
                  New Sale
                </router-link>
              </div>
              <div class="col-md-3" v-if="authStore.hasPermission('manage_inventory')">
                <router-link to="/products" class="btn btn-outline-primary btn-lg w-100">
                  <i class="bi bi-box-seam me-2"></i>
                  Manage Products
                </router-link>
              </div>
              <div class="col-md-3" v-if="authStore.hasPermission('view_reports')">
                <router-link to="/reports" class="btn btn-outline-primary btn-lg w-100">
                  <i class="bi bi-graph-up me-2"></i>
                  View Reports
                </router-link>
              </div>
              <div class="col-md-3">
                <button class="btn btn-outline-secondary btn-lg w-100" @click="refreshData">
                  <i class="bi bi-arrow-clockwise me-2"></i>
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import axios from 'axios';

const authStore = useAuthStore();

const dailySales = ref(0);
const transactionCount = ref(0);
const lowStockItems = ref(0);
const totalProducts = ref(0);

function formatCurrency(amount: number): string {
  return amount.toLocaleString('id-ID');
}

async function loadDashboardData() {
  try {
    // Mock data for now - will be replaced with actual API calls
    dailySales.value = 2500000;
    transactionCount.value = 45;
    lowStockItems.value = 3;
    totalProducts.value = 156;
  } catch (error) {
    console.error('Failed to load dashboard data:', error);
  }
}

function refreshData() {
  loadDashboardData();
}

onMounted(() => {
  loadDashboardData();
});
</script>