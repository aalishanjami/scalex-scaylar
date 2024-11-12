-- Create events table
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    location TEXT NOT NULL,
    cover_image TEXT NOT NULL,
    created_by UUID NOT NULL REFERENCES employees(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create event photos table
CREATE TABLE event_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    caption TEXT,
    uploaded_by UUID NOT NULL REFERENCES employees(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create event comments table
CREATE TABLE event_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    photo_id UUID REFERENCES event_photos(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES employees(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create event reactions table
CREATE TABLE event_reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    photo_id UUID REFERENCES event_photos(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES employees(id),
    type TEXT NOT NULL CHECK (type IN ('👍', '❤️', '😊', '🎉', '👏')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(event_id, photo_id, user_id)
);

-- Create indexes
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_event_photos_event ON event_photos(event_id);
CREATE INDEX idx_event_comments_event ON event_comments(event_id);
CREATE INDEX idx_event_comments_photo ON event_comments(photo_id);
CREATE INDEX idx_event_reactions_event ON event_reactions(event_id);
CREATE INDEX idx_event_reactions_photo ON event_reactions(photo_id);

-- Create trigger for updated_at
CREATE TRIGGER set_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- Row Level Security (RLS) policies
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_reactions ENABLE ROW LEVEL SECURITY;

-- Policies for events
CREATE POLICY "View events"
    ON events FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Manage events"
    ON events FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM employee_roles er
            JOIN roles r ON er.role_id = r.id
            WHERE er.employee_id = auth.uid()
            AND r.permissions ? 'manage_employees'
        )
    );

-- Policies for photos
CREATE POLICY "View photos"
    ON event_photos FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Upload photos"
    ON event_photos FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM employee_roles er
            JOIN roles r ON er.role_id = r.id
            WHERE er.employee_id = auth.uid()
            AND r.permissions ? 'manage_employees'
        )
    );

-- Policies for comments
CREATE POLICY "View comments"
    ON event_comments FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Add comments"
    ON event_comments FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Manage own comments"
    ON event_comments FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

-- Policies for reactions
CREATE POLICY "View reactions"
    ON event_reactions FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Manage own reactions"
    ON event_reactions FOR ALL
    TO authenticated
    USING (auth.uid() = user_id);