
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: number;
  className?: string;
}

export const StatCard = ({
  title,
  value,
  icon,
  change,
  className,
}: StatCardProps) => {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold mt-2">{value}</h3>
            
            {typeof change !== "undefined" && (
              <div className="flex items-center mt-1">
                {change > 0 ? (
                  <ArrowUpIcon className="mr-1 h-4 w-4 text-emerald-500" />
                ) : (
                  <ArrowDownIcon className="mr-1 h-4 w-4 text-rose-500" />
                )}
                <span
                  className={cn(
                    "text-xs font-medium",
                    change > 0 ? "text-emerald-500" : "text-rose-500"
                  )}
                >
                  {Math.abs(change)}%
                </span>
                <span className="text-xs text-muted-foreground ml-1">vs. last month</span>
              </div>
            )}
          </div>
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
