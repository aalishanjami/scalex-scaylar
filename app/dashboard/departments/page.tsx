export const dynamic = "force-dynamic";
export const revalidate = 0;

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DepartmentList } from "@/components/departments/department-list";
import { CreateDepartmentForm } from "@/components/departments/create-department-form";
import { DepartmentStats } from "@/components/departments/department-stats";

export default function DepartmentsPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const handleCreateSuccess = () => {
    setShowCreateDialog(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Departments</h2>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Department
        </Button>
      </div>

      <DepartmentStats />

      <DepartmentList />

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create Department</DialogTitle>
          </DialogHeader>
          <CreateDepartmentForm onSuccess={handleCreateSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
