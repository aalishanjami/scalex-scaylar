export interface Policy {
  id: string;
  title: string;
  description: string;
  document_url: string;
  category: PolicyCategory;
  version: string;
  effective_date: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export type PolicyCategory = 
  | 'hr'
  | 'it'
  | 'finance'
  | 'security'
  | 'general'
  | 'compliance';