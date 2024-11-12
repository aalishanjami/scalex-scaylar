"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

interface ClockInOutButtonProps {
  onSuccess: () => void;
}

export function ClockInOutButton({ onSuccess }: ClockInOutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [clockedIn, setClockedIn] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  const checkAttendanceStatus = async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const { data, error } = await supabase
        .from('attendance')
        .select('clock_out')
        .eq('date', today)
        .eq('employee_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setClockedIn(false);
        } else {
          throw error;
        }
      } else {
        setClockedIn(!data.clock_out);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to check attendance status",
      });
    }
  };

  useEffect(() => {
    checkAttendanceStatus();
  }, []);

  const handleClockInOut = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const today = format(now, 'yyyy-MM-dd');
      const time = format(now, 'HH:mm:ss');
      const userId = (await supabase.auth.getUser()).data.user?.id;

      if (!clockedIn) {
        // Clock in
        const { error } = await supabase
          .from('attendance')
          .insert({
            employee_id: userId,
            date: today,
            clock_in: time,
            status: format(now, 'HH:mm') > '09:00' ? 'late' : 'present',
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "You have successfully clocked in",
        });
      } else {
        // Clock out
        const { error } = await supabase
          .from('attendance')
          .update({ clock_out: time })
          .eq('date', today)
          .eq('employee_id', userId);

        if (error) throw error;

        toast({
          title: "Success",
          description: "You have successfully clocked out",
        });
      }

      setClockedIn(!clockedIn);
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
    <Button onClick={handleClockInOut} disabled={loading}>
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {clockedIn ? "Clock Out" : "Clock In"}
    </Button>
  );
}