"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, X } from "lucide-react";
import type {
  EventPhoto,
  EventComment,
  EventReaction,
  ReactionType,
} from "@/lib/types/gallery";

interface PhotoViewProps {
  photo: EventPhoto;
  onClose: () => void;
}

const reactionTypes: ReactionType[] = ["👍", "❤️", "😊", "🎉", "👏"];

export function PhotoView({ photo, onClose }: PhotoViewProps) {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<EventComment[]>([]);
  const [reactions, setReactions] = useState<EventReaction[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from("event_comments")
        .select(
          `
          *,
          user:employees!event_comments_user_id_fkey (
            first_name,
            last_name
          )
        `
        )
        .eq("photo_id", photo.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const fetchReactions = async () => {
    try {
      const { data, error } = await supabase
        .from("event_reactions")
        .select("*")
        .eq("photo_id", photo.id);

      if (error) throw error;
      setReactions(data || []);
    } catch (error) {
      console.error("Error fetching reactions:", error);
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("event_comments").insert({
        photo_id: photo.id,
        event_id: photo.event_id,
        content: comment,
        user_id: (await supabase.auth.getUser()).data.user?.id,
      });

      if (error) throw error;

      setComment("");
      fetchComments();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add comment",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReaction = async (type: ReactionType) => {
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      const existingReaction = reactions.find((r) => r.user_id === userId);

      if (existingReaction) {
        if (existingReaction.type === type) {
          // Remove reaction
          await supabase
            .from("event_reactions")
            .delete()
            .eq("id", existingReaction.id);
        } else {
          // Update reaction
          await supabase
            .from("event_reactions")
            .update({ type })
            .eq("id", existingReaction.id);
        }
      } else {
        // Add new reaction
        await supabase.from("event_reactions").insert({
          photo_id: photo.id,
          event_id: photo.event_id,
          user_id: userId,
          type,
        });
      }

      fetchReactions();
    } catch (error) {
      console.error("Error handling reaction:", error);
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="relative">
        <img
          src={photo.url}
          alt={photo.caption || "Event photo"}
          className="rounded-lg"
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {photo.caption && (
          <p className="text-lg font-medium">{photo.caption}</p>
        )}

        <div className="flex gap-2">
          {reactionTypes.map((type) => (
            <Button
              key={type}
              variant="outline"
              size="sm"
              onClick={() => handleReaction(type)}
            >
              {type}
              <span className="ml-1">
                {reactions.filter((r) => r.type === type).length}
              </span>
            </Button>
          ))}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="text-sm font-medium">Comments</span>
          </div>

          <div className="flex gap-2">
            <Textarea
              placeholder="Add a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <Button onClick={handleAddComment} disabled={loading}>
              Post
            </Button>
          </div>

          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {comments.map((comment) => (
              <div key={comment.id} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {comment.user.first_name} {comment.user.last_name}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(comment.created_at), "PP")}
                  </span>
                </div>
                <p className="text-sm">{comment.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
