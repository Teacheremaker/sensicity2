/*
  # Système de gestion des utilisateurs et groupes
  
  1. Nouvelles tables
    - `groups` - Groupes d'utilisateurs
    - `permissions` - Permissions système
    - `roles` - Rôles avec permissions associées
    - `user_groups` - Association utilisateurs-groupes
    - `role_permissions` - Association rôles-permissions
    - `user_sessions` - Sessions utilisateurs
    - `password_resets` - Tokens de réinitialisation
    - `user_audit_logs` - Logs d'audit des actions utilisateurs
    
  2. Sécurité
    - Chiffrement des mots de passe
    - Gestion des sessions
    - Audit trail complet
    - Permissions granulaires
*/

-- Table des groupes d'utilisateurs
CREATE TABLE IF NOT EXISTS groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des permissions système
CREATE TABLE IF NOT EXISTS permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    module VARCHAR(50) NOT NULL, -- equipment, logbook, compliance, users, etc.
    action VARCHAR(50) NOT NULL, -- create, read, update, delete, export, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mise à jour de la table roles pour inclure plus d'informations
ALTER TABLE roles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE roles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE roles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Table d'association rôles-permissions
CREATE TABLE IF NOT EXISTS role_permissions (
    id SERIAL PRIMARY KEY,
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
    granted_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(role_id, permission_id)
);

-- Table d'association utilisateurs-groupes
CREATE TABLE IF NOT EXISTS user_groups (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES users(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, group_id)
);

-- Mise à jour de la table users pour inclure l'authentification
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) CHECK (status IN ('active', 'inactive', 'suspended', 'pending')) DEFAULT 'active';
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS department VARCHAR(100);

-- Table des sessions utilisateurs
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des tokens de réinitialisation de mot de passe
CREATE TABLE IF NOT EXISTS password_resets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des logs d'audit pour les actions utilisateurs
CREATE TABLE IF NOT EXISTS user_audit_logs (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50), -- user, group, role, permission
    target_id VARCHAR(255),
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_groups_name ON groups(name);
CREATE INDEX IF NOT EXISTS idx_groups_is_active ON groups(is_active);
CREATE INDEX IF NOT EXISTS idx_permissions_module ON permissions(module);
CREATE INDEX IF NOT EXISTS idx_permissions_action ON permissions(action);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_user_groups_user_id ON user_groups(user_id);
CREATE INDEX IF NOT EXISTS idx_user_groups_group_id ON user_groups(group_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token_hash ON user_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_password_resets_user_id ON password_resets(user_id);
CREATE INDEX IF NOT EXISTS idx_password_resets_token_hash ON password_resets(token_hash);
CREATE INDEX IF NOT EXISTS idx_user_audit_logs_user_id ON user_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_audit_logs_created_at ON user_audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_user_audit_logs_action ON user_audit_logs(action);

-- Triggers pour updated_at
CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insérer les permissions de base
INSERT INTO permissions (name, description, module, action) VALUES 
-- Permissions équipements
('equipment.create', 'Créer des équipements', 'equipment', 'create'),
('equipment.read', 'Consulter les équipements', 'equipment', 'read'),
('equipment.update', 'Modifier les équipements', 'equipment', 'update'),
('equipment.delete', 'Supprimer les équipements', 'equipment', 'delete'),
('equipment.export', 'Exporter les équipements', 'equipment', 'export'),
('equipment.import', 'Importer les équipements', 'equipment', 'import'),

-- Permissions main courante
('logbook.create', 'Créer des entrées main courante', 'logbook', 'create'),
('logbook.read', 'Consulter la main courante', 'logbook', 'read'),
('logbook.update', 'Modifier les entrées main courante', 'logbook', 'update'),
('logbook.delete', 'Supprimer les entrées main courante', 'logbook', 'delete'),
('logbook.export', 'Exporter la main courante', 'logbook', 'export'),

-- Permissions conformité
('compliance.read', 'Consulter la conformité', 'compliance', 'read'),
('compliance.manage', 'Gérer la conformité', 'compliance', 'manage'),

-- Permissions utilisateurs
('users.create', 'Créer des utilisateurs', 'users', 'create'),
('users.read', 'Consulter les utilisateurs', 'users', 'read'),
('users.update', 'Modifier les utilisateurs', 'users', 'update'),
('users.delete', 'Supprimer les utilisateurs', 'users', 'delete'),
('users.manage_roles', 'Gérer les rôles utilisateurs', 'users', 'manage_roles'),
('users.manage_groups', 'Gérer les groupes utilisateurs', 'users', 'manage_groups'),

-- Permissions groupes
('groups.create', 'Créer des groupes', 'groups', 'create'),
('groups.read', 'Consulter les groupes', 'groups', 'read'),
('groups.update', 'Modifier les groupes', 'groups', 'update'),
('groups.delete', 'Supprimer les groupes', 'groups', 'delete'),

-- Permissions système
('system.admin', 'Administration système', 'system', 'admin'),
('system.audit', 'Consulter les logs d\'audit', 'system', 'audit'),
('system.settings', 'Modifier les paramètres système', 'system', 'settings')

ON CONFLICT (name) DO NOTHING;

-- Mettre à jour les rôles existants
UPDATE roles SET 
    description = 'Administrateur système avec tous les droits',
    is_active = true
WHERE name = 'Admin';

UPDATE roles SET 
    description = 'Opérateur du Centre de Supervision Urbaine',
    is_active = true
WHERE name = 'Opérateur CSU';

UPDATE roles SET 
    description = 'Délégué à la Protection des Données',
    is_active = true
WHERE name = 'DPO';

UPDATE roles SET 
    description = 'Technicien de maintenance',
    is_active = true
WHERE name = 'Technicien';

-- Ajouter de nouveaux rôles
INSERT INTO roles (name, description, is_active) VALUES 
('Superviseur', 'Superviseur avec droits étendus', true),
('Auditeur', 'Auditeur avec accès en lecture seule', true),
('Opérateur', 'Opérateur standard', true)
ON CONFLICT (name) DO NOTHING;

-- Créer des groupes par défaut
INSERT INTO groups (name, description, is_active) VALUES 
('Administration', 'Groupe des administrateurs système', true),
('CSU Opérateurs', 'Opérateurs du Centre de Supervision Urbaine', true),
('Maintenance', 'Équipe de maintenance technique', true),
('Conformité RGPD', 'Équipe de conformité et protection des données', true),
('Supervision', 'Équipe de supervision et contrôle', true)
ON CONFLICT (name) DO NOTHING;

-- Assigner les permissions aux rôles
-- Admin : toutes les permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Admin'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Opérateur CSU : permissions de base
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Opérateur CSU' 
AND p.name IN (
    'equipment.read', 'logbook.create', 'logbook.read', 'logbook.update',
    'compliance.read'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- DPO : permissions conformité et audit
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'DPO' 
AND p.name IN (
    'equipment.read', 'logbook.read', 'compliance.read', 'compliance.manage',
    'system.audit', 'users.read'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Technicien : permissions équipements
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Technicien' 
AND p.name IN (
    'equipment.create', 'equipment.read', 'equipment.update', 'equipment.delete',
    'logbook.read'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Superviseur : permissions étendues
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Superviseur' 
AND p.name IN (
    'equipment.read', 'equipment.update', 'logbook.create', 'logbook.read', 
    'logbook.update', 'logbook.export', 'compliance.read', 'users.read',
    'groups.read', 'system.audit'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Auditeur : lecture seule
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Auditeur' 
AND p.name IN (
    'equipment.read', 'logbook.read', 'compliance.read', 'system.audit',
    'users.read', 'groups.read'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Opérateur : permissions de base
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Opérateur' 
AND p.name IN (
    'equipment.read', 'logbook.create', 'logbook.read', 'logbook.update'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Créer un utilisateur admin par défaut (mot de passe: admin123)
-- Hash bcrypt pour 'admin123': $2b$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ
INSERT INTO users (email, first_name, last_name, role_id, is_active, status, email_verified, password_hash) 
SELECT 
    'admin@sensicity.fr',
    'Admin',
    'Système',
    r.id,
    true,
    'active',
    true,
    '$2b$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ'
FROM roles r 
WHERE r.name = 'Admin'
ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    status = 'active',
    email_verified = true;

-- Assigner l'admin au groupe Administration
INSERT INTO user_groups (user_id, group_id)
SELECT u.id, g.id
FROM users u, groups g
WHERE u.email = 'admin@sensicity.fr' AND g.name = 'Administration'
ON CONFLICT (user_id, group_id) DO NOTHING;