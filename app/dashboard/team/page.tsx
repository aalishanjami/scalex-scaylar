export const dynamic = "force-dynamic";
export const revalidate = 0;

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TeamCard } from "@/components/team/team-card";
import { TeamFilters } from "@/components/team/team-filters";
import type { Employee } from "@/lib/types/employee";

const departments = [
  "Engineering",
  "Marketing",
  "Sales",
  "Human Resources",
  "Finance",
  "Operations",
];

export default function TeamPage() {
  const [team, setTeam] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string | null>(null);
  const { toast } = useToast();
  const supabase = createClient();

  const fetchTeam = async () => {
    try {
      let query = supabase
        .from("employees")
        .select(
          `
          *,
          roles:employee_roles (
            role:roles (
              name,
              permissions
            )
          )
        `
        )
        .eq("status", "active")
        .order("department")
        .order("first_name");

      if (departmentFilter) {
        query = query.eq("department", departmentFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTeam(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch team members",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, [departmentFilter]);

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("employees_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "employees",
        },
        () => {
          fetchTeam();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [departmentFilter]);

  const filteredTeam = team.filter((member) => {
    const matchesSearch =
      `${member.first_name} ${member.last_name}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      member.role.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Our Team</h2>
      </div>

      <TeamFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        departmentFilter={departmentFilter}
        onDepartmentChange={setDepartmentFilter}
        departments={departments}
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTeam.map((member) => (
          <TeamCard key={member.id} member={member} />
        ))}
      </div>
    </div>
  );
}
