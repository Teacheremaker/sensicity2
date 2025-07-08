import React from 'react';
import { Filter, X } from 'lucide-react';

interface EquipmentFiltersProps {
  filters: {
    search: string;
    type: string;
    status: string;
    conformity: string;
    location: string;
  };
  onFiltersChange: (filters: any) => void;
  onClearFilters: () => void;
}

export const EquipmentFilters: React.FC<EquipmentFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters
}) => {
  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '' && value !== 'all');

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Filter className="h-5 w-5 text-gray-400 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Filtres</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center text-sm text-gray-600 hover:text-gray-800"
          >
            <X className="h-4 w-4 mr-1" />
            Effacer les filtres
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Recherche */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Recherche
          </label>
          <input
            type="text"
            placeholder="Nom, modèle..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tous les types</option>
            <option value="camera">Caméra</option>
            <option value="server">Serveur</option>
            <option value="switch">Switch</option>
            <option value="other">Autre</option>
          </select>
        </div>

        {/* Statut */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Statut
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="maintenance">En maintenance</option>
            <option value="out_of_service">Hors service</option>
          </select>
        </div>

        {/* Conformité */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Conformité
          </label>
          <select
            value={filters.conformity}
            onChange={(e) => handleFilterChange('conformity', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Toutes</option>
            <option value="compliant">Conforme</option>
            <option value="non_compliant">Non conforme</option>
            <option value="pending">En attente</option>
          </select>
        </div>

        {/* Localisation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Zone
          </label>
          <select
            value={filters.location}
            onChange={(e) => handleFilterChange('location', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Toutes les zones</option>
            <option value="north">Secteur Nord</option>
            <option value="south">Secteur Sud</option>
            <option value="east">Secteur Est</option>
            <option value="west">Secteur Ouest</option>
            <option value="center">Centre-ville</option>
          </select>
        </div>
      </div>

      {/* Filtres actifs */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {filters.search && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                Recherche: "{filters.search}"
                <button
                  onClick={() => handleFilterChange('search', '')}
                  className="ml-2 hover:text-blue-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.type !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                Type: {filters.type === 'camera' ? 'Caméra' : filters.type === 'server' ? 'Serveur' : filters.type}
                <button
                  onClick={() => handleFilterChange('type', 'all')}
                  className="ml-2 hover:text-green-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.status !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
                Statut: {filters.status === 'active' ? 'Actif' : filters.status === 'maintenance' ? 'Maintenance' : 'Hors service'}
                <button
                  onClick={() => handleFilterChange('status', 'all')}
                  className="ml-2 hover:text-yellow-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};