/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useAdjustMaterialStock } from "@/hooks/useMaterials";
import { useMe } from "@/hooks/useAuth";

const formSchema = z.object({
  quantity: z.number().min(1, "Quantity must be at least 1"),
  adjustmentType: z.enum(["increase", "decrease"]),
  reason: z.string().min(1, "Reason is required"),
});

type FormData = z.infer<typeof formSchema>;

interface AdjustStockDialogProps {
  material: any;
  open: boolean;
  onClose: () => void;
}

export function AdjustStockDialog({ material, open, onClose }: AdjustStockDialogProps) {
  const adjustStock = useAdjustMaterialStock();
  const { data: user } = useMe();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantity: 1,
      adjustmentType: "increase",
      reason: "",
    },
  });

  const adjustmentType = form.watch("adjustmentType");

  const onSubmit = async (data: FormData) => {
    adjustStock.mutate(
      {
        itemId: material.id,
        quantity: data.quantity,
        adjustmentType: data.adjustmentType,
        reason: data.reason,
        staffId: user?.id || 1,
      },
      {
        onSuccess: () => {
          form.reset();
          onClose();
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adjust Stock - {material.itemName}</DialogTitle>
          <DialogDescription>
            Make manual adjustments to stock levels. Current quantity: {material.quantity} {material.unit || "units"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="adjustmentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adjustment Type *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="increase">Increase Stock</SelectItem>
                      <SelectItem value="decrease">Decrease Stock</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      placeholder="Enter quantity"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-sm text-gray-500">
                    New quantity will be:{" "}
                    <span className="font-semibold">
                      {adjustmentType === "increase"
                        ? material.quantity + (form.watch("quantity") || 0)
                        : material.quantity - (form.watch("quantity") || 0)}
                    </span>
                  </p>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason *</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Damaged stock, Inventory correction" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={adjustStock.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={adjustStock.isPending}>
                {adjustStock.isPending ? "Adjusting..." : "Adjust Stock"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
