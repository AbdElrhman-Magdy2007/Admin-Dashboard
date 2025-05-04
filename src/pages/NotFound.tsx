
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="space-y-5">
          <h1 className="text-7xl font-bold text-primary">404</h1>
          <h2 className="text-3xl font-bold tracking-tight">Page not found</h2>
          <p className="text-muted-foreground max-w-lg">
            Sorry, we couldn't find the page you're looking for. The page may have been moved,
            deleted, or never existed.
          </p>
          <div className="pt-6">
            <Button asChild>
              <a href="/">Return to Dashboard</a>
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NotFound;
