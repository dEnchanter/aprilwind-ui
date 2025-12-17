// components/tables/ProductForProductionTable.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Button } from '../ui/button';
import { IoMdAdd } from 'react-icons/io';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Separator } from '../ui/separator';
import { DataTable } from './utils/data-table';
import { formatDate } from '@/lib/utils';
import CustomDialog from '../dialog/CustomDialog';
import { useProductions, useDeleteProduction } from '@/hooks/useProductions';
import { createProductForProductionColumns } from '@/app/(dashboard)/production-management/productForProductionColumns';
import { fetchGet } from '@/services/fetcher';
import { Endpoint } from '@/services/api';
import ProductForProductionForm from '../forms/ProductForProductionForm';
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
import { Package, User, Hash } from 'lucide-react';

const ProductForProductionTable = () => {
  const [isMounted, setIsMounted] = useState(false);

  const { data: productions, isLoading, isError, refetch } = useProductions({ page: 1, limit: 100 });
  const deleteProduction = useDeleteProduction();

  const [open, setOpen] = useState(false);
  const [editProduction, setEditProduction] = useState<any | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productionToDelete, setProductionToDelete] = useState<any | null>(null);
  const [detailsSidebarOpen, setDetailsSidebarOpen] = useState(false);
  const [selectedProduction, setSelectedProduction] = useState<any | null>(null);

  // Ensure component is mounted before enabling interactions
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleDialog = () => {
    setOpen(!open);
    if (open) {
      setEditProduction(undefined);
    }
  };

  const handleEdit = useCallback((production: any) => {
    setEditProduction(production);
    setOpen(true);
  }, []);

  const handleDelete = useCallback((production: any) => {
    setProductionToDelete(production);
    setDeleteDialogOpen(true);
  }, []);

  const handleView = useCallback((production: any) => {
    setSelectedProduction(production);
    setDetailsSidebarOpen(true);
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

  // Fetch material request data for each production
  // Create a map of productionId -> material request summary
  const [materialRequestsMap, setMaterialRequestsMap] = useState<Map<number, any>>(new Map());

  useEffect(() => {
    const fetchMaterialRequests = async () => {
      if (!productions || productions.length === 0) {
        setMaterialRequestsMap(new Map());
        return;
      }

      const map = new Map();

      // Fetch material requests for each production
      await Promise.all(
        productions.map(async (production: any) => {
          try {
            const data = await fetchGet<any>(
              Endpoint.GET_MATERIAL_REQUESTS_BY_PRODUCTION(production.id)
            );
            map.set(production.id, data);
          } catch (error) {
            // If fetch fails, set empty data
            map.set(production.id, { summary: { total: 0, approved: 0, pending: 0 } });
          }
        })
      );

      setMaterialRequestsMap(map);
    };

    fetchMaterialRequests();
  }, [productions]);

  const columns = useMemo(
    () => createProductForProductionColumns(handleEdit, handleDelete, handleView, materialRequestsMap),
    [handleEdit, handleDelete, handleView, materialRequestsMap]
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
            <h2 className="text-lg font-semibold">Manage Productions</h2>
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
          <h2 className="text-lg font-semibold">Manage Productions</h2>
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
            key={`production-table-${productions?.length || 0}`}
            columns={columns}
            data={productions || []}
            emptyMessage={emptyMessage}
          />
        )}
      </CardContent>

      {/* Dialog for Creating/Editing Production */}
      <CustomDialog open={open} toggleOpen={toggleDialog} dialogWidth="sm:max-w-[700px]">
        <ProductForProductionForm closeDialog={toggleDialog} initialValues={editProduction} />
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

      {/* Production Details Sidebar */}
      <Sheet open={detailsSidebarOpen} onOpenChange={setDetailsSidebarOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Production Details</SheetTitle>
            <SheetDescription>
              View detailed information about this production
            </SheetDescription>
          </SheetHeader>

          {selectedProduction && (
            <div className="mt-6 space-y-6">
              {/* Basic Information */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Basic Information
                </h3>
                <div className="space-y-2 pl-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Product Name:</span>
                    <span className="font-medium">{selectedProduction.product?.name || '-'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Product Code:</span>
                    <span className="font-medium">{selectedProduction.product?.code || '-'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Product Cost:</span>
                    <span className="font-medium">₦{selectedProduction.product?.cost?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      selectedProduction.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedProduction.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Request Information */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Request Information
                </h3>
                <div className="space-y-2 pl-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Requested By:</span>
                    <span className="font-medium">{selectedProduction.requester?.staffName || `Staff #${selectedProduction.requestedBy}`}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium text-xs">{selectedProduction.requester?.email || '-'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{selectedProduction.requester?.phoneNumber || '-'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Date Requested:</span>
                    <span className="font-medium">{selectedProduction.dateRequested ? formatDate(selectedProduction.dateRequested) : '-'}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Size & Quantity Breakdown */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  Size & Quantity Breakdown
                </h3>
                <div className="space-y-2 pl-6">
                  {selectedProduction.quantity && selectedProduction.quantity.length > 0 ? (
                    <>
                      {selectedProduction.quantity.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between text-sm p-2 bg-gray-50 rounded">
                          <span className="text-gray-600">Size {item.size}:</span>
                          <span className="font-medium">{item.quantity} units</span>
                        </div>
                      ))}
                      <div className="flex justify-between text-sm p-2 bg-brand-50 rounded border border-brand-200 mt-2">
                        <span className="font-semibold text-brand-800">Total Quantity:</span>
                        <span className="font-bold text-brand-800">
                          {selectedProduction.quantity.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0)} units
                        </span>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">No quantity information available</p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Product Guide / Materials */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Materials Required
                </h3>
                <div className="space-y-2 pl-6">
                  {selectedProduction.productGuide && selectedProduction.productGuide.length > 0 ? (
                    selectedProduction.productGuide.filter((guide: any) => guide.materialDetails).map((guide: any, index: number) => (
                      <div key={index} className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 text-sm space-y-2">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-semibold text-blue-900">
                              {guide.materialDetails?.name || `Material #${guide.id}`}
                            </div>
                            <div className="text-xs text-blue-600 mt-0.5">
                              {guide.materialDetails?.code && `Code: ${guide.materialDetails.code}`}
                              {guide.materialDetails?.type?.name && ` • ${guide.materialDetails.type.name}`}
                            </div>
                            {guide.materialDetails?.description && (
                              <div className="text-xs text-gray-600 mt-1">
                                {guide.materialDetails.description}
                              </div>
                            )}
                          </div>
                          <div className="text-right ml-3">
                            <div className="font-bold text-brand-700 whitespace-nowrap">
                              {guide.qty} {guide.materialDetails?.type?.unit || 'units'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No materials defined</p>
                  )}
                </div>
              </div>

              {/* Material Requests */}
              {selectedProduction.materialRequests && selectedProduction.materialRequests.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm text-gray-700">Material Requests</h3>
                    <div className="space-y-2 pl-6">
                      {selectedProduction.materialRequests.map((request: any, index: number) => (
                        <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                          <span className="font-medium">Request #{index + 1}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </Card>
  );
};

export default ProductForProductionTable;
