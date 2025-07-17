-- Mettre à jour la table equipements
ALTER TABLE equipements
ADD COLUMN IF NOT EXISTS serial_number VARCHAR(255),
ADD COLUMN IF NOT EXISTS supplier VARCHAR(255),
ADD COLUMN IF NOT EXISTS warranty_end_date DATE,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Mettre à jour la table documents
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS logbook_entry_id INTEGER REFERENCES logbook_entries(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS access_request_id INTEGER REFERENCES access_requests(id) ON DELETE SET NULL;

-- Créer la table notifications
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mettre à jour la table users
ALTER TABLE users
ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(255);
