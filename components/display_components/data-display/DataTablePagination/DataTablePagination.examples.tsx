import { ComponentExample } from '@/types';
import { useReactTable, getCoreRowModel, getPaginationRowModel } from '@tanstack/react-table';

// Sample data for pagination examples
const largeSampleData = Array.from({ length: 100 }, (_, i) => ({
  id: (i + 1).toString(),
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  role: ['Admin', 'User', 'Manager'][i % 3],
  status: ['Active', 'Inactive', 'Pending'][i % 3]
}));

// Sample columns
const paginationColumns = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'role', 
    header: 'Role',
  },
  {
    accessorKey: 'status',
    header: 'Status',
  }
];

// Create a table instance for the pagination component
const createSampleTable = (data: any[], pageSize = 10) => {
  return useReactTable({
    data,
    columns: paginationColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize,
        pageIndex: 0,
      },
    },
  });
};

export const dataTablePaginationExamples: ComponentExample[] = [
  {
    name: "Basic Pagination",
    description: "Standard pagination with 10 rows per page",
    props: {
      table: createSampleTable(largeSampleData, 10)
    }
  },
  {
    name: "Small Page Size",
    description: "Pagination with 5 rows per page",
    props: {
      table: createSampleTable(largeSampleData, 5)
    }
  },
  {
    name: "Large Page Size", 
    description: "Pagination with 25 rows per page",
    props: {
      table: createSampleTable(largeSampleData, 25)
    }
  },
  {
    name: "Minimal Data",
    description: "Pagination with small dataset (15 items)",
    props: {
      table: createSampleTable(largeSampleData.slice(0, 15), 10)
    }
  }
]; 