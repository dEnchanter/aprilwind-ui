/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { Button, CustomButton } from "@/components/ui/button";
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from "react";
import { Form, FormControl, FormField, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Endpoint } from "@/services/api";
import { fetchPatch, fetchPost } from "@/services/fetcher";
import { toast } from "sonner";
import { z } from "zod";
import { RawItemFormData, rawItemsSchema } from "@/schemas/rawItemsSchema"; // Assuming rawItemsSchema is defined similarly
import ImageUpload from "../ui/image-upload-comp";
import { useItemTypes } from "@/hooks/useItemTypes";

interface RawItemsFormProps extends React.ComponentProps<"form"> {
  closeDialog: () => void;
  initialValues?: Partial<RawItems>; // Assuming you have the RawItemFormData type defined
}

const RawItemsForm = ({ className, closeDialog, initialValues }: RawItemsFormProps) => {

  const form = useForm<z.infer<typeof rawItemsSchema>>({
    resolver: zodResolver(rawItemsSchema),  // assuming you have a schema for validation
    defaultValues: {
      name: initialValues?.name || "",
      code: initialValues?.code || "",
      quantity: initialValues?.quantity || 0,
      description: initialValues?.description || "",
      unit: initialValues?.unit || "",
      image_url: initialValues?.image_url || "",
      typeId: initialValues?.typeId || 0,
    },
  });

  const { data: itemTypes, isLoading: itemTypeIsLoading, isError: itemTypeError } = useItemTypes(); // Fetch categories
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit: SubmitHandler<RawItemFormData> = async (data) => {
    setIsLoading(true);

    const processedData = {
      ...data,
      name: data.name || initialValues?.name,
      code: data.code || initialValues?.code,
      quantity: data.quantity || initialValues?.quantity,
      description: data.description || initialValues?.description,
      unit: data.unit || initialValues?.unit,
      image_url: data.image_url || initialValues?.image_url,
      typeId: data.typeId || initialValues?.typeId,
    };

    try {
      if (initialValues?.id) {
        const responseData: any = await fetchPatch(
          `${Endpoint.UPDATE_RAW_ITEM}/${initialValues.id}`, 
          processedData
        );
        toast.success(responseData?.message || "Raw item updated successfully!");
      } else {
        const responseData: any = await fetchPost(Endpoint.CREATE_RAW_ITEM, processedData);
        toast.success(responseData?.message || "Raw item created successfully!");
      }
      closeDialog();
    } catch (error: any) {
      toast.error(error?.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="font-medium">{initialValues ? 'Update' : 'Create'} Raw Item</div>
      <Form {...form}>
        <form 
          className={cn("space-y-6", className)} // Added space between sections
          onSubmit={form.handleSubmit(onSubmit)}
        >
          {/* Raw Item Information Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            <div className="text-md font-semibold italic sm:col-span-2">Raw Item Information</div>

            <FormField
              control={form.control}
              name="name"
              render={({ field, fieldState: { error } }) => (
                <div>
                  <Label className="text-xs">Name</Label>
                  <FormControl className={field.value ? 'font-medium' : 'border-gray-300'}>
                    <Input placeholder="Item Name" {...field} />
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
                  <Label className="text-xs">Code</Label>
                  <FormControl className={field.value ? 'font-medium' : 'border-gray-300'}>
                    <Input placeholder="Item Code" {...field} />
                  </FormControl>
                  {error && <FormMessage className="text-[#DC3E42] text-xs p-1">{error.message}</FormMessage>}
                </div>
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              render={({ field, fieldState: { error } }) => (
                <div>
                  <Label className="text-xs">Quantity</Label>
                  <FormControl className={field.value ? 'font-medium' : 'border-gray-300'}>
                    <Input type="number" placeholder="Quantity" {...field} />
                  </FormControl>
                  {error && <FormMessage className="text-[#DC3E42] text-xs p-1">{error.message}</FormMessage>}
                </div>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field, fieldState: { error } }) => (
                <div>
                  <Label className="text-xs">Description</Label>
                  <FormControl className={field.value ? 'font-medium' : 'border-gray-300'}>
                    <Input placeholder="Description" {...field} />
                  </FormControl>
                  {error && <FormMessage className="text-[#DC3E42] text-xs p-1">{error.message}</FormMessage>}
                </div>
              )}
            />

            <FormField
              control={form.control}
              name="unit"
              render={({ field, fieldState: { error } }) => (
                <div>
                  <Label className="text-xs">Unit</Label>
                  <FormControl className={field.value ? 'font-medium' : 'border-gray-300'}>
                    <Input placeholder="Unit" {...field} />
                  </FormControl>
                  {error && <FormMessage className="text-[#DC3E42] text-xs p-1">{error.message}</FormMessage>}
                </div>
              )}
            />

            <FormField
              control={form.control}
              name="image_url"
              render={({ field, fieldState: { error } }) => (
                <div>
                  <Label className="text-xs">Image</Label>
                  <FormControl className={field.value ? "font-medium" : "border-gray-300"}>
                    <ImageUpload
                      value={field.value}
                      onChange={(image) => field.onChange(image)} // Handle image change
                    />
                  </FormControl>
                  {error && <FormMessage className="text-[#DC3E42] text-xs p-1">{error.message}</FormMessage>}
                </div>
              )}
            />
          </div>

          {/* Category Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            <div className="text-md font-semibold sm:col-span-2 italic">Item Type Information</div>

            <FormField
              control={form.control}
              name="typeId"
              render={({ field, fieldState: { error } }) => (
                <div>
                  <Label className="text-xs">Item Type</Label>
                  <FormControl className={field.value ? 'font-medium' : 'border-gray-300'}>
                    <Select value={String(field.value)} onValueChange={(value) => field.onChange(Number(value))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {itemTypeIsLoading ? (
                          <SelectItem disabled value="nil">Loading...</SelectItem>
                        ) : itemTypeError ? (
                          <SelectItem disabled value="nil">Error loading categories</SelectItem>
                        ) : (
                          itemTypes?.data?.map((item: any) => (
                            <SelectItem key={item.id} value={item.id.toString()}>{item.name}</SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
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
               {initialValues?.id ? "Update Raw Item" : "Create Raw Item"}	
            </CustomButton>
          </div>
        </form>
      </Form>
    </>
  );
}

export default RawItemsForm;
