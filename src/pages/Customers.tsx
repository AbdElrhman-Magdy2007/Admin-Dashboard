
import { useState, useMemo, useEffect } from "react";
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
import { Search, Filter, Eye, Edit, Trash2, Check, X, ChevronDown, Users } from "lucide-react";
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
  SelectValue 
} from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useIsMobile, useDeviceType } from "@/hooks/use-mobile";
import { toast } from "sonner";

const Customers = () => {
  const [customers] = useState<Customer[]>(mockCustomers);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const { isMobile, isTablet, isDesktop } = useDeviceType();
  
  const itemsPerPage = isDesktop ? 7 : 5;

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Status options
  const statusOptions = ["all", "active", "inactive"];

  // Determine if a customer is active or not based on their order count
  const getCustomerStatus = (customer: Customer): "active" | "inactive" => {
    return customer.totalOrders > 0 ? "active" : "inactive";
  };

  // Filter customers based on search query and status
  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      const matchesSearch = 
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = 
        statusFilter === "all" || 
        getCustomerStatus(customer) === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [customers, searchQuery, statusFilter]);

  // Paginate customers
  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredCustomers.slice(startIndex, endIndex);
  }, [filteredCustomers, currentPage, itemsPerPage]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

  // Function to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Handle view customer
  const handleViewCustomer = (customer: Customer) => {
    toast.info(`Viewing ${customer.name}'s profile`);
  };

  // Handle edit customer
  const handleEditCustomer = (customer: Customer) => {
    toast.info(`Editing ${customer.name}'s information`);
  };

  // Handle delete customer
  const handleDeleteCustomer = (customer: Customer) => {
    toast.success(`${customer.name} has been removed`);
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="animate-pulse">
      {isMobile ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border rounded-lg p-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <div className="grid grid-cols-7 gap-3 p-4 bg-muted/40">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
            ))}
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="grid grid-cols-7 gap-3 p-4 border-b last:border-0">
              {Array.from({ length: 7 }).map((_, j) => (
                <div key={j} className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
            <Badge variant="info" className="ml-2">{filteredCustomers.length}</Badge>
          </div>
          <p className="text-muted-foreground">
            Manage your customer information and history.
          </p>
        </div>

        <Card className="overflow-hidden">
          <CardHeader className="space-y-0 pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  <span>Customer Management</span>
                </CardTitle>
                <CardDescription>
                  View and manage your customer base.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filter and Search Section */}
            <div className="mb-6 space-y-3">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search customers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[180px] flex gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status} className="capitalize">
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isLoading ? (
              <LoadingSkeleton />
            ) : (
              <>
                {/* Desktop and Tablet View */}
                {!isMobile && (
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[80px]">Avatar</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead className="hidden md:table-cell">Joined</TableHead>
                          <TableHead className="hidden lg:table-cell">Orders</TableHead>
                          <TableHead className="hidden lg:table-cell">Spent</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-[120px] text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedCustomers.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8">
                              <div className="flex flex-col items-center justify-center text-muted-foreground">
                                <Users className="h-10 w-10 mb-2 opacity-20" />
                                <p>No customers found.</p>
                                <p className="text-sm">Try adjusting your search or filter.</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          paginatedCustomers.map((customer) => (
                            <TableRow key={customer.id} className="animate-fade-in group">
                              <TableCell>
                                <Avatar>
                                  <AvatarImage src={customer.avatar} alt={customer.name} />
                                  <AvatarFallback>{getInitials(customer.name)}</AvatarFallback>
                                </Avatar>
                              </TableCell>
                              <TableCell className="font-medium">{customer.name}</TableCell>
                              <TableCell>{customer.email}</TableCell>
                              <TableCell className="hidden md:table-cell">{format(new Date(customer.createdAt), "MMM d, yyyy")}</TableCell>
                              <TableCell className="hidden lg:table-cell">{customer.totalOrders}</TableCell>
                              <TableCell className="hidden lg:table-cell">{formatCurrency(customer.totalSpent)}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={getCustomerStatus(customer) === "active" ? "success" : "secondary"}
                                  className="flex w-fit items-center gap-1"
                                >
                                  {getCustomerStatus(customer) === "active" ? (
                                    <Check className="h-3 w-3" />
                                  ) : (
                                    <X className="h-3 w-3" />
                                  )}
                                  <span className="capitalize">{getCustomerStatus(customer)}</span>
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button 
                                    variant="ghost" size="icon" 
                                    onClick={() => handleViewCustomer(customer)}
                                    title="View details"
                                    className="hover:bg-primary/10 hover:text-primary"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" size="icon" 
                                    onClick={() => handleEditCustomer(customer)}
                                    title="Edit customer"
                                    className="hover:bg-primary/10 hover:text-primary"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" size="icon" 
                                    onClick={() => handleDeleteCustomer(customer)}
                                    title="Delete customer"
                                    className="hover:bg-destructive/10 hover:text-destructive"
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
                )}

                {/* Mobile Card View */}
                {isMobile && (
                  <div className="space-y-4">
                    {paginatedCustomers.length === 0 ? (
                      <div className="border rounded-lg p-8 text-center">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <Users className="h-10 w-10 mb-2 opacity-20" />
                          <p>No customers found.</p>
                          <p className="text-sm">Try adjusting your search or filter.</p>
                        </div>
                      </div>
                    ) : (
                      paginatedCustomers.map((customer) => (
                        <Card key={customer.id} className="animate-fade-in hover:shadow-md transition-all">
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-4">
                              <Avatar className="h-12 w-12 border">
                                <AvatarImage src={customer.avatar} alt={customer.name} />
                                <AvatarFallback>{getInitials(customer.name)}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                  <h3 className="font-semibold">{customer.name}</h3>
                                  <Badge
                                    variant={getCustomerStatus(customer) === "active" ? "success" : "secondary"}
                                    className="flex w-fit items-center gap-1"
                                  >
                                    {getCustomerStatus(customer) === "active" ? (
                                      <Check className="h-3 w-3" />
                                    ) : (
                                      <X className="h-3 w-3" />
                                    )}
                                    <span className="capitalize">{getCustomerStatus(customer)}</span>
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{customer.email}</p>
                              </div>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
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
                                variant="outline" size="sm"
                                onClick={() => handleViewCustomer(customer)}
                                className="flex items-center gap-1 hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                <span>View</span>
                              </Button>
                              <Button 
                                variant="outline" size="sm"
                                onClick={() => handleEditCustomer(customer)}
                                className="flex items-center gap-1 hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                              >
                                <Edit className="h-3.5 w-3.5" />
                                <span>Edit</span>
                              </Button>
                              <Button 
                                variant="outline" size="sm"
                                onClick={() => handleDeleteCustomer(customer)}
                                className="flex items-center gap-1 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span>Delete</span>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
          </CardContent>

          {/* Pagination Controls */}
          {!isLoading && totalPages > 1 && (
            <CardFooter>
              <Pagination className="mx-auto">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) setCurrentPage(currentPage - 1);
                      }}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <PaginationItem key={i} className={isTablet || isMobile ? (i > 0 && i < totalPages - 1 && i !== currentPage - 1 ? "hidden" : "") : ""}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(i + 1);
                        }}
                        isActive={currentPage === i + 1}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                      }}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
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

export default Customers;
