"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, Users, TrendingUp, Building2 } from "lucide-react";
import type { PayrollSummary as Stats } from "@/lib/types/payroll";

export function PayrollSummary() {
  const [stats, setStats] = useState<Stats>({
    total_payroll: 0,
    total_employees: 0,
    average_salary: 0,
    total_deductions: 0,
    department_breakdown: [],
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const supabase = createClient();

  const fetchStats = async () => {
    try {
      const { data: payrollData, error: payrollError } = await supabase
        .from("payroll")
        .select(
          `
          net_salary,
          total_deductions,
          employee:employees!payroll_employee_id_fkey (
            department
          )
        `
        )
        .eq("status", "approved");

      if (payrollError) throw payrollError;

      const stats: Stats = {
        total_payroll: payrollData.reduce((acc, p) => acc + p.net_salary, 0),
        total_employees: payrollData.length,
        average_salary:
          payrollData.length > 0
            ? payrollData.reduce((acc, p) => acc + p.net_salary, 0) /
              payrollData.length
            : 0,
        total_deductions: payrollData.reduce(
          (acc, p) => acc + p.total_deductions,
          0
        ),
        department_breakdown: [],
      };

      // Calculate department breakdown
      const deptMap = new Map<string, { total: number; count: number }>();
      payrollData.forEach((p) => {
        const dept = p.employee.department;
        const current = deptMap.get(dept) || { total: 0, count: 0 };
        deptMap.set(dept, {
          total: current.total + p.net_salary,
          count: current.count + 1,
        });
      });

      stats.department_breakdown = Array.from(deptMap.entries()).map(
        ([department, data]) => ({
          department,
          total: data.total,
          count: data.count,
        })
      );

      setStats(stats);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch payroll statistics",
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
      title: "Total Payroll",
      value: stats.total_payroll.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      }),
      icon: DollarSign,
    },
    {
      title: "Total Employees",
      value: stats.total_employees,
      icon: Users,
    },
    {
      title: "Average Salary",
      value: stats.average_salary.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      }),
      icon: TrendingUp,
    },
    {
      title: "Total Deductions",
      value: stats.total_deductions.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      }),
      icon: Building2,
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
