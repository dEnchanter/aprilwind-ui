/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import { useUpdateMaterial } from "@/hooks/useMaterials";

const formSchema = z.object({
  name: z.string().min(1, "Material name is required"),
  code: z.string().optional(),
  description: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface EditMaterialDialogProps {
  material: any;
  open: boolean;
  onClose: () => void;
}

export function EditMaterialDialog({ material, open, onClose }: EditMaterialDialogProps) {
  const updateMaterial = useUpdateMaterial();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: material.name || "",
      code: material.code || "",
      description: material.description || "",
    },
  });

  // Update form when material changes
  useEffect(() => {
    if (material) {
      form.reset({
        name: material.name || "",
        code: material.code || "",
        description: material.description || "",
      });
    }
  }, [material, form]);

  const onSubmit = async (data: FormData) => {
    updateMaterial.mutate(
      {
        id: material.id,
        data,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Material</DialogTitle>
          <DialogDescription>
            Update material information. Note: Quantity cannot be changed here, use Add Stock or Adjust Stock instead.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Material Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Cotton Fabric" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Code</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., CTN-001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Additional notes" {...field} />
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
                disabled={updateMaterial.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMaterial.isPending}>
                {updateMaterial.isPending ? "Updating..." : "Update Material"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
