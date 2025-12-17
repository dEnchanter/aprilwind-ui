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
import { MoreHorizontal, Edit, Trash2, PackageX, Eye } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useProductions, useDeleteProduction } from "@/hooks/useProductions";
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

interface ProductForProductionsTableProps {
  searchTerm: string;
  onEdit: (production: any) => void;
  onView?: (production: any) => void;
}

export function ProductForProductionsTable({
  searchTerm,
  onEdit,
  onView,
}: ProductForProductionsTableProps) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const { data: productionsResponse, isLoading } = useProductions({ page: 1, limit: 100 });
  const deleteProductionMutation = useDeleteProduction();

  const allProductions = productionsResponse || [];
  const [productionToDelete, setProductionToDelete] = useState<any>(null);

  // Filter by search
  const filteredData = searchTerm
    ? allProductions.filter((prod: any) =>
        prod.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prod.product?.code?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : allProductions;

  const totalPages = Math.ceil(filteredData.length / limit);
  const paginatedData = filteredData.slice((page - 1) * limit, page * limit);

  const confirmDelete = () => {
    if (productionToDelete) {
      deleteProductionMutation.mutate(productionToDelete.id, {
        onSuccess: () => setProductionToDelete(null),
      });
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead className="px-6 py-4 font-semibold text-gray-700">Product</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-gray-700">Requested By</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-gray-700">Status</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-gray-700">Material Status</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-gray-700">Date Requested</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-gray-700 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="px-6 py-4"><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell className="px-6 py-4"><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell className="px-6 py-4"><Skeleton className="h-6 w-20" /></TableCell>
                  <TableCell className="px-6 py-4"><Skeleton className="h-6 w-24" /></TableCell>
                  <TableCell className="px-6 py-4"><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell className="px-6 py-4"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (!filteredData || filteredData.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="rounded-full bg-gray-100 p-6 mb-4">
            <PackageX className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No production requests found</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-md">
            {searchTerm ? "No requests match your search criteria." : "Get started by creating your first production request."}
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
                <TableHead className="px-6 py-4 font-semibold text-gray-700">Product</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-gray-700">Requested By</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-gray-700">Status</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-gray-700">Material Status</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-gray-700">Date Requested</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-gray-700 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((production: any) => {
                const materialRequest = production.materialRequest;
                const materialStatus = materialRequest?.approvalStatus || 'pending';

                // Badge styling based on status
                const getStatusBadge = () => {
                  switch (materialStatus) {
                    case 'approved':
                      return <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">Approved</Badge>;
                    case 'rejected':
                      return <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-100">Rejected</Badge>;
                    case 'cancelled':
                      return <Badge className="bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100">Cancelled</Badge>;
                    default:
                      return <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100">Pending</Badge>;
                  }
                };

                return (
                  <TableRow
                    key={production.id}
                    className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                  >
                    <TableCell className="px-6 py-4">
                      <div className="font-medium text-sm text-gray-900">
                        {production.product?.name || '-'}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {production.product?.code || '-'}
                      </p>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <span className="text-sm text-gray-900">
                        {production.requester?.staffName || `Staff #${production.requestedBy}` || '-'}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Badge className={production.isActive ? "bg-green-100 text-green-800 border-green-200 hover:bg-green-100" : "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100"}>
                        {production.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      {getStatusBadge()}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-gray-600">
                      {production.dateRequested ? formatDate(production.dateRequested) : '-'}
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
                          {onView && (
                            <DropdownMenuItem
                              onClick={() => onView(production)}
                              className="cursor-pointer"
                            >
                              <Eye className="mr-2 h-4 w-4 text-gray-500" />
                              View Details
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => onEdit(production)}
                            className="cursor-pointer"
                          >
                            <Edit className="mr-2 h-4 w-4 text-gray-500" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setProductionToDelete(production)}
                            className="text-red-600 cursor-pointer focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
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
      {filteredData && filteredData.length > 0 && (
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 px-2 mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <p className="text-sm text-gray-600">
              Showing <span className="font-medium">{paginatedData.length}</span>
              {filteredData.length > paginatedData.length && (
                <>
                  {" "}of <span className="font-medium">{filteredData.length}</span>
                </>
              )}{" "}
              production requests
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

      {/* Delete Dialog */}
      <AlertDialog open={!!productionToDelete} onOpenChange={() => setProductionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Production Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this production request? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteProductionMutation.isPending}
            >
              {deleteProductionMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
