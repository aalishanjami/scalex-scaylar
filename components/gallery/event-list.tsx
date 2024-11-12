"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { MapPin, Calendar, Image } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import type { Event } from "@/lib/types/gallery";

interface EventListProps {
  searchTerm: string;
  year: number;
}

export function EventList({ searchTerm, year }: EventListProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClient();

  const fetchEvents = async () => {
    try {
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;

      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          creator:employees!events_created_by_fkey (
            first_name,
            last_name
          ),
          photos:event_photos (count),
          reactions:event_reactions (count)
        `)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch events",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [year]);

  const filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {filteredEvents.map((event) => (
        <Card
          key={event.id}
          className="overflow-hidden cursor-pointer transition-transform hover:scale-[1.02]"
          onClick={() => router.push(`/dashboard/gallery/${event.id}`)}
        >
          <div
            className="h-48 bg-cover bg-center"
            style={{ backgroundImage: `url(${event.cover_image})` }}
          />
          <CardHeader>
            <CardTitle>{event.title}</CardTitle>
            <CardDescription className="line-clamp-2">
              {event.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(event.date), 'PPP')}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Image className="h-4 w-4" />
                <span>{event.photos[0].count} photos</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      {filteredEvents.length === 0 && (
        <div className="col-span-full text-center text-muted-foreground">
          No events found for {year}
        </div>
      )}
    </div>
  );
}