/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
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
import { useCreateProductionFromOrder } from "@/hooks/useProductionOrders";
import { ProductionOrder } from "@/types/production-order";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Factory } from "lucide-react";

interface CreateProductionFromOrderDialogProps {
  order: ProductionOrder | null;
  open: boolean;
  onClose: () => void;
}

export function CreateProductionFromOrderDialog({
  order,
  open,
  onClose,
}: CreateProductionFromOrderDialogProps) {
  const currentUser = useCurrentUser();
  const createProductionMutation = useCreateProductionFromOrder();
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!order?.id || !currentUser.staffId) return;

    createProductionMutation.mutate(
      {
        id: order.id,
        data: {
          createdBy: currentUser.staffId,
          notes: notes.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          setNotes("");
          onClose();
        },
      }
    );
  };

  const handleClose = () => {
    setNotes("");
    onClose();
  };

  if (!order) return null;

  const totalItems = order.orderDetails?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Factory className="h-5 w-5 text-blue-600" />
            Create Production from Order
          </AlertDialogTitle>
          <AlertDialogDescription>
            This will create a new production job from order {order.orderNo} and automatically link them
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Order Summary */}
          <div className="p-4 bg-blue-50 rounded-md border border-blue-200">
            <h4 className="font-semibold text-sm mb-3 text-blue-900">Order Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">Customer:</span>
                <span className="font-medium text-blue-900">{order.customer?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Total Items:</span>
                <span className="font-medium text-blue-900">{totalItems} units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Agreed Cost:</span>
                <span className="font-medium text-blue-900">
                  ₦{Number(order.agreedTotalCost || 0).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Expected Delivery:</span>
                <span className="font-medium text-blue-900">
                  {new Date(order.expectedDeliveryDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Products to Manufacture</Label>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {order.orderDetails?.map((item, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-50 rounded-md border border-gray-200 text-sm"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.productName}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        Size {item.size} • Quantity: {item.quantity}
                      </p>
                      {item.specifications && (
                        <p className="text-xs text-gray-500 mt-1 italic">
                          {item.specifications}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Info Box */}
          <div className="p-4 bg-green-50 rounded-md border border-green-200">
            <p className="text-sm text-green-800">
              <strong>✓ What happens next:</strong>
            </p>
            <ul className="mt-2 text-xs text-green-700 space-y-1 ml-4 list-disc">
              <li>A new production job will be created in &quot;Bidding&quot; stage</li>
              <li>The production will be automatically linked to this order</li>
              <li>Order status will change to &quot;In Production&quot;</li>
              <li>You can track production progress in the Productions page</li>
            </ul>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Production Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this production..."
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <AlertDialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={createProductionMutation.isPending}
            >
              {createProductionMutation.isPending ? "Creating Production..." : "Create Production"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
