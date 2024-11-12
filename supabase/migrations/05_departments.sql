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

-- Add department_id to employees table
ALTER TABLE employees
ADD COLUMN department_id UUID REFERENCES departments(id);

-- Create indexes
CREATE INDEX idx_department_name ON departments(name);
CREATE INDEX idx_department_manager ON departments(manager_id);
CREATE INDEX idx_employee_department ON employees(department_id);

-- Create trigger for updated_at
CREATE TRIGGER set_departments_updated_at
    BEFORE UPDATE ON departments
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- Row Level Security (RLS) policies
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

-- Policy for viewing departments
CREATE POLICY "View departments"
    ON departments FOR SELECT
    TO authenticated
    USING (true);

-- Policy for creating/updating departments
CREATE POLICY "Manage departments"
    ON departments FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM employees
            WHERE auth.uid() = id
            AND (role = 'HR Manager' OR role = 'Admin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM employees
            WHERE auth.uid() = id
            AND (role = 'HR Manager' OR role = 'Admin')
        )
    );

-- Insert default departments
INSERT INTO departments (name, description, budget) VALUES
('Engineering', 'Software development and technical operations', 1000000),
('Marketing', 'Brand management and marketing operations', 500000),
('Sales', 'Sales and business development', 750000),
('Human Resources', 'Employee management and recruitment', 300000),
('Finance', 'Financial planning and accounting', 400000),
('Operations', 'Business operations and logistics', 600000);