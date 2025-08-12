"use client"

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  RowSelectionState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  PaginationState,
  Updater
} from "@tanstack/react-table"
import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DataTablePagination } from "./data-table-components/data-table-pagination"
import { DataTableToolbar } from "./data-table-components/data-table-toolbar"
import { Filter } from "@/lib/interfaces"
import I18nComponent from "@/components/ui/i18n-component"


import { useCallback, useEffect, useState, useRef } from "react"

/**
 * Props interface for the CustomDataTable component
 */
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]     // Column definitions
  data: TData[]                           // Table data
  tableLabel: string                      // Label for the table
  filters: Filter[]                       // Array of filter configurations
  createToolbarButtons: (                 // Function to create toolbar buttons
    rowSelection?: RowSelectionState, 
    setRowSelection?: React.Dispatch<React.SetStateAction<RowSelectionState>>, 
    hasSelected?: boolean
  ) => React.JSX.Element
  onRowClick?: (id: string) => void      // Optional row click handler
  identifier?: string                     // Optional identifier field
  initialSorting?: SortingState          // Optional initial sorting state
}

// TODO: standardize table column sizes, right now, they vary depending on it's child size

/**
 * CustomDataTable Component
 * A reusable data table component with sorting, filtering, and pagination capabilities
 */
export function CustomDataTable<TData, TValue>({
  columns,
  data,
  tableLabel,
  filters,
  onRowClick,
  createToolbarButtons,
  identifier = "name",
  initialSorting = []
}: DataTableProps<TData, TValue>) {

  // State management for table features
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>(initialSorting)

  // Pagination state
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  
  // Refs for pagination handling
  const lastValidPageIndexRef = useRef(0)
  const isDataChangingRef = useRef(false)
  const firstTryRef = useRef(true)

  /**
   * Handles pagination state changes
   * Manages edge cases when data changes and pagination needs to be reset
   */
  const handlePaginationChange = useCallback((updater: Updater<PaginationState>) => {
    firstTryRef.current = false

    if (isDataChangingRef.current) {
      isDataChangingRef.current = false
      return
    }

    if (typeof updater === 'function') {
      const newState = updater({ pageIndex, pageSize })
      setPageSize(newState.pageSize)
      setPageIndex(newState.pageIndex)
      lastValidPageIndexRef.current = newState.pageIndex
    } else {
      setPageSize(updater.pageSize)
      setPageIndex(updater.pageIndex)
      lastValidPageIndexRef.current = updater.pageIndex
    }
  }, [pageIndex, pageSize])

  // Initialize table instance with all features
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination: { pageIndex, pageSize },
    },
    onPaginationChange: handlePaginationChange,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    // Feature getters
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  // Reset pagination when data changes
  useEffect(() => {
    if(!firstTryRef.current) {
      isDataChangingRef.current = true
    }
    setPageIndex(lastValidPageIndexRef.current)
  }, [data])

  // Memoized toolbar buttons creation
  const toolBarButtonsProcessed = useCallback(() => {
    return createToolbarButtons(
      rowSelection, 
      setRowSelection, 
      table.getIsSomeRowsSelected() || table.getIsAllRowsSelected()
    )
  }, [createToolbarButtons, setRowSelection, rowSelection, table])

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Toolbar with filters and custom buttons */}
      <DataTableToolbar 
        identifier={identifier} 
        table={table} 
        tableLabel={tableLabel} 
        filters={filters} 
        toolBarButtonsProcessed={toolBarButtonsProcessed}
      />
      {/* Main table container */}
      <div className="relative flex-grow overflow-auto border rounded-md">
        <UITable>
          {/* Table header */}
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
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
          {/* Table body */}
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => onRowClick?.(row.getValue("id"))}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              // No results message
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <I18nComponent i18nKey="ui:noResults" />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </UITable>
      </div>
      {/* Pagination controls */}
      <DataTablePagination table={table} />
    </div>
  )
}
