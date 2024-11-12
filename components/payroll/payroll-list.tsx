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
import { PayrollDetails } from "./payroll-details";
import type { Payroll } from "@/lib/types/payroll";

export function PayrollList() {
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayroll, setSelectedPayroll] = useState<Payroll | null>(null);
  const { toast } = useToast();
  const supabase = createClient();

  const fetchPayrolls = async () => {
    try {
      const { data, error } = await supabase
        .from("payroll")
        .select(
          `
          *,
          employee:employees!payroll_employee_id_fkey (
            first_name,
            last_name,
            employee_id
          ),
          details:payroll_details (
            *,
            payroll_item:payroll_items (*)
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPayrolls(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch payroll records",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrolls();
  }, []);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      draft: "secondary",
      approved: "default",
      paid: "default",
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
            <TableHead>Employee</TableHead>
            <TableHead>Period</TableHead>
            <TableHead>Base Salary</TableHead>
            <TableHead>Net Salary</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payrolls.map((payroll) => (
            <TableRow key={payroll.id}>
              <TableCell>
                {payroll.employee.first_name} {payroll.employee.last_name}
                <br />
                <span className="text-sm text-muted-foreground">
                  {payroll.employee.employee_id}
                </span>
              </TableCell>
              <TableCell>
                {format(new Date(payroll.period_start), "MMM d")} -{" "}
                {format(new Date(payroll.period_end), "MMM d, yyyy")}
              </TableCell>
              <TableCell>${payroll.base_salary.toLocaleString()}</TableCell>
              <TableCell>${payroll.net_salary.toLocaleString()}</TableCell>
              <TableCell>{getStatusBadge(payroll.status)}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedPayroll(payroll)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog
        open={!!selectedPayroll}
        onOpenChange={() => setSelectedPayroll(null)}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Payroll Details</DialogTitle>
          </DialogHeader>
          {selectedPayroll && (
            <PayrollDetails
              payroll={selectedPayroll}
              onUpdate={fetchPayrolls}
              onClose={() => setSelectedPayroll(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
