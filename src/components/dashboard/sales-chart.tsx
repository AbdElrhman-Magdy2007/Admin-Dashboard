import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DailySales } from "@/data/types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface SalesChartProps {
  data: DailySales[];
  title?: string;
  description?: string;
  className?: string;
}

export const SalesChart = ({
  data,
  title = "Sales Overview",
  description = "Daily sales over the past 30 days",
  className,
}: SalesChartProps) => {
  const isMobile = useIsMobile();

  // Sort data by date to ensure chronological order
  const sortedData = [...data].sort((a, b) => {
    return parseISO(a.date).getTime() - parseISO(b.date).getTime();
  });

  // Custom tick formatter to handle month transitions
  const tickFormatter = (dateStr: string, index: number) => {
    const date = parseISO(dateStr);
    const prevDate = index > 0 ? parseISO(sortedData[index - 1].date) : null;
    // Show month name for the first day of a new month or if month changes
    if (
      !prevDate ||
      prevDate.getMonth() !== date.getMonth() ||
      date.getDate() === 1
    ) {
      return format(date, isMobile ? "MMM d" : "MMM d");
    }
    return format(date, isMobile ? "d" : "d");
  };

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const date = parseISO(label);
      return (
        <div
          className="rounded-md border bg-background p-3 shadow-sm"
          style={{
            border: "1px solid var(--border)",
            fontSize: isMobile ? "12px" : "14px",
          }}
        >
          <p className="font-medium">{format(date, "MMMM d, yyyy")}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color || "hsl(var(--primary))" }}>
              {entry.name}: ${entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={cn("col-span-3", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="w-full aspect-[3/1] md:aspect-[3/1] sm:aspect-[2/1]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={sortedData}
            margin={{
              top: 5,
              right: isMobile ? 5 : 10,
              left: isMobile ? 5 : 10,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
            <XAxis
              dataKey="date"
              tickFormatter={tickFormatter}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: isMobile ? 10 : 12 }}
              interval={isMobile ? Math.floor(sortedData.length / 5) : Math.floor(sortedData.length / 10)}
            />
            <YAxis
              tickFormatter={(value) => `$${value}`}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: isMobile ? 10 : 12 }}
              width={isMobile ? 35 : 45}
            />
            <Tooltip content={<CustomTooltip />} formatter={(value) => [`$${value}`, "Sales"]} />
            <Line
              type="monotone"
              dataKey="amount"
              name="Sales"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};