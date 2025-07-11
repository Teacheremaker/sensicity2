import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, Role, Group, UserAuditLog } from '../types';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger tous les utilisateurs
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          roles (id, name, description),
          user_groups (
            groups (id, name, description)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedUsers: User[] = (data || []).map(user => ({
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        isActive: user.is_active,
        roleId: user.role_id,
        status: user.status || 'active',
        emailVerified: user.email_verified || false,
        phone: user.phone,
        department: user.department,
        lastLogin: user.last_login,
        failedLoginAttempts: user.failed_login_attempts || 0,
        lockedUntil: user.locked_until,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      }));

      setUsers(transformedUsers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  // Charger tous les rôles
  const fetchRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select(`
          *,
          role_permissions (
            permissions (*)
          )
        `)
        .order('name');

      if (error) throw error;

      const transformedRoles: Role[] = (data || []).map(role => ({
        id: role.id,
        name: role.name,
        description: role.description || '',
        isActive: role.is_active !== false,
        permissions: role.role_permissions?.map((rp: any) => rp.permissions) || [],
        createdAt: role.created_at || new Date().toISOString(),
        updatedAt: role.updated_at || new Date().toISOString()
      }));

      setRoles(transformedRoles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des rôles');
    }
  };

  // Charger tous les groupes
  const fetchGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select(`
          *,
          user_groups (
            users (id, first_name, last_name, email)
          )
        `)
        .order('name');

      if (error) throw error;

      const transformedGroups: Group[] = (data || []).map(group => ({
        id: group.id,
        name: group.name,
        description: group.description,
        isActive: group.is_active !== false,
        createdBy: group.created_by,
        users: group.user_groups?.map((ug: any) => ({
          id: ug.users.id,
          firstName: ug.users.first_name,
          lastName: ug.users.last_name,
          email: ug.users.email
        })) || [],
        createdAt: group.created_at,
        updatedAt: group.updated_at
      }));

      setGroups(transformedGroups);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des groupes');
    }
  };

  // Créer un utilisateur
  const createUser = async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{
          email: userData.email,
          first_name: userData.firstName,
          last_name: userData.lastName,
          role_id: userData.roleId,
          is_active: userData.isActive,
          status: userData.status,
          email_verified: userData.emailVerified,
          phone: userData.phone,
          department: userData.department,
          password_hash: '$2b$10$defaulthash' // En production, hasher le mot de passe
        }])
        .select()
        .single();

      if (error) throw error;

      await fetchUsers();
      await logUserAction('user.create', 'user', data.id, null, userData);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création de l\'utilisateur');
      throw err;
    }
  };

  // Mettre à jour un utilisateur
  const updateUser = async (id: string, userData: Partial<User>) => {
    try {
      const oldUser = users.find(u => u.id === id);
      
      const { data, error } = await supabase
        .from('users')
        .update({
          email: userData.email,
          first_name: userData.firstName,
          last_name: userData.lastName,
          role_id: userData.roleId,
          is_active: userData.isActive,
          status: userData.status,
          email_verified: userData.emailVerified,
          phone: userData.phone,
          department: userData.department,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await fetchUsers();
      await logUserAction('user.update', 'user', id, oldUser, userData);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour de l\'utilisateur');
      throw err;
    }
  };

  // Supprimer un utilisateur
  const deleteUser = async (id: string) => {
    try {
      const userToDelete = users.find(u => u.id === id);
      
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setUsers(prev => prev.filter(u => u.id !== id));
      await logUserAction('user.delete', 'user', id, userToDelete, null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression de l\'utilisateur');
      throw err;
    }
  };

  // Créer un groupe
  const createGroup = async (groupData: Omit<Group, 'id' | 'createdAt' | 'updatedAt' | 'users'>) => {
    try {
      const { data, error } = await supabase
        .from('groups')
        .insert([{
          name: groupData.name,
          description: groupData.description,
          is_active: groupData.isActive,
          created_by: groupData.createdBy
        }])
        .select()
        .single();

      if (error) throw error;

      await fetchGroups();
      await logUserAction('group.create', 'group', data.id.toString(), null, groupData);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création du groupe');
      throw err;
    }
  };

  // Assigner un utilisateur à un groupe
  const assignUserToGroup = async (userId: string, groupId: number, assignedBy?: string) => {
    try {
      const { error } = await supabase
        .from('user_groups')
        .insert([{
          user_id: userId,
          group_id: groupId,
          assigned_by: assignedBy
        }]);

      if (error) throw error;

      await fetchUsers();
      await fetchGroups();
      await logUserAction('user.assign_group', 'user_group', `${userId}-${groupId}`, null, { userId, groupId });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'assignation au groupe');
      throw err;
    }
  };

  // Retirer un utilisateur d'un groupe
  const removeUserFromGroup = async (userId: string, groupId: number) => {
    try {
      const { error } = await supabase
        .from('user_groups')
        .delete()
        .eq('user_id', userId)
        .eq('group_id', groupId);

      if (error) throw error;

      await fetchUsers();
      await fetchGroups();
      await logUserAction('user.remove_group', 'user_group', `${userId}-${groupId}`, { userId, groupId }, null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du retrait du groupe');
      throw err;
    }
  };

  // Logger une action utilisateur
  const logUserAction = async (
    action: string,
    targetType: string,
    targetId: string,
    oldValues: any,
    newValues: any
  ) => {
    try {
      await supabase
        .from('user_audit_logs')
        .insert([{
          user_id: null, // TODO: Récupérer l'utilisateur connecté
          action,
          target_type: targetType,
          target_id: targetId,
          old_values: oldValues,
          new_values: newValues,
          success: true
        }]);
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du log:', error);
    }
  };

  // Charger les données au montage
  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchGroups();
  }, []);

  return {
    users,
    roles,
    groups,
    loading,
    error,
    fetchUsers,
    fetchRoles,
    fetchGroups,
    createUser,
    updateUser,
    deleteUser,
    createGroup,
    assignUserToGroup,
    removeUserFromGroup
  };
};