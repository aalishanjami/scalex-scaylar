import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserCheck, UserX, Clock, AlertTriangle } from "lucide-react";
import type { AttendanceStats as Stats } from "@/lib/types/attendance";

interface AttendanceStatsProps {
  stats: Stats;
}

export function AttendanceStats({ stats }: AttendanceStatsProps) {
  const items = [
    {
      title: "Present",
      value: stats.present,
      icon: UserCheck,
    },
    {
      title: "Absent",
      value: stats.absent,
      icon: UserX,
    },
    {
      title: "Late",
      value: stats.late,
      icon: Clock,
    },
    {
      title: "Half Day",
      value: stats.halfDay,
      icon: AlertTriangle,
    },
  ];

  return (
    <>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {item.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
              <p className="text-xs text-muted-foreground">
                {((item.value / (stats.total || 1)) * 100).toFixed(1)}% of total
              </p>
            </CardContent>
          </Card>
        );
      })}
    </>
  );
}