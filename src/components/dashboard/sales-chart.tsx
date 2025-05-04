
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
  TooltipProps
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
  
  return (
    <Card className={cn("col-span-3", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="w-full aspect-[3/1] md:aspect-[3/1] sm:aspect-[2/1]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: isMobile ? 5 : 10,
              left: isMobile ? 5 : 10,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="date" 
              tickFormatter={(str) => {
                const date = parseISO(str);
                return format(date, isMobile ? "M/d" : "MMM d");
              }}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: isMobile ? 10 : 12 }}
              interval={isMobile ? "preserveStartEnd" : 0}
            />
            <YAxis 
              tickFormatter={(value) => `$${value}`}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: isMobile ? 10 : 12 }}
              width={isMobile ? 35 : 45}
            />
            <Tooltip 
              formatter={(value) => [`$${value}`, 'Sales']}
              labelFormatter={(label) => format(parseISO(label), "MMMM d, yyyy")}
              contentStyle={{
                backgroundColor: 'var(--background)',
                border: '1px solid var(--border)',
                borderRadius: '0.375rem',
                boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
                padding: isMobile ? '8px' : '10px',
                fontSize: isMobile ? '12px' : '14px',
              }}
            />
            <Line
              type="monotone"
              dataKey="amount"
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
