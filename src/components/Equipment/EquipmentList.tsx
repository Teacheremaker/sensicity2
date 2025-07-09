import React, { useState } from 'react';
import { Camera, Server, Wifi, MoreVertical, MapPin, Calendar, AlertCircle, Plus, Eye, Edit, Trash2, Download } from 'lucide-react';
import { Equipment } from '../../types';
import { useEquipments } from '../../hooks/useEquipments';
import { EquipmentForm } from './EquipmentForm';
import { EquipmentDetails } from './EquipmentDetails';
import { EquipmentFilters } from './EquipmentFilters';
import { EquipmentStats } from './EquipmentStats';
import { ImportExportActions } from './ImportExportActions';

const getStatusColor = (status: Equipment['status']) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800';
    case 'maintenance': return 'bg-yellow-100 text-yellow-800';
    case 'out_of_service': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getConformityColor = (status: Equipment['conformityStatus']) => {
  switch (status) {
    case 'compliant': return 'bg-green-100 text-green-800';
    case 'non_compliant': return 'bg-red-100 text-red-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getTypeIcon = (type: Equipment['type']) => {
  switch (type) {
    case 'camera': return Camera;
    case 'server': return Server;
    case 'switch': return Wifi;
    default: return Camera;
  }
};

export const EquipmentList: React.FC = () => {
  const { 
    equipments, 
    loading, 
    error, 
    createEquipment, 
    updateEquipment, 
    deleteEquipment, 
    deleteMultipleEquipments 
  } = useEquipments();
  
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    status: 'all',
    conformity: 'all',
    location: 'all'
  });
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'stats'>('list');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fonction pour gérer l'import
  const handleImport = async (importedEquipments: Partial<Equipment>[]) => {
    try {
      for (const equipmentData of importedEquipments) {
        await createEquipment(equipmentData as Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>);
      }
    } catch (error) {
      console.error('Erreur lors de l\'import:', error);
      throw error;
    }
  };

  const filteredEquipments = equipments.filter(equipment => {
    const matchesSearch = filters.search === '' || 
      equipment.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      equipment.model.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesType = filters.type === 'all' || equipment.type === filters.type;
    const matchesStatus = filters.status === 'all' || equipment.status === filters.status;
    const matchesConformity = filters.conformity === 'all' || equipment.conformityStatus === filters.conformity;
    
    return matchesSearch && matchesType && matchesStatus && matchesConformity;
  });

  const handleSaveEquipment = async (equipmentData: Partial<Equipment>) => {
    try {
      setIsSubmitting(true);
      
      if (editingEquipment) {
        // Modification
        await updateEquipment(editingEquipment.id, equipmentData);
      } else {
        // Création
        await createEquipment(equipmentData as Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>);
      }
      
      setEditingEquipment(null);
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
      // Vous pouvez ajouter une notification d'erreur ici
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEquipment = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet équipement ?')) {
      try {
        await deleteEquipment(id);
      } catch (err) {
        console.error('Erreur lors de la suppression:', err);
        // Vous pouvez ajouter une notification d'erreur ici
      }
    }
  };

  const handleViewDetails = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setIsDetailsOpen(true);
  };

  const handleEditEquipment = (equipment: Equipment) => {
    setEditingEquipment(equipment);
    setIsFormOpen(true);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      type: 'all',
      status: 'all',
      conformity: 'all',
      location: 'all'
    });
  };

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === filteredEquipments.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredEquipments.map(eq => eq.id));
    }
  };

  const handleBulkAction = async (action: string) => {
    switch (action) {
      case 'delete':
        if (confirm(`Êtes-vous sûr de vouloir supprimer ${selectedItems.length} équipement(s) ?`)) {
          try {
            await deleteMultipleEquipments(selectedItems);
            setSelectedItems([]);
          } catch (err) {
            console.error('Erreur lors de la suppression en lot:', err);
            // Vous pouvez ajouter une notification d'erreur ici
          }
        }
        break;
      case 'export':
        // Logique d'export
        console.log('Export des équipements sélectionnés:', selectedItems);
        break;
    }
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
          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
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
          <h1 className="text-2xl font-bold text-gray-900">Inventaire des équipements</h1>
          <p className="text-gray-600 mt-1">Gestion et suivi de votre parc de vidéoprotection</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Liste
            </button>
            <button
              onClick={() => setViewMode('stats')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'stats' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Statistiques
            </button>
          </div>
          <button 
            onClick={() => {
              setEditingEquipment(null);
              setIsFormOpen(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un équipement
          </button>
        </div>
      </div>

      {/* Actions d'import/export */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Import / Export</h3>
            <p className="text-sm text-gray-600 mt-1">
              Exportez vos données ou importez des équipements depuis un fichier Excel
            </p>
          </div>
          <ImportExportActions 
            equipments={filteredEquipments} 
            onImport={handleImport}
          />
        </div>
      </div>

      {/* Filtres */}
      <EquipmentFilters
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={handleClearFilters}
      />

      {/* Vue Statistiques */}
      {viewMode === 'stats' && (
        <EquipmentStats equipments={filteredEquipments} />
      )}

      {/* Vue Liste */}
      {viewMode === 'list' && (
        <>
          {/* Actions en lot */}
          {selectedItems.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-blue-900">
                    {selectedItems.length} équipement(s) sélectionné(s)
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleBulkAction('export')}
                    className="flex items-center px-3 py-1 text-sm bg-white border border-blue-300 text-blue-700 rounded hover:bg-blue-50"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Exporter
                  </button>
                  <button
                    onClick={() => handleBulkAction('delete')}
                    className="flex items-center px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Liste des équipements */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedItems.length === filteredEquipments.length && filteredEquipments.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Équipement
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Conformité
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dernière maintenance
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
                  {filteredEquipments.map((equipment) => {
                    const TypeIcon = getTypeIcon(equipment.type);
                    return (
                      <tr key={equipment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(equipment.id)}
                            onChange={() => handleSelectItem(equipment.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                <TypeIcon className="h-5 w-5 text-blue-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {equipment.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {equipment.model}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900 capitalize">
                            {equipment.type === 'camera' ? 'Caméra' : 
                             equipment.type === 'server' ? 'Serveur' : 
                             equipment.type === 'switch' ? 'Switch' : equipment.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(equipment.status)}`}>
                            {equipment.status === 'active' ? 'Actif' :
                             equipment.status === 'maintenance' ? 'Maintenance' :
                             equipment.status === 'out_of_service' ? 'Hors service' : equipment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getConformityColor(equipment.conformityStatus)}`}>
                            {equipment.conformityStatus === 'compliant' ? 'Conforme' :
                             equipment.conformityStatus === 'non_compliant' ? 'Non conforme' :
                             equipment.conformityStatus === 'pending' ? 'En attente' : equipment.conformityStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                            {equipment.lastMaintenance ? 
                              new Date(equipment.lastMaintenance).toLocaleDateString('fr-FR') : 
                              'Aucune'
                            }
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                            {equipment.latitude.toFixed(4)}, {equipment.longitude.toFixed(4)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleViewDetails(equipment)}
                              className="text-blue-600 hover:text-blue-800 p-1"
                              title="Voir les détails"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEditEquipment(equipment)}
                              className="text-gray-600 hover:text-gray-800 p-1"
                              title="Modifier"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteEquipment(equipment.id)}
                              className="text-red-600 hover:text-red-800 p-1"
                              title="Supprimer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {filteredEquipments.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun équipement trouvé</h3>
          <p className="mt-1 text-sm text-gray-500">
            Essayez de modifier vos critères de recherche.
          </p>
        </div>
      )}

      {/* Modales */}
      <EquipmentForm
        equipment={editingEquipment}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingEquipment(null);
        }}
        onSave={handleSaveEquipment}
        isSubmitting={isSubmitting}
      />

      {selectedEquipment && (
        <EquipmentDetails
          equipment={selectedEquipment}
          isOpen={isDetailsOpen}
          onClose={() => {
            setIsDetailsOpen(false);
            setSelectedEquipment(null);
          }}
          onEdit={() => {
            setEditingEquipment(selectedEquipment);
            setIsFormOpen(true);
            setIsDetailsOpen(false);
          }}
        />
      )}
    </div>
  );
};