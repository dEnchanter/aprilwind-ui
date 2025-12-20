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
import { completeOrderSchema, CompleteOrderFormData } from "@/schemas/productionOrderSchema";
import { useCompleteProductionOrder } from "@/hooks/useProductionOrders";
import { ProductionOrder } from "@/types/production-order";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface CompleteOrderDialogProps {
  order: ProductionOrder | null;
  open: boolean;
  onClose: () => void;
}

export function CompleteOrderDialog({ order, open, onClose }: CompleteOrderDialogProps) {
  const currentUser = useCurrentUser();
  const completeMutation = useCompleteProductionOrder();

  const {
    register,
    handleSubmit,
    reset,
  } = useForm<CompleteOrderFormData>({
    resolver: zodResolver(completeOrderSchema),
  });

  const onSubmit = (data: CompleteOrderFormData) => {
    if (!order?.id || !currentUser.staffId) return;

    completeMutation.mutate(
      {
        id: order.id,
        data: {
          ...data,
          completedBy: currentUser.staffId,
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
          <AlertDialogTitle>Complete Production Order</AlertDialogTitle>
          <AlertDialogDescription>
            Mark order {order.orderNo} as completed
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="p-4 bg-green-50 rounded-md border border-green-200">
            <p className="text-sm text-green-800">
              This will mark the production as completed and ready for delivery.
            </p>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Completion Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about the completion..."
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
              className="bg-green-600 hover:bg-green-700"
              disabled={completeMutation.isPending}
            >
              {completeMutation.isPending ? "Completing..." : "Mark as Completed"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
