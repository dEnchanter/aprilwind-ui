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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cancelOrderSchema, CancelOrderFormData } from "@/schemas/productionOrderSchema";
import { useCancelProductionOrder } from "@/hooks/useProductionOrders";
import { ProductionOrder } from "@/types/production-order";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface CancelOrderDialogProps {
  order: ProductionOrder | null;
  open: boolean;
  onClose: () => void;
}

export function CancelOrderDialog({ order, open, onClose }: CancelOrderDialogProps) {
  const currentUser = useCurrentUser();
  const cancelMutation = useCancelProductionOrder();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CancelOrderFormData>({
    resolver: zodResolver(cancelOrderSchema),
  });

  const onSubmit = (data: CancelOrderFormData) => {
    if (!order?.id || !currentUser.staffId) return;

    cancelMutation.mutate(
      {
        id: order.id,
        data: {
          cancelledBy: currentUser.staffId,
          reason: data.reason,
        },
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
          <AlertDialogTitle>Cancel Production Order</AlertDialogTitle>
          <AlertDialogDescription>
            Cancel order {order.orderNo}. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          {/* Warning */}
          <div className="p-4 bg-red-50 rounded-md border border-red-200">
            <p className="text-sm text-red-800 font-medium mb-1">
              ⚠️ Warning
            </p>
            <p className="text-xs text-red-700">
              Cancelling this order will stop all associated processes and cannot be reversed.
            </p>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">
              Cancellation Reason <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="reason"
              placeholder="Why is this order being cancelled?"
              rows={6}
              {...register("reason")}
            />
            {errors.reason && (
              <p className="text-sm text-red-600">{errors.reason.message}</p>
            )}
          </div>

          <AlertDialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Go Back
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? "Cancelling..." : "Cancel Order"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
