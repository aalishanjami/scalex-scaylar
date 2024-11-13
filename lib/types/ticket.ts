export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketStatus = 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed';
export type TicketType = 'leave' | 'expense' | 'it_support' | 'hr' | 'task' | 'other';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  type: TicketType;
  priority: TicketPriority;
  status: TicketStatus;
  created_by: string;
  assigned_to: string | null;
  department_id: string | null;
  due_date: string | null;
  attachments: {
    name: string;
    url: string;
    type: string;
    uploaded_at: string;
  }[];
  comments: {
    id: string;
    user_id: string;
    content: string;
    created_at: string;
  }[];
  created_at: string;
  updated_at: string;
  department?: {
    id: string;
    name: string;
    description: string;
  };
}

export interface CreateTicketDTO {
  title: string;
  description: string;
  type: TicketType;
  priority: TicketPriority;
  assigned_to?: string;
  department_id?: string;
  due_date?: string;
  attachments?: {
    name: string;
    url: string;
    type: string;
  }[];
}