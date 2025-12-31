/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createProductionOrderSchema,
  CreateProductionOrderFormData,
} from "@/schemas/productionOrderSchema";
import { useCreateProductionOrder, useUpdateProductionOrder } from "@/hooks/useProductionOrders";
import { useCustomers } from "@/hooks/useCustomers";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useSizeDefs } from "@/hooks/useSizeDefs";
import { Loader2, Plus, Trash2, Package } from "lucide-react";
import { SizeDef } from "@/types/size-def";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface ProductionOrderFormProps {
  closeDialog: () => void;
  initialValues?: any;
}

export default function ProductionOrderForm({
  closeDialog,
  initialValues,
}: ProductionOrderFormProps) {
  const currentUser = useCurrentUser();
  const { data: customersResponse, isLoading: customersLoading } = useCustomers({
    page: 1,
    limit: 100,
  });
  const customers = customersResponse?.data || [];
  const { data: sizeDefsResponse, isLoading: sizeDefsLoading } = useSizeDefs();
  const sizeDefs = sizeDefsResponse?.data || [];

  const createOrderMutation = useCreateProductionOrder();
  const updateOrderMutation = useUpdateProductionOrder();
  const isEditMode = !!initialValues?.id;

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
    setValue,
  } = useForm<CreateProductionOrderFormData>({
    resolver: zodResolver(createProductionOrderSchema),
    defaultValues: initialValues || {
      orderDetails: [
        {
          productName: "",
          size: 0,
          quantity: 1,
          specifications: "",
          estimatedCost: 0,
        },
      ],
      priority: "normal",
      expectedDeliveryDate: "",
      notes: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "orderDetails",
  });

  const orderDetails = watch("orderDetails");
  const estimatedTotal = orderDetails?.reduce(
    (sum, item) => sum + (item.estimatedCost || 0) * (item.quantity || 0),
    0
  ) || 0;

  const onSubmit = (data: CreateProductionOrderFormData) => {
    if (!currentUser.staffId) return;

    const orderData = {
      ...data,
      receivedBy: currentUser.staffId,
    };

    if (isEditMode) {
      // Update existing order
      updateOrderMutation.mutate(
        { id: initialValues.id, data: orderData as any },
        {
          onSuccess: () => {
            closeDialog();
          },
        }
      );
    } else {
      // Create new order
      createOrderMutation.mutate(orderData as any, {
        onSuccess: () => {
          closeDialog();
        },
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header */}
      <DialogHeader>
        <DialogTitle>
          {initialValues ? "Edit Production Order" : "Create Production Order"}
        </DialogTitle>
        <DialogDescription>
          Create a custom production order from a customer request
        </DialogDescription>
      </DialogHeader>

      <Separator />

      {/* Customer Selection */}
      <div className="space-y-2">
        <Label htmlFor="customerId">
          Customer <span className="text-red-500">*</span>
        </Label>
        <Select
          onValueChange={(value) => setValue("customerId", parseInt(value))}
          defaultValue={initialValues?.customerId?.toString()}
        >
          <SelectTrigger id="customerId">
            <SelectValue placeholder="Select a customer..." />
          </SelectTrigger>
          <SelectContent>
            {customersLoading ? (
              <div className="p-2 text-center text-sm text-gray-500">
                Loading customers...
              </div>
            ) : customers.length === 0 ? (
              <div className="p-2 text-center text-sm text-gray-500">
                No customers found
              </div>
            ) : (
              customers.map((customer: any) => (
                <SelectItem key={customer.id} value={customer.id.toString()}>
                  {customer.name} - {customer.country || "N/A"}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        {errors.customerId && (
          <p className="text-sm text-red-600">{errors.customerId.message}</p>
        )}
      </div>

      {/* Order Details Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Order Items</h3>
            <p className="text-sm text-gray-500">
              Add products to this order
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({
                productName: "",
                size: 0,
                quantity: 1,
                specifications: "",
                estimatedCost: 0,
              })
            }
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Item
          </Button>
        </div>

        {/* Order Items */}
        <div className="space-y-4">
          {fields.map((field, index) => (
            <Card key={field.id} className="border-2">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-brand-600" />
                    <h4 className="font-medium text-gray-900">
                      Item {index + 1}
                    </h4>
                  </div>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Product Name */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor={`orderDetails.${index}.productName`}>
                      Product Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`orderDetails.${index}.productName`}
                      placeholder="e.g., Custom Blazer"
                      {...register(`orderDetails.${index}.productName`)}
                    />
                    {errors.orderDetails?.[index]?.productName && (
                      <p className="text-sm text-red-600">
                        {errors.orderDetails[index]?.productName?.message}
                      </p>
                    )}
                  </div>

                  {/* Size */}
                  <div className="space-y-2">
                    <Label htmlFor={`orderDetails.${index}.size`}>
                      Size <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={watch(`orderDetails.${index}.size`) && watch(`orderDetails.${index}.size`) > 0
                        ? watch(`orderDetails.${index}.size`).toString()
                        : undefined}
                      onValueChange={(value) => setValue(`orderDetails.${index}.size`, parseInt(value))}
                      disabled={sizeDefsLoading}
                    >
                      <SelectTrigger id={`orderDetails.${index}.size`}>
                        <SelectValue placeholder={sizeDefsLoading ? "Loading sizes..." : "Select size"} />
                      </SelectTrigger>
                      <SelectContent>
                        {sizeDefsLoading ? (
                          <SelectItem disabled value="loading">Loading...</SelectItem>
                        ) : sizeDefs.length === 0 ? (
                          <SelectItem disabled value="no-sizes">No sizes available. Add sizes in Configurations.</SelectItem>
                        ) : (
                          sizeDefs.map((sizeDef: SizeDef) => {
                            // Extract size number from name (e.g., "Size 8" -> 8)
                            const sizeMatch = sizeDef.name.match(/\d+/);
                            const sizeNumber = sizeMatch ? sizeMatch[0] : sizeDef.id.toString();
                            const genderLabel = sizeDef.genderType === "male" ? "Male" : "Female";
                            return (
                              <SelectItem key={sizeDef.id} value={sizeNumber}>
                                {sizeDef.name} ({genderLabel})
                                {sizeDef.description && ` - ${sizeDef.description}`}
                              </SelectItem>
                            );
                          })
                        )}
                      </SelectContent>
                    </Select>
                    {errors.orderDetails?.[index]?.size && (
                      <p className="text-sm text-red-600">
                        {errors.orderDetails[index]?.size?.message}
                      </p>
                    )}
                  </div>

                  {/* Quantity */}
                  <div className="space-y-2">
                    <Label htmlFor={`orderDetails.${index}.quantity`}>
                      Quantity <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`orderDetails.${index}.quantity`}
                      type="number"
                      min="1"
                      placeholder="e.g., 25"
                      {...register(`orderDetails.${index}.quantity`)}
                    />
                    {errors.orderDetails?.[index]?.quantity && (
                      <p className="text-sm text-red-600">
                        {errors.orderDetails[index]?.quantity?.message}
                      </p>
                    )}
                  </div>

                  {/* Estimated Cost per Unit */}
                  <div className="space-y-2">
                    <Label htmlFor={`orderDetails.${index}.estimatedCost`}>
                      Cost per Unit (₦) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`orderDetails.${index}.estimatedCost`}
                      type="number"
                      step="0.01"
                      placeholder="e.g., 8500"
                      {...register(`orderDetails.${index}.estimatedCost`)}
                    />
                    {errors.orderDetails?.[index]?.estimatedCost && (
                      <p className="text-sm text-red-600">
                        {errors.orderDetails[index]?.estimatedCost?.message}
                      </p>
                    )}
                  </div>

                  {/* Item Subtotal */}
                  <div className="space-y-2">
                    <Label>Item Subtotal</Label>
                    <div className="h-10 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md flex items-center">
                      <span className="font-medium text-gray-900">
                        ₦
                        {(
                          (orderDetails[index]?.estimatedCost || 0) *
                          (orderDetails[index]?.quantity || 0)
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Specifications */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor={`orderDetails.${index}.specifications`}>
                      Specifications <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id={`orderDetails.${index}.specifications`}
                      placeholder="Describe the product requirements, materials, colors, custom features, etc."
                      rows={3}
                      {...register(`orderDetails.${index}.specifications`)}
                    />
                    {errors.orderDetails?.[index]?.specifications && (
                      <p className="text-sm text-red-600">
                        {errors.orderDetails[index]?.specifications?.message}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Estimated Total */}
        <Card className="border-2 border-brand-200 bg-brand-50">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-brand-900">
                Estimated Total Cost:
              </span>
              <span className="text-2xl font-bold text-brand-900">
                ₦{estimatedTotal.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Order Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Priority */}
        <div className="space-y-2">
          <Label htmlFor="priority">
            Priority <span className="text-red-500">*</span>
          </Label>
          <Select
            onValueChange={(value) =>
              setValue("priority", value as any)
            }
            defaultValue="normal"
          >
            <SelectTrigger id="priority">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low (4+ weeks)</SelectItem>
              <SelectItem value="normal">Normal (2-3 weeks)</SelectItem>
              <SelectItem value="high">High (within 1 week)</SelectItem>
              <SelectItem value="urgent">Urgent (1-2 days)</SelectItem>
            </SelectContent>
          </Select>
          {errors.priority && (
            <p className="text-sm text-red-600">{errors.priority.message}</p>
          )}
        </div>

        {/* Expected Delivery Date */}
        <div className="space-y-2">
          <Label htmlFor="expectedDeliveryDate">
            Expected Delivery Date <span className="text-red-500">*</span>
          </Label>
          <Input
            id="expectedDeliveryDate"
            type="date"
            min={new Date().toISOString().split("T")[0]}
            {...register("expectedDeliveryDate")}
          />
          {errors.expectedDeliveryDate && (
            <p className="text-sm text-red-600">
              {errors.expectedDeliveryDate.message}
            </p>
          )}
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Additional Notes</Label>
        <Textarea
          id="notes"
          placeholder="Any additional information about this order..."
          rows={3}
          {...register("notes")}
        />
      </div>

      <Separator />

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={closeDialog}
          disabled={createOrderMutation.isPending || updateOrderMutation.isPending}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={createOrderMutation.isPending || updateOrderMutation.isPending}
          className="bg-brand-700 hover:bg-brand-800"
        >
          {(createOrderMutation.isPending || updateOrderMutation.isPending) ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEditMode ? "Updating Order..." : "Creating Order..."}
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              {isEditMode ? "Update Production Order" : "Create Production Order"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
