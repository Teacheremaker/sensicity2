import React from 'react';
import { StatsCard } from './StatsCard';
import { 
  Camera, 
  Shield, 
  AlertTriangle, 
  FileText, 
  Clock,
  CheckCircle,
  XCircle,
  Users
} from 'lucide-react';

// Données simulées pour la démonstration
const mockStats = {
  totalEquipments: 156,
  activeEquipments: 142,
  equipmentsByStatus: {
    active: 142,
    maintenance: 8,
    out_of_service: 6
  },
  expiringAuthorizations: 3,
  recentLogbookEntries: 12,
  pendingAccessRequests: 2
};

const recentActivities = [
  {
    id: 1,
    type: 'equipment',
    message: 'Nouvelle caméra installée - Secteur Nord',
    timestamp: '2024-01-15 14:30',
    status: 'success'
  },
  {
    id: 2,
    type: 'compliance',
    message: 'Autorisation préfectorale expire dans 15 jours',
    timestamp: '2024-01-15 10:15',
    status: 'warning'
  },
  {
    id: 3,
    type: 'logbook',
    message: 'Nouvelle entrée main courante - Incident signalé',
    timestamp: '2024-01-15 09:45',
    status: 'info'
  },
  {
    id: 4,
    type: 'access_request',
    message: 'Nouvelle demande RGPD reçue',
    timestamp: '2024-01-14 16:20',
    status: 'info'
  }
];

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-600 mt-1">Vue d'ensemble de votre système de vidéoprotection</p>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Équipements totaux"
          value={mockStats.totalEquipments}
          icon={Camera}
          trend={{ value: 5.2, isPositive: true }}
          color="blue"
        />
        <StatsCard
          title="Équipements actifs"
          value={mockStats.activeEquipments}
          icon={CheckCircle}
          trend={{ value: 2.1, isPositive: true }}
          color="green"
        />
        <StatsCard
          title="Autorisations à renouveler"
          value={mockStats.expiringAuthorizations}
          icon={AlertTriangle}
          color="yellow"
        />
        <StatsCard
          title="Demandes RGPD en attente"
          value={mockStats.pendingAccessRequests}
          icon={Users}
          color="red"
        />
      </div>

      {/* Graphiques et détails */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Statut des équipements */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Statut des équipements</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">Actifs</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {mockStats.equipmentsByStatus.active}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">En maintenance</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {mockStats.equipmentsByStatus.maintenance}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">Hors service</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {mockStats.equipmentsByStatus.out_of_service}
              </span>
            </div>
          </div>
        </div>

        {/* Activités récentes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activités récentes</h3>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                  activity.status === 'success' ? 'bg-green-500' :
                  activity.status === 'warning' ? 'bg-yellow-500' :
                  activity.status === 'error' ? 'bg-red-500' : 'bg-blue-500'
                }`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Camera className="h-5 w-5 text-blue-600 mr-3" />
            <span className="text-sm font-medium text-gray-900">Ajouter un équipement</span>
          </button>
          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <FileText className="h-5 w-5 text-green-600 mr-3" />
            <span className="text-sm font-medium text-gray-900">Nouvelle entrée main courante</span>
          </button>
          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Shield className="h-5 w-5 text-purple-600 mr-3" />
            <span className="text-sm font-medium text-gray-900">Vérifier conformité</span>
          </button>
        </div>
      </div>
    </div>
  );
};