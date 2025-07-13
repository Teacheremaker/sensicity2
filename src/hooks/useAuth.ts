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
      // Charger l'utilisateur avec son rôle et permissions
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select(`
          *,
          roles (
            id,
            name,
            description,
            is_active,
            role_permissions (
              permissions (*)
            )
          )
        `)
        .eq('id', userId)
        .eq('is_active', true)
        .eq('status', 'active')
        .single();

      if (userError) {
        console.error('Erreur lors du chargement de l\'utilisateur:', userError);
        throw userError;
      }

      if (userData) {
        const transformedUser: User = {
          id: userData.id,
          email: userData.email,
          firstName: userData.first_name,
          lastName: userData.last_name,
          isActive: userData.is_active,
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

        // Extraire les permissions du rôle
        const userPermissions = userData.roles?.role_permissions?.map(
          (rp: any) => rp.permissions
        ).flat() || [];

        setPermissions(userPermissions);

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

  // Connexion
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);

      // Vérifier si l'utilisateur existe et est actif
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .eq('is_active', true)
        .single();

      if (error || !userData) {
        // Incrémenter les tentatives échouées si l'utilisateur existe
        if (userData) {
          await supabase
            .from('users')
            .update({ 
              failed_login_attempts: (userData.failed_login_attempts || 0) + 1,
              locked_until: (userData.failed_login_attempts || 0) >= 4 ? 
                new Date(Date.now() + 30 * 60 * 1000).toISOString() : null // Verrouiller 30 min après 5 tentatives
            })
            .eq('id', userData.id);
        }
        return { success: false, error: 'Identifiants incorrects' };
      }

      // Vérifier si le compte est verrouillé
      if (userData.locked_until && new Date(userData.locked_until) > new Date()) {
        return { 
          success: false, 
          error: 'Compte temporairement verrouillé. Réessayez plus tard.' 
        };
      }

      // Vérifier le statut du compte
      if (userData.status !== 'active') {
        return { 
          success: false, 
          error: `Compte ${userData.status}. Contactez l'administrateur.` 
        };
      }

      // Pour la démo, on accepte le mot de passe "admin123" pour l'admin
      // En production, il faudrait vérifier le hash du mot de passe
      const isValidPassword = (
        (email === 'admin@sensicity.fr' && password === 'admin123') ||
        (password === 'demo123') // Mot de passe générique pour la démo
      );

      if (!isValidPassword) {
        // Incrémenter les tentatives échouées
        await supabase
          .from('users')
          .update({ 
            failed_login_attempts: (userData.failed_login_attempts || 0) + 1,
            locked_until: (userData.failed_login_attempts || 0) >= 4 ? 
              new Date(Date.now() + 30 * 60 * 1000).toISOString() : null
          })
          .eq('id', userData.id);

        return { success: false, error: 'Identifiants incorrects' };
      }

      // Connexion réussie
      const success = await loadUserWithPermissions(userData.id);
      
      if (success) {
        // Enregistrer dans le localStorage pour la persistance
        localStorage.setItem('sensicity_user_id', userData.id);
        
        // Logger la connexion réussie
        await supabase
          .from('user_audit_logs')
          .insert([{
            user_id: userData.id,
            action: 'user.login',
            target_type: 'session',
            target_id: userData.id,
            success: true,
            ip_address: null, // En production, récupérer l'IP réelle
            user_agent: navigator.userAgent
          }]);

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
      if (user) {
        // Logger la déconnexion
        await supabase
          .from('user_audit_logs')
          .insert([{
            user_id: user.id,
            action: 'user.logout',
            target_type: 'session',
            target_id: user.id,
            success: true
          }]);
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      setUser(null);
      setPermissions([]);
      localStorage.removeItem('sensicity_user_id');
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