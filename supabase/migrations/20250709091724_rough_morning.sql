/*
  # Correction du schéma pour la main courante

  1. Nouvelles colonnes pour logbook_entries
    - Ajout des colonnes manquantes pour event_type, priority, location, status, updated_at
  
  2. Nouvelles tables
    - logbook_actions pour les actions sur les entrées
    - video_bookmarks pour les signets vidéo
  
  3. Index et triggers
    - Index pour les performances
    - Triggers pour updated_at
*/

-- Ajouter les colonnes manquantes à logbook_entries si elles n'existent pas
DO $$
BEGIN
  -- Ajouter event_type si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'logbook_entries' AND column_name = 'event_type'
  ) THEN
    ALTER TABLE logbook_entries ADD COLUMN event_type VARCHAR(255) NOT NULL DEFAULT 'Observation';
  END IF;

  -- Ajouter priority si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'logbook_entries' AND column_name = 'priority'
  ) THEN
    ALTER TABLE logbook_entries ADD COLUMN priority VARCHAR(50) CHECK (priority IN ('low', 'medium', 'high', 'critical')) NOT NULL DEFAULT 'medium';
  END IF;

  -- Ajouter location si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'logbook_entries' AND column_name = 'location'
  ) THEN
    ALTER TABLE logbook_entries ADD COLUMN location TEXT;
  END IF;

  -- Ajouter status si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'logbook_entries' AND column_name = 'status'
  ) THEN
    ALTER TABLE logbook_entries ADD COLUMN status VARCHAR(50) CHECK (status IN ('new', 'in_progress', 'closed', 'awaiting_requisition')) NOT NULL DEFAULT 'new';
  END IF;

  -- Ajouter updated_at si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'logbook_entries' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE logbook_entries ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Créer la table logbook_actions si elle n'existe pas
CREATE TABLE IF NOT EXISTS logbook_actions (
    id SERIAL PRIMARY KEY,
    logbook_entry_id INTEGER REFERENCES logbook_entries(id) ON DELETE CASCADE,
    action_type VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    user_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer la table video_bookmarks si elle n'existe pas
CREATE TABLE IF NOT EXISTS video_bookmarks (
    id SERIAL PRIMARY KEY,
    logbook_entry_id INTEGER REFERENCES logbook_entries(id) ON DELETE CASCADE,
    equipment_id UUID REFERENCES equipements(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer les index pour les nouvelles colonnes et tables
CREATE INDEX IF NOT EXISTS idx_logbook_entries_priority ON logbook_entries(priority);
CREATE INDEX IF NOT EXISTS idx_logbook_entries_status ON logbook_entries(status);
CREATE INDEX IF NOT EXISTS idx_logbook_entries_event_type ON logbook_entries(event_type);
CREATE INDEX IF NOT EXISTS idx_logbook_actions_logbook_entry_id ON logbook_actions(logbook_entry_id);
CREATE INDEX IF NOT EXISTS idx_logbook_actions_timestamp ON logbook_actions(timestamp);
CREATE INDEX IF NOT EXISTS idx_video_bookmarks_logbook_entry_id ON video_bookmarks(logbook_entry_id);
CREATE INDEX IF NOT EXISTS idx_video_bookmarks_equipment_id ON video_bookmarks(equipment_id);
CREATE INDEX IF NOT EXISTS idx_video_bookmarks_time_range ON video_bookmarks(start_time, end_time);

-- Créer le trigger pour updated_at sur logbook_entries si il n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_logbook_entries_updated_at'
  ) THEN
    CREATE TRIGGER update_logbook_entries_updated_at 
    BEFORE UPDATE ON logbook_entries 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Insérer quelques données de test pour la main courante
INSERT INTO logbook_entries (
  timestamp, 
  type, 
  description, 
  user_id, 
  equipment_id, 
  is_judicial_requisition,
  event_type,
  priority,
  location,
  status
) VALUES 
(
  NOW() - INTERVAL '2 hours',
  'incident',
  'Incident de vol signalé dans le secteur nord. Individu suspect observé près du parking.',
  (SELECT id FROM users LIMIT 1),
  (SELECT id FROM equipements WHERE type = 'camera' LIMIT 1),
  false,
  'Vol',
  'high',
  'Secteur Nord - Parking Principal',
  'in_progress'
),
(
  NOW() - INTERVAL '4 hours',
  'observation',
  'Surveillance de routine - Rassemblement pacifique place centrale.',
  (SELECT id FROM users LIMIT 1),
  (SELECT id FROM equipements WHERE type = 'camera' OFFSET 1 LIMIT 1),
  false,
  'Rassemblement',
  'medium',
  'Place Centrale',
  'closed'
),
(
  NOW() - INTERVAL '1 day',
  'requisition',
  'Demande de réquisition judiciaire pour extraction vidéo suite à agression.',
  (SELECT id FROM users LIMIT 1),
  (SELECT id FROM equipements WHERE type = 'camera' OFFSET 2 LIMIT 1),
  true,
  'Agression',
  'critical',
  'Rue de la République',
  'awaiting_requisition'
)
ON CONFLICT DO NOTHING;

-- Insérer quelques actions de test
INSERT INTO logbook_actions (
  logbook_entry_id,
  action_type,
  description,
  timestamp,
  user_id
) VALUES 
(
  (SELECT id FROM logbook_entries ORDER BY created_at DESC LIMIT 1),
  'Appel Police Nationale',
  'Contact établi avec la Police Nationale - Patrouille en route',
  NOW() - INTERVAL '1 hour 30 minutes',
  (SELECT id FROM users LIMIT 1)
),
(
  (SELECT id FROM logbook_entries ORDER BY created_at DESC LIMIT 1),
  'Simple surveillance',
  'Surveillance continue de la zone - Suspect toujours présent',
  NOW() - INTERVAL '1 hour',
  (SELECT id FROM users LIMIT 1)
)
ON CONFLICT DO NOTHING;

-- Insérer quelques bookmarks vidéo de test
INSERT INTO video_bookmarks (
  logbook_entry_id,
  equipment_id,
  start_time,
  end_time,
  description
) VALUES 
(
  (SELECT id FROM logbook_entries ORDER BY created_at DESC LIMIT 1),
  (SELECT id FROM equipements WHERE type = 'camera' LIMIT 1),
  NOW() - INTERVAL '2 hours 2 minutes',
  NOW() - INTERVAL '1 hour 55 minutes',
  'Séquence automatique - Début incident'
)
ON CONFLICT DO NOTHING;