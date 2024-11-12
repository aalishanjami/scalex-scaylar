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

-- Create index for faster queries
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_attendance_employee ON attendance(employee_id);

-- Create trigger for updated_at
CREATE TRIGGER set_attendance_updated_at
    BEFORE UPDATE ON attendance
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- Row Level Security (RLS) policies
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Policy for viewing attendance (users can view their own attendance and HR/Admin can view all)
CREATE POLICY "View attendance"
    ON attendance FOR SELECT
    TO authenticated
    USING (
        employee_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM employees
            WHERE auth.uid() = id
            AND (role = 'HR Manager' OR role = 'Admin')
        )
    );

-- Policy for marking attendance (users can only mark their own attendance)
CREATE POLICY "Mark attendance"
    ON attendance FOR INSERT
    TO authenticated
    WITH CHECK (employee_id = auth.uid());

-- Policy for updating attendance (users can update their own attendance of the same day, HR/Admin can update any)
CREATE POLICY "Update attendance"
    ON attendance FOR UPDATE
    TO authenticated
    USING (
        (employee_id = auth.uid() AND date = CURRENT_DATE)
        OR EXISTS (
            SELECT 1 FROM employees
            WHERE auth.uid() = id
            AND (role = 'HR Manager' OR role = 'Admin')
        )
    );