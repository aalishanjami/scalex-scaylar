"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import type { Payroll, PayrollStatus } from "@/lib/types/payroll";
import { Restricted } from "@/components/layout/restricted";

interface PayrollDetailsProps {
  payroll: Payroll;
  onUpdate: () => void;
  onClose: () => void;
}

export function PayrollDetails({
  payroll,
  onUpdate,
  onClose,
}: PayrollDetailsProps) {
  const [status, setStatus] = useState<PayrollStatus>(payroll.status);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  const handleStatusChange = async (newStatus: PayrollStatus) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("payroll")
        .update({
          status: newStatus,
          approved_by:
            newStatus === "approved"
              ? (
                  await supabase.auth.getUser()
                ).data.user?.id
              : null,
        })
        .eq("id", payroll.id);

      if (error) throw error;

      setStatus(newStatus);
      onUpdate();

      toast({
        title: "Success",
        description: "Payroll status has been updated",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">
          {payroll.employee.first_name} {payroll.employee.last_name}
        </h3>
        <p className="text-sm text-muted-foreground">
          Employee ID: {payroll.employee.employee_id}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium">Period</p>
          <p className="mt-1">
            {format(new Date(payroll.period_start), "MMM d")} -{" "}
            {format(new Date(payroll.period_end), "MMM d, yyyy")}
          </p>
        </div>

        <div>
          <p className="text-sm font-medium">Status</p>
          <Badge
            className="mt-1"
            variant={
              status === "approved" || status === "paid"
                ? "default"
                : "secondary"
            }
          >
            {status}
          </Badge>
        </div>
      </div>

      <Separator />

      <div>
        <h4 className="font-medium mb-4">Earnings & Deductions</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Base Salary</span>
            <span>${payroll.base_salary.toLocaleString()}</span>
          </div>
          {payroll.details.map((detail) => (
            <div key={detail.id} className="flex justify-between">
              <span>{detail.payroll_item.name}</span>
              <span
                className={
                  detail.payroll_item.type === "deduction" ? "text-red-500" : ""
                }
              >
                {detail.payroll_item.type === "deduction" ? "-" : ""}$
                {detail.amount.toLocaleString()}
              </span>
            </div>
          ))}
          <Separator />
          <div className="flex justify-between font-bold">
            <span>Net Salary</span>
            <span>${payroll.net_salary.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <Restricted permissions={["manage_payroll"]}>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Update Status</label>
            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Restricted>

      <div className="flex justify-end">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}
