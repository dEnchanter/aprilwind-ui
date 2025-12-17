/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Power, PowerOff, Pencil, Trash2, Tags, CheckCircle, XCircle, Search, Eye, MoreHorizontal } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import CustomDialog from '../dialog/CustomDialog';
import ItemTypeForm from '../forms/ItemTypeForm';
import {
  useItemTypes,
  useActivateItemType,
  useDeactivateItemType,
  useDeleteItemType
} from '@/hooks/useItemTypes';
import { DataTableLoader2 } from '../utils/loader';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/utils";

interface ItemTypeTableProps {
  hideAddButton?: boolean;
}

const ItemTypeTable = ({ hideAddButton = false }: ItemTypeTableProps) => {

  const { data: itemTypesResponse, isLoading, isError, refetch } = useItemTypes();
  const allItemTypes = itemTypesResponse?.data || [];
  const activateItemType = useActivateItemType();
  const deactivateItemType = useDeactivateItemType();
  const deleteItemType = useDeleteItemType();

  const [open, setOpen] = useState(false);
  const [editItemType, setEditItemType] = useState<Partial<ItemType> | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItemType, setSelectedItemType] = useState<ItemType | null>(null);
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [viewSidebarOpen, setViewSidebarOpen] = useState(false);
  const [viewItemType, setViewItemType] = useState<ItemType | null>(null);

  const toggleDialog = () => {
    setOpen(!open);
    if (open) {
      setEditItemType(undefined);
    }
  };

  const handleView = (itemType: ItemType) => {
    setViewItemType(itemType);
    setViewSidebarOpen(true);
  };

  const handleEdit = (itemType: ItemType) => {
    setEditItemType(itemType);
    setOpen(true);
  };

  const handleActivate = (itemType: ItemType) => {
    activateItemType.mutate(itemType.id);
  };

  const handleDeactivate = (itemType: ItemType) => {
    deactivateItemType.mutate(itemType.id);
  };

  const handleDeleteClick = (itemType: ItemType) => {
    setSelectedItemType(itemType);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedItemType) {
      deleteItemType.mutate(selectedItemType.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setSelectedItemType(null);
        }
      });
    }
  };

  // Filter by status
  const getFilteredByStatus = () => {
    switch (filterTab) {
      case 'active':
        return allItemTypes.filter((type: ItemType) => type.isActive);
      case 'inactive':
        return allItemTypes.filter((type: ItemType) => !type.isActive);
      default:
        return allItemTypes;
    }
  };

  // Apply search filter
  const filteredByStatus = getFilteredByStatus();
  const itemTypes = searchTerm
    ? filteredByStatus.filter((type: ItemType) =>
        type.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        type.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        type.unit?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : filteredByStatus;

  // Calculate counts
  const activeCount = allItemTypes.filter((type: ItemType) => type.isActive).length;
  const inactiveCount = allItemTypes.filter((type: ItemType) => !type.isActive).length;

  // Client-side pagination
  const totalPages = Math.ceil(itemTypes.length / limit);
  const paginatedItemTypes = itemTypes.slice((page - 1) * limit, page * limit);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Filters Card Skeleton */}
        <Card className="border-0 shadow-md bg-gradient-to-br from-white to-gray-50">
          <CardContent className="p-6">
            <div className="flex flex-col space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-12 w-full" />
            </div>
          </CardContent>
        </Card>

        {/* Table Skeleton */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="px-6 py-4 font-semibold text-gray-700">Name</TableHead>
                  <TableHead className="px-6 py-4 font-semibold text-gray-700">Code</TableHead>
                  <TableHead className="px-6 py-4 font-semibold text-gray-700">Unit</TableHead>
                  <TableHead className="px-6 py-4 font-semibold text-gray-700">Status</TableHead>
                  <TableHead className="px-6 py-4 font-semibold text-gray-700 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="px-6 py-4"><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell className="px-6 py-4"><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell className="px-6 py-4"><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell className="px-6 py-4"><Skeleton className="h-6 w-24" /></TableCell>
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

  if (isError) {
    return (
      <div className="rounded-xl border-2 border-dashed border-red-300 bg-red-50/50 p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="rounded-full bg-red-100 p-6 mb-4">
            <Tags className="h-12 w-12 text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load item types</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-md">
            There was an error loading the item types. Please try again.
          </p>
          <Button
            onClick={() => refetch()}
            className="bg-gradient-to-r from-brand-600 to-brand-700 text-white hover:from-brand-700 hover:to-brand-800"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!allItemTypes || allItemTypes.length === 0) {
    return (
      <>
        <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="rounded-full bg-gray-100 p-6 mb-4">
              <Tags className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No item types found</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-md">
              Get started by creating your first item type to categorize your materials.
            </p>
            {!hideAddButton && (
              <Button
                onClick={toggleDialog}
                className="bg-gradient-to-r from-brand-600 to-brand-700 text-white hover:from-brand-700 hover:to-brand-800"
              >
                Create Item Type
              </Button>
            )}
          </div>
        </div>

        {/* Dialog for Creating Item Type */}
        {!hideAddButton && (
          <CustomDialog open={open} toggleOpen={toggleDialog} dialogWidth="sm:max-w-[450px]">
            <ItemTypeForm closeDialog={toggleDialog} initialValues={editItemType} />
          </CustomDialog>
        )}
      </>
    );
  }

  return (
    <>
      {/* Filters Card */}
      <Card className="border-0 shadow-md bg-gradient-to-br from-white to-gray-50 mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col space-y-4">
            {/* Filter Label */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Tags className="h-4 w-4 text-brand-600" />
                Filter by Status
              </h3>
              {/* Search */}
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, code, or unit..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white border-gray-200 focus:border-brand-500 focus:ring-brand-500 shadow-sm"
                />
              </div>
            </div>

            {/* Filter Tabs */}
            <Tabs
              value={filterTab}
              onValueChange={(value: any) => setFilterTab(value)}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3 bg-white border border-gray-200 p-1.5 h-auto rounded-lg shadow-sm">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-brand-600 data-[state=active]:to-brand-700 data-[state=active]:text-white data-[state=active]:shadow-md gap-2 py-3 px-4 rounded-md transition-all duration-200"
                >
                  <Tags className="h-4 w-4" />
                  <div className="flex flex-col items-start">
                    <span className="font-medium text-xs sm:text-sm">All Types</span>
                    {!isLoading && allItemTypes.length > 0 && (
                      <span className="text-[10px] sm:text-xs opacity-80">
                        {allItemTypes.length} types
                      </span>
                    )}
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value="active"
                  className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:shadow-md gap-2 py-3 px-4 rounded-md transition-all duration-200"
                >
                  <CheckCircle className="h-4 w-4" />
                  <div className="flex flex-col items-start">
                    <span className="font-medium text-xs sm:text-sm">Active</span>
                    {!isLoading && activeCount > 0 && (
                      <span className="text-[10px] sm:text-xs opacity-80">
                        {activeCount} active
                      </span>
                    )}
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value="inactive"
                  className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-gray-500 data-[state=active]:to-gray-600 data-[state=active]:text-white data-[state=active]:shadow-md gap-2 py-3 px-4 rounded-md transition-all duration-200"
                >
                  <XCircle className="h-4 w-4" />
                  <div className="flex flex-col items-start">
                    <span className="font-medium text-xs sm:text-sm">Inactive</span>
                    {!isLoading && inactiveCount > 0 && (
                      <span className="text-[10px] sm:text-xs opacity-80">
                        {inactiveCount} inactive
                      </span>
                    )}
                  </div>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Active Filter Indicator */}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="h-1.5 w-1.5 rounded-full bg-brand-600"></div>
              <span>
                Showing {itemTypes.length} of {filteredByStatus.length} item types
                {searchTerm && ` matching "${searchTerm}"`}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {itemTypes.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="rounded-full bg-gray-100 p-6 mb-4">
              <Tags className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No matching item types</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-md">
              Try adjusting your filters or search term to find what you're looking for.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50 border-b border-gray-200">
                    <TableHead className="px-6 py-4 font-semibold text-gray-700">Name</TableHead>
                    <TableHead className="px-6 py-4 font-semibold text-gray-700">Code</TableHead>
                    <TableHead className="px-6 py-4 font-semibold text-gray-700">Unit</TableHead>
                    <TableHead className="px-6 py-4 font-semibold text-gray-700">Status</TableHead>
                    <TableHead className="px-6 py-4 font-semibold text-gray-700 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedItemTypes.map((itemType: ItemType) => (
                    <TableRow
                      key={itemType.id}
                      className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                    >
                      <TableCell className="px-6 py-4">
                        <span className="font-medium text-sm text-gray-900">
                          {itemType.name}
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <span className="font-mono font-medium text-brand-700 text-sm">
                          {itemType.code}
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {itemType.unit}
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <Badge
                          className={
                            itemType.isActive
                              ? "bg-green-100 text-green-800 border-green-200 hover:bg-green-100"
                              : "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100"
                          }
                        >
                          {itemType.isActive ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 mr-1" />
                              Inactive
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel className="text-xs font-semibold text-gray-500">
                              Actions
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleView(itemType)}
                              className="cursor-pointer"
                            >
                              <Eye className="mr-2 h-4 w-4 text-gray-500" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEdit(itemType)}
                              className="cursor-pointer"
                            >
                              <Pencil className="mr-2 h-4 w-4 text-gray-500" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {itemType.isActive ? (
                              <DropdownMenuItem
                                onClick={() => handleDeactivate(itemType)}
                                className="cursor-pointer"
                              >
                                <PowerOff className="mr-2 h-4 w-4 text-gray-500" />
                                Deactivate
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => handleActivate(itemType)}
                                className="cursor-pointer"
                              >
                                <Power className="mr-2 h-4 w-4 text-gray-500" />
                                Activate
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(itemType)}
                              className="text-red-600 cursor-pointer focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
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
          {itemTypes.length > 0 && (
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 px-2 mt-4 pt-4 border-t border-gray-200">
              {/* Left side - Items info and limit selector */}
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <p className="text-sm text-gray-600">
                  Showing <span className="font-medium">{paginatedItemTypes.length}</span>
                  {itemTypes.length > paginatedItemTypes.length && (
                    <>
                      {" "}of <span className="font-medium">{itemTypes.length}</span>
                    </>
                  )}{" "}
                  item types
                  {totalPages > 1 && (
                    <>
                      {" "}· Page <span className="font-medium">{page}</span> of{" "}
                      <span className="font-medium">{totalPages}</span>
                    </>
                  )}
                </p>

                {/* Items per page selector */}
                <div className="flex items-center gap-2">
                  <label htmlFor="limit-select-types" className="text-sm text-gray-600 whitespace-nowrap">
                    Items per page:
                  </label>
                  <select
                    id="limit-select-types"
                    value={limit}
                    onChange={(e) => {
                      setLimit(Number(e.target.value));
                      setPage(1);
                    }}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>

              {/* Right side - Navigation buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="hover:bg-gray-50"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="hover:bg-gray-50"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* View Details Sidebar */}
      <Sheet open={viewSidebarOpen} onOpenChange={setViewSidebarOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Item Type Details</SheetTitle>
            <SheetDescription>
              View detailed information about this item type
            </SheetDescription>
          </SheetHeader>

          {viewItemType ? (
            <div className="mt-6 space-y-6">
              {/* Item Type Information */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                  <Tags className="h-4 w-4" />
                  Item Type Information
                </h3>
                <div className="space-y-2 pl-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{viewItemType.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Code:</span>
                    <span className="font-mono font-medium text-brand-700">{viewItemType.code}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Unit:</span>
                    <span className="font-medium">{viewItemType.unit}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <Badge
                      className={
                        viewItemType.isActive
                          ? "bg-green-100 text-green-700 border-green-300"
                          : "bg-gray-100 text-gray-700 border-gray-300"
                      }
                    >
                      {viewItemType.isActive ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3 mr-1" />
                          Inactive
                        </>
                      )}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Timeline Information */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-gray-700">Timeline</h3>
                <div className="space-y-2 pl-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Created:</span>
                    <span className="font-medium">
                      {viewItemType.createdAt ? formatDate(viewItemType.createdAt) : '-'}
                    </span>
                  </div>
                  {viewItemType.updatedAt && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Last Updated:</span>
                      <span className="font-medium">
                        {formatDate(viewItemType.updatedAt)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center min-h-[400px] text-gray-500">
              No item type selected
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Dialog for Creating/Editing Item Type */}
      {!hideAddButton && (
        <CustomDialog open={open} toggleOpen={toggleDialog} dialogWidth="sm:max-w-[450px]">
          <ItemTypeForm closeDialog={toggleDialog} initialValues={editItemType} />
        </CustomDialog>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the item type "{selectedItemType?.name}".
              If this type is being used by any materials, the deletion will fail.
              Consider deactivating instead to preserve data integrity.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteItemType.isPending}
            >
              {deleteItemType.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ItemTypeTable;
