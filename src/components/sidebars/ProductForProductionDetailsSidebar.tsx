/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Package, Calendar, User, Layers, CheckCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface ProductForProductionDetailsSidebarProps {
  open: boolean;
  onClose: () => void;
  production: any | null;
}

const ProductForProductionDetailsSidebar = ({ open, onClose, production }: ProductForProductionDetailsSidebarProps) => {
  if (!production) return null;

  const materialRequest = production.materialRequest;
  const materialStatus = materialRequest?.approvalStatus || 'pending';

  // Get badge styling based on status
  const getStatusBadge = () => {
    switch (materialStatus) {
      case 'approved':
        return { className: "bg-green-100 text-green-800 border-green-200", label: "Approved", description: "Material request has been approved" };
      case 'rejected':
        return { className: "bg-red-100 text-red-800 border-red-200", label: "Rejected", description: "Material request was rejected" };
      case 'cancelled':
        return { className: "bg-gray-100 text-gray-800 border-gray-200", label: "Cancelled", description: "Material request was cancelled" };
      default:
        return { className: "bg-amber-100 text-amber-800 border-amber-200", label: "Pending", description: "Material availability check pending" };
    }
  };

  const statusInfo = getStatusBadge();

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl font-semibold">Production Request Details</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Product Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Package className="h-4 w-4" />
              Product Information
            </h3>

            <div className="space-y-3 pl-6">
              <div>
                <label className="text-xs text-gray-500">Product Name</label>
                <p className="text-sm font-medium">{production.product?.name || '-'}</p>
              </div>

              <div>
                <label className="text-xs text-gray-500">Product Code</label>
                <p className="text-sm font-medium font-mono text-brand-700">{production.product?.code || '-'}</p>
              </div>

              <div>
                <label className="text-xs text-gray-500">Production Cost</label>
                <p className="text-sm font-medium">₦{production.product?.cost?.toLocaleString() || '0'}</p>
              </div>

              <div>
                <label className="text-xs text-gray-500">Status</label>
                <div className="mt-1">
                  <Badge className={production.isActive ? "bg-green-100 text-green-800 border-green-200" : "bg-gray-100 text-gray-800 border-gray-200"}>
                    {production.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>

              {production.product?.productSizes && production.product.productSizes.length > 0 && (
                <div>
                  <label className="text-xs text-gray-500">Available Sizes</label>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {production.product.productSizes.map((size: number) => (
                      <span
                        key={size}
                        className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium"
                      >
                        {size}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Request Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <User className="h-4 w-4" />
              Request Information
            </h3>

            <div className="space-y-3 pl-6">
              <div>
                <label className="text-xs text-gray-500">Requested By</label>
                <p className="text-sm font-medium">
                  {production.requester?.staffName || `Staff #${production.requestedBy}` || '-'}
                </p>
              </div>

              {production.dateRequested && (
                <div>
                  <label className="text-xs text-gray-500">Date Requested</label>
                  <p className="text-sm font-medium flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(production.dateRequested)}
                  </p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Material Requirements */}
          {production.productGuide && production.productGuide.length > 0 && (
            <>
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Material Requirements
                </h3>

                <div className="space-y-2 pl-6">
                  {production.productGuide.map((item: any, index: number) => (
                    <div
                      key={index}
                      className="p-3 border rounded-lg bg-gray-50 space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {item.materialDetails?.name || `Material #${item.id}`}
                          </p>
                          {item.materialDetails?.code && (
                            <p className="text-xs text-gray-500">
                              Code: {item.materialDetails.code}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-brand-700">
                            {item.qty} {item.materialDetails?.type?.unit || 'units'}
                          </p>
                        </div>
                      </div>

                      {item.materialDetails?.description && (
                        <p className="text-xs text-gray-600">
                          {item.materialDetails.description}
                        </p>
                      )}

                      {item.materialDetails?.type && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="px-2 py-0.5 bg-white rounded border">
                            {item.materialDetails.type.name}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <Separator />
            </>
          )}

          {/* Size & Quantity Breakdown */}
          {production.quantity && production.quantity.length > 0 && (
            <>
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Size & Quantity Breakdown
                </h3>

                <div className="space-y-2 pl-6">
                  {production.quantity.map((item: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
                    >
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-brand-700 text-white rounded text-sm font-medium">
                          Size {item.size}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          {item.quantity} units
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pl-6 pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">Total Quantity</span>
                    <span className="text-sm font-bold text-brand-700">
                      {production.quantity.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0)} units
                    </span>
                  </div>
                </div>
              </div>

              <Separator />
            </>
          )}

          {/* Material Status */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Material Status
            </h3>

            <div className="pl-6">
              <Badge className={statusInfo.className}>
                {statusInfo.label}
              </Badge>
              <p className="text-xs text-gray-500 mt-2">
                {statusInfo.description}
              </p>
            </div>
          </div>

          <Separator />

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">Additional Information</h3>

            <div className="space-y-3 pl-6">
              <div>
                <label className="text-xs text-gray-500">Request ID</label>
                <p className="text-sm font-medium">{production.id}</p>
              </div>

              {production.productId && (
                <div>
                  <label className="text-xs text-gray-500">Product ID</label>
                  <p className="text-sm font-medium">{production.productId}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ProductForProductionDetailsSidebar;
