export interface WorkflowNode {
  id: string;
  label: string;
  type: "source" | "transform" | "aggregate" | "join" | "output" | "filter" | "clean";
  color: string;
  icon: string;
}

export interface WorkflowEdge {
  from: string;
  to: string;
}

export interface WorkflowGraph {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface WorkflowRun {
  id: string;
  workflowName: string;
  user: string;
  status: "success" | "failed" | "running" | "queued";
  duration: string;
  startTime: string;
  toolsUsed: string[];
  recordsProcessed: number;
  environment: string;
  graph: WorkflowGraph;
  steps: {
    id: string;
    name: string;
    tool: string;
    status: "completed" | "failed" | "running" | "pending";
    duration: string;
    recordsIn?: number;
    recordsOut?: number;
    error?: string;
  }[];
}

export const mockStats = {
  totalRuns: 1247,
  successful: 1156,
  failed: 47,
  running: 3,
  successRate: 92.7,
  avgDuration: "2m 34s",
};

export const mockWorkflowRuns: WorkflowRun[] = [
  {
    id: "wf-001",
    workflowName: "Customer Data Cleansing",
    user: "Sarah Chen",
    status: "success",
    duration: "2m 15s",
    startTime: "2025-10-11T10:30:00Z",
    toolsUsed: ["Load Data", "Data Cleaning", "Filter", "Output"],
    recordsProcessed: 45230,
    environment: "Production",
    graph: {
      nodes: [
        { id: "n1", label: "Source", type: "source", color: "#a855f7", icon: "📤" },
        { id: "n2", label: "Clean", type: "clean", color: "#eab308", icon: "🧹" },
        { id: "n3", label: "Filter", type: "filter", color: "#ef4444", icon: "🔽" },
        { id: "n4", label: "Output", type: "output", color: "#6366f1", icon: "💾" },
      ],
      edges: [
        { from: "n1", to: "n2" },
        { from: "n2", to: "n3" },
        { from: "n3", to: "n4" },
      ],
    },
    steps: [
      {
        id: "s1",
        name: "Load Customer Data",
        tool: "Load Data Tool",
        status: "completed",
        duration: "15s",
        recordsIn: 0,
        recordsOut: 45230,
      },
      {
        id: "s2",
        name: "Clean Missing Values",
        tool: "Data Cleaning Tool",
        status: "completed",
        duration: "45s",
        recordsIn: 45230,
        recordsOut: 44890,
      },
      {
        id: "s3",
        name: "Filter Active Customers",
        tool: "Filter Tool",
        status: "completed",
        duration: "30s",
        recordsIn: 44890,
        recordsOut: 38450,
      },
      {
        id: "s4",
        name: "Export Results",
        tool: "Output Tool",
        status: "completed",
        duration: "45s",
        recordsIn: 38450,
        recordsOut: 38450,
      },
    ],
  },
  {
    id: "wf-002",
    workflowName: "Sales Analysis Pipeline",
    user: "Michael Torres",
    status: "failed",
    duration: "1m 42s",
    startTime: "2025-10-11T09:15:00Z",
    toolsUsed: ["Load Data", "Join", "Aggregate", "Sort", "Output"],
    recordsProcessed: 12890,
    environment: "Production",
    graph: {
      nodes: [
        { id: "n1", label: "Source", type: "source", color: "#a855f7", icon: "📤" },
        { id: "n2", label: "Calculate", type: "transform", color: "#06b6d4", icon: "➗" },
        { id: "n3", label: "Sort", type: "transform", color: "#06b6d4", icon: "📊" },
        { id: "n4", label: "Aggregate", type: "aggregate", color: "#ec4899", icon: "➕" },
        { id: "n5", label: "Filter", type: "filter", color: "#ef4444", icon: "🔽" },
        { id: "n6", label: "Clean", type: "clean", color: "#eab308", icon: "🧹" },
        { id: "n7", label: "Join", type: "join", color: "#14b8a6", icon: "🔗" },
      ],
      edges: [
        { from: "n1", to: "n2" },
        { from: "n1", to: "n3" },
        { from: "n2", to: "n4" },
        { from: "n3", to: "n5" },
        { from: "n4", to: "n6" },
        { from: "n5", to: "n6" },
        { from: "n6", to: "n7" },
      ],
    },
    steps: [
      {
        id: "s1",
        name: "Load Sales Data",
        tool: "Load Data Tool",
        status: "completed",
        duration: "12s",
        recordsIn: 0,
        recordsOut: 15670,
      },
      {
        id: "s2",
        name: "Join with Product Info",
        tool: "Join Tool",
        status: "failed",
        duration: "50s",
        recordsIn: 15670,
        recordsOut: 0,
        error: "Key mismatch: 'product_id' not found in right dataset",
      },
      {
        id: "s3",
        name: "Aggregate by Category",
        tool: "Aggregate Tool",
        status: "pending",
        duration: "-",
      },
      {
        id: "s4",
        name: "Sort by Revenue",
        tool: "Sort Tool",
        status: "pending",
        duration: "-",
      },
    ],
  },
  {
    id: "wf-003",
    workflowName: "Inventory Report Generation",
    user: "Emma Wilson",
    status: "running",
    duration: "1m 5s",
    startTime: "2025-10-11T11:45:00Z",
    toolsUsed: ["Load Data", "Formula", "Aggregate", "Output"],
    recordsProcessed: 8920,
    environment: "Production",
    graph: {
      nodes: [
        { id: "n1", label: "Source", type: "source", color: "#a855f7", icon: "📤" },
        { id: "n2", label: "Formula", type: "transform", color: "#06b6d4", icon: "➗" },
        { id: "n3", label: "Aggregate", type: "aggregate", color: "#ec4899", icon: "➕" },
        { id: "n4", label: "Output", type: "output", color: "#6366f1", icon: "💾" },
      ],
      edges: [
        { from: "n1", to: "n2" },
        { from: "n2", to: "n3" },
        { from: "n3", to: "n4" },
      ],
    },
    steps: [
      {
        id: "s1",
        name: "Load Inventory Data",
        tool: "Load Data Tool",
        status: "completed",
        duration: "8s",
        recordsIn: 0,
        recordsOut: 8920,
      },
      {
        id: "s2",
        name: "Calculate Stock Value",
        tool: "Formula Tool",
        status: "completed",
        duration: "25s",
        recordsIn: 8920,
        recordsOut: 8920,
      },
      {
        id: "s3",
        name: "Group by Warehouse",
        tool: "Aggregate Tool",
        status: "running",
        duration: "32s",
        recordsIn: 8920,
      },
      {
        id: "s4",
        name: "Export Report",
        tool: "Output Tool",
        status: "pending",
        duration: "-",
      },
    ],
  },
  {
    id: "wf-004",
    workflowName: "Marketing Data Merge",
    user: "James Rodriguez",
    status: "success",
    duration: "3m 45s",
    startTime: "2025-10-11T08:20:00Z",
    toolsUsed: ["Load Data", "Union", "Data Cleaning", "Impute", "Output"],
    recordsProcessed: 125670,
    environment: "Development",
    graph: {
      nodes: [
        { id: "n1", label: "Source A", type: "source", color: "#a855f7", icon: "📤" },
        { id: "n2", label: "Source B", type: "source", color: "#a855f7", icon: "📤" },
        { id: "n3", label: "Union", type: "join", color: "#14b8a6", icon: "🔗" },
        { id: "n4", label: "Clean", type: "clean", color: "#eab308", icon: "🧹" },
        { id: "n5", label: "Output", type: "output", color: "#6366f1", icon: "💾" },
      ],
      edges: [
        { from: "n1", to: "n3" },
        { from: "n2", to: "n3" },
        { from: "n3", to: "n4" },
        { from: "n4", to: "n5" },
      ],
    },
    steps: [
      {
        id: "s1",
        name: "Load Campaign Data",
        tool: "Load Data Tool",
        status: "completed",
        duration: "30s",
        recordsIn: 0,
        recordsOut: 67450,
      },
      {
        id: "s2",
        name: "Union Multiple Sources",
        tool: "Union Tool",
        status: "completed",
        duration: "45s",
        recordsIn: 125670,
        recordsOut: 125670,
      },
      {
        id: "s3",
        name: "Clean Duplicates",
        tool: "Data Cleaning Tool",
        status: "completed",
        duration: "1m 20s",
        recordsIn: 125670,
        recordsOut: 118900,
      },
      {
        id: "s4",
        name: "Impute Missing CTR",
        tool: "Impute Tool",
        status: "completed",
        duration: "50s",
        recordsIn: 118900,
        recordsOut: 118900,
      },
      {
        id: "s5",
        name: "Save Results",
        tool: "Output Tool",
        status: "completed",
        duration: "20s",
        recordsIn: 118900,
        recordsOut: 118900,
      },
    ],
  },
  {
    id: "wf-005",
    workflowName: "Employee Performance ETL",
    user: "Sarah Chen",
    status: "success",
    duration: "1m 58s",
    startTime: "2025-10-10T16:30:00Z",
    toolsUsed: ["Load Data", "Select", "Filter", "Sort", "Output"],
    recordsProcessed: 3450,
    environment: "Production",
    graph: {
      nodes: [
        { id: "n1", label: "Source", type: "source", color: "#a855f7", icon: "📤" },
        { id: "n2", label: "Filter", type: "filter", color: "#ef4444", icon: "🔽" },
        { id: "n3", label: "Sort", type: "transform", color: "#06b6d4", icon: "📊" },
        { id: "n4", label: "Output", type: "output", color: "#6366f1", icon: "💾" },
      ],
      edges: [
        { from: "n1", to: "n2" },
        { from: "n2", to: "n3" },
        { from: "n3", to: "n4" },
      ],
    },
    steps: [
      {
        id: "s1",
        name: "Load HR Data",
        tool: "Load Data Tool",
        status: "completed",
        duration: "10s",
        recordsIn: 0,
        recordsOut: 3450,
      },
      {
        id: "s2",
        name: "Select Relevant Columns",
        tool: "Select Tool",
        status: "completed",
        duration: "5s",
        recordsIn: 3450,
        recordsOut: 3450,
      },
      {
        id: "s3",
        name: "Filter Active Employees",
        tool: "Filter Tool",
        status: "completed",
        duration: "8s",
        recordsIn: 3450,
        recordsOut: 3120,
      },
      {
        id: "s4",
        name: "Sort by Department",
        tool: "Sort Tool",
        status: "completed",
        duration: "12s",
        recordsIn: 3120,
        recordsOut: 3120,
      },
      {
        id: "s5",
        name: "Export Report",
        tool: "Output Tool",
        status: "completed",
        duration: "23s",
        recordsIn: 3120,
        recordsOut: 3120,
      },
    ],
  },
  {
    id: "wf-006",
    workflowName: "Product Catalog Update",
    user: "Michael Torres",
    status: "success",
    duration: "4m 12s",
    startTime: "2025-10-10T14:15:00Z",
    toolsUsed: ["Load Data", "Join", "Formula", "Data Cleaning", "Output"],
    recordsProcessed: 89450,
    environment: "Production",
    graph: {
      nodes: [
        { id: "n1", label: "Products", type: "source", color: "#a855f7", icon: "📤" },
        { id: "n2", label: "Pricing", type: "source", color: "#a855f7", icon: "📤" },
        { id: "n3", label: "Join", type: "join", color: "#14b8a6", icon: "🔗" },
        { id: "n4", label: "Formula", type: "transform", color: "#06b6d4", icon: "➗" },
        { id: "n5", label: "Clean", type: "clean", color: "#eab308", icon: "🧹" },
        { id: "n6", label: "Output", type: "output", color: "#6366f1", icon: "💾" },
      ],
      edges: [
        { from: "n1", to: "n3" },
        { from: "n2", to: "n3" },
        { from: "n3", to: "n4" },
        { from: "n4", to: "n5" },
        { from: "n5", to: "n6" },
      ],
    },
    steps: [
      {
        id: "s1",
        name: "Load Product Master",
        tool: "Load Data Tool",
        status: "completed",
        duration: "45s",
        recordsIn: 0,
        recordsOut: 89450,
      },
      {
        id: "s2",
        name: "Join Pricing Data",
        tool: "Join Tool",
        status: "completed",
        duration: "1m 30s",
        recordsIn: 89450,
        recordsOut: 89450,
      },
      {
        id: "s3",
        name: "Calculate Margins",
        tool: "Formula Tool",
        status: "completed",
        duration: "1m 5s",
        recordsIn: 89450,
        recordsOut: 89450,
      },
      {
        id: "s4",
        name: "Clean Product Names",
        tool: "Data Cleaning Tool",
        status: "completed",
        duration: "42s",
        recordsIn: 89450,
        recordsOut: 89450,
      },
      {
        id: "s5",
        name: "Update Catalog",
        tool: "Output Tool",
        status: "completed",
        duration: "10s",
        recordsIn: 89450,
        recordsOut: 89450,
      },
    ],
  },
];

export const mockUserActivity = [
  {
    name: "Sarah Chen",
    initials: "SC",
    email: "sarah.chen@company.com",
    totalRuns: 234,
    successRate: 95,
    lastActive: "2 hours ago",
    favoriteWorkflow: "Customer Data Cleansing",
  },
  {
    name: "Michael Torres",
    initials: "MT",
    email: "michael.torres@company.com",
    totalRuns: 189,
    successRate: 87,
    lastActive: "5 hours ago",
    favoriteWorkflow: "Sales Analysis Pipeline",
  },
  {
    name: "Emma Wilson",
    initials: "EW",
    email: "emma.wilson@company.com",
    totalRuns: 156,
    successRate: 92,
    lastActive: "1 hour ago",
    favoriteWorkflow: "Inventory Report Generation",
  },
  {
    name: "James Rodriguez",
    initials: "JR",
    email: "james.rodriguez@company.com",
    totalRuns: 203,
    successRate: 89,
    lastActive: "3 hours ago",
    favoriteWorkflow: "Marketing Data Merge",
  },
  {
    name: "Lisa Park",
    initials: "LP",
    email: "lisa.park@company.com",
    totalRuns: 145,
    successRate: 94,
    lastActive: "1 day ago",
    favoriteWorkflow: "Financial Reconciliation",
  },
];
