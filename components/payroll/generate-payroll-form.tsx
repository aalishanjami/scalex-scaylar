"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";

const formSchema = z.object({
  employee_id: z.string().min(1, "Employee is required"),
  period_start: z.string().min(1, "Start date is required"),
  period_end: z.string().min(1, "End date is required"),
  base_salary: z.number().min(0, "Base salary must be a positive number"),
});

interface GeneratePayrollFormProps {
  onSuccess: () => void;
}

export function GeneratePayrollForm({ onSuccess }: GeneratePayrollFormProps) {
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<
    Array<{
      id: string;
      name: string;
      employee_id: string;
    }>
  >([]);
  const { toast } = useToast();
  const supabase = createClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      base_salary: 0,
      period_start: new Date().toISOString().split("T")[0],
      period_end: new Date().toISOString().split("T")[0],
    },
  });

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from("employees")
        .select("id, first_name, last_name, employee_id")
        .eq("status", "active");

      if (error) throw error;

      setEmployees(
        data.map((e) => ({
          id: e.id,
          name: `${e.first_name} ${e.last_name}`,
          employee_id: e.employee_id,
        }))
      );
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  useState(() => {
    fetchEmployees();
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      // Calculate earnings and deductions
      const { data: items, error: itemsError } = await supabase
        .from("employee_payroll_items")
        .select(
          `
          amount,
          payroll_item:payroll_items (
            id,
            type
          )
        `
        )
        .eq("employee_id", values.employee_id);

      if (itemsError) throw itemsError;

      const earnings = items
        .filter((i) => i.payroll_item.type === "earning")
        .reduce((acc, i) => acc + i.amount, 0);

      const deductions = items
        .filter((i) => i.payroll_item.type === "deduction")
        .reduce((acc, i) => acc + i.amount, 0);

      const total_earnings = values.base_salary + earnings;
      const total_deductions = deductions;
      const net_salary = total_earnings - total_deductions;

      // Create payroll record
      const { data: payroll, error: payrollError } = await supabase
        .from("payroll")
        .insert({
          employee_id: values.employee_id,
          period_start: values.period_start,
          period_end: values.period_end,
          base_salary: values.base_salary,
          total_earnings,
          total_deductions,
          net_salary,
          status: "draft",
          created_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (payrollError) throw payrollError;

      // Create payroll details
      const details = items.map((item) => ({
        payroll_id: payroll.id,
        payroll_item_id: item.payroll_item.id,
        amount: item.amount,
      }));

      const { error: detailsError } = await supabase
        .from("payroll_details")
        .insert(details);

      if (detailsError) throw detailsError;

      toast({
        title: "Success",
        description: "Payroll has been generated successfully",
      });
      onSuccess();
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="employee_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Employee</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name} ({employee.employee_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="period_start"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Period Start</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="period_end"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Period End</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="base_salary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Base Salary</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generate Payroll
          </Button>
        </div>
      </form>
    </Form>
  );
}
