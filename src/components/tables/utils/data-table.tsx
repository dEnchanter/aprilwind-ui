/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { JSX, useState, useEffect } from "react"
import { Input } from "../../ui/input"
import { FiSearch } from "react-icons/fi";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "../../ui/dropdown-menu"
import { Button } from "../../ui/button"
import { DataTablePagination2 } from "./data-table-pagination2"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[],
  onRowClick?: (item: TData) => void;
  emptyMessage?: JSX.Element;
  serverSidePagination?: boolean;
  onPaginationChange?: (page: number, pageSize: number) => void;
  pagination?: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
  };
  onDateRangeChange?: (startDate: string, endDate: string) => void;
  hideTableControls?: boolean; // New prop to hide filter and column controls
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onRowClick,
  emptyMessage,
  serverSidePagination = false,
  onPaginationChange,
  pagination,
  hideTableControls = false,
}: DataTableProps<TData, TValue>) {

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [selectedColumn, setSelectedColumn] = useState<string>("")
  const [filterValue, setFilterValue] = useState<string>("")

  // Set default selected column after mount to avoid hydration mismatch
  useEffect(() => {
    if (selectedColumn === "" && columns.length > 0) {
      // Skip 'select' column and use the first actual data column
      const firstDataColumn = columns.find(col => col.id !== 'select' && col.id !== 'actions');
      if (firstDataColumn?.id) {
        setSelectedColumn(firstDataColumn.id as string);
      }
    }
  }, [columns, selectedColumn])

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    pageCount: pagination?.totalPages || 1,
    manualPagination: true, 
  })

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterValue(e.target.value);
    table.getColumn(selectedColumn)?.setFilterValue(e.target.value);
  };

  if (data.length === 0) {
    return emptyMessage || <div>No results.</div>;
  }

  return (
    <>
      {/* TABLE EXTRAS */}
      {!hideTableControls && (
        <div className="flex items-center justify-between">

          <div className="flex items-center py-4 space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="mr-2">
                  {selectedColumn || "Select Column"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanFilter())
                  .map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.id === selectedColumn}
                      onCheckedChange={() => setSelectedColumn(column.id)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Search Input with Icon */}
            <div className="relative max-w-sm">
              <Input
                placeholder={`Filter by ${selectedColumn}...`}
                value={filterValue}
                onChange={handleFilterChange}
                className="border-none shadow-sm pl-10" // Add padding-left to make space for the icon
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div className="">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter(
                    (column) => column.getCanHide()
                  )
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value: any) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="rounded-md overflow-x-auto">
        <Table className="table table-xs">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="bg-[#EFF0F1] text-[#1E2022] px-2.5 py-2">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className={row.index % 2 ? "bg-[#F3F5F6] hover:bg-[#FCFCFD] cursor-pointer" : "bg-[#FFF] hover:bg-[#FCFCFD] cursor-pointer"}
                onClick={() => onRowClick && onRowClick(row.original)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
              )
            )}
          </TableBody>
        </Table>
      </div>

      {/* PAGINATION */}
      {!hideTableControls && (
        <>
          {serverSidePagination ? (
            <DataTablePagination2
              table={table}
              currentPage={pagination?.currentPage}
              totalPages={pagination?.totalPages}
              onPageChange={(page) => onPaginationChange && onPaginationChange(page, pagination?.pageSize || 10)}
              onPageSizeChange={(size) => onPaginationChange && onPaginationChange(pagination?.currentPage || 1, size)}
            />
          ) : (
            <DataTablePagination2 table={table} />
          )}
        </>
      )}
    </>
  )
}