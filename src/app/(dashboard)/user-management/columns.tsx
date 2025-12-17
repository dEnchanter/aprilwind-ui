/* eslint-disable @typescript-eslint/no-explicit-any */
import { capitalize, formatDate } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';

export const staffColumns: ColumnDef<Staff>[] = [
  {
    id: 'sn',
    header: 'S/N', // Header for the counter column
    cell: ({ row }: { row: { index: number } }) => row.index + 1, // Indexing starts from 0, so add 1 for S/N
  },
  {
    id: 'Name',
    accessorKey: 'staffName',
    header: 'Name',
    cell: (info: { getValue: () => any; }) => info.getValue(),
  },
  {
    id: 'email',
    accessorKey: 'email',
    header: 'Email',
    cell: (info: { getValue: () => any; }) => info.getValue(),
  },
  {
    id: 'phoneNo',
    accessorKey: 'phoneNumber',
    header: 'Phone Number',
    cell: (info: { getValue: () => any; }) => info.getValue(),
  },
  {
    id: 'role',
    accessorKey: 'role.name',
    header: 'Role',
    cell: (info: { getValue: () => any; }) => capitalize(info.getValue()),
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: 'Date Created',
    cell: ({ row, getValue }) => {
      const value = getValue() as string;
      // Fallback to dateCreated if createdAt is not available
      const dateValue = value || (row.original as any).dateCreated;
      return dateValue ? formatDate(dateValue) : '-';
    },
  },
];
