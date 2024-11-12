-- First, create the user in auth.users
-- Note: The password will be 'password123' (this is just for development)
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
  '00000000-0000-0000-0000-000000000001', -- Using a fixed UUID for reproducibility
  'aalishanj1@gmail.com',
  crypt('password123', gen_salt('bf')),
  now(),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}'
);

-- Create the employee record
INSERT INTO employees (
  id,
  email,
  first_name,
  last_name,
  department,
  role,
  status,
  date_of_joining,
  employee_id,
  phone,
  address,
  emergency_contact,
  salary
) VALUES (
  '00000000-0000-0000-0000-000000000001', -- Same UUID as auth.users
  'aalishanj1@gmail.com',
  'Aalishan',
  'Jami',
  'Executive',
  'C-Level',
  'active',
  CURRENT_DATE,
  'EMP001',
  '+1234567890', -- Replace with actual phone number
  '123 Main St, City, Country', -- Replace with actual address
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
);

-- Assign the C-Level role
INSERT INTO employee_roles (
  employee_id,
  role_id
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  (SELECT id FROM roles WHERE name = 'C-Level')
);