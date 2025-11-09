export interface User {
  id: number;
  name: string;
  email: string;
  role: 'owner' | 'manager' | 'cashier';
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}