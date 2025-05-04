import React from 'react';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  ArrowUpDown,
  Plus,
  Download,
  RotateCcw,
} from "lucide-react";
import { mockProducts } from "@/data/mockData";
import { Product, ProductStatus } from "@/data/types";
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
import { format } from "date-fns";

// Constants
const ITEMS_PER_PAGE = {
  mobile: 5,
  tablet: 6,
  desktop: 8,
} as const;

const STATUS_OPTIONS: (ProductStatus | "all")[] = ["all", "active", "inactive"];

// Types
type SortColumn = "name" | "category" | "price" | "stock" | "lastUpdated";
type SortDirection = "asc" | "desc";

interface ProductTableProps {
  products: Product[];
  isMobile: boolean;
  isTablet: boolean;
  sortColumn: SortColumn | null;
  sortDirection: SortDirection;
  onSort: (column: SortColumn) => void;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  formatCurrency: (value: number) => string;
  getStatusColor: (status: ProductStatus) => string;
  searchQuery: string;
}

/** Utility function to format currency */
const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);

/** Utility function to get status color classes */
const getStatusColor = (status: ProductStatus): string => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "inactive":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
  }
};

/** Utility function to highlight search matches */
const highlightText = (text: string, query: string): JSX.Element => {
  if (!query) return <span>{text}</span>;
  const parts = text.split(new RegExp(`(${query})`, "gi"));
  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-yellow-200 dark:bg-yellow-700">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
};

/** Product Form Modal for Add/Edit */
const ProductFormModal = ({
  product,
  isOpen,
  onClose,
  onSave,
}: {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
}) => {
  const [formData, setFormData] = useState<Product>(
    product || {
      id: "",
      name: "",
      description: "",
      category: "",
      price: 0,
      stock: 0,
      status: "active",
      lastUpdated: new Date().toISOString(),
    }
  );

  useEffect(() => {
    if (product) {
      setFormData(product);
    } else {
      setFormData({
        id: "",
        name: "",
        description: "",
        category: "",
        price: 0,
        stock: 0,
        status: "active",
        lastUpdated: new Date().toISOString(),
      });
    }
  }, [product]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" || name === "stock" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.category || formData.price < 0 || formData.stock < 0) {
      toast.error("Please fill all required fields correctly");
      return;
    }
    onSave({
      ...formData,
      id: formData.id || `prod_${Date.now()}`,
      lastUpdated: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-md">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "Add Product"}</DialogTitle>
          <DialogDescription>
            {product ? `Edit details for ${product.name}` : "Add a new product to the inventory"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-3">
          <div>
            <label className="text-sm font-medium">Name *</label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="h-10 text-sm"
              aria-label="Product name"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <Input
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="h-10 text-sm"
              aria-label="Product description"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Category *</label>
            <Input
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="h-10 text-sm"
              aria-label="Product category"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Price *</label>
            <Input
              name="price"
              type="number"
              value={formData.price}
              onChange={handleChange}
              className="h-10 text-sm"
              aria-label="Product price"
              min="0"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Stock *</label>
            <Input
              name="stock"
              type="number"
              value={formData.stock}
              onChange={handleChange}
              className="h-10 text-sm"
              aria-label="Product stock"
              min="0"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Status</label>
            <Select
              name="status"
              value={formData.status}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, status: value as ProductStatus }))
              }
            >
              <SelectTrigger className="h-10 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="h-8 px-3 text-sm"
            aria-label="Cancel"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="h-8 px-3 text-sm"
            aria-label="Save"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/** Delete Confirmation Dialog */
const DeleteConfirmDialog = ({
  product,
  isOpen,
  onClose,
  onConfirm,
}: {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) => (
  <AlertDialog open={isOpen} onOpenChange={onClose}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Delete Product</AlertDialogTitle>
        <AlertDialogDescription>
          Are you sure you want to delete "{product?.name}"? This action cannot be undone.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel className="h-8 px-3 text-sm">Cancel</AlertDialogCancel>
        <AlertDialogAction
          onClick={onConfirm}
          className="h-8 px-3 text-sm bg-destructive text-destructive-foreground hover:bg-destructive/90"
        >
          Delete
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

/** Renders a single product card for mobile view */
const ProductCard = ({
  product,
  onView,
  onEdit,
  onDelete,
  formatCurrency,
  getStatusColor,
  searchQuery,
}: {
  product: Product;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  formatCurrency: (value: number) => string;
  getStatusColor: (status: ProductStatus) => string;
  searchQuery: string;
}) => (
  <Card className="animate-fade-in hover:shadow-md transition-all">
    <CardContent className="p-4 sm:p-5">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm sm:text-base truncate">
            {highlightText(product.name, searchQuery)}
          </h3>
          <Badge
            variant="outline"
            className={`text-xs sm:text-sm capitalize ${getStatusColor(product.status)}`}
          >
            {product.status}
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
          <div>
            <p className="text-muted-foreground">Category</p>
            <p className="truncate">{highlightText(product.category, searchQuery)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Price</p>
            <p>{formatCurrency(product.price)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Stock</p>
            <p>{product.stock}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Last Updated</p>
            <p>{format(new Date(product.lastUpdated), "MMM d, yyyy")}</p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(product)}
            className="h-8 px-3 text-xs sm:text-sm hover:bg-primary/10 hover:text-primary"
            aria-label={`View details for product ${product.name}`}
          >
            <Eye className="h-3.5 w-3.5 mr-1" />
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(product)}
            className="h-8 px-3 text-xs sm:text-sm hover:bg-primary/10 hover:text-primary"
            aria-label={`Edit product ${product.name}`}
          >
            <Edit className="h-3.5 w-3.5 mr-1" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(product)}
            className="h-8 px-3 text-xs sm:text-sm hover:bg-destructive/10 hover:text-destructive"
            aria-label={`Delete product ${product.name}`}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            Delete
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

/** Renders the product table for tablet/desktop view */
const ProductTable = ({
  products,
  isMobile,
  isTablet,
  sortColumn,
  sortDirection,
  onSort,
  onView,
  onEdit,
  onDelete,
  formatCurrency,
  getStatusColor,
  searchQuery,
}: ProductTableProps) => {
  if (isMobile) {
    return (
      <div className="space-y-4">
        {products.length === 0 ? (
          <div className="border rounded-lg p-8 text-center bg-muted/20">
            <div className="flex flex-col items-center justify-center text-muted-foreground">
              <MoreHorizontal className="h-10 w-10 mb-2 opacity-30" aria-hidden="true" />
              <p className="font-medium">No products found</p>
              <p className="text-sm">Try adjusting your search or filter</p>
            </div>
          </div>
        ) : (
          products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              formatCurrency={formatCurrency}
              getStatusColor={getStatusColor}
              searchQuery={searchQuery}
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
                onClick={() => onSort("name")}
                className="flex items-center gap-1 p-0 hover:bg-transparent"
                aria-label="Sort by product name"
              >
                Product
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
                onClick={() => onSort("category")}
                className="flex items-center gap-1 p-0 hover:bg-transparent"
                aria-label="Sort by category"
              >
                Category
                {sortColumn === "category" && (
                  <ArrowUpDown
                    className={`h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`}
                  />
                )}
              </Button>
            </TableHead>
            <TableHead className="py-3">
              <Button
                variant="ghost"
                onClick={() => onSort("price")}
                className="flex items-center gap-1 p-0 hover:bg-transparent"
                aria-label="Sort by price"
              >
                Price
                {sortColumn === "price" && (
                  <ArrowUpDown
                    className={`h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`}
                  />
                )}
              </Button>
            </TableHead>
            <TableHead className="py-3">
              <Button
                variant="ghost"
                onClick={() => onSort("stock")}
                className="flex items-center gap-1 p-0 hover:bg-transparent"
                aria-label="Sort by stock"
              >
                Stock
                {sortColumn === "stock" && (
                  <ArrowUpDown
                    className={`h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`}
                  />
                )}
              </Button>
            </TableHead>
            <TableHead className="py-3 hidden md:table-cell">
              <Button
                variant="ghost"
                onClick={() => onSort("lastUpdated")}
                className="flex items-center gap-1 p-0 hover:bg-transparent"
                aria-label="Sort by last updated"
              >
                Last Updated
                {sortColumn === "lastUpdated" && (
                  <ArrowUpDown
                    className={`h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`}
                  />
                )}
              </Button>
            </TableHead>
            <TableHead className="py-3 hidden md:table-cell">Status</TableHead>
            <TableHead className="w-[80px] text-right py-3">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8">
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <MoreHorizontal
                    className="h-10 w-10 mb-2 opacity-30"
                    aria-hidden="true"
                  />
                  <p className="font-medium">No products found</p>
                  <p className="text-sm">Try adjusting your search or filter</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => (
              <TableRow
                key={product.id}
                className="animate-fade-in group hover:bg-muted/50 transition-colors"
              >
                <TableCell className="font-medium py-3 max-w-[150px] sm:max-w-[200px] truncate">
                  {highlightText(product.name, searchQuery)}
                </TableCell>
                <TableCell className="py-3">
                  {highlightText(product.category, searchQuery)}
                </TableCell>
                <TableCell className="py-3">{formatCurrency(product.price)}</TableCell>
                <TableCell className="py-3">{product.stock}</TableCell>
                <TableCell className="py-3 hidden md:table-cell">
                  {format(new Date(product.lastUpdated), "MMM d, yyyy")}
                </TableCell>
                <TableCell className="py-3 hidden md:table-cell">
                  <Badge
                    variant="outline"
                    className={`text-xs sm:text-sm capitalize ${getStatusColor(product.status)}`}
                  >
                    {product.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right py-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        aria-label={`Open actions for product ${product.name}`}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => onView(product)}
                        className="flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        View details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onEdit(product)}
                        className="flex items-center gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Edit product
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete(product)}
                        className="flex items-center gap-2 text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete product
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
              <div className="h-3 bg-muted rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="rounded-md border overflow-hidden">
        <div className="grid grid-cols-7 gap-3 p-4 bg-muted/40">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-4 bg-muted rounded" />
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="grid grid-cols-7 gap-3 p-4 border-b last:border-0">
            {Array.from({ length: 7 }).map((_, j) => (
              <div key={j} className="h-4 bg-muted rounded" />
            ))}
          </div>
        ))}
      </div>
    )}
  </div>
);

/** Main Products component */
const Products = () => {
  const [products, setProducts] = useState<Product[]>(
    mockProducts.map((p) => ({
      ...p,
      lastUpdated: p.lastUpdated || new Date().toISOString(),
    }))
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProductStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
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

  // Get unique categories
  const categories = useMemo(
    () => ["all", ...new Set(products.map((p) => p.category))],
    [products]
  );

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

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower) ||
        product.category.toLowerCase().includes(searchLower);
      const matchesStatus = statusFilter === "all" || product.status === statusFilter;
      const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });

    if (sortColumn) {
      result = [...result].sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];
        if (sortColumn === "lastUpdated") {
          return sortDirection === "asc"
            ? new Date(aValue).getTime() - new Date(bValue).getTime()
            : new Date(bValue).getTime() - new Date(aValue).getTime();
        }
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
  }, [products, searchQuery, statusFilter, categoryFilter, sortColumn, sortDirection]);

  // Paginate products
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Quick stats
  const quickStats = useMemo(
    () => ({
      totalProducts: filteredProducts.length,
      activeProducts: filteredProducts.filter((p) => p.status === "active").length,
      inventoryValue: filteredProducts.reduce(
        (sum, p) => sum + p.price * p.stock,
        0
      ),
    }),
    [filteredProducts]
  );

  // Action handlers
  const handleViewProduct = useCallback((product: Product) => {
    toast.info(`Viewing details for product: ${product.name}`, { duration: 2000 });
  }, []);

  const handleEditProduct = useCallback((product: Product) => {
    setEditProduct(product);
  }, []);

  const handleDeleteProduct = useCallback((product: Product) => {
    setDeleteProduct(product);
  }, []);

  const confirmDeleteProduct = useCallback(() => {
    if (deleteProduct) {
      setProducts((prev) => prev.filter((p) => p.id !== deleteProduct.id));
      toast.success(`Product "${deleteProduct.name}" has been deleted`, {
        duration: 2000,
      });
      setDeleteProduct(null);
    }
  }, [deleteProduct]);

  const handleAddProduct = useCallback(() => {
    setShowAddModal(true);
  }, []);

  const handleSaveProduct = useCallback((updatedProduct: Product) => {
    setProducts((prev) => {
      if (prev.some((p) => p.id === updatedProduct.id)) {
        return prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p));
      }
      return [...prev, updatedProduct];
    });
    toast.success(
      updatedProduct.id.startsWith("prod_")
        ? `Product "${updatedProduct.name}" added successfully`
        : `Product "${updatedProduct.name}" updated successfully`,
      { duration: 2000 }
    );
  }, []);

  const handleExportProducts = useCallback(() => {
    try {
      const csvContent = [
        ["ID", "Name", "Description", "Category", "Price", "Stock", "Status", "Last Updated"],
        ...filteredProducts.map((p) => [
          p.id,
          `"${p.name.replace(/"/g, '""')}"`,
          `"${p.description.replace(/"/g, '""')}"`,
          p.category,
          p.price,
          p.stock,
          p.status,
          format(new Date(p.lastUpdated), "yyyy-MM-dd"),
        ]),
      ]
        .map((row) => row.join(","))
        .join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `products_${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
      toast.success(`${filteredProducts.length} product(s) exported successfully`, {
        duration: 2000,
      });
    } catch (error) {
      toast.error("Failed to export products. Please try again.", { duration: 2000 });
      console.error("Export error:", error);
    }
  }, [filteredProducts]);

  const handleResetFilters = useCallback(() => {
    setSearchQuery("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setCurrentPage(1);
    toast.info("Filters and search reset", { duration: 1500 });
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
            <h1 className="text-2xl font-bold tracking-tight">Products</h1>
            <Badge variant="info" className="ml-2">
              {filteredProducts.length}
            </Badge>
          </div>
          <p className="text-muted-foreground">View and manage product inventory</p>
        </header>

        <Card className="overflow-hidden">
          <CardHeader className="space-y-0 pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center text-lg sm:text-xl">
                  <MoreHorizontal className="h-5 w-5 mr-2" aria-hidden="true" />
                  Product Management
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Track and manage your product catalog
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleAddProduct}
                  className="h-8 px-3 text-sm"
                  aria-label="Add new product"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Product
                </Button>
                <Button
                  variant="outline"
                  onClick={handleExportProducts}
                  className="h-8 px-3 text-sm"
                  aria-label="Export products as CSV"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            {/* Quick Stats */}
            <div className="mb-4 flex flex-wrap gap-2">
              <Badge variant="secondary" className="px-3 py-1 text-sm">
                Total Products: {quickStats.totalProducts}
              </Badge>
              <Badge variant="secondary" className="px-3 py-1 text-sm">
                Active Products: {quickStats.activeProducts}
              </Badge>
              <Badge variant="secondary" className="px-3 py-1 text-sm">
                Inventory Value: {formatCurrency(quickStats.inventoryValue)}
              </Badge>
            </div>

            {/* Filter and Search Section */}
            <div className="mb-6 space-y-4 sm:space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search
                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-9 h-10 text-sm"
                    aria-label="Search products by name, description, or category"
                  />
                </div>
                <Select
                  value={statusFilter}
                  onValueChange={(value: ProductStatus | "all") => {
                    setStatusFilter(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger
                    className="w-full sm:w-[180px] flex gap-2 h-10 text-sm"
                    aria-label="Filter by product status"
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
                <Select
                  value={categoryFilter}
                  onValueChange={(value: string) => {
                    setCategoryFilter(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger
                    className="w-full sm:w-[180px] flex gap-2 h-10 text-sm"
                    aria-label="Filter by product category"
                  >
                    <Filter className="h-4 w-4" aria-hidden="true" />
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem
                        key={category}
                        value={category}
                        className="capitalize text-sm"
                      >
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={handleResetFilters}
                  className="h-10 px-3 text-sm"
                  aria-label="Reset filters and search"
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Reset
                </Button>
              </div>
            </div>

            {isLoading ? (
              <LoadingSkeleton isMobile={isMobile} />
            ) : (
              <ProductTable
                products={paginatedProducts}
                isMobile={isMobile}
                isTablet={isTablet}
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
                onView={handleViewProduct}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
                formatCurrency={formatCurrency}
                getStatusColor={getStatusColor}
                searchQuery={searchQuery}
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

        <ProductFormModal
          product={editProduct}
          isOpen={showAddModal || !!editProduct}
          onClose={() => {
            setShowAddModal(false);
            setEditProduct(null);
          }}
          onSave={handleSaveProduct}
        />

        <DeleteConfirmDialog
          product={deleteProduct}
          isOpen={!!deleteProduct}
          onClose={() => setDeleteProduct(null)}
          onConfirm={confirmDeleteProduct}
        />
      </div>
    </DashboardLayout>
  );
};

export default Products;