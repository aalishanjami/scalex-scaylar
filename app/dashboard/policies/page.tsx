"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PolicyList } from "@/components/policies/policy-list";
import { CreatePolicyForm } from "@/components/policies/create-policy-form";
import { PolicyFilters } from "@/components/policies/policy-filters";
import type { PolicyCategory } from "@/lib/types/policy";
import { Restricted } from "@/components/layout/restricted";

export default function PoliciesPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<PolicyCategory | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");

  const handleCreateSuccess = () => {
    setShowCreateDialog(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Company Policies</h2>
        <Restricted permissions={["manage_employees"]}>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" /> Upload Policy
          </Button>
        </Restricted>
      </div>

      <PolicyFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
      />

      <PolicyList searchTerm={searchTerm} categoryFilter={categoryFilter} />

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Upload New Policy</DialogTitle>
          </DialogHeader>
          <CreatePolicyForm onSuccess={handleCreateSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
