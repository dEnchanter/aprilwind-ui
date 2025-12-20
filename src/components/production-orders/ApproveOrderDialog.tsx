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
import { approveOrderSchema, ApproveOrderFormData } from "@/schemas/productionOrderSchema";
import { useApproveProductionOrder } from "@/hooks/useProductionOrders";
import { ProductionOrder } from "@/types/production-order";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface ApproveOrderDialogProps {
  order: ProductionOrder | null;
  open: boolean;
  onClose: () => void;
}

export function ApproveOrderDialog({ order, open, onClose }: ApproveOrderDialogProps) {
  const currentUser = useCurrentUser();
  const approveOrderMutation = useApproveProductionOrder();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ApproveOrderFormData>({
    resolver: zodResolver(approveOrderSchema),
    defaultValues: {
      agreedTotalCost: order?.estimatedTotalCost || 0,
      expectedDeliveryDate: order?.expectedDeliveryDate || "",
      notes: "",
    },
  });

  const onSubmit = (data: ApproveOrderFormData) => {
    if (!order?.id || !currentUser.staffId) return;

    approveOrderMutation.mutate(
      {
        id: order.id,
        data: {
          ...data,
          approvedBy: currentUser.staffId,
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
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Approve Production Order</AlertDialogTitle>
          <AlertDialogDescription>
            Review and approve order {order.orderNo} from {order.customer?.name}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          {/* Order Summary */}
          <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
            <h4 className="font-semibold text-sm mb-2">Order Summary</h4>
            <div className="space-y-1 text-sm">
              <p><span className="text-gray-600">Customer:</span> {order.customer?.name}</p>
              <p><span className="text-gray-600">Order Date:</span> {new Date(order.orderDate).toLocaleDateString()}</p>
              <p><span className="text-gray-600">Items:</span> {order.orderDetails?.length || 0}</p>
              <p><span className="text-gray-600">Estimated Cost:</span> ₦{order.estimatedTotalCost?.toLocaleString()}</p>
            </div>
          </div>

          {/* Agreed Total Cost */}
          <div className="space-y-2">
            <Label htmlFor="agreedTotalCost">
              Agreed Total Cost <span className="text-red-500">*</span>
            </Label>
            <Input
              id="agreedTotalCost"
              type="number"
              step="0.01"
              placeholder="Enter agreed total cost"
              {...register("agreedTotalCost")}
            />
            {errors.agreedTotalCost && (
              <p className="text-sm text-red-600">{errors.agreedTotalCost.message}</p>
            )}
          </div>

          {/* Expected Delivery Date */}
          <div className="space-y-2">
            <Label htmlFor="expectedDeliveryDate">Expected Delivery Date</Label>
            <Input
              id="expectedDeliveryDate"
              type="date"
              {...register("expectedDeliveryDate")}
            />
            {errors.expectedDeliveryDate && (
              <p className="text-sm text-red-600">{errors.expectedDeliveryDate.message}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Approval Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about the approval..."
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
              disabled={approveOrderMutation.isPending}
            >
              {approveOrderMutation.isPending ? "Approving..." : "Approve Order"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
