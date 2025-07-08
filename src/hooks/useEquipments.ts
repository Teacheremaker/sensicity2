import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Equipment } from '../types';

export const useEquipments = () => {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger tous les équipements
  const fetchEquipments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('equipements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setEquipments(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des équipements');
    } finally {
      setLoading(false);
    }
  };

  // Créer un nouvel équipement
  const createEquipment = async (equipmentData: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data, error } = await supabase
        .from('equipements')
        .insert([{
          name: equipmentData.name,
          type: equipmentData.type,
          model: equipmentData.model,
          status: equipmentData.status,
          latitude: equipmentData.latitude,
          longitude: equipmentData.longitude,
          installation_date: equipmentData.installationDate,
          last_maintenance: equipmentData.lastMaintenance || null,
          conformity_status: equipmentData.conformityStatus,
        }])
        .select()
        .single();

      if (error) throw error;

      // Ajouter le nouvel équipement à la liste locale
      if (data) {
        const newEquipment: Equipment = {
          id: data.id,
          name: data.name,
          type: data.type,
          model: data.model,
          status: data.status,
          latitude: data.latitude,
          longitude: data.longitude,
          installationDate: data.installation_date,
          lastMaintenance: data.last_maintenance,
          conformityStatus: data.conformity_status,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
        setEquipments(prev => [newEquipment, ...prev]);
      }

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création de l\'équipement');
      throw err;
    }
  };

  // Mettre à jour un équipement
  const updateEquipment = async (id: string, equipmentData: Partial<Equipment>) => {
    try {
      const { data, error } = await supabase
        .from('equipements')
        .update({
          name: equipmentData.name,
          type: equipmentData.type,
          model: equipmentData.model,
          status: equipmentData.status,
          latitude: equipmentData.latitude,
          longitude: equipmentData.longitude,
          installation_date: equipmentData.installationDate,
          last_maintenance: equipmentData.lastMaintenance || null,
          conformity_status: equipmentData.conformityStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Mettre à jour l'équipement dans la liste locale
      if (data) {
        const updatedEquipment: Equipment = {
          id: data.id,
          name: data.name,
          type: data.type,
          model: data.model,
          status: data.status,
          latitude: data.latitude,
          longitude: data.longitude,
          installationDate: data.installation_date,
          lastMaintenance: data.last_maintenance,
          conformityStatus: data.conformity_status,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
        setEquipments(prev => prev.map(eq => eq.id === id ? updatedEquipment : eq));
      }

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour de l\'équipement');
      throw err;
    }
  };

  // Supprimer un équipement
  const deleteEquipment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('equipements')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Supprimer l'équipement de la liste locale
      setEquipments(prev => prev.filter(eq => eq.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression de l\'équipement');
      throw err;
    }
  };

  // Supprimer plusieurs équipements
  const deleteMultipleEquipments = async (ids: string[]) => {
    try {
      const { error } = await supabase
        .from('equipements')
        .delete()
        .in('id', ids);

      if (error) throw error;

      // Supprimer les équipements de la liste locale
      setEquipments(prev => prev.filter(eq => !ids.includes(eq.id)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression des équipements');
      throw err;
    }
  };

  // Charger les équipements au montage du composant
  useEffect(() => {
    fetchEquipments();
  }, []);

  return {
    equipments,
    loading,
    error,
    fetchEquipments,
    createEquipment,
    updateEquipment,
    deleteEquipment,
    deleteMultipleEquipments,
  };
};