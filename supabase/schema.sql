-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE employee_status AS ENUM ('active', 'inactive');

-- Create the employees table
CREATE TABLE employees (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    department TEXT NOT NULL,
    role TEXT NOT NULL,
    status employee_status NOT NULL DEFAULT 'active',
    date_of_joining DATE NOT NULL,
    employee_id TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    emergency_contact JSONB NOT NULL,
    salary JSONB NOT NULL,
    documents JSONB[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create roles table
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    permissions JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create employee_roles junction table
CREATE TABLE employee_roles (
    employee_id UUID REFERENCES employees(id),
    role_id UUID REFERENCES roles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (employee_id, role_id)
);

-- Create attendance table
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    date DATE NOT NULL,
    clock_in TIME NOT NULL,
    clock_out TIME,
    status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'half-day')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(employee_id, date)
);

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

-- Create departments table
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    manager_id UUID REFERENCES employees(id),
    budget DECIMAL(12,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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

-- Create payroll_items table
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

-- Create employee_payroll_items table
CREATE TABLE employee_payroll_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    payroll_item_id UUID NOT NULL REFERENCES payroll_items(id),
    amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(employee_id, payroll_item_id)
);

-- Create payroll table
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

-- Create payroll_details table
CREATE TABLE payroll_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payroll_id UUID NOT NULL REFERENCES payroll(id),
    payroll_item_id UUID NOT NULL REFERENCES payroll_items(id),
    amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_employee_id ON employees(employee_id);
CREATE INDEX idx_employee_department ON employees(department);
CREATE INDEX idx_employee_roles_employee ON employee_roles(employee_id);
CREATE INDEX idx_employee_roles_role ON employee_roles(role_id);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_attendance_employee ON attendance(employee_id);
CREATE INDEX idx_tickets_created_by ON tickets(created_by);
CREATE INDEX idx_tickets_assigned_to ON tickets(assigned_to);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_type ON tickets(type);
CREATE INDEX idx_tickets_priority ON tickets(priority);
CREATE INDEX idx_department_name ON departments(name);
CREATE INDEX idx_department_manager ON departments(manager_id);
CREATE INDEX idx_expenses_employee ON expenses(employee_id);
CREATE INDEX idx_expenses_status ON expenses(status);
CREATE INDEX idx_expenses_date ON expenses(date);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_employee_payroll_items ON employee_payroll_items(employee_id);
CREATE INDEX idx_payroll_period ON payroll(period_start, period_end);
CREATE INDEX idx_payroll_status ON payroll(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON employees
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_roles_updated_at
    BEFORE UPDATE ON roles
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_attendance_updated_at
    BEFORE UPDATE ON attendance
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_tickets_updated_at
    BEFORE UPDATE ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_departments_updated_at
    BEFORE UPDATE ON departments
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_expenses_updated_at
    BEFORE UPDATE ON expenses
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

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

-- Function to check if user has permission
CREATE OR REPLACE FUNCTION has_permission(user_id UUID, required_permission TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM employee_roles er
        JOIN roles r ON er.role_id = r.id
        WHERE er.employee_id = user_id
        AND r.permissions ? required_permission
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable Row Level Security
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_payroll_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_details ENABLE ROW LEVEL SECURITY;

-- Insert default roles
INSERT INTO roles (name, description, permissions) VALUES
('C-Level', 'Executive level access', '[
    "view_dashboard",
    "manage_employees",
    "manage_attendance",
    "manage_departments",
    "manage_expenses",
    "manage_payroll",
    "manage_tickets",
    "assign_roles"
]'),
('HR', 'Human Resources access', '[
    "view_dashboard",
    "manage_employees",
    "manage_attendance",
    "view_payroll",
    "view_departments"
]'),
('Finance', 'Finance department access', '[
    "view_dashboard",
    "manage_expenses",
    "manage_payroll",
    "view_departments"
]'),
('Manager', 'Department manager access', '[
    "view_dashboard",
    "view_employees",
    "mark_attendance",
    "manage_tickets",
    "view_departments"
]'),
('Engineer', 'Engineering department access', '[
    "view_dashboard",
    "mark_attendance",
    "manage_tickets"
]'),
('Designer', 'Design department access', '[
    "view_dashboard",
    "mark_attendance",
    "manage_tickets"
]'),
('Employee', 'Basic employee access', '[
    "view_dashboard",
    "mark_attendance",
    "create_tickets",
    "view_own_tickets"
]');

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

-- Insert default departments
INSERT INTO departments (name, description, budget) VALUES
('Engineering', 'Software development and technical operations', 1000000),
('Marketing', 'Brand management and marketing operations', 500000),
('Sales', 'Sales and business development', 750000),
('Human Resources', 'Employee management and recruitment', 300000),
('Finance', 'Financial planning and accounting', 400000),
('Operations', 'Business operations and logistics', 600000);