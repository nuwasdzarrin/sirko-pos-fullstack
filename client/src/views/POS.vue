<template>
  <div class="container-fluid py-4">
    <div class="row mb-4">
      <div class="col-12">
        <h1 class="h3 mb-0">Point of Sale</h1>
        <p class="text-muted mb-0">Process sales transactions</p>
      </div>
    </div>

    <div class="row g-4">
      <!-- Products Section -->
      <div class="col-lg-8">
        <div class="card">
          <div class="card-header">
            <div class="row align-items-center">
              <div class="col-md-6">
                <h5 class="card-title mb-0">Products</h5>
              </div>
              <div class="col-md-6">
                <input
                  v-model="searchQuery"
                  type="text"
                  class="form-control"
                  placeholder="Search products..."
                  @input="searchProducts"
                />
              </div>
            </div>
          </div>
          <div class="card-body">
            <div class="row g-3">
              <div
                v-for="product in filteredProducts"
                :key="product.id"
                class="col-md-6 col-lg-4"
              >
                <div class="card h-100 product-card" @click="addToCart(product)">
                  <div class="card-body text-center">
                    <div class="product-image mb-2">
                      <i class="bi bi-box fs-1 text-muted"></i>
                    </div>
                    <h6 class="card-title">{{ product.name }}</h6>
                    <p class="card-text small text-muted">{{ product.attributes }}</p>
                    <h5 class="text-primary">Rp {{ formatCurrency(product.price) }}</h5>
                    <small class="text-muted">Stock: {{ product.stock }}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Cart Section -->
      <div class="col-lg-4">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="card-title mb-0">Shopping Cart</h5>
            <button
              class="btn btn-sm btn-outline-danger"
              @click="clearCart"
              :disabled="cart.length === 0"
            >
              Clear
            </button>
          </div>
          <div class="card-body">
            <div v-if="cart.length === 0" class="text-center text-muted py-4">
              <i class="bi bi-cart fs-1"></i>
              <p class="mb-0">Cart is empty</p>
            </div>

            <div v-else>
              <div class="cart-items">
                <div
                  v-for="item in cart"
                  :key="item.id"
                  class="d-flex justify-content-between align-items-center mb-3"
                >
                  <div class="flex-grow-1">
                    <h6 class="mb-1">{{ item.name }}</h6>
                    <small class="text-muted">{{ item.attributes }}</small>
                  </div>
                  <div class="d-flex align-items-center">
                    <button
                      class="btn btn-sm btn-outline-secondary me-2"
                      @click="updateQuantity(item.id, item.quantity - 1)"
                      :disabled="item.quantity <= 1"
                    >
                      -
                    </button>
                    <span class="mx-2">{{ item.quantity }}</span>
                    <button
                      class="btn btn-sm btn-outline-secondary me-2"
                      @click="updateQuantity(item.id, item.quantity + 1)"
                      :disabled="item.quantity >= item.stock"
                    >
                      +
                    </button>
                    <span class="text-primary fw-bold ms-2">
                      Rp {{ formatCurrency(item.price * item.quantity) }}
                    </span>
                    <button
                      class="btn btn-sm btn-outline-danger ms-2"
                      @click="removeFromCart(item.id)"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>

              <hr />

              <div class="row mb-3">
                <div class="col-6">
                  <label class="form-label">Payment Method</label>
                  <select v-model="paymentMethod" class="form-select">
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="transfer">Transfer</option>
                  </select>
                </div>
                <div class="col-6" v-if="paymentMethod === 'cash'">
                  <label class="form-label">Cash Received</label>
                  <input
                    v-model="cashReceived"
                    type="number"
                    class="form-control"
                    placeholder="0"
                  />
                </div>
              </div>

              <div class="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span>Rp {{ formatCurrency(subtotal) }}</span>
              </div>
              <div class="d-flex justify-content-between mb-2">
                <span>Tax (10%):</span>
                <span>Rp {{ formatCurrency(tax) }}</span>
              </div>
              <div class="d-flex justify-content-between mb-3">
                <strong>Total:</strong>
                <strong>Rp {{ formatCurrency(total) }}</strong>
              </div>

              <div v-if="paymentMethod === 'cash' && cashReceived > 0" class="mb-3">
                <div class="d-flex justify-content-between">
                  <span>Change:</span>
                  <span class="text-success">Rp {{ formatCurrency(change) }}</span>
                </div>
              </div>

              <button
                class="btn btn-primary w-100"
                @click="processSale"
                :disabled="!canProcessSale"
              >
                <i class="bi bi-cash-stack me-2"></i>
                Process Sale
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useToast } from 'vue-toastification';

const toast = useToast();

// State
const searchQuery = ref('');
const cart = ref<any[]>([]);
const paymentMethod = ref('cash');
const cashReceived = ref(0);

// Mock product data
const products = ref([
  {
    id: 1,
    name: 'Premium Coffee',
    attributes: 'Small (250ml)',
    price: 15000,
    stock: 50,
    sku: 'COF001-S',
  },
  {
    id: 2,
    name: 'Premium Coffee',
    attributes: 'Large (500ml)',
    price: 25000,
    stock: 30,
    sku: 'COF001-L',
  },
  {
    id: 3,
    name: 'Green Tea',
    attributes: 'Regular (300ml)',
    price: 12000,
    stock: 40,
    sku: 'TEA001-R',
  },
  {
    id: 4,
    name: 'Potato Chips',
    attributes: 'Original (100g)',
    price: 10000,
    stock: 100,
    sku: 'SNK001-ORG',
  },
]);

// Computed
const filteredProducts = computed(() => {
  if (!searchQuery.value) return products.value;

  return products.value.filter(product =>
    product.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const subtotal = computed(() => {
  return cart.value.reduce((total, item) => total + (item.price * item.quantity), 0);
});

const tax = computed(() => {
  return Math.round(subtotal.value * 0.1);
});

const total = computed(() => {
  return subtotal.value + tax.value;
});

const change = computed(() => {
  return Math.max(0, cashReceived.value - total.value);
});

const canProcessSale = computed(() => {
  return cart.value.length > 0 &&
         (paymentMethod.value !== 'cash' || cashReceived.value >= total.value);
});

// Methods
function formatCurrency(amount: number): string {
  return amount.toLocaleString('id-ID');
}

function searchProducts() {
  // Search functionality is handled by computed property
}

function addToCart(product: any) {
  const existingItem = cart.value.find(item => item.id === product.id);

  if (existingItem) {
    if (existingItem.quantity < product.stock) {
      existingItem.quantity++;
      toast.success(`Added ${product.name} to cart`);
    } else {
      toast.error('Insufficient stock');
    }
  } else {
    cart.value.push({
      ...product,
      quantity: 1,
    });
    toast.success(`Added ${product.name} to cart`);
  }
}

function removeFromCart(productId: number) {
  cart.value = cart.value.filter(item => item.id !== productId);
}

function updateQuantity(productId: number, newQuantity: number) {
  const item = cart.value.find(item => item.id === productId);
  if (item) {
    if (newQuantity <= item.stock && newQuantity > 0) {
      item.quantity = newQuantity;
    }
  }
}

function clearCart() {
  cart.value = [];
  cashReceived.value = 0;
}

async function processSale() {
  try {
    // Mock sale processing - will be replaced with actual API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast.success('Sale processed successfully!');
    clearCart();

    // TODO: Redirect to receipt view or print receipt
  } catch (error) {
    toast.error('Failed to process sale');
  }
}

onMounted(() => {
  // Load products from API
});
</script>

<style scoped>
.product-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.product-image {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cart-items {
  max-height: 300px;
  overflow-y: auto;
}
</style>