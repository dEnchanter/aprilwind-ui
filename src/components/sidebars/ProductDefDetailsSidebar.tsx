/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Package, DollarSign, User, Layers } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface ProductDefDetailsSidebarProps {
  open: boolean;
  onClose: () => void;
  productDef: ProductDef | null;
}

const ProductDefDetailsSidebar = ({ open, onClose, productDef }: ProductDefDetailsSidebarProps) => {
  if (!productDef) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl font-semibold">Product Details</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Package className="h-4 w-4" />
              Basic Information
            </h3>

            <div className="space-y-3 pl-6">
              <div>
                <label className="text-xs text-gray-500">Product Code</label>
                <p className="text-sm font-medium">{productDef.code}</p>
              </div>

              <div>
                <label className="text-xs text-gray-500">Product Name</label>
                <p className="text-sm font-medium">{productDef.name}</p>
              </div>

              <div>
                <label className="text-xs text-gray-500">Production Cost</label>
                <p className="text-sm font-medium flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  {formatCurrency(productDef.cost)}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Material Specifications */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Material Specifications
            </h3>

            {productDef.def && productDef.def.length > 0 ? (
              <div className="space-y-3 pl-6">
                {productDef.def.map((material: any, index: number) => (
                  <div
                    key={index}
                    className="p-3 border rounded-lg bg-gray-50 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {material.materialDetails?.name || `Material #${material.item}`}
                        </p>
                        {material.materialDetails?.code && (
                          <p className="text-xs text-gray-500">
                            Code: {material.materialDetails.code}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-brand-700">
                          {material.qty} {material.materialDetails?.type?.unit || 'units'}
                        </p>
                      </div>
                    </div>

                    {material.materialDetails?.description && (
                      <p className="text-xs text-gray-600">
                        {material.materialDetails.description}
                      </p>
                    )}

                    {material.materialDetails?.type && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="px-2 py-0.5 bg-white rounded border">
                          {material.materialDetails.type.name}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 pl-6">No materials specified</p>
            )}
          </div>

          <Separator />

          {/* Available Sizes */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">Available Sizes</h3>

            {productDef.productSizes && productDef.productSizes.length > 0 ? (
              <div className="flex flex-wrap gap-2 pl-6">
                {productDef.productSizes.map((size: number) => (
                  <span
                    key={size}
                    className="px-3 py-1 bg-brand-700 text-white rounded text-sm font-medium"
                  >
                    {size}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 pl-6">No sizes specified</p>
            )}
          </div>

          <Separator />

          {/* Meta Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Additional Information
            </h3>

            <div className="space-y-3 pl-6">
              <div>
                <label className="text-xs text-gray-500">Created By</label>
                <p className="text-sm font-medium flex items-center gap-1">
                  <User className="h-3 w-3" />
                  Creator ID: {productDef.creatorId}
                </p>
              </div>

              <div>
                <label className="text-xs text-gray-500">Product ID</label>
                <p className="text-sm font-medium">{productDef.id}</p>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ProductDefDetailsSidebar;
