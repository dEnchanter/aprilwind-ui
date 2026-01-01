/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react";
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
import { MoreHorizontal, Edit, PackageX, Eye, CheckCircle2, Clock, XCircle, Ban, RotateCcw } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useProductsForProduction, useCancelProductForProduction, useReactivateProductForProduction } from "@/hooks/useProductsForProduction";
import { getAccessToken } from "@/utils/storage";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ProductForProductionsTableProps {
  searchTerm: string;
  onEdit: (production: any) => void;
  onView?: (production: any) => void;
}

// Helper component to fetch material request status for a production
function useMaterialStatusForProductions(productionIds: number[]) {
  const [materialStatusMap, setMaterialStatusMap] = useState<Map<number, any>>(new Map());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchMaterialStatuses = async () => {
      if (productionIds.length === 0) return;

      setIsLoading(true);
      const token = getAccessToken();

      // Fetch all material requests in parallel for better performance
      const fetchPromises = productionIds.map(async (productionId) => {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/material-requests/production/${productionId}`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );
          if (response.ok) {
            const data = await response.json();
            return { productionId, data };
          }
        } catch (error) {
          console.error(`Failed to fetch material status for production ${productionId}:`, error);
        }
        return null;
      });

      const results = await Promise.all(fetchPromises);

      const newMap = new Map();
      results.forEach((result) => {
        if (result) {
          newMap.set(result.productionId, result.data);
        }
      });

      setMaterialStatusMap(newMap);
      setIsLoading(false);
    };

    fetchMaterialStatuses();
  }, [productionIds.join(',')]);

  return { materialStatusMap, isLoading };
}

export function ProductForProductionsTable({
  searchTerm,
  onEdit,
  onView,
}: ProductForProductionsTableProps) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [reactivateDialogOpen, setReactivateDialogOpen] = useState(false);
  const [selectedProduction, setSelectedProduction] = useState<any>(null);
  const [cancelReason, setCancelReason] = useState("");

  const { data: productionsResponse, isLoading } = useProductsForProduction({ page: 1, limit: 100 });
  const cancelMutation = useCancelProductForProduction();
  const reactivateMutation = useReactivateProductForProduction();

  const allProductions = productionsResponse || [];

  // Get material request statuses for all productions
  const productionIds = allProductions.map((p: any) => p.id);
  const { materialStatusMap, isLoading: isMaterialStatusLoading } = useMaterialStatusForProductions(productionIds);

  // Filter by search
  const filteredData = searchTerm
    ? allProductions.filter((prod: any) =>
        prod.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prod.product?.code?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : allProductions;

  const totalPages = Math.ceil(filteredData.length / limit);
  const paginatedData = filteredData.slice((page - 1) * limit, page * limit);

  const handleCancelClick = (production: any) => {
    setSelectedProduction(production);
    setCancelReason("");
    setCancelDialogOpen(true);
  };

  const handleReactivateClick = (production: any) => {
    setSelectedProduction(production);
    setReactivateDialogOpen(true);
  };

  const handleCancel = () => {
    if (selectedProduction && cancelReason.trim()) {
      cancelMutation.mutate(
        { id: selectedProduction.id, reason: cancelReason },
        {
          onSuccess: () => {
            setCancelDialogOpen(false);
            setSelectedProduction(null);
            setCancelReason("");
          },
        }
      );
    }
  };

  const handleReactivate = () => {
    if (selectedProduction) {
      reactivateMutation.mutate(selectedProduction.id, {
        onSuccess: () => {
          setReactivateDialogOpen(false);
          setSelectedProduction(null);
        },
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
                const materialData = materialStatusMap.get(production.id);

                // Get material request status badge
                const getMaterialStatusBadge = () => {
                  // Show loading skeleton while fetching material statuses
                  if (isMaterialStatusLoading) {
                    return <Skeleton className="h-6 w-24" />;
                  }

                  if (!materialData || materialData.summary?.total === 0) {
                    return (
                      <div className="flex items-center gap-1.5">
                        <XCircle className="h-3.5 w-3.5 text-red-500" />
                        <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-100">
                          No Request
                        </Badge>
                      </div>
                    );
                  }

                  if (materialData.summary?.approved > 0) {
                    return (
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                        <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">
                          Approved
                        </Badge>
                      </div>
                    );
                  }

                  if (materialData.summary?.pending > 0) {
                    return (
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-amber-500" />
                        <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100">
                          Pending
                        </Badge>
                      </div>
                    );
                  }

                  if (materialData.summary?.rejected > 0) {
                    return (
                      <div className="flex items-center gap-1.5">
                        <XCircle className="h-3.5 w-3.5 text-red-500" />
                        <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-100">
                          Rejected
                        </Badge>
                      </div>
                    );
                  }

                  return (
                    <Badge className="bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100">
                      Unknown
                    </Badge>
                  );
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
                      {getMaterialStatusBadge()}
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
                              onClick={() => {
                                // Enrich production object with material status
                                const materialData = materialStatusMap.get(production.id);

                                // Determine approval status based on material summary
                                let approvalStatus = 'pending';
                                if (materialData?.summary) {
                                  if (materialData.summary.approved > 0) {
                                    approvalStatus = 'approved';
                                  } else if (materialData.summary.rejected > 0) {
                                    approvalStatus = 'rejected';
                                  } else if (materialData.summary.pending > 0) {
                                    approvalStatus = 'pending';
                                  }
                                }

                                // Create enriched production object with material status
                                const enrichedProduction = {
                                  ...production,
                                  materialRequest: {
                                    approvalStatus,
                                    summary: materialData?.summary || null,
                                  },
                                };

                                onView(enrichedProduction);
                              }}
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

                          <DropdownMenuSeparator />

                          {/* Show Cancel for active productions, Reactivate for inactive */}
                          {production.isActive ? (
                            <DropdownMenuItem
                              onClick={() => handleCancelClick(production)}
                              className="text-orange-600 cursor-pointer focus:text-orange-600"
                            >
                              <Ban className="mr-2 h-4 w-4" />
                              Cancel Request
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => handleReactivateClick(production)}
                              className="text-green-600 cursor-pointer focus:text-green-600"
                            >
                              <RotateCcw className="mr-2 h-4 w-4" />
                              Reactivate
                            </DropdownMenuItem>
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

      {/* Cancel Production Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Cancel Production Request</DialogTitle>
            <DialogDescription>
              Cancel this production request. This will set it as inactive but preserve all data.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedProduction && (
              <div className="space-y-2">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="text-sm">
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-600">Product:</span>
                      <span className="font-medium">{selectedProduction.product?.name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Code:</span>
                      <span className="font-medium">{selectedProduction.product?.code || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="cancel-reason" className="text-xs">
                Reason for Cancellation *
              </Label>
              <Textarea
                id="cancel-reason"
                placeholder="e.g., Customer cancelled order, Production no longer needed..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                className="resize-none"
                required
              />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-xs text-amber-800">
                <strong>Note:</strong> Cancelling this request will set it to inactive. You can reactivate it later if needed.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
              disabled={cancelMutation.isPending}
            >
              Close
            </Button>
            <Button
              onClick={handleCancel}
              disabled={cancelMutation.isPending || !cancelReason.trim()}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {cancelMutation.isPending ? 'Cancelling...' : 'Cancel Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reactivate Production Dialog */}
      <Dialog open={reactivateDialogOpen} onOpenChange={setReactivateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Reactivate Production Request</DialogTitle>
            <DialogDescription>
              Reactivate this cancelled production request and make it active again.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedProduction && (
              <div className="space-y-2">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="text-sm">
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-600">Product:</span>
                      <span className="font-medium">{selectedProduction.product?.name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Code:</span>
                      <span className="font-medium">{selectedProduction.product?.code || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-xs text-green-800">
                <strong>Note:</strong> Reactivating this request will make it active again and restore it to the active production list.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReactivateDialogOpen(false)}
              disabled={reactivateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReactivate}
              disabled={reactivateMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {reactivateMutation.isPending ? 'Reactivating...' : 'Reactivate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
