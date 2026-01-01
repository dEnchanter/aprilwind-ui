/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Eye, Edit, Trash2, CheckCircle2, UserPlus, FileCheck, Box, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate, cn } from "@/lib/utils";
import { PermissionGuard } from "@/components/utils/PermissionGuard";
import { PermissionPresets } from "@/utils/permissions";

// Helper function to get stage badge styling
const getStageBadge = (stage: string, movedToStock?: boolean) => {
  // If moved to stock, show special badge
  if (movedToStock && stage?.toLowerCase() === 'completed') {
    return (
      <span className={cn(
        "px-2 py-1 rounded text-xs font-medium",
        "bg-teal-100 text-teal-700"
      )}>
        In Stock
      </span>
    );
  }

  const stages: Record<string, { label: string; className: string }> = {
    bidding: { label: 'Bidding', className: 'bg-purple-100 text-purple-700' },
    'in production': { label: 'In Production', className: 'bg-blue-100 text-blue-700' },
    'await qa': { label: 'Await QA', className: 'bg-amber-100 text-amber-700' },
    rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700' },
    completed: { label: 'Completed', className: 'bg-green-100 text-green-700' },
  };

  // Normalize the stage string to lowercase for lookup
  const normalizedStage = stage?.toLowerCase() || '';
  const stageInfo = stages[normalizedStage] || { label: stage, className: 'bg-gray-100 text-gray-700' };

  return (
    <span className={cn(
      "px-2 py-1 rounded text-xs font-medium",
      stageInfo.className
    )}>
      {stageInfo.label}
    </span>
  );
};

export const createProductionTrackingColumns = (
  onView: (production: any) => void,
  onEdit: (production: any) => void,
  onDelete: (production: any) => void,
  onAssignTailor: (production: any) => void,
  onQAReview: (production: any) => void,
  onMoveToStock: (production: any) => void,
  onRework: (production: any) => void,
  onSubmitForQA: (production: any) => void
): ColumnDef<any>[] => [
  {
    accessorKey: "code",
    header: "Production Code",
    cell: ({ row }) => (
      <span className="font-mono font-medium text-brand-700">
        {row.original.code || '-'}
      </span>
    ),
  },
  {
    id: "product",
    header: "Product",
    cell: ({ row }) => {
      const productInfo = row.original.productInfo;
      return (
        <div className="flex flex-col">
          <span className="font-medium text-sm">
            {productInfo?.name || '-'}
          </span>
          <span className="text-xs text-gray-500">
            Size {productInfo?.size || '-'}
          </span>
        </div>
      );
    },
  },
  {
    id: "tailor",
    header: "Tailor",
    cell: ({ row }) => {
      const tailor = row.original.tailor;
      return tailor ? (
        <span className="text-sm">{tailor.staffName}</span>
      ) : (
        <span className="text-xs text-gray-400 italic">Unassigned</span>
      );
    },
  },
  {
    id: "materialRequest",
    header: "Materials",
    cell: ({ row }) => {
      const materialRequest = row.original.materialRequest;
      if (!materialRequest) return <span className="text-xs text-gray-400">-</span>;

      const materialCount = materialRequest.materials?.length || 0;
      const isApproved = materialRequest.approvalStatus === 'approved';

      return (
        <div className="flex items-center gap-2">
          <span className="text-sm">{materialCount} item{materialCount !== 1 ? 's' : ''}</span>
          {isApproved && (
            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "stage",
    header: "Stage",
    cell: ({ row }) => getStageBadge(row.original.stage, row.original.movedToStock),
  },
  {
    accessorKey: "assignDate",
    header: "Assigned Date",
    cell: ({ row }) => (
      <span className="text-sm text-gray-600">
        {row.original.assignDate ? formatDate(row.original.assignDate) : '-'}
      </span>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const production = row.original;
      const isCompleted = production.dateCompleted != null; // Use != to check for both null and undefined
      const movedToStock = production.movedToStock === true;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />

            {/* View Details */}
            <DropdownMenuItem onClick={() => onView(production)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>

            {!movedToStock && (
              <>
                {/* Show Move to Stock option if stage is completed and not already moved */}
                {production.stage?.toLowerCase() === 'completed' && (
                  <PermissionGuard permissions={PermissionPresets.PRODUCTION_MOVE_TO_STOCK}>
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onMoveToStock(production)}
                        className="text-green-700"
                      >
                        <Box className="mr-2 h-4 w-4" />
                        Move to Stock
                      </DropdownMenuItem>
                    </>
                  </PermissionGuard>
                )}

                {!isCompleted && (
                  <>
                    {/* Show Assign Tailor option if no tailor assigned and stage is bidding */}
                    {!production.tailor && production.stage?.toLowerCase() === 'bidding' && (
                      <PermissionGuard permissions={PermissionPresets.PRODUCTION_ASSIGN_TAILOR}>
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onAssignTailor(production)}>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Assign Tailor
                          </DropdownMenuItem>
                        </>
                      </PermissionGuard>
                    )}
                    {/* Show Submit for QA option if stage is in production */}
                    {production.stage?.toLowerCase() === 'in production' && (
                      <PermissionGuard permissions={PermissionPresets.PRODUCTION_SUBMIT_QA}>
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onSubmitForQA(production)}
                            className="text-blue-700"
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Submit for QA
                          </DropdownMenuItem>
                        </>
                      </PermissionGuard>
                    )}
                    {/* Show QA Review option if stage is await qa */}
                    {production.stage?.toLowerCase() === 'await qa' && (
                      <PermissionGuard permissions={PermissionPresets.PRODUCTION_QA_REVIEW}>
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onQAReview(production)}>
                            <FileCheck className="mr-2 h-4 w-4" />
                            QA Review
                          </DropdownMenuItem>
                        </>
                      </PermissionGuard>
                    )}
                    {/* Show Rework option if stage is rejected and has tailor */}
                    {production.stage?.toLowerCase() === 'rejected' && production.tailor && (
                      <PermissionGuard permissions={PermissionPresets.PRODUCTION_REWORK}>
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onRework(production)}
                            className="text-amber-700"
                          >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Send for Rework
                          </DropdownMenuItem>
                        </>
                      </PermissionGuard>
                    )}
                    <PermissionGuard permissions={PermissionPresets.PRODUCTION_EDIT}>
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onEdit(production)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                      </>
                    </PermissionGuard>
                  </>
                )}
              </>
            )}

            <PermissionGuard permissions={PermissionPresets.PRODUCTION_DELETE}>
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(production)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </>
            </PermissionGuard>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
