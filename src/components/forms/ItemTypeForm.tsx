/* eslint-disable @typescript-eslint/no-explicit-any */
// components/forms/ItemTypeForm.tsx
"use client"

import { Button, CustomButton } from "@/components/ui/button";
import { Label } from '@/components/ui/label';
import { Input } from "../ui/input";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormMessage } from "../ui/form";
import { z } from "zod";
import { ItemTypeFormData, itemTypeSchema } from "@/schemas/itemTypeSchema";
import { cn } from "@/lib/utils";
import { useCreateItemType, useUpdateItemType } from "@/hooks/useItemTypes";

const ItemTypeForm = ({ className, closeDialog, initialValues }: { className?: string, closeDialog: () => void, initialValues?: Partial<ItemType> }) => {
  const createItemType = useCreateItemType();
  const updateItemType = useUpdateItemType();

  const form = useForm<z.infer<typeof itemTypeSchema>>({
    resolver: zodResolver(itemTypeSchema),
    defaultValues: {
      name: initialValues?.name || "",
      code: initialValues?.code || "",
      unit: initialValues?.unit || "",
    },
  });

  const isLoading = createItemType.isPending || updateItemType.isPending;

  const onSubmit: SubmitHandler<ItemTypeFormData> = async (data) => {
    if (initialValues?.id) {
      updateItemType.mutate({ id: initialValues.id, data }, {
        onSuccess: () => {
          closeDialog();
          form.reset();
        }
      });
    } else {
      createItemType.mutate(data, {
        onSuccess: () => {
          closeDialog();
          form.reset();
        }
      });
    }
  };

  return (
    <>
      <div className="font-medium">{initialValues ? 'Update' : 'Create'} Item Type</div>
      <Form {...form}>
        <form 
          className={cn("space-y-6", className)} 
          onSubmit={form.handleSubmit(onSubmit)}
        >
          {/* Item Type Information Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            <div className="text-md font-semibold italic sm:col-span-2">Item Type Information</div>

            <FormField
              control={form.control}
              name="name"
              render={({ field, fieldState: { error } }) => (
                <div>
                  <Label className="text-xs">Item Type Name</Label>
                  <FormControl className={field.value ? 'font-medium' : 'border-gray-300'}>
                    <Input placeholder="e.g., Fabric, Thread, Buttons" {...field} />
                  </FormControl>
                  {error && <FormMessage className="text-[#DC3E42] text-xs p-1">{error.message}</FormMessage>}
                </div>
              )}
            />

            <FormField
              control={form.control}
              name="code"
              render={({ field, fieldState: { error } }) => (
                <div>
                  <Label className="text-xs">Item Code</Label>
                  <FormControl className={field.value ? 'font-medium' : 'border-gray-300'}>
                    <Input placeholder="e.g., FAB, THR, BTN" {...field} />
                  </FormControl>
                  {error && <FormMessage className="text-[#DC3E42] text-xs p-1">{error.message}</FormMessage>}
                </div>
              )}
            />

            <FormField
              control={form.control}
              name="unit"
              render={({ field, fieldState: { error } }) => (
                <div className="sm:col-span-2">
                  <Label className="text-xs">Unit of Measurement</Label>
                  <FormControl className={field.value ? 'font-medium' : 'border-gray-300'}>
                    <Input placeholder="e.g., meters, pieces, kg, yards" {...field} />
                  </FormControl>
                  {error && <FormMessage className="text-[#DC3E42] text-xs p-1">{error.message}</FormMessage>}
                </div>
              )}
            />
          </div>

          <div className="flex items-center justify-end space-x-2">
            <Button type="button" size="lg" variant="outline" onClick={closeDialog}>Cancel</Button>
            <CustomButton
              type="submit"
              size="lg"
              className=" bg-[#0F3F5F] hover:bg-[#0F3F5F]"
              isLoading={isLoading}
            >
              {initialValues?.id ? "Update Item Type" : "Create Item Type"}
            </CustomButton>
          </div>
        </form>
      </Form>
    </>
  );
};

export default ItemTypeForm;
