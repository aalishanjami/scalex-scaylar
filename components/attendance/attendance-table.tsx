"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
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
import type { Attendance } from "@/lib/types/attendance";

interface AttendanceTableProps {
  date: Date;
}

export function AttendanceTable({ date }: AttendanceTableProps) {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchAttendance = async () => {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select(`
          *,
          employees (
            first_name,
            last_name,
            employee_id
          )
        `)
        .eq('date', format(date, 'yyyy-MM-dd'))
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAttendance(data || []);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [date]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      present: "default",
      late: "secondary",
      absent: "destructive",
    };

    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Employee</TableHead>
          <TableHead>Clock In</TableHead>
          <TableHead>Clock Out</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {attendance.map((record) => (
          <TableRow key={record.id}>
            <TableCell className="font-medium">
              {record.employees.first_name} {record.employees.last_name}
            </TableCell>
            <TableCell>{record.clock_in}</TableCell>
            <TableCell>{record.clock_out || "-"}</TableCell>
            <TableCell>{getStatusBadge(record.status)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}