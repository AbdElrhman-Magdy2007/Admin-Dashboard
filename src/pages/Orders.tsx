import { useState, useMemo, useCallback, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  Search,
  Filter,
  Eye,
  Edit,
  XCircle,
  ArrowUpDown,
} from "lucide-react";
import { mockOrders } from "@/data/mockData";
import { Order, OrderStatus } from "@/data/types";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useDeviceType } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { debounce } from "lodash";

// Constants
const ITEMS_PER_PAGE = {
  mobile: 5,
  tablet: 6,
  desktop: 8,
} as const;

const STATUS_OPTIONS: (OrderStatus | "all")[] = [
  "all",
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const SORTABLE_COLUMNS = ["id", "customerName", "createdAt", "total"] as const;

// Types
type SortColumn = (typeof SORTABLE_COLUMNS)[number];
type SortDirection = "asc" | "desc";

interface OrderTableProps {
  orders: Order[];
  isMobile: boolean;
  isTablet: boolean;
  sortColumn: SortColumn | null;
  sortDirection: SortDirection;
  onSort: (column: SortColumn) => void;
  onView: (order: Order) => void;
  onUpdate: (order: Order) => void;
  onCancel: (order: Order) => void;
  formatCurrency: (value: number) => string;
  getStatusColor: (status: OrderStatus) => string;
}

/** Utility function to format currency */
const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);

/** Utility function to get status color classes */
const getStatusColor = (status: OrderStatus): string => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case "processing":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    case "shipped":
      return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300";
    case "delivered":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "cancelled":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
  }
};

/** Renders a single order card for mobile view */
const OrderCard = ({
  order,
  onView,
  onUpdate,
  onCancel,
  formatCurrency,
  getStatusColor,
}: {
  order: Order;
  onView: (order: Order) => void;
  onUpdate: (order: Order) => void;
  onCancel: (order: Order) => void;
  formatCurrency: (value: number) => string;
  getStatusColor: (status: OrderStatus) => string;
}) => (
  <Card className="animate-fade-in hover:shadow-md transition-all">
    <CardContent className="p-4 sm:p-5">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm sm:text-base">{order.id}</h3>
          <Badge
            variant="outline"
            className={`text-xs sm:text-sm capitalize ${getStatusColor(order.status)}`}
          >
            {order.status}
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
          <div>
            <p className="text-muted-foreground">Customer</p>
            <p>{order.customerName}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Date</p>
            <p>{format(new Date(order.createdAt), "MMM d, yyyy")}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Total</p>
            <p>{formatCurrency(order.total)}</p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(order)}
            className="h-8 px-3 text-xs sm:text-sm hover:bg-primary/10 hover:text-primary"
            aria-label={`View details for order ${order.id}`}
          >
            <Eye className="h-3.5 w-3.5 mr-1" />
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onUpdate(order)}
            className="h-8 px-3 text-xs sm:text-sm hover:bg-primary/10 hover:text-primary"
            aria-label={`Update status for order ${order.id}`}
          >
            <Edit className="h-3.5 w-3.5 mr-1" />
            Update
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCancel(order)}
            className="h-8 px-3 text-xs sm:text-sm hover:bg-destructive/10 hover:text-destructive"
            aria-label={`Cancel order ${order.id}`}
          >
            <XCircle className="h-3.5 w-3.5 mr-1" />
            Cancel
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

/** Renders the order table for tablet/desktop view */
const OrderTable = ({
  orders,
  isMobile,
  isTablet,
  sortColumn,
  sortDirection,
  onSort,
  onView,
  onUpdate,
  onCancel,
  formatCurrency,
  getStatusColor,
}: OrderTableProps) => {
  if (isMobile) {
    return (
      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="border rounded-lg p-8 text-center bg-muted/20">
            <div className="flex flex-col items-center justify-center text-muted-foreground">
              <MoreHorizontal className="h-10 w-10 mb-2 opacity-30" aria-hidden="true" />
              <p className="font-medium">No orders found</p>
              <p className="text-sm">Try adjusting your search or filter</p>
            </div>
          </div>
        ) : (
          orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onView={onView}
              onUpdate={onUpdate}
              onCancel={onCancel}
              formatCurrency={formatCurrency}
              getStatusColor={getStatusColor}
            />
          ))
        )}
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="py-3">
              <Button
                variant="ghost"
                onClick={() => onSort("id")}
                className="flex items-center gap-1 p-0 hover:bg-transparent"
                aria-label="Sort by order ID"
              >
                Order ID
                {sortColumn === "id" && (
                  <ArrowUpDown
                    className={`h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`}
                  />
                )}
              </Button>
            </TableHead>
            <TableHead className="py-3">
              <Button
                variant="ghost"
                onClick={() => onSort("customerName")}
                className="flex items-center gap-1 p-0 hover:bg-transparent"
                aria-label="Sort by customer name"
              >
                Customer
                {sortColumn === "customerName" && (
                  <ArrowUpDown
                    className={`h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`}
                  />
                )}
              </Button>
            </TableHead>
            <TableHead className="py-3">
              <Button
                variant="ghost"
                onClick={() => onSort("createdAt")}
                className="flex items-center gap-1 p-0 hover:bg-transparent"
                aria-label="Sort by date"
              >
                Date
                {sortColumn === "createdAt" && (
                  <ArrowUpDown
                    className={`h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`}
                  />
                )}
              </Button>
            </TableHead>
            <TableHead className="py-3">Status</TableHead>
            <TableHead className="py-3 hidden md:table-cell">
              <Button
                variant="ghost"
                onClick={() => onSort("total")}
                className="flex items-center gap-1 p-0 hover:bg-transparent"
                aria-label="Sort by total"
              >
                Total
                {sortColumn === "total" && (
                  <ArrowUpDown
                    className={`h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`}
                  />
                )}
              </Button>
            </TableHead>
            <TableHead className="w-[80px] text-right py-3">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <MoreHorizontal
                    className="h-10 w-10 mb-2 opacity-30"
                    aria-hidden="true"
                  />
                  <p className="font-medium">No orders found</p>
                  <p className="text-sm">Try adjusting your search or filter</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => (
              <TableRow
                key={order.id}
                className="animate-fade-in group hover:bg-muted/50 transition-colors"
              >
                <TableCell className="font-medium py-3">{order.id}</TableCell>
                <TableCell className="py-3">{order.customerName}</TableCell>
                <TableCell className="py-3">
                  {format(new Date(order.createdAt), "MMM d, yyyy")}
                </TableCell>
                <TableCell className="py-3">
                  <Badge
                    variant="outline"
                    className={`text-xs sm:text-sm capitalize ${getStatusColor(order.status)}`}
                  >
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="py-3 hidden md:table-cell">
                  {formatCurrency(order.total)}
                </TableCell>
                <TableCell className="text-right py-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        aria-label={`Open actions for order ${order.id}`}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => onView(order)}
                        className="flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        View details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onUpdate(order)}
                        className="flex items-center gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Update status
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onCancel(order)}
                        className="flex items-center gap-2 text-destructive"
                      >
                        <XCircle className="h-4 w-4" />
                        Cancel order
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

/** Renders a loading skeleton for table or card view */
const LoadingSkeleton = ({ isMobile }: { isMobile: boolean }) => (
  <div className="animate-pulse" aria-hidden="true">
    {isMobile ? (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="h-4 bg-muted rounded w-1/3" />
              <div className="h-4 bg-muted rounded w-1/4" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="h-3 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="rounded-md border overflow-hidden">
        <div className="grid grid-cols-6 gap-3 p-4 bg-muted/40">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-4 bg-muted rounded" />
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="grid grid-cols-6 gap-3 p-4 border-b last:border-0">
            {Array.from({ length: 6 }).map((_, j) => (
              <div key={j} className="h-4 bg-muted rounded" />
            ))}
          </div>
        ))}
      </div>
    )}
  </div>
);

/** Main Orders component */
const Orders = () => {
  const [orders] = useState<Order[]>(mockOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
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

  // Dynamic items per page
  const itemsPerPage = isDesktop
    ? ITEMS_PER_PAGE.desktop
    : isTablet
    ? ITEMS_PER_PAGE.tablet
    : ITEMS_PER_PAGE.mobile;

  // Debounced search handler
  const handleSearch = useCallback(
    debounce((value: string) => {
      setSearchQuery(value);
      setCurrentPage(1);
    }, 300),
    []
  );

  // Sorting handler
  const handleSort = useCallback(
    (column: SortColumn) => {
      setSortColumn(column);
      setSortDirection((prev) =>
        sortColumn === column && prev === "asc" ? "desc" : "asc"
      );
      setCurrentPage(1);
    },
    [sortColumn]
  );

  // Filter and sort orders
  const filteredOrders = useMemo(() => {
    let result = orders.filter((order) => {
      const matchesSearch =
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    if (sortColumn) {
      result = [...result].sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];
        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortDirection === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
        }
        return 0;
      });
    }

    return result;
  }, [orders, searchQuery, statusFilter, sortColumn, sortDirection]);

  // Paginate orders
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredOrders, currentPage, itemsPerPage]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  // Action handlers
  const handleViewOrder = useCallback((order: Order) => {
    toast.info(`Viewing details for order ${order.id}`);
  }, []);

  const handleUpdateOrder = useCallback((order: Order) => {
    toast.info(`Updating status for order ${order.id}`);
  }, []);

  const handleCancelOrder = useCallback((order: Order) => {
    toast.success(`Order ${order.id} has been cancelled`);
  }, []);

  // Reset page if out of bounds
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <header>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
            <Badge variant="info" className="ml-2">
              {filteredOrders.length}
            </Badge>
          </div>
          <p className="text-muted-foreground">View and manage customer orders</p>
        </header>

        <Card className="overflow-hidden">
          <CardHeader className="space-y-0 pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center text-lg sm:text-xl">
                  <MoreHorizontal className="h-5 w-5 mr-2" aria-hidden="true" />
                  Order Management
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Track and process customer orders
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            {/* Filter and Search Section */}
            <div className="mb-6 space-y-4 sm:space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search
                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    placeholder="Search orders..."
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-9 h-10 text-sm"
                    aria-label="Search orders by ID or customer name"
                  />
                </div>
                <Select
                  value={statusFilter}
                  onValueChange={(value: OrderStatus | "all") => {
                    setStatusFilter(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger
                    className="w-full sm:w-[180px] flex gap-2 h-10 text-sm"
                    aria-label="Filter by order status"
                  >
                    <Filter className="h-4 w-4" aria-hidden="true" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((status) => (
                      <SelectItem
                        key={status}
                        value={status}
                        className="capitalize text-sm"
                      >
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isLoading ? (
              <LoadingSkeleton isMobile={isMobile} />
            ) : (
              <OrderTable
                orders={paginatedOrders}
                isMobile={isMobile}
                isTablet={isTablet}
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
                onView={handleViewOrder}
                onUpdate={handleUpdateOrder}
                onCancel={handleCancelOrder}
                formatCurrency={formatCurrency}
                getStatusColor={getStatusColor}
              />
            )}
          </CardContent>

          {/* Pagination Controls */}
          {!isLoading && totalPages > 1 && (
            <CardFooter className="justify-center py-4">
              <Pagination className="mx-auto">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) setCurrentPage(currentPage - 1);
                      }}
                      className={`h-8 w-8 p-0 ${
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : "hover:bg-muted"
                      }`}
                      aria-disabled={currentPage === 1}
                      aria-label="Previous page"
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const page = i + 1;
                    const shouldShow =
                      page === 1 ||
                      page === totalPages ||
                      page === currentPage ||
                      Math.abs(page - currentPage) <= (isMobile || isTablet ? 1 : 2);
                    if (!shouldShow) return null;
                    return (
                      <PaginationItem key={i}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(page);
                          }}
                          isActive={currentPage === page}
                          className="h-8 w-8 p-0 text-sm hover:bg-muted"
                          aria-label={`Page ${page}`}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages)
                          setCurrentPage(currentPage + 1);
                      }}
                      className={`h-8 w-8 p-0 ${
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : "hover:bg-muted"
                      }`}
                      aria-disabled={currentPage === totalPages}
                      aria-label="Next page"
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </CardFooter>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Orders;