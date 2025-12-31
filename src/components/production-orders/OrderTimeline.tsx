/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ProductionOrderTimeline } from "@/types/production-order";
import { formatDate } from "@/lib/utils";
import {
  CheckCircle,
  XCircle,
  Clock,
  Package,
  Truck,
  Ban,
  FileCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface OrderTimelineProps {
  timeline: ProductionOrderTimeline;
}

export function OrderTimeline({ timeline }: OrderTimelineProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "approved":
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "in_production":
        return <Package className="h-4 w-4 text-purple-600" />;
      case "completed":
        return <FileCheck className="h-4 w-4 text-green-600" />;
      case "delivered":
        return <Truck className="h-4 w-4 text-gray-600" />;
      case "cancelled":
        return <Ban className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "approved":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-300";
      case "in_production":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "completed":
        return "bg-green-100 text-green-800 border-green-300";
      case "delivered":
        return "bg-gray-100 text-gray-800 border-gray-300";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Order Received",
      approved: "Order Approved",
      rejected: "Order Rejected",
      in_production: "In Production",
      completed: "Production Completed",
      delivered: "Delivered to Customer",
      cancelled: "Order Cancelled",
    };
    return labels[status] || status;
  };

  if (!timeline.timeline || timeline.timeline.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm">No timeline events yet</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline Line */}
      <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-gray-200" />

      {/* Timeline Events */}
      <div className="space-y-6">
        {timeline.timeline.map((event, index) => {
          const isLatest = index === timeline.timeline.length - 1;
          const isCurrent = event.status === timeline.currentStatus;

          return (
            <div key={index} className="relative pl-10">
              {/* Timeline Dot */}
              <div
                className={`absolute left-0 top-0 w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  isCurrent
                    ? "bg-brand-600 border-brand-700"
                    : isLatest
                    ? "bg-white border-brand-600"
                    : "bg-white border-gray-300"
                }`}
              >
                {isCurrent ? (
                  <div className="w-3 h-3 rounded-full bg-white" />
                ) : (
                  getStatusIcon(event.status)
                )}
              </div>

              {/* Event Card */}
              <div
                className={`p-4 rounded-lg border ${
                  isCurrent
                    ? "bg-brand-50 border-brand-200"
                    : isLatest
                    ? "bg-blue-50 border-blue-200"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-2">
                  <Badge
                    variant="outline"
                    className={getStatusColor(event.status)}
                  >
                    {getStatusLabel(event.status)}
                  </Badge>
                  {isCurrent && (
                    <Badge className="bg-brand-600 text-white">Current</Badge>
                  )}
                </div>

                {/* Event Details */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600">By:</span>
                    <span className="font-medium text-gray-900">
                      {event.performedBy}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-3 w-3" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  {event.notes && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-sm text-gray-700">{event.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 p-4 bg-gray-100 rounded-lg border border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600 mb-1">Order Date</p>
            <p className="font-medium text-gray-900">
              {formatDate(timeline.orderDate)}
            </p>
          </div>
          <div>
            <p className="text-gray-600 mb-1">Expected Delivery</p>
            <p className="font-medium text-gray-900">
              {formatDate(timeline.expectedDeliveryDate)}
            </p>
          </div>
          {timeline.actualDeliveryDate && (
            <>
              <div className="col-span-2">
                <p className="text-gray-600 mb-1">Actual Delivery</p>
                <p className="font-medium text-gray-900">
                  {formatDate(timeline.actualDeliveryDate)}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
