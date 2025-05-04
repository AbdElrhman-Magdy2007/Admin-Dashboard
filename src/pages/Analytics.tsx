import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockAnalytics } from "@/data/mockData";
import { SalesChart } from "@/components/dashboard/sales-chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  TooltipProps,
} from "recharts";
import { parseISO, subMonths } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";

// Types for better type safety
interface DailySales {
  date: string;
  amount: number;
}

interface AnalyticsData {
  salesOverview: {
    dailySales: DailySales[];
  };
}

interface OrderStatus {
  name: string;
  value: number;
}

interface CategoryData {
  name: string;
  revenue: number;
}

// Constants
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];
const TIME_PERIODS = {
  "7days": { label: "Last 7 Days", days: 7 },
  "30days": { label: "Last 30 Days", days: 30 },
  // "3months": { label: "Last 3 Months", months: 3 },
} as const;

type TimePeriod = keyof typeof TIME_PERIODS;

// Custom Tooltip Component
const CustomTooltip = ({
  active,
  payload,
  label,
  isMobile,
}: TooltipProps<number, string> & { isMobile: boolean }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div
      className="rounded-md border bg-background p-3 shadow-sm"
      style={{
        border: "1px solid var(--border)",
        fontSize: isMobile ? "12px" : "14px",
      }}
      role="tooltip"
      aria-label={`Tooltip for ${label}`}
    >
      <p className="font-medium">{label}</p>
      {payload.map((entry, index) => (
        <p
          key={index}
          style={{ color: entry.color || "hsl(var(--primary))" }}
          aria-label={`${entry.name}: ${entry.value}`}
        >
          {entry.name}: {entry.name === "Revenue" ? `$${entry.value}` : entry.value}
        </p>
      ))}
    </div>
  );
};

// Main Analytics Component
const Analytics = () => {
  const [analytics] = useState<AnalyticsData | null>(mockAnalytics);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("30days");
  const isMobile = useIsMobile();

  // Memoized filtered and sorted sales data
  const filteredSalesData = useMemo(() => {
    if (!analytics?.salesOverview.dailySales) return [];

    const now = new Date();
    let cutoffDate: Date;

    if (timePeriod === "3months") {
      cutoffDate = subMonths(now, TIME_PERIODS["3months"].months);
    } else {
      cutoffDate = new Date(now.getTime() - TIME_PERIODS[timePeriod].days * 24 * 60 * 60 * 1000);
    }

    return analytics.salesOverview.dailySales
      .filter((sale) => {
        const saleDate = parseISO(sale.date);
        return saleDate >= cutoffDate;
      })
      .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());
  }, [analytics, timePeriod]);

  // Static data for charts
  const orderStatusData: OrderStatus[] = [
    { name: "Pending", value: 15 },
    { name: "Processing", value: 25 },
    { name: "Shipped", value: 30 },
    { name: "Delivered", value: 40 },
    { name: "Cancelled", value: 10 },
  ];

  const categoryData: CategoryData[] = [
    { name: "Electronics", revenue: 25000 },
    { name: "Clothing", revenue: 18000 },
    { name: "Food", revenue: 12000 },
    { name: "Home", revenue: 15000 },
    { name: "Beauty", revenue: 8000 },
  ];

  // Error state
  if (!analytics || !filteredSalesData.length) {
    return (
      <DashboardLayout>
        <div className="space-y-5" role="alert">
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-destructive">
            Unable to load analytics data. Please try again later.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <header>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Detailed business metrics and performance insights.
          </p>
        </header>

        {/* Time Period Selector */}
        <div className="flex gap-2" role="radiogroup" aria-label="Select time period">
          {Object.keys(TIME_PERIODS).map((period) => (
            <Button
              key={period}
              variant={timePeriod === period ? "default" : "outline"}
              onClick={() => setTimePeriod(period as TimePeriod)}
              size={isMobile ? "sm" : "default"}
              aria-pressed={timePeriod === period}
            >
              {TIME_PERIODS[period as TimePeriod].label}
            </Button>
          ))}
        </div>

        {/* Sales Trend Chart */}
        <SalesChart
          data={filteredSalesData}
          title="Revenue Trends"
          description={`Sales performance for the ${TIME_PERIODS[timePeriod].label.toLowerCase()}`}
        />

        {/* Charts Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Revenue by Category */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Category</CardTitle>
              <CardDescription>
                Distribution of revenue across product categories
              </CardDescription>
            </CardHeader>
            <CardContent className={isMobile ? "h-64" : "h-80"}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryData}
                  margin={{
                    top: 20,
                    right: isMobile ? 10 : 30,
                    left: isMobile ? 10 : 20,
                    bottom: 5,
                  }}
                  aria-label="Revenue by category chart"
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="name" fontSize={isMobile ? 10 : 12} />
                  <YAxis
                    tickFormatter={(value) => `$${value / 1000}k`}
                    axisLine={false}
                    tickLine={false}
                    fontSize={isMobile ? 10 : 12}
                    width={isMobile ? 35 : 45}
                  />
                  <Tooltip
                    content={<CustomTooltip isMobile={isMobile} />}
                    formatter={(value) => [`$${value}`, "Revenue"]}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                    animationDuration={800}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Order Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Order Status Distribution</CardTitle>
              <CardDescription>Breakdown of orders by current status</CardDescription>
            </CardHeader>
            <CardContent className={isMobile ? "h-64" : "h-80"}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart aria-label="Order status distribution chart">
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={isMobile ? 60 : 80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    animationDuration={800}
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        aria-label={`${entry.name}: ${entry.value}`}
                      />
                    ))}
                  </Pie>
                  <Legend
                    formatter={(value) => (
                      <span className="text-sm text-muted-foreground">{value}</span>
                    )}
                    layout={isMobile ? "horizontal" : "vertical"}
                    align={isMobile ? "center" : "right"}
                    verticalAlign={isMobile ? "bottom" : "middle"}
                  />
                  <Tooltip
                    content={<CustomTooltip isMobile={isMobile} />}
                    formatter={(value) => [value, "Orders"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;