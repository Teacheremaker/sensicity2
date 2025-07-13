/*
  # Création des utilisateurs de démonstration
  
  1. Utilisateurs de test
    - Admin système
    - Opérateur CSU
    - DPO
    - Technicien
    - Superviseur
    - Auditeur
    
  2. Assignation aux groupes appropriés
  
  3. Données de test pour la démonstration
*/

-- Créer les utilisateurs de démonstration
INSERT INTO users (
  email, 
  first_name, 
  last_name, 
  role_id, 
  is_active, 
  status, 
  email_verified, 
  password_hash,
  phone,
  department
) VALUES 
-- Administrateur
(
  'admin@sensicity.fr',
  'Jean',
  'Dupont',
  (SELECT id FROM roles WHERE name = 'Admin'),
  true,
  'active',
  true,
  '$2b$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ',
  '01 23 45 67 89',
  'Direction Générale'
),
-- Opérateur CSU
(
  'operateur@sensicity.fr',
  'Marie',
  'Martin',
  (SELECT id FROM roles WHERE name = 'Opérateur CSU'),
  true,
  'active',
  true,
  '$2b$10$demo123hashdemo123hashdemo123hashdemo123hashdemo123hash',
  '01 23 45 67 90',
  'Centre de Supervision Urbaine'
),
-- DPO
(
  'dpo@sensicity.fr',
  'Pierre',
  'Durand',
  (SELECT id FROM roles WHERE name = 'DPO'),
  true,
  'active',
  true,
  '$2b$10$demo123hashdemo123hashdemo123hashdemo123hashdemo123hash',
  '01 23 45 67 91',
  'Conformité et Protection des Données'
),
-- Technicien
(
  'technicien@sensicity.fr',
  'Sophie',
  'Leroy',
  (SELECT id FROM roles WHERE name = 'Technicien'),
  true,
  'active',
  true,
  '$2b$10$demo123hashdemo123hashdemo123hashdemo123hashdemo123hash',
  '01 23 45 67 92',
  'Service Technique'
),
-- Superviseur
(
  'superviseur@sensicity.fr',
  'Laurent',
  'Bernard',
  (SELECT id FROM roles WHERE name = 'Superviseur'),
  true,
  'active',
  true,
  '$2b$10$demo123hashdemo123hashdemo123hashdemo123hashdemo123hash',
  '01 23 45 67 93',
  'Supervision'
),
-- Auditeur
(
  'auditeur@sensicity.fr',
  'Isabelle',
  'Moreau',
  (SELECT id FROM roles WHERE name = 'Auditeur'),
  true,
  'active',
  true,
  '$2b$10$demo123hashdemo123hashdemo123hashdemo123hashdemo123hash',
  '01 23 45 67 94',
  'Audit et Contrôle'
)
ON CONFLICT (email) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  role_id = EXCLUDED.role_id,
  is_active = EXCLUDED.is_active,
  status = EXCLUDED.status,
  email_verified = EXCLUDED.email_verified,
  phone = EXCLUDED.phone,
  department = EXCLUDED.department;

-- Assigner les utilisateurs aux groupes appropriés
INSERT INTO user_groups (user_id, group_id, assigned_by) VALUES 
-- Admin au groupe Administration
(
  (SELECT id FROM users WHERE email = 'admin@sensicity.fr'),
  (SELECT id FROM groups WHERE name = 'Administration'),
  (SELECT id FROM users WHERE email = 'admin@sensicity.fr')
),
-- Opérateur au groupe CSU Opérateurs
(
  (SELECT id FROM users WHERE email = 'operateur@sensicity.fr'),
  (SELECT id FROM groups WHERE name = 'CSU Opérateurs'),
  (SELECT id FROM users WHERE email = 'admin@sensicity.fr')
),
-- DPO au groupe Conformité RGPD
(
  (SELECT id FROM users WHERE email = 'dpo@sensicity.fr'),
  (SELECT id FROM groups WHERE name = 'Conformité RGPD'),
  (SELECT id FROM users WHERE email = 'admin@sensicity.fr')
),
-- Technicien au groupe Maintenance
(
  (SELECT id FROM users WHERE email = 'technicien@sensicity.fr'),
  (SELECT id FROM groups WHERE name = 'Maintenance'),
  (SELECT id FROM users WHERE email = 'admin@sensicity.fr')
),
-- Superviseur au groupe Supervision
(
  (SELECT id FROM users WHERE email = 'superviseur@sensicity.fr'),
  (SELECT id FROM groups WHERE name = 'Supervision'),
  (SELECT id FROM users WHERE email = 'admin@sensicity.fr')
),
-- Auditeur au groupe Administration (lecture seule)
(
  (SELECT id FROM users WHERE email = 'auditeur@sensicity.fr'),
  (SELECT id FROM groups WHERE name = 'Administration'),
  (SELECT id FROM users WHERE email = 'admin@sensicity.fr')
)
ON CONFLICT (user_id, group_id) DO NOTHING;

-- Ajouter quelques logs d'audit pour la démonstration
INSERT INTO user_audit_logs (
  user_id,
  action,
  target_type,
  target_id,
  success,
  created_at
) VALUES 
(
  (SELECT id FROM users WHERE email = 'admin@sensicity.fr'),
  'user.create',
  'user',
  (SELECT id FROM users WHERE email = 'operateur@sensicity.fr'),
  true,
  NOW() - INTERVAL '2 days'
),
(
  (SELECT id FROM users WHERE email = 'admin@sensicity.fr'),
  'user.create',
  'user',
  (SELECT id FROM users WHERE email = 'dpo@sensicity.fr'),
  true,
  NOW() - INTERVAL '1 day'
),
(
  (SELECT id FROM users WHERE email = 'operateur@sensicity.fr'),
  'user.login',
  'session',
  (SELECT id FROM users WHERE email = 'operateur@sensicity.fr'),
  true,
  NOW() - INTERVAL '2 hours'
)
ON CONFLICT DO NOTHING;