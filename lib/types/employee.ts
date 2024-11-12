export interface Employee {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  department: string;
  role: string;
  status: 'active' | 'inactive';
  date_of_joining: string;
  employee_id: string;
  phone: string;
  address: string;
  emergency_contact: {
    name: string;
    relationship: string;
    phone: string;
  };
  documents: {
    type: string;
    url: string;
    uploaded_at: string;
  }[];
  salary: {
    amount: number;
    currency: string;
    effective_date: string;
  };
  created_at: string;
  updated_at: string;
}

export interface CreateEmployeeDTO {
  email: string;
  first_name: string;
  last_name: string;
  department: string;
  role: string;
  password: string;
  date_of_joining: string;
  employee_id: string;
  phone: string;
  address: string;
  emergency_contact: {
    name: string;
    relationship: string;
    phone: string;
  };
  salary: {
    amount: number;
    currency: string;
    effective_date: string;
  };
}