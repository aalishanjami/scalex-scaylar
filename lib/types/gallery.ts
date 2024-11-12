export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  cover_image: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface EventPhoto {
  id: string;
  event_id: string;
  url: string;
  caption: string;
  uploaded_by: string;
  created_at: string;
}

export interface EventComment {
  id: string;
  event_id: string;
  photo_id: string | null;
  content: string;
  user_id: string;
  created_at: string;
  user: {
    first_name: string;
    last_name: string;
  };
}

export interface EventReaction {
  id: string;
  event_id: string;
  photo_id: string | null;
  user_id: string;
  type: ReactionType;
  created_at: string;
}

export type ReactionType = '👍' | '❤️' | '😊' | '🎉' | '👏';