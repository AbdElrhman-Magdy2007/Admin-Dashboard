
import { 
  Product, 
  Order,
  Customer, 
  Analytics, 
  OrderStatus, 
  DashboardStats 
} from './types';

// Helper functions to generate random data
const randomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const randomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Mock Products
export const mockProducts: Product[] = Array.from({ length: 30 }, (_, i) => {
  const categories = ['Electronics', 'Clothing', 'Food', 'Home', 'Beauty'];
  const createdAt = randomDate(new Date(2023, 0, 1), new Date());
  const updatedAt = randomDate(createdAt, new Date());
  
  return {
    id: `prod-${i + 1}`,
    name: `Product ${i + 1}`,
    description: `Description for Product ${i + 1}. This is a sample product.`,
    price: randomNumber(10, 500),
    stock: randomNumber(0, 100),
    category: categories[randomNumber(0, categories.length - 1)],
    status: randomNumber(0, 10) > 2 ? 'active' : 'inactive',
    createdAt,
    updatedAt,
    image: `/placeholder.svg`,
  };
});

// Mock Customers
export const mockCustomers: Customer[] = Array.from({ length: 25 }, (_, i) => {
  const createdAt = randomDate(new Date(2023, 0, 1), new Date());
  const totalOrders = randomNumber(1, 20);
  const totalSpent = totalOrders * randomNumber(50, 500);

  return {
    id: `cust-${i + 1}`,
    name: `Customer ${i + 1}`,
    email: `customer${i + 1}@example.com`,
    phone: randomNumber(0, 1) ? `+1${randomNumber(1000000000, 9999999999)}` : undefined,
    avatar: randomNumber(0, 1) ? `/placeholder.svg` : undefined,
    createdAt,
    totalOrders,
    totalSpent,
  };
});

// Mock Orders
export const mockOrders: Order[] = Array.from({ length: 45 }, (_, i) => {
  const statuses: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  const customer = mockCustomers[randomNumber(0, mockCustomers.length - 1)];
  const itemsCount = randomNumber(1, 5);
  const items = Array.from({ length: itemsCount }, (_, j) => {
    const product = mockProducts[randomNumber(0, mockProducts.length - 1)];
    const quantity = randomNumber(1, 5);
    return {
      id: `item-${i}-${j}`,
      productId: product.id,
      productName: product.name,
      quantity,
      price: product.price,
    };
  });
  
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const createdAt = randomDate(new Date(2023, 0, 1), new Date());
  const updatedAt = randomDate(createdAt, new Date());
  
  return {
    id: `order-${i + 1}`,
    customerId: customer.id,
    customerName: customer.name,
    status: statuses[randomNumber(0, statuses.length - 1)],
    items,
    total,
    createdAt,
    updatedAt,
    shippingAddress: `${randomNumber(100, 999)} Example St, City, Country`,
  };
});

// Generate daily sales data for the last 30 days
const generateDailySales = () => {
  const dailySales = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    
    dailySales.push({
      date: date.toISOString().split('T')[0],
      amount: randomNumber(1000, 10000)
    });
  }
  
  return dailySales;
};

// Mock Analytics
export const mockAnalytics: Analytics = {
  salesOverview: {
    totalSales: mockOrders.reduce((sum, order) => sum + order.total, 0),
    percentChange: randomNumber(-10, 30),
    dailySales: generateDailySales()
  },
  topProducts: mockProducts.slice(0, 5).map(product => ({
    productId: product.id,
    productName: product.name,
    sales: randomNumber(10, 100),
    revenue: product.price * randomNumber(10, 100)
  })),
  recentOrders: mockOrders.slice(0, 5)
};

// Mock Dashboard Stats
export const mockDashboardStats: DashboardStats = {
  totalRevenue: mockOrders.reduce((sum, order) => sum + order.total, 0),
  revenueGrowth: randomNumber(5, 15),
  totalOrders: mockOrders.length,
  ordersGrowth: randomNumber(-5, 20),
  totalCustomers: mockCustomers.length,
  customersGrowth: randomNumber(2, 12),
  totalProducts: mockProducts.length,
  productsGrowth: randomNumber(-2, 8)
};
