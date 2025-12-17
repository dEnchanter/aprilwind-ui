/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useState, useCallback, useMemo } from "react";
import { Search, Package, CheckCircle, XCircle, TrendingUp, Layers } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { useProductStock, useDeleteProductStock } from "@/hooks/useProductStock";
import { useCreateInvoice, useGenerateInvoiceNumber } from "@/hooks/useInvoices";
import { useCustomers } from "@/hooks/useCustomers";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ProductStockTable } from "@/components/tables/ProductStockTable";
import { Skeleton } from "@/components/ui/skeleton";
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

export default function ProductStockPage() {
  const [page, setPage] = useState(1);
  const [filterTab, setFilterTab] = useState<'all' | 'available' | 'sold'>('all');
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteStock, setDeleteStock] = useState<any | null>(null);
  const [markAsSoldStock, setMarkAsSoldStock] = useState<any | null>(null);
  const [limit, setLimit] = useState(20);

  // Sale dialog fields
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [salePrice, setSalePrice] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [saleNotes, setSaleNotes] = useState<string>("");

  const { data: stockResponse, isLoading } = useProductStock({ page: 1, limit: 100 });
  const { data: customersResponse } = useCustomers({ page: 1, limit: 100 });
  const deleteStockMutation = useDeleteProductStock();
  const createInvoiceMutation = useCreateInvoice();
  const generateInvoiceNumberMutation = useGenerateInvoiceNumber();
  const currentUser = useCurrentUser();

  const customers = customersResponse?.data || [];

  const allStocks = stockResponse?.data || [];

  const handleEdit = useCallback((stock: any) => {
    // TODO: Implement edit functionality
    console.log('Edit stock:', stock);
  }, []);

  const handleDelete = useCallback((stock: any) => {
    setDeleteStock(stock);
  }, []);

  const handleMarkAsSold = useCallback((stock: any) => {
    setMarkAsSoldStock(stock);
  }, []);

  const confirmDelete = () => {
    if (deleteStock?.id) {
      deleteStockMutation.mutate(deleteStock.id, {
        onSuccess: () => {
          setDeleteStock(null);
        },
      });
    }
  };

  const confirmMarkAsSold = async () => {
    const customerIdNum = parseInt(selectedCustomerId);
    const salePriceNum = parseFloat(salePrice);

    if (!markAsSoldStock?.id || !selectedCustomerId || !customerIdNum || !salePriceNum) {
      return;
    }

    try {
      // Step 1: Generate invoice number
      const invoiceNumberResponse = await generateInvoiceNumberMutation.mutateAsync();
      const invoiceNo = invoiceNumberResponse?.invoiceNo || `INV-${Date.now()}`;

      // Step 2: Create invoice with product stock details
      const invoiceData = {
        invoiceNo,
        customerId: customerIdNum,
        generatedById: currentUser.staffId || 1,
        items: [  // API expects an array of invoice items
          {
            productStockId: markAsSoldStock.id,
            quantity: 1,  // Always 1 for product stock sales
            unitPrice: salePriceNum,
          }
        ],
        paymentMethod: paymentMethod || 'cash',
        notes: saleNotes || undefined,
      };

      createInvoiceMutation.mutate(invoiceData, {
        onSuccess: () => {
          setMarkAsSoldStock(null);
          setSelectedCustomerId("");
          setSalePrice("");
          setPaymentMethod("cash");
          setSaleNotes("");
        },
      });
    } catch (error) {
      console.error('Error creating sale:', error);
    }
  };

  // Get data based on filter tab
  const getActiveData = () => {
    switch (filterTab) {
      case "available":
        return allStocks.filter((s: any) => s.isAvailable === true);
      case "sold":
        return allStocks.filter((s: any) => s.isAvailable === false);
      default:
        return allStocks;
    }
  };

  const filteredData = getActiveData();

  // Apply search filter
  const searchFilteredData = searchTerm
    ? filteredData.filter((stock: any) =>
        stock.productionCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.productInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.productDef?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : filteredData;

  // Calculate stats
  const stats = useMemo(() => {
    const totalStock = allStocks.length;
    const availableStock = allStocks.filter((s: any) => s.isAvailable === true).length;
    const soldStock = allStocks.filter((s: any) => s.isAvailable === false).length;
    const availablePercentage = totalStock > 0 ? Math.round((availableStock / totalStock) * 100) : 0;

    return [
      {
        title: "Total Stock",
        value: totalStock,
        icon: Layers,
        color: "blue",
        bgColor: "bg-blue-50",
        iconColor: "text-blue-600",
      },
      {
        title: "Available",
        value: availableStock,
        icon: CheckCircle,
        color: "green",
        bgColor: "bg-green-50",
        iconColor: "text-green-600",
      },
      {
        title: "Sold",
        value: soldStock,
        icon: XCircle,
        color: "gray",
        bgColor: "bg-gray-50",
        iconColor: "text-gray-600",
      },
      {
        title: "Availability",
        value: `${availablePercentage}%`,
        icon: TrendingUp,
        color: "brand",
        bgColor: "bg-brand-50",
        iconColor: "text-brand-600",
      },
    ];
  }, [allStocks]);

  return (
    <div className="container mx-auto px-4 lg:px-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Product Stock</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and track your finished product inventory
          </p>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card className="border-0 shadow-md hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        {stat.title}
                      </p>
                      {isLoading ? (
                        <Skeleton className="h-8 w-20" />
                      ) : (
                        <p className="text-3xl font-bold text-gray-900">
                          {stat.value}
                        </p>
                      )}
                    </div>
                    <div className={`${stat.bgColor} p-3 rounded-xl`}>
                      <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="border-0 shadow-md bg-gradient-to-br from-white to-gray-50">
          <CardContent className="p-6">
            <div className="flex flex-col space-y-4">
              {/* Filter Label */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Package className="h-4 w-4 text-brand-600" />
                  Filter by Status
                </h3>
                {/* Search */}
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by production code or product..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white border-gray-200 focus:border-brand-500 focus:ring-brand-500 shadow-sm"
                  />
                </div>
              </div>

              {/* Filter Tabs */}
              <Tabs
                value={filterTab}
                onValueChange={(value: any) => {
                  setFilterTab(value);
                  setPage(1);
                }}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-3 bg-white border border-gray-200 p-1.5 h-auto rounded-lg shadow-sm">
                  <TabsTrigger
                    value="all"
                    className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-brand-600 data-[state=active]:to-brand-700 data-[state=active]:text-white data-[state=active]:shadow-md gap-2 py-3 px-4 rounded-md transition-all duration-200"
                  >
                    <Layers className="h-4 w-4" />
                    <div className="flex flex-col items-start">
                      <span className="font-medium text-xs sm:text-sm">All Stock</span>
                      {!isLoading && allStocks.length > 0 && (
                        <span className="text-[10px] sm:text-xs opacity-80">
                          {allStocks.length} items
                        </span>
                      )}
                    </div>
                  </TabsTrigger>
                  <TabsTrigger
                    value="available"
                    className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:shadow-md gap-2 py-3 px-4 rounded-md transition-all duration-200"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <div className="flex flex-col items-start">
                      <span className="font-medium text-xs sm:text-sm">Available</span>
                      {!isLoading && (
                        <span className="text-[10px] sm:text-xs opacity-80">
                          {allStocks.filter((s: any) => s.isAvailable === true).length} available
                        </span>
                      )}
                    </div>
                  </TabsTrigger>
                  <TabsTrigger
                    value="sold"
                    className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-gray-500 data-[state=active]:to-gray-600 data-[state=active]:text-white data-[state=active]:shadow-md gap-2 py-3 px-4 rounded-md transition-all duration-200"
                  >
                    <XCircle className="h-4 w-4" />
                    <div className="flex flex-col items-start">
                      <span className="font-medium text-xs sm:text-sm">Sold</span>
                      {!isLoading && (
                        <span className="text-[10px] sm:text-xs opacity-80">
                          {allStocks.filter((s: any) => s.isAvailable === false).length} sold
                        </span>
                      )}
                    </div>
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Active Filter Indicator */}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="h-1.5 w-1.5 rounded-full bg-brand-600"></div>
                <span>
                  Showing {searchFilteredData.length} of {filteredData.length} product stock items
                  {searchTerm && ` matching "${searchTerm}"`}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Product Stock Table */}
      <ProductStockTable
        data={searchFilteredData}
        isLoading={isLoading}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={setLimit}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onMarkAsSold={handleMarkAsSold}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteStock} onOpenChange={() => setDeleteStock(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product Stock</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this product stock entry? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteStockMutation.isPending}
            >
              {deleteStockMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Sale/Invoice Dialog */}
      <AlertDialog open={!!markAsSoldStock} onOpenChange={() => {
        setMarkAsSoldStock(null);
        setSelectedCustomerId("");
        setSalePrice("");
        setPaymentMethod("cash");
        setSaleNotes("");
      }}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Create Sale</AlertDialogTitle>
            <AlertDialogDescription>
              Record the sale of this product by creating an invoice.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {markAsSoldStock && (
            <div className="space-y-4 py-4">
              {/* Product Info */}
              <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                <p className="text-sm font-medium text-gray-900">
                  {markAsSoldStock.productInfo?.name}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Size {markAsSoldStock.productInfo?.size} • {markAsSoldStock.productionCode}
                </p>
              </div>

              {/* Customer Selection */}
              <div className="space-y-2">
                <Label htmlFor="customer-select">Customer *</Label>
                <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                  <SelectTrigger id="customer-select">
                    <SelectValue placeholder="Select customer..." />
                  </SelectTrigger>
                  <SelectContent>
                    {customers && customers.length > 0 ? (
                      customers.map((customer: any) => (
                        <SelectItem key={customer.id} value={String(customer.id)}>
                          {customer.name || customer.customerName} - {customer.email || customer.phoneNumber}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-xs text-gray-500 text-center">No customers available</div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Sale Price */}
              <div className="space-y-2">
                <Label htmlFor="sale-price">Sale Price *</Label>
                <Input
                  id="sale-price"
                  type="number"
                  step="0.01"
                  placeholder="Enter sale price..."
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                />
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <Label htmlFor="payment-method">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger id="payment-method">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="sale-notes">Notes (Optional)</Label>
                <Input
                  id="sale-notes"
                  placeholder="Add any additional notes..."
                  value={saleNotes}
                  onChange={(e) => setSaleNotes(e.target.value)}
                />
              </div>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmMarkAsSold}
              className="bg-green-600 hover:bg-green-700"
              disabled={!selectedCustomerId || !salePrice || createInvoiceMutation.isPending}
            >
              {createInvoiceMutation.isPending ? 'Creating Sale...' : 'Complete Sale'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
