"use client"

import * as React from "react"
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
} from "@tanstack/react-table"
import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DataTablePagination } from "../data-table/data-table-components/data-table-pagination"
import { DataTableToolbar } from "../data-table/data-table-components/data-table-toolbar"
import { Filter } from "@/lib/interfaces"
import FilesDragNDrop from "./files-drag-n-drop"
import I18nComponent from "@/components/ui/i18n-component"

import { TrackableFile } from "@/lib/interfaces";

/**
 * Props interface for the DragNDropTable component
 * Extends standard table functionality with file handling capabilities
 */
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]     // Column definitions
  data: TData[]                           // Table data
  tableLabel: string                      // Label for the table
  rowOnClick: (id: string) => void       // Row click handler
  filters: Filter[]                       // Array of filter configurations
  toolBarButtons: (                       // Function to create toolbar buttons
    rowSelection?: RowSelectionState, 
    setRowSelection?: React.Dispatch<React.SetStateAction<RowSelectionState>>, 
    hasSelected?: boolean
  ) => React.JSX.Element
  files?: TrackableFile[]                // Optional array of files
  setFiles?: React.Dispatch<React.SetStateAction<TrackableFile[]>>  // Optional file state setter
  removeFiles?: (files: TrackableFile[]) => void  // Optional file removal handler
  addFiles?: (files: TrackableFile[]) => void     // Optional file addition handler
  identifier?: string                     // Optional identifier field
}

// TODO: standardize table column sizes, right now, they vary depending on it's child size

/**
 * DragNDropTable Component
 * A table component that combines standard table functionality with drag-and-drop file handling
 */
export function DragNDropTable<TData, TValue>({
  columns,
  data,
  tableLabel,
  rowOnClick,
  filters,
  toolBarButtons,
  files,
  setFiles,
  addFiles,
  removeFiles,
  identifier = "name"
}: DataTableProps<TData, TValue>) {

  // State management for table features
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])

  // Initialize table instance with all features
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  // Memoized toolbar buttons creation
  const toolBarButtonsProcessed = React.useCallback(() => {
    return toolBarButtons(
      rowSelection, 
      setRowSelection, 
      table.getIsSomeRowsSelected() || table.getIsAllRowsSelected()
    )
  }, [setRowSelection, rowSelection, table, toolBarButtons])

  /**
   * Handles file addition with fallback to setState if no custom handler provided
   */
  const handleAddFiles = (files: TrackableFile[]) => {
    if(addFiles) {
      addFiles(files)
    }else if(setFiles) {
      setFiles(prevFiles => [...prevFiles, ...files])
    }
  }

  /**
   * Handles file removal with fallback to setState if no custom handler provided
   */
  const handleRemoveFiles = (files: TrackableFile[]) => {
    if(removeFiles) {
      removeFiles(files)
    }else if(setFiles) {
      setFiles(prevFiles => prevFiles.filter(file => !files.includes(file)))
    }
  }

  return (
    <div className="flex flex-col justify-center space-y-4 h-full">
      {/* Show toolbar only when files exist */}
      {files && files.length > 0 && (
        <DataTableToolbar 
          identifier={identifier} 
          table={table} 
          tableLabel={tableLabel} 
          filters={filters} 
          toolBarButtonsProcessed={toolBarButtonsProcessed}
        />
      )}
      {/* Drag and drop zone wrapping the table */}
      <FilesDragNDrop
        files={files ?? []}
        addFiles={handleAddFiles}
        removeFiles={handleRemoveFiles}
      >
        <div className="rounded-md border h-full">
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
                    onClick={() => rowOnClick(row.getValue("id"))}
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
      </FilesDragNDrop>
      {/* Show pagination only when files exist */}
      {files && files.length > 0 && <DataTablePagination table={table} />}
    </div>
  )
}