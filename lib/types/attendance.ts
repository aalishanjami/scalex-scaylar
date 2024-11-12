export interface Attendance {
  id: string;
  employee_id: string;
  date: string;
  clock_in: string;
  clock_out: string | null;
  status: 'present' | 'absent' | 'late' | 'half-day';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AttendanceStats {
  present: number;
  absent: number;
  late: number;
  halfDay: number;
  total: number;
}