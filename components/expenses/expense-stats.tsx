"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, Clock, CheckCircle, BanknoteIcon } from "lucide-react";
import type { ExpenseStats as Stats } from "@/lib/types/expense";

export function ExpenseStats() {
  const [stats, setStats] = useState<Stats>({
    total_expenses: 0,
    pending_amount: 0,
    approved_amount: 0,
    reimbursed_amount: 0,
    by_category: [],
    by_department: [],
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const supabase = createClient();

  const fetchStats = async () => {
    try {
      const { data: expenses, error } = await supabase.from("expenses").select(`
          amount,
          status,
          category,
          employees (
            department
          )
        `);

      if (error) throw error;

      const stats: Stats = {
        total_expenses: expenses.reduce((acc, exp) => acc + exp.amount, 0),
        pending_amount: expenses
          .filter((exp) => exp.status === "pending")
          .reduce((acc, exp) => acc + exp.amount, 0),
        approved_amount: expenses
          .filter((exp) => exp.status === "approved")
          .reduce((acc, exp) => acc + exp.amount, 0),
        reimbursed_amount: expenses
          .filter((exp) => exp.status === "reimbursed")
          .reduce((acc, exp) => acc + exp.amount, 0),
        by_category: [],
        by_department: [],
      };

      // Calculate category breakdown
      const categoryMap = new Map();
      expenses.forEach((exp) => {
        const current = categoryMap.get(exp.category) || {
          amount: 0,
          count: 0,
        };
        categoryMap.set(exp.category, {
          amount: current.amount + exp.amount,
          count: current.count + 1,
        });
      });
      stats.by_category = Array.from(categoryMap.entries()).map(
        ([category, data]) => ({
          category,
          ...data,
        })
      );

      // Calculate department breakdown
      const departmentMap = new Map();
      expenses.forEach((exp) => {
        const dept = exp.employees.department;
        const current = departmentMap.get(dept) || { amount: 0, count: 0 };
        departmentMap.set(dept, {
          amount: current.amount + exp.amount,
          count: current.count + 1,
        });
      });
      stats.by_department = Array.from(departmentMap.entries()).map(
        ([department, data]) => ({
          department,
          ...data,
        })
      );

      setStats(stats);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch expense statistics",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const items = [
    {
      title: "Total Expenses",
      value: stats.total_expenses.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      }),
      icon: DollarSign,
    },
    {
      title: "Pending Amount",
      value: stats.pending_amount.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      }),
      icon: Clock,
    },
    {
      title: "Approved Amount",
      value: stats.approved_amount.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      }),
      icon: CheckCircle,
    },
    {
      title: "Reimbursed Amount",
      value: stats.reimbursed_amount.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      }),
      icon: BanknoteIcon,
    },
  ];

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {item.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}