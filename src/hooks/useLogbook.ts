import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { LogbookEntry, LogbookAction, VideoBookmark } from '../types';

export const useLogbook = () => {
  const [entries, setEntries] = useState<LogbookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger toutes les entrées de la main courante
  const fetchEntries = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('logbook_entries')
        .select(`
          *,
          logbook_actions (*),
          video_bookmarks (*),
          users (first_name, last_name),
          equipements (name)
        `)
        .order('timestamp', { ascending: false });

      if (error) throw error;

      // Transformer les données pour correspondre au type LogbookEntry
      const transformedEntries: LogbookEntry[] = (data || []).map(entry => ({
        id: entry.id,
        timestamp: entry.timestamp,
        type: entry.type,
        description: entry.description,
        userId: entry.user_id,
        equipmentId: entry.equipment_id,
        isJudicialRequisition: entry.is_judicial_requisition,
        createdAt: entry.created_at,
        eventType: entry.event_type || 'observation',
        priority: entry.priority || 'medium',
        location: entry.location,
        status: entry.status || 'new',
        actions: entry.logbook_actions || [],
        videoBookmarks: entry.video_bookmarks || [],
        updatedAt: entry.updated_at || entry.created_at
      }));

      setEntries(transformedEntries);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des entrées');
    } finally {
      setLoading(false);
    }
  };

  // Créer une nouvelle entrée
  const createEntry = async (entryData: Omit<LogbookEntry, 'id' | 'createdAt' | 'updatedAt' | 'actions' | 'videoBookmarks'>) => {
    try {
      const { data, error } = await supabase
        .from('logbook_entries')
        .insert([{
          timestamp: entryData.timestamp,
          type: entryData.type,
          description: entryData.description,
          user_id: entryData.userId,
          equipment_id: entryData.equipmentId,
          is_judicial_requisition: entryData.isJudicialRequisition,
          event_type: entryData.eventType,
          priority: entryData.priority,
          location: entryData.location,
          status: entryData.status
        }])
        .select()
        .single();

      if (error) throw error;

      // Créer les bookmarks vidéo automatiquement si un équipement est associé
      if (data && entryData.equipmentId) {
        await createVideoBookmarks(data.id, entryData.equipmentId, entryData.timestamp);
      }

      // Recharger les entrées
      await fetchEntries();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création de l\'entrée');
      throw err;
    }
  };

  // Mettre à jour une entrée
  const updateEntry = async (id: number, updates: Partial<LogbookEntry>) => {
    try {
      const { data, error } = await supabase
        .from('logbook_entries')
        .update({
          type: updates.type,
          description: updates.description,
          event_type: updates.eventType,
          priority: updates.priority,
          location: updates.location,
          status: updates.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Recharger les entrées
      await fetchEntries();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour de l\'entrée');
      throw err;
    }
  };

  // Ajouter une action à une entrée
  const addAction = async (entryId: number, actionData: Omit<LogbookAction, 'id' | 'createdAt'>) => {
    try {
      const { data, error } = await supabase
        .from('logbook_actions')
        .insert([{
          logbook_entry_id: actionData.logbookEntryId,
          action_type: actionData.actionType,
          description: actionData.description,
          timestamp: actionData.timestamp,
          user_id: actionData.userId
        }])
        .select()
        .single();

      if (error) throw error;

      // Recharger les entrées
      await fetchEntries();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'ajout de l\'action');
      throw err;
    }
  };

  // Créer des bookmarks vidéo automatiquement
  const createVideoBookmarks = async (entryId: number, equipmentId: string, eventTime: string) => {
    try {
      const eventDate = new Date(eventTime);
      const startTime = new Date(eventDate.getTime() - 2 * 60 * 1000); // -2 minutes
      const endTime = new Date(eventDate.getTime() + 5 * 60 * 1000);   // +5 minutes

      const { data, error } = await supabase
        .from('video_bookmarks')
        .insert([{
          logbook_entry_id: entryId,
          equipment_id: equipmentId,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          description: 'Bookmark automatique pour l\'événement'
        }])
        .select();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Erreur lors de la création des bookmarks vidéo:', err);
    }
  };

  // Supprimer une entrée
  const deleteEntry = async (id: number) => {
    try {
      const { error } = await supabase
        .from('logbook_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Supprimer de la liste locale
      setEntries(prev => prev.filter(entry => entry.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression de l\'entrée');
      throw err;
    }
  };

  // Charger les entrées au montage du composant
  useEffect(() => {
    fetchEntries();
  }, []);

  return {
    entries,
    loading,
    error,
    fetchEntries,
    createEntry,
    updateEntry,
    addAction,
    deleteEntry,
  };
};