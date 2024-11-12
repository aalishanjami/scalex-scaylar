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
import { PayrollList } from "@/components/payroll/payroll-list";
import { PayrollSummary } from "@/components/payroll/payroll-summary";
import { GeneratePayrollForm } from "@/components/payroll/generate-payroll-form";

export default function PayrollPage() {
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);

  const handleGenerateSuccess = () => {
    setShowGenerateDialog(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Payroll</h2>
        <Button onClick={() => setShowGenerateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" /> Generate Payroll
        </Button>
      </div>

      <PayrollSummary />
      
      <PayrollList />

      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Generate Payroll</DialogTitle>
          </DialogHeader>
          <GeneratePayrollForm onSuccess={handleGenerateSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  );
}