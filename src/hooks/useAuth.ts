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

        // Charger les permissions basées sur le rôle
        if (userData.role_id) {
          const { data: rolePermissions, error: permissionsError } = await supabase
            .from('role_permissions')
            .select('permissions (*)')
            .eq('role_id', userData.role_id);

          if (permissionsError) {
            console.error('Erreur lors du chargement des permissions:', permissionsError);
            // Gérer l'erreur, peut-être déconnecter l'utilisateur
          } else {
            const userPermissions = rolePermissions?.map(rp => rp.permissions) as Permission[] || [];
            setPermissions(userPermissions);
          }
        }

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

  // Connexion avec Supabase Auth
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        return { success: false, error: authError.message };
      }

      if (authData.user) {
        const success = await loadUserWithPermissions(authData.user.id);
        if (success) {
          return { success: true };
        } else {
          // Si loadUserWithPermissions échoue, déconnecter l'utilisateur pour éviter un état incohérent
          await supabase.auth.signOut();
          return { success: false, error: 'Erreur lors du chargement du profil utilisateur.' };
        }
      }
      return { success: false, error: 'Utilisateur non trouvé.' };
    } catch (error) {
      console.error('Erreur de connexion:', error);
      return { success: false, error: 'Une erreur inattendue est survenue.' };
    } finally {
      setLoading(false);
    }
  };

  // Déconnexion
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setPermissions([]);
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

  // Gérer les changements d'état d'authentification
  useEffect(() => {
    setLoading(true);
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await loadUserWithPermissions(session.user.id);
      } else {
        setUser(null);
        setPermissions([]);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
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