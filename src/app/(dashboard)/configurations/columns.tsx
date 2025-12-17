/* eslint-disable @typescript-eslint/no-explicit-any */
// src/config/rolesColumns.ts
import { ColumnDef } from '@tanstack/react-table';

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
];
