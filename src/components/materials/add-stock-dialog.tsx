/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { useAddMaterialStock } from "@/hooks/useMaterials";
import { useMe } from "@/hooks/useAuth";

const formSchema = z.object({
  quantity: z.number().min(1, "Quantity must be at least 1"),
  supplier: z.string().optional(),
  unitCost: z.number().min(0).optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface AddStockDialogProps {
  material: any;
  open: boolean;
  onClose: () => void;
}

// Format number as currency with commas and 2 decimal places
const formatCurrency = (value: number | string): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
  return numValue.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Parse formatted currency string back to number
const parseCurrency = (value: string): number => {
  const cleaned = value.replace(/,/g, '');
  return parseFloat(cleaned) || 0;
};

export function AddStockDialog({ material, open, onClose }: AddStockDialogProps) {
  const addStock = useAddMaterialStock();
  const { data: user } = useMe();
  const [unitCostDisplay, setUnitCostDisplay] = useState<string>("0.00");

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantity: 1,
      supplier: "",
      unitCost: 0,
      notes: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    addStock.mutate(
      {
        itemId: material.id,
        quantity: data.quantity,
        staffId: user?.id || 1,
        supplier: data.supplier,
        unitCost: data.unitCost,
        notes: data.notes,
      },
      {
        onSuccess: () => {
          form.reset();
          setUnitCostDisplay("0.00");
          onClose();
        },
      }
    );
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
      setUnitCostDisplay("0.00");
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Stock - {material.itemName}</DialogTitle>
          <DialogDescription>
            Add stock to this material. Current quantity: {material.quantity} {material.unit || "units"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity to Add *</FormLabel>
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
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="supplier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Supplier name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="unitCost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit Cost (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="0.00"
                      value={unitCostDisplay}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^\d.]/g, ''); // Allow only digits and decimal
                        setUnitCostDisplay(value);
                        const numericValue = parseFloat(value) || 0;
                        field.onChange(numericValue);
                      }}
                      onBlur={(e) => {
                        const numericValue = parseFloat(e.target.value.replace(/[^\d.]/g, '')) || 0;
                        const formatted = formatCurrency(numericValue);
                        setUnitCostDisplay(formatted);
                        field.onChange(numericValue);
                      }}
                      onFocus={(e) => {
                        // Remove formatting when focused for easier editing
                        const numericValue = parseCurrency(unitCostDisplay);
                        setUnitCostDisplay(numericValue === 0 ? '' : numericValue.toString());
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Additional notes" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={addStock.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={addStock.isPending}>
                {addStock.isPending ? "Adding..." : "Add Stock"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
