-- Create expenses table
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    category TEXT NOT NULL CHECK (category IN ('travel', 'meals', 'office_supplies', 'software', 'hardware', 'training', 'other')),
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    date DATE NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'reimbursed')) DEFAULT 'pending',
    receipt_url TEXT,
    notes TEXT,
    approved_by UUID REFERENCES employees(id),
    approved_at TIMESTAMPTZ,
    reimbursed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_expenses_employee ON expenses(employee_id);
CREATE INDEX idx_expenses_status ON expenses(status);
CREATE INDEX idx_expenses_date ON expenses(date);
CREATE INDEX idx_expenses_category ON expenses(category);

-- Create trigger for updated_at
CREATE TRIGGER set_expenses_updated_at
    BEFORE UPDATE ON expenses
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- Row Level Security (RLS) policies
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Policy for viewing expenses
CREATE POLICY "View expenses"
    ON expenses FOR SELECT
    TO authenticated
    USING (
        employee_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM employees e1
            JOIN employees e2 ON e1.department = e2.department
            WHERE e1.id = expenses.employee_id
            AND e2.id = auth.uid()
            AND e2.role IN ('Manager', 'Director', 'VP')
        )
        OR EXISTS (
            SELECT 1 FROM employees
            WHERE id = auth.uid()
            AND role IN ('HR Manager', 'Admin', 'Finance Manager')
        )
    );

-- Policy for creating expenses
CREATE POLICY "Create expenses"
    ON expenses FOR INSERT
    TO authenticated
    WITH CHECK (employee_id = auth.uid());

-- Policy for updating expenses
CREATE POLICY "Update expenses"
    ON expenses FOR UPDATE
    TO authenticated
    USING (
        (employee_id = auth.uid() AND status = 'pending')
        OR EXISTS (
            SELECT 1 FROM employees e1
            JOIN employees e2 ON e1.department = e2.department
            WHERE e1.id = expenses.employee_id
            AND e2.id = auth.uid()
            AND e2.role IN ('Manager', 'Director', 'VP')
        )
        OR EXISTS (
            SELECT 1 FROM employees
            WHERE id = auth.uid()
            AND role IN ('HR Manager', 'Admin', 'Finance Manager')
        )
    );