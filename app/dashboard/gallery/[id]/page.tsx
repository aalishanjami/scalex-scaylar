"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PhotoGrid } from "@/components/gallery/photo-grid";
import { UploadPhotosForm } from "@/components/gallery/upload-photos-form";
import { EventDetails } from "@/components/gallery/event-details";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Restricted } from "@/components/layout/restricted";
import type { Event } from "@/lib/types/gallery";

export default function EventPage() {
  const params = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const supabase = createClient();

  const fetchEvent = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select(
          `
          *,
          creator:employees!events_created_by_fkey (
            first_name,
            last_name
          )
        `
        )
        .eq("id", params.id)
        .single();

      if (error) throw error;
      setEvent(data);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch event details",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, []);

  const handleUploadSuccess = () => {
    setShowUploadDialog(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!event) {
    return <div>Event not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <EventDetails event={event} />
        <Restricted permissions={["manage_employees"]}>
          <Button onClick={() => setShowUploadDialog(true)}>
            <Plus className="mr-2 h-4 w-4" /> Upload Photos
          </Button>
        </Restricted>
      </div>

      <PhotoGrid eventId={event.id} />

      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Upload Photos</DialogTitle>
          </DialogHeader>
          <UploadPhotosForm
            eventId={event.id}
            onSuccess={handleUploadSuccess}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
