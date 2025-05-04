
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatCard } from "@/components/dashboard/stat-card";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { RecentOrders } from "@/components/dashboard/recent-orders";
import { TopProducts } from "@/components/dashboard/top-products";
import { mockAnalytics, mockDashboardStats } from "@/data/mockData";
import { BarChart3, DollarSign, Package, ShoppingCart, Users } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value);
};

const Dashboard = () => {
  const [stats] = useState(mockDashboardStats);
  const [analytics] = useState(mockAnalytics);
  const isMobile = useIsMobile();

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your business performance and metrics.
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
            icon={<DollarSign className="h-5 w-5" />}
            change={stats.revenueGrowth}
          />
          <StatCard
            title="Orders"
            value={stats.totalOrders}
            icon={<ShoppingCart className="h-5 w-5" />}
            change={stats.ordersGrowth}
          />
          <StatCard
            title="Customers"
            value={stats.totalCustomers}
            icon={<Users className="h-5 w-5" />}
            change={stats.customersGrowth}
          />
          <StatCard
            title="Products"
            value={stats.totalProducts}
            icon={<Package className="h-5 w-5" />}
            change={stats.productsGrowth}
          />
        </div>

        {/* Charts and Tables */}
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
          <SalesChart 
            data={analytics.salesOverview.dailySales} 
            className="col-span-1 lg:col-span-4"
          />
          
          <div className="space-y-4 col-span-1 lg:col-span-3">
            <TopProducts products={analytics.topProducts} />
            <RecentOrders orders={analytics.recentOrders} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
