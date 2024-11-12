"use client";

import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ExpenseStatus, ExpenseCategory } from "@/lib/types/expense";

interface ExpenseFiltersProps {
  filters: {
    status: ExpenseStatus | null;
    category: ExpenseCategory | null;
    dateRange: {
      from: Date | null;
      to: Date | null;
    };
  };
  onFilterChange: (filters: {
    status: ExpenseStatus | null;
    category: ExpenseCategory | null;
    dateRange: {
      from: Date | null;
      to: Date | null;
    };
  }) => void;
}

export function ExpenseFilters({ filters, onFilterChange }: ExpenseFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4">
      <Select
        value={filters.status || "all"}
        onValueChange={(value) =>
          onFilterChange({
            ...filters,
            status: value === "all" ? null : (value as ExpenseStatus),
          })
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="approved">Approved</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
          <SelectItem value="reimbursed">Reimbursed</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.category || "all"}
        onValueChange={(value) =>
          onFilterChange({
            ...filters,
            category: value === "all" ? null : (value as ExpenseCategory),
          })
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          <SelectItem value="travel">Travel</SelectItem>
          <SelectItem value="meals">Meals</SelectItem>
          <SelectItem value="office_supplies">Office Supplies</SelectItem>
          <SelectItem value="software">Software</SelectItem>
          <SelectItem value="hardware">Hardware</SelectItem>
          <SelectItem value="training">Training</SelectItem>
          <SelectItem value="other">Other</SelectItem>
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[240px] justify-start text-left font-normal",
              !filters.dateRange.from && !filters.dateRange.to && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {filters.dateRange.from ? (
              filters.dateRange.to ? (
                <>
                  {format(filters.dateRange.from, "LLL dd, y")} -{" "}
                  {format(filters.dateRange.to, "LLL dd, y")}
                </>
              ) : (
                format(filters.dateRange.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={filters.dateRange.from || undefined}
            selected={{
              from: filters.dateRange.from || undefined,
              to: filters.dateRange.to || undefined,
            }}
            onSelect={(range) =>
              onFilterChange({
                ...filters,
                dateRange: {
                  from: range?.from || null,
                  to: range?.to || null,
                },
              })
            }
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );