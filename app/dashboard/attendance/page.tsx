"use client";

import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";
import { Clock, UserCheck, UserX, AlertTriangle } from "lucide-react";
import { AttendanceStats } from "@/lib/types/attendance";
import { AttendanceTable } from "@/components/attendance/attendance-table";
import { ClockInOutButton } from "@/components/attendance/clock-in-out-button";
import { AttendanceStats as StatsDisplay } from "@/components/attendance/attendance-stats";

export default function AttendancePage() {
  const [date, setDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AttendanceStats>({
    present: 0,
    absent: 0,
    late: 0,
    halfDay: 0,
    total: 0,
  });
  const { toast } = useToast();
  const supabase = createClient();

  const fetchAttendanceStats = async () => {
    try {
      const startDate = startOfMonth(date);
      const endDate = endOfMonth(date);

      const { data: attendanceData, error } = await supabase
        .from("attendance")
        .select("status")
        .gte("date", format(startDate, "yyyy-MM-dd"))
        .lte("date", format(endDate, "yyyy-MM-dd"));

      if (error) throw error;

      const stats = attendanceData.reduce(
        (acc, curr) => {
          acc[curr.status]++;
          acc.total++;
          return acc;
        },
        { present: 0, absent: 0, late: 0, halfDay: 0, total: 0 }
      );

      setStats(stats);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch attendance statistics",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceStats();
  }, [date]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Attendance</h2>
        <ClockInOutButton onSuccess={fetchAttendanceStats} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsDisplay stats={stats} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Calendar View</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date) => date && setDate(date)}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <AttendanceTable date={date} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
