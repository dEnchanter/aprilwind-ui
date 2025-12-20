/* eslint-disable @typescript-eslint/no-explicit-any */
// src/config/rolesColumns.ts
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck } from 'lucide-react';

export const rolesColumns: ColumnDef<Role>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <input
        type="checkbox"
        checked={table.getIsAllPageRowsSelected()}
        onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
        className="w-4 h-4 rounded border-gray-200 text-brand-400 focus:ring-brand-300 focus:border-brand-300"
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        checked={row.getIsSelected()}
        onChange={(e) => row.toggleSelected(e.target.checked)}
        className="w-4 h-4 rounded border-gray-200 text-brand-400 focus:ring-brand-300 focus:border-brand-300"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: 'sn',
    header: 'S/N',
    cell: ({ row }: { row: { index: number } }) => row.index + 1,
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: 'Role Name',
    cell: (info: { getValue: () => any }) => (
      <div className="font-medium">{info.getValue()}</div>
    ),
  },
  {
    id: 'description',
    accessorKey: 'description',
    header: 'Description',
    cell: (info: { getValue: () => any }) => (
      <div className="text-sm text-gray-600">{info.getValue()}</div>
    ),
  },
  {
    id: 'permissions',
    accessorKey: 'permissions',
    header: 'Permissions',
    cell: (info: { row: { original: Role }, table: { options: { meta?: { onViewPermissions?: (role: Role) => void } } } }) => {
      const role = info.row.original;
      const permissionCount = role.permissions?.length || 0;
      const onViewPermissions = info.table.options.meta?.onViewPermissions;

      return (
        <div className="flex items-center gap-2">
          <Badge
            variant={permissionCount > 0 ? "default" : "secondary"}
            className="flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onViewPermissions?.(role)}
          >
            <ShieldCheck className="h-3 w-3" />
            <span>{permissionCount} {permissionCount === 1 ? 'permission' : 'permissions'}</span>
          </Badge>
        </div>
      );
    },
  },
];
