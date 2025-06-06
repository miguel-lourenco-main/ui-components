import { Table } from "@tanstack/react-table"

import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { Filter } from "@/lib/interfaces";

export default function FacetedFilters<TData>({
    table,
    filters
}:{
    table: Table<TData>
    filters: Filter[]
}){
    return(
        <>
            {filters.map((filter) => {
                if(table.getColumn(filter.id)){
                    return(
                        <DataTableFacetedFilter
                            key={filter.id}
                            column={table.getColumn(filter.id)}
                            title={filter.id}
                            options={filter.options}
                        />
                )}
            })}
        </>
    )
} 