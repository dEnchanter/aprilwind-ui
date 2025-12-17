/* eslint-disable @typescript-eslint/no-explicit-any */
// src/config/productForProductionColumns.ts
import { formatDate } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';
import { Edit2, Trash2, MoreVertical, Eye, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const createProductForProductionColumns = (
  onEdit: (production: any) => void,
  onDelete: (production: any) => void,
  onView: (production: any) => void,
  materialRequestsMap?: Map<number, any> // Map of productionId -> material request summary
): ColumnDef<any>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        onClick={(e) => e.stopPropagation()}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: 'productName',
    accessorFn: (row) => row.product?.name || '-',
    header: 'Product',
    cell: (info: { getValue: () => any }) => info.getValue(),
  },
  {
    id: 'requestedBy',
    accessorFn: (row) => row.requester?.staffName || `Staff #${row.requestedBy}`,
    header: 'Requested By',
    cell: (info: { getValue: () => any }) => info.getValue(),
  },
  {
    id: 'isActive',
    accessorKey: 'isActive',
    header: 'Status',
    cell: ({ getValue }) => {
      const isActive = getValue() as boolean;
      return (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {isActive ? 'Active' : 'Inactive'}
        </span>
      );
    },
  },
  {
    id: 'materialStatus',
    header: 'Material Status',
    cell: ({ row }) => {
      const production = row.original;
      const materialData = materialRequestsMap?.get(production.id);

      if (!materialData || materialData.summary?.total === 0) {
        return (
          <div className="flex items-center gap-1.5">
            <XCircle className="h-3.5 w-3.5 text-red-500" />
            <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
              No Request
            </span>
          </div>
        );
      }

      if (materialData.summary?.approved > 0) {
        return (
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
            <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
              Approved
            </span>
          </div>
        );
      }

      if (materialData.summary?.pending > 0) {
        return (
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-amber-500" />
            <span className="px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-800">
              Pending
            </span>
          </div>
        );
      }

      return (
        <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
          Unknown
        </span>
      );
    },
  },
  {
    id: 'dateRequested',
    accessorKey: 'dateRequested',
    header: 'Date Requested',
    cell: ({ getValue }) => {
      const dateValue = getValue() as string;
      if (!dateValue) return '-';
      try {
        return formatDate(dateValue);
      } catch {
        return '-';
      }
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const production = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
              type="button"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onView(production);
              }}
              className="cursor-pointer"
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onEdit(production);
              }}
              className="cursor-pointer"
            >
              <Edit2 className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDelete(production);
              }}
              className="cursor-pointer text-red-600 focus:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
