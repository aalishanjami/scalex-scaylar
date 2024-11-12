"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { Eye, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExpenseDetails } from "./expense-details";
import type { Expense, ExpenseStatus, ExpenseCategory } from "@/lib/types/expense";

interface ExpenseListProps {
  filters: {
    status: ExpenseStatus | null;
    category: ExpenseCategory | null;
    dateRange: {
      from: Date | null;
      to: Date | null;
    };
  };
}

export function ExpenseList({ filters }: ExpenseListProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const { toast } = useToast();
  const supabase = createClient();

  const fetchExpenses = async () => {
    try {
      let query = supabase
        .from('expenses')
        .select(`
          *,
          employee:employees!expenses_employee_id_fkey (
            first_name,
            last_name,
            employee_id,
            department
          )
        `)
        .order('created_at', { ascending: false });

      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.dateRange.from) {
        query = query.gte('date', format(filters.dateRange.from, 'yyyy-MM-dd'));
      }
      if (filters.dateRange.to) {
        query = query.lte('date', format(filters.dateRange.to, 'yyyy-MM-dd'));
      }

      const { data, error } = await query;

      if (error) throw error;
      setExpenses(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch expenses",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [filters]);

  const getStatusBadge = (status: ExpenseStatus) => {
    const variants: Record<ExpenseStatus, "default" | "secondary" | "destructive"> = {
      pending: "secondary",
      approved: "default",
      rejected: "destructive",
      reimbursed: "default",
    };

    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Employee</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((expense) => (
            <TableRow key={expense.id}>
              <TableCell>{format(new Date(expense.date), 'PP')}</TableCell>
              <TableCell>
                {expense.employee.first_name} {expense.employee.last_name}
              </TableCell>
              <TableCell>{expense.category.replace('_', ' ')}</TableCell>
              <TableCell>
                {expense.amount.toLocaleString('en-US', {
                  style: 'currency',
                  currency: expense.currency,
                })}
              </TableCell>
              <TableCell>{getStatusBadge(expense.status)}</TableCell>
              <TableCell>{expense.employee.department}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedExpense(expense)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {expense.receipt_url && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => window.open(expense.receipt_url, '_blank')}
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!selectedExpense} onOpenChange={() => setSelectedExpense(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Expense Details</DialogTitle>
          </DialogHeader>
          {selectedExpense && (
            <ExpenseDetails
              expense={selectedExpense}
              onUpdate={fetchExpenses}
              onClose={() => setSelectedExpense(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );