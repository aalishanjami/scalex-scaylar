export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  created_at: string;
  updated_at: string;
}

export interface EmployeeRole {
  employee_id: string;
  role_id: string;
  role: Role;
}

export type Permission =
  | 'view_dashboard'
  | 'manage_employees'
  | 'view_employees'
  | 'manage_attendance'
  | 'mark_attendance'
  | 'manage_departments'
  | 'view_departments'
  | 'manage_expenses'
  | 'manage_payroll'
  | 'view_payroll'
  | 'manage_tickets'
  | 'create_tickets'
  | 'view_own_tickets'
  | 'assign_roles';