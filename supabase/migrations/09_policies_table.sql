-- Create policies table for company policy documents
CREATE TABLE company_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    document_url TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('hr', 'it', 'finance', 'security', 'general', 'compliance')),
    version TEXT NOT NULL,
    effective_date DATE NOT NULL,
    created_by UUID NOT NULL REFERENCES employees(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_policies_category ON company_policies(category);
CREATE INDEX idx_policies_effective_date ON company_policies(effective_date);

-- Create trigger for updated_at
CREATE TRIGGER set_policies_updated_at
    BEFORE UPDATE ON company_policies
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- Row Level Security (RLS) policies
ALTER TABLE company_policies ENABLE ROW LEVEL SECURITY;

-- Policy for viewing policies (all authenticated users can view)
CREATE POLICY "View policies"
    ON company_policies FOR SELECT
    TO authenticated
    USING (true);

-- Policy for managing policies (only HR and admins can manage)
CREATE POLICY "Manage policies"
    ON company_policies FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM employee_roles er
            JOIN roles r ON er.role_id = r.id
            WHERE er.employee_id = auth.uid()
            AND r.permissions ? 'manage_employees'
        )
    );