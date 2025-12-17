/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */
// components/tables/ProductionTrackingTable.tsx
"use client"

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Button } from '../ui/button';
import { IoMdAdd } from 'react-icons/io';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Separator } from '../ui/separator';
import { DataTable } from './utils/data-table';
import { formatDate, cn } from '@/lib/utils';
import CustomDialog from '../dialog/CustomDialog';
import {
  useProductionTracking,
  useDeleteProductionTracking,
  useProductionTrackingById,
  // useProductionTimeline, // Endpoint not yet implemented
  useMoveProductionToStage,
  useAssignTailor,
  useQAReview,
  useMoveProductionToStock,
  useReworkProduction,
} from '@/hooks/useProductionTracking';
import { createProductionTrackingColumns } from '@/app/(dashboard)/production-management/productionTrackingColumns';
import ProductionForm from '../forms/ProductionForm';
import { DataTableLoader2 } from '../utils/loader';
import { NewPageIcon, PageErrorIcon } from '../utils/icons';
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Package, User, Hash, CheckCircle2, Box, UserPlus, FileCheck, RefreshCw } from 'lucide-react';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useStaff } from '@/hooks/useStaff';
import { Input } from '../ui/input';

const ProductionTrackingTable = () => {
  const [isMounted, setIsMounted] = useState(false);

  const { data: productionsResponse, isLoading, isError, refetch } = useProductionTracking({ page: 1, limit: 100 });
  const productions = productionsResponse?.data || [];

  const deleteProduction = useDeleteProductionTracking();
  const moveToStage = useMoveProductionToStage();
  const assignTailor = useAssignTailor();
  const qaReview = useQAReview();
  const moveToStock = useMoveProductionToStock();
  const reworkProduction = useReworkProduction();

  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productionToDelete, setProductionToDelete] = useState<Production | null>(null);
  const [detailsSidebarOpen, setDetailsSidebarOpen] = useState(false);
  const [selectedProduction, setSelectedProduction] = useState<Production | null>(null);

  // Assign Tailor Dialog
  const [assignTailorDialogOpen, setAssignTailorDialogOpen] = useState(false);
  const [productionToAssign, setProductionToAssign] = useState<Production | null>(null);
  const [selectedTailorId, setSelectedTailorId] = useState<string>("");
  const [assignNotes, setAssignNotes] = useState('');

  // QA Review Dialog
  const [qaDialogOpen, setQADialogOpen] = useState(false);
  const [productionForQA, setProductionForQA] = useState<Production | null>(null);
  const [qaStatus, setQAStatus] = useState<'approved' | 'rejected'>('approved');
  const [qaDefects, setQADefects] = useState<string>('');
  const [qaNotes, setQANotes] = useState('');

  // Move to Stock Dialog
  const [moveToStockDialogOpen, setMoveToStockDialogOpen] = useState(false);
  const [productionForStock, setProductionForStock] = useState<Production | null>(null);
  const [receivedById, setReceivedById] = useState<string>("");
  const [stockLocation, setStockLocation] = useState('');
  const [stockNotes, setStockNotes] = useState('');

  // Rework Dialog
  const [reworkDialogOpen, setReworkDialogOpen] = useState(false);
  const [productionForRework, setProductionForRework] = useState<Production | null>(null);
  const [reworkNotes, setReworkNotes] = useState('');

  // Submit for QA Dialog
  const [submitForQADialogOpen, setSubmitForQADialogOpen] = useState(false);
  const [productionForSubmit, setProductionForSubmit] = useState<Production | null>(null);
  const [submitNotes, setSubmitNotes] = useState('');

  const currentUser = useCurrentUser();
  const { data: staffResponse } = useStaff({ page: 1, limit: 100 });
  const staffs = staffResponse?.data || [];

  // Fetch detailed production data when sidebar opens
  const { data: detailedProduction } = useProductionTrackingById(selectedProduction?.id || 0);
  // Timeline endpoint not yet implemented in backend
  // const { data: timeline } = useProductionTimeline(selectedProduction?.id || 0);

  // Ensure component is mounted before enabling interactions
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleDialog = () => {
    setOpen(!open);
  };

  const handleEdit = useCallback((production: Production) => {
    // TODO: Implement edit functionality
    console.log('Edit production:', production);
  }, []);

  const handleDelete = useCallback((production: Production) => {
    setProductionToDelete(production);
    setDeleteDialogOpen(true);
  }, []);

  const handleView = useCallback((production: Production) => {
    setSelectedProduction(production);
    setDetailsSidebarOpen(true);
  }, []);

  const handleQAReviewAction = useCallback((production: Production) => {
    setProductionForQA(production);
    setQAStatus('approved');
    setQADefects('');
    setQANotes('');
    setQADialogOpen(true);
  }, []);

  const confirmDelete = () => {
    if (productionToDelete?.id) {
      deleteProduction.mutate(productionToDelete.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setProductionToDelete(null);
        },
      });
    }
  };


  const handleAssignTailor = (production: Production) => {
    setProductionToAssign(production);
    setSelectedTailorId("");
    setAssignNotes('');
    setAssignTailorDialogOpen(true);
  };

  const confirmAssignTailor = () => {
    const tailorIdNum = parseInt(selectedTailorId);
    if (productionToAssign?.id && selectedTailorId && tailorIdNum > 0) {
      assignTailor.mutate({
        id: productionToAssign.id,
        data: {
          tailorId: tailorIdNum,
          notes: assignNotes || undefined,
        },
      }, {
        onSuccess: () => {
          setAssignTailorDialogOpen(false);
          setProductionToAssign(null);
          setSelectedTailorId("");
          setAssignNotes('');
          // Refresh details if sidebar is open
          if (selectedProduction?.id === productionToAssign.id) {
            setDetailsSidebarOpen(false);
          }
        },
      });
    }
  };

  // const handleQAReview = (production: Production) => {
  //   setProductionForQA(production);
  //   setQAStatus('approved');
  //   setQADefects('');
  //   setQANotes('');
  //   setQADialogOpen(true);
  // };

  const confirmQAReview = () => {
    if (productionForQA?.id && currentUser.staffId) {
      const defectsArray = qaStatus === 'rejected' && qaDefects
        ? qaDefects.split(',').map(d => d.trim()).filter(Boolean)
        : undefined;

      qaReview.mutate({
        id: productionForQA.id,
        data: {
          qaStaffId: currentUser.staffId,
          status: qaStatus,
          notes: qaNotes || undefined,
          ...(defectsArray && { defects: defectsArray }),
        },
      }, {
        onSuccess: () => {
          setQADialogOpen(false);
          setProductionForQA(null);
          setQAStatus('approved');
          setQADefects('');
          setQANotes('');
          // Refresh details if sidebar is open
          if (selectedProduction?.id === productionForQA.id) {
            setDetailsSidebarOpen(false);
          }
        },
      });
    }
  };

  const handleOpenMoveToStock = (production: Production) => {
    setProductionForStock(production);
    setReceivedById("");
    setStockLocation('');
    setStockNotes('');
    setMoveToStockDialogOpen(true);
  };

  const confirmMoveToStock = () => {
    const receivedByIdNum = parseInt(receivedById);
    if (productionForStock?.id && currentUser.staffId && receivedById && receivedByIdNum > 0) {
      moveToStock.mutate({
        id: productionForStock.id,
        data: {
          pushedBy: currentUser.staffId,
          receivedBy: receivedByIdNum,
          location: stockLocation || undefined,
          notes: stockNotes || undefined,
        },
      }, {
        onSuccess: () => {
          setMoveToStockDialogOpen(false);
          setProductionForStock(null);
          setReceivedById("");
          setStockLocation('');
          setStockNotes('');
          // Refresh details if sidebar is open
          if (selectedProduction?.id === productionForStock.id) {
            setDetailsSidebarOpen(false);
          }
        },
      });
    }
  };

  const handleRework = (production: Production) => {
    setProductionForRework(production);
    setReworkNotes('');
    setReworkDialogOpen(true);
  };

  const confirmRework = () => {
    if (productionForRework?.id && currentUser.staffId) {
      reworkProduction.mutate({
        id: productionForRework.id,
        data: {
          staffId: currentUser.staffId,
          notes: reworkNotes || undefined,
        },
      }, {
        onSuccess: () => {
          setReworkDialogOpen(false);
          setProductionForRework(null);
          setReworkNotes('');
          // Refresh details if sidebar is open
          if (selectedProduction?.id === productionForRework.id) {
            setDetailsSidebarOpen(false);
          }
        },
      });
    }
  };

  const handleSubmitForQA = (production: Production) => {
    setProductionForSubmit(production);
    setSubmitNotes('');
    setSubmitForQADialogOpen(true);
  };

  const confirmSubmitForQA = () => {
    if (productionForSubmit?.id && currentUser.staffId) {
      moveToStage.mutate({
        id: productionForSubmit.id,
        data: {
          stage: "Await QA",
          staffId: currentUser.staffId,
          notes: submitNotes || undefined,
        },
      }, {
        onSuccess: () => {
          setSubmitForQADialogOpen(false);
          setProductionForSubmit(null);
          setSubmitNotes('');
          // Refresh details if sidebar is open
          if (selectedProduction?.id === productionForSubmit.id) {
            setDetailsSidebarOpen(false);
          }
        },
      });
    }
  };

  const columns = useMemo(
    () => createProductionTrackingColumns(handleView, handleEdit, handleDelete, handleAssignTailor, handleQAReviewAction, handleOpenMoveToStock, handleRework, handleSubmitForQA),
    [handleView, handleEdit, handleDelete, handleAssignTailor, handleQAReviewAction, handleRework, handleSubmitForQA]
  );

  const emptyMessage = (
    <div className="flex flex-col space-y-3 items-center justify-center text-center min-h-[400px]">
      <NewPageIcon />
      <h2 className='font-medium text-xs'>No productions found</h2>
      <Button
        className="bg-gradient-to-r from-brand-800 to-brand-700 text-white pointer-events-auto"
        onClick={toggleDialog}
        type="button"
      >
        Create Production
      </Button>
    </div>
  );

  const errorComp = (
    <div className="flex flex-col space-y-3 items-center justify-center text-center min-h-[400px]">
      <PageErrorIcon />
      <h2 className='font-medium text-xs'>Failed to load productions</h2>
      <Button
        className="bg-gradient-to-r from-brand-800 to-brand-700 text-white pointer-events-auto"
        onClick={() => refetch()}
        type="button"
      >
        Retry
      </Button>
    </div>
  );

  // Don't render interactive elements until mounted
  if (!isMounted) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Production Tracking</h2>
          </div>
          <Separator />
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center min-h-[400px]">
            <DataTableLoader2 />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Production Tracking</h2>
          <Button
            className="bg-gradient-to-r from-brand-800 to-brand-700 text-white pointer-events-auto"
            onClick={toggleDialog}
            type="button"
          >
            <IoMdAdd />
            Create Production
          </Button>
        </div>
        <Separator />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <DataTableLoader2 />
          </div>
        ) : isError ? (
          errorComp
        ) : productions?.length === 0 ? (
          emptyMessage
        ) : (
          <DataTable
            key={`production-tracking-table-${productions?.length || 0}`}
            columns={columns}
            data={(productions || []).filter((prod: any) => !prod.movedToStock)}
            emptyMessage={emptyMessage}
          />
        )}
      </CardContent>

      {/* Dialog for Creating Production */}
      <CustomDialog open={open} toggleOpen={toggleDialog} dialogWidth="sm:max-w-[700px]">
        <ProductionForm closeDialog={toggleDialog} />
      </CustomDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this production.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProductionToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteProduction.isPending}
            >
              {deleteProduction.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Assign Tailor Dialog */}
      <AlertDialog open={assignTailorDialogOpen} onOpenChange={setAssignTailorDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Assign Tailor to Production</AlertDialogTitle>
            <AlertDialogDescription>
              Assign a tailor to {productionToAssign?.productionCode}. This will automatically move the production from "Bidding" to "In Production" stage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-xs">Select Tailor *</Label>
              <Select
                value={selectedTailorId || undefined}
                onValueChange={(value) => setSelectedTailorId(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a tailor" />
                </SelectTrigger>
                <SelectContent>
                  {staffs && staffs.length > 0 ? (
                    staffs.map((staff: any) => (
                      <SelectItem key={staff.id} value={staff.id.toString()}>
                        {staff.staffName || `${staff.firstName || ''} ${staff.lastName || ''}`.trim() || 'Unknown'} ({staff.role?.name || "No Role"})
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-xs text-gray-500 text-center">No staff available</div>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Notes (Optional)</Label>
              <Textarea
                placeholder="Add any notes about this assignment..."
                value={assignNotes}
                onChange={(e) => setAssignNotes(e.target.value)}
                rows={3}
              />
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
              <div className="flex items-start gap-2">
                <UserPlus className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-blue-900">
                  <p className="font-semibold text-xs mb-1">Stage Change Notice</p>
                  <p className="text-xs">
                    Assigning a tailor will automatically change the production stage from <span className="font-medium">"Bidding"</span> to <span className="font-medium">"In Production"</span>.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setProductionToAssign(null);
              setSelectedTailorId("");
              setAssignNotes('');
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAssignTailor}
              className="bg-purple-600 hover:bg-purple-700"
              disabled={!selectedTailorId || selectedTailorId === "" || assignTailor.isPending}
            >
              {assignTailor.isPending ? 'Assigning...' : 'Assign Tailor'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* QA Review Dialog */}
      <AlertDialog open={qaDialogOpen} onOpenChange={setQADialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>QA Review</AlertDialogTitle>
            <AlertDialogDescription>
              Review the quality of production {productionForQA?.productionCode}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-xs">QA Status *</Label>
              <Select value={qaStatus} onValueChange={(value: 'approved' | 'rejected') => setQAStatus(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {qaStatus === 'rejected' && (
              <div>
                <Label className="text-xs">Defects (comma-separated)</Label>
                <Input
                  placeholder="e.g., Stitching issues, Wrong size"
                  value={qaDefects}
                  onChange={(e) => setQADefects(e.target.value)}
                />
              </div>
            )}
            <div>
              <Label className="text-xs">Notes (Optional)</Label>
              <Textarea
                placeholder="Add any QA notes..."
                value={qaNotes}
                onChange={(e) => setQANotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setProductionForQA(null);
              setQAStatus('approved');
              setQADefects('');
              setQANotes('');
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmQAReview}
              className={qaStatus === 'approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              disabled={qaReview.isPending}
            >
              {qaReview.isPending ? 'Submitting...' : `${qaStatus === 'approved' ? 'Approve' : 'Reject'}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Move to Stock Dialog */}
      <AlertDialog open={moveToStockDialogOpen} onOpenChange={setMoveToStockDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Move Production to Stock</AlertDialogTitle>
            <AlertDialogDescription>
              Move completed production {productionForStock?.productionCode} to product stock
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-xs">Received By *</Label>
              <Select
                value={receivedById || undefined}
                onValueChange={(value) => setReceivedById(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select receiving staff" />
                </SelectTrigger>
                <SelectContent>
                  {staffs && staffs.length > 0 ? (
                    staffs.map((staff: any) => (
                      <SelectItem key={staff.id} value={staff.id.toString()}>
                        {staff.staffName || `${staff.firstName || ''} ${staff.lastName || ''}`.trim() || 'Unknown'}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-xs text-gray-500 text-center">No staff available</div>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Stock Location (Optional)</Label>
              <Input
                placeholder="e.g., Warehouse A, Shelf B3"
                value={stockLocation}
                onChange={(e) => setStockLocation(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs">Notes (Optional)</Label>
              <Textarea
                placeholder="Add any notes about moving to stock..."
                value={stockNotes}
                onChange={(e) => setStockNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setProductionForStock(null);
              setReceivedById("");
              setStockLocation('');
              setStockNotes('');
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmMoveToStock}
              className="bg-green-600 hover:bg-green-700"
              disabled={!receivedById || receivedById === "" || moveToStock.isPending}
            >
              {moveToStock.isPending ? 'Moving...' : 'Move to Stock'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rework Dialog */}
      <AlertDialog open={reworkDialogOpen} onOpenChange={setReworkDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send Production for Rework</AlertDialogTitle>
            <AlertDialogDescription>
              Send rejected production {productionForRework?.productionCode} back to the tailor for rework. The production will return to "In Production" stage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-xs">Notes (Optional)</Label>
              <Textarea
                placeholder="Add any notes about the rework requirements..."
                value={reworkNotes}
                onChange={(e) => setReworkNotes(e.target.value)}
                rows={4}
              />
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
              <div className="flex items-start gap-2">
                <RefreshCw className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-amber-900">
                  <p className="font-semibold text-xs mb-1">Rework Notice</p>
                  <p className="text-xs">
                    This production will be sent back to <span className="font-medium">{productionForRework?.tailor?.staffName || 'the assigned tailor'}</span> for rework.
                    The stage will automatically change from <span className="font-medium">&ldquo;Rejected&ldquo;</span> to <span className="font-medium">"In Production"</span>.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setProductionForRework(null);
              setReworkNotes('');
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRework}
              className="bg-amber-600 hover:bg-amber-700"
              disabled={reworkProduction.isPending}
            >
              {reworkProduction.isPending ? 'Sending for Rework...' : 'Send for Rework'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Submit for QA Dialog */}
      <AlertDialog open={submitForQADialogOpen} onOpenChange={setSubmitForQADialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Production for QA Review</AlertDialogTitle>
            <AlertDialogDescription>
              Mark production {productionForSubmit?.productionCode} as complete and submit it for quality assurance review.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-xs">Completion Notes (Optional)</Label>
              <Textarea
                placeholder="Add any notes about the completed work..."
                value={submitNotes}
                onChange={(e) => setSubmitNotes(e.target.value)}
                rows={4}
              />
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-blue-900">
                  <p className="font-semibold text-xs mb-1">QA Submission Notice</p>
                  <p className="text-xs">
                    This production will be marked as complete and submitted for QA review.
                    The stage will automatically change from <span className="font-medium">&ldquo;In Production&ldquo;</span> to <span className="font-medium">"Await QA"</span>.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setProductionForSubmit(null);
              setSubmitNotes('');
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSubmitForQA}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={moveToStage.isPending}
            >
              {moveToStage.isPending ? 'Submitting...' : 'Submit for QA'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Production Details Sidebar */}
      <Sheet open={detailsSidebarOpen} onOpenChange={setDetailsSidebarOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Production Details</SheetTitle>
            <SheetDescription>
              View detailed information and timeline for this production
            </SheetDescription>
          </SheetHeader>

          {detailedProduction && (
            <div className="mt-6 space-y-6">
              {/* Basic Information */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Production Information
                </h3>
                <div className="space-y-2 pl-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Production Code:</span>
                    <span className="font-mono font-medium text-brand-700">{detailedProduction.productionCode}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Product:</span>
                    <span className="font-medium">{detailedProduction.productDef?.name || '-'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="font-medium">{detailedProduction.quantity?.length || 0} size(s)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Current Stage:</span>
                    <span className={cn(
                      "px-2 py-1 rounded text-xs font-medium capitalize",
                      detailedProduction.currentStage === 'completed' && "bg-green-100 text-green-700",
                      detailedProduction.currentStage === 'in_production' && "bg-blue-100 text-blue-700",
                      detailedProduction.currentStage === 'await_qa' && "bg-amber-100 text-amber-700",
                      detailedProduction.currentStage === 'rejected' && "bg-red-100 text-red-700",
                      detailedProduction.currentStage === 'bidding' && "bg-purple-100 text-purple-700"
                    )}>
                      {detailedProduction.currentStage ? detailedProduction.currentStage.replace(/_/g, ' ') : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Start Date:</span>
                    <span className="font-medium">{detailedProduction.dateStarted ? formatDate(detailedProduction.dateStarted) : '-'}</span>
                  </div>
                  {detailedProduction.dateCompleted && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Completed:</span>
                      <span className="font-medium">{formatDate(detailedProduction.dateCompleted)}</span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Tailor Information */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Tailor Assignment
                </h3>
                <div className="space-y-2 pl-6">
                  {detailedProduction.tailor ? (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-medium">{detailedProduction.tailor.staffName}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium text-xs">{detailedProduction.tailor.email || '-'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-medium">{detailedProduction.tailor.phoneNumber || '-'}</span>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No tailor assigned yet</p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Timeline - Disabled: Backend endpoint not yet implemented */}
              {/* {timeline && timeline.length > 0 && (
                <>
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Production Timeline
                    </h3>
                    <div className="space-y-3 pl-6">
                      {timeline.map((event: any, index: number) => (
                        <div key={index} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className="w-2 h-2 rounded-full bg-brand-600 mt-1.5" />
                            {index < timeline.length - 1 && (
                              <div className="w-0.5 h-full bg-gray-200 my-1" />
                            )}
                          </div>
                          <div className="flex-1 pb-4">
                            <p className="text-sm font-medium">{event.event}</p>
                            <p className="text-xs text-gray-600 mt-0.5">{event.description}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {formatDate(event.createdAt)}
                              {event.performedBy && ` • ${event.performedBy.staffName}`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Separator />
                </>
              )} */}

              {/* Actions */}
              {!detailedProduction.movedToStock && (
                <div className="space-y-3 pt-2">
                  <h3 className="font-semibold text-sm text-gray-700">Actions</h3>
                  <div className="flex flex-col gap-2">
                    {/* Assign Tailor Button - Only show if no tailor assigned and stage is bidding */}
                    {!detailedProduction.tailor && detailedProduction.currentStage?.toLowerCase() === 'bidding' && (
                      <Button
                        onClick={() => {
                          handleAssignTailor(detailedProduction);
                          setDetailsSidebarOpen(false);
                        }}
                        variant="outline"
                        className="w-full justify-start border-purple-300 text-purple-700 hover:bg-purple-50"
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Assign Tailor
                      </Button>
                    )}
                    {/* QA Review Button - Only show if stage is in production */}
                    {detailedProduction.currentStage?.toLowerCase() === 'in production' && !detailedProduction.dateCompleted && (
                      <Button
                        onClick={() => {
                          handleQAReviewAction(detailedProduction);
                          setDetailsSidebarOpen(false);
                        }}
                        variant="outline"
                        className="w-full justify-start border-blue-300 text-blue-700 hover:bg-blue-50"
                      >
                        <FileCheck className="mr-2 h-4 w-4" />
                        QA Review
                      </Button>
                    )}
                    {/* Move to Stock Button - Only show if stage is completed */}
                    {detailedProduction.currentStage?.toLowerCase() === 'completed' && !detailedProduction.movedToStock && (
                      <Button
                        onClick={() => handleOpenMoveToStock(detailedProduction)}
                        className="w-full justify-start bg-green-600 hover:bg-green-700 text-white"
                        disabled={moveToStock.isPending}
                      >
                        <Box className="mr-2 h-4 w-4" />
                        {moveToStock.isPending ? 'Moving...' : 'Move to Stock'}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </Card>
  );
};

export default ProductionTrackingTable;
