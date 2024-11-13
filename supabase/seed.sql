-- Insert default departments
INSERT INTO departments (id, name, description)
VALUES 
  ('8b021e62-c338-44dd-980e-2135e716f863', 'Board', 'Executive leadership and strategic direction'),
  ('d1f7f661-89d4-4d1c-b0f3-e6c0d686c557', 'Engineering', 'Software development and technical operations'),
  ('a2b3c4d5-e6f7-8g9h-i0j1-k2l3m4n5o6p7', 'Marketing', 'Brand management and marketing operations'),
  ('b3c4d5e6-f7g8-h9i0-j1k2-l3m4n5o6p7q8', 'Sales', 'Sales and business development'),
  ('c4d5e6f7-g8h9-i0j1-k2l3-m4n5o6p7q8r9', 'Human Resources', 'Employee management and recruitment'),
  ('d5e6f7g8-h9i0-j1k2-l3m4-n5o6p7q8r9s0', 'Finance', 'Financial planning and accounting'),
  ('e6f7g8h9-i0j1-k2l3-m4n5-o6p7q8r9s0t1', 'Operations', 'Business operations and logistics')
ON CONFLICT (id) DO NOTHING;

-- Create the user in auth.users
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmation_sent_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data
) VALUES (
  '8b021e62-c338-44dd-980e-2135e716f863',
  'aalishanj1@gmail.com',
  crypt('password123', gen_salt('bf')),
  now(),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}'
) ON CONFLICT (id) DO NOTHING;

-- Create the employee record
INSERT INTO employees (
  id,
  email,
  first_name,
  last_name,
  department_id,
  role,
  status,
  date_of_joining,
  employee_id,
  phone,
  address,
  emergency_contact,
  salary
) VALUES (
  '8b021e62-c338-44dd-980e-2135e716f863',
  'aalishanj1@gmail.com',
  'Aalishan',
  'Jami',
  '8b021e62-c338-44dd-980e-2135e716f863',
  'CXO',
  'active',
  CURRENT_DATE,
  'EMP001',
  '+1234567890',
  '123 Main St, City, Country',
  '{
    "name": "Emergency Contact",
    "relationship": "Family",
    "phone": "+1234567890"
  }',
  '{
    "amount": 150000,
    "currency": "USD",
    "effective_date": "2024-01-01"
  }'
) ON CONFLICT (id) DO NOTHING;

-- Ensure the C-Level role exists
INSERT INTO roles (id, name, description, permissions)
VALUES (
  'c1b21e62-c338-44dd-980e-2135e716f864',
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
) ON CONFLICT (name) DO UPDATE SET permissions = EXCLUDED.permissions;

-- Assign the C-Level role to Aalishan
INSERT INTO employee_roles (employee_id, role_id)
VALUES (
  '8b021e62-c338-44dd-980e-2135e716f863',
  (SELECT id FROM roles WHERE name = 'C-Level')
) ON CONFLICT (employee_id, role_id) DO NOTHING;

-- Set Aalishan as the manager of the Board department
UPDATE departments 
SET manager_id = '8b021e62-c338-44dd-980e-2135e716f863'
WHERE name = 'Board';

-- Insert default payroll items
INSERT INTO payroll_items (name, type, description, is_percentage, is_taxable)
VALUES 
  ('Basic Salary', 'earning', 'Base salary', false, true),
  ('Housing Allowance', 'earning', 'Housing allowance', false, true),
  ('Transport Allowance', 'earning', 'Transport allowance', false, true),
  ('Overtime', 'earning', 'Overtime payment', false, true),
  ('Bonus', 'earning', 'Performance bonus', false, true),
  ('Income Tax', 'deduction', 'Income tax deduction', true, false),
  ('Insurance', 'deduction', 'Health insurance premium', false, false),
  ('Pension', 'deduction', 'Pension contribution', true, false)
ON CONFLICT (name) DO NOTHING;

-- Add payroll items for Aalishan
INSERT INTO employee_payroll_items (
  employee_id,
  payroll_item_id,
  amount
)
SELECT 
  '8b021e62-c338-44dd-980e-2135e716f863',
  id,
  CASE 
    WHEN name = 'Basic Salary' THEN 150000
    WHEN name = 'Housing Allowance' THEN 30000
    WHEN name = 'Transport Allowance' THEN 12000
    WHEN name = 'Income Tax' THEN 30
    WHEN name = 'Insurance' THEN 5000
    WHEN name = 'Pension' THEN 10
    ELSE 0
  END
FROM payroll_items
ON CONFLICT (employee_id, payroll_item_id) DO NOTHING;

-- Insert some sample policies
INSERT INTO company_policies (
  title,
  description,
  document_url,
  category,
  version,
  effective_date,
  created_by
) VALUES 
  (
    'Code of Conduct',
    'Company-wide code of conduct and ethics policy',
    'https://example.com/policies/code-of-conduct.pdf',
    'general',
    '1.0',
    CURRENT_DATE,
    '8b021e62-c338-44dd-980e-2135e716f863'
  ),
  (
    'Remote Work Policy',
    'Guidelines for remote work arrangements',
    'https://example.com/policies/remote-work.pdf',
    'hr',
    '1.0',
    CURRENT_DATE,
    '8b021e62-c338-44dd-980e-2135e716f863'
  )
ON CONFLICT DO NOTHING;

-- Insert sample events
INSERT INTO events (
  title,
  description,
  date,
  location,
  cover_image,
  created_by
) VALUES 
  (
    'Company Anniversary Celebration',
    'Join us for our annual company anniversary celebration',
    CURRENT_DATE + INTERVAL '30 days',
    'Main Office',
    'https://example.com/images/anniversary.jpg',
    '8b021e62-c338-44dd-980e-2135e716f863'
  ),
  (
    'Team Building Workshop',
    'A day of team building activities and workshops',
    CURRENT_DATE + INTERVAL '14 days',
    'Conference Center',
    'https://example.com/images/team-building.jpg',
    '8b021e62-c338-44dd-980e-2135e716f863'
  )
ON CONFLICT DO NOTHING;

-- Insert sample tickets
INSERT INTO tickets (
  title,
  description,
  type,
  priority,
  status,
  created_by,
  department_id,
  due_date
) VALUES 
  (
    'Update Employee Handbook',
    'Review and update the employee handbook for 2024',
    'task',
    'medium',
    'open',
    '8b021e62-c338-44dd-980e-2135e716f863',
    (SELECT id FROM departments WHERE name = 'Human Resources'),
    CURRENT_DATE + INTERVAL '30 days'
  ),
  (
    'Quarterly Budget Review',
    'Prepare and review Q1 2024 budget reports',
    'task',
    'high',
    'open',
    '8b021e62-c338-44dd-980e-2135e716f863',
    (SELECT id FROM departments WHERE name = 'Finance'),
    CURRENT_DATE + INTERVAL '7 days'
  )
ON CONFLICT DO NOTHING;