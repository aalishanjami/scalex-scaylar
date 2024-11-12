"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Employee } from "@/lib/types/employee";

interface TeamCardProps {
  member: Employee;
}

export function TeamCard({ member }: TeamCardProps) {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b bg-muted/40 p-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {getInitials(member.first_name, member.last_name)}
            </AvatarFallback>
          </Avatar>
          {member.first_name} {member.last_name}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Role</span>
            <span className="text-sm font-medium">{member.role}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Department</span>
            <Badge variant="secondary">{member.department}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Email</span>
            <span className="text-sm font-medium">{member.email}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}