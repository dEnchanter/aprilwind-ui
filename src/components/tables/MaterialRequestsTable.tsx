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
  Edit,
  Trash2,
  ClipboardX,
  Clock,
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
import { Package, Calendar } from "lucide-react";
import { useMaterialRequest } from "@/hooks/useMaterialRequest";

interface MaterialRequestsTableProps {
  data: any[];
  isLoading: boolean;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onEdit: (request: any) => void;
  onDelete: (request: any) => void;
}

export function MaterialRequestsTable({
  data,
  isLoading,
  page,
  limit,
  onPageChange,
  onLimitChange,
  onEdit,
  onDelete,
}: MaterialRequestsTableProps) {
  const [viewSidebarOpen, setViewSidebarOpen] = useState(false);
  const [viewRequestId, setViewRequestId] = useState<number | null>(null);

  // Fetch detailed material request when viewing
  const { data: viewRequestData, isLoading: viewRequestLoading } = useMaterialRequest(viewRequestId || 0);
  const viewRequest = viewRequestData || null;

  const handleView = (request: any) => {
    setViewRequestId(request.id);
    setViewSidebarOpen(true);
  };

  const totalPages = Math.ceil(data.length / limit);
  const paginatedData = data.slice((page - 1) * limit, page * limit);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="px-6 py-4 font-semibold text-gray-700">Request Date</TableHead>
                  <TableHead className="px-6 py-4 font-semibold text-gray-700">Requester</TableHead>
                  <TableHead className="px-6 py-4 font-semibold text-gray-700">Materials</TableHead>
                  <TableHead className="px-6 py-4 font-semibold text-gray-700">Status</TableHead>
                  <TableHead className="px-6 py-4 font-semibold text-gray-700 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="px-6 py-4"><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell className="px-6 py-4"><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell className="px-6 py-4"><Skeleton className="h-5 w-20" /></TableCell>
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

  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="rounded-full bg-gray-100 p-6 mb-4">
            <ClipboardX className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No material requests found</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-md">
            {data.length === 0
              ? "Get started by creating your first material request to track inventory needs."
              : "No requests match your current filter criteria. Try adjusting your filters."}
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
                <TableHead className="px-6 py-4 font-semibold text-gray-700">Request Date</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-gray-700">Requester</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-gray-700">Materials</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-gray-700">Status</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-gray-700 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((request) => {
                const status = request.approvalStatus;
                const statusConfig: Record<string, { label: string; className: string }> = {
                  pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100' },
                  approved: { label: 'Approved', className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100' },
                  rejected: { label: 'Rejected', className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100' },
                  cancelled: { label: 'Cancelled', className: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100' },
                };
                const config = statusConfig[status] || statusConfig.pending;

                const materialsCount = request.materials?.length || 0;

                return (
                  <TableRow
                    key={request.id}
                    className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                  >
                    <TableCell className="px-6 py-4 text-sm text-gray-600">
                      {request.requestDate ? formatDate(request.requestDate) : '-'}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="font-medium text-sm text-gray-900">
                        {request.requester?.staffName || 'N/A'}
                      </div>
                      {request.requester?.email && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {request.requester.email}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-gray-900">{materialsCount}</span>
                        <span className="text-xs text-gray-500">
                          material{materialsCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Badge className={config.className}>
                        {status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                        {config.label}
                      </Badge>
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
                            onClick={() => handleView(request)}
                            className="cursor-pointer"
                          >
                            <Eye className="mr-2 h-4 w-4 text-gray-500" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onEdit(request)}
                            className="cursor-pointer"
                          >
                            <Edit className="mr-2 h-4 w-4 text-gray-500" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onDelete(request)}
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

      {/* Pagination - Always show if there's data */}
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
              material requests
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
                  onPageChange(1); // Reset to first page when changing limit
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
            <SheetTitle>Material Request Details</SheetTitle>
            <SheetDescription>
              View detailed information about this material request
            </SheetDescription>
          </SheetHeader>

          {viewRequestLoading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
            </div>
          ) : viewRequest ? (
            <div className="mt-6 space-y-6">
              {/* Production Information */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Production Details
                </h3>
                <div className="space-y-2 pl-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Product:</span>
                    <span className="font-medium">{viewRequest.production?.product?.name || '-'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Product Code:</span>
                    <span className="font-medium">{viewRequest.production?.product?.code || '-'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Product Cost:</span>
                    <span className="font-medium">₦{viewRequest.production?.product?.cost?.toLocaleString() || '0'}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Request Information */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Request Information
                </h3>
                <div className="space-y-2 pl-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Requested By:</span>
                    <span className="font-medium">{viewRequest.requester?.staffName || '-'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium text-xs">{viewRequest.requester?.email || '-'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Request Date:</span>
                    <span className="font-medium">{viewRequest.requestDate ? formatDate(viewRequest.requestDate) : '-'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <Badge variant="outline" className={
                      viewRequest.approvalStatus === 'approved' ? 'bg-green-100 text-green-700 border-green-300' :
                      viewRequest.approvalStatus === 'rejected' ? 'bg-red-100 text-red-700 border-red-300' :
                      viewRequest.approvalStatus === 'cancelled' ? 'bg-gray-100 text-gray-700 border-gray-300' :
                      'bg-yellow-100 text-yellow-700 border-yellow-300'
                    }>
                      {viewRequest.approvalStatus}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Materials Required */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-gray-700">Materials Required</h3>
                <div className="space-y-2 pl-6">
                  {viewRequest.materials && viewRequest.materials.length > 0 ? (
                    viewRequest.materials.map((material: any, index: number) => (
                      <div key={index} className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 text-sm space-y-2">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-semibold text-blue-900">
                              {material.materialDetails?.name || `Material #${material.item_id}`}
                            </div>
                            <div className="text-xs text-blue-600 mt-0.5">
                              {material.materialDetails?.code && `Code: ${material.materialDetails.code}`}
                              {material.materialDetails?.type?.name && ` • ${material.materialDetails.type.name}`}
                            </div>
                            {material.materialDetails?.description && (
                              <div className="text-xs text-gray-600 mt-1">
                                {material.materialDetails.description}
                              </div>
                            )}
                            <div className="text-xs text-gray-600 mt-1">
                              Available: {material.materialDetails?.quantity || 0} {material.materialDetails?.type?.unit || 'units'}
                            </div>
                          </div>
                          <div className="text-right ml-3">
                            <div className="font-bold text-brand-700 whitespace-nowrap">
                              {material.qty} {material.materialDetails?.type?.unit || 'units'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No materials requested</p>
                  )}
                </div>
              </div>

              {/* Material Request Stages */}
              {viewRequest.materialRequestStages && viewRequest.materialRequestStages.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm text-gray-700">Request History</h3>
                    <div className="space-y-2 pl-6">
                      {viewRequest.materialRequestStages.map((stage: any, index: number) => (
                        <div key={index} className="p-2 bg-gray-50 rounded border text-sm space-y-1">
                          <div className="flex justify-between">
                            <span className="font-medium">{stage.staff?.staffName || 'Unknown'}</span>
                            <Badge variant="outline" className={
                              stage.status === 'approved' ? 'bg-green-100 text-green-700 border-green-300' :
                              stage.status === 'rejected' ? 'bg-red-100 text-red-700 border-red-300' :
                              'bg-yellow-100 text-yellow-700 border-yellow-300'
                            }>
                              {stage.status}
                            </Badge>
                          </div>
                          {stage.notes && (
                            <div className="text-xs text-gray-600">{stage.notes}</div>
                          )}
                          <div className="text-xs text-gray-500">
                            {stage.stageDate ? formatDate(stage.stageDate) : '-'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex justify-center items-center min-h-[400px] text-gray-500">
              No material request selected
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
