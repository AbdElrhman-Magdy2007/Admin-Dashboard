
import { useState, useMemo } from "react";
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
import { Search, Filter, Eye, Edit, Trash2, Check, X, ChevronDown } from "lucide-react";
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
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";

const Customers = () => {
  const [customers] = useState<Customer[]>(mockCustomers);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const isMobile = useIsMobile();
  
  const itemsPerPage = 5;

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
  }, [filteredCustomers, currentPage]);

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

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">
            Manage your customer information and history.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Customer Management</CardTitle>
            <CardDescription>
              View and manage your customer base.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filter and Search Section */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search customers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px] flex gap-2">
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

            {/* Desktop View */}
            {!isMobile && (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Avatar</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Spent</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[120px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedCustomers.map((customer) => (
                      <TableRow key={customer.id} className="animate-fade-in">
                        <TableCell>
                          <Avatar>
                            <AvatarImage src={customer.avatar} alt={customer.name} />
                            <AvatarFallback>{getInitials(customer.name)}</AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>{customer.email}</TableCell>
                        <TableCell>{format(new Date(customer.createdAt), "MMM d, yyyy")}</TableCell>
                        <TableCell>{customer.totalOrders}</TableCell>
                        <TableCell>{formatCurrency(customer.totalSpent)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={getCustomerStatus(customer) === "active" ? "default" : "secondary"}
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
                          <div className="flex justify-end gap-1">
                            <Button 
                              variant="ghost" size="icon" 
                              onClick={() => handleViewCustomer(customer)}
                              title="View details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" size="icon" 
                              onClick={() => handleEditCustomer(customer)}
                              title="Edit customer"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" size="icon" 
                              onClick={() => handleDeleteCustomer(customer)}
                              title="Delete customer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {paginatedCustomers.length === 0 && (
                  <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
                    No customers found.
                  </div>
                )}
              </div>
            )}

            {/* Mobile Card View */}
            {isMobile && (
              <div className="space-y-4">
                {paginatedCustomers.map((customer) => (
                  <Card key={customer.id} className="animate-fade-in">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage src={customer.avatar} alt={customer.name} />
                          <AvatarFallback>{getInitials(customer.name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">{customer.name}</h3>
                            <Badge
                              variant={getCustomerStatus(customer) === "active" ? "default" : "secondary"}
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
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>View</span>
                        </Button>
                        <Button 
                          variant="outline" size="sm"
                          onClick={() => handleEditCustomer(customer)}
                          className="flex items-center gap-1"
                        >
                          <Edit className="h-3.5 w-3.5" />
                          <span>Edit</span>
                        </Button>
                        <Button 
                          variant="outline" size="sm"
                          onClick={() => handleDeleteCustomer(customer)}
                          className="flex items-center gap-1 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Delete</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {paginatedCustomers.length === 0 && (
                  <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
                    No customers found.
                  </div>
                )}
              </div>
            )}
          </CardContent>

          {/* Pagination Controls */}
          <CardFooter>
            {totalPages > 1 && (
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
                    <PaginationItem key={i}>
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
            )}
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Customers;
