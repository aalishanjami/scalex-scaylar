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
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Department } from "@/lib/types/department";
import type { Employee } from "@/lib/types/employee";

interface DepartmentEmployeesProps {
  department: Department;
}

export function DepartmentEmployees({ department }: DepartmentEmployeesProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const supabase = createClient();

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('department', department.name)
        .order('first_name');

      if (error) throw error;

      setEmployees(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch employees",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {employees.map((employee) => (
          <TableRow key={employee.id}>
            <TableCell className="font-medium">
              {employee.first_name} {employee.last_name}
            </TableCell>
            <TableCell>{employee.role}</TableCell>
            <TableCell>{employee.email}</TableCell>
            <TableCell>
              <Badge
                variant={employee.status === 'active' ? 'default' : 'secondary'}
              >
                {employee.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
        {employees.length === 0 && (
          <TableRow>
            <TableCell colSpan={4} className="text-center">
              No employees found in this department
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}