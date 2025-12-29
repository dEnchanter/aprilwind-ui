/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from 'react';
import { useStaff, useActivateStaff, useDeactivateStaff } from '@/hooks/useStaff';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { RegisterLoginDialog } from '../dialog/RegisterLoginDialog';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  MoreHorizontal,
  Eye,
  Edit,
  UserCog,
  MapPin,
  Shield,
  User,
  UserCheck,
  UserX,
  UserPlus,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Separator } from '../ui/separator';
import CustomDialog from '../dialog/CustomDialog';
import StaffForm from '../forms/StaffForm';
import { Badge } from '../ui/badge';

interface StaffTableProps {
  hideAddButton?: boolean;
}

const StaffTable = ({ hideAddButton = false }: StaffTableProps) => {
  const { data: staffResponse, isLoading } = useStaff({ page: 1, limit: 100 });
  const staff = staffResponse?.data || [];
  const activateStaffMutation = useActivateStaff();
  const deactivateStaffMutation = useDeactivateStaff();

  const [open, setOpen] = useState(false);
  const [editStaff, setEditStaff] = useState<Partial<Staff> | undefined>(undefined);
  const [viewSidebarOpen, setViewSidebarOpen] = useState(false);
  const [viewStaff, setViewStaff] = useState<any | null>(null);
  const [actionStaff, setActionStaff] = useState<{ staff: any; action: 'activate' | 'deactivate' } | null>(null);
  const [registerLoginOpen, setRegisterLoginOpen] = useState(false);
  const [registerStaff, setRegisterStaff] = useState<{ id: number; staffName: string } | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const toggleDialog = () => {
    setOpen(!open);
    if (open) {
      setEditStaff(undefined);
    }
  };

  const handleEdit = (staff: Staff) => {
    setEditStaff(staff);
    setOpen(true);
  };

  const handleView = (staff: any) => {
    setViewStaff(staff);
    setViewSidebarOpen(true);
  };

  const handleActivate = (staff: any) => {
    setActionStaff({ staff, action: 'activate' });
  };

  const handleDeactivate = (staff: any) => {
    setActionStaff({ staff, action: 'deactivate' });
  };

  const handleRegisterLogin = (staff: any) => {
    setRegisterStaff({ id: staff.id, staffName: staff.staffName });
    setRegisterLoginOpen(true);
  };

  const confirmAction = () => {
    if (actionStaff?.staff?.id) {
      if (actionStaff.action === 'activate') {
        activateStaffMutation.mutate(actionStaff.staff.id, {
          onSuccess: () => {
            setActionStaff(null);
          },
        });
      } else {
        deactivateStaffMutation.mutate(actionStaff.staff.id, {
          onSuccess: () => {
            setActionStaff(null);
          },
        });
      }
    }
  };

  const totalPages = Math.ceil(staff.length / limit);
  const paginatedData = staff.slice((page - 1) * limit, page * limit);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {!hideAddButton && (
          <div className="flex justify-end">
            <Skeleton className="h-10 w-32" />
          </div>
        )}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="px-6 py-4 font-semibold text-gray-700">Name</TableHead>
                  <TableHead className="px-6 py-4 font-semibold text-gray-700">Email</TableHead>
                  <TableHead className="px-6 py-4 font-semibold text-gray-700">Role</TableHead>
                  <TableHead className="px-6 py-4 font-semibold text-gray-700">Account Status</TableHead>
                  <TableHead className="px-6 py-4 font-semibold text-gray-700">Login Status</TableHead>
                  <TableHead className="px-6 py-4 font-semibold text-gray-700 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="px-6 py-4"><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell className="px-6 py-4"><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell className="px-6 py-4"><Skeleton className="h-6 w-24" /></TableCell>
                    <TableCell className="px-6 py-4"><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell className="px-6 py-4"><Skeleton className="h-5 w-20" /></TableCell>
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

  if (!staff || staff.length === 0) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="rounded-full bg-gray-100 p-6 mb-4">
              <UserCog className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No staff members found</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-md">
              Team work makes the dream work. Get started by adding your first staff member.
            </p>
          </div>
        </div>
        {!hideAddButton && (
          <CustomDialog open={open} toggleOpen={toggleDialog} dialogWidth="sm:max-w-[700px]">
            <StaffForm closeDialog={toggleDialog} initialValues={editStaff} />
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
                  <TableHead className="px-6 py-4 font-semibold text-gray-700">Name</TableHead>
                  <TableHead className="px-6 py-4 font-semibold text-gray-700">Email</TableHead>
                  <TableHead className="px-6 py-4 font-semibold text-gray-700">Role</TableHead>
                  <TableHead className="px-6 py-4 font-semibold text-gray-700">Account Status</TableHead>
                  <TableHead className="px-6 py-4 font-semibold text-gray-700">Login Status</TableHead>
                  <TableHead className="px-6 py-4 font-semibold text-gray-700 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((member: any) => (
                  <TableRow
                    key={member.id}
                    className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                  >
                    <TableCell className="px-6 py-4">
                      <div className="font-medium text-gray-900">{member.staffName}</div>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-gray-600">{member.email || 'N/A'}</TableCell>
                    <TableCell className="px-6 py-4">
                      <Badge variant="outline" className="bg-brand-50 text-brand-700 border-brand-200">
                        {member.role?.name || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      {member.login?.isActive !== false ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">
                          Active
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100">
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      {member.login ? (
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span className="text-xs font-medium text-green-700">Has Login</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <XCircle className="h-4 w-4 text-gray-400" />
                          <span className="text-xs text-gray-500">No Login</span>
                        </div>
                      )}
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
                            onClick={() => handleView(member)}
                            className="cursor-pointer"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEdit(member)}
                            className="cursor-pointer"
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {!member.login && member.role?.isLogin && (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleRegisterLogin(member)}
                                className="cursor-pointer text-blue-600 focus:text-blue-600"
                              >
                                <UserPlus className="mr-2 h-4 w-4" />
                                Register Login
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          {member.login?.isActive !== false ? (
                            <DropdownMenuItem
                              onClick={() => handleDeactivate(member)}
                              className="cursor-pointer text-orange-600 focus:text-orange-600"
                            >
                              <UserX className="mr-2 h-4 w-4" />
                              Deactivate Account
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => handleActivate(member)}
                              className="cursor-pointer text-green-600 focus:text-green-600"
                            >
                              <UserCheck className="mr-2 h-4 w-4" />
                              Activate Account
                            </DropdownMenuItem>
                          )}
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
      <CustomDialog open={open} toggleOpen={toggleDialog} dialogWidth="sm:max-w-[700px]">
        <StaffForm closeDialog={toggleDialog} initialValues={editStaff} />
      </CustomDialog>

      {/* View Details Sidebar */}
      <Sheet open={viewSidebarOpen} onOpenChange={setViewSidebarOpen}>
        <SheetContent className="overflow-y-auto w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Staff Details</SheetTitle>
            <SheetDescription>View complete staff member information</SheetDescription>
          </SheetHeader>
          {viewStaff && (
            <div className="mt-6 space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="h-4 w-4 text-brand-600" />
                  Personal Information
                </h3>
                <div className="space-y-2 text-sm pl-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Full Name:</span>
                    <span className="font-medium">{viewStaff.staffName}</span>
                  </div>
                  {viewStaff.dob && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date of Birth:</span>
                      <span className="font-medium">{formatDate(viewStaff.dob)}</span>
                    </div>
                  )}
                  {viewStaff.email && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium text-xs">{viewStaff.email}</span>
                    </div>
                  )}
                  {viewStaff.phoneNumber && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium">{viewStaff.phoneNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Location Information */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-brand-600" />
                  Location Information
                </h3>
                <div className="space-y-2 text-sm pl-6">
                  {viewStaff.address && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Address:</span>
                      <span className="font-medium text-right max-w-[60%]">{viewStaff.address}</span>
                    </div>
                  )}
                  {viewStaff.lga && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">LGA:</span>
                      <span className="font-medium">{viewStaff.lga}</span>
                    </div>
                  )}
                  {viewStaff.stateOfOrigin && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">State of Origin:</span>
                      <span className="font-medium">{viewStaff.stateOfOrigin}</span>
                    </div>
                  )}
                  {viewStaff.country && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Country:</span>
                      <span className="font-medium">{viewStaff.country}</span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Identity Information */}
              {viewStaff.identity && (
                <>
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Shield className="h-4 w-4 text-brand-600" />
                      Identity Information
                    </h3>
                    <div className="space-y-2 text-sm pl-6">
                      {viewStaff.identity.type && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">ID Type:</span>
                          <span className="font-medium">{viewStaff.identity.type}</span>
                        </div>
                      )}
                      {viewStaff.identity.number && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">ID Number:</span>
                          <span className="font-medium font-mono text-xs">{viewStaff.identity.number}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Role & Employment */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-brand-600" />
                  Role & Employment
                </h3>
                <div className="space-y-2 text-sm pl-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Role:</span>
                    <Badge variant="outline" className="bg-brand-50 text-brand-700 border-brand-200">
                      {viewStaff.role?.name || 'N/A'}
                    </Badge>
                  </div>
                  {viewStaff.role?.description && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Description:</span>
                      <span className="font-medium text-xs text-right max-w-[60%]">{viewStaff.role.description}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    {viewStaff.login?.isActive !== false ? (
                      <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">
                        Active
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100">
                        Inactive
                      </Badge>
                    )}
                  </div>
                  {viewStaff.dateCreated && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date Created:</span>
                      <span className="font-medium">{formatDate(viewStaff.dateCreated)}</span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Next of Kin */}
              {viewStaff.nextofkin && (
                <>
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <User className="h-4 w-4 text-brand-600" />
                      Next of Kin
                    </h3>
                    <div className="space-y-2 text-sm pl-6">
                      {viewStaff.nextofkin.name && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Name:</span>
                          <span className="font-medium">{viewStaff.nextofkin.name}</span>
                        </div>
                      )}
                      {viewStaff.nextofkin.relationship && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Relationship:</span>
                          <span className="font-medium">{viewStaff.nextofkin.relationship}</span>
                        </div>
                      )}
                      {viewStaff.nextofkin.address && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Address:</span>
                          <span className="font-medium text-right max-w-[60%]">{viewStaff.nextofkin.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* References */}
              {viewStaff.references && viewStaff.references.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <User className="h-4 w-4 text-brand-600" />
                    References
                  </h3>
                  <div className="space-y-4">
                    {viewStaff.references.map((ref: any, index: number) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs font-semibold text-gray-700 mb-2">Reference {index + 1}</p>
                        <div className="space-y-1 text-sm">
                          {ref.name && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Name:</span>
                              <span className="font-medium">{ref.name}</span>
                            </div>
                          )}
                          {ref.contact && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Contact:</span>
                              <span className="font-medium">{ref.contact}</span>
                            </div>
                          )}
                          {ref.relation && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Relation:</span>
                              <span className="font-medium">{ref.relation}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Activate/Deactivate Confirmation Dialog */}
      <AlertDialog open={!!actionStaff} onOpenChange={() => setActionStaff(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionStaff?.action === 'activate' ? 'Activate' : 'Deactivate'} Staff Account
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionStaff?.action === 'activate' ? (
                <>
                  Are you sure you want to activate &quot;{actionStaff?.staff?.staffName}&quot;&apos;s account?
                  They will be able to log in again.
                </>
              ) : (
                <>
                  Are you sure you want to deactivate &quot;{actionStaff?.staff?.staffName}&quot;&apos;s account?
                  They will not be able to log in, but their data will be preserved.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              className={
                actionStaff?.action === 'activate'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-orange-600 hover:bg-orange-700'
              }
              disabled={activateStaffMutation.isPending || deactivateStaffMutation.isPending}
            >
              {activateStaffMutation.isPending || deactivateStaffMutation.isPending
                ? `${actionStaff?.action === 'activate' ? 'Activating' : 'Deactivating'}...`
                : actionStaff?.action === 'activate'
                ? 'Activate'
                : 'Deactivate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Register Login Dialog */}
      <RegisterLoginDialog
        open={registerLoginOpen}
        onOpenChange={setRegisterLoginOpen}
        staff={registerStaff}
      />
    </>
  );
};

export default StaffTable;
