export type PayrollStatus = 'draft' | 'approved' | 'paid';

export interface PayrollItem {
  id: string;
  name: string;
  type: 'earning' | 'deduction';
  description: string | null;
  is_percentage: boolean;
  is_taxable: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmployeePayrollItem {
  id: string;
  employee_id: string;
  payroll_item_id: string;
  amount: number;
  created_at: string;
  updated_at: string;
  payroll_item: PayrollItem;
}

export interface PayrollDetail {
  id: string;
  payroll_id: string;
  payroll_item_id: string;
  amount: number;
  created_at: string;
  payroll_item: PayrollItem;
}

export interface Payroll {
  id: string;
  employee_id: string;
  period_start: string;
  period_end: string;
  base_salary: number;
  total_earnings: number;
  total_deductions: number;
  net_salary: number;
  status: PayrollStatus;
  payment_date: string | null;
  payment_method: string | null;
  notes: string | null;
  created_by: string;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
  employee: {
    first_name: string;
    last_name: string;
    employee_id: string;
  };
  details: PayrollDetail[];
}

export interface PayrollSummary {
  total_payroll: number;
  total_employees: number;
  average_salary: number;
  total_deductions: number;
  department_breakdown: {
    department: string;
    total: number;
    count: number;
  }[];
}