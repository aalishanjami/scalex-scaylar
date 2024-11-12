"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Building2,
  LayoutDashboard,
  LogOut,
  Menu,
  Users,
  Clock,
  Ticket,
  Receipt,
  DollarSign,
  UsersRound,
  FileText,
  Image,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { UserNav } from "@/components/layout/user-nav";
import { Restricted } from "@/components/layout/restricted";
import type { Permission } from "@/lib/types/role";

interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  permissions: Permission[];
}

const navigation: NavigationItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    permissions: ["view_dashboard"],
  },
  {
    name: "Our Team",
    href: "/dashboard/team",
    icon: UsersRound,
    permissions: ["view_dashboard"],
  },
  {
    name: "Employees",
    href: "/dashboard/employees",
    icon: Users,
    permissions: ["manage_employees", "view_employees"],
  },
  {
    name: "Attendance",
    href: "/dashboard/attendance",
    icon: Clock,
    permissions: ["manage_attendance", "mark_attendance"],
  },
  {
    name: "Tickets",
    href: "/dashboard/tickets",
    icon: Ticket,
    permissions: ["manage_tickets", "create_tickets", "view_own_tickets"],
  },
  {
    name: "Departments",
    href: "/dashboard/departments",
    icon: Building2,
    permissions: ["manage_departments", "view_departments"],
  },
  {
    name: "Expenses",
    href: "/dashboard/expenses",
    icon: Receipt,
    permissions: ["manage_expenses"],
  },
  {
    name: "Payroll",
    href: "/dashboard/payroll",
    icon: DollarSign,
    permissions: ["manage_payroll", "view_payroll"],
  },
  {
    name: "Policies",
    href: "/dashboard/policies",
    icon: FileText,
    permissions: ["view_dashboard"],
  },
  {
    name: "Gallery",
    href: "/dashboard/gallery",
    icon: Image,
    permissions: ["view_dashboard"],
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const NavItems = () => (
    <ul role="list" className="-mx-2 space-y-1">
      {navigation.map((item) => (
        <Restricted key={item.name} permissions={item.permissions}>
          <li>
            <Link
              href={item.href}
              className={`
                group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6
                ${
                  pathname === item.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }
              `}
              onClick={() => setOpen(false)}
            >
              <item.icon className="h-6 w-6 shrink-0" />
              {item.name}
            </Link>
          </li>
        </Restricted>
      ))}
    </ul>
  );

  return (
    <div className="relative flex min-h-screen bg-background">
      {/* Sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r bg-card px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <h1 className="text-2xl font-bold text-primary">ScaleX</h1>
          </div>
          <nav className="flex flex-1 flex-col">
            <div className="flex-1">
              <NavItems />
            </div>
            <div className="mt-auto">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile header */}
      <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-card px-4 py-4 shadow-sm sm:px-6 lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open sidebar</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <div className="flex h-16 shrink-0 items-center">
              <h1 className="text-2xl font-bold text-primary">ScaleX</h1>
            </div>
            <nav className="flex flex-1 flex-col mt-4">
              <div className="flex-1">
                <NavItems />
              </div>
              <div className="mt-auto">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </Button>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex-1 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">ScaleX</h1>
          <UserNav />
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 py-10 lg:pl-72">
        <div className="px-4 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}