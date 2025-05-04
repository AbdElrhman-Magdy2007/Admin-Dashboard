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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  MoreHorizontal,
  Search,
  Filter,
  Package2,
  Download,
  XCircle,
  ArrowUpDown,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockOrders } from "@/data/mockData";
import { Order, OrderStatus } from "@/data/types";
import { format } from "date-fns";
import { toast } from "sonner";
import { debounce } from "lodash";
import { useDeviceType } from "@/hooks/use-mobile";

// Constants
const ITEMS_PER_PAGE = {
  mobile: 5,
  tablet: 8,
  desktop: 10,
} as const;

const STATUS_OPTIONS = ["all", "pending", "processing", "shipped", "delivered", "cancelled"] as const;

const SORTABLE_COLUMNS = ["id", "customerName", "createdAt", "total"] as const;

// Types
type Status = (typeof STATUS_OPTIONS)[number];
type SortColumn = (typeof SORTABLE_COLUMNS)[number];
type SortDirection = "asc" | "desc";

// Utility Functions
const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);

const getStatusVariant = (status: OrderStatus) => {
  switch (status) {
    case "pending":
      return "warning";
    case "processing":
      return "info";
    case "shipped":
      return "secondary";
    case "delivered":
      return "success";
    case "cancelled":
      return "destructive";
  }
};

// Reusable Components
interface OrderCardProps {
  order: Order;
  selected: boolean;
  onSelect: (id: string, checked: boolean) => void;
  onView: (order: Order) => void;
  onUpdateStatus: (order: Order) => void;
  onCancel: (order: Order) => void;
  formatCurrency: (value: number) => string;
  getStatusVariant: (status: OrderStatus) => string;
}

const OrderCard = ({
  order,
  selected,
  onSelect,
  onView,
  onUpdateStatus,
  onCancel,
  formatCurrency,
  getStatusVariant,
}: OrderCardProps) => (
  <Card className="hover:shadow-lg transition-all duration-200">
    <CardContent className="p-4 sm:p-5">
      <div className="flex items-center space-x-4">
        <Checkbox
          checked={selected}
          onCheckedChange={(checked) => onSelect(order.id, checked as boolean)}
          className="mt-1"
          aria-label={`Select order ${order.id}`}
        />
        <div className="flex-1 space-y-1.5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-base sm:text-lg truncate">{order.id}</h3>
            <Badge
              variant={getStatusVariant(order.status)}
              className="flex items-center gap-1 text-xs sm:text-sm"
            >
              <span className="capitalize">{order.status}</span>
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground truncate">{order.customerName}</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-xs sm:text-sm">
        <div>
          <p className="text-muted-foreground">Date</p>
          <p className="font-medium">{format(new Date(order.createdAt), "MMM d, yyyy")}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Total</p>
          <p className="font-medium">{formatCurrency(order.total)}</p>
        </div>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onView(order)}
          className="h-9 px-3 text-sm hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all duration-200"
          aria-label={`View order ${order.id} details`}
        >
          <Package2 className="h-4 w-4 mr-1.5" />
          View
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onUpdateStatus(order)}
          className="h-9 px-3 text-sm hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all duration-200"
          aria-label={`Update status for order ${order.id}`}
        >
          <MoreHorizontal className="h-4 w-4 mr-1.5" />
          Update
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onCancel(order)}
          className="h-9 px-3 text-sm hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-all duration-200"
          aria-label={`Cancel order ${order.id}`}
        >
          <XCircle className="h-4 w-4 mr-1.5" />
          Cancel
        </Button>
      </div>
    </CardContent>
  </Card>
);

interface OrderTableProps {
  orders: Order[];
  isMobile: boolean;
  selectedIds: Set<string>;
  onSelect: (id: string, checked: boolean) => void;
  onView: (order: Order) => void;
  onUpdateStatus: (order: Order) => void;
  onCancel: (order: Order) => void;
  formatCurrency: (value: number) => string;
  getStatusVariant: (status: OrderStatus) => string;
  sortColumn: SortColumn | null;
  sortDirection: SortDirection;
  onSort: (column: SortColumn) => void;
}

const OrderTable = ({
  orders,
  isMobile,
  selectedIds,
  onSelect,
  onView,
  onUpdateStatus,
  onCancel,
  formatCurrency,
  getStatusVariant,
  sortColumn,
  sortDirection,
  onSort,
}: OrderTableProps) => {
  if (isMobile) {
    return (
      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="border rounded-lg p-8 text-center bg-muted/10">
            <div className="flex flex-col items-center justify-center text-muted-foreground">
              <Package2 className="h-12 w-12 mb-3 opacity-50" aria-hidden="true" />
              <p className="font-medium text-lg">No orders found</p>
              <p className="text-sm mt-1">Try adjusting your search or filter criteria</p>
            </div>
          </div>
        ) : (
          orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              selected={selectedIds.has(order.id)}
              onSelect={onSelect}
              onView={onView}
              onUpdateStatus={onUpdateStatus}
              onCancel={onCancel}
              formatCurrency={formatCurrency}
              getStatusVariant={getStatusVariant}
            />
          ))
        )}
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/20">
            <TableHead className="w-12 py-3.5">
              <Checkbox
                checked={selectedIds.size === orders.length && orders.length > 0}
                onCheckedChange={(checked) => onSelect("all", checked as boolean)}
                aria-label="Select all orders"
              />
            </TableHead>
            <TableHead className="min-w-[120px] py-3.5">
              <Button
                variant="ghost"
                onClick={() => onSort("id")}
                className="flex items-center gap-1.5 p-0 hover:bg-transparent text-sm font-semibold"
                aria-label="Sort by order ID"
              >
                Order ID
                {sortColumn === "id" && (
                  <ArrowUpDown
                    className={`h-4 w-4 transition-transform ${
                      sortDirection === "asc" ? "rotate-180" : ""
                    }`}
                  />
                )}
              </Button>
            </TableHead>
            <TableHead className="min-w-[150px] py-3.5">
              <Button
                variant="ghost"
                onClick={() => onSort("customerName")}
                className="flex items-center gap-1.5 p-0 hover:bg-transparent text-sm font-semibold"
                aria-label="Sort by customer"
              >
                Customer
                {sortColumn === "customerName" && (
                  <ArrowUpDown
                    className={`h-4 w-4 transition-transform ${
                      sortDirection === "asc" ? "rotate-180" : ""
                    }`}
                  />
                )}
              </Button>
            </TableHead>
            <TableHead className="min-w-[120px] py-3.5">
              <Button
                variant="ghost"
                onClick={() => onSort("createdAt")}
                className="flex items-center gap-1.5 p-0 hover:bg-transparent text-sm font-semibold"
                aria-label="Sort by date"
              >
                Date
                {sortColumn === "createdAt" && (
                  <ArrowUpDown
                    className={`h-4 w-4 transition-transform ${
                      sortDirection === "asc" ? "rotate-180" : ""
                    }`}
                  />
                )}
              </Button>
            </TableHead>
            <TableHead className="min-w-[100px] py-3.5">Status</TableHead>
            <TableHead className="min-w-[100px] py-3.5">
              <Button
                variant="ghost"
                onClick={() => onSort("total")}
                className="flex items-center gap-1.5 p-0 hover:bg-transparent text-sm font-semibold"
                aria-label="Sort by total"
              >
                Total
                {sortColumn === "total" && (
                  <ArrowUpDown
                    className={`h-4 w-4 transition-transform ${
                      sortDirection === "asc" ? "rotate-180" : ""
                    }`}
                  />
                )}
              </Button>
            </TableHead>
            <TableHead className="w-16 text-right py-3.5">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-12">
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <Package2 className="h-12 w-12 mb-3 opacity-50" aria-hidden="true" />
                  <p className="font-medium text-lg">No orders found</p>
                  <p className="text-sm mt-1">Try adjusting your search or filter criteria</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => (
              <TableRow
                key={order.id}
                className="group hover:bg-muted/30 transition-colors duration-150"
              >
                <TableCell className="py-3.5">
                  <Checkbox
                    checked={selectedIds.has(order.id)}
                    onCheckedChange={(checked) => onSelect(order.id, checked as boolean)}
                    aria-label={`Select order ${order.id}`}
                  />
                </TableCell>
                <TableCell className="font-medium py-3.5 truncate">{order.id}</TableCell>
                <TableCell className="py-3.5 truncate">{order.customerName}</TableCell>
                <TableCell className="py-3.5">
                  {format(new Date(order.createdAt), "MMM d, yyyy")}
                </TableCell>
                <TableCell className="py-3.5">
                  <Badge
                    variant={getStatusVariant(order.status)}
                    className="text-xs"
                  >
                    <span className="capitalize">{order.status}</span>
                  </Badge>
                </TableCell>
                <TableCell className="py-3.5">{formatCurrency(order.total)}</TableCell>
                <TableCell className="text-right py-3.5">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:bg-muted rounded-lg"
                        aria-label={`Open actions for order ${order.id}`}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 rounded-lg">
                      <DropdownMenuLabel className="text-sm font-semibold">
                        Actions
                      </DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => onView(order)}
                        className="text-sm cursor-pointer hover:bg-muted rounded-md"
                      >
                        View details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onUpdateStatus(order)}
                        className="text-sm cursor-pointer hover:bg-muted rounded-md"
                      >
                        Update status
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onCancel(order)}
                        className="text-destructive text-sm cursor-pointer hover:bg-destructive/10 rounded-md"
                      >
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

interface BulkActionsProps {
  selectedCount: number;
  onExport: () => void;
  onCancel: () => void;
  isCancelling: boolean;
}

const BulkActions = ({ selectedCount, onExport, onCancel, isCancelling }: BulkActionsProps) => (
  <div className="flex gap-2 animate-fade-in">
    <Button
      variant="outline"
      size="sm"
      onClick={onExport}
      className="h-9 px-4 text-sm transition-all duration-200 hover:bg-primary/10"
      aria-label={`Export ${selectedCount} selected orders as CSV`}
      disabled={isCancelling}
    >
      <Download className="h-4 w-4 mr-2" />
      Export ({selectedCount})
    </Button>
    <Button
      variant="destructive"
      size="sm"
      onClick={onCancel}
      className="h-9 px-4 text-sm transition-all duration-200"
      aria-label={`Cancel ${selectedCount} selected orders`}
      disabled={isCancelling}
    >
      {isCancelling ? (
        <span className="animate-pulse">Cancelling...</span>
      ) : (
        <>
          <XCircle className="h-4 w-4 mr-2" />
          Cancel ({selectedCount})
        </>
      )}
    </Button>
  </div>
);

const LoadingSkeleton = ({ isMobile }: { isMobile: boolean }) => (
  <div className="animate-pulse" aria-hidden="true">
    {isMobile ? (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-4">
            <div className="flex items-center space-x-4">
              <div className="w-6 h-6 rounded bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="h-3 bg-muted rounded w-2/3" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="rounded-lg border overflow-x-auto">
        <div className="grid grid-cols-[40px,120px,150px,120px,100px,100px,64px] gap-4 p-4 bg-muted/20">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-4 bg-muted rounded" />
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-[40px,120px,150px,120px,100px,100px,64px] gap-4 p-4 border-b last:border-0"
          >
            {Array.from({ length: 7 }).map((_, j) => (
              <div key={j} className="h-4 bg-muted rounded" />
            ))}
          </div>
        ))}
      </div>
    )}
  </div>
);

const Orders = () => {
  const [orders] = useState<Order[]>(mockOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [isLoading, setIsLoading] = useState(true);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const { isMobile, isTablet, isDesktop } = useDeviceType();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const itemsPerPage = isDesktop
    ? ITEMS_PER_PAGE.desktop
    : isTablet
    ? ITEMS_PER_PAGE.tablet
    : ITEMS_PER_PAGE.mobile;

  const handleSearch = useCallback(
    debounce((value: string) => {
      setSearchQuery(value);
      setCurrentPage(1);
      setSelectedIds(new Set());
    }, 300),
    []
  );

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
        if (aValue instanceof Date && bValue instanceof Date) {
          return sortDirection === "asc"
            ? aValue.getTime() - bValue.getTime()
            : bValue.getTime() - aValue.getTime();
        }
        return 0;
      });
    }

    return result;
  }, [orders, searchQuery, statusFilter, sortColumn, sortDirection]);

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredOrders, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const handleViewOrder = useCallback((order: Order) => {
    toast.info(`Viewing order ${order.id} details`);
  }, []);

  const handleUpdateStatus = useCallback((order: Order) => {
    toast.info(`Updating status for order ${order.id}`);
    // Add logic to open a status update modal
  }, []);

  const handleCancelOrder = useCallback((order: Order) => {
    toast.success(`Order ${order.id} has been cancelled`);
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(order.id);
      return newSet;
    });
  }, []);

  const handleSelectOrder = useCallback(
    (id: string, checked: boolean) => {
      setSelectedIds((prev) => {
        const newSet = new Set(prev);
        if (id === "all") {
          if (checked) {
            paginatedOrders.forEach((order) => newSet.add(order.id));
          } else {
            newSet.clear();
          }
        } else {
          if (checked) {
            newSet.add(id);
          } else {
            newSet.delete(id);
          }
        }
        return newSet;
      });
    },
    [paginatedOrders]
  );

  const handleExportOrders = useCallback(() => {
    if (selectedIds.size === 0) {
      toast.error("Please select at least one order to export");
      return;
    }
    try {
      const selectedOrders = orders.filter((o) => selectedIds.has(o.id));
      const csvContent = [
        ["ID", "Customer", "Date", "Status", "Total"],
        ...selectedOrders.map((o) => [
          o.id,
          `"${o.customerName.replace(/"/g, '""')}"`,
          format(new Date(o.createdAt), "MMM d, yyyy"),
          o.status,
          formatCurrency(o.total),
        ]),
      ]
        .map((row) => row.join(","))
        .join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `orders_${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
      toast.success(`${selectedIds.size} order(s) exported successfully`);
    } catch (error) {
      toast.error("Failed to export orders. Please try again.");
      console.error("Export error:", error);
    }
  }, [selectedIds, orders]);

  const handleBulkCancel = useCallback(() => {
    if (selectedIds.size === 0) {
      toast.error("Please select at least one order to cancel");
      return;
    }
    setShowCancelDialog(true);
  }, [selectedIds]);

  const confirmBulkCancel = useCallback(() => {
    setIsCancelling(true);
    setTimeout(() => {
      toast.success(`${selectedIds.size} order(s) cancelled successfully`);
      setSelectedIds(new Set());
      setIsCancelling(false);
      setShowCancelDialog(false);
    }, 800);
  }, [selectedIds]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        <header className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
            <Badge variant="info" className="text-sm px-2.5 py-0.5">
              {filteredOrders.length}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base">
            View and manage customer orders
          </p>
        </header>

        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center text-xl sm:text-2xl">
                  <Package2 className="h-6 w-6 mr-2 text-primary" aria-hidden="true" />
                  Order Management
                </CardTitle>
                <CardDescription className="text-sm sm:text-base mt-1">
                  Track, process, and export customer orders
                </CardDescription>
              </div>
              {selectedIds.size > 0 && (
                <BulkActions
                  selectedCount={selectedIds.size}
                  onExport={handleExportOrders}
                  onCancel={handleBulkCancel}
                  isCancelling={isCancelling}
                />
              )}
            </div>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 lg:px-8">
            <div className="mb-6 space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search
                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    placeholder="Search by order ID or customer..."
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 h-11 text-sm rounded-lg"
                    aria-label="Search orders"
                  />
                </div>
                <Select
                  value={statusFilter}
                  onValueChange={(value: Status) => {
                    setStatusFilter(value);
                    setCurrentPage(1);
                    setSelectedIds(new Set());
                  }}
                >
                  <SelectTrigger
                    className="w-full sm:w-48 h-11 text-sm rounded-lg"
                    aria-label="Filter by order status"
                  >
                    <Filter className="h-4 w-4 mr-2" aria-hidden="true" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status} value={status} className="capitalize text-sm">
                        {status === "all" ? "All Statuses" : status}
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
                selectedIds={selectedIds}
                onSelect={handleSelectOrder}
                onView={handleViewOrder}
                onUpdateStatus={handleUpdateStatus}
                onCancel={handleCancelOrder}
                formatCurrency={formatCurrency}
                getStatusVariant={getStatusVariant}
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
            )}
          </CardContent>

          {!isLoading && totalPages > 1 && (
            <CardFooter className="justify-center py-6">
              <Pagination className="mx-auto">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) setCurrentPage(currentPage - 1);
                      }}
                      className={`h-9 w-9 p-0 rounded-lg ${
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
                      Math.abs(page - currentPage) <= (isMobile ? 1 : 2);
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
                          className="h-9 w-9 p-0 text-sm rounded-lg hover:bg-muted"
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
                        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                      }}
                      className={`h-9 w-9 p-0 rounded-lg ${
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

        <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <AlertDialogContent className="sm:max-w-md rounded-lg">
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Cancellation</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel {selectedIds.size} order(s)? This action cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isCancelling} className="h-9 px-4">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmBulkCancel}
                disabled={isCancelling}
                className="h-9 px-4"
              >
                {isCancelling ? <span className="animate-pulse">Cancelling...</span> : "Confirm"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default Orders;