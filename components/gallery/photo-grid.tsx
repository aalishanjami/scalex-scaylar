"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PhotoView } from "./photo-view";
import type { EventPhoto } from "@/lib/types/gallery";

interface PhotoGridProps {
  eventId: string;
}

export function PhotoGrid({ eventId }: PhotoGridProps) {
  const [photos, setPhotos] = useState<EventPhoto[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<EventPhoto | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const supabase = createClient();

  const fetchPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from("event_photos")
        .select(
          `
          *,
          uploader:employees!event_photos_uploaded_by_fkey (
            first_name,
            last_name
          )
        `
        )
        .eq("event_id", eventId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch photos",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("event_photos_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "event_photos",
          filter: `event_id=eq.${eventId}`,
        },
        () => {
          fetchPhotos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="relative aspect-square cursor-pointer overflow-hidden rounded-lg"
            onClick={() => setSelectedPhoto(photo)}
          >
            <img
              src={photo.url}
              alt={photo.caption || "Event photo"}
              className="h-full w-full object-cover transition-transform hover:scale-110"
            />
            {photo.caption && (
              <div className="absolute inset-x-0 bottom-0 bg-black/50 p-2">
                <p className="text-sm text-white line-clamp-2">
                  {photo.caption}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      <Dialog
        open={!!selectedPhoto}
        onOpenChange={() => setSelectedPhoto(null)}
      >
        <DialogContent className="max-w-4xl">
          {selectedPhoto && (
            <PhotoView
              photo={selectedPhoto}
              onClose={() => setSelectedPhoto(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
