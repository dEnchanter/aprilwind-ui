/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { assignToProductionSchema, AssignToProductionFormData } from "@/schemas/productionOrderSchema";
import { useAssignToProduction } from "@/hooks/useProductionOrders";
import { ProductionOrder } from "@/types/production-order";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface AssignToProductionDialogProps {
  order: ProductionOrder | null;
  open: boolean;
  onClose: () => void;
}

export function AssignToProductionDialog({ order, open, onClose }: AssignToProductionDialogProps) {
  const currentUser = useCurrentUser();
  const assignMutation = useAssignToProduction();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AssignToProductionFormData>({
    resolver: zodResolver(assignToProductionSchema),
  });

  const onSubmit = (data: AssignToProductionFormData) => {
    if (!order?.id || !currentUser.staffId) return;

    assignMutation.mutate(
      {
        id: order.id,
        data: {
          ...data,
          assignedBy: currentUser.staffId,
        } as any,
      },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
      }
    );
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!order) return null;

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>Assign to Production</AlertDialogTitle>
          <AlertDialogDescription>
            Link order {order.orderNo} to a production job
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          {/* Production ID */}
          <div className="space-y-2">
            <Label htmlFor="productionId">
              Production Job ID <span className="text-red-500">*</span>
            </Label>
            <Input
              id="productionId"
              type="number"
              placeholder="Enter production job ID"
              {...register("productionId")}
            />
            {errors.productionId && (
              <p className="text-sm text-red-600">{errors.productionId.message}</p>
            )}
            <p className="text-xs text-gray-500">
              The ID of the production job this order will be linked to
            </p>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Assignment Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about the assignment..."
              rows={3}
              {...register("notes")}
            />
          </div>

          <AlertDialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={assignMutation.isPending}
            >
              {assignMutation.isPending ? "Assigning..." : "Assign to Production"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
