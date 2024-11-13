"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TicketDetails } from "@/components/tickets/ticket-details";
import type { Ticket, TicketStatus, TicketType, TicketPriority } from "@/lib/types/ticket";

interface TicketListProps {
  filters: {
    status: TicketStatus | null;
    type: TicketType | null;
    priority: TicketPriority | null;
  };
}

export function TicketList({ filters }: TicketListProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const { toast } = useToast();
  const supabase = createClient();

  const fetchTickets = async () => {
    try {
      let query = supabase
        .from("tickets")
        .select(
          `
          *,
          created_by_user:employees!tickets_created_by_fkey(
            first_name,
            last_name
          ),
          assigned_to_user:employees!tickets_assigned_to_fkey(
            first_name,
            last_name
          ),
          department:departments!tickets_department_id_fkey(
            id,
            name,
            description
          )
        `
        )
        .order("created_at", { ascending: false });

      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.type) {
        query = query.eq('type', filters.type);
      }
      if (filters.priority) {
        query = query.eq('priority', filters.priority);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTickets(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch tickets",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [filters]);

  const getStatusBadge = (status: TicketStatus) => {
    const variants: Record<TicketStatus, "default" | "secondary" | "destructive"> = {
      open: "default",
      in_progress: "secondary",
      pending: "secondary",
      resolved: "default",
      closed: "destructive",
    };

    return <Badge variant={variants[status]}>{status.replace('_', ' ')}</Badge>;
  };

  const getPriorityBadge = (priority: TicketPriority) => {
    const variants: Record<TicketPriority, "default" | "secondary" | "destructive"> = {
      low: "secondary",
      medium: "default",
      high: "destructive",
      urgent: "destructive",
    };

    return <Badge variant={variants[priority]}>{priority}</Badge>;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map((ticket) => (
            <TableRow key={ticket.id}>
              <TableCell className="font-medium">{ticket.title}</TableCell>
              <TableCell>{ticket.type.replace("_", " ")}</TableCell>
              <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
              <TableCell>{getStatusBadge(ticket.status)}</TableCell>
              <TableCell>{ticket.department?.name || "N/A"}</TableCell>
              <TableCell>
                {ticket.created_by_user.first_name}{" "}
                {ticket.created_by_user.last_name}
              </TableCell>
              <TableCell>
                {format(new Date(ticket.created_at), "PPp")}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog
        open={!!selectedTicket}
        onOpenChange={() => setSelectedTicket(null)}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Ticket Details</DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <TicketDetails
              ticket={selectedTicket}
              onUpdate={fetchTickets}
              onClose={() => setSelectedTicket(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}