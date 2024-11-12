"use client";

import { format } from "date-fns";
import { MapPin, Calendar } from "lucide-react";
import type { Event } from "@/lib/types/gallery";

interface EventDetailsProps {
  event: Event;
}

export function EventDetails({ event }: EventDetailsProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{event.title}</h2>
        <p className="text-muted-foreground mt-2">{event.description}</p>
      </div>

      <div className="flex gap-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{format(new Date(event.date), "PPP")}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{event.location}</span>
        </div>
      </div>
    </div>
  );
}
