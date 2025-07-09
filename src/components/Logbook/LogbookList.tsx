import React, { useState } from 'react';
import { Plus, Filter, Eye, Edit, Trash2, Clock, AlertTriangle, CheckCircle, User, MapPin, Camera } from 'lucide-react';
import { LogbookEntry } from '../../types';
import { useLogbook } from '../../hooks/useLogbook';
import { LogbookForm } from './LogbookForm';
import { LogbookDetails } from './LogbookDetails';
import { LogbookFilters } from './LogbookFilters';

const getPriorityColor = (priority: LogbookEntry['priority']) => {
  switch (priority) {
    case 'critical': return 'bg-red-100 text-red-800 border-red-200';
    case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low': return 'bg-green-100 text-green-800 border-green-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusColor = (status: LogbookEntry['status']) => {
  switch (status) {
    case 'new': return 'bg-blue-100 text-blue-800';
    case 'in_progress': return 'bg-yellow-100 text-yellow-800';
    case 'closed': return 'bg-green-100 text-green-800';
    case 'awaiting_requisition': return 'bg-purple-100 text-purple-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getPriorityIcon = (priority: LogbookEntry['priority']) => {
  switch (priority) {
    case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />;
    case 'high': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
    case 'medium': return <Clock className="h-4 w-4 text-yellow-600" />;
    case 'low': return <CheckCircle className="h-4 w-4 text-green-600" />;
    default: return <Clock className="h-4 w-4 text-gray-600" />;
  }
};

export const LogbookList: React.FC = () => {
  const { entries, loading, error, createEntry, updateEntry, addAction, deleteEntry } = useLogbook();
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    priority: 'all',
    status: 'all',
    dateFrom: '',
    dateTo: ''
  });
  const [selectedEntry, setSelectedEntry] = useState<LogbookEntry | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<LogbookEntry | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = filters.search === '' || 
      entry.description.toLowerCase().includes(filters.search.toLowerCase()) ||
      entry.eventType.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesType = filters.type === 'all' || entry.type === filters.type;
    const matchesPriority = filters.priority === 'all' || entry.priority === filters.priority;
    const matchesStatus = filters.status === 'all' || entry.status === filters.status;
    
    const entryDate = new Date(entry.timestamp).toISOString().split('T')[0];
    const matchesDateFrom = !filters.dateFrom || entryDate >= filters.dateFrom;
    const matchesDateTo = !filters.dateTo || entryDate <= filters.dateTo;
    
    return matchesSearch && matchesType && matchesPriority && matchesStatus && matchesDateFrom && matchesDateTo;
  });

  const handleSaveEntry = async (entryData: Partial<LogbookEntry>) => {
    try {
      setIsSubmitting(true);
      
      if (editingEntry) {
        await updateEntry(editingEntry.id, entryData);
      } else {
        await createEntry(entryData as Omit<LogbookEntry, 'id' | 'createdAt' | 'updatedAt' | 'actions' | 'videoBookmarks'>);
      }
      
      setEditingEntry(null);
      setIsFormOpen(false);
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEntry = async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette entrée ?')) {
      try {
        await deleteEntry(id);
      } catch (err) {
        console.error('Erreur lors de la suppression:', err);
      }
    }
  };

  const handleViewDetails = (entry: LogbookEntry) => {
    setSelectedEntry(entry);
    setIsDetailsOpen(true);
  };

  const handleEditEntry = (entry: LogbookEntry) => {
    setEditingEntry(entry);
    setIsFormOpen(true);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      type: 'all',
      priority: 'all',
      status: 'all',
      dateFrom: '',
      dateTo: ''
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
          <span className="text-red-700">Erreur: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Main Courante Électronique</h1>
          <p className="text-gray-600 mt-1">Traçabilité complète des événements et interventions</p>
        </div>
        <button 
          onClick={() => {
            setEditingEntry(null);
            setIsFormOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouvel Événement
        </button>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total événements</p>
              <p className="text-2xl font-bold text-gray-900">{entries.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Critiques</p>
              <p className="text-2xl font-bold text-gray-900">
                {entries.filter(e => e.priority === 'critical').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">En cours</p>
              <p className="text-2xl font-bold text-gray-900">
                {entries.filter(e => e.status === 'in_progress').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Clôturés</p>
              <p className="text-2xl font-bold text-gray-900">
                {entries.filter(e => e.status === 'closed').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <LogbookFilters
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={handleClearFilters}
      />

      {/* Liste des entrées */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Événement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priorité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Horodatage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Localisation
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {getPriorityIcon(entry.priority)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {entry.eventType}
                        </p>
                        <p className="text-sm text-gray-500 line-clamp-2">
                          {entry.description}
                        </p>
                        {entry.equipmentId && (
                          <div className="flex items-center mt-1">
                            <Camera className="h-3 w-3 text-gray-400 mr-1" />
                            <span className="text-xs text-gray-500">Caméra associée</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 capitalize">
                      {entry.type === 'incident' ? 'Incident' :
                       entry.type === 'observation' ? 'Observation' :
                       entry.type === 'requisition' ? 'Réquisition' : entry.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(entry.priority)}`}>
                      {entry.priority === 'critical' ? 'Critique' :
                       entry.priority === 'high' ? 'Élevée' :
                       entry.priority === 'medium' ? 'Moyenne' :
                       entry.priority === 'low' ? 'Faible' : entry.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(entry.status)}`}>
                      {entry.status === 'new' ? 'Nouveau' :
                       entry.status === 'in_progress' ? 'En cours' :
                       entry.status === 'closed' ? 'Clôturé' :
                       entry.status === 'awaiting_requisition' ? 'Attente réquisition' : entry.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-400 mr-1" />
                      <div>
                        <div>{new Date(entry.timestamp).toLocaleDateString('fr-FR')}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(entry.timestamp).toLocaleTimeString('fr-FR')}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {entry.location && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="truncate max-w-32">{entry.location}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleViewDetails(entry)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Voir les détails"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditEntry(entry)}
                        className="text-gray-600 hover:text-gray-800 p-1"
                        title="Modifier"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredEntries.length === 0 && (
        <div className="text-center py-12">
          <Clock className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun événement trouvé</h3>
          <p className="mt-1 text-sm text-gray-500">
            Commencez par créer un nouvel événement ou modifiez vos critères de recherche.
          </p>
        </div>
      )}

      {/* Modales */}
      <LogbookForm
        entry={editingEntry}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingEntry(null);
        }}
        onSave={handleSaveEntry}
        isSubmitting={isSubmitting}
      />

      {selectedEntry && (
        <LogbookDetails
          entry={selectedEntry}
          isOpen={isDetailsOpen}
          onClose={() => {
            setIsDetailsOpen(false);
            setSelectedEntry(null);
          }}
          onEdit={() => {
            setEditingEntry(selectedEntry);
            setIsFormOpen(true);
            setIsDetailsOpen(false);
          }}
          onAddAction={addAction}
        />
      )}
    </div>
  );
};