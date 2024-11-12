import { createClient } from "@/lib/supabase/server";

export async function getTeamMembers(departmentFilter: string | null = null) {
  const supabase = createClient();

  try {
    let query = supabase
      .from('employees')
      .select(`
        *,
        roles:employee_roles (
          role:roles (
            name,
            permissions
          )
        )
      `)
      .eq('status', 'active')
      .order('department')
      .order('first_name');

    if (departmentFilter) {
      query = query.eq('department', departmentFilter);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching team members:', error);
    throw error;
  }
}