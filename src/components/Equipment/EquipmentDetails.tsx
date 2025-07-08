import React from 'react';
import { X, MapPin, Calendar, Settings, FileText, AlertTriangle, CheckCircle } from 'lucide-react';
import { Equipment } from '../../types';

interface EquipmentDetailsProps {
  equipment: Equipment;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
}

export const EquipmentDetails: React.FC<EquipmentDetailsProps> = ({
  equipment,
  isOpen,
  onClose,
  onEdit
}) => {
  if (!isOpen) return null;

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

  const getStatusIcon = (status: Equipment['status']) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'maintenance': return <Settings className="h-5 w-5 text-yellow-600" />;
      case 'out_of_service': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default: return <AlertTriangle className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            {getStatusIcon(equipment.status)}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{equipment.name}</h2>
              <p className="text-sm text-gray-500">{equipment.model}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
            >
              Modifier
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Informations principales */}
            <div className="lg:col-span-2 space-y-6">
              {/* Statuts */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Statuts</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Statut opérationnel</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(equipment.status)}`}>
                      {equipment.status === 'active' ? 'Actif' :
                       equipment.status === 'maintenance' ? 'Maintenance' :
                       equipment.status === 'out_of_service' ? 'Hors service' : equipment.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Conformité</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getConformityColor(equipment.conformityStatus)}`}>
                      {equipment.conformityStatus === 'compliant' ? 'Conforme' :
                       equipment.conformityStatus === 'non_compliant' ? 'Non conforme' :
                       equipment.conformityStatus === 'pending' ? 'En attente' : equipment.conformityStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Informations techniques */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Informations techniques</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Type</p>
                    <p className="font-medium text-gray-900 capitalize">
                      {equipment.type === 'camera' ? 'Caméra' : 
                       equipment.type === 'server' ? 'Serveur' : 
                       equipment.type === 'switch' ? 'Switch' : equipment.type}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Modèle</p>
                    <p className="font-medium text-gray-900">{equipment.model}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">ID Équipement</p>
                    <p className="font-medium text-gray-900 font-mono text-sm">{equipment.id}</p>
                  </div>
                </div>
              </div>

              {/* Localisation */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                  Localisation
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Latitude</p>
                    <p className="font-medium text-gray-900 font-mono">{equipment.latitude.toFixed(6)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Longitude</p>
                    <p className="font-medium text-gray-900 font-mono">{equipment.longitude.toFixed(6)}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    Voir sur la carte →
                  </button>
                </div>
              </div>

              {/* Historique de maintenance */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-blue-600" />
                  Maintenance
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white rounded border">
                    <div>
                      <p className="font-medium text-gray-900">Maintenance préventive</p>
                      <p className="text-sm text-gray-600">Nettoyage et vérification générale</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {equipment.lastMaintenance ? 
                          new Date(equipment.lastMaintenance).toLocaleDateString('fr-FR') : 
                          'Aucune'
                        }
                      </p>
                      <p className="text-xs text-gray-500">Dernière intervention</p>
                    </div>
                  </div>
                  <button className="w-full text-blue-600 hover:text-blue-800 text-sm font-medium py-2">
                    Voir l'historique complet →
                  </button>
                </div>
              </div>
            </div>

            {/* Panneau latéral */}
            <div className="space-y-6">
              {/* Dates importantes */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                  Dates importantes
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Installation</p>
                    <p className="font-medium text-gray-900">
                      {new Date(equipment.installationDate).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Dernière maintenance</p>
                    <p className="font-medium text-gray-900">
                      {equipment.lastMaintenance ? 
                        new Date(equipment.lastMaintenance).toLocaleDateString('fr-FR') : 
                        'Aucune'
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Dernière mise à jour</p>
                    <p className="font-medium text-gray-900">
                      {new Date(equipment.updatedAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions rapides */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Actions rapides</h3>
                <div className="space-y-2">
                  <button className="w-full flex items-center p-3 text-left hover:bg-white rounded border border-transparent hover:border-gray-200 transition-colors">
                    <Settings className="h-4 w-4 text-blue-600 mr-3" />
                    <span className="text-sm font-medium text-gray-900">Programmer maintenance</span>
                  </button>
                  <button className="w-full flex items-center p-3 text-left hover:bg-white rounded border border-transparent hover:border-gray-200 transition-colors">
                    <FileText className="h-4 w-4 text-green-600 mr-3" />
                    <span className="text-sm font-medium text-gray-900">Voir documents</span>
                  </button>
                  <button className="w-full flex items-center p-3 text-left hover:bg-white rounded border border-transparent hover:border-gray-200 transition-colors">
                    <MapPin className="h-4 w-4 text-purple-600 mr-3" />
                    <span className="text-sm font-medium text-gray-900">Localiser sur carte</span>
                  </button>
                </div>
              </div>

              {/* Alertes */}
              {equipment.conformityStatus === 'non_compliant' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                    <h4 className="font-medium text-red-900">Alerte conformité</h4>
                  </div>
                  <p className="text-sm text-red-700">
                    Cet équipement n'est pas conforme aux exigences réglementaires.
                  </p>
                  <button className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium">
                    Voir les détails →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};