-- Script de création des tables pour la base de données Sensicity
-- À exécuter dans votre console Supabase SQL Editor

-- Table des rôles
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

-- Insérer les rôles par défaut
INSERT INTO roles (name, description) VALUES 
('Admin', 'Administrateur système avec tous les droits'),
('Opérateur CSU', 'Opérateur du Centre de Supervision Urbaine'),
('DPO', 'Délégué à la Protection des Données'),
('Technicien', 'Technicien de maintenance')
ON CONFLICT (name) DO NOTHING;

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    role_id INTEGER REFERENCES roles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des équipements
CREATE TABLE IF NOT EXISTS equipements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) CHECK (type IN ('camera', 'server', 'switch', 'other')) NOT NULL,
    model VARCHAR(100) NOT NULL,
    status VARCHAR(50) CHECK (status IN ('active', 'maintenance', 'out_of_service')) DEFAULT 'active',
    latitude DECIMAL(9,6) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL,
    installation_date DATE NOT NULL,
    last_maintenance DATE,
    conformity_status VARCHAR(50) CHECK (conformity_status IN ('compliant', 'non_compliant', 'pending')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table de l'historique de maintenance
CREATE TABLE IF NOT EXISTS maintenance_history (
    id SERIAL PRIMARY KEY,
    equipment_id UUID REFERENCES equipements(id) ON DELETE CASCADE,
    maintenance_date TIMESTAMP WITH TIME ZONE NOT NULL,
    description TEXT NOT NULL,
    performed_by VARCHAR(255) NOT NULL,
    cost DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des autorisations
CREATE TABLE IF NOT EXISTS authorizations (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    reference VARCHAR(100) NOT NULL,
    issue_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    description TEXT,
    status VARCHAR(50) CHECK (status IN ('valid', 'expired', 'pending')) DEFAULT 'valid',
    equipment_id UUID REFERENCES equipements(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table de la main courante
CREATE TABLE IF NOT EXISTS logbook_entries (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    type VARCHAR(50) CHECK (type IN ('incident', 'observation', 'requisition')) NOT NULL,
    description TEXT NOT NULL,
    user_id UUID REFERENCES users(id),
    equipment_id UUID REFERENCES equipements(id) ON DELETE SET NULL,
    is_judicial_requisition BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des demandes d'accès RGPD
CREATE TABLE IF NOT EXISTS access_requests (
    id SERIAL PRIMARY KEY,
    request_type VARCHAR(50) CHECK (request_type IN ('access', 'rectification', 'deletion')) NOT NULL,
    requester_name VARCHAR(255) NOT NULL,
    requester_email VARCHAR(255) NOT NULL,
    request_date TIMESTAMP WITH TIME ZONE NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(50) CHECK (status IN ('open', 'in_progress', 'closed', 'refused')) DEFAULT 'open',
    description TEXT NOT NULL,
    response_details TEXT,
    processed_by_user_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des documents
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size INTEGER NOT NULL,
    storage_path VARCHAR(500) NOT NULL,
    version INTEGER DEFAULT 1,
    related_equipment_id UUID REFERENCES equipements(id) ON DELETE SET NULL,
    related_authorization_id INTEGER REFERENCES authorizations(id) ON DELETE SET NULL,
    uploaded_by_user_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table de configuration des dashboards utilisateur
CREATE TABLE IF NOT EXISTS user_dashboard_configs (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    config_json JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Table des logs d'audit
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    details TEXT NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_equipements_type ON equipements(type);
CREATE INDEX IF NOT EXISTS idx_equipements_status ON equipements(status);
CREATE INDEX IF NOT EXISTS idx_equipements_conformity_status ON equipements(conformity_status);
CREATE INDEX IF NOT EXISTS idx_equipements_location ON equipements(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_maintenance_history_equipment_id ON maintenance_history(equipment_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_history_date ON maintenance_history(maintenance_date);
CREATE INDEX IF NOT EXISTS idx_authorizations_expiry_date ON authorizations(expiry_date);
CREATE INDEX IF NOT EXISTS idx_authorizations_status ON authorizations(status);
CREATE INDEX IF NOT EXISTS idx_logbook_entries_timestamp ON logbook_entries(timestamp);
CREATE INDEX IF NOT EXISTS idx_logbook_entries_type ON logbook_entries(type);
CREATE INDEX IF NOT EXISTS idx_access_requests_status ON access_requests(status);
CREATE INDEX IF NOT EXISTS idx_access_requests_due_date ON access_requests(due_date);
CREATE INDEX IF NOT EXISTS idx_documents_related_equipment_id ON documents(related_equipment_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour mettre à jour automatiquement updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_equipements_updated_at BEFORE UPDATE ON equipements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_authorizations_updated_at BEFORE UPDATE ON authorizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_access_requests_updated_at BEFORE UPDATE ON access_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_dashboard_configs_updated_at BEFORE UPDATE ON user_dashboard_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insérer quelques données de test pour les équipements
INSERT INTO equipements (name, type, model, status, latitude, longitude, installation_date, last_maintenance, conformity_status) VALUES 
('Caméra Secteur Nord - 001', 'camera', 'Hikvision DS-2CD2143G0-I', 'active', 48.8566, 2.3522, '2023-06-15', '2024-01-10', 'compliant'),
('Serveur Central', 'server', 'Dell PowerEdge R740', 'active', 48.8566, 2.3522, '2023-03-20', '2023-12-15', 'compliant'),
('Caméra Place Centrale - 002', 'camera', 'Axis P3245-LVE', 'maintenance', 48.8606, 2.3376, '2023-08-10', '2024-01-05', 'pending'),
('Switch Réseau Principal', 'switch', 'Cisco Catalyst 2960-X', 'active', 48.8566, 2.3522, '2023-05-15', '2023-11-20', 'compliant'),
('Caméra Parking Sud - 003', 'camera', 'Dahua IPC-HFW4431R-Z', 'out_of_service', 48.8506, 2.3444, '2023-09-01', '2023-12-10', 'non_compliant');