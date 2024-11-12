export type ExpenseStatus = 'pending' | 'approved' | 'rejected' | 'reimbursed';
export type ExpenseCategory = 
  | 'travel' 
  | 'meals' 
  | 'office_supplies' 
  | 'software' 
  | 'hardware' 
  | 'training' 
  | 'other';

export interface Expense {
  id: string;
  employee_id: string;
  category: ExpenseCategory;
  amount: number;
  currency: string;
  date: string;
  description: string;
  status: ExpenseStatus;
  receipt_url: string | null;
  notes: string | null;
  approved_by: string | null;
  approved_at: string | null;
  reimbursed_at: string | null;
  created_at: string;
  updated_at: string;
  employee: {
    first_name: string;
    last_name: string;
    employee_id: string;
    department: string;
  };
}

export interface ExpenseStats {
  total_expenses: number;
  pending_amount: number;
  approved_amount: number;
  reimbursed_amount: number;
  by_category: {
    category: ExpenseCategory;
    amount: number;
    count: number;
  }[];
  by_department: {
    department: string;
    amount: number;
    count: number;
  }[];
}