"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MessageSquare, Paperclip } from "lucide-react";
import type { Ticket, TicketStatus } from "@/lib/types/ticket";

interface TicketDetailsProps {
  ticket: Ticket;
  onUpdate: () => void;
  onClose: () => void;
}

export function TicketDetails({ ticket, onUpdate, onClose }: TicketDetailsProps) {
  const [status, setStatus] = useState<TicketStatus>(ticket.status);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  const handleStatusChange = async (newStatus: TicketStatus) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ status: newStatus })
        .eq('id', ticket.id);

      if (error) throw error;

      setStatus(newStatus);
      onUpdate();

      toast({
        title: "Success",
        description: "Ticket status has been updated",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;

    setLoading(true);
    try {
      const user = await supabase.auth.getUser();
      const newComment = {
        id: crypto.randomUUID(),
        user_id: user.data.user?.id,
        content: comment,
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('tickets')
        .update({
          comments: [...ticket.comments, newComment],
        })
        .eq('id', ticket.id);

      if (error) throw error;

      setComment("");
      onUpdate();

      toast({
        title: "Success",
        description: "Comment has been added",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">{ticket.title}</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Created on {format(new Date(ticket.created_at), 'PPp')}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium">Status</p>
          <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <p className="text-sm font-medium">Priority</p>
          <Badge className="mt-2" variant={
            ticket.priority === 'urgent' || ticket.priority === 'high'
              ? 'destructive'
              : ticket.priority === 'medium'
              ? 'default'
              : 'secondary'
          }>
            {ticket.priority}
          </Badge>
        </div>
      </div>

      <div>
        <p className="text-sm font-medium">Description</p>
        <p className="mt-1 text-sm">{ticket.description}</p>
      </div>

      {ticket.due_date && (
        <div>
          <p className="text-sm font-medium">Due Date</p>
          <p className="mt-1 text-sm">
            {format(new Date(ticket.due_date), 'PPP')}
          </p>
        </div>
      )}

      <Separator />

      <div>
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">Comments</h4>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="mt-2 space-y-4">
          {ticket.comments.map((comment) => (
            <div key={comment.id} className="rounded-lg bg-muted p-3">
              <p className="text-sm">{comment.content}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {format(new Date(comment.created_at), 'PPp')}
              </p>
            </div>
          ))}
          <div className="flex gap-2">
            <Textarea
              placeholder="Add a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <Button onClick={handleAddComment} disabled={loading || !comment.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
            </Button>
          </div>
        </div>
      </div>

      {ticket.attachments.length > 0 && (
        <div>
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Attachments</h4>
            <Paperclip className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mt-2 space-y-2">
            {ticket.attachments.map((attachment, index) => (
              <div key={index} className="flex items-center gap-2">
                <Paperclip className="h-4 w-4" />
                <a
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  {attachment.name}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}