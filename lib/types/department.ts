export interface Department {
  id: string;
  name: string;
  description: string;
  manager_id: string | null;
  budget: number;
  created_at: string;
  updated_at: string;
  manager?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  employee_count?: number;
}

export interface DepartmentStats {
  total_departments: number;
  total_employees: number;
  total_budget: number;
  departments: {
    name: string;
    employee_count: number;
    budget_utilization: number;
  }[];
}