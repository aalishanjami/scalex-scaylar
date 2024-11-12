"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
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
import { Loader2, FileText } from "lucide-react";
import type { Expense, ExpenseStatus } from "@/lib/types/expense";
import { Restricted } from "@/components/layout/restricted";

interface ExpenseDetailsProps {
  expense: Expense;
  onUpdate: () => void;
  onClose: () => void;
}

export function ExpenseDetails({
  expense,
  onUpdate,
  onClose,
}: ExpenseDetailsProps) {
  const [status, setStatus] = useState<ExpenseStatus>(expense.status);
  const [notes, setNotes] = useState(expense.notes || "");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  const handleStatusChange = async (newStatus: ExpenseStatus) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("expenses")
        .update({
          status: newStatus,
          notes,
          approved_by: (await supabase.auth.getUser()).data.user?.id,
          approved_at: new Date().toISOString(),
        })
        .eq("id", expense.id);

      if (error) throw error;

      setStatus(newStatus);
      onUpdate();

      toast({
        title: "Success",
        description: "Expense status has been updated",
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
        <h3 className="text-lg font-medium">{expense.description}</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Submitted on {format(new Date(expense.created_at), "PPp")}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium">Amount</p>
          <p className="mt-1">
            {expense.amount.toLocaleString("en-US", {
              style: "currency",
              currency: expense.currency,
            })}
          </p>
        </div>

        <div>
          <p className="text-sm font-medium">Category</p>
          <p className="mt-1 capitalize">
            {expense.category.replace("_", " ")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium">Date</p>
          <p className="mt-1">{format(new Date(expense.date), "PP")}</p>
        </div>

        <div>
          <p className="text-sm font-medium">Status</p>
          <Badge
            className="mt-1"
            variant={
              status === "approved" || status === "reimbursed"
                ? "default"
                : status === "rejected"
                ? "destructive"
                : "secondary"
            }
          >
            {status}
          </Badge>
        </div>
      </div>

      {expense.receipt_url && (
        <div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.open(expense.receipt_url, "_blank")}
          >
            <FileText className="mr-2 h-4 w-4" />
            View Receipt
          </Button>
        </div>
      )}

      <Separator />

      <Restricted permissions={["manage_expenses"]}>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Update Status</label>
            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="reimbursed">Reimbursed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Notes</label>
            <Textarea
              className="mt-1"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this expense..."
            />
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
