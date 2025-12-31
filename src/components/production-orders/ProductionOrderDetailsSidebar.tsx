/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  User,
  Calendar,
  Package,
  DollarSign,
  TrendingUp,
  Clock,
  MapPin,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { ProductionOrder } from "@/types/production-order";
import { useProductionOrderTimeline } from "@/hooks/useProductionOrders";
import { getStatusBadge, getPriorityBadge } from "@/app/(dashboard)/production-orders/columns";
import { formatDate } from "@/lib/utils";
import { OrderTimeline } from "./OrderTimeline";

interface ProductionOrderDetailsSidebarProps {
  order: ProductionOrder | null;
  open: boolean;
  onClose: () => void;
}

export function ProductionOrderDetailsSidebar({
  order,
  open,
  onClose,
}: ProductionOrderDetailsSidebarProps) {
  const { data: timeline, isLoading: timelineLoading } = useProductionOrderTimeline(
    order?.id || 0
  );

  if (!order) return null;

  const totalItems = order.orderDetails?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const isLate = order.actualDeliveryDate
    ? new Date(order.actualDeliveryDate) > new Date(order.expectedDeliveryDate)
    : new Date() > new Date(order.expectedDeliveryDate) && order.status !== 'delivered';

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="overflow-y-auto w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>Production Order Details</SheetTitle>
          <SheetDescription>
            View complete information about this production order
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Order Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{order.orderNo}</h3>
              <p className="text-sm text-gray-500 mt-1">
                Order Date: {formatDate(order.orderDate)}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              {getStatusBadge(order.status)}
              {getPriorityBadge(order.priority)}
            </div>
          </div>

          <Separator />

          {/* Customer Information */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <User className="h-4 w-4 text-brand-600" />
              Customer Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Customer Name</p>
                  <p className="font-medium">{order.customer?.name || "N/A"}</p>
                </div>
              </div>

              {order.customer?.address && (
                <>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="font-medium">{order.customer.address}</p>
                    </div>
                  </div>
                </>
              )}

              {order.customer?.country && (
                <>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Country</p>
                      <p className="font-medium">{order.customer.country}</p>
                    </div>
                  </div>
                </>
              )}

              {order.customer?.customerType && (
                <>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <Package className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Customer Type</p>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {order.customer.customerType.type}
                      </Badge>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <Separator />

          {/* Order Items */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Package className="h-4 w-4 text-brand-600" />
              Order Items ({order.orderDetails?.length || 0})
            </h3>
            <div className="space-y-3">
              {order.orderDetails?.map((item, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">{item.productName}</h4>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      ₦{Number(item.estimatedCost || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Size:</span>{" "}
                      <span className="font-medium">{item.size}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Quantity:</span>{" "}
                      <span className="font-medium">{item.quantity}</span>
                    </div>
                  </div>
                  {item.specifications && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Specifications:</p>
                      <p className="text-sm text-gray-700">{item.specifications}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-3 p-3 bg-blue-50 rounded-md border border-blue-200">
              <div className="flex justify-between items-center text-sm">
                <span className="text-blue-700 font-medium">Total Items:</span>
                <span className="text-blue-900 font-bold">{totalItems} units</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Cost Information */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-brand-600" />
              Cost Information
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span className="text-gray-600">Estimated Total:</span>
                <span className="font-medium">
                  ₦{Number(order.estimatedTotalCost || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              {order.agreedTotalCost && (
                <div className="flex justify-between p-2 bg-green-50 rounded">
                  <span className="text-green-700 font-medium">Agreed Total:</span>
                  <span className="text-green-900 font-bold">
                    ₦{Number(order.agreedTotalCost || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Delivery Information */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-brand-600" />
              Delivery Information
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Expected Delivery:</span>
                <span className="font-medium">
                  {formatDate(order.expectedDeliveryDate)}
                </span>
              </div>
              {order.actualDeliveryDate && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Actual Delivery:</span>
                    <span className="font-medium">
                      {formatDate(order.actualDeliveryDate)}
                    </span>
                  </div>
                  <div className={`p-2 rounded ${isLate ? 'bg-orange-50' : 'bg-green-50'}`}>
                    <p className={`text-xs ${isLate ? 'text-orange-700' : 'text-green-700'}`}>
                      {isLate ? '⚠️ Delivered Late' : '✓ Delivered On Time'}
                    </p>
                  </div>
                </>
              )}
              {!order.actualDeliveryDate && isLate && (
                <div className="p-2 bg-red-50 rounded">
                  <p className="text-xs text-red-700 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Overdue - Expected delivery date has passed
                  </p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Production Assignment */}
          {order.productionId && (
            <>
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-brand-600" />
                  Production Assignment
                </h3>
                <div className="p-3 bg-purple-50 rounded-md border border-purple-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-purple-700 font-medium">
                        Production ID: {order.productionId}
                      </p>
                      <p className="text-xs text-purple-600 mt-1">
                        Assigned to production line
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-purple-700 hover:text-purple-900"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Staff Information */}
          <div>
            <h3 className="font-semibold mb-3">Staff Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Received By:</span>
                <span className="font-medium">{order.receiver?.staffName || "N/A"}</span>
              </div>
              {order.approver && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Approved By:</span>
                  <span className="font-medium">{order.approver.staffName}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Timeline */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-brand-600" />
              Order Timeline
            </h3>
            {timelineLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : timeline ? (
              <OrderTimeline timeline={timeline} />
            ) : (
              <p className="text-sm text-gray-500">No timeline data available</p>
            )}
          </div>

          {/* Notes */}
          {order.notes && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Notes</h3>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md border border-gray-200">
                  {order.notes}
                </p>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
