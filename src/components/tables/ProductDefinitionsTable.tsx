/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { MoreHorizontal, Edit, PackageX, Eye } from "lucide-react";
import { useProductDef } from "@/hooks/useProductDef";
import { PermissionGuard } from "@/components/utils/PermissionGuard";
import { PermissionPresets } from "@/utils/permissions";

interface ProductDefinitionsTableProps {
  searchTerm: string;
  onEdit: (productDef: any) => void;
  onView?: (productDef: any) => void;
}

export function ProductDefinitionsTable({
  searchTerm,
  onEdit,
  onView,
}: ProductDefinitionsTableProps) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const { data: productDefsResponse, isLoading } = useProductDef({ page: 1, limit: 100 });

  const allProductDefs = productDefsResponse || [];

  // Filter by search
  const filteredData = searchTerm
    ? allProductDefs.filter((prod: any) =>
        prod.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prod.code?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : allProductDefs;

  const totalPages = Math.ceil(filteredData.length / limit);
  const paginatedData = filteredData.slice((page - 1) * limit, page * limit);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50 border-b border-gray-200">
                <TableHead className="px-6 py-4 font-semibold text-gray-700 text-left">Code</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-gray-700 text-left">Name</TableHead>
                <TableHead className="py-4 pl-6 pr-8 font-semibold text-gray-700" style={{ textAlign: 'right' }}>Cost</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-gray-700 text-left">Date Created</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-gray-700" style={{ textAlign: 'right' }}>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="px-6 py-4"><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell className="px-6 py-4"><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell className="px-6 py-4 text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                  <TableCell className="px-6 py-4"><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell className="px-6 py-4 text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (!filteredData || filteredData.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="rounded-full bg-gray-100 p-6 mb-4">
            <PackageX className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No product definitions found</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-md">
            {searchTerm ? "No products match your search criteria." : "Get started by creating your first product definition."}
          </p>
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
                <TableHead className="px-6 py-4 font-semibold text-gray-700 text-left">Code</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-gray-700 text-left">Name</TableHead>
                <TableHead className="py-4 pl-6 pr-8 font-semibold text-gray-700" style={{ textAlign: 'right' }}>Cost</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-gray-700 text-left">Date Created</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-gray-700" style={{ textAlign: 'right' }}>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((productDef: any) => (
                <TableRow
                  key={productDef.id}
                  className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                >
                  <TableCell className="px-6 py-4 font-mono text-sm text-brand-700 font-medium">
                    {productDef.code || '-'}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="font-medium text-sm text-gray-900">{productDef.name}</div>
                    {productDef.details && (
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{productDef.details}</p>
                    )}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <span className="font-semibold text-gray-900">
                      ₦{productDef.cost?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <span className="text-sm text-gray-600">
                      {productDef.crtDate ? new Date(productDef.crtDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      }) : '-'}
                    </span>
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
                        {onView && (
                          <DropdownMenuItem
                            onClick={() => onView(productDef)}
                            className="cursor-pointer"
                          >
                            <Eye className="mr-2 h-4 w-4 text-gray-500" />
                            View Details
                          </DropdownMenuItem>
                        )}
                        <PermissionGuard permissions={PermissionPresets.PRODUCT_DEFS_EDIT}>
                          <DropdownMenuItem
                            onClick={() => onEdit(productDef)}
                            className="cursor-pointer"
                          >
                            <Edit className="mr-2 h-4 w-4 text-gray-500" />
                            Edit
                          </DropdownMenuItem>
                        </PermissionGuard>
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
      {filteredData && filteredData.length > 0 && (
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 px-2 mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <p className="text-sm text-gray-600">
              Showing <span className="font-medium">{paginatedData.length}</span>
              {filteredData.length > paginatedData.length && (
                <>
                  {" "}of <span className="font-medium">{filteredData.length}</span>
                </>
              )}{" "}
              product definitions
              {totalPages > 1 && (
                <>
                  {" "}· Page <span className="font-medium">{page}</span> of{" "}
                  <span className="font-medium">{totalPages}</span>
                </>
              )}
            </p>

            <div className="flex items-center gap-2">
              <label htmlFor="limit-select" className="text-sm text-gray-600 whitespace-nowrap">
                Items per page:
              </label>
              <select
                id="limit-select"
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
  );
}
