/* eslint-disable @typescript-eslint/no-explicit-any */
import { formatDate } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const createMaterialRequestColumns = (
  onView: (request: any) => void,
  onEdit: (request: any) => void,
  onDelete: (request: any) => void
): ColumnDef<MaterialRequest>[] => [
  {
    id: 'requestDate',
    accessorKey: 'requestDate',
    header: 'Request Date',
    cell: ({ getValue }) => formatDate(getValue() as string),
  },
  {
    id: 'requester',
    accessorFn: (row) => row.requester?.staffName || 'N/A',
    header: 'Requester',
    cell: ({ getValue }) => {
      const staffName = getValue() as string;
      return <div className="font-medium text-sm">{staffName}</div>;
    },
  },
  {
    id: 'materials',
    accessorKey: 'materials',
    header: 'Materials',
    cell: ({ getValue }: any) => {
      const materials = getValue();
      if (!materials || !Array.isArray(materials)) {
        return <span className="text-gray-400">No materials</span>;
      }
      return (
        <div className="text-xs">
          <span className="font-medium">{materials.length}</span> material{materials.length !== 1 ? 's' : ''}
        </div>
      );
    },
  },
  {
    id: 'status',
    accessorKey: 'approvalStatus',
    header: 'Status',
    cell: ({ getValue }: any) => {
      const status = getValue() as string;
      const statusConfig: Record<string, { label: string; className: string }> = {
        pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
        approved: { label: 'Approved', className: 'bg-green-100 text-green-700 border-green-300' },
        rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700 border-red-300' },
        cancelled: { label: 'Cancelled', className: 'bg-gray-100 text-gray-700 border-gray-300' },
      };
      const config = statusConfig[status] || statusConfig.pending;
      return (
        <Badge variant="outline" className={config.className}>
          {config.label}
        </Badge>
      );
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const request = row.original;
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
                onView(request);
              }}
              className="cursor-pointer"
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onEdit(request);
              }}
              className="cursor-pointer"
            >
              <Edit2 className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDelete(request);
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
