
// Product Related Types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
  image: string;
}

// Order Related Types
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  createdAt: Date;
  updatedAt: Date;
  shippingAddress: string;
}

// Customer Related Types
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  createdAt: Date;
  totalOrders: number;
  totalSpent: number;
}

// Analytics Related Types
export interface DailySales {
  date: string;
  amount: number;
}

export interface SalesOverview {
  totalSales: number;
  percentChange: number;
  dailySales: DailySales[];
}

export interface ProductPerformance {
  productId: string;
  productName: string;
  sales: number;
  revenue: number;
}

export interface Analytics {
  salesOverview: SalesOverview;
  topProducts: ProductPerformance[];
  recentOrders: Order[];
}

// Dashboard Types
export interface DashboardStats {
  totalRevenue: number;
  revenueGrowth: number;
  totalOrders: number;
  ordersGrowth: number;
  totalCustomers: number;
  customersGrowth: number;
  totalProducts: number;
  productsGrowth: number;
}
