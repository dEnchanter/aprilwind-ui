/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
"use client"

import { Button, CustomButton } from "@/components/ui/button";
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "../ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { SubmitHandler, useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { z } from "zod";
import { ProductDefFormData, productDefSchema } from "@/schemas/productDefSchema";
import { useCreateProductDef, useUpdateProductDef } from "@/hooks/useProductDef";
import { useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useMaterials } from "@/hooks/useMaterials";
import { useSizeDefs } from "@/hooks/useSizeDefs";
import { Loader2, Plus, X } from "lucide-react";

interface ProductDefFormProps extends React.ComponentProps<"form"> {
  closeDialog: () => void;
  initialValues?: Partial<ProductDef>;
}

const ProductDefForm = ({ className, closeDialog, initialValues }: ProductDefFormProps) => {
  const createProductDef = useCreateProductDef();
  const updateProductDef = useUpdateProductDef();
  const currentUser = useCurrentUser();
  const { data: materialsResponse, isLoading: materialsLoading } = useMaterials({ page: 1, limit: 100 });
  const materials = materialsResponse?.data || [];
  const { data: sizeDefsResponse, isLoading: sizeDefsLoading } = useSizeDefs();
  const sizeDefs = sizeDefsResponse?.data || [];
  const [sizePopoverOpen, setSizePopoverOpen] = useState(false);

  const isEditing = !!initialValues?.id;
  const isLoading = createProductDef.isPending || updateProductDef.isPending;

  const form = useForm<z.infer<typeof productDefSchema>>({
    resolver: zodResolver(productDefSchema),
    defaultValues: {
      code: initialValues?.code || "",
      name: initialValues?.name || "",
      cost: initialValues?.cost || 0,
      def: initialValues?.def && Array.isArray(initialValues.def)
        ? initialValues.def
        : [],
      productSizes: initialValues?.productSizes && Array.isArray(initialValues.productSizes)
        ? initialValues.productSizes
        : [],
      creatorId: initialValues?.creatorId || currentUser.staffId || 0,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "def",
  });

  // Reset form when initialValues changes (for edit mode)
  useEffect(() => {
    // Transform def array to only include item and qty (strip materialDetails from API response)
    const transformedDef = initialValues?.def && Array.isArray(initialValues.def)
      ? initialValues.def.map((d: any) => ({
          item: d.item || 0,
          qty: d.qty || 0,
        }))
      : [];

    form.reset({
      code: initialValues?.code || "",
      name: initialValues?.name || "",
      cost: initialValues?.cost || 0,
      def: transformedDef,
      productSizes: initialValues?.productSizes && Array.isArray(initialValues.productSizes)
        ? initialValues.productSizes
        : [],
      creatorId: initialValues?.creatorId || currentUser.staffId || 0,
    });
  }, [initialValues, currentUser.staffId, form]);

  // Auto-fill creator ID when form opens
  useEffect(() => {
    if (!isEditing && currentUser.staffId) {
      form.setValue('creatorId', currentUser.staffId);
    }
  }, [currentUser.staffId, isEditing, form]);

  const onSubmit: SubmitHandler<ProductDefFormData> = async (data) => {
    // Transform data to match API expectations and filter out invalid entries
    const transformedData = {
      ...data,
      def: data.def.filter(d => d.item > 0 && d.qty > 0).map(d => ({
        item: d.item,
        qty: d.qty,
      })),
    };

    if (isEditing && initialValues?.id) {
      updateProductDef.mutate(
        { id: initialValues.id, data: transformedData },
        {
          onSuccess: () => {
            closeDialog();
            form.reset();
          },
        }
      );
    } else {
      createProductDef.mutate(transformedData, {
        onSuccess: () => {
          closeDialog();
          form.reset();
        },
      });
    }
  };

  // Handle size selection
  const handleSizeToggle = (size: number) => {
    const currentSizes = form.getValues('productSizes');
    if (currentSizes.includes(size)) {
      form.setValue('productSizes', currentSizes.filter(s => s !== size));
    } else {
      form.setValue('productSizes', [...currentSizes, size]);
    }
  };

  return (
    <>
      <div className="font-medium text-lg mb-4">
        {isEditing ? 'Edit' : 'Create'} Product Definition
      </div>

      <Form {...form}>
        <form
          className={cn("space-y-6", className)}
          onSubmit={form.handleSubmit(onSubmit)}
        >
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="text-sm font-semibold text-gray-700">Basic Information</div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field, fieldState: { error } }) => (
                  <div>
                    <Label className="text-xs">Product Code *</Label>
                    <FormControl>
                      <Input
                        placeholder="e.g., SHRT"
                        maxLength={10}
                        {...field}
                      />
                    </FormControl>
                    {error && <FormMessage className="text-red-600 text-xs p-1">{error.message}</FormMessage>}
                  </div>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field, fieldState: { error } }) => (
                  <div>
                    <Label className="text-xs">Product Name *</Label>
                    <FormControl>
                      <Input
                        placeholder="e.g., Formal Shirt"
                        {...field}
                      />
                    </FormControl>
                    {error && <FormMessage className="text-red-600 text-xs p-1">{error.message}</FormMessage>}
                  </div>
                )}
              />

              <FormField
                control={form.control}
                name="cost"
                render={({ field, fieldState: { error } }) => (
                  <div>
                    <Label className="text-xs">Production Cost *</Label>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="5000"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    {error && <FormMessage className="text-red-600 text-xs p-1">{error.message}</FormMessage>}
                  </div>
                )}
              />
            </div>
          </div>

          {/* Material Specifications */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-gray-700">Material Specifications</div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => append({ item: 0, qty: 0 })}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Material
              </Button>
            </div>

            {fields.length === 0 ? (
              <div className="border border-dashed rounded-lg p-4 text-center text-gray-500 text-sm">
                No materials added. Click "Add Material" to get started.
              </div>
            ) : (
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name={`def.${index}.item`}
                        render={({ field, fieldState: { error } }) => (
                          <div>
                            <Label className="text-xs">Material *</Label>
                            <Select
                              value={field.value > 0 ? field.value.toString() : ""}
                              onValueChange={(value) => field.onChange(parseInt(value))}
                              disabled={materialsLoading}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select material" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {materials.map((material: any) => (
                                  <SelectItem key={material.id} value={material.id.toString()}>
                                    {material.name} ({material.code})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {error && <FormMessage className="text-red-600 text-xs p-1">{error.message}</FormMessage>}
                          </div>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`def.${index}.qty`}
                        render={({ field, fieldState: { error } }) => (
                          <div>
                            <Label className="text-xs">Quantity *</Label>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="2.5"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            {error && <FormMessage className="text-red-600 text-xs p-1">{error.message}</FormMessage>}
                          </div>
                        )}
                      />
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="mt-6"
                      onClick={() => remove(index)}
                    >
                      <X className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Available Sizes */}
          <div className="space-y-4">
            <div className="text-sm font-semibold text-gray-700">Available Sizes</div>
            {sizeDefsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                <span className="ml-2 text-sm text-gray-500">Loading sizes...</span>
              </div>
            ) : sizeDefs.length === 0 ? (
              <div className="border border-dashed rounded-lg p-4 text-center text-gray-500 text-sm">
                No sizes defined. Please add size definitions in the Configurations page.
              </div>
            ) : (
              <Popover open={sizePopoverOpen} onOpenChange={setSizePopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={sizePopoverOpen}
                    className="w-full justify-between h-auto min-h-10"
                  >
                    <div className="flex flex-wrap gap-1">
                      {form.watch('productSizes').length > 0 ? (
                        form.watch('productSizes').sort((a, b) => a - b).map((size) => (
                          <span
                            key={size}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-brand-100 text-brand-800"
                          >
                            Size {size}
                          </span>
                        ))
                      ) : (
                        <span className="text-muted-foreground">Select sizes...</span>
                      )}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command shouldFilter={false}>
                    <CommandInput placeholder="Search sizes..." />
                    <CommandGroup className="max-h-64 overflow-auto">
                      {sizeDefs.length === 0 ? (
                        <div className="py-6 text-center text-sm">No sizes found.</div>
                      ) : (
                        sizeDefs.map((sizeDef: SizeDef) => {
                          // Extract size number from name (e.g., "Size 8" -> 8)
                          const sizeMatch = sizeDef.name.match(/\d+/);
                          const sizeNumber = sizeMatch ? parseInt(sizeMatch[0]) : sizeDef.id;
                          const isSelected = form.watch('productSizes').includes(sizeNumber);
                          const genderLabel = sizeDef.genderType === "male" ? "Male" : "Female";

                          return (
                            <div
                              key={sizeDef.id}
                              onClick={() => {
                                handleSizeToggle(sizeNumber);
                              }}
                              className={cn(
                                "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                                "cursor-pointer"
                              )}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  isSelected ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {sizeDef.name} ({genderLabel})
                                </span>
                                {sizeDef.description && (
                                  <span className="text-xs text-gray-500">
                                    {sizeDef.description}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            )}
            {form.formState.errors.productSizes && (
              <FormMessage className="text-red-600 text-xs p-1">
                {form.formState.errors.productSizes.message}
              </FormMessage>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-2 pt-4 border-t">
            <Button
              type="button"
              size="lg"
              variant="outline"
              onClick={() => {
                closeDialog();
                form.reset();
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <CustomButton
              type="submit"
              size="lg"
              className="bg-brand-700 hover:bg-brand-800"
              isLoading={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>{isEditing ? 'Update Product' : 'Create Product'}</>
              )}
            </CustomButton>
          </div>
        </form>
      </Form>
    </>
  );
};

export default ProductDefForm;
