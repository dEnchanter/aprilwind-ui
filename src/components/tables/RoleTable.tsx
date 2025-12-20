/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from 'react';
import { useRoles } from '@/hooks/useRole';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Edit,
  Shield,
  ShieldCheck,
} from "lucide-react";
import CustomDialog from '../dialog/CustomDialog';
import RoleForm from '../forms/RoleForm';
import { Badge } from '../ui/badge';
import { RolePermissionsDialog } from '../dialogs/RolePermissionsDialog';

interface RoleTableProps {
  hideAddButton?: boolean;
}

const RoleTable = ({ hideAddButton = false }: RoleTableProps) => {
  const { data: rolesResponse, isLoading } = useRoles();
  const roles = rolesResponse?.data || [];

  const [open, setOpen] = useState(false);
  const [editRole, setEditRole] = useState<Partial<Role> | undefined>(undefined);
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const toggleDialog = () => {
    setOpen(!open);
    if (open) {
      setEditRole(undefined);
    }
  };

  const handleEdit = (role: Role) => {
    setEditRole(role);
    setOpen(true);
  };

  const handleViewPermissions = (role: Role) => {
    setSelectedRole(role);
    setPermissionsDialogOpen(true);
  };

  const totalPages = Math.ceil(roles.length / limit);
  const paginatedData = roles.slice((page - 1) * limit, page * limit);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="px-6 py-4 font-semibold text-gray-700">Role Name</TableHead>
                  <TableHead className="px-6 py-4 font-semibold text-gray-700">Description</TableHead>
                  <TableHead className="px-6 py-4 font-semibold text-gray-700">Permissions</TableHead>
                  <TableHead className="px-6 py-4 font-semibold text-gray-700 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="px-6 py-4"><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell className="px-6 py-4"><Skeleton className="h-5 w-48" /></TableCell>
                    <TableCell className="px-6 py-4"><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell className="px-6 py-4"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    );
  }

  if (!roles || roles.length === 0) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="rounded-full bg-gray-100 p-6 mb-4">
              <Shield className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No roles found</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-md">
              Get started by creating your first role to manage user permissions.
            </p>
          </div>
        </div>
        {!hideAddButton && (
          <CustomDialog open={open} toggleOpen={toggleDialog} dialogWidth="sm:max-w-[450px]">
            <RoleForm closeDialog={toggleDialog} initialValues={editRole} />
          </CustomDialog>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Table */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50 border-b border-gray-200">
                  <TableHead className="px-6 py-4 font-semibold text-gray-700">Role Name</TableHead>
                  <TableHead className="px-6 py-4 font-semibold text-gray-700">Description</TableHead>
                  <TableHead className="px-6 py-4 font-semibold text-gray-700">Permissions</TableHead>
                  <TableHead className="px-6 py-4 font-semibold text-gray-700 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((role: any) => (
                  <TableRow
                    key={role.id}
                    className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                  >
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          <Shield className="h-3 w-3 mr-1" />
                          {role.name}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-gray-600">
                      {role.description || 'No description'}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Badge
                        variant={role.permissions && role.permissions.length > 0 ? "default" : "secondary"}
                        className="flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity w-fit"
                        onClick={() => handleViewPermissions(role)}
                      >
                        <ShieldCheck className="h-3 w-3" />
                        <span>
                          {role.permissions?.length || 0}{' '}
                          {role.permissions?.length === 1 ? 'permission' : 'permissions'}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
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
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleEdit(role)}
                            className="cursor-pointer"
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Role
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleViewPermissions(role)}
                            className="cursor-pointer"
                          >
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            Manage Permissions
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span className="text-sm text-gray-600">entries</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      {!hideAddButton && (
        <CustomDialog open={open} toggleOpen={toggleDialog} dialogWidth="sm:max-w-[450px]">
          <RoleForm closeDialog={toggleDialog} initialValues={editRole} />
        </CustomDialog>
      )}

      {/* Permissions Dialog */}
      <RolePermissionsDialog
        role={selectedRole}
        open={permissionsDialogOpen}
        onClose={() => {
          setPermissionsDialogOpen(false);
          setSelectedRole(null);
        }}
      />
    </>
  );
};

export default RoleTable;
