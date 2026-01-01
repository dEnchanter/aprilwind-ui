/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MoreHorizontal,
  Eye,
  Edit,
  Plus,
  TrendingUp,
  Package,
  PackageX,
  AlertTriangle,
} from "lucide-react";
import { AddStockDialog } from "./add-stock-dialog";
import { AdjustStockDialog } from "./adjust-stock-dialog";
import { EditMaterialDialog } from "./edit-material-dialog";
import { PermissionGuard } from "@/components/utils/PermissionGuard";
import { PermissionPresets } from "@/utils/permissions";

interface MaterialsTableProps {
  data: any[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  totalItems?: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export function MaterialsTable({
  data,
  isLoading,
  page,
  totalPages,
  totalItems,
  limit,
  onPageChange,
  onLimitChange,
}: MaterialsTableProps) {
  const router = useRouter();
  const [addStockMaterial, setAddStockMaterial] = useState<any>(null);
  const [adjustStockMaterial, setAdjustStockMaterial] = useState<any>(null);
  const [editMaterial, setEditMaterial] = useState<any>(null);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="px-6 py-4 font-semibold text-gray-700">Item Code</TableHead>
                  <TableHead className="px-6 py-4 font-semibold text-gray-700">Material Name</TableHead>
                  <TableHead className="px-6 py-4 font-semibold text-gray-700">Type</TableHead>
                  <TableHead className="px-6 py-4 font-semibold text-gray-700 text-right">Quantity</TableHead>
                  <TableHead className="px-6 py-4 font-semibold text-gray-700">Status</TableHead>
                  <TableHead className="px-6 py-4 font-semibold text-gray-700 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="px-6 py-4"><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell className="px-6 py-4"><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell className="px-6 py-4"><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell className="px-6 py-4"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
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

  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="rounded-full bg-gray-100 p-6 mb-4">
            <PackageX className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No materials found</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-md">
            Get started by adding your first raw material to the inventory system.
          </p>
          <Button
            onClick={() => {
              // This would trigger the add material dialog from parent
              const event = new CustomEvent('openAddMaterial');
              window.dispatchEvent(event);
            }}
            className="bg-brand-700 hover:bg-brand-800"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Material
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50 border-b border-gray-200">
                <TableHead className="px-6 py-4 font-semibold text-gray-700">Item Code</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-gray-700">Material Name</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-gray-700">Type</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-gray-700 text-right">Quantity</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-gray-700">Status</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-gray-700 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((material) => {
                const isLowStock = material.quantity <= (material.minStockLevel || 50);
                const isOutOfStock = material.quantity === 0;

                return (
                  <TableRow
                    key={material.id}
                    className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                  >
                    <TableCell className="px-6 py-4 font-mono text-sm text-gray-600">
                      {material.code || `RM-${material.id.toString().padStart(4, '0')}`}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <button
                        onClick={() => router.push(`/items-management/${material.id}`)}
                        className="text-brand-700 hover:text-brand-900 hover:underline font-medium text-left transition-colors"
                      >
                        {material.name}
                      </button>
                      {material.description && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                          {material.description}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      {material.type?.name ? (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {material.type.name}
                        </Badge>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className={`font-semibold ${
                          isOutOfStock ? 'text-red-600' :
                          isLowStock ? 'text-orange-600' :
                          'text-gray-900'
                        }`}>
                          {material.quantity || 0}
                        </span>
                        <span className="text-xs text-gray-500 font-normal">
                          {material.type?.unit || "units"}
                        </span>
                      </div>
                      {/* <div className="text-xs text-gray-400 mt-0.5">
                        Min: {material.minStockLevel || 50} {material.type?.unit || "units"}
                      </div> */}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      {isOutOfStock ? (
                        <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-100">
                          <PackageX className="h-3 w-3 mr-1" />
                          Out of Stock
                        </Badge>
                      ) : isLowStock ? (
                        <Badge className="bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Low Stock
                        </Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">
                          <Package className="h-3 w-3 mr-1" />
                          In Stock
                        </Badge>
                      )}
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
                            onClick={() => router.push(`/items-management/${material.id}`)}
                            className="cursor-pointer"
                          >
                            <Eye className="mr-2 h-4 w-4 text-gray-500" />
                            View Details
                          </DropdownMenuItem>
                          <PermissionGuard permissions={PermissionPresets.MATERIALS_ADD_STOCK}>
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setAddStockMaterial(material)}
                                className="cursor-pointer"
                              >
                                <Plus className="mr-2 h-4 w-4 text-green-600" />
                                Add Stock
                              </DropdownMenuItem>
                            </>
                          </PermissionGuard>
                          <PermissionGuard permissions={PermissionPresets.MATERIALS_ADJUST_STOCK}>
                            <DropdownMenuItem
                              onClick={() => setAdjustStockMaterial(material)}
                              className="cursor-pointer"
                            >
                              <TrendingUp className="mr-2 h-4 w-4 text-blue-600" />
                              Adjust Stock
                            </DropdownMenuItem>
                          </PermissionGuard>
                          <PermissionGuard permissions={PermissionPresets.MATERIALS_EDIT}>
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setEditMaterial(material)}
                                className="cursor-pointer"
                              >
                                <Edit className="mr-2 h-4 w-4 text-gray-500" />
                                Edit
                              </DropdownMenuItem>
                            </>
                          </PermissionGuard>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination - Always show if there's data */}
      {data && data.length > 0 && (
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 px-2 mt-4 pt-4 border-t border-gray-200">
          {/* Left side - Items info and limit selector */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <p className="text-sm text-gray-600">
              Showing <span className="font-medium">{data.length}</span>
              {totalItems && totalItems > data.length && (
                <>
                  {" "}of <span className="font-medium">{totalItems}</span>
                </>
              )}{" "}
              materials
              {totalPages > 1 && (
                <>
                  {" "}· Page <span className="font-medium">{page}</span> of{" "}
                  <span className="font-medium">{totalPages}</span>
                </>
              )}
            </p>

            {/* Items per page selector */}
            <div className="flex items-center gap-2">
              <label htmlFor="limit-select" className="text-sm text-gray-600 whitespace-nowrap">
                Items per page:
              </label>
              <select
                id="limit-select"
                value={limit}
                onChange={(e) => {
                  onLimitChange(Number(e.target.value));
                  onPageChange(1); // Reset to first page when changing limit
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
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="hover:bg-gray-50"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              className="hover:bg-gray-50"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Dialogs */}
      {addStockMaterial && (
        <AddStockDialog
          material={addStockMaterial}
          open={!!addStockMaterial}
          onClose={() => setAddStockMaterial(null)}
        />
      )}

      {adjustStockMaterial && (
        <AdjustStockDialog
          material={adjustStockMaterial}
          open={!!adjustStockMaterial}
          onClose={() => setAdjustStockMaterial(null)}
        />
      )}

      {editMaterial && (
        <EditMaterialDialog
          material={editMaterial}
          open={!!editMaterial}
          onClose={() => setEditMaterial(null)}
        />
      )}
    </>
  );
}
