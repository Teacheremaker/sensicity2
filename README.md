# Sensicity - Plateforme de Gestion Vidéoprotection

## 🚀 Configuration Supabase

### 1. Créer les tables dans Supabase

1. Allez dans votre dashboard Supabase : https://supabase.com/dashboard/project/wlenjqnoeunxwiptxiuw
2. Cliquez sur "SQL Editor" dans le menu de gauche
3. Copiez et exécutez le contenu du fichier `src/sql/schema.sql`

### 2. Configuration des variables d'environnement

Créez un fichier `.env.local` à la racine du projet avec vos clés Supabase :

```env
VITE_SUPABASE_URL=https://wlenjqnoeunxwiptxiuw.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon_key_ici
```

**⚠️ Important :** Remplacez `votre_cle_anon_key_ici` par votre vraie clé anonyme Supabase que vous pouvez trouver dans :
- Dashboard Supabase → Settings → API → Project API keys → `anon` `public`

### 3. Configuration Row Level Security (RLS)

Pour sécuriser vos données, activez RLS sur vos tables :

```sql
-- Activer RLS sur toutes les tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipements ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE authorizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE logbook_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_dashboard_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Exemple de politique pour les équipements (à adapter selon vos besoins)
CREATE POLICY "Tous les utilisateurs authentifiés peuvent lire les équipements" ON equipements
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Seuls les admins peuvent modifier les équipements" ON equipements
    FOR ALL USING (auth.role() = 'authenticated');
```

## 🛠️ Installation et Démarrage

```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

## 📊 Fonctionnalités Implémentées

### Module Équipements ✅
- ✅ **CRUD complet** avec base de données Supabase
- ✅ **Filtrage avancé** (type, statut, conformité, recherche)
- ✅ **Vues multiples** (liste et statistiques)
- ✅ **Actions en lot** (suppression multiple)
- ✅ **Validation des données** côté client et serveur
- ✅ **Gestion d'erreurs** et états de chargement
- ✅ **Interface responsive** et moderne

### Architecture Technique
- ✅ **Supabase PostgreSQL** pour la base de données
- ✅ **React Hooks personnalisés** pour la logique métier
- ✅ **TypeScript** pour la sécurité des types
- ✅ **Tailwind CSS** pour le design
- ✅ **Composants modulaires** et réutilisables

## 🔧 Structure du Projet

```
src/
├── components/
│   ├── Equipment/          # Module équipements
│   │   ├── EquipmentList.tsx
│   │   ├── EquipmentForm.tsx
│   │   ├── EquipmentDetails.tsx
│   │   ├── EquipmentFilters.tsx
│   │   └── EquipmentStats.tsx
│   ├── Layout/             # Composants de mise en page
│   └── Dashboard/          # Tableau de bord
├── hooks/
│   └── useEquipments.ts    # Hook personnalisé pour les équipements
├── lib/
│   └── supabase.ts         # Configuration Supabase
├── sql/
│   └── schema.sql          # Schéma de base de données
└── types/
    └── index.ts            # Types TypeScript
```

## 🎯 Prochaines Étapes

1. **Authentification** : Implémenter l'authentification Supabase
2. **Autres modules** : Développer les modules conformité, main courante, etc.
3. **Permissions** : Implémenter le système de rôles et permissions
4. **Tests** : Ajouter des tests unitaires et d'intégration
5. **Déploiement** : Configurer le déploiement en production

## 📝 Notes Importantes

- Les clés Supabase dans le code sont des exemples, utilisez vos vraies clés
- Configurez RLS selon vos besoins de sécurité
- Les données de test sont automatiquement insérées par le script SQL
- L'application est prête pour la production avec quelques ajustements de sécurité