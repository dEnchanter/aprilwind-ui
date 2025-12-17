"use client"

import React, { useState, useMemo, useCallback } from 'react';
import { DataTableLoader2 } from '../utils/loader';
import Template from '../utils/template';
import { NewPageIcon, PageErrorIcon } from '../utils/icons';
import { Button } from '../ui/button';
import { IoMdAdd } from "react-icons/io";
import { Card, CardContent, CardHeader } from '../ui/card';
import { Separator } from '../ui/separator';
import { DataTable } from './utils/data-table';
import CustomDialog from '../dialog/CustomDialog';
import { useMaterialRequests, useDeleteMaterialRequest } from '@/hooks/useMaterialRequest';
import { createMaterialRequestColumns } from '@/app/(dashboard)/material-request/columns';
import MaterialRequestForm from '../forms/MaterialRequestForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const MaterialRequestTable = () => {
  const { data: materialRequestsResponse, isLoading, isError, refetch } = useMaterialRequests();
  const deleteMaterialRequest = useDeleteMaterialRequest();
  const materialRequests = materialRequestsResponse?.data || [];

  const [open, setOpen] = useState(false);
  const [editMaterialRequest, setEditMaterialRequest] = useState<Partial<MaterialRequest> | undefined>(undefined);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MaterialRequest | null>(null);

  const toggleDialog = () => {
    setOpen(!open);
    if (open) {
      setEditMaterialRequest(undefined);
    }
  };

  const handleView = useCallback((materialRequest: MaterialRequest) => {
    // For now, just open edit dialog when viewing
    setEditMaterialRequest(materialRequest);
    setOpen(true);
  }, []);

  const handleEdit = useCallback((materialRequest: MaterialRequest) => {
    setEditMaterialRequest(materialRequest);
    setOpen(true);
  }, []);

  const handleDelete = useCallback((materialRequest: MaterialRequest) => {
    setSelectedRequest(materialRequest);
    setDeleteDialog(true);
  }, []);

  const confirmDelete = () => {
    if (selectedRequest) {
      deleteMaterialRequest.mutate(selectedRequest.id, {
        onSuccess: () => {
          setDeleteDialog(false);
          setSelectedRequest(null);
        },
      });
    }
  };

  // Create columns with handlers
  const columns = useMemo(
    () => createMaterialRequestColumns(handleView, handleEdit, handleDelete),
    [handleView, handleEdit, handleDelete]
  );

  const emptyMessage = (
    <div className="flex flex-col space-y-3 items-center justify-center text-center min-h-[400px]">
      <NewPageIcon />
      <h2 className='font-medium text-xs'>No material requests found</h2>
      <Button className="bg-gradient-to-r from-brand-800 to-brand-700 text-white" onClick={toggleDialog}>
        Create Material Request
      </Button>
    </div>
  );

  const errorComp = (
    <div className="flex flex-col space-y-3 items-center justify-center text-center min-h-[400px]">
      <PageErrorIcon />
      <h2 className='font-medium text-xs'>Failed to load material requests</h2>
      <Button className="bg-gradient-to-r from-brand-800 to-brand-700 text-white" onClick={() => refetch()}>
        Retry
      </Button>
    </div>
  );

  return (
    <Template>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Manage Material Requests</h2>
            <Button className="bg-gradient-to-r from-brand-800 0% to-brand-700 70% text-white" onClick={toggleDialog}>
              <IoMdAdd />
              Create Material Request
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
          ) : materialRequests.length === 0 ? (
            emptyMessage
          ) : (
            <DataTable
              columns={columns}
              data={materialRequests}
              emptyMessage={emptyMessage}
            />
          )}

          {/* Custom Dialog for Creating/Editing Material Request */}
          <CustomDialog open={open} toggleOpen={toggleDialog} dialogWidth="sm:max-w-[700px]">
            <MaterialRequestForm closeDialog={toggleDialog} initialValues={editMaterialRequest} />
          </CustomDialog>

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Material Request</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this material request? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={confirmDelete}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={deleteMaterialRequest.isPending}
                >
                  {deleteMaterialRequest.isPending ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </Template>
  );
};

export default MaterialRequestTable;
