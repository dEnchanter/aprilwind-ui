/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

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
  Trash2,
  Ruler,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useSizeDefs, useDeleteSizeDef } from "@/hooks/useSizeDefs";
import { SizeDef } from "@/types/size-def";
import CustomDialog from "../dialog/CustomDialog";
import SizeDefForm from "../forms/SizeDefForm";
import { formatDate } from "@/lib/utils";

interface SizeDefTableProps {
  hideAddButton?: boolean;
}

const SizeDefTable = ({ hideAddButton = false }: SizeDefTableProps) => {
  const { data: sizeDefsResponse, isLoading, isError, refetch } = useSizeDefs();
  const deleteMutation = useDeleteSizeDef();

  const [open, setOpen] = useState(false);
  const [editSizeDef, setEditSizeDef] = useState<SizeDef | undefined>(undefined);
  const [viewSidebarOpen, setViewSidebarOpen] = useState(false);
  const [viewSizeDef, setViewSizeDef] = useState<SizeDef | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sizeDefToDelete, setSizeDefToDelete] = useState<SizeDef | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const sizeDefs = sizeDefsResponse?.data || [];

  const toggleDialog = () => {
    setOpen(!open);
    if (open) {
      setEditSizeDef(undefined);
    }
  };

  const handleView = (sizeDef: SizeDef) => {
    setViewSizeDef(sizeDef);
    setViewSidebarOpen(true);
  };

  const handleEdit = (sizeDef: SizeDef) => {
    setEditSizeDef(sizeDef);
    setOpen(true);
  };

  const handleDeleteClick = (sizeDef: SizeDef) => {
    setSizeDefToDelete(sizeDef);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (sizeDefToDelete) {
      deleteMutation.mutate(sizeDefToDelete.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setSizeDefToDelete(null);
        },
      });
    }
  };

  const totalPages = Math.ceil((sizeDefs?.length || 0) / limit);
  const paginatedData = sizeDefs?.slice((page - 1) * limit, page * limit) || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="px-6 py-4 font-semibold text-gray-700">Name</TableHead>
                  <TableHead className="px-6 py-4 font-semibold text-gray-700">Description</TableHead>
                  <TableHead className="px-6 py-4 font-semibold text-gray-700 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="px-6 py-4"><Skeleton className="h-6 w-32" /></TableCell>
                    <TableCell className="px-6 py-4"><Skeleton className="h-6 w-48" /></TableCell>
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
            <Ruler className="h-12 w-12 text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load size definitions</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-md">
            There was an error loading the size definitions. Please try again.
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

  if (!sizeDefs || sizeDefs.length === 0) {
    return (
      <>
        <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="rounded-full bg-gray-100 p-6 mb-4">
              <Ruler className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No size definitions found</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-md">
              Get started by creating your first size definition to use across your products.
            </p>
            {!hideAddButton && (
              <Button
                onClick={toggleDialog}
                className="bg-gradient-to-r from-brand-600 to-brand-700 text-white hover:from-brand-700 hover:to-brand-800"
              >
                Create Size Definition
              </Button>
            )}
          </div>
        </div>

        {/* Dialog for Creating Size */}
        {!hideAddButton && (
          <CustomDialog open={open} toggleOpen={toggleDialog} dialogWidth="sm:max-w-[500px]">
            <SizeDefForm closeDialog={toggleDialog} initialValues={editSizeDef} />
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
                <TableHead className="px-6 py-4 font-semibold text-gray-700">Name</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-gray-700">Description</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-gray-700 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((sizeDef) => (
                <TableRow
                  key={sizeDef.id}
                  className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                >
                  <TableCell className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-900">
                      {sizeDef.name || "-"}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <span className="text-sm text-gray-600">
                      {sizeDef.description || "No description"}
                    </span>
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
                          onClick={() => handleView(sizeDef)}
                          className="cursor-pointer"
                        >
                          <Eye className="mr-2 h-4 w-4 text-gray-500" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleEdit(sizeDef)}
                          className="cursor-pointer"
                        >
                          <Edit className="mr-2 h-4 w-4 text-gray-500" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(sizeDef)}
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
      {sizeDefs && sizeDefs.length > 0 && (
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 px-2 mt-4 pt-4 border-t border-gray-200">
          {/* Left side - Items info and limit selector */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <p className="text-sm text-gray-600">
              Showing <span className="font-medium">{paginatedData.length}</span>
              {sizeDefs.length > paginatedData.length && (
                <>
                  {" "}of <span className="font-medium">{sizeDefs.length}</span>
                </>
              )}{" "}
              size definitions
              {totalPages > 1 && (
                <>
                  {" "}· Page <span className="font-medium">{page}</span> of{" "}
                  <span className="font-medium">{totalPages}</span>
                </>
              )}
            </p>

            {/* Items per page selector */}
            <div className="flex items-center gap-2">
              <label htmlFor="limit-select-size-defs" className="text-sm text-gray-600 whitespace-nowrap">
                Items per page:
              </label>
              <select
                id="limit-select-size-defs"
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
            <SheetTitle>Size Definition Details</SheetTitle>
            <SheetDescription>
              View detailed information about this size definition
            </SheetDescription>
          </SheetHeader>

          {viewSizeDef ? (
            <div className="mt-6 space-y-6">
              {/* Size Information */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                  <Ruler className="h-4 w-4" />
                  Size Information
                </h3>
                <div className="space-y-2 pl-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">ID:</span>
                    <span className="font-medium">#{viewSizeDef.id}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Size:</span>
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200 font-semibold">
                      {viewSizeDef.size}
                    </Badge>
                  </div>
                  {viewSizeDef.name && (
                    <div className="flex flex-col gap-1 text-sm">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium text-gray-900">{viewSizeDef.name}</span>
                    </div>
                  )}
                  {viewSizeDef.description && (
                    <div className="flex flex-col gap-1 text-sm">
                      <span className="text-gray-600">Description:</span>
                      <span className="font-medium text-gray-900">{viewSizeDef.description}</span>
                    </div>
                  )}
                  {viewSizeDef.createdAt && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Created:</span>
                      <span className="font-medium">{formatDate(viewSizeDef.createdAt)}</span>
                    </div>
                  )}
                  {viewSizeDef.updatedAt && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Updated:</span>
                      <span className="font-medium">{formatDate(viewSizeDef.updatedAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center min-h-[400px] text-gray-500">
              No size definition selected
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Size Definition</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete size{" "}
              <span className="font-semibold">{sizeDefToDelete?.size}</span>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSizeDefToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog for Editing Size */}
      {!hideAddButton && (
        <CustomDialog open={open} toggleOpen={toggleDialog} dialogWidth="sm:max-w-[500px]">
          <SizeDefForm closeDialog={toggleDialog} initialValues={editSizeDef} />
        </CustomDialog>
      )}
    </>
  );
};

export default SizeDefTable;
