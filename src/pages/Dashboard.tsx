import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatCard } from "@/components/dashboard/stat-card";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { RecentOrders } from "@/components/dashboard/recent-orders";
import { TopProducts } from "@/components/dashboard/top-products";
import { mockAnalytics, mockDashboardStats } from "@/data/mockData";
import { DollarSign, Package, ShoppingCart, Users } from "lucide-react";
import { useDeviceType } from "@/hooks/use-mobile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Utility function to format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value);
};

// Responsive stat card component
const ResponsiveStatCard = ({
  title,
  value,
  icon,
  change,
  isMobile,
  isTablet,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  change: number;
  isMobile: boolean;
  isTablet: boolean;
}) => (
  <Card className="shadow-md hover:shadow-lg transition-all duration-300 rounded-xl bg-gradient-to-br from-primary/10 to-background border-primary/20">
    <CardContent className={`p-${isMobile ? 4 : isTablet ? 5 : 6}`}>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className={`text-${isMobile ? 'sm' : 'base'} text-muted-foreground`}>{title}</p>
          <p className={`text-${isMobile ? 'xl' : isTablet ? '2xl' : '3xl'} font-bold`}>{value}</p>
          <p className={`text-${isMobile ? 'xs' : 'sm'} ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? '+' : ''}{change}%
          </p>
        </div>
        <div className={`p-2 rounded-full bg-primary/10`}>{icon}</div>
      </div>
    </CardContent>
  </Card>
);

// Loading skeleton for responsive view
const LoadingSkeleton = ({ isMobile, isTablet }: { isMobile: boolean; isTablet: boolean }) => (
  <div className="animate-pulse" aria-hidden="true">
    {/* Stats Skeleton */}
    <div className={`grid gap-4 grid-cols-${isMobile ? 1 : isTablet ? 2 : 4} mb-6`}>
      {Array(4).fill(0).map((_, i) => (
        <Card key={i} className="rounded-xl">
          <CardContent className={`p-${isMobile ? 4 : isTablet ? 5 : 6}`}>
            <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-muted rounded w-3/4"></div>
          </CardContent>
        </Card>
      ))}
    </div>
    {/* Chart Skeleton */}
    <Card className="rounded-xl mb-6">
      <CardContent className="p-6">
        <div className={`h-${isMobile ? 64 : isTablet ? 80 : 96} bg-muted rounded`}></div>
      </CardContent>
    </Card>
    {/* Products/Orders Skeleton */}
    <div className={`grid gap-4 grid-cols-${isMobile ? 1 : 2}`}>
      {Array(2).fill(0).map((_, i) => (
        <Card key={i} className="rounded-xl">
          <CardContent className="p-6">
            <div className="h-4 bg-muted rounded w-1/3 mb-4"></div>
            {Array(3).fill(0).map((_, j) => (
              <div key={j} className="h-3 bg-muted rounded w-full mb-2"></div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

const Dashboard = () => {
  const [stats] = useState(mockDashboardStats);
  const [analytics] = useState(mockAnalytics);
  const [isLoading, setIsLoading] = useState(true);
  const { isMobile, isTablet, isDesktop } = useDeviceType();

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Debug device type
  useEffect(() => {
    console.log("Device Type:", { isMobile, isTablet, isDesktop });
  }, [isMobile, isTablet, isDesktop]);

  return (
    <DashboardLayout>
      <div className={`space-y-6 p-${isMobile ? 4 : isTablet ? 5 : 6} bg-background min-h-screen`}>
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-4 border-b border-border/50">
          <div className="max-w-7xl mx-auto">
            <h1 className={`text-${isMobile ? '2xl' : '3xl'} font-extrabold tracking-tight text-foreground`}>
              Business Dashboard
            </h1>
            <p className={`text-${isMobile ? 'sm' : 'base'} text-muted-foreground mt-1`}>
              Overview of your business performance and metrics
            </p>
          </div>
        </div>

        {isLoading ? (
          <LoadingSkeleton isMobile={isMobile} isTablet={isTablet} />
        ) : (
          <>
            {/* Key Metrics */}
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

            {/* Sales Chart */}
            <div className="max-w-7xl mx-auto">
              <Card className="shadow-md hover:shadow-lg transition-all duration-300 rounded-xl border-primary/20">
                <CardHeader>
                  <CardTitle className={`text-${isMobile ? 'lg' : 'xl'} font-semibold`}>Sales Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <SalesChart
                    data={analytics.salesOverview.dailySales}
                    className={`w-full h-${isMobile ? '[300px]' : isTablet ? '[350px]' : '[400px]'}`}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Top Products and Recent Orders */}
            <div className={`grid gap-4 grid-cols-${isMobile ? 1 : 2} max-w-7xl mx-auto`}>
              <Card className="shadow-md hover:shadow-lg transition-all duration-300 rounded-xl border-primary/20">
                <CardHeader>
                  <CardTitle className={`text-${isMobile ? 'lg' : 'xl'} font-semibold`}>Top Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <TopProducts products={analytics.topProducts} />
                </CardContent>
              </Card>
              <Card className="shadow-md hover:shadow-lg transition-all duration-300 rounded-xl border-primary/20">
                <CardHeader>
                  <CardTitle className={`text-${isMobile ? 'lg' : 'xl'} font-semibold`}>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <RecentOrders orders={analytics.recentOrders} />
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;