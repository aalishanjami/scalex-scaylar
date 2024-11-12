"use client";

import { usePermissions } from "@/hooks/use-permissions";
import type { Permission } from "@/lib/types/role";

interface RestrictedProps {
  children: React.ReactNode;
  permissions: Permission[];
  requireAll?: boolean;
}

export function Restricted({ children, permissions, permissions: requiredPermissions, requireAll = false }: RestrictedProps) {
  const { hasPermission, loading } = usePermissions();

  console.log(hasPermission, "hasPermission");

  if (loading) return null;

  const hasAccess = requireAll
    ? requiredPermissions.every(permission => {
        const has = hasPermission(permission);
        console.log(`Checking permission ${permission}:`, has); // Debug log
        return has;
      })
    : requiredPermissions.some(permission => {
        const has = hasPermission(permission);
        console.log(`Checking permission ${permission}:`, has); // Debug log
        return has;
      });

  console.log('Has access:', hasAccess, 'Required permissions:', requiredPermissions); // Debug log

  if (!hasAccess) return null;

  return <>{children}</>;
}