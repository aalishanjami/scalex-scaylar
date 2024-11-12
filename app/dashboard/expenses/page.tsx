"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExpenseList } from "@/components/expenses/expense-list";
import { ExpenseStats } from "@/components/expenses/expense-stats";
import { CreateExpenseForm } from "@/components/expenses/create-expense-form";
import { ExpenseFilters } from "@/components/expenses/expense-filters";
import type { ExpenseStatus, ExpenseCategory } from "@/lib/types/expense";

export default function ExpensesPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [filters, setFilters] = useState({
    status: null as ExpenseStatus | null,
    category: null as ExpenseCategory | null,
    dateRange: {
      from: null as Date | null,
      to: null as Date | null,
    },
  });

  const handleCreateSuccess = () => {
    setShowCreateDialog(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Expenses</h2>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" /> Submit Expense
        </Button>
      </div>

      <ExpenseStats />

      <ExpenseFilters filters={filters} onFilterChange={setFilters} />

      <ExpenseList filters={filters} />

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Submit Expense</DialogTitle>
          </DialogHeader>
          <CreateExpenseForm onSuccess={handleCreateSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  );
}