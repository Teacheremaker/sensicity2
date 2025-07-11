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
      // Charger l'utilisateur
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
        .single();

      if (userError) throw userError;

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
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'utilisateur:', error);
      setUser(null);
      setPermissions([]);
    }
  };

  // Connexion
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);

      // Simuler l'authentification (en production, utiliser Supabase Auth ou votre système)
      if (email === 'admin@sensicity.fr' && password === 'admin123') {
        // Charger l'utilisateur admin
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .eq('status', 'active')
          .single();

        if (error || !userData) {
          return { success: false, error: 'Utilisateur non trouvé ou inactif' };
        }

        await loadUserWithPermissions(userData.id);

        // Mettre à jour la dernière connexion
        await supabase
          .from('users')
          .update({ 
            last_login: new Date().toISOString(),
            failed_login_attempts: 0 
          })
          .eq('id', userData.id);

        return { success: true };
      } else {
        return { success: false, error: 'Identifiants incorrects' };
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      return { success: false, error: 'Erreur de connexion' };
    } finally {
      setLoading(false);
    }
  };

  // Déconnexion
  const logout = async () => {
    setUser(null);
    setPermissions([]);
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
        // En production, vérifier le token JWT stocké
        const storedUser = localStorage.getItem('sensicity_user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          await loadUserWithPermissions(userData.id);
        }
      } catch (error) {
        console.error('Erreur de vérification de session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  // Sauvegarder l'utilisateur dans le localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('sensicity_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('sensicity_user');
    }
  }, [user]);

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