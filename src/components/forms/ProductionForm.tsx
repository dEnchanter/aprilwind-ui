/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react-hooks/exhaustive-deps */
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
import { useStaff } from "@/hooks/useStaff";
import { useProductions } from "@/hooks/useProductions";
import { useCreateProductionTracking, useGenerateProductionCode, useProductionTracking } from "@/hooks/useProductionTracking";
import { useMaterialRequestsByProduction } from "@/hooks/useMaterialRequest";
import { useEffect, useState } from "react";
import { Package, AlertCircle, CheckCircle2, XCircle, Clock, Info } from "lucide-react";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { DialogTitle } from "../ui/dialog";

// Schema for production creation
const productionSchema = z.object({
  productForProductionId: z.number().min(1, "Product for Production is required"),
  code: z.string().min(1, "Production code is required"),
  tailorId: z.number().optional(), // Optional - can be assigned later
  productName: z.string().min(1, "Product name is required"),
  productCode: z.string().optional(), // For code generation
  size: z.number().min(1, "Size is required"),
  details: z.string().optional(),
});

type ProductionFormData = z.infer<typeof productionSchema>;

interface ProductionFormProps extends React.ComponentProps<"form"> {
  closeDialog: () => void;
}

const ProductionForm = ({ className, closeDialog }: ProductionFormProps) => {
  const createProduction = useCreateProductionTracking();
  const generateCode = useGenerateProductionCode();

  // Fetch Product for Production requests (only active/unassigned ones)
  const { data: productForProductionList, isLoading: productsLoading } = useProductions({ page: 1, limit: 100 });

  // Fetch staff (tailors) - filter by role if needed
  const { data: staffResponse, isLoading: staffLoading } = useStaff({ page: 1, limit: 100 });
  const staffs = staffResponse?.data || [];

  // Fetch existing productions to check for duplicates
  const { data: existingProductionsResponse } = useProductionTracking({ page: 1, limit: 1000 });
  const existingProductions = existingProductionsResponse?.data || [];

  const isLoading = createProduction.isPending;
  const [selectedProductForProduction, setSelectedProductForProduction] = useState<any | null>(null);
  const [productionsBySizes, setProductionsBySizes] = useState<Map<number, any>>(new Map());
  const [availableSizes, setAvailableSizes] = useState<Array<{ size: number; quantity: number }>>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Ensure component is mounted before rendering data-dependent content
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const form = useForm<ProductionFormData>({
    resolver: zodResolver(productionSchema),
    defaultValues: {
      productForProductionId: 0,
      code: '',
      tailorId: undefined, // Optional
      productName: '',
      productCode: '',
      size: 0,
      details: '',
    },
  });

  // Watch for selected product for production
  const watchedProductForProductionId = form.watch('productForProductionId');

  // Fetch material requests for the selected product for production
  const { data: materialRequestsData } = useMaterialRequestsByProduction(watchedProductForProductionId || 0);

  useEffect(() => {
    if (!isMounted) return;

    if (watchedProductForProductionId && productForProductionList) {
      const selected = productForProductionList.find(
        (p: any) => p.id === watchedProductForProductionId
      );
      setSelectedProductForProduction(selected || null);

      // Initialize available sizes from the selected product
      // This will be refined later when we check for existing productions
      if (selected?.quantity && Array.isArray(selected.quantity)) {
        setAvailableSizes(selected.quantity);
      } else {
        setAvailableSizes([]);
      }

      // Auto-populate product name and code when selection changes
      if (selected?.product?.name) {
        form.setValue('productName', selected.product.name);
      }
      if (selected?.product?.code) {
        form.setValue('productCode', selected.product.code);
      }
    } else {
      setSelectedProductForProduction(null);
      setProductionsBySizes(new Map());
      setAvailableSizes([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedProductForProductionId, productForProductionList, isMounted]);

  // Check if there's an approved material request
  const hasApprovedMaterialRequest = materialRequestsData?.summary?.approved > 0;
  const hasPendingMaterialRequest = materialRequestsData?.summary?.pending > 0;
  const hasNoMaterialRequest = !materialRequestsData || materialRequestsData?.summary?.total === 0;

  // Get the approved material request ID
  // The API returns 'requests' array, not 'data'
  const approvedMaterialRequest = materialRequestsData?.requests?.find(
    (req: any) => req.approvalStatus === 'approved'
  );

  // Check for existing productions using the approved material request ID
  useEffect(() => {
    if (approvedMaterialRequest && existingProductions && selectedProductForProduction) {
      const productionsForThisMaterialRequest = existingProductions.filter(
        (prod: any) => prod.prodRequestedId === approvedMaterialRequest.id
      );

      const sizeMap = new Map();
      productionsForThisMaterialRequest.forEach((prod: any) => {
        const size = prod.productInfo?.size;
        if (size) {
          sizeMap.set(size, prod);
        }
      });
      setProductionsBySizes(sizeMap);

      // Calculate available sizes (sizes that DON'T have productions yet)
      if (selectedProductForProduction.quantity && Array.isArray(selectedProductForProduction.quantity)) {
        const available = selectedProductForProduction.quantity.filter(
          (item: any) => !sizeMap.has(item.size)
        );
        setAvailableSizes(available);
      }
    } else if (!approvedMaterialRequest && selectedProductForProduction) {
      // If no approved material request yet, reset to show all sizes as available
      setProductionsBySizes(new Map());
      if (selectedProductForProduction.quantity && Array.isArray(selectedProductForProduction.quantity)) {
        setAvailableSizes(selectedProductForProduction.quantity);
      }
    }
  }, [approvedMaterialRequest, existingProductions, selectedProductForProduction]);

  const onSubmit: SubmitHandler<ProductionFormData> = async (data) => {
    if (!selectedProductForProduction) {
      return;
    }

    // Block if no approved material request
    if (!hasApprovedMaterialRequest || !approvedMaterialRequest) {
      toast.error('No approved material request found');
      return;
    }

    // Build payload according to backend DTO
    // Data Flow: ProductForProduction → MaterialRequest (approved) → Production
    // Production.prodRequestedId references MaterialRequest.id (not ProductForProduction.id)
    // Stage logic: If tailor is assigned, set to "in production", otherwise "Bidding"
    const payload: CreateProductionRequest = {
      code: data.code,
      prodRequestedId: approvedMaterialRequest.id, // ✅ MaterialRequest ID (e.g., 9) NOT ProductForProduction ID
      productInfo: {
        name: data.productName,
        size: data.size, // Use selected size from form
        details: data.details || '',
      },
      ...(data.tailorId && { tailorId: data.tailorId }), // Only include if selected
      stage: data.tailorId ? 'in production' : 'Bidding', // Auto-set stage based on tailor assignment
    };

    createProduction.mutate(payload, {
      onSuccess: () => {
        closeDialog();
        form.reset({
          productForProductionId: 0,
          code: '',
          tailorId: undefined,
          productName: '',
          productCode: '',
          size: 0,
          details: '',
        });
      },
    });
  };

  // Check if form can be submitted - must have available sizes (sizes without productions yet)
  const canSubmit = selectedProductForProduction && hasApprovedMaterialRequest && availableSizes.length > 0;

  return (
    <>
      <DialogTitle className="font-medium text-lg mb-4">
        Create Production
      </DialogTitle>

      <Form {...form}>
        <form
          className={cn("space-y-6", className)}
          onSubmit={form.handleSubmit(onSubmit)}
        >
          {/* Product for Production Selection */}
          <div className="space-y-4">
            <div className="text-sm font-semibold text-gray-700">Production Details</div>

            <FormField
              control={form.control}
              name="productForProductionId"
              render={({ field, fieldState: { error } }) => (
                <div>
                  <Label className="text-xs">Product for Production *</Label>
                  <Select
                    value={field.value && field.value > 0 ? field.value.toString() : ""}
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    disabled={productsLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select product for production" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {productForProductionList && productForProductionList.length > 0 ? (
                        productForProductionList.map((prod: any) => (
                          <SelectItem key={prod.id} value={prod.id.toString()}>
                            {prod.product?.name || `Product #${prod.id}`} - {prod.product?.code || 'N/A'}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-2 text-xs text-gray-500 text-center">No products available</div>
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Select the product request you want to create production for
                  </p>
                  {error && <FormMessage className="text-red-600 text-xs p-1">{error.message}</FormMessage>}
                </div>
              )}
            />

            {/* Material Request Status Check */}
            {isMounted && selectedProductForProduction && (
              <>
                {/* No Material Request */}
                {hasNoMaterialRequest && (
                  <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-semibold text-red-900 text-sm">
                        No Material Request Found
                      </div>
                      <div className="text-xs text-red-700 mt-1">
                        You must create and get approval for a material request before starting production.
                        Go to Material Requests tab to create one for this production.
                      </div>
                      <div className="mt-2 text-xs text-red-600 font-medium">
                        ⚠️ Production cannot proceed without approved materials
                      </div>
                    </div>
                  </div>
                )}

                {/* Pending Material Request */}
                {!hasNoMaterialRequest && hasPendingMaterialRequest && !hasApprovedMaterialRequest && (
                  <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4 flex items-start gap-3">
                    <Clock className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-semibold text-amber-900 text-sm">
                        Material Request Pending Approval
                      </div>
                      <div className="text-xs text-amber-700 mt-1">
                        A material request exists but is still pending approval.
                        Please wait for approval before starting production.
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs font-medium text-amber-800">
                          Status: {materialRequestsData?.summary?.pending} Pending
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-amber-600 font-medium">
                        ⚠️ Production cannot proceed until materials are approved
                      </div>
                    </div>
                  </div>
                )}

                {/* Approved Material Request - Success */}
                {hasApprovedMaterialRequest && approvedMaterialRequest && (
                  <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-semibold text-green-900 text-sm">
                        Materials Approved - Ready for Production
                      </div>
                      <div className="text-xs text-green-700 mt-1">
                        Material request has been approved and materials are allocated. You can now proceed with production.
                      </div>
                      <div className="mt-2 flex items-center gap-3 text-xs">
                        <span className="font-medium text-green-800">
                          ✓ Material Request ID: #{approvedMaterialRequest.id}
                        </span>
                        {materialRequestsData?.summary?.total && (
                          <span className="text-green-600">
                            Total Requests: {materialRequestsData.summary.total}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Production Status by Size */}
                {selectedProductForProduction?.quantity && selectedProductForProduction.quantity.length > 0 && (
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Package className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="font-semibold text-blue-900 text-sm mb-1">
                          Production Status by Size
                        </div>
                        <p className="text-xs text-blue-700 mb-3">
                          Each size requires its own production record. Track which sizes are assigned and which are available.
                        </p>
                        <div className="space-y-2">
                          {selectedProductForProduction.quantity.map((item: any, index: number) => {
                            const hasProduction = productionsBySizes.has(item.size);
                            const production = productionsBySizes.get(item.size);

                            return (
                              <div
                                key={index}
                                className={cn(
                                  "flex items-center justify-between p-3 rounded-lg border",
                                  hasProduction
                                    ? "bg-green-50 border-green-200"
                                    : "bg-white border-blue-200"
                                )}
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-sm">Size {item.size}</span>
                                    <span className="text-xs text-gray-600">({item.quantity} units)</span>
                                  </div>
                                  {hasProduction && production && (
                                    <div className="mt-1 space-y-0.5 text-xs text-gray-700">
                                      <div>Code: <span className="font-mono">{production.code}</span></div>
                                      {production.tailor && (
                                        <div>Tailor: <span className="font-medium">{production.tailor.staffName}</span></div>
                                      )}
                                      <div>Stage: <span className="capitalize">{production.stage?.replace(/_/g, ' ')}</span></div>
                                    </div>
                                  )}
                                </div>
                                <div>
                                  {hasProduction ? (
                                    <span className="px-2 py-1 rounded text-xs font-medium bg-green-600 text-white">
                                      ✓ Assigned
                                    </span>
                                  ) : (
                                    <span className="px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-700">
                                      Pending
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {availableSizes.length === 0 && (
                          <div className="mt-3 text-xs text-green-700 font-medium flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            All sizes have been assigned to production
                          </div>
                        )}
                        {availableSizes.length > 0 && (
                          <div className="mt-3 text-xs text-blue-700 font-medium">
                            {availableSizes.length} size{availableSizes.length !== 1 ? 's' : ''} available to assign
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Show selected product details */}
            {isMounted && selectedProductForProduction && hasApprovedMaterialRequest && availableSizes.length > 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2 font-semibold text-sm text-gray-700">
                  <Package className="h-4 w-4" />
                  Selected Product Details
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Product Code:</span>
                    <span className="font-medium font-mono">{selectedProductForProduction.product?.code || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Unit Cost:</span>
                    <span className="font-medium">₦{selectedProductForProduction.product?.cost?.toLocaleString() || '0'}</span>
                  </div>
                </div>

                {/* Materials Required */}
                {selectedProductForProduction.productGuide && selectedProductForProduction.productGuide.length > 0 && (
                  <div className="pt-2 border-t border-gray-200">
                    <div className="text-xs font-semibold text-gray-700 mb-2">Materials Required per Unit:</div>
                    <div className="space-y-2">
                      {selectedProductForProduction.productGuide
                        .filter((guide: any) => guide.materialDetails)
                        .map((guide: any, index: number) => (
                          <div key={index} className="text-xs bg-white rounded p-2 border border-gray-200">
                            <div className="font-medium text-gray-900">{guide.materialDetails?.name || '-'}</div>
                            <div className="text-gray-600 mt-0.5">
                              {guide.qty} {guide.materialDetails?.type?.unit || 'units'}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Production Details - Only show if materials approved and available sizes exist */}
          {isMounted && hasApprovedMaterialRequest && availableSizes.length > 0 && (
            <div className="space-y-4">
              <div className="text-sm font-semibold text-gray-700">Production Configuration</div>

              {/* Production Code */}
              <FormField
                control={form.control}
                name="code"
                render={({ field, fieldState: { error } }) => (
                  <div>
                    <Label className="text-xs">Production Code *</Label>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          placeholder="Click generate or type manually"
                          {...field}
                          className="font-mono flex-1"
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const productCode = form.getValues('productCode');
                          const size = form.getValues('size');

                          if (!productCode || !size) {
                            toast.error('Please select a product and size first');
                            return;
                          }

                          generateCode.mutate(
                            { productCode, sizeId: size },
                            {
                              onSuccess: (data) => {
                                if (data?.code) {
                                  form.setValue('code', data.code);
                                  toast.success('Production code generated!');
                                }
                              },
                            }
                          );
                        }}
                        disabled={generateCode.isPending || !form.getValues('productCode') || !form.getValues('size')}
                      >
                        {generateCode.isPending ? 'Generating...' : 'Generate'}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Click "Generate" or type manually
                    </p>
                    {error && <FormMessage className="text-red-600 text-xs p-1">{error.message}</FormMessage>}
                  </div>
                )}
              />

              {/* Product Name (Auto-populated, read-only) */}
              <FormField
                control={form.control}
                name="productName"
                render={({ field, fieldState: { error } }) => (
                  <div>
                    <Label className="text-xs">Product Name *</Label>
                    <FormControl>
                      <Input
                        placeholder="Product name"
                        {...field}
                        readOnly
                        className="bg-gray-50"
                      />
                    </FormControl>
                    <p className="text-xs text-gray-500 mt-1">
                      Auto-populated from selected product
                    </p>
                    {error && <FormMessage className="text-red-600 text-xs p-1">{error.message}</FormMessage>}
                  </div>
                )}
              />

              {/* Size Selection - Only Available Sizes */}
              <FormField
                control={form.control}
                name="size"
                render={({ field, fieldState: { error } }) => (
                  <div>
                    <Label className="text-xs">Select Size for This Production *</Label>
                    <Select
                      value={field.value && field.value > 0 ? field.value.toString() : ""}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      disabled={availableSizes.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an available size" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableSizes.length > 0 ? (
                          availableSizes.map((item: any, index: number) => (
                            <SelectItem key={index} value={item.size.toString()}>
                              Size {item.size} ({item.quantity} units)
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-2 text-xs text-gray-500 text-center">No available sizes</div>
                        )}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">
                      Select one size to create production for ({availableSizes.length} available)
                    </p>
                    {error && <FormMessage className="text-red-600 text-xs p-1">{error.message}</FormMessage>}
                  </div>
                )}
              />

              {/* Tailor Assignment (Optional) */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3 mb-3">
                  <Info className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-semibold text-amber-900 text-sm">
                      Tailor Assignment (Optional)
                    </div>
                    <div className="text-xs text-amber-700 mt-1">
                      You can assign a tailor now or later. If no tailor is assigned, the production will be in "Bidding" stage. Once assigned, it automatically moves to "In Production".
                    </div>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="tailorId"
                  render={({ field, fieldState: { error } }) => (
                    <div>
                      <Label className="text-xs">Assign Tailor (Optional)</Label>
                    <Select
                      value={field.value && field.value > 0 ? field.value.toString() : ""}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      disabled={staffLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select tailor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {staffs.map((staff: any) => (
                          <SelectItem key={staff.id} value={staff.id.toString()}>
                            {staff.staffName || `${staff.firstName || ''} ${staff.lastName || ''}`.trim() || 'Unknown'} ({staff.role?.name || "No Role"})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">
                      Leave empty to assign later (production will be in "Bidding" stage)
                    </p>
                    {error && <FormMessage className="text-red-600 text-xs p-1">{error.message}</FormMessage>}
                    </div>
                  )}
                />
              </div>
            </div>
          )}

          {/* Additional Details - Only show if materials approved and available sizes exist */}
          {isMounted && hasApprovedMaterialRequest && availableSizes.length > 0 && (
            <FormField
              control={form.control}
              name="details"
              render={({ field, fieldState: { error } }) => (
                <div>
                  <Label className="text-xs">Additional Details (Optional)</Label>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional details for this production..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  {error && <FormMessage className="text-red-600 text-xs p-1">{error.message}</FormMessage>}
                </div>
              )}
            />
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-2 pt-4 border-t">
            <Button
              type="button"
              size="lg"
              variant="outline"
              onClick={() => {
                closeDialog();
                form.reset({
                  productForProductionId: 0,
                  code: '',
                  tailorId: 0,
                  productName: '',
                  productCode: '',
                  size: 0,
                  details: '',
                });
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
              disabled={!canSubmit || isLoading}
            >
              {availableSizes.length === 0 ? 'All Sizes Assigned' : !hasApprovedMaterialRequest ? 'Materials Not Approved' : 'Create Production'}
            </CustomButton>
          </div>

          {/* Helper text for disabled button */}
          {isMounted && !canSubmit && selectedProductForProduction && (
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 -mt-2">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>
                {availableSizes.length === 0
                  ? 'All sizes have been assigned to production'
                  : 'You must have an approved material request to create production'}
              </span>
            </div>
          )}
        </form>
      </Form>
    </>
  );
};

export default ProductionForm;
