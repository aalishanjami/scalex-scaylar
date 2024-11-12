"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TicketStatus, TicketType, TicketPriority } from "@/lib/types/ticket";

interface TicketFiltersProps {
  filters: {
    status: TicketStatus | null;
    type: TicketType | null;
    priority: TicketPriority | null;
  };
  onFilterChange: (filters: {
    status: TicketStatus | null;
    type: TicketType | null;
    priority: TicketPriority | null;
  }) => void;
}

export function TicketFilters({ filters, onFilterChange }: TicketFiltersProps) {
  return (
    <div className="flex gap-4">
      <Select
        value={filters.status || "all"}
        onValueChange={(value) =>
          onFilterChange({
            ...filters,
            status: value === "all" ? null : (value as TicketStatus),
          })
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="open">Open</SelectItem>
          <SelectItem value="in_progress">In Progress</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="resolved">Resolved</SelectItem>
          <SelectItem value="closed">Closed</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.type || "all"}
        onValueChange={(value) =>
          onFilterChange({
            ...filters,
            type: value === "all" ? null : (value as TicketType),
          })
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="leave">Leave Request</SelectItem>
          <SelectItem value="expense">Expense Request</SelectItem>
          <SelectItem value="it_support">IT Support</SelectItem>
          <SelectItem value="hr">HR Request</SelectItem>
          <SelectItem value="task">Task</SelectItem>
          <SelectItem value="other">Other</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.priority || "all"}
        onValueChange={(value) =>
          onFilterChange({
            ...filters,
            priority: value === "all" ? null : (value as TicketPriority),
          })
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priorities</SelectItem>
          <SelectItem value="low">Low</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="urgent">Urgent</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}