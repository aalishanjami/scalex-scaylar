-- Create payroll_items table to store different types of earnings and deductions
CREATE TABLE payroll_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('earning', 'deduction')),
    description TEXT,
    is_percentage BOOLEAN DEFAULT false,
    is_taxable BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create employee_payroll_items to store employee-specific payroll items
CREATE TABLE employee_payroll_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    payroll_item_id UUID NOT NULL REFERENCES payroll_items(id),
    amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(employee_id, payroll_item_id)
);

-- Create payroll table to store monthly payroll records
CREATE TABLE payroll (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    base_salary DECIMAL(10,2) NOT NULL,
    total_earnings DECIMAL(10,2) NOT NULL,
    total_deductions DECIMAL(10,2) NOT NULL,
    net_salary DECIMAL(10,2) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('draft', 'approved', 'paid')) DEFAULT 'draft',
    payment_date DATE,
    payment_method TEXT,
    notes TEXT,
    created_by UUID NOT NULL REFERENCES employees(id),
    approved_by UUID REFERENCES employees(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create payroll_details to store itemized earnings and deductions
CREATE TABLE payroll_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payroll_id UUID NOT NULL REFERENCES payroll(id),
    payroll_item_id UUID NOT NULL REFERENCES payroll_items(id),
    amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_employee_payroll ON payroll(employee_id);
CREATE INDEX idx_payroll_period ON payroll(period_start, period_end);
CREATE INDEX idx_payroll_status ON payroll(status);
CREATE INDEX idx_employee_payroll_items ON employee_payroll_items(employee_id);

-- Create triggers for updated_at
CREATE TRIGGER set_payroll_updated_at
    BEFORE UPDATE ON payroll
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_payroll_items_updated_at
    BEFORE UPDATE ON payroll_items
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_employee_payroll_items_updated_at
    BEFORE UPDATE ON employee_payroll_items
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- Row Level Security (RLS) policies
ALTER TABLE payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_payroll_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_details ENABLE ROW LEVEL SECURITY;

-- Policies for payroll
CREATE POLICY "View own payroll"
    ON payroll FOR SELECT
    TO authenticated
    USING (
        employee_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM employees
            WHERE auth.uid() = id
            AND (role = 'HR Manager' OR role = 'Admin' OR role = 'Finance Manager')
        )
    );

CREATE POLICY "Create payroll"
    ON payroll FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM employees
            WHERE auth.uid() = id
            AND (role = 'HR Manager' OR role = 'Admin' OR role = 'Finance Manager')
        )
    );

CREATE POLICY "Update payroll"
    ON payroll FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM employees
            WHERE auth.uid() = id
            AND (role = 'HR Manager' OR role = 'Admin' OR role = 'Finance Manager')
        )
    );

-- Insert default payroll items
INSERT INTO payroll_items (name, type, description, is_percentage, is_taxable) VALUES
('Basic Salary', 'earning', 'Base salary', false, true),
('Housing Allowance', 'earning', 'Housing allowance', false, true),
('Transport Allowance', 'earning', 'Transport allowance', false, true),
('Overtime', 'earning', 'Overtime payment', false, true),
('Bonus', 'earning', 'Performance bonus', false, true),
('Income Tax', 'deduction', 'Income tax deduction', true, false),
('Insurance', 'deduction', 'Health insurance premium', false, false),
('Pension', 'deduction', 'Pension contribution', true, false);