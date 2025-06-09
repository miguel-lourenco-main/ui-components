"use client"

import { Cross2Icon } from "@radix-ui/react-icons"
import { Table } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import FacetedFilters from "./faceted-filters-list"
import { Filter } from "@/lib/interfaces"

interface DataTableToolbarProps<TData> {
  identifier: string
  table: Table<TData>
  tableLabel: string
  filters: Filter[]
  toolBarButtonsProcessed?: () => React.ReactNode
}

export function DataTableToolbar<TData>({
  identifier,
  table,
  tableLabel,
  filters,
  toolBarButtonsProcessed
}: DataTableToolbarProps<TData>) {

  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder={`Filter ${tableLabel}...`}
          value={(table.getColumn(identifier)?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn(identifier)?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        <FacetedFilters<TData> table={table} filters={filters}/>
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      {toolBarButtonsProcessed?.()}
    </div>
  )
}
