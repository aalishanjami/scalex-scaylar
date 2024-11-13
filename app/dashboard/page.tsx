export const dynamic = "force-dynamic";
export const revalidate = 0;

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, FileText, AlertCircle } from "lucide-react";

const stats = [
  {
    title: "Total Employees",
    value: "250",
    icon: Users,
    description: "Active employees",
  },
  {
    title: "Attendance Today",
    value: "92%",
    icon: Clock,
    description: "On time: 230",
  },
  {
    title: "Pending Requests",
    value: "15",
    icon: FileText,
    description: "Requires attention",
  },
  {
    title: "Recent Incidents",
    value: "3",
    icon: AlertCircle,
    description: "Last 7 days",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
