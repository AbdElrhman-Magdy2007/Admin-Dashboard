import { useState, useMemo, useCallback, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
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
  ArrowUpDown,
  MoreHorizontal,
  Plus,
  Search,
  Package,
  Download,
  Trash2,
} from "lucide-react";
import { mockProducts } from "@/data/mockData";
import { Product } from "@/data/types";
import { toast } from "sonner";
import { debounce } from "lodash";
import { useDeviceType } from "@/hooks/use-mobile";

// Constants
const ITEMS_PER_PAGE = {
  mobile: 5,
  tablet: 8,
  desktop: 10,
} as const;

const SORTABLE_COLUMNS = ["name", "category", "price", "stock"] as const;

// Types
type SortColumn = (typeof SORTABLE_COLUMNS)[number];
type SortDirection = "asc" | "desc";

// Utility Functions
const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);

// Reusable Components
interface ProductCardProps {
  product: Product;
  selected: boolean;
  onSelect: (id: string, checked: boolean) => void;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  formatCurrency: (value: number) => string;
}

const ProductCard = ({
  product,
  selected,
  onSelect,
  onView,
  onEdit,
  onDelete,
  formatCurrency,
}: ProductCardProps) => (
  <Card className="hover:shadow-lg transition-all duration-200">
    <CardContent className="p-4 sm:p-5">
      <div className="flex items-center space-x-4">
        <Checkbox
          checked={selected}
          onCheckedChange={(checked) => onSelect(product.id, checked as boolean)}
          className="mt-1"
          aria-label={`Select ${product.name}`}
        />
        <div className="flex-1 space-y-1.5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-base sm:text-lg truncate">{product.name}</h3>
            <Badge
              variant={product.status === "active" ? "success" : "secondary"}
              className="flex items-center gap-1 text-xs sm:text-sm"
            >
              <span className="capitalize">{product.status}</span>
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground truncate">{product.description}</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-xs sm:text-sm">
        <div>
          <p className="text-muted-foreground">Category</p>
          <p className="font-medium">{product.category}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Stock</p>
          <p className="font-medium">{product.stock}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Price</p>
          <p className="font-medium">{formatCurrency(product.price)}</p>
        </div>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onView(product)}
          className="h-9 px-3 text-sm hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all duration-200"
          aria-label={`View ${product.name} details`}
        >
          <Package className="h-4 w-4 mr-1.5" />
          View
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(product)}
          className="h-9 px-3 text-sm hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all duration-200"
          aria-label={`Edit ${product.name}`}
        >
          <MoreHorizontal className="h-4 w-4 mr-1.5" />
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(product)}
          className="h-9 px-3 text-sm hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-all duration-200"
          aria-label={`Delete ${product.name}`}
        >
          <Trash2 className="h-4 w-4 mr-1.5" />
          Delete
        </Button>
      </div>
    </CardContent>
  </Card>
);

interface ProductTableProps {
  products: Product[];
  isMobile: boolean;
  selectedIds: Set<string>;
  onSelect: (id: string, checked: boolean) => void;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  formatCurrency: (value: number) => string;
  sortColumn: SortColumn | null;
  sortDirection: SortDirection;
  onSort: (column: SortColumn) => void;
}

const ProductTable = ({
  products,
  isMobile,
  selectedIds,
  onSelect,
  onView,
  onEdit,
  onDelete,
  formatCurrency,
  sortColumn,
  sortDirection,
  onSort,
}: ProductTableProps) => {
  if (isMobile) {
    return (
      <div className="space-y-4">
        {products.length === 0 ? (
          <div className="border rounded-lg p-8 text-center bg-muted/10">
            <div className="flex flex-col items-center justify-center text-muted-foreground">
              <Package className="h-12 w-12 mb-3 opacity-50" aria-hidden="true" />
              <p className="font-medium text-lg">No products found</p>
              <p className="text-sm mt-1">Try adjusting your search</p>
            </div>
          </div>
        ) : (
          products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              selected={selectedIds.has(product.id)}
              onSelect={onSelect}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              formatCurrency={formatCurrency}
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
                checked={selectedIds.size === products.length && products.length > 0}
                onCheckedChange={(checked) => onSelect("all", checked as boolean)}
                aria-label="Select all products"
              />
            </TableHead>
            <TableHead className="min-w-[200px] py-3.5">
              <Button
                variant="ghost"
                onClick={() => onSort("name")}
                className="flex items-center gap-1.5 p-0 hover:bg-transparent text-sm font-semibold"
                aria-label="Sort by name"
              >
                Product
                {sortColumn === "name" && (
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
                onClick={() => onSort("category")}
                className="flex items-center gap-1.5 p-0 hover:bg-transparent text-sm font-semibold"
                aria-label="Sort by category"
              >
                Category
                {sortColumn === "category" && (
                  <ArrowUpDown
                    className={`h-4 w-4 transition-transform ${
                      sortDirection === "asc" ? "rotate-180" : ""
                    }`}
                  />
                )}
              </Button>
            </TableHead>
            <TableHead className="min-w-[100px] py-3.5">
              <Button
                variant="ghost"
                onClick={() => onSort("price")}
                className="flex items-center gap-1.5 p-0 hover:bg-transparent text-sm font-semibold"
                aria-label="Sort by price"
              >
                Price
                {sortColumn === "price" && (
                  <ArrowUpDown
                    className={`h-4 w-4 transition-transform ${
                      sortDirection === "asc" ? "rotate-180" : ""
                    }`}
                  />
                )}
              </Button>
            </TableHead>
            <TableHead className="min-w-[100px] py-3.5">
              <Button
                variant="ghost"
                onClick={() => onSort("stock")}
                className="flex items-center gap-1.5 p-0 hover:bg-transparent text-sm font-semibold"
                aria-label="Sort by stock"
              >
                Stock
                {sortColumn === "stock" && (
                  <ArrowUpDown
                    className={`h-4 w-4 transition-transform ${
                      sortDirection === "asc" ? "rotate-180" : ""
                    }`}
                  />
                )}
              </Button>
            </TableHead>
            <TableHead className="min-w-[100px] py-3.5">Status</TableHead>
            <TableHead className="w-16 text-right py-3.5">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-12">
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <Package className="h-12 w-12 mb-3 opacity-50" aria-hidden="true" />
                  <p className="font-medium text-lg">No products found</p>
                  <p className="text-sm mt-1">Try adjusting your search</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => (
              <TableRow
                key={product.id}
                className="group hover:bg-muted/30 transition-colors duration-150"
              >
                <TableCell className="py-3.5">
                  <Checkbox
                    checked={selectedIds.has(product.id)}
                    onCheckedChange={(checked) => onSelect(product.id, checked as boolean)}
                    aria-label={`Select ${product.name}`}
                  />
                </TableCell>
                <TableCell className="py-3.5 max-w-[250px]">
                  <div className="font-medium truncate">{product.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{product.description}</div>
                </TableCell>
                <TableCell className="py-3.5">{product.category}</TableCell>
                <TableCell className="py-3.5">{formatCurrency(product.price)}</TableCell>
                <TableCell className="py-3.5">{product.stock}</TableCell>
                <TableCell className="py-3.5">
                  <Badge
                    variant={product.status === "active" ? "success" : "secondary"}
                    className="text-xs"
                  >
                    <span className="capitalize">{product.status}</span>
                  </Badge>
                </TableCell>
                <TableCell className="text-right py-3.5">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:bg-muted rounded-lg"
                        aria-label={`Open actions for ${product.name}`}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 rounded-lg">
                      <DropdownMenuLabel className="text-sm font-semibold">
                        Actions
                      </DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => onView(product)}
                        className="text-sm cursor-pointer hover:bg-muted rounded-md"
                      >
                        View details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onEdit(product)}
                        className="text-sm cursor-pointer hover:bg-muted rounded-md"
                      >
                        Edit product
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete(product)}
                        className="text-destructive text-sm cursor-pointer hover:bg-destructive/10 rounded-md"
                      >
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

interface BulkActionsProps {
  selectedCount: number;
  onExport: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

const BulkActions = ({ selectedCount, onExport, onDelete, isDeleting }: BulkActionsProps) => (
  <div className="flex gap-2 animate-fade-in">
    <Button
      variant="outline"
      size="sm"
      onClick={onExport}
      className="h-9 px-4 text-sm transition-all duration-200 hover:bg-primary/10"
      aria-label={`Export ${selectedCount} selected products as CSV`}
      disabled={isDeleting}
    >
      <Download className="h-4 w-4 mr-2" />
      Export ({selectedCount})
    </Button>
    <Button
      variant="destructive"
      size="sm"
      onClick={onDelete}
      className="h-9 px-4 text-sm transition-all duration-200"
      aria-label={`Delete ${selectedCount} selected products`}
      disabled={isDeleting}
    >
      {isDeleting ? (
        <span className="animate-pulse">Deleting...</span>
      ) : (
        <>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete ({selectedCount})
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
              <div className="h-3 bg-muted rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="rounded-lg border overflow-x-auto">
        <div className="grid grid-cols-[40px,200px,120px,100px,100px,100px,64px] gap-4 p-4 bg-muted/20">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-4 bg-muted rounded" />
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-[40px,200px,120px,100px,100px,100px,64px] gap-4 p-4 border-b last:border-0"
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

const Products = () => {
  const [products] = useState<Product[]>(mockProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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

  const filteredProducts = useMemo(() => {
    let result = products.filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
  }, [products, searchQuery, sortColumn, sortDirection]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handleViewProduct = useCallback((product: Product) => {
    toast.info(`Viewing ${product.name} details`);
  }, []);

  const handleEditProduct = useCallback((product: Product) => {
    toast.info(`Editing ${product.name}`);
  }, []);

  const handleDeleteProduct = useCallback((product: Product) => {
    toast.success(`${product.name} has been removed`);
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(product.id);
      return newSet;
    });
  }, []);

  const handleSelectProduct = useCallback(
    (id: string, checked: boolean) => {
      setSelectedIds((prev) => {
        const newSet = new Set(prev);
        if (id === "all") {
          if (checked) {
            paginatedProducts.forEach((product) => newSet.add(product.id));
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
    [paginatedProducts]
  );

  const handleExportProducts = useCallback(() => {
    if (selectedIds.size === 0) {
      toast.error("Please select at least one product to export");
      return;
    }
    try {
      const selectedProducts = products.filter((p) => selectedIds.has(p.id));
      const csvContent = [
        ["ID", "Name", "Description", "Category", "Price", "Stock", "Status"],
        ...selectedProducts.map((p) => [
          p.id,
          `"${p.name.replace(/"/g, '""')}"`,
          `"${p.description.replace(/"/g, '""')}"`,
          p.category,
          p.price,
          p.stock,
          p.status,
        ]),
      ]
        .map((row) => row.join(","))
        .join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `products_${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
      toast.success(`${selectedIds.size} product(s) exported successfully`);
    } catch (error) {
      toast.error("Failed to export products. Please try again.");
      console.error("Export error:", error);
    }
  }, [selectedIds, products]);

  const handleBulkDelete = useCallback(() => {
    if (selectedIds.size === 0) {
      toast.error("Please select at least one product to delete");
      return;
    }
    setShowDeleteDialog(true);
  }, [selectedIds]);

  const confirmBulkDelete = useCallback(() => {
    setIsDeleting(true);
    setTimeout(() => {
      toast.success(`${selectedIds.size} product(s) deleted successfully`);
      setSelectedIds(new Set());
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }, 800);
  }, [selectedIds]);

  const handleAddProduct = useCallback(() => {
    toast.info("Opening add product form");
    // Add logic to open a modal or navigate to a form
  }, []);

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
            <h1 className="text-3xl font-bold tracking-tight">Products</h1>
            <Badge variant="info" className="text-sm px-2.5 py-0.5">
              {filteredProducts.length}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base">
            Manage your product inventory, prices, and details
          </p>
        </header>

        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center text-xl sm:text-2xl">
                  <Package className="h-6 w-6 mr-2 text-primary" aria-hidden="true" />
                  Product Inventory
                </CardTitle>
                <CardDescription className="text-sm sm:text-base mt-1">
                  Browse, manage, and export your product catalog
                </CardDescription>
              </div>
              <div className="flex gap-3">
                {selectedIds.size > 0 && (
                  <BulkActions
                    selectedCount={selectedIds.size}
                    onExport={handleExportProducts}
                    onDelete={handleBulkDelete}
                    isDeleting={isDeleting}
                  />
                )}
                <Button
                  onClick={handleAddProduct}
                  className="h-9 px-4 text-sm"
                  aria-label="Add new product"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  placeholder="Search by name, description, or category..."
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 h-11 text-sm rounded-lg"
                  aria-label="Search products"
                />
              </div>
            </div>

            {isLoading ? (
              <LoadingSkeleton isMobile={isMobile} />
            ) : (
              <ProductTable
                products={paginatedProducts}
                isMobile={isMobile}
                selectedIds={selectedIds}
                onSelect={handleSelectProduct}
                onView={handleViewProduct}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
                formatCurrency={formatCurrency}
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

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent className="sm:max-w-md rounded-lg">
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {selectedIds.size} product(s)? This action cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting} className="h-9 px-4">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmBulkDelete}
                disabled={isDeleting}
                className="h-9 px-4"
              >
                {isDeleting ? <span className="animate-pulse">Deleting...</span> : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default Products;