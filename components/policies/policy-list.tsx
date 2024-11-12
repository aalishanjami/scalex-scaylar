"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { Download, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Policy, PolicyCategory } from "@/lib/types/policy";

interface PolicyListProps {
  searchTerm: string;
  categoryFilter: PolicyCategory | null;
}

export function PolicyList({ searchTerm, categoryFilter }: PolicyListProps) {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const supabase = createClient();

  const fetchPolicies = async () => {
    try {
      let query = supabase
        .from('company_policies')
        .select(`
          *,
          creator:employees!company_policies_created_by_fkey (
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false });

      if (categoryFilter) {
        query = query.eq('category', categoryFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPolicies(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch policies",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, [categoryFilter]);

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('policies_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'company_policies',
        },
        () => {
          fetchPolicies();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [categoryFilter]);

  const filteredPolicies = policies.filter((policy) =>
    policy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {filteredPolicies.map((policy) => (
        <Card key={policy.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{policy.title}</CardTitle>
                <CardDescription className="mt-2">
                  Version {policy.version}
                </CardDescription>
              </div>
              <Badge>{policy.category}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {policy.description}
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Effective Date:</span>
                  <span>{format(new Date(policy.effective_date), 'PP')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Uploaded by:</span>
                  <span>
                    {policy.creator.first_name} {policy.creator.last_name}
                  </span>
                </div>
              </div>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => window.open(policy.document_url, '_blank')}
              >
                <FileText className="mr-2 h-4 w-4" />
                View Document
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      {filteredPolicies.length === 0 && (
        <div className="col-span-full text-center text-muted-foreground">
          No policies found
        </div>
      )}
    </div>
  );
}