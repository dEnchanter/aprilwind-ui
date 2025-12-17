/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from 'react';
import { useCustomers } from '@/hooks/useCustomers';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  MoreHorizontal,
  Eye,
  Edit,
  UserCheck,
  Mail,
  Phone,
  MapPin,
  User,
  ExternalLink,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Separator } from '../ui/separator';
import CustomDialog from '../dialog/CustomDialog';
import CustomerForm from '../forms/CustomerForm';
import { Badge } from '../ui/badge';

interface CustomerTableProps {
  hideAddButton?: boolean;
}

const CustomerTable = ({ hideAddButton = false }: CustomerTableProps) => {
  const { data: customersResponse, isLoading } = useCustomers({ page: 1, limit: 100 });
  const customers = customersResponse?.data || [];
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Partial<Customer> | undefined>(undefined);
  const [viewSidebarOpen, setViewSidebarOpen] = useState(false);
  const [viewCustomer, setViewCustomer] = useState<any | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const toggleDialog = () => {
    setOpen(!open);
    if (open) {
      setEditCustomer(undefined);
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditCustomer(customer);
    setOpen(true);
  };

  const handleView = (customer: any) => {
    setViewCustomer(customer);
    setViewSidebarOpen(true);
  };

  const handleViewProfile = (customerId: number) => {
    router.push(`/customers/${customerId}`);
  };

  const totalPages = Math.ceil(customers.length / limit);
  const paginatedData = customers.slice((page - 1) * limit, page * limit);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {!hideAddButton && (
          <div className="flex justify-end">
            <Skeleton className="h-10 w-32" />
          </div>
        )}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="px-6 py-4 font-semibold text-gray-700">Name</TableHead>
                  <TableHead className="px-6 py-4 font-semibold text-gray-700">Email</TableHead>
                  <TableHead className="px-6 py-4 font-semibold text-gray-700">Phone</TableHead>
                  <TableHead className="px-6 py-4 font-semibold text-gray-700">Address</TableHead>
                  <TableHead className="px-6 py-4 font-semibold text-gray-700">Customer Type</TableHead>
                  <TableHead className="px-6 py-4 font-semibold text-gray-700 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="px-6 py-4"><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell className="px-6 py-4"><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell className="px-6 py-4"><Skeleton className="h-5 w-28" /></TableCell>
                    <TableCell className="px-6 py-4"><Skeleton className="h-5 w-48" /></TableCell>
                    <TableCell className="px-6 py-4"><Skeleton className="h-6 w-24" /></TableCell>
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

  if (!customers || customers.length === 0) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="rounded-full bg-gray-100 p-6 mb-4">
              <UserCheck className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No customers found</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-md">
              Start building your customer base by adding your first customer.
            </p>
          </div>
        </div>
        {!hideAddButton && (
          <CustomDialog open={open} toggleOpen={toggleDialog} dialogWidth="sm:max-w-[700px]">
            <CustomerForm closeDialog={toggleDialog} initialValues={editCustomer} />
          </CustomDialog>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Table */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50 border-b border-gray-200">
                  <TableHead className="px-6 py-4 font-semibold text-gray-700">Name</TableHead>
                  <TableHead className="px-6 py-4 font-semibold text-gray-700">Email</TableHead>
                  <TableHead className="px-6 py-4 font-semibold text-gray-700">Phone</TableHead>
                  <TableHead className="px-6 py-4 font-semibold text-gray-700">Address</TableHead>
                  <TableHead className="px-6 py-4 font-semibold text-gray-700">Customer Type</TableHead>
                  <TableHead className="px-6 py-4 font-semibold text-gray-700 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((customer: any) => (
                  <TableRow
                    key={customer.id}
                    className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                  >
                    <TableCell className="px-6 py-4">
                      <div className="font-medium text-gray-900">{customer.name}</div>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-gray-600">{customer.email || 'N/A'}</TableCell>
                    <TableCell className="px-6 py-4 text-gray-600">{customer.phone || 'N/A'}</TableCell>
                    <TableCell className="px-6 py-4 text-gray-600">{customer.address || 'N/A'}</TableCell>
                    <TableCell className="px-6 py-4">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {customer.customerType?.type || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-gray-100"
                          >
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleView(customer)}
                            className="cursor-pointer"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Quick View
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleViewProfile(customer.id)}
                            className="cursor-pointer"
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEdit(customer)}
                            className="cursor-pointer"
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span className="text-sm text-gray-600">entries</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      {!hideAddButton && (
        <CustomDialog open={open} toggleOpen={toggleDialog} dialogWidth="sm:max-w-[700px]">
          <CustomerForm closeDialog={toggleDialog} initialValues={editCustomer} />
        </CustomDialog>
      )}

      {/* View Details Sidebar */}
      <Sheet open={viewSidebarOpen} onOpenChange={setViewSidebarOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Customer Details</SheetTitle>
            <SheetDescription>View customer information</SheetDescription>
          </SheetHeader>
          {viewCustomer && (
            <div className="mt-6 space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="h-4 w-4 text-brand-600" />
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">{viewCustomer.name}</p>
                    </div>
                  </div>

                  {viewCustomer.email && (
                    <>
                      <Separator />
                      <div className="flex items-start gap-3">
                        <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium">{viewCustomer.email}</p>
                        </div>
                      </div>
                    </>
                  )}

                  {viewCustomer.phone && (
                    <>
                      <Separator />
                      <div className="flex items-start gap-3">
                        <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="font-medium">{viewCustomer.phone}</p>
                        </div>
                      </div>
                    </>
                  )}

                  {viewCustomer.address && (
                    <>
                      <Separator />
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Address</p>
                          <p className="font-medium">{viewCustomer.address}</p>
                        </div>
                      </div>
                    </>
                  )}

                  {viewCustomer.country && (
                    <>
                      <Separator />
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Country</p>
                          <p className="font-medium">{viewCustomer.country}</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <Separator />

              {/* Customer Type & Registration */}
              <div>
                <h3 className="font-semibold mb-3">Customer Details</h3>
                <div className="space-y-2 text-sm">
                  {viewCustomer.customerType?.type && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Type:</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {viewCustomer.customerType.type}
                      </Badge>
                    </div>
                  )}
                  {viewCustomer.createdAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Customer Since:</span>
                      <span className="font-medium">{formatDate(viewCustomer.createdAt)}</span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={() => handleViewProfile(viewCustomer.id)}
                  className="flex-1 bg-gradient-to-r from-brand-600 to-brand-700 text-white hover:from-brand-700 hover:to-brand-800"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Full Profile
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default CustomerTable;
