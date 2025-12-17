// components/tables/ProductDefTable.tsx
/* eslint-disable react/no-unescaped-entities */
"use client"

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Button } from '../ui/button';
import { IoMdAdd } from 'react-icons/io';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Separator } from '../ui/separator';
import { DataTable } from './utils/data-table';
import CustomDialog from '../dialog/CustomDialog';
import { useProductDef, useDeleteProductDef } from '@/hooks/useProductDef';
import { createProductDefColumns } from '@/app/(dashboard)/production-management/columns2';
import ProductDefForm from '../forms/ProductDefForm';
import { DataTableLoader2 } from '../utils/loader';
import { NewPageIcon, PageErrorIcon } from '../utils/icons';
import ProductDefDetailsSidebar from '../sidebars/ProductDefDetailsSidebar';
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

const ProductDefTable = () => {
  const [isMounted, setIsMounted] = useState(false);

  const { data: productDefs, isLoading, isError, refetch } = useProductDef({ page: 1, limit: 100 });
  const deleteProductDef = useDeleteProductDef();

  const [open, setOpen] = useState(false);
  const [editProductDef, setEditProductDef] = useState<Partial<ProductDef> | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productDefToDelete, setProductDefToDelete] = useState<ProductDef | null>(null);
  const [detailsSidebarOpen, setDetailsSidebarOpen] = useState(false);
  const [selectedProductDef, setSelectedProductDef] = useState<ProductDef | null>(null);

  // Ensure component is mounted before enabling interactions
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleDialog = () => {
    setOpen(!open);
    if (open) {
      setEditProductDef(undefined);
    }
  };

  const handleEdit = useCallback((productDef: ProductDef) => {
    setEditProductDef(productDef);
    setOpen(true);
  }, []);

  const handleDelete = useCallback((productDef: ProductDef) => {
    setProductDefToDelete(productDef);
    setDeleteDialogOpen(true);
  }, []);

  const confirmDelete = () => {
    if (productDefToDelete?.id) {
      deleteProductDef.mutate(productDefToDelete.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setProductDefToDelete(null);
        },
      });
    }
  };

  const handleView = useCallback((productDef: ProductDef) => {
    setSelectedProductDef(productDef);
    setDetailsSidebarOpen(true);
  }, []);

  const columns = useMemo(
    () => createProductDefColumns(handleEdit, handleDelete, handleView),
    [handleEdit, handleDelete, handleView]
  );

  const emptyMessage = (
    <div className="flex flex-col space-y-3 items-center justify-center text-center min-h-[400px]">
      <NewPageIcon />
      <h2 className='font-medium text-xs'>No product definitions found</h2>
      <Button
        className="bg-gradient-to-r from-brand-800 to-brand-700 text-white pointer-events-auto"
        onClick={toggleDialog}
        type="button"
      >
        Create Product Definition
      </Button>
    </div>
  );

  const errorComp = (
    <div className="flex flex-col space-y-3 items-center justify-center text-center min-h-[400px]">
      <PageErrorIcon />
      <h2 className='font-medium text-xs'>Failed to load product definitions</h2>
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
            <h2 className="text-lg font-semibold">Manage Product Definitions</h2>
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
          <h2 className="text-lg font-semibold">Manage Product Definitions</h2>
          <Button
            className="bg-gradient-to-r from-brand-800 to-brand-700 text-white pointer-events-auto"
            onClick={toggleDialog}
            type="button"
          >
            <IoMdAdd />
            Create Product Definition
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
        ) : productDefs?.length === 0 ? (
          emptyMessage
        ) : (
          <DataTable
            key={`product-def-table-${productDefs?.length || 0}`}
            columns={columns}
            data={productDefs || []}
            emptyMessage={emptyMessage}
          />
        )}
      </CardContent>

      {/* Dialog for Creating/Editing Product Definition */}
      <CustomDialog open={open} toggleOpen={toggleDialog} dialogWidth="sm:max-w-[700px]">
        <ProductDefForm closeDialog={toggleDialog} initialValues={editProductDef} />
      </CustomDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the product definition "{productDefToDelete?.name}" ({productDefToDelete?.code}).
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProductDefToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteProductDef.isPending}
            >
              {deleteProductDef.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Details Sidebar */}
      <ProductDefDetailsSidebar
        open={detailsSidebarOpen}
        onClose={() => setDetailsSidebarOpen(false)}
        productDef={selectedProductDef}
      />
    </Card>
  );
};

export default ProductDefTable;
