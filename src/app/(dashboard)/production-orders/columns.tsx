/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ProductionOrder, ProductionOrderStatus, OrderPriority } from "@/types/production-order";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Truck,
  ClipboardCheck,
  Ban,
  Link2,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

// Status badge renderer
export const getStatusBadge = (status: ProductionOrderStatus) => {
  const statusConfig: Record<
    ProductionOrderStatus,
    { label: string; className: string }
  > = {
    pending: {
      label: "Pending",
      className: "bg-yellow-100 text-yellow-800 border-yellow-300",
    },
    approved: {
      label: "Approved",
      className: "bg-blue-100 text-blue-800 border-blue-300",
    },
    rejected: {
      label: "Rejected",
      className: "bg-red-100 text-red-800 border-red-300",
    },
    in_production: {
      label: "In Production",
      className: "bg-purple-100 text-purple-800 border-purple-300",
    },
    completed: {
      label: "Completed",
      className: "bg-green-100 text-green-800 border-green-300",
    },
    delivered: {
      label: "Delivered",
      className: "bg-gray-100 text-gray-800 border-gray-300",
    },
    cancelled: {
      label: "Cancelled",
      className: "bg-red-100 text-red-800 border-red-300",
    },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
};

// Priority badge renderer
export const getPriorityBadge = (priority: OrderPriority) => {
  const priorityConfig: Record<
    OrderPriority,
    { label: string; className: string }
  > = {
    low: {
      label: "Low",
      className: "bg-gray-100 text-gray-700 border-gray-300",
    },
    normal: {
      label: "Normal",
      className: "bg-blue-100 text-blue-700 border-blue-300",
    },
    high: {
      label: "High",
      className: "bg-orange-100 text-orange-700 border-orange-300",
    },
    urgent: {
      label: "Urgent",
      className: "bg-red-100 text-red-700 border-red-300",
    },
  };

  const config = priorityConfig[priority] || priorityConfig.normal;

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
};

interface ColumnsProps {
  onView: (order: ProductionOrder) => void;
  onEdit: (order: ProductionOrder) => void;
  onApprove: (order: ProductionOrder) => void;
  onReject: (order: ProductionOrder) => void;
  onCreateProduction: (order: ProductionOrder) => void;
  onComplete: (order: ProductionOrder) => void;
  onDeliver: (order: ProductionOrder) => void;
  onCancel: (order: ProductionOrder) => void;
}

export const getColumns = ({
  onView,
  onEdit,
  onApprove,
  onReject,
  onCreateProduction,
  onComplete,
  onDeliver,
  onCancel,
}: ColumnsProps): ColumnDef<ProductionOrder>[] => [
  {
    accessorKey: "orderNo",
    header: "Order No.",
    cell: ({ row }) => (
      <div className="font-mono text-sm font-medium text-gray-900">
        {row.original.orderNo}
      </div>
    ),
  },
  {
    accessorKey: "customer",
    header: "Customer",
    cell: ({ row }) => (
      <div>
        <div className="font-medium text-gray-900">
          {row.original.customer?.name || "N/A"}
        </div>
        {row.original.customer?.country && (
          <div className="text-xs text-gray-500">
            {row.original.customer.country}
          </div>
        )}
      </div>
    ),
  },
  {
    accessorKey: "orderDate",
    header: "Order Date",
    cell: ({ row }) => (
      <div className="text-sm text-gray-600">
        {formatDate(row.original.orderDate)}
      </div>
    ),
  },
  {
    accessorKey: "expectedDeliveryDate",
    header: "Expected Delivery",
    cell: ({ row }) => (
      <div className="text-sm text-gray-600">
        {formatDate(row.original.expectedDeliveryDate)}
      </div>
    ),
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => getPriorityBadge(row.original.priority),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => getStatusBadge(row.original.status),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const order = row.original;
      const canApprove = order.status === "pending";
      const canReject = order.status === "pending";
      const canCreateProduction = order.status === "approved" && !order.productionId;
      const canComplete = order.status === "in_production";
      const canDeliver = order.status === "completed";
      const canCancel = !["delivered", "cancelled"].includes(order.status);
      const canEdit = order.status === "pending";

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0 hover:bg-gray-100"
            >
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => onView(order)} className="cursor-pointer">
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>

            {canEdit && (
              <DropdownMenuItem onClick={() => onEdit(order)} className="cursor-pointer">
                <Edit className="mr-2 h-4 w-4" />
                Edit Order
              </DropdownMenuItem>
            )}

            {canApprove && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onApprove(order)}
                  className="cursor-pointer text-green-600"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve Order
                </DropdownMenuItem>
              </>
            )}

            {canReject && (
              <DropdownMenuItem
                onClick={() => onReject(order)}
                className="cursor-pointer text-red-600"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Reject Order
              </DropdownMenuItem>
            )}

            {canCreateProduction && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onCreateProduction(order)}
                  className="cursor-pointer text-blue-600"
                >
                  <Link2 className="mr-2 h-4 w-4" />
                  Create Production
                </DropdownMenuItem>
              </>
            )}

            {canComplete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onComplete(order)}
                  className="cursor-pointer text-green-600"
                >
                  <ClipboardCheck className="mr-2 h-4 w-4" />
                  Mark as Completed
                </DropdownMenuItem>
              </>
            )}

            {canDeliver && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDeliver(order)}
                  className="cursor-pointer text-green-600"
                >
                  <Truck className="mr-2 h-4 w-4" />
                  Mark as Delivered
                </DropdownMenuItem>
              </>
            )}

            {canCancel && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onCancel(order)}
                  className="cursor-pointer text-orange-600"
                >
                  <Ban className="mr-2 h-4 w-4" />
                  Cancel Order
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
