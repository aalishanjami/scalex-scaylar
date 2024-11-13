export const dynamic = "force-dynamic";
export const revalidate = 0;

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EventList } from "@/components/gallery/event-list";
import { CreateEventForm } from "@/components/gallery/create-event-form";
import { EventFilters } from "@/components/gallery/event-filters";
import { Restricted } from "@/components/layout/restricted";

export default function GalleryPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState("");

  const handleCreateSuccess = () => {
    setShowCreateDialog(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Event Gallery</h2>
        <Restricted permissions={["manage_employees"]}>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create Event
          </Button>
        </Restricted>
      </div>

      <EventFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        year={year}
        onYearChange={setYear}
      />

      <EventList searchTerm={searchTerm} year={year} />

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
          </DialogHeader>
          <CreateEventForm onSuccess={handleCreateSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
