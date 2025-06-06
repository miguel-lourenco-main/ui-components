import { ComponentExample } from '@/types';
import { Button } from '@/components/ui/button';

// Sample data for examples
const sampleData = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'User', status: 'Inactive' },
  { id: '4', name: 'Alice Brown', email: 'alice@example.com', role: 'Manager', status: 'Active' },
  { id: '5', name: 'Charlie Wilson', email: 'charlie@example.com', role: 'User', status: 'Pending' }
];

// Sample columns configuration - using react-table compatible format
const sampleColumns = [
  {
    accessorKey: 'name',
    header: 'Name',
    id: 'name'
  },
  {
    accessorKey: 'email', 
    header: 'Email',
    id: 'email'
  },
  {
    accessorKey: 'role',
    header: 'Role',
    id: 'role'
  },
  {
    accessorKey: 'status',
    header: 'Status',
    id: 'status'
  }
];

// Sample filters configuration - now working with real imports!
const sampleFilters = [
  {
    id: 'role',
    options: [
      { label: 'Admin', value: 'Admin' },
      { label: 'Manager', value: 'Manager' },
      { label: 'User', value: 'User' }
    ]
  },
  {
    id: 'status',
    options: [
      { label: 'Active', value: 'Active' },
      { label: 'Inactive', value: 'Inactive' },
      { label: 'Pending', value: 'Pending' }
    ]
  }
];

// Sample toolbar buttons function - now works with real functions!
const createToolbarButtons = (rowSelection: any, setRowSelection: any, hasSelected: boolean) => (
  <div className="flex gap-2">
    <Button variant="outline" size="sm">Add User</Button>
    {hasSelected && (
      <Button variant="destructive" size="sm">Delete Selected</Button>
    )}
  </div>
);

export const dataTableExamples: ComponentExample[] = [
  {
    name: "Full Data Table",
    description: "Complete data table with filters and toolbar buttons",
    props: {
      columns: sampleColumns,
      data: sampleData,
      tableLabel: "Users",
      filters: sampleFilters,
      createToolbarButtons: createToolbarButtons
    }
  },
  {
    name: "Data Table with Initial Sorting",
    description: "Data table sorted by name initially",
    props: {
      columns: sampleColumns,
      data: sampleData,
      tableLabel: "Users",
      filters: sampleFilters,
      createToolbarButtons: createToolbarButtons,
      initialSorting: [{ id: 'name', desc: false }]
    }
  },
  {
    name: "Data Table with Row Click",
    description: "Data table with row click handler",
    props: {
      columns: sampleColumns,
      data: sampleData,
      tableLabel: "Users",
      filters: sampleFilters,
      createToolbarButtons: createToolbarButtons,
      onRowClick: (id: string) => alert(`Clicked row with ID: ${id}`)
    }
  },
  {
    name: "Basic Data Table",
    description: "Simple data table without filters",
    props: {
      columns: sampleColumns,
      data: sampleData,
      tableLabel: "Users"
    }
  }
]; 