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

-- Create indexes
CREATE INDEX idx_employee_roles_employee ON employee_roles(employee_id);
CREATE INDEX idx_employee_roles_role ON employee_roles(role_id);

-- Insert default roles with their permissions
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

-- Add RLS policies
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_roles ENABLE ROW LEVEL SECURITY;

-- Policies for roles table
CREATE POLICY "View roles"
    ON roles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Manage roles"
    ON roles FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM employee_roles er
            JOIN roles r ON er.role_id = r.id
            WHERE er.employee_id = auth.uid()
            AND r.name IN ('C-Level', 'HR')
        )
    );

-- Policies for employee_roles table
CREATE POLICY "View employee roles"
    ON employee_roles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Manage employee roles"
    ON employee_roles FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM employee_roles er
            JOIN roles r ON er.role_id = r.id
            WHERE er.employee_id = auth.uid()
            AND r.name IN ('C-Level', 'HR')
        )
    );

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