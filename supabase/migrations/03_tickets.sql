-- Create tickets table
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('leave', 'expense', 'it_support', 'hr', 'task', 'other')),
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT NOT NULL CHECK (status IN ('open', 'in_progress', 'pending', 'resolved', 'closed')),
    created_by UUID NOT NULL REFERENCES employees(id),
    assigned_to UUID REFERENCES employees(id),
    department TEXT,
    due_date DATE,
    attachments JSONB[] DEFAULT '{}',
    comments JSONB[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_tickets_created_by ON tickets(created_by);
CREATE INDEX idx_tickets_assigned_to ON tickets(assigned_to);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_type ON tickets(type);
CREATE INDEX idx_tickets_priority ON tickets(priority);

-- Create trigger for updated_at
CREATE TRIGGER set_tickets_updated_at
    BEFORE UPDATE ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- Row Level Security (RLS) policies
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Policy for viewing tickets
CREATE POLICY "View tickets"
    ON tickets FOR SELECT
    TO authenticated
    USING (
        created_by = auth.uid()
        OR assigned_to = auth.uid()
        OR department IN (
            SELECT department FROM employees WHERE id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM employees
            WHERE auth.uid() = id
            AND (role = 'HR Manager' OR role = 'Admin' OR role = 'Manager')
        )
    );

-- Policy for creating tickets
CREATE POLICY "Create tickets"
    ON tickets FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Policy for updating tickets
CREATE POLICY "Update tickets"
    ON tickets FOR UPDATE
    TO authenticated
    USING (
        created_by = auth.uid()
        OR assigned_to = auth.uid()
        OR EXISTS (
            SELECT 1 FROM employees
            WHERE auth.uid() = id
            AND (role = 'HR Manager' OR role = 'Admin' OR role = 'Manager')
        )
    );