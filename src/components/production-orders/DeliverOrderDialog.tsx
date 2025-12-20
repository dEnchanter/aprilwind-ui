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
import { deliverOrderSchema, DeliverOrderFormData } from "@/schemas/productionOrderSchema";
import { useDeliverProductionOrder } from "@/hooks/useProductionOrders";
import { ProductionOrder } from "@/types/production-order";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface DeliverOrderDialogProps {
  order: ProductionOrder | null;
  open: boolean;
  onClose: () => void;
}

export function DeliverOrderDialog({ order, open, onClose }: DeliverOrderDialogProps) {
  const currentUser = useCurrentUser();
  const deliverMutation = useDeliverProductionOrder();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DeliverOrderFormData>({
    resolver: zodResolver(deliverOrderSchema),
    defaultValues: {
      actualDeliveryDate: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = (data: DeliverOrderFormData) => {
    if (!order?.id || !currentUser.staffId) return;

    deliverMutation.mutate(
      {
        id: order.id,
        data: {
          ...data,
          deliveredBy: currentUser.staffId,
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

  const expectedDate = new Date(order.expectedDeliveryDate);
  const isLate = new Date() > expectedDate;

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>Deliver Production Order</AlertDialogTitle>
          <AlertDialogDescription>
            Mark order {order.orderNo} as delivered to customer
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          {/* Delivery Performance Indicator */}
          <div className={`p-4 rounded-md border ${isLate ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'}`}>
            <p className="text-sm font-medium mb-1">
              {isLate ? '⚠️ Late Delivery' : '✓ On-Time Delivery'}
            </p>
            <p className="text-xs">
              Expected: {expectedDate.toLocaleDateString()}
            </p>
          </div>

          {/* Actual Delivery Date */}
          <div className="space-y-2">
            <Label htmlFor="actualDeliveryDate">
              Actual Delivery Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="actualDeliveryDate"
              type="date"
              {...register("actualDeliveryDate")}
            />
            {errors.actualDeliveryDate && (
              <p className="text-sm text-red-600">{errors.actualDeliveryDate.message}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Delivery Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about the delivery..."
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
              disabled={deliverMutation.isPending}
            >
              {deliverMutation.isPending ? "Delivering..." : "Mark as Delivered"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
