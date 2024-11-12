"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import type { PolicyCategory } from "@/lib/types/policy";

interface PolicyFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  categoryFilter: PolicyCategory | null;
  onCategoryChange: (value: PolicyCategory | null) => void;
}

export function PolicyFilters({
  searchTerm,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
}: PolicyFiltersProps) {
  return (
    <div className="flex gap-4 items-center">
      <div className="relative flex-1">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search policies..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Select
        value={categoryFilter || "all"}
        onValueChange={(value) =>
          onCategoryChange(value === "all" ? null : (value as PolicyCategory))
        }
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          <SelectItem value="hr">HR</SelectItem>
          <SelectItem value="it">IT</SelectItem>
          <SelectItem value="finance">Finance</SelectItem>
          <SelectItem value="security">Security</SelectItem>
          <SelectItem value="general">General</SelectItem>
          <SelectItem value="compliance">Compliance</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}