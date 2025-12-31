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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { assignToProductionSchema, AssignToProductionFormData } from "@/schemas/productionOrderSchema";
import { useAssignToProduction } from "@/hooks/useProductionOrders";
import { useProductions } from "@/hooks/useProductions";
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
  const { data: productions, isLoading: loadingProductions } = useProductions({ page: 1, limit: 100 });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<AssignToProductionFormData>({
    resolver: zodResolver(assignToProductionSchema),
  });

  const onSubmit = (data: AssignToProductionFormData) => {
    if (!order?.id || !currentUser.staffId) return;

    assignMutation.mutate(
      {
        id: order.id,
        data: {
          productionId: data.productionId,
          assignedBy: currentUser.staffId,
          notes: data.notes,
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
          <AlertDialogTitle>Assign to Production</AlertDialogTitle>
          <AlertDialogDescription>
            Link order {order.orderNo} to a production job
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          {/* Production Selection */}
          <div className="space-y-2">
            <Label htmlFor="productionId">
              Select Production <span className="text-red-500">*</span>
            </Label>
            <Select
              onValueChange={(value) => setValue("productionId", parseInt(value), { shouldValidate: true })}
              disabled={loadingProductions}
            >
              <SelectTrigger id="productionId">
                <SelectValue placeholder={loadingProductions ? "Loading productions..." : "Select a production..."} />
              </SelectTrigger>
              <SelectContent>
                {loadingProductions ? (
                  <div className="p-2 text-center text-sm text-gray-500">
                    Loading productions...
                  </div>
                ) : !productions || productions.length === 0 ? (
                  <div className="p-2 text-center text-sm text-gray-500">
                    No available productions found
                  </div>
                ) : (
                  productions
                    .filter((prod: any) =>
                      !prod.movedToStock &&
                      (prod.stage === 'bidding' || prod.stage === 'in production')
                    ) // Only show productions in bidding or in production stage
                    .map((production: any) => (
                      <SelectItem key={production.id} value={production.id.toString()}>
                        <div className="flex flex-col">
                          <span className="font-medium">{production.code}</span>
                          <span className="text-xs text-gray-500">
                            {production.productInfo?.name} - Size {production.productInfo?.size} - {production.stage}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                )}
              </SelectContent>
            </Select>
            {errors.productionId && (
              <p className="text-sm text-red-600">{errors.productionId.message}</p>
            )}
            <p className="text-xs text-gray-500">
              Select an existing production job to link this order to
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
