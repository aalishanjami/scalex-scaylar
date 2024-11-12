"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Edit2, Users } from "lucide-react";
import { EditDepartmentForm } from "./edit-department-form";
import { DepartmentEmployees } from "./department-employees";
import type { Department } from "@/lib/types/department";

export function DepartmentList() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [showEmployees, setShowEmployees] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select(`
          *,
          manager:employees!departments_manager_id_fkey (
            id,
            first_name,
            last_name,
            email
          ),
          employee_count:employees (count)
        `)
        .order('name');

      if (error) throw error;

      setDepartments(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch departments",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleEditSuccess = () => {
    setSelectedDepartment(null);
    fetchDepartments();
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {departments.map((department) => (
          <Card key={department.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{department.name}</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedDepartment(department)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedDepartment(department);
                      setShowEmployees(true);
                    }}
                  >
                    <Users className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>
                {department.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Manager</span>
                  <span className="text-sm font-medium">
                    {department.manager
                      ? `${department.manager.first_name} ${department.manager.last_name}`
                      : "Not assigned"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Employees</span>
                  <Badge variant="secondary">
                    {department.employee_count?.[0]?.count || 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Budget</span>
                  <span className="text-sm font-medium">
                    ${department.budget.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog
        open={!!selectedDepartment && !showEmployees}
        onOpenChange={() => setSelectedDepartment(null)}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Department</DialogTitle>
          </DialogHeader>
          {selectedDepartment && (
            <EditDepartmentForm
              department={selectedDepartment}
              onSuccess={handleEditSuccess}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!selectedDepartment && showEmployees}
        onOpenChange={() => {
          setSelectedDepartment(null);
          setShowEmployees(false);
        }}
      >
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Department Employees</DialogTitle>
          </DialogHeader>
          {selectedDepartment && (
            <DepartmentEmployees department={selectedDepartment} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}