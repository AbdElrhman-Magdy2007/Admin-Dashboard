import { useState, useMemo, useCallback, useEffect, useRef } from "react";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Check,
  X,
  Users,
  Download,
  ArrowUpDown,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { mockCustomers } from "@/data/mockData";
import { Customer } from "@/data/types";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
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
import { Checkbox } from "@/components/ui/checkbox";
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

// Constants
const ITEMS_PER_PAGE = {
  mobile: 5,
  tablet: 6,
  desktop: 7,
} as const;

const STATUS_OPTIONS = ["all", "active", "inactive"] as const;

const SORTABLE_COLUMNS = ["name", "email", "createdAt", "totalOrders", "totalSpent"] as const;

// Types
type Status = (typeof STATUS_OPTIONS)[number];
type SortColumn = (typeof SORTABLE_COLUMNS)[number];
type SortDirection = "asc" | "desc";

interface CustomerTableProps {
  customers: Customer[];
  isMobile: boolean;
  isTablet: boolean;
  selectedIds: Set<string>;
  onSelect: (id: string, checked: boolean) => void;
  onView: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
  getInitials: (name: string) => string;
  formatCurrency: (value: number) => string;
  getCustomerStatus: (customer: Customer) => Status;
  sortColumn: SortColumn | null;
  sortDirection: SortDirection;
  onSort: (column: SortColumn) => void;
}

interface BulkActionsProps {
  selectedCount: number;
  onExport: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

// Utility Functions
const getInitials = (name: string): string =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

const getCustomerStatus = (customer: Customer): Status =>
  customer.totalOrders > 0 ? "active" : "inactive";

// Reusable Components
/** Renders bulk action buttons for export and delete */
const BulkActions = ({ selectedCount, onExport, onDelete, isDeleting }: BulkActionsProps) => (
  <div className="flex gap-2 animate-fade-in">
    <Button
      variant="outline"
      size="sm"
      onClick={onExport}
      className="h-8 px-3 text-xs sm:text-sm transition-colors"
      aria-label={`Export ${selectedCount} selected customers as CSV`}
      disabled={isDeleting}
    >
      <Download className="h-4 w-4 mr-1" />
      Export ({selectedCount})
    </Button>
    <Button
      variant="destructive"
      size="sm"
      onClick={onDelete}
      className="h-8 px-3 text-xs sm:text-sm transition-colors"
      aria-label={`Delete ${selectedCount} selected customers`}
      disabled={isDeleting}
    >
      {isDeleting ? (
        <span className="animate-pulse">Deleting...</span>
      ) : (
        <>
          <Trash2 className="h-4 w-4 mr-1" />
          Delete ({selectedCount})
        </>
      )}
    </Button>
  </div>
);

/** Renders a single customer card for mobile view */
const CustomerCard = ({
  customer,
  selected,
  onSelect,
  onView,
  onEdit,
  onDelete,
  getInitials,
  formatCurrency,
  getCustomerStatus,
}: {
  customer: Customer;
  selected: boolean;
  onSelect: (id: string, checked: boolean) => void;
  onView: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
  getInitials: (name: string) => string;
  formatCurrency: (value: number) => string;
  getCustomerStatus: (customer: Customer) => Status;
}) => (
  <Card className="animate-fade-in hover:shadow-md transition-all">
    <CardContent className="p-4 sm:p-5">
      <div className="flex items-center space-x-4">
        <Checkbox
          checked={selected}
          onCheckedChange={(checked) => onSelect(customer.id, checked as boolean)}
          className="mt-1"
          aria-label={`Select ${customer.name}`}
        />
        <Avatar className="h-12 w-12 border">
          <AvatarImage src={customer.avatar} alt={customer.name} />
          <AvatarFallback>{getInitials(customer.name)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm sm:text-base">{customer.name}</h3>
            <Badge
              variant={getCustomerStatus(customer) === "active" ? "success" : "secondary"}
              className="flex items-center gap-1 text-xs sm:text-sm"
            >
              {getCustomerStatus(customer) === "active" ? (
                <Check className="h-3 w-3" />
              ) : (
                <X className="h-3 w-3" />
              )}
              <span className="capitalize">{getCustomerStatus(customer)}</span>
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">{customer.email}</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs sm:text-sm">
        <div>
          <p className="text-muted-foreground">Joined</p>
          <p>{format(new Date(customer.createdAt), "MMM d, yyyy")}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Orders</p>
          <p>{customer.totalOrders}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Spent</p>
          <p>{formatCurrency(customer.totalSpent)}</p>
        </div>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onView(customer)}
          className="h-8 px-3 text-xs sm:text-sm hover:bg-primary/10 hover:text-primary hover:border-primary/30"
          aria-label={`View ${customer.name}'s profile`}
        >
          <Eye className="h-3.5 w-3.5 mr-1" />
          View
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(customer)}
          className="h-8 px-3 text-xs sm:text-sm hover:bg-primary/10 hover:text-primary hover:border-primary/30"
          aria-label={`Edit ${customer.name}'s information`}
        >
          <Edit className="h-3.5 w-3.5 mr-1" />
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(customer)}
          className="h-8 px-3 text-xs sm:text-sm hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
          aria-label={`Delete ${customer.name}`}
        >
          <Trash2 className="h-3.5 w-3.5 mr-1" />
          Delete
        </Button>
      </div>
    </CardContent>
  </Card>
);

/** Renders the customer table for tablet/desktop view */
const CustomerTable = ({
  customers,
  isMobile,
  isTablet,
  selectedIds,
  onSelect,
  onView,
  onEdit,
  onDelete,
  getInitials,
  formatCurrency,
  getCustomerStatus,
  sortColumn,
  sortDirection,
  onSort,
}: CustomerTableProps) => {
  if (isMobile) {
    return (
      <div className="space-y-4">
        {customers.length === 0 ? (
          <div className="border rounded-lg p-8 text-center bg-muted/20">
            <div className="flex flex-col items-center justify-center text-muted-foreground">
              <Users className="h-10 w-10 mb-2 opacity-30" aria-hidden="true" />
              <p className="font-medium">No customers found</p>
              <p className="text-sm">Try adjusting your search or filter</p>
            </div>
          </div>
        ) : (
          customers.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              selected={selectedIds.has(customer.id)}
              onSelect={onSelect}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              getInitials={getInitials}
              formatCurrency={formatCurrency}
              getCustomerStatus={getCustomerStatus}
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
            <TableHead className="w-[50px] py-3">
              <Checkbox
                checked={selectedIds.size === customers.length && customers.length > 0}
                onCheckedChange={(checked) => onSelect("all", checked as boolean)}
                aria-label="Select all customers"
              />
            </TableHead>
            <TableHead className="w-[80px] py-3">Avatar</TableHead>
            <TableHead className="py-3">
              <Button
                variant="ghost"
                onClick={() => onSort("name")}
                className="flex items-center gap-1 p-0 hover:bg-transparent"
                aria-label="Sort by name"
              >
                Name
                {sortColumn === "name" && (
                  <ArrowUpDown
                    className={`h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`}
                  />
                )}
              </Button>
            </TableHead>
            <TableHead className="py-3">
              <Button
                variant="ghost"
                onClick={() => onSort("email")}
                className="flex items-center gap-1 p-0 hover:bg-transparent"
                aria-label="Sort by email"
              >
                Email
                {sortColumn === "email" && (
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
                aria-label="Sort by joined date"
              >
                Joined
                {sortColumn === "createdAt" && (
                  <ArrowUpDown
                    className={`h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`}
                  />
                )}
              </Button>
            </TableHead>
            <TableHead className="hidden xl:table-cell py-3">
              <Button
                variant="ghost"
                onClick={() => onSort("totalOrders")}
                className="flex items-center gap-1 p-0 hover:bg-transparent"
                aria-label="Sort by orders"
              >
                Orders
                {sortColumn === "totalOrders" && (
                  <ArrowUpDown
                    className={`h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`}
                  />
                )}
              </Button>
            </TableHead>
            <TableHead className="hidden xl:table-cell py-3">
              <Button
                variant="ghost"
                onClick={() => onSort("totalSpent")}
                className="flex items-center gap-1 p-0 hover:bg-transparent"
                aria-label="Sort by spent"
              >
                Spent
                {sortColumn === "totalSpent" && (
                  <ArrowUpDown
                    className={`h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`}
                  />
                )}
              </Button>
            </TableHead>
            <TableHead className="py-3">Status</TableHead>
            <TableHead className="w-[120px] text-right py-3">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8">
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <Users className="h-10 w-10 mb-2 opacity-30" aria-hidden="true" />
                  <p className="font-medium">No customers found</p>
                  <p className="text-sm">Try adjusting your search or filter</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            customers.map((customer) => (
              <TableRow
                key={customer.id}
                className="animate-fade-in group hover:bg-muted/50 transition-colors"
              >
                <TableCell className="py-3">
                  <Checkbox
                    checked={selectedIds.has(customer.id)}
                    onCheckedChange={(checked) =>
                      onSelect(customer.id, checked as boolean)
                    }
                    aria-label={`Select ${customer.name}`}
                  />
                </TableCell>
                <TableCell className="py-3">
                  <Avatar className="border h-10 w-10">
                    <AvatarImage src={customer.avatar} alt={customer.name} />
                    <AvatarFallback>{getInitials(customer.name)}</AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-medium py-3">{customer.name}</TableCell>
                <TableCell className="py-3">{customer.email}</TableCell>
                <TableCell
                  className="py-3"
                  aria-label={`Joined on ${format(new Date(customer.createdAt), "MMM d, yyyy")}`}
                >
                  {format(new Date(customer.createdAt), "MMM d, yyyy")}
                </TableCell>
                <TableCell className="hidden xl:table-cell py-3">
                  {customer.totalOrders}
                </TableCell>
                <TableCell className="hidden xl:table-cell py-3">
                  {formatCurrency(customer.totalSpent)}
                </TableCell>
                <TableCell className="py-3">
                  <Badge
                    variant={getCustomerStatus(customer) === "active" ? "success" : "secondary"}
                    className="flex w-fit items-center gap-1 text-xs sm:text-sm"
                  >
                    {getCustomerStatus(customer) === "active" ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <X className="h-3 w-3" />
                    )}
                    <span className="capitalize">{getCustomerStatus(customer)}</span>
                  </Badge>
                </TableCell>
                <TableCell className="text-right py-3">
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onView(customer)}
                      title={`View ${customer.name}'s profile`}
                      className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                      aria-label={`View ${customer.name}'s profile`}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(customer)}
                      title={`Edit ${customer.name}'s information`}
                      className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                      aria-label={`Edit ${customer.name}'s information`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(customer)}
                      title={`Delete ${customer.name}`}
                      className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                      aria-label={`Delete ${customer.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
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
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="rounded-md border overflow-hidden">
        <div className="grid grid-cols-9 gap-3 p-4 bg-muted/40">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-4 bg-muted rounded" />
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="grid grid-cols-9 gap-3 p-4 border-b last:border-0">
            {Array.from({ length: 9 }).map((_, j) => (
              <div key={j} className="h-4 bg-muted rounded" />
            ))}
          </div>
        ))}
      </div>
    )}
  </div>
);

/** Main Customers component */
const Customers = () => {
  const [customers] = useState<Customer[]>(mockCustomers);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { isMobile, isTablet, isDesktop } = useDeviceType();
  const tableRef = useRef<HTMLDivElement>(null);

  // Debug device type
  useEffect(() => {
    console.log("Device Type:", { isMobile, isTablet, isDesktop });
  }, [isMobile, isTablet, isDesktop]);

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

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
      setSelectedIds(new Set());
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

  // Filter and sort customers
  const filteredCustomers = useMemo(() => {
    let result = customers.filter((customer) => {
      const matchesSearch =
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || getCustomerStatus(customer) === statusFilter;
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
  }, [customers, searchQuery, statusFilter, sortColumn, sortDirection]);

  // Paginate customers
  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCustomers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCustomers, currentPage, itemsPerPage]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

  // Action handlers
  const handleViewCustomer = useCallback((customer: Customer) => {
    toast.info(`Viewing ${customer.name}'s profile`);
  }, []);

  const handleEditCustomer = useCallback((customer: Customer) => {
    toast.info(`Editing ${customer.name}'s information`);
  }, []);

  const handleDeleteCustomer = useCallback((customer: Customer) => {
    toast.success(`${customer.name} has been removed`);
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(customer.id);
      return newSet;
    });
  }, []);

  // Bulk action handlers
  const handleSelectCustomer = useCallback(
    (id: string, checked: boolean) => {
      setSelectedIds((prev) => {
        const newSet = new Set(prev);
        if (id === "all") {
          if (checked) {
            paginatedCustomers.forEach((customer) => newSet.add(customer.id));
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
    [paginatedCustomers]
  );

  const handleExportCustomers = useCallback(() => {
    if (selectedIds.size === 0) {
      toast.error("Please select at least one customer to export");
      return;
    }
    try {
      const selectedCustomers = customers.filter((c) => selectedIds.has(c.id));
      const csvContent = [
        ["ID", "Name", "Email", "Joined", "Orders", "Spent", "Status"],
        ...selectedCustomers.map((c) => [
          c.id,
          `"${c.name.replace(/"/g, '""')}"`, // Escape quotes
          `"${c.email.replace(/"/g, '""')}"`,
          format(new Date(c.createdAt), "MMM d, yyyy"),
          c.totalOrders,
          formatCurrency(c.totalSpent),
          getCustomerStatus(c),
        ]),
      ]
        .map((row) => row.join(","))
        .join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `customers_${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
      toast.success(`${selectedIds.size} customer(s) exported successfully`);
    } catch (error) {
      toast.error("Failed to export customers. Please try again.");
      console.error("Export error:", error);
    }
  }, [selectedIds, customers]);

  const handleBulkDelete = useCallback(() => {
    if (selectedIds.size === 0) {
      toast.error("Please select at least one customer to delete");
      return;
    }
    setShowDeleteDialog(true);
  }, [selectedIds]);

  const confirmBulkDelete = useCallback(() => {
    setIsDeleting(true);
    setTimeout(() => {
      toast.success(`${selectedIds.size} customer(s) deleted successfully`);
      setSelectedIds(new Set());
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }, 1000); // Simulate async delete
  }, [selectedIds]);

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
            <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
            <Badge variant="info" className="ml-2">
              {filteredCustomers.length}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Manage your customer information and history
          </p>
        </header>

        <Card className="overflow-hidden">
          <CardHeader className="space-y-0 pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center text-lg sm:text-xl">
                  <Users className="h-5 w-5 mr-2" aria-hidden="true" />
                  Customer Dashboard
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  View, manage, and export your customer base
                </CardDescription>
              </div>
              {selectedIds.size > 0 && (
                <BulkActions
                  selectedCount={selectedIds.size}
                  onExport={handleExportCustomers}
                  onDelete={handleBulkDelete}
                  isDeleting={isDeleting}
                />
              )}
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
                    placeholder="Search customers..."
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-9 h-10 text-sm"
                    aria-label="Search customers by name or email"
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
                    className="w-full sm:w-[180px] flex gap-2 h-10 text-sm"
                    aria-label="Filter by customer status"
                  >
                    <Filter className="h-4 w-4" aria-hidden="true" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status} value={status} className="capitalize text-sm">
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
              <div ref={tableRef}>
                <CustomerTable
                  customers={paginatedCustomers}
                  isMobile={isMobile}
                  isTablet={isTablet}
                  selectedIds={selectedIds}
                  onSelect={handleSelectCustomer}
                  onView={handleViewCustomer}
                  onEdit={handleEditCustomer}
                  onDelete={handleDeleteCustomer}
                  getInitials={getInitials}
                  formatCurrency={formatCurrency}
                  getCustomerStatus={getCustomerStatus}
                  sortColumn={sortColumn}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
              </div>
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
                        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
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

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {selectedIds.size} customer(s)? This action cannot
                be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmBulkDelete} disabled={isDeleting}>
                {isDeleting ? <span className="animate-pulse">Deleting...</span> : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default Customers;
// polished-panel-craft