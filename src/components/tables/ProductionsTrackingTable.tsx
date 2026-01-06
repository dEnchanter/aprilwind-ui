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
// import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MoreHorizontal,
  Eye,
  PackageX,
  UserPlus,
  FileCheck,
  Box,
  RefreshCw,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { formatDate, cn } from "@/lib/utils";
import {
  useProductionTracking,
  useAssignTailor,
  useQAReview,
  useMoveProductionToStock,
  useReworkProduction,
  useMoveProductionToStage,
} from "@/hooks/useProductionTracking";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useStaff } from "@/hooks/useStaff";

interface ProductionsTrackingTableProps {
  searchTerm: string;
  onView?: (production: any) => void;
}

// Helper function to get stage badge styling
const getStageBadge = (stage: string, production?: any) => {
  const movedToStock = production?.movedToStock;

  // If moved to stock, show special badge
  if (movedToStock && stage?.toLowerCase() === 'completed') {
    return (
      <span className={cn(
        "px-2 py-1 rounded text-xs font-medium",
        "bg-teal-100 text-teal-700"
      )}>
        In Stock
      </span>
    );
  }

  // Check if production went through bidding
  const hasBiddingHistory = production ? (() => {
    const stageHistory = production.stageHistory || production.productionStages || [];
    return stageHistory.some((s: any) =>
      s.stage?.toLowerCase() === 'bidding' || s.stateName?.toLowerCase() === 'bidding'
    );
  })() : false;

  const normalizedStage = stage?.toLowerCase() || '';

  // Determine label and styling based on stage and bidding history
  let label = '';
  let className = '';

  if (normalizedStage === 'completed') {
    label = hasBiddingHistory ? 'Bidding Completed' : 'Completed';
    className = 'bg-green-100 text-green-700';
  } else if (normalizedStage === 'rejected') {
    label = hasBiddingHistory ? 'Bidding Rejected' : 'Rejected';
    className = 'bg-red-100 text-red-700';
  } else {
    const stages: Record<string, { label: string; className: string }> = {
      'pending assignment': { label: 'Pending Assignment', className: 'bg-gray-100 text-gray-700' },
      'in production': { label: 'In Production', className: 'bg-blue-100 text-blue-700' },
      'await qa': { label: 'Await QA', className: 'bg-amber-100 text-amber-700' },
      bidding: { label: 'Bidding', className: 'bg-purple-100 text-purple-700' },
    };

    const stageInfo = stages[normalizedStage] || { label: stage, className: 'bg-gray-100 text-gray-700' };
    label = stageInfo.label;
    className = stageInfo.className;
  }

  return (
    <span className={cn(
      "px-2 py-1 rounded text-xs font-medium",
      className
    )}>
      {label}
    </span>
  );
};

export function ProductionsTrackingTable({
  searchTerm,
  onView,
}: ProductionsTrackingTableProps) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const { data: productionsResponse, isLoading } = useProductionTracking({ page: 1, limit: 100 });
  const assignTailorMutation = useAssignTailor();
  const qaReviewMutation = useQAReview();
  const moveToStockMutation = useMoveProductionToStock();
  const reworkProductionMutation = useReworkProduction();
  const moveToStageMutation = useMoveProductionToStage();

  const allProductions = productionsResponse?.data || [];
  const currentUser = useCurrentUser();
  const { data: staffResponse } = useStaff({ page: 1, limit: 100 });
  const staffs = staffResponse?.data || [];

  // Check if current user is warehouse/inventory staff
  const isWarehouseStaff = () => {
    const roleName = currentUser.role?.name?.toLowerCase() || '';
    return roleName.includes('warehouse') ||
           roleName.includes('store') ||
           roleName.includes('inventory') ||
           roleName.includes('stock');
  };

  // Dialog states
  const [assignTailorDialog, setAssignTailorDialog] = useState(false);
  const [productionToAssign, setProductionToAssign] = useState<any>(null);
  const [selectedTailorId, setSelectedTailorId] = useState<string>("");
  const [assignNotes, setAssignNotes] = useState('');

  const [qaDialog, setQADialog] = useState(false);
  const [productionForQA, setProductionForQA] = useState<any>(null);
  const [qaStatus, setQAStatus] = useState<'approved' | 'rejected'>('approved');
  const [qaDefects, setQADefects] = useState('');
  const [qaNotes, setQANotes] = useState('');

  const [moveToStockDialog, setMoveToStockDialog] = useState(false);
  const [productionForStock, setProductionForStock] = useState<any>(null);
  const [receivedById, setReceivedById] = useState<string>("");
  const [stockNotes, setStockNotes] = useState('');

  const [reworkDialog, setReworkDialog] = useState(false);
  const [productionForRework, setProductionForRework] = useState<any>(null);
  const [reworkNotes, setReworkNotes] = useState('');

  const [submitForQADialog, setSubmitForQADialog] = useState(false);
  const [productionForSubmit, setProductionForSubmit] = useState<any>(null);
  const [submitNotes, setSubmitNotes] = useState('');

  const [sendToBiddingDialog, setSendToBiddingDialog] = useState(false);
  const [productionForBidding, setProductionForBidding] = useState<any>(null);
  const [biddingNotes, setBiddingNotes] = useState('');

  // Filter by search and exclude items moved to stock
  const filteredData = (searchTerm
    ? allProductions.filter((prod: any) =>
        prod.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prod.productInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prod.tailor?.staffName?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : allProductions
  ).filter((prod: any) => !prod.movedToStock); // Exclude items that have been moved to stock

  const totalPages = Math.ceil(filteredData.length / limit);
  const paginatedData = filteredData.slice((page - 1) * limit, page * limit);

  // Helper function to check if production has completed bidding cycle
  const hasBiddingCompleted = (production: any) => {
    if (!production) return false;
    const stageHistory = production.stageHistory || production.productionStages || [];
    return stageHistory.some((stage: any) =>
      stage.stage?.toLowerCase() === 'bidding' || stage.stateName?.toLowerCase() === 'bidding'
    );
  };

  const confirmAssignTailor = () => {
    const tailorIdNum = parseInt(selectedTailorId);
    if (productionToAssign && selectedTailorId && tailorIdNum > 0) {
      assignTailorMutation.mutate({
        id: productionToAssign.id,
        data: {
          tailorId: tailorIdNum,
          notes: assignNotes || undefined,
        },
      }, {
        onSuccess: () => {
          setAssignTailorDialog(false);
          setProductionToAssign(null);
          setSelectedTailorId("");
          setAssignNotes('');
        },
      });
    }
  };

  const confirmQAReview = () => {
    if (productionForQA && currentUser.staffId) {
      const defectsArray = qaStatus === 'rejected' && qaDefects
        ? qaDefects.split(',').map(d => d.trim()).filter(Boolean)
        : undefined;

      qaReviewMutation.mutate({
        id: productionForQA.id,
        data: {
          qaStaffId: currentUser.staffId,
          status: qaStatus,
          notes: qaNotes || undefined,
          ...(defectsArray && { defects: defectsArray }),
        },
      }, {
        onSuccess: () => {
          setQADialog(false);
          setProductionForQA(null);
          setQADefects('');
          setQANotes('');
        },
      });
    }
  };

  const confirmMoveToStock = () => {
    // If current user is warehouse staff, use their ID; otherwise use selected ID
    const receivedByIdNum = isWarehouseStaff() && currentUser.staffId
      ? currentUser.staffId
      : parseInt(receivedById);

    if (productionForStock && currentUser.staffId && receivedByIdNum > 0) {
      moveToStockMutation.mutate({
        id: productionForStock.id,
        data: {
          pushedBy: currentUser.staffId,
          receivedBy: receivedByIdNum,
          notes: stockNotes || undefined,
        },
      }, {
        onSuccess: () => {
          setMoveToStockDialog(false);
          setProductionForStock(null);
          setReceivedById("");
          setStockNotes('');
        },
      });
    }
  };

  const confirmRework = () => {
    if (productionForRework && currentUser.staffId) {
      // Check if this was rejected from bidding by looking at stage history
      const stageHistory = productionForRework.stageHistory || productionForRework.productionStages || [];
      const wasBiddingRejection = stageHistory.some((stage: any) =>
        stage.stage?.toLowerCase() === 'bidding' || stage.stateName?.toLowerCase() === 'bidding'
      );

      // If rejected from bidding, send back to bidding; otherwise use regular rework endpoint
      if (wasBiddingRejection) {
        // Rework bidding - send back to bidding stage
        moveToStageMutation.mutate({
          id: productionForRework.id,
          data: {
            stage: "Bidding",
            staffId: currentUser.staffId,
            notes: reworkNotes || undefined,
          },
        }, {
          onSuccess: () => {
            setReworkDialog(false);
            setProductionForRework(null);
            setReworkNotes('');
          },
        });
      } else {
        // Regular rework - use existing rework endpoint
        reworkProductionMutation.mutate({
          id: productionForRework.id,
          data: {
            staffId: currentUser.staffId,
            notes: reworkNotes || undefined,
          },
        }, {
          onSuccess: () => {
            setReworkDialog(false);
            setProductionForRework(null);
            setReworkNotes('');
          },
        });
      }
    }
  };

  const confirmSubmitForQA = () => {
    if (productionForSubmit && currentUser.staffId) {
      moveToStageMutation.mutate({
        id: productionForSubmit.id,
        data: {
          stage: "Await QA",
          staffId: currentUser.staffId,
          notes: submitNotes || undefined,
        },
      }, {
        onSuccess: () => {
          setSubmitForQADialog(false);
          setProductionForSubmit(null);
          setSubmitNotes('');
        },
      });
    }
  };

  const confirmSendToBidding = () => {
    if (productionForBidding && currentUser.staffId) {
      moveToStageMutation.mutate({
        id: productionForBidding.id,
        data: {
          stage: "Bidding",
          staffId: currentUser.staffId,
          notes: biddingNotes || undefined,
        },
      }, {
        onSuccess: () => {
          setSendToBiddingDialog(false);
          setProductionForBidding(null);
          setBiddingNotes('');
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
                <TableHead className="px-6 py-4 font-semibold text-gray-700">Code</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-gray-700">Product</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-gray-700">Tailor</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-gray-700">Materials</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-gray-700">Stage</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-gray-700">Assigned Date</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-gray-700 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="px-6 py-4"><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell className="px-6 py-4"><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell className="px-6 py-4"><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell className="px-6 py-4"><Skeleton className="h-5 w-16" /></TableCell>
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
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No productions found</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-md">
            {searchTerm ? "No productions match your search criteria." : "Get started by creating your first production."}
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
                <TableHead className="px-6 py-4 font-semibold text-gray-700">Code</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-gray-700">Product</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-gray-700">Tailor</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-gray-700">Materials</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-gray-700">Stage</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-gray-700">Assigned Date</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-gray-700 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((production: any) => {
                const isCompleted = production.dateCompleted != null;
                const movedToStock = production.movedToStock === true;
                const materialRequest = production.materialRequest;
                const materialCount = materialRequest?.materials?.length || 0;
                const isApproved = materialRequest?.approvalStatus === 'approved';

                return (
                  <TableRow
                    key={production.id}
                    className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                  >
                    <TableCell className="px-6 py-4 font-mono text-sm text-brand-700 font-medium">
                      {production.code || '-'}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="font-medium text-sm text-gray-900">
                        {production.productInfo?.name || '-'}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Size {production.productInfo?.size || '-'}
                      </p>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      {production.tailor ? (
                        <span className="text-sm text-gray-900">{production.tailor.staffName}</span>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      {materialRequest ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">{materialCount}</span>
                          <span className="text-xs text-gray-500">item{materialCount !== 1 ? 's' : ''}</span>
                          {isApproved && (
                            <span className="text-xs text-green-600">✓</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      {getStageBadge(production.stage, production)}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-gray-600">
                      {production.assignDate ? formatDate(production.assignDate) : '-'}
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

                          {/* View Details */}
                          {onView && (
                            <DropdownMenuItem
                              onClick={() => onView(production)}
                              className="cursor-pointer"
                            >
                              <Eye className="mr-2 h-4 w-4 text-gray-500" />
                              View Details
                            </DropdownMenuItem>
                          )}

                          {!movedToStock && (
                            <>
                              {/* Completed Productions: Move to Stock OR Send to Bidding */}
                              {production.stage?.toLowerCase() === 'completed' && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setProductionForStock(production);
                                      setMoveToStockDialog(true);
                                    }}
                                    className="cursor-pointer text-green-700"
                                  >
                                    <Box className="mr-2 h-4 w-4" />
                                    Move to Stock
                                  </DropdownMenuItem>
                                  {/* Only show Send to Bidding if production hasn't been through bidding yet */}
                                  {!hasBiddingCompleted(production) && (
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setProductionForBidding(production);
                                        setSendToBiddingDialog(true);
                                      }}
                                      className="cursor-pointer text-purple-700"
                                    >
                                      <Sparkles className="mr-2 h-4 w-4" />
                                      Send to Bidding
                                    </DropdownMenuItem>
                                  )}
                                </>
                              )}

                              {!isCompleted && (
                                <>
                                  {/* Assign Tailor */}
                                  {!production.tailor && production.stage?.toLowerCase() === 'pending assignment' && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setProductionToAssign(production);
                                          setAssignTailorDialog(true);
                                        }}
                                        className="cursor-pointer"
                                      >
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        Assign Tailor
                                      </DropdownMenuItem>
                                    </>
                                  )}

                                  {/* Submit for QA */}
                                  {production.stage?.toLowerCase() === 'in production' && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setProductionForSubmit(production);
                                          setSubmitForQADialog(true);
                                        }}
                                        className="cursor-pointer text-blue-700"
                                      >
                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                        Submit for QA
                                      </DropdownMenuItem>
                                    </>
                                  )}

                                  {/* QA Review - for both Await QA and Bidding stages */}
                                  {(production.stage?.toLowerCase() === 'await qa' || production.stage?.toLowerCase() === 'bidding') && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setProductionForQA(production);
                                          setQADialog(true);
                                        }}
                                        className="cursor-pointer"
                                      >
                                        <FileCheck className="mr-2 h-4 w-4" />
                                        QA Review {production.stage?.toLowerCase() === 'bidding' ? '(Bidding)' : ''}
                                      </DropdownMenuItem>
                                    </>
                                  )}

                                  {/* Rework */}
                                  {production.stage?.toLowerCase() === 'rejected' && production.tailor && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setProductionForRework(production);
                                          setReworkDialog(true);
                                        }}
                                        className="cursor-pointer text-amber-700"
                                      >
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                        {hasBiddingCompleted(production) ? 'Send for Bidding Rework' : 'Send for Rework'}
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </>
                              )}
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
              productions
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

      {/* Assign Tailor Dialog */}
      <AlertDialog open={assignTailorDialog} onOpenChange={setAssignTailorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Assign Tailor to Production</AlertDialogTitle>
            <AlertDialogDescription>
              Select a tailor to assign to this production. The production will move to &rdquo;In Production&rdquo; stage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tailor-select">Select Tailor *</Label>
              <Select value={selectedTailorId || undefined} onValueChange={(value) => setSelectedTailorId(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a tailor" />
                </SelectTrigger>
                <SelectContent>
                  {staffs && staffs.length > 0 ? (
                    staffs
                      .filter((staff: any) => staff.role?.name?.toLowerCase() === 'tailor')
                      .map((staff: any) => (
                        <SelectItem key={staff.id} value={staff.id.toString()}>
                          {staff.staffName}
                        </SelectItem>
                      ))
                  ) : (
                    <div className="p-2 text-xs text-gray-500 text-center">No tailors found</div>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="assign-notes">Notes (Optional)</Label>
              <Textarea
                id="assign-notes"
                placeholder="Add any notes about this assignment..."
                value={assignNotes}
                onChange={(e) => setAssignNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAssignTailor}
              disabled={!selectedTailorId || assignTailorMutation.isPending}
              className="bg-brand-700 hover:bg-brand-800"
            >
              {assignTailorMutation.isPending ? 'Assigning...' : 'Assign Tailor'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* QA Review Dialog */}
      <AlertDialog open={qaDialog} onOpenChange={setQADialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>QA Review</AlertDialogTitle>
            <AlertDialogDescription>
              Review the quality of this production and approve or reject it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="qa-status">Review Status *</Label>
              <Select value={qaStatus} onValueChange={(value: any) => setQAStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="qa-defects">Defects (if any)</Label>
              <Textarea
                id="qa-defects"
                placeholder="Describe any defects found..."
                value={qaDefects}
                onChange={(e) => setQADefects(e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qa-notes">Review Notes</Label>
              <Textarea
                id="qa-notes"
                placeholder="Add review notes..."
                value={qaNotes}
                onChange={(e) => setQANotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmQAReview}
              disabled={qaReviewMutation.isPending}
              className={qaStatus === 'approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {qaReviewMutation.isPending ? 'Submitting...' : `${qaStatus === 'approved' ? 'Approve' : 'Reject'} Production`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Move to Stock Dialog */}
      <AlertDialog open={moveToStockDialog} onOpenChange={setMoveToStockDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Move to Stock</AlertDialogTitle>
            <AlertDialogDescription>
              Move this completed production to stock inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="received-by">Received By *</Label>
              {isWarehouseStaff() ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className="font-medium text-sm text-blue-900">
                        {currentUser.staffName || 'Current User'}
                      </div>
                      <div className="text-xs text-blue-700 mt-0.5">
                        {currentUser.role?.name || 'Warehouse Staff'}
                      </div>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="text-xs text-blue-600 mt-2">
                    As warehouse/inventory staff, you will be recorded as receiving this stock.
                  </p>
                </div>
              ) : (
                <Select value={receivedById || undefined} onValueChange={(value) => setReceivedById(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select warehouse staff" />
                  </SelectTrigger>
                  <SelectContent>
                    {staffs && staffs.length > 0 ? (
                      staffs
                        .filter((staff: any) => {
                          const roleName = staff.role?.name?.toLowerCase() || '';
                          return roleName.includes('warehouse') ||
                                 roleName.includes('store') ||
                                 roleName.includes('inventory') ||
                                 roleName.includes('stock');
                        })
                        .map((staff: any) => (
                          <SelectItem key={staff.id} value={staff.id.toString()}>
                            {staff.staffName}
                          </SelectItem>
                        ))
                    ) : (
                      <div className="p-2 text-xs text-gray-500 text-center">No warehouse/inventory staff available</div>
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock-notes">Notes</Label>
              <Textarea
                id="stock-notes"
                placeholder="Add any notes..."
                value={stockNotes}
                onChange={(e) => setStockNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmMoveToStock}
              disabled={(!isWarehouseStaff() && !receivedById) || moveToStockMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {moveToStockMutation.isPending ? 'Moving...' : 'Move to Stock'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rework Dialog */}
      <AlertDialog open={reworkDialog} onOpenChange={setReworkDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {hasBiddingCompleted(productionForRework) ? 'Send for Bidding Rework' : 'Send Production for Rework'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {hasBiddingCompleted(productionForRework)
                ? 'Send rejected bidding work back for rework. The production will return to "Bidding" stage.'
                : 'Send rejected production back to the tailor for rework. The production will return to "In Production" stage.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rework-notes">Notes (Optional)</Label>
              <Textarea
                id="rework-notes"
                placeholder="Add any notes about the rework requirements..."
                value={reworkNotes}
                onChange={(e) => setReworkNotes(e.target.value)}
                rows={4}
              />
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <RefreshCw className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-amber-900">
                  <p className="font-semibold text-xs mb-1">Rework Notice</p>
                  <p className="text-xs">
                    {hasBiddingCompleted(productionForRework) ? (
                      <>
                        This production will be sent back for bidding rework.
                        The stage will change from <span className="font-medium">&ldquo;Rejected&rdquo;</span> to <span className="font-medium">&ldquo;Bidding&rdquo;</span>.
                      </>
                    ) : (
                      <>
                        This production will be sent back to <span className="font-medium">{productionForRework?.tailor?.staffName || 'the assigned tailor'}</span> for rework.
                        The stage will change from <span className="font-medium">&ldquo;Rejected&rdquo;</span> to <span className="font-medium">&ldquo;In Production&rdquo;</span>.
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRework}
              disabled={reworkProductionMutation.isPending || moveToStageMutation.isPending}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {(reworkProductionMutation.isPending || moveToStageMutation.isPending) ? 'Sending for Rework...' : 'Send for Rework'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Submit for QA Dialog */}
      <AlertDialog open={submitForQADialog} onOpenChange={setSubmitForQADialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Production for QA Review</AlertDialogTitle>
            <AlertDialogDescription>
              Mark production as complete and submit it for quality assurance review.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="submit-notes">Completion Notes (Optional)</Label>
              <Textarea
                id="submit-notes"
                placeholder="Add any notes about the completed work..."
                value={submitNotes}
                onChange={(e) => setSubmitNotes(e.target.value)}
                rows={4}
              />
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-blue-900">
                  <p className="font-semibold text-xs mb-1">QA Submission Notice</p>
                  <p className="text-xs">
                    This production will be marked as complete and submitted for QA review.
                    The stage will change from <span className="font-medium">&ldquo;In Production&#34;</span> to <span className="font-medium">&ldquo;Await QA&ldquo;</span>.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSubmitForQA}
              disabled={moveToStageMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {moveToStageMutation.isPending ? 'Submitting...' : 'Submit for QA'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Send to Bidding Dialog */}
      <AlertDialog open={sendToBiddingDialog} onOpenChange={setSendToBiddingDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send to Bidding</AlertDialogTitle>
            <AlertDialogDescription>
              Send this completed production for additional fancy work (stones, beads, embellishments, etc.).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="bidding-notes">Fancy Work Description *</Label>
              <Textarea
                id="bidding-notes"
                placeholder="Describe the fancy work needed (e.g., Add stones and beading to neckline, Crystal embellishments on sleeves...)"
                value={biddingNotes}
                onChange={(e) => setBiddingNotes(e.target.value)}
                rows={4}
                required
              />
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <div className="text-purple-900">
                  <p className="font-semibold text-xs mb-1">Bidding Notice</p>
                  <p className="text-xs">
                    This production will be sent for fancy work (bidding stage) and will require QA review after completion.
                    The stage will change from <span className="font-medium">&ldquo;Completed&rdquo;</span> to <span className="font-medium">&ldquo;Bidding&rdquo;</span>.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSendToBidding}
              disabled={!biddingNotes.trim() || moveToStageMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {moveToStageMutation.isPending ? 'Sending...' : 'Send to Bidding'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
