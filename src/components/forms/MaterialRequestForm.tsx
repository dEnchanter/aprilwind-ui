/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { Button, CustomButton } from "@/components/ui/button";
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormMessage } from "../ui/form";
import { Textarea } from "../ui/textarea";
import { z } from "zod";
import { MaterialRequestFormData, materialRequestSchema } from "@/schemas/materialRequestSchema";
import { useStaff } from "@/hooks/useStaff";
import { useCreateMaterialRequest, useUpdateMaterialRequest, useMaterialRequestsByProduction } from "@/hooks/useMaterialRequest";
import { MaterialPicker } from "@/components/materials/material-picker";
import { useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Input } from "@/components/ui/input";
import { useProductsForProduction } from "@/hooks/useProductsForProduction";
import { AlertCircle, CheckCircle, XCircle, Clock } from "lucide-react";

interface MaterialRequestFormProps extends React.ComponentProps<"form"> {
  closeDialog: () => void;
  initialValues?: Partial<MaterialRequest>;
}

const MaterialRequestForm = ({ className, closeDialog, initialValues }: MaterialRequestFormProps) => {
  const createMaterialRequest = useCreateMaterialRequest();
  const updateMaterialRequest = useUpdateMaterialRequest();
  const { data: staffResponse, isLoading: staffsIsLoading } = useStaff({ page: 1, limit: 100 });
  const staffs = staffResponse?.data || [];

  // Filter to show only managers for requester dropdown
  const managers = staffs.filter((staff: any) =>
    staff.role?.name?.toLowerCase() === 'manager'
  );

  const currentUser = useCurrentUser();

  // Fetch product-for-production requests
  const { data: productions, isLoading: productionsIsLoading } = useProductsForProduction({ page: 1, limit: 100 });

  const isEditing = !!initialValues?.id;
  const isLoading = createMaterialRequest.isPending || updateMaterialRequest.isPending;
  const [additionalMaterials, setAdditionalMaterials] = useState<Array<{ itemId: number; quantity: number }>>([]);

  // Check if current user is Administrator (super admin)
  const isSuperAdmin = currentUser.role?.name === 'Administrator';

  // Only super admin can select other managers as requesters
  const canSelectOtherRequesters = isSuperAdmin;

  const form = useForm<z.infer<typeof materialRequestSchema>>({
    resolver: zodResolver(materialRequestSchema),
    defaultValues: {
      requesterId: initialValues?.requesterId || (canSelectOtherRequesters ? 0 : currentUser.staffId || 0),
      materials: initialValues?.materials && Array.isArray(initialValues.materials)
        ? initialValues.materials
        : [],
      productionId: initialValues?.productionId || 0,
      quantity: initialValues?.quantity && Array.isArray(initialValues.quantity)
        ? initialValues.quantity
        : [],
    },
  });

  // Reset form when initialValues or currentUser change
  useEffect(() => {
    if (initialValues) {
      form.reset({
        requesterId: initialValues.requesterId || 0,
        materials: initialValues.materials && Array.isArray(initialValues.materials)
          ? initialValues.materials
          : [],
        productionId: initialValues.productionId || 0,
        quantity: initialValues.quantity && Array.isArray(initialValues.quantity)
          ? initialValues.quantity
          : [],
      });
    } else if (currentUser.staffId && !canSelectOtherRequesters) {
      // Auto-fill requester with current user for new requests (only if they can't select others)
      form.setValue('requesterId', currentUser.staffId);
    }
  }, [initialValues, currentUser.staffId, canSelectOtherRequesters, form]);

  // Auto-populate quantity and materials when production is selected
  const selectedProductionId = form.watch('productionId');
  const selectedProduction = productions?.find((p: any) => p.id === selectedProductionId);

  // Check for existing material requests for the selected production
  const { data: existingRequestsData } = useMaterialRequestsByProduction(selectedProductionId || 0);

  useEffect(() => {
    if (selectedProduction) {
      // Auto-populate quantity
      if (selectedProduction.quantity) {
        form.setValue('quantity', selectedProduction.quantity);
      }

      // Auto-populate materials from productGuide
      if (selectedProduction.productGuide && selectedProduction.productGuide.length > 0) {
        const materials = selectedProduction.productGuide
          .filter((guide: any) => guide.id && guide.qty)
          .map((guide: any) => ({
            itemId: guide.id,
            quantity: parseFloat(guide.qty) || 0,
          }));
        form.setValue('materials', materials);
      }
    }
  }, [selectedProduction, form]);

  const onSubmit: SubmitHandler<MaterialRequestFormData> = async (data) => {
    // Combine production materials with additional materials
    const allMaterials = [...data.materials, ...additionalMaterials];

    // Transform data to match API format
    const apiData = {
      productionId: data.productionId,
      requesterId: data.requesterId,
      materials: allMaterials.map(m => ({
        item_id: m.itemId,
        qty: m.quantity,
      })),
      quantity: data.quantity,
      isAssigned: false,
    };

    if (isEditing && initialValues?.id) {
      updateMaterialRequest.mutate(
        { id: initialValues.id, data: apiData },
        {
          onSuccess: () => {
            closeDialog();
            form.reset();
          },
        }
      );
    } else {
      createMaterialRequest.mutate(apiData, {
        onSuccess: () => {
          closeDialog();
          form.reset();
        },
      });
    }
  };

  return (
    <>
      <div className="font-medium text-lg mb-4">
        {isEditing ? 'Edit' : 'Create'} Material Request
      </div>

      <Form {...form}>
        <form
          className={cn("space-y-6", className)}
          onSubmit={form.handleSubmit(onSubmit)}
        >
          {/* Request Information */}
          <div className="space-y-4">
            <div className="text-sm font-semibold text-gray-700">Request Information</div>

            {/* Requester */}
            <FormField
              control={form.control}
              name="requesterId"
              render={({ field, fieldState: { error } }) => (
                <div>
                  <Label className="text-xs">Requester *</Label>
                  {canSelectOtherRequesters ? (
                    // Super Admin can select any manager
                    <Select
                      value={field.value && field.value > 0 ? field.value.toString() : ""}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      disabled={staffsIsLoading}
                    >
                      <FormControl>
                        <SelectTrigger className={field.value && field.value > 0 ? 'font-medium' : ''}>
                          <SelectValue placeholder="Select manager" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {managers.length > 0 ? (
                          managers.map((staff: any) => (
                            <SelectItem key={staff.id} value={staff.id.toString()}>
                              {staff.staffName || `${staff.firstName || ''} ${staff.lastName || ''}`.trim() || 'Unknown'}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-2 text-xs text-gray-500 text-center">No managers found</div>
                        )}
                      </SelectContent>
                    </Select>
                  ) : (
                    // Managers can only create requests for themselves
                    <div>
                      <FormControl>
                        <Input
                          value={currentUser.staffName || 'Loading...'}
                          disabled
                          className="bg-gray-50 cursor-not-allowed"
                        />
                      </FormControl>
                      <p className="text-xs text-gray-500 mt-1">
                        Material requests are created under your name. {currentUser.role?.name && `(${currentUser.role.name})`}
                      </p>
                    </div>
                  )}
                  {error && <FormMessage className="text-red-600 text-xs p-1">{error.message}</FormMessage>}
                </div>
              )}
            />

            {/* Production */}
            <FormField
              control={form.control}
              name="productionId"
              render={({ field, fieldState: { error } }) => (
                <div>
                  <Label className="text-xs">Production *</Label>
                  <Select
                    value={field.value && field.value > 0 ? field.value.toString() : ""}
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    disabled={productionsIsLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select production" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {productions && productions.length > 0 ? (
                        productions.map((production: any) => (
                          <SelectItem key={production.id} value={production.id.toString()}>
                            {production.product?.name || `Production #${production.id}`} - {production.product?.code || 'N/A'}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-2 text-xs text-gray-500 text-center">No productions available</div>
                      )}
                    </SelectContent>
                  </Select>
                  {error && <FormMessage className="text-red-600 text-xs p-1">{error.message}</FormMessage>}
                </div>
              )}
            />

            {/* Existing Requests Warning */}
            {existingRequestsData && existingRequestsData.summary && existingRequestsData.summary.total > 0 && (
              <div className="space-y-2">
                {/* Warning banner for pending requests */}
                {existingRequestsData.summary.pending > 0 && (
                  <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-semibold text-amber-900 text-sm">
                        Pending Material Request Exists
                      </div>
                      <div className="text-xs text-amber-700 mt-1">
                        This production already has {existingRequestsData.summary.pending} pending material request{existingRequestsData.summary.pending > 1 ? 's' : ''}.
                        Consider waiting for approval before creating a new one.
                      </div>
                    </div>
                  </div>
                )}

                {/* Summary of existing requests */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="text-xs font-semibold text-gray-700 mb-2">
                    Existing Material Requests ({existingRequestsData.summary.total})
                  </div>
                  <div className="space-y-2">
                    {existingRequestsData.requests && existingRequestsData.requests.length > 0 ? (
                      existingRequestsData.requests.map((request: any, index: number) => (
                        <div key={index} className="flex items-center justify-between text-xs bg-white rounded p-2 border border-gray-100">
                          <div className="flex items-center gap-2">
                            {request.approvalStatus === 'pending' && <Clock className="h-3.5 w-3.5 text-amber-500" />}
                            {request.approvalStatus === 'approved' && <CheckCircle className="h-3.5 w-3.5 text-green-500" />}
                            {request.approvalStatus === 'rejected' && <XCircle className="h-3.5 w-3.5 text-red-500" />}
                            {request.approvalStatus === 'cancelled' && <XCircle className="h-3.5 w-3.5 text-gray-500" />}
                            <span className="text-gray-600">
                              Request #{request.id} by {request.requester?.staffName || 'Unknown'}
                            </span>
                          </div>
                          <span className={cn(
                            "px-2 py-0.5 rounded text-xs font-medium capitalize",
                            request.approvalStatus === 'pending' && "bg-amber-100 text-amber-700",
                            request.approvalStatus === 'approved' && "bg-green-100 text-green-700",
                            request.approvalStatus === 'rejected' && "bg-red-100 text-red-700",
                            request.approvalStatus === 'cancelled' && "bg-gray-100 text-gray-700"
                          )}>
                            {request.approvalStatus}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-gray-500 text-center py-1">No requests found</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Production Quantity Details - Auto-populated */}
            {selectedProduction && selectedProduction.quantity && selectedProduction.quantity.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <Label className="text-xs text-blue-900 font-semibold">Production Quantities:</Label>
                <div className="mt-2 space-y-1">
                  {selectedProduction.quantity.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between text-sm text-blue-800">
                      <span>Size {item.size}:</span>
                      <span className="font-medium">{item.quantity} units</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field, fieldState: { error } }) => (
                <div>
                  <Label className="text-xs">Notes (Optional)</Label>
                  <FormControl>
                    <Textarea
                      placeholder="Add any notes or special instructions..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  {error && <FormMessage className="text-red-600 text-xs p-1">{error.message}</FormMessage>}
                </div>
              )}
            />
          </div>

          {/* Materials from Production */}
          <div className="space-y-4">
            <div className="text-sm font-semibold text-gray-700">Materials from Production</div>

            {!selectedProduction && (
              <div className="border border-dashed rounded-lg p-4 text-center text-gray-500 text-sm">
                Select a production to see required materials
              </div>
            )}

            {selectedProduction && selectedProduction.productGuide && selectedProduction.productGuide.length > 0 && (
              <div className="space-y-2">
                {selectedProduction.productGuide
                  .filter((guide: any) => guide.materialDetails)
                  .map((guide: any, index: number) => (
                    <div key={index} className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 text-sm">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-semibold text-green-900">
                            {guide.materialDetails?.name || `Material #${guide.id}`}
                          </div>
                          <div className="text-xs text-green-600 mt-0.5">
                            {guide.materialDetails?.code && `Code: ${guide.materialDetails.code}`}
                            {guide.materialDetails?.type?.name && ` • ${guide.materialDetails.type.name}`}
                          </div>
                        </div>
                        <div className="text-right ml-3">
                          <div className="font-bold text-brand-700 whitespace-nowrap">
                            {guide.qty} {guide.materialDetails?.type?.unit || 'units'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {selectedProduction && (!selectedProduction.productGuide || selectedProduction.productGuide.length === 0) && (
              <div className="border border-dashed rounded-lg p-4 text-center text-gray-500 text-sm">
                No materials defined for this production
              </div>
            )}
          </div>

          {/* Additional Materials (Optional) */}
          {selectedProduction && (
            <div className="space-y-4">
              <div className="text-sm font-semibold text-gray-700">Additional Materials (Optional)</div>
              <p className="text-xs text-gray-500">Add extra materials not included in the production definition</p>

              <MaterialPicker
                value={additionalMaterials}
                onChange={setAdditionalMaterials}
              />
            </div>
          )}

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
              {isEditing ? 'Update Request' : 'Create Request'}
            </CustomButton>
          </div>
        </form>
      </Form>
    </>
  );
};

export default MaterialRequestForm;
