/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  Receipt,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

interface InvoicesTableProps {
  data: any[];
  isLoading: boolean;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onMarkAsPaid: (invoice: any) => void;
  onCancel: (invoice: any) => void;
}

export function InvoicesTable({
  data,
  isLoading,
  page,
  limit,
  onPageChange,
  onLimitChange,
  onMarkAsPaid,
  onCancel,
}: InvoicesTableProps) {
  const [viewSidebarOpen, setViewSidebarOpen] = useState(false);
  const [viewInvoice, setViewInvoice] = useState<any | null>(null);

  const handleView = (invoice: any) => {
    setViewInvoice(invoice);
    setViewSidebarOpen(true);
  };

  const totalPages = Math.ceil(data.length / limit);
  const paginatedData = data.slice((page - 1) * limit, page * limit);

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
          <XCircle className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      );
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="px-6 py-4 font-semibold text-gray-700">Invoice No</TableHead>
                  <TableHead className="px-6 py-4 font-semibold text-gray-700">Customer</TableHead>
                  <TableHead className="px-6 py-4 font-semibold text-gray-700">Product</TableHead>
                  <TableHead className="px-6 py-4 font-semibold text-gray-700">Amount</TableHead>
                  <TableHead className="px-6 py-4 font-semibold text-gray-700">Status</TableHead>
                  <TableHead className="px-6 py-4 font-semibold text-gray-700">Date</TableHead>
                  <TableHead className="px-6 py-4 font-semibold text-gray-700 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="px-6 py-4"><Skeleton className="h-5 w-28" /></TableCell>
                    <TableCell className="px-6 py-4"><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell className="px-6 py-4"><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell className="px-6 py-4"><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell className="px-6 py-4"><Skeleton className="h-6 w-24" /></TableCell>
                    <TableCell className="px-6 py-4"><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell className="px-6 py-4"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="rounded-full bg-gray-100 p-6 mb-4">
            <Receipt className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No invoices found</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-md">
            Invoices will appear here when products are sold to customers.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50 border-b border-gray-200">
                <TableHead className="px-6 py-4 font-semibold text-gray-700">Invoice No</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-gray-700">Customer</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-gray-700">Product</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-gray-700">Amount</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-gray-700">Status</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-gray-700">Date</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-gray-700 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((invoice) => {
                const status = invoice.status;
                const customer = invoice.customer;
                const invoiceDetails = invoice.invoiceDetails || {};

                return (
                  <TableRow
                    key={invoice.id}
                    className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                  >
                    <TableCell className="px-6 py-4">
                      <span className="font-mono font-medium text-brand-700 text-sm">
                        {invoice.invoiceNo || '-'}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-sm text-gray-900">
                          {customer?.name || customer?.customerName || `Customer #${invoice.customerId}`}
                        </span>
                        {customer?.email && (
                          <span className="text-xs text-gray-500 mt-0.5">
                            {customer.email}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-sm text-gray-900">
                          {invoiceDetails.productName || '-'}
                        </span>
                        {invoiceDetails.productSize && (
                          <span className="text-xs text-gray-500 mt-0.5">
                            Size {invoiceDetails.productSize}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <span className="font-semibold text-sm text-gray-900">
                        ₦{invoiceDetails.salePrice?.toLocaleString() || '0'}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      {getStatusBadge(status)}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-gray-600">
                      {invoiceDetails.saleDate ? formatDate(invoiceDetails.saleDate) : '-'}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel className="text-xs font-semibold text-gray-500">
                            Actions
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleView(invoice)}
                            className="cursor-pointer"
                          >
                            <Eye className="mr-2 h-4 w-4 text-gray-500" />
                            View Details
                          </DropdownMenuItem>

                          {/* Show Mark as Paid only for Pending invoices */}
                          {status?.toLowerCase() === 'pending' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => onMarkAsPaid(invoice)}
                                className="cursor-pointer text-green-700"
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Mark as Paid
                              </DropdownMenuItem>
                            </>
                          )}

                          {/* Show Cancel only for non-cancelled invoices */}
                          {status?.toLowerCase() !== 'cancelled' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => onCancel(invoice)}
                                className="text-red-600 cursor-pointer focus:text-red-600"
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Cancel Invoice
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {data && data.length > 0 && (
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 px-2 mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <p className="text-sm text-gray-600">
              Showing <span className="font-medium">{paginatedData.length}</span>
              {data.length > paginatedData.length && (
                <>
                  {" "}of <span className="font-medium">{data.length}</span>
                </>
              )}{" "}
              invoices
              {totalPages > 1 && (
                <>
                  {" "}· Page <span className="font-medium">{page}</span> of{" "}
                  <span className="font-medium">{totalPages}</span>
                </>
              )}
            </p>

            <div className="flex items-center gap-2">
              <label htmlFor="limit-select" className="text-sm text-gray-600 whitespace-nowrap">
                Items per page:
              </label>
              <select
                id="limit-select"
                value={limit}
                onChange={(e) => {
                  onLimitChange(Number(e.target.value));
                  onPageChange(1);
                }}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="hover:bg-gray-50"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              className="hover:bg-gray-50"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* View Details Sidebar */}
      <Sheet open={viewSidebarOpen} onOpenChange={setViewSidebarOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Invoice Details</SheetTitle>
            <SheetDescription>
              Complete invoice information and transaction details
            </SheetDescription>
          </SheetHeader>

          {viewInvoice ? (
            <div className="mt-6 space-y-6">
              {/* Invoice Information */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                  <Receipt className="h-4 w-4" />
                  Invoice Information
                </h3>
                <div className="space-y-2 pl-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Invoice No:</span>
                    <span className="font-mono font-medium text-brand-700">
                      {viewInvoice.invoiceNo || '-'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    {getStatusBadge(viewInvoice.status)}
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Sale Date:</span>
                    <span className="font-medium">
                      {viewInvoice.invoiceDetails?.saleDate ? formatDate(viewInvoice.invoiceDetails.saleDate) : '-'}
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Customer Information */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-gray-700">Customer Information</h3>
                <div className="space-y-2 pl-6">
                  {viewInvoice.customer ? (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-medium">{viewInvoice.customer.name || viewInvoice.customer.customerName}</span>
                      </div>
                      {viewInvoice.customer.email && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Email:</span>
                          <span className="font-medium text-xs">{viewInvoice.customer.email}</span>
                        </div>
                      )}
                      {viewInvoice.customer.phoneNumber && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Phone:</span>
                          <span className="font-medium text-xs">{viewInvoice.customer.phoneNumber}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-sm text-gray-500">Customer #{viewInvoice.customerId}</div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Product Details */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-gray-700">Product Details</h3>
                <div className="space-y-2 pl-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Product:</span>
                    <span className="font-medium">{viewInvoice.invoiceDetails?.productName || '-'}</span>
                  </div>
                  {viewInvoice.invoiceDetails?.productSize && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Size:</span>
                      <span className="font-medium">{viewInvoice.invoiceDetails.productSize}</span>
                    </div>
                  )}
                  {viewInvoice.invoiceDetails?.productionCode && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Production Code:</span>
                      <span className="font-mono text-xs">{viewInvoice.invoiceDetails.productionCode}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Sale Price:</span>
                    <span className="font-bold text-lg text-brand-700">
                      ₦{viewInvoice.invoiceDetails?.salePrice?.toLocaleString() || '0'}
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Payment Information */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-gray-700">Payment Information</h3>
                <div className="space-y-2 pl-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-medium capitalize">
                      {viewInvoice.invoiceDetails?.paymentMethod?.replace('_', ' ') || '-'}
                    </span>
                  </div>
                </div>
              </div>

              {viewInvoice.invoiceDetails?.notes && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm text-gray-700">Notes</h3>
                    <div className="pl-6">
                      <p className="text-sm text-gray-600">{viewInvoice.invoiceDetails.notes}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex justify-center items-center min-h-[400px] text-gray-500">
              No invoice selected
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
