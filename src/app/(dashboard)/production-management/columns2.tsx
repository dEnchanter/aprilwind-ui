/* eslint-disable @typescript-eslint/no-explicit-any */
// src/config/productDefColumns.ts
import { formatDate } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';
import { Edit2, Trash2, MoreVertical, Eye } from 'lucide-react';
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

export const createProductDefColumns = (
  onEdit: (productDef: ProductDef) => void,
  onDelete: (productDef: ProductDef) => void,
  onView: (productDef: ProductDef) => void
): ColumnDef<ProductDef>[] => [
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
    id: 'code',
    accessorKey: 'code',
    header: 'Code',
    cell: (info: { getValue: () => any }) => info.getValue(),
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: 'Name',
    cell: (info: { getValue: () => any }) => info.getValue(),
  },
  {
    id: 'cost',
    accessorKey: 'cost',
    header: 'Cost',
    cell: ({ getValue }) => {
      const cost = getValue() as number;
      if (!cost && cost !== 0) return '-';
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
      }).format(cost);
    },
  },
  {
    id: 'crtDate',
    accessorKey: 'crtDate',
    header: 'Date Created',
    cell: ({ getValue, row }) => {
      const value = getValue() as string;
      // Fallback to check both crtDate and createdAt
      const dateValue = value || (row.original as any).createdAt;
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
      const productDef = row.original;
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
                onView(productDef);
              }}
              className="cursor-pointer"
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onEdit(productDef);
              }}
              className="cursor-pointer"
            >
              <Edit2 className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDelete(productDef);
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
