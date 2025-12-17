/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useCustomer } from "@/hooks/useCustomers";
import { useCustomerInvoices } from "@/hooks/useInvoices";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Receipt,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  Eye
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

export default function CustomerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const customerId = parseInt(params.id as string);

  const [viewInvoice, setViewInvoice] = useState<any | null>(null);
  const [viewSidebarOpen, setViewSidebarOpen] = useState(false);

  // Fetch customer data
  const { data: customerData, isLoading: customerLoading } = useCustomer(customerId);
  const { data: invoicesData, isLoading: invoicesLoading } = useCustomerInvoices(customerId);

  const customer = customerData?.data || customerData;
  const invoices = invoicesData?.data || [];

  const isLoading = customerLoading;

  // Calculate stats
  const totalInvoices = invoices.length;
  const paidInvoices = invoices.filter((inv: any) => inv.status?.toLowerCase() === 'paid').length;
  const pendingInvoices = invoices.filter((inv: any) => inv.status?.toLowerCase() === 'pending').length;
  const totalSpent = invoices
    .filter((inv: any) => inv.status?.toLowerCase() === 'paid')
    .reduce((sum: number, inv: any) => sum + (inv.invoiceDetails?.salePrice || 0), 0);

  const handleViewInvoice = (invoice: any) => {
    setViewInvoice(invoice);
    setViewSidebarOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase() || '';

    if (statusLower === 'paid') {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">
          <CheckCircle className="h-3 w-3 mr-1" />
          Paid
        </Badge>
      );
    } else if (statusLower === 'cancelled') {
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-100">
          <XCircle className="h-3 w-3 mr-1" />
          Cancelled
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      );
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 lg:px-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="container mx-auto px-4 lg:px-8 space-y-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Customer not found</p>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 lg:px-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Button
          variant="ghost"
          onClick={() => router.push('/user-management')}
          className="mb-4 hover:bg-gray-100"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to User Management
        </Button>
        <div className="flex items-center gap-4">
          <div className="bg-brand-100 p-4 rounded-full">
            <User className="h-8 w-8 text-brand-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{customer.name}</h1>
            <p className="text-sm text-gray-500">Customer Profile</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold text-gray-900">₦{totalSpent.toLocaleString()}</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-xl">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{totalInvoices}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-xl">
                  <Receipt className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Paid Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{paidInvoices}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-xl">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingInvoices}</p>
                </div>
                <div className="bg-amber-50 p-3 rounded-xl">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Customer Information & Purchase History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Information */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="lg:col-span-1"
        >
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{customer.name}</p>
                </div>
              </div>

              {customer.email && (
                <>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{customer.email}</p>
                    </div>
                  </div>
                </>
              )}

              {customer.phone && (
                <>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{customer.phone}</p>
                    </div>
                  </div>
                </>
              )}

              {customer.address && (
                <>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="font-medium">{customer.address}</p>
                    </div>
                  </div>
                </>
              )}

              {customer.createdAt && (
                <>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Customer Since</p>
                      <p className="font-medium">{formatDate(customer.createdAt)}</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Purchase History */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="lg:col-span-2"
        >
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Purchase History</CardTitle>
            </CardHeader>
            <CardContent>
              {invoicesLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : invoices.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Receipt className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No purchase history</p>
                </div>
              ) : (
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.map((invoice: any) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">{invoice.invoiceNo}</TableCell>
                          <TableCell>
                            {invoice.invoiceDetails?.productName || 'N/A'}
                            {invoice.invoiceDetails?.productSize && (
                              <span className="text-xs text-gray-500 ml-1">
                                ({invoice.invoiceDetails.productSize})
                              </span>
                            )}
                          </TableCell>
                          <TableCell>₦{invoice.invoiceDetails?.salePrice?.toLocaleString() || 0}</TableCell>
                          <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {formatDate(invoice.createdAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewInvoice(invoice)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Invoice Details Sidebar */}
      <Sheet open={viewSidebarOpen} onOpenChange={setViewSidebarOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Invoice Details</SheetTitle>
            <SheetDescription>View complete invoice information</SheetDescription>
          </SheetHeader>
          {viewInvoice && (
            <div className="mt-6 space-y-6">
              {/* Invoice Info */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-brand-600" />
                  Invoice Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Invoice No:</span>
                    <span className="font-medium">{viewInvoice.invoiceNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status:</span>
                    {getStatusBadge(viewInvoice.status)}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date:</span>
                    <span className="font-medium">{formatDate(viewInvoice.createdAt)}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Product Details */}
              <div>
                <h3 className="font-semibold mb-3">Product Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Product:</span>
                    <span className="font-medium">{viewInvoice.invoiceDetails?.productName}</span>
                  </div>
                  {viewInvoice.invoiceDetails?.productSize && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Size:</span>
                      <span className="font-medium">{viewInvoice.invoiceDetails.productSize}</span>
                    </div>
                  )}
                  {viewInvoice.invoiceDetails?.productionCode && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Production Code:</span>
                      <span className="font-medium">{viewInvoice.invoiceDetails.productionCode}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Amount:</span>
                    <span className="font-bold text-lg">₦{viewInvoice.invoiceDetails?.salePrice?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Payment Info */}
              <div>
                <h3 className="font-semibold mb-3">Payment Information</h3>
                <div className="space-y-2 text-sm">
                  {viewInvoice.invoiceDetails?.paymentMethod && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Payment Method:</span>
                      <span className="font-medium capitalize">{viewInvoice.invoiceDetails.paymentMethod}</span>
                    </div>
                  )}
                  {viewInvoice.invoiceDetails?.saleDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Sale Date:</span>
                      <span className="font-medium">{formatDate(viewInvoice.invoiceDetails.saleDate)}</span>
                    </div>
                  )}
                </div>
              </div>

              {viewInvoice.invoiceDetails?.notes && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-3">Notes</h3>
                    <p className="text-sm text-gray-600">{viewInvoice.invoiceDetails.notes}</p>
                  </div>
                </>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
