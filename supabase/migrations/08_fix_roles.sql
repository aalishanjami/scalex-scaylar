-- First, let's ensure the C-Level role exists with correct permissions
INSERT INTO roles (name, description, permissions)
VALUES (
  'C-Level',
  'Executive level access',
  '[
    "view_dashboard",
    "manage_employees",
    "view_employees",
    "manage_attendance",
    "mark_attendance",
    "manage_departments",
    "view_departments",
    "manage_expenses",
    "manage_payroll",
    "view_payroll",
    "manage_tickets",
    "create_tickets",
    "view_own_tickets",
    "assign_roles"
  ]'
)
ON CONFLICT (name) 
DO UPDATE SET permissions = EXCLUDED.permissions;

-- Now, let's ensure the user has the C-Level role assigned
INSERT INTO employee_roles (employee_id, role_id)
SELECT 
  '00000000-0000-0000-0000-000000000001',
  id
FROM roles 
WHERE name = 'C-Level'
ON CONFLICT (employee_id, role_id) DO NOTHING;