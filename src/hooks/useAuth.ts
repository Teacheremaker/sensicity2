import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../lib/supabase';
import { User, Permission } from '../types';

interface AuthContextType {
  user: User | null;
  permissions: Permission[];
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useAuthProvider = () => {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger l'utilisateur et ses permissions
  const loadUserWithPermissions = async (userId: string) => {
    try {
      // Charger l'utilisateur avec son rôle
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select(`
          *,
          roles (
            id,
            name,
            description
          )
        `)
        .eq('id', userId)
        .single();

      if (userError) {
        console.error('Erreur lors du chargement de l\'utilisateur:', userError);
        return false;
      }

      if (userData) {
        const transformedUser: User = {
          id: userData.id,
          email: userData.email,
          firstName: userData.first_name,
          lastName: userData.last_name,
          isActive: userData.is_active !== false,
          roleId: userData.role_id,
          status: userData.status || 'active',
          emailVerified: userData.email_verified || false,
          phone: userData.phone,
          department: userData.department,
          lastLogin: userData.last_login,
          failedLoginAttempts: userData.failed_login_attempts || 0,
          lockedUntil: userData.locked_until,
          createdAt: userData.created_at,
          updatedAt: userData.updated_at
        };

        setUser(transformedUser);

        // Pour la démo, on donne toutes les permissions à tous les utilisateurs
        // En production, vous devriez charger les vraies permissions depuis la base
        const mockPermissions: Permission[] = [
          { id: 1, name: 'equipment.read', description: 'Lire équipements', module: 'equipment', action: 'read', createdAt: new Date().toISOString() },
          { id: 2, name: 'equipment.create', description: 'Créer équipements', module: 'equipment', action: 'create', createdAt: new Date().toISOString() },
          { id: 3, name: 'equipment.update', description: 'Modifier équipements', module: 'equipment', action: 'update', createdAt: new Date().toISOString() },
          { id: 4, name: 'equipment.delete', description: 'Supprimer équipements', module: 'equipment', action: 'delete', createdAt: new Date().toISOString() },
          { id: 5, name: 'logbook.read', description: 'Lire main courante', module: 'logbook', action: 'read', createdAt: new Date().toISOString() },
          { id: 6, name: 'logbook.create', description: 'Créer entrées main courante', module: 'logbook', action: 'create', createdAt: new Date().toISOString() },
          { id: 7, name: 'logbook.update', description: 'Modifier main courante', module: 'logbook', action: 'update', createdAt: new Date().toISOString() },
          { id: 8, name: 'users.read', description: 'Lire utilisateurs', module: 'users', action: 'read', createdAt: new Date().toISOString() },
          { id: 9, name: 'users.create', description: 'Créer utilisateurs', module: 'users', action: 'create', createdAt: new Date().toISOString() },
          { id: 10, name: 'users.update', description: 'Modifier utilisateurs', module: 'users', action: 'update', createdAt: new Date().toISOString() }
        ];

        setPermissions(mockPermissions);

        // Mettre à jour la dernière connexion
        await supabase
          .from('users')
          .update({ 
            last_login: new Date().toISOString(),
            failed_login_attempts: 0 
          })
          .eq('id', userData.id);

        return true;
      }
      return false;
    } catch (error) {
      console.error('Erreur lors du chargement de l\'utilisateur:', error);
      setUser(null);
      setPermissions([]);
      return false;
    }
  };

  // Connexion simplifiée pour la démo
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);

      // Vérifier si l'utilisateur existe
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();

      if (error || !userData) {
        // Si l'utilisateur n'existe pas, on le crée automatiquement pour la démo
        if (error?.code === 'PGRST116') { // Pas de résultat trouvé
          console.log('Utilisateur non trouvé, création automatique pour la démo...');
          
          // Déterminer le rôle basé sur l'email
          let roleId = 1; // Admin par défaut
          let firstName = 'Utilisateur';
          let lastName = 'Demo';
          let department = 'Démonstration';

          if (email.includes('operateur')) {
            roleId = 2; // Opérateur CSU
            firstName = 'Marie';
            lastName = 'Martin';
            department = 'Centre de Supervision Urbaine';
          } else if (email.includes('dpo')) {
            roleId = 3; // DPO
            firstName = 'Pierre';
            lastName = 'Durand';
            department = 'Conformité et Protection des Données';
          } else if (email.includes('technicien')) {
            roleId = 4; // Technicien
            firstName = 'Sophie';
            lastName = 'Leroy';
            department = 'Service Technique';
          } else if (email.includes('admin')) {
            firstName = 'Jean';
            lastName = 'Dupont';
            department = 'Direction Générale';
          }

          // Créer l'utilisateur
          const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert([{
              email: email.toLowerCase(),
              first_name: firstName,
              last_name: lastName,
              role_id: roleId,
              is_active: true,
              status: 'active',
              email_verified: true,
              department: department
            }])
            .select()
            .single();

          if (createError) {
            console.error('Erreur lors de la création de l\'utilisateur:', createError);
            return { success: false, error: 'Erreur lors de la création du compte' };
          }

          // Utiliser le nouvel utilisateur
          const success = await loadUserWithPermissions(newUser.id);
          if (success) {
            localStorage.setItem('sensicity_user_id', newUser.id);
            return { success: true };
          }
        }
        
        return { success: false, error: 'Identifiants incorrects' };
      }

      // Vérifier le statut du compte
      if (!userData.is_active || userData.status !== 'active') {
        return { 
          success: false, 
          error: `Compte ${userData.status || 'inactif'}. Contactez l'administrateur.` 
        };
      }

      // Pour la démo, on accepte tous les mots de passe
      const isValidPassword = true; // Simplification pour la démo

      if (!isValidPassword) {
        return { success: false, error: 'Identifiants incorrects' };
      }

      // Connexion réussie
      const success = await loadUserWithPermissions(userData.id);
      
      if (success) {
        localStorage.setItem('sensicity_user_id', userData.id);
        return { success: true };
      } else {
        return { success: false, error: 'Erreur lors du chargement du profil utilisateur' };
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      return { success: false, error: 'Erreur de connexion au serveur' };
    } finally {
      setLoading(false);
    }
  };

  // Déconnexion
  const logout = async () => {
    try {
      setUser(null);
      setPermissions([]);
      localStorage.removeItem('sensicity_user_id');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  // Vérifier une permission
  const hasPermission = (permission: string): boolean => {
    return permissions.some(p => p.name === permission);
  };

  // Vérifier si l'utilisateur a au moins une des permissions
  const hasAnyPermission = (permissionList: string[]): boolean => {
    return permissionList.some(permission => hasPermission(permission));
  };

  // Rafraîchir les données utilisateur
  const refreshUser = async () => {
    if (user) {
      await loadUserWithPermissions(user.id);
    }
  };

  // Vérifier la session au chargement
  useEffect(() => {
    const checkSession = async () => {
      try {
        const storedUserId = localStorage.getItem('sensicity_user_id');
        if (storedUserId) {
          const success = await loadUserWithPermissions(storedUserId);
          if (!success) {
            localStorage.removeItem('sensicity_user_id');
          }
        }
      } catch (error) {
        console.error('Erreur de vérification de session:', error);
        localStorage.removeItem('sensicity_user_id');
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  return {
    user,
    permissions,
    loading,
    login,
    logout,
    hasPermission,
    hasAnyPermission,
    refreshUser
  };
};