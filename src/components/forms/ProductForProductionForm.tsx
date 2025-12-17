/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
"use client"

import { Button, CustomButton } from "@/components/ui/button";
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { SubmitHandler, useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { z } from "zod";
import { ProductionFormData, productionSchema } from "@/schemas/productionSchema";
import { useCreateProduction, useUpdateProduction } from "@/hooks/useProductions";
import { useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useProductDef } from "@/hooks/useProductDef";
import { Loader2, Plus, X } from "lucide-react";
import { DialogTitle } from "../ui/dialog";

interface ProductForProductionFormProps extends React.ComponentProps<"form"> {
  closeDialog: () => void;
  initialValues?: Partial<any>;
}

const ProductForProductionForm = ({ className, closeDialog, initialValues }: ProductForProductionFormProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const createProduction = useCreateProduction();
  const updateProduction = useUpdateProduction();
  const currentUser = useCurrentUser();
  const { data: productDefs, isLoading: productDefsLoading } = useProductDef({ page: 1, limit: 100 });

  const isEditing = !!initialValues?.id;
  const isLoading = createProduction.isPending || updateProduction.isPending;

  const form = useForm<z.infer<typeof productionSchema>>({
    resolver: zodResolver(productionSchema),
    defaultValues: {
      productId: initialValues?.productId || 0,
      requestedBy: initialValues?.requestedBy || currentUser.staffId || 0,
      quantity: initialValues?.quantity && Array.isArray(initialValues.quantity)
        ? initialValues.quantity
        : [],
      productGuide: initialValues?.productGuide && Array.isArray(initialValues.productGuide)
        ? initialValues.productGuide
        : [],
      isActive: initialValues?.isActive ?? true,
    },
  });

  const { fields: quantityFields, append: appendQuantity, remove: removeQuantity } = useFieldArray({
    control: form.control,
    name: "quantity",
  });

  // Reset form when initialValues changes (for edit mode)
  useEffect(() => {
    const transformedQuantity = initialValues?.quantity && Array.isArray(initialValues.quantity)
      ? initialValues.quantity.map((q: any) => ({
          size: q.size || 0,
          quantity: q.quantity || 0,
        }))
      : [];

    const transformedGuide = initialValues?.productGuide && Array.isArray(initialValues.productGuide)
      ? initialValues.productGuide.map((g: any) => ({
          id: g.id || 0,
          qty: g.qty || "",
        }))
      : [];

    form.reset({
      productId: initialValues?.productId || 0,
      requestedBy: initialValues?.requestedBy || currentUser.staffId || 0,
      quantity: transformedQuantity,
      productGuide: transformedGuide,
      isActive: initialValues?.isActive !== undefined ? initialValues.isActive : true,
    });
  }, [initialValues, currentUser.staffId, form]);

  // Ensure component is mounted before rendering
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Auto-fill requestedBy when form opens
  useEffect(() => {
    if (!isEditing && currentUser.staffId) {
      form.setValue('requestedBy', currentUser.staffId);
    }
  }, [currentUser.staffId, isEditing, form]);

  // Update available sizes when product definition changes
  const selectedProductId = form.watch('productId');
  const selectedProduct = productDefs?.find((p: any) => p.productId === selectedProductId);

  // Auto-populate product guide when product definition is selected
  useEffect(() => {
    if (selectedProduct && selectedProduct.def) {
      const productGuide = selectedProduct.def.map((item: any) => ({
        id: item.item,
        qty: item.qty.toString(),
      }));
      form.setValue('productGuide', productGuide);
    } else {
      form.setValue('productGuide', []);
    }
  }, [selectedProduct, form]);

  // Don't render until mounted to avoid hydration errors
  if (!isMounted) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-brand-700" />
      </div>
    );
  }

  const onSubmit: SubmitHandler<ProductionFormData> = async (data) => {
    // Filter out invalid entries
    const transformedData = {
      ...data,
      quantity: data.quantity.filter(q => q.size > 0 && q.quantity > 0),
      productGuide: data.productGuide?.filter(g => g.id > 0 && g.qty.trim() !== "") || [],
      isActive: true, // Always set to true
    };

    if (isEditing && initialValues?.id) {
      updateProduction.mutate(
        { id: initialValues.id, data: transformedData },
        {
          onSuccess: () => {
            closeDialog();
            form.reset();
          },
        }
      );
    } else {
      createProduction.mutate(transformedData, {
        onSuccess: () => {
          closeDialog();
          form.reset();
        },
      });
    }
  };

  return (
    <>
      <DialogTitle className="font-medium text-lg mb-4">
        {isEditing ? 'Edit' : 'Create'} Product for Production
      </DialogTitle>

      <Form {...form}>
        <form
          className={cn("space-y-6", className)}
          onSubmit={form.handleSubmit(onSubmit)}
        >
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="text-sm font-semibold text-gray-700">Basic Information</div>

            <FormField
              control={form.control}
              name="productId"
              render={({ field, fieldState: { error } }) => (
                <div>
                  <Label className="text-xs">Product Definition *</Label>
                  <Select
                    value={field.value > 0 ? field.value.toString() : ""}
                    onValueChange={(value) => {
                      field.onChange(parseInt(value));
                      // Clear quantity fields when product changes
                      form.setValue('quantity', []);
                    }}
                    disabled={productDefsLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {productDefs?.filter((product: any) => product && product.productId).map((product: any) => (
                        <SelectItem key={product.productId} value={product.productId.toString()}>
                          {product.name} ({product.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {error && <FormMessage className="text-red-600 text-xs p-1">{error.message}</FormMessage>}
                </div>
              )}
            />
          </div>

          {/* Size/Quantity Specifications */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-gray-700">Size & Quantity</div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => appendQuantity({ size: 0, quantity: 0 })}
                disabled={!selectedProduct}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Size
              </Button>
            </div>

            {!selectedProduct && (
              <div className="border border-dashed rounded-lg p-4 text-center text-gray-500 text-sm">
                Please select a product definition first
              </div>
            )}

            {selectedProduct && quantityFields.length === 0 && (
              <div className="border border-dashed rounded-lg p-4 text-center text-gray-500 text-sm">
                No sizes added. Click "Add Size" to get started.
              </div>
            )}

            {selectedProduct && quantityFields.length > 0 && (
              <div className="space-y-3">
                {quantityFields.map((field, index) => (
                  <div key={field.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name={`quantity.${index}.size`}
                        render={({ field, fieldState: { error } }) => (
                          <div>
                            <Label className="text-xs">Size *</Label>
                            <Select
                              value={field.value > 0 ? field.value.toString() : ""}
                              onValueChange={(value) => field.onChange(parseInt(value))}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select size" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {selectedProduct.productSizes?.filter((size: number) => size != null).map((size: number) => (
                                  <SelectItem key={size} value={size.toString()}>
                                    {size}
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
                        name={`quantity.${index}.quantity`}
                        render={({ field, fieldState: { error } }) => (
                          <div>
                            <Label className="text-xs">Quantity *</Label>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="10"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
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
                      onClick={() => removeQuantity(index)}
                    >
                      <X className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Material Requirements (Auto-populated from Product Definition) */}
          <div className="space-y-4">
            <div className="text-sm font-semibold text-gray-700">Material Requirements</div>

            {!selectedProduct && (
              <div className="border border-dashed rounded-lg p-4 text-center text-gray-500 text-sm">
                Select a product definition to see material requirements
              </div>
            )}

            {selectedProduct && (!selectedProduct.def || selectedProduct.def.length === 0) && (
              <div className="border border-dashed rounded-lg p-4 text-center text-gray-500 text-sm">
                No materials defined for this product
              </div>
            )}

            {selectedProduct && selectedProduct.def && selectedProduct.def.length > 0 && (
              <div className="space-y-2">
                {selectedProduct.def.map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        {item.materialDetails?.name || `Material ID: ${item.item}`}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.materialDetails?.code && `Code: ${item.materialDetails.code}`}
                        {item.materialDetails?.type?.unit && ` • Unit: ${item.materialDetails.type.unit}`}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-sm text-brand-700">
                        {item.qty} {item.materialDetails?.type?.unit || 'units'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
              {isEditing ? 'Update' : 'Create'}
            </CustomButton>
          </div>
        </form>
      </Form>
    </>
  );
};

export default ProductForProductionForm;
