"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Restricted } from "@/components/layout/restricted";
import {
  LayoutDashboard,
  Users,
  Clock,
  Ticket,
  Building2,
  Receipt,
  DollarSign,
  UsersRound,
  FileText,
  Image,
} from "lucide-react";
import type { Permission } from "@/lib/types/role";

const routes = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    permissions: ["view_dashboard"] as Permission[],
  },
  {
    title: "Our Team",
    href: "/dashboard/team",
    icon: UsersRound,
    permissions: ["view_dashboard"] as Permission[],
  },
  {
    title: "Employees",
    href: "/dashboard/employees",
    icon: Users,
    permissions: ["manage_employees", "view_employees"] as Permission[],
  },
  {
    title: "Attendance",
    href: "/dashboard/attendance",
    icon: Clock,
    permissions: ["manage_attendance", "mark_attendance"] as Permission[],
  },
  {
    title: "Tickets",
    href: "/dashboard/tickets",
    icon: Ticket,
    permissions: ["manage_tickets", "create_tickets", "view_own_tickets"] as Permission[],
  },
  {
    title: "Departments",
    href: "/dashboard/departments",
    icon: Building2,
    permissions: ["manage_departments", "view_departments"] as Permission[],
  },
  {
    title: "Expenses",
    href: "/dashboard/expenses",
    icon: Receipt,
    permissions: ["manage_expenses"] as Permission[],
  },
  {
    title: "Payroll",
    href: "/dashboard/payroll",
    icon: DollarSign,
    permissions: ["manage_payroll", "view_payroll"] as Permission[],
  },
  {
    title: "Policies",
    href: "/dashboard/policies",
    icon: FileText,
    permissions: ["view_dashboard"] as Permission[],
  },
  {
    title: "Gallery",
    href: "/dashboard/gallery",
    icon: Image,
    permissions: ["view_dashboard"] as Permission[],
  },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="grid items-start gap-2">
      {routes.map((route) => (
        <Restricted key={route.href} permissions={route.permissions}>
          <Link href={route.href}>
            <Button
              variant={pathname === route.href ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-2",
                pathname === route.href && "bg-muted"
              )}
            >
              <route.icon className="h-4 w-4" />
              {route.title}
            </Button>
          </Link>
        </Restricted>
      ))}
    </nav>
  );
}