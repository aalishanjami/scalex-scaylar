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
import { Building2, Users, DollarSign } from "lucide-react";
import type { DepartmentStats as Stats } from "@/lib/types/department";

export function DepartmentStats() {
  const [stats, setStats] = useState<Stats>({
    total_departments: 0,
    total_employees: 0,
    total_budget: 0,
    departments: [],
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const supabase = createClient();

  const fetchStats = async () => {
    try {
      const { data: departments, error: deptError } = await supabase
        .from('departments')
        .select(`
          id,
          name,
          budget,
          employees (count)
        `);

      if (deptError) throw deptError;

      const stats: Stats = {
        total_departments: departments.length,
        total_employees: departments.reduce((acc, dept) => acc + (dept.employees[0]?.count || 0), 0),
        total_budget: departments.reduce((acc, dept) => acc + dept.budget, 0),
        departments: departments.map(dept => ({
          name: dept.name,
          employee_count: dept.employees[0]?.count || 0,
          budget_utilization: 0, // This would need payroll data to calculate actual utilization
        })),
      };

      setStats(stats);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch department statistics",
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
      title: "Total Departments",
      value: stats.total_departments,
      icon: Building2,
    },
    {
      title: "Total Employees",
      value: stats.total_employees,
      icon: Users,
    },
    {
      title: "Total Budget",
      value: `$${stats.total_budget.toLocaleString()}`,
      icon: DollarSign,
    },
  ];

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
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