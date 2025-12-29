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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MoreHorizontal,
  Eye,
  Edit,
  Users,
  Trash2,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useCustomerType, useDeleteCustomerType } from "@/hooks/useCustomerType";
import CustomDialog from "../dialog/CustomDialog";
import CustomerTypeForm from "../forms/CustomerTypeForm";

interface CustomerTypeTableProps {
  hideAddButton?: boolean;
}

const CustomerTypeTable = ({ hideAddButton = false }: CustomerTypeTableProps) => {
  const { data: customerTypes, isLoading, isError, refetch } = useCustomerType();
  const deleteCustomerTypeMutation = useDeleteCustomerType();

  const [open, setOpen] = useState(false);
  const [editCustomerType, setEditCustomerType] = useState<Partial<CustomerType> | undefined>(undefined);
  const [viewSidebarOpen, setViewSidebarOpen] = useState(false);
  const [viewCustomerType, setViewCustomerType] = useState<CustomerType | null>(null);
  const [deleteCustomerType, setDeleteCustomerType] = useState<CustomerType | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const toggleDialog = () => {
    setOpen(!open);
    if (open) {
      setEditCustomerType(undefined);
    }
  };

  const handleView = (customerType: CustomerType) => {
    setViewCustomerType(customerType);
    setViewSidebarOpen(true);
  };

  const handleEdit = (customerType: CustomerType) => {
    setEditCustomerType(customerType);
    setOpen(true);
  };

  const handleDelete = (customerType: CustomerType) => {
    setDeleteCustomerType(customerType);
  };

  const confirmDelete = () => {
    if (deleteCustomerType?.id) {
      deleteCustomerTypeMutation.mutate(deleteCustomerType.id, {
        onSuccess: () => {
          setDeleteCustomerType(null);
        },
      });
    }
  };

  const totalPages = Math.ceil((customerTypes?.length || 0) / limit);
  const paginatedData = customerTypes?.slice((page - 1) * limit, page * limit) || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="px-6 py-4 font-semibold text-gray-700">Customer Type</TableHead>
                  <TableHead className="px-6 py-4 font-semibold text-gray-700 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="px-6 py-4"><Skeleton className="h-6 w-32" /></TableCell>
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

  if (isError) {
    return (
      <div className="rounded-xl border-2 border-dashed border-red-300 bg-red-50/50 p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="rounded-full bg-red-100 p-6 mb-4">
            <Users className="h-12 w-12 text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load customer types</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-md">
            There was an error loading the customer types. Please try again.
          </p>
          <Button
            onClick={() => refetch()}
            className="bg-gradient-to-r from-brand-600 to-brand-700 text-white hover:from-brand-700 hover:to-brand-800"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!customerTypes || customerTypes.length === 0) {
    return (
      <>
        <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="rounded-full bg-gray-100 p-6 mb-4">
              <Users className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No customer types found</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-md">
              Get started by creating your first customer type to categorize your customers.
            </p>
            {!hideAddButton && (
              <Button
                onClick={toggleDialog}
                className="bg-gradient-to-r from-brand-600 to-brand-700 text-white hover:from-brand-700 hover:to-brand-800"
              >
                Create Customer Type
              </Button>
            )}
          </div>
        </div>

        {/* Dialog for Creating Customer Type */}
        {!hideAddButton && (
          <CustomDialog open={open} toggleOpen={toggleDialog} dialogWidth="sm:max-w-[450px]">
            <CustomerTypeForm closeDialog={toggleDialog} initialValues={editCustomerType} />
          </CustomDialog>
        )}
      </>
    );
  }

  return (
    <>
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50 border-b border-gray-200">
                <TableHead className="px-6 py-4 font-semibold text-gray-700">Customer Type</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-gray-700 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((customerType) => (
                <TableRow
                  key={customerType.id}
                  className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                >
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50">
                        <Users className="h-3 w-3 mr-1" />
                        {customerType.type}
                      </Badge>
                    </div>
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
                          onClick={() => handleView(customerType)}
                          className="cursor-pointer"
                        >
                          <Eye className="mr-2 h-4 w-4 text-gray-500" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleEdit(customerType)}
                          className="cursor-pointer"
                        >
                          <Edit className="mr-2 h-4 w-4 text-gray-500" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(customerType)}
                          className="cursor-pointer text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
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
      {customerTypes && customerTypes.length > 0 && (
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 px-2 mt-4 pt-4 border-t border-gray-200">
          {/* Left side - Items info and limit selector */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <p className="text-sm text-gray-600">
              Showing <span className="font-medium">{paginatedData.length}</span>
              {customerTypes.length > paginatedData.length && (
                <>
                  {" "}of <span className="font-medium">{customerTypes.length}</span>
                </>
              )}{" "}
              customer types
              {totalPages > 1 && (
                <>
                  {" "}· Page <span className="font-medium">{page}</span> of{" "}
                  <span className="font-medium">{totalPages}</span>
                </>
              )}
            </p>

            {/* Items per page selector */}
            <div className="flex items-center gap-2">
              <label htmlFor="limit-select-customer-types" className="text-sm text-gray-600 whitespace-nowrap">
                Items per page:
              </label>
              <select
                id="limit-select-customer-types"
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
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
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="hover:bg-gray-50"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
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
            <SheetTitle>Customer Type Details</SheetTitle>
            <SheetDescription>
              View detailed information about this customer type
            </SheetDescription>
          </SheetHeader>

          {viewCustomerType ? (
            <div className="mt-6 space-y-6">
              {/* Customer Type Information */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Customer Type Information
                </h3>
                <div className="space-y-2 pl-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">ID:</span>
                    <span className="font-medium">#{viewCustomerType.id}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Type:</span>
                    <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                      {viewCustomerType.type}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center min-h-[400px] text-gray-500">
              No customer type selected
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Dialog for Editing Customer Type */}
      <CustomDialog open={open} toggleOpen={toggleDialog} dialogWidth="sm:max-w-[700px]">
        <CustomerTypeForm closeDialog={toggleDialog} initialValues={editCustomerType} />
      </CustomDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteCustomerType} onOpenChange={() => setDeleteCustomerType(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer Type</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the customer type &ldquo;{deleteCustomerType?.type}&ldquo;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteCustomerTypeMutation.isPending}
            >
              {deleteCustomerTypeMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CustomerTypeTable;
