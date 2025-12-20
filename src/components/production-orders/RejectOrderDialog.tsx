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
import { rejectOrderSchema, RejectOrderFormData } from "@/schemas/productionOrderSchema";
import { useRejectProductionOrder } from "@/hooks/useProductionOrders";
import { ProductionOrder } from "@/types/production-order";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface RejectOrderDialogProps {
  order: ProductionOrder | null;
  open: boolean;
  onClose: () => void;
}

export function RejectOrderDialog({ order, open, onClose }: RejectOrderDialogProps) {
  const currentUser = useCurrentUser();
  const rejectOrderMutation = useRejectProductionOrder();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RejectOrderFormData>({
    resolver: zodResolver(rejectOrderSchema),
  });

  const onSubmit = (data: RejectOrderFormData) => {
    if (!order?.id || !currentUser.staffId) return;

    rejectOrderMutation.mutate(
      {
        id: order.id,
        data: {
          ...data,
          rejectedBy: currentUser.staffId,
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
          <AlertDialogTitle>Reject Production Order</AlertDialogTitle>
          <AlertDialogDescription>
            Provide a reason for rejecting order {order.orderNo}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">
              Reason for Rejection <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="reason"
              placeholder="Why is this order being rejected?"
              rows={4}
              {...register("reason")}
            />
            {errors.reason && (
              <p className="text-sm text-red-600">{errors.reason.message}</p>
            )}
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any additional information..."
              rows={2}
              {...register("notes")}
            />
          </div>

          <AlertDialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={rejectOrderMutation.isPending}
            >
              {rejectOrderMutation.isPending ? "Rejecting..." : "Reject Order"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
