import React, { useState, useEffect } from 'react';
import { X, Clock, AlertTriangle, MapPin, Camera, Save } from 'lucide-react';
import { LogbookEntry, Equipment } from '../../types';
import { useEquipments } from '../../hooks/useEquipments';

interface LogbookFormProps {
  entry?: LogbookEntry;
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: Partial<LogbookEntry>) => void;
  isSubmitting?: boolean;
}

const eventTypes = [
  'Vol',
  'Agression',
  'Dégradation',
  'Accident de la route',
  'Dépôt sauvage',
  'Rassemblement',
  'Surveillance de manifestation',
  'Trouble à l\'ordre public',
  'Intervention police',
  'Intervention pompiers',
  'Contrôle de routine',
  'Maintenance technique',
  'Test système',
  'Autre'
];

export const LogbookForm: React.FC<LogbookFormProps> = ({
  entry,
  isOpen,
  onClose,
  onSave,
  isSubmitting = false
}) => {
  const { equipments } = useEquipments();
  const [formData, setFormData] = useState({
    timestamp: entry?.timestamp || new Date().toISOString().slice(0, 16),
    type: entry?.type || 'observation',
    eventType: entry?.eventType || 'Observation',
    priority: entry?.priority || 'medium',
    description: entry?.description || '',
    location: entry?.location || '',
    equipmentId: entry?.equipmentId || '',
    status: entry?.status || 'new',
    isJudicialRequisition: entry?.isJudicialRequisition || false,
    userId: '1' // TODO: Récupérer l'utilisateur connecté
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Réinitialiser le formulaire quand l'entrée change
  useEffect(() => {
    if (entry) {
      setFormData({
        timestamp: entry.timestamp.slice(0, 16),
        type: entry.type,
        eventType: entry.eventType,
        priority: entry.priority,
        description: entry.description,
        location: entry.location || '',
        equipmentId: entry.equipmentId || '',
        status: entry.status,
        isJudicialRequisition: entry.isJudicialRequisition,
        userId: entry.userId
      });
    } else {
      // Nouveau formulaire - horodatage automatique
      setFormData(prev => ({
        ...prev,
        timestamp: new Date().toISOString().slice(0, 16),
        userId: '1' // TODO: Récupérer l'utilisateur connecté
      }));
    }
  }, [entry]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.eventType.trim()) {
      newErrors.eventType = 'Le type d\'événement est requis';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'La description est requise';
    }
    if (!formData.timestamp) {
      newErrors.timestamp = 'L\'horodatage est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave({
        ...formData,
        timestamp: new Date(formData.timestamp).toISOString(),
        id: entry?.id,
        createdAt: entry?.createdAt,
        updatedAt: entry?.updatedAt
      });
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-blue-600" />
            {entry ? 'Modifier l\'événement' : 'Nouvel événement'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Horodatage et identification */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-3">Identification automatique</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horodatage {!entry && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="datetime-local"
                  value={formData.timestamp}
                  onChange={(e) => handleInputChange('timestamp', e.target.value)}
                  disabled={!!entry} // Non modifiable après création
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    entry ? 'bg-gray-100 cursor-not-allowed' : ''
                  } ${errors.timestamp ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.timestamp && <p className="text-red-500 text-sm mt-1">{errors.timestamp}</p>}
                {entry && (
                  <p className="text-xs text-gray-500 mt-1">
                    L'horodatage ne peut pas être modifié après création
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Agent connecté
                </label>
                <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
                  Jean Dupont - Administrateur
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Identification automatique de l'agent
                </p>
              </div>
            </div>
          </div>

          {/* Qualification de l'événement */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type d'événement *
              </label>
              <select
                value={formData.eventType}
                onChange={(e) => handleInputChange('eventType', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.eventType ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                {eventTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.eventType && <p className="text-red-500 text-sm mt-1">{errors.eventType}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="observation">Observation</option>
                <option value="incident">Incident</option>
                <option value="requisition">Réquisition</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Niveau de priorité
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Faible</option>
                <option value="medium">Moyen</option>
                <option value="high">Élevé</option>
                <option value="critical">Critique</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="new">Nouveau</option>
                <option value="in_progress">En cours</option>
                <option value="closed">Clôturé</option>
                <option value="awaiting_requisition">En attente de réquisition</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description détaillée *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Décrivez l'événement en détail..."
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          {/* Localisation et équipement */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                Localisation
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Place de la République, Secteur Nord..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Camera className="h-4 w-4 mr-1" />
                Caméra associée
              </label>
              <select
                value={formData.equipmentId}
                onChange={(e) => handleInputChange('equipmentId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Aucune caméra sélectionnée</option>
                {equipments
                  .filter(eq => eq.type === 'camera' && eq.status === 'active')
                  .map(camera => (
                    <option key={camera.id} value={camera.id}>
                      {camera.name} - {camera.model}
                    </option>
                  ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                La sélection d'une caméra créera automatiquement un bookmark vidéo
              </p>
            </div>
          </div>

          {/* Réquisition judiciaire */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isJudicialRequisition"
              checked={formData.isJudicialRequisition}
              onChange={(e) => handleInputChange('isJudicialRequisition', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isJudicialRequisition" className="ml-2 text-sm text-gray-700 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-1 text-orange-500" />
              Réquisition judiciaire
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Enregistrement...' : entry ? 'Mettre à jour' : 'Créer l\'événement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};