/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

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
import { useDeleteMaterial } from "@/hooks/useMaterials";

interface DeleteMaterialDialogProps {
  material: any;
  open: boolean;
  onClose: () => void;
}

export function DeleteMaterialDialog({ material, open, onClose }: DeleteMaterialDialogProps) {
  const deleteMaterial = useDeleteMaterial();

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    deleteMaterial.mutate(material.id, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete <span className="font-semibold">{material.itemName}</span>.
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMaterial.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteMaterial.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleteMaterial.isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
