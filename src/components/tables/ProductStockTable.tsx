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
  Box,
  CheckCircle2,
  XCircle,
  DollarSign,
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
import { PermissionGuard } from "@/components/utils/PermissionGuard";
import { PermissionPresets } from "@/utils/permissions";

interface ProductStockTableProps {
  data: any[];
  isLoading: boolean;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onMarkAsSold: (stock: any) => void;
}

export function ProductStockTable({
  data,
  isLoading,
  page,
  limit,
  onPageChange,
  onLimitChange,
  onMarkAsSold,
}: ProductStockTableProps) {
  const [viewSidebarOpen, setViewSidebarOpen] = useState(false);
  const [viewStock, setViewStock] = useState<any | null>(null);

  const handleView = (stock: any) => {
    setViewStock(stock);
    setViewSidebarOpen(true);
  };

  const totalPages = Math.ceil(data.length / limit);
  const paginatedData = data.slice((page - 1) * limit, page * limit);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="w-full rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="px-6 py-4 font-semibold text-gray-700">Production Code</TableHead>
                  <TableHead className="px-6 py-4 font-semibold text-gray-700">Product</TableHead>
                  <TableHead className="px-6 py-4 font-semibold text-gray-700">Size</TableHead>
                  <TableHead className="px-6 py-4 font-semibold text-gray-700">Quantity</TableHead>
                  <TableHead className="px-6 py-4 font-semibold text-gray-700">Status</TableHead>
                  <TableHead className="px-6 py-4 font-semibold text-gray-700">Date Added</TableHead>
                  <TableHead className="px-6 py-4 font-semibold text-gray-700 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="px-6 py-4"><Skeleton className="h-5 w-28" /></TableCell>
                    <TableCell className="px-6 py-4"><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell className="px-6 py-4"><Skeleton className="h-5 w-12" /></TableCell>
                    <TableCell className="px-6 py-4"><Skeleton className="h-12 w-24" /></TableCell>
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
            <Box className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No product stock found</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-md">
            Products will appear here when they are moved from production to stock.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50 border-b border-gray-200">
                <TableHead className="px-6 py-4 font-semibold text-gray-700">Production Code</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-gray-700">Product</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-gray-700">Size</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-gray-700">Quantity</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-gray-700">Status</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-gray-700">Date Added</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-gray-700 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((stock) => {
                const productInfo = stock.productInfo;
                const quantity = stock.quantity || 0;
                const quantitySold = stock.quantitySold || 0;
                const available = quantity - quantitySold;
                // Status should be based on available quantity, not isAvailable flag
                const isAvailable = available > 0;

                return (
                  <TableRow
                    key={stock.id}
                    className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                  >
                    <TableCell className="px-6 py-4">
                      <span className="font-mono font-medium text-brand-700 text-sm">
                        {stock.productionCode || '-'}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-sm text-gray-900">
                          {productInfo?.name || '-'}
                        </span>
                        {stock.productDef?.code && (
                          <span className="text-xs text-gray-500 mt-0.5">
                            {stock.productDef.code}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <span className="font-medium text-sm text-gray-900">
                        {productInfo?.size || '-'}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="text-gray-500">Total:</span>
                          <span className="font-semibold text-gray-900">{quantity}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="text-gray-500">Sold:</span>
                          <span className="font-medium text-gray-600">{quantitySold}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="text-gray-500">Available:</span>
                          <span className={`font-semibold ${available > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                            {available}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Badge
                        className={
                          isAvailable
                            ? "bg-green-100 text-green-800 border-green-200 hover:bg-green-100"
                            : "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100"
                        }
                      >
                        {isAvailable ? (
                          <>
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Available
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" />
                            Sold
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-gray-600">
                      {stock.dateAdded ? formatDate(stock.dateAdded) : '-'}
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
                            onClick={() => handleView(stock)}
                            className="cursor-pointer"
                          >
                            <Eye className="mr-2 h-4 w-4 text-gray-500" />
                            View Details
                          </DropdownMenuItem>

                          {/* Show Create Sale only for available items */}
                          {isAvailable && (
                            <PermissionGuard permissions={PermissionPresets.INVOICES_CREATE}>
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => onMarkAsSold(stock)}
                                  className="cursor-pointer text-green-700"
                                >
                                  <DollarSign className="mr-2 h-4 w-4" />
                                  Create Sale
                                </DropdownMenuItem>
                              </>
                            </PermissionGuard>
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
          {/* Left side - Items info and limit selector */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <p className="text-sm text-gray-600">
              Showing <span className="font-medium">{paginatedData.length}</span>
              {data.length > paginatedData.length && (
                <>
                  {" "}of <span className="font-medium">{data.length}</span>
                </>
              )}{" "}
              product stock items
              {totalPages > 1 && (
                <>
                  {" "}· Page <span className="font-medium">{page}</span> of{" "}
                  <span className="font-medium">{totalPages}</span>
                </>
              )}
            </p>

            {/* Items per page selector */}
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

          {/* Right side - Navigation buttons */}
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
            <SheetTitle>Product Stock Details</SheetTitle>
            <SheetDescription>
              View detailed information about this product stock item
            </SheetDescription>
          </SheetHeader>

          {viewStock ? (
            <div className="mt-6 space-y-6">
              {/* Product Information */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                  <Box className="h-4 w-4" />
                  Product Information
                </h3>
                <div className="space-y-2 pl-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Production Code:</span>
                    <span className="font-mono font-medium text-brand-700">
                      {viewStock.productionCode || '-'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Product Name:</span>
                    <span className="font-medium">
                      {viewStock.productInfo?.name || '-'}
                    </span>
                  </div>
                  {viewStock.productDef?.code && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Product Code:</span>
                      <span className="font-medium">{viewStock.productDef.code}</span>
                    </div>
                  )}
                  {viewStock.productDef?.cost && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Unit Cost:</span>
                      <span className="font-semibold text-green-700">
                        ₦{viewStock.productDef.cost.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {viewStock.productInfo?.size && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Size:</span>
                      <span className="font-medium">{viewStock.productInfo.size}</span>
                    </div>
                  )}
                  {viewStock.productInfo?.details && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Details:</span>
                      <span className="font-medium text-xs">{viewStock.productInfo.details}</span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Quantity Information */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-gray-700">Quantity Information</h3>
                <div className="space-y-2 pl-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Quantity:</span>
                    <span className="font-semibold text-gray-900">
                      {viewStock.quantity || 0} units
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Quantity Sold:</span>
                    <span className="font-medium text-gray-600">
                      {viewStock.quantitySold || 0} units
                    </span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                    <span className="text-gray-700 font-medium">Available:</span>
                    <span className={`font-bold text-lg ${(viewStock.quantity || 0) - (viewStock.quantitySold || 0) > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                      {(viewStock.quantity || 0) - (viewStock.quantitySold || 0)} units
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <Badge
                      className={
                        ((viewStock.quantity || 0) - (viewStock.quantitySold || 0) > 0)
                          ? "bg-green-100 text-green-700 border-green-300"
                          : "bg-gray-100 text-gray-700 border-gray-300"
                      }
                    >
                      {((viewStock.quantity || 0) - (viewStock.quantitySold || 0) > 0) ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Available
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3 mr-1" />
                          Sold Out
                        </>
                      )}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Pushed By Staff Information */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-gray-700">Pushed By</h3>
                <div className="space-y-2 pl-6">
                  {viewStock.pushedByStaff ? (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-medium">{viewStock.pushedByStaff.staffName}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium text-xs">{viewStock.pushedByStaff.email}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-medium text-xs">{viewStock.pushedByStaff.phoneNumber}</span>
                      </div>
                      {viewStock.pushedByStaff.role && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Role:</span>
                          <span className="font-medium">{viewStock.pushedByStaff.role.name}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-sm text-gray-500">User #{viewStock.pushedBy}</div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Received By Staff Information */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-gray-700">Received By</h3>
                <div className="space-y-2 pl-6">
                  {viewStock.receivedByStaff ? (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-medium">{viewStock.receivedByStaff.staffName}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium text-xs">{viewStock.receivedByStaff.email}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-medium text-xs">{viewStock.receivedByStaff.phoneNumber}</span>
                      </div>
                      {viewStock.receivedByStaff.role && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Role:</span>
                          <span className="font-medium">{viewStock.receivedByStaff.role.name}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-sm text-gray-500">User #{viewStock.receivedBy}</div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Date Information */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-gray-700">Timeline</h3>
                <div className="space-y-2 pl-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Date Added:</span>
                    <span className="font-medium">
                      {viewStock.dateAdded ? formatDate(viewStock.dateAdded) : '-'}
                    </span>
                  </div>
                </div>
              </div>

              {viewStock.notes && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm text-gray-700">Notes</h3>
                    <div className="pl-6">
                      <p className="text-sm text-gray-600">{viewStock.notes}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex justify-center items-center min-h-[400px] text-gray-500">
              No product stock selected
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
