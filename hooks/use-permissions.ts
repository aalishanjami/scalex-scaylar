"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Permission } from "@/lib/types/role";

export function usePermissions() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchPermissions() {
      try {
        // First check if we have a session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        console.log(supabase.auth);
        console.log(session?.user, "user");
        if (!session?.user) {
          console.log("No session or user found"); // Debug log
          setLoading(false);
          return;
        }

        // Get user's roles and permissions
        const { data: roleData, error: roleError } = await supabase
          .from("employee_roles")
          .select(
            `
            role_id,
            role:roles (
              id,
              name,
              permissions
            )
          `
          )
          .eq("employee_id", session.user.id);

        console.log("Role Data:", roleData); // Debug log
        console.log("Role Error:", roleError); // Debug log

        if (roleError) throw roleError;

        // Extract and flatten permissions from all roles
        const allPermissions =
          roleData?.flatMap(
            (item) => (item.role?.permissions as Permission[]) || []
          ) || [];

        console.log("All Permissions:", allPermissions); // Debug log

        // Remove duplicates
        const uniquePermissions = [...new Set(allPermissions)];
        console.log("Unique Permissions:", uniquePermissions); // Debug log

        setPermissions(uniquePermissions);
      } catch (error) {
        console.error("Error fetching permissions:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPermissions();
  }, []);

  const hasPermission = (permission: Permission) => {
    console.log(
      "Checking permission:",
      permission,
      "Has it:",
      permissions.includes(permission)
    ); // Debug log
    return permissions.includes(permission);
  };

  return {
    permissions,
    hasPermission,
    loading,
  };
}
