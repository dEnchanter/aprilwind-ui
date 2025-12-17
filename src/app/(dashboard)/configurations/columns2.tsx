/* eslint-disable @typescript-eslint/no-explicit-any */
// src/config/itemTypeColumns.ts
import { formatDate } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';

export const itemTypeColumns: ColumnDef<ItemType>[] = [
  {
    id: 'sn',
    header: 'S/N', // Header for the counter column
    cell: ({ row }: { row: { index: number } }) => row.index + 1, // Indexing starts from 0, so add 1 for S/N
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: 'Item Type Name',
    cell: (info: { getValue: () => any }) => info.getValue(),
  },
  {
    id: 'code',
    accessorKey: 'code',
    header: 'Code',
    cell: (info: { getValue: () => any }) => info.getValue(),
  },
  {
    id: 'unit',
    accessorKey: 'unit',
    header: 'Unit',
    cell: (info: { getValue: () => any }) => info.getValue(),
  },
  {
    id: 'isActive',
    accessorKey: 'isActive',
    header: 'Status',
    cell: ({ getValue }: { getValue: () => any }) => {
      const isActive = getValue();
      return (
        <Badge
          variant={isActive ? "default" : "secondary"}
          className={isActive ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-gray-100 text-gray-600 hover:bg-gray-100"}
        >
          {isActive ? 'Active' : 'Inactive'}
        </Badge>
      );
    },
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: 'Date Created',
    cell: ({ getValue }) => formatDate(getValue() as string),
  },
];
