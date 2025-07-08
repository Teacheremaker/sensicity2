import React from 'react';
import { Camera, Server, Wifi, CheckCircle, AlertTriangle, Settings } from 'lucide-react';
import { Equipment } from '../../types';

interface EquipmentStatsProps {
  equipments: Equipment[];
}

export const EquipmentStats: React.FC<EquipmentStatsProps> = ({ equipments }) => {
  const stats = {
    total: equipments.length,
    byType: {
      camera: equipments.filter(eq => eq.type === 'camera').length,
      server: equipments.filter(eq => eq.type === 'server').length,
      switch: equipments.filter(eq => eq.type === 'switch').length,
      other: equipments.filter(eq => eq.type === 'other').length,
    },
    byStatus: {
      active: equipments.filter(eq => eq.status === 'active').length,
      maintenance: equipments.filter(eq => eq.status === 'maintenance').length,
      out_of_service: equipments.filter(eq => eq.status === 'out_of_service').length,
    },
    byConformity: {
      compliant: equipments.filter(eq => eq.conformityStatus === 'compliant').length,
      non_compliant: equipments.filter(eq => eq.conformityStatus === 'non_compliant').length,
      pending: equipments.filter(eq => eq.conformityStatus === 'pending').length,
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, percentage }: {
    title: string;
    value: number;
    icon: any;
    color: string;
    percentage?: number;
  }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {percentage !== undefined && (
            <p className="text-sm text-gray-500 mt-1">
              {percentage.toFixed(1)}% du total
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Vue d'ensemble */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total équipements"
          value={stats.total}
          icon={Camera}
          color="bg-blue-100 text-blue-600"
        />
        <StatCard
          title="Actifs"
          value={stats.byStatus.active}
          icon={CheckCircle}
          color="bg-green-100 text-green-600"
          percentage={(stats.byStatus.active / stats.total) * 100}
        />
        <StatCard
          title="En maintenance"
          value={stats.byStatus.maintenance}
          icon={Settings}
          color="bg-yellow-100 text-yellow-600"
          percentage={(stats.byStatus.maintenance / stats.total) * 100}
        />
        <StatCard
          title="Hors service"
          value={stats.byStatus.out_of_service}
          icon={AlertTriangle}
          color="bg-red-100 text-red-600"
          percentage={(stats.byStatus.out_of_service / stats.total) * 100}
        />
      </div>

      {/* Répartition par type et conformité */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Par type */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition par type</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Camera className="h-5 w-5 text-blue-600 mr-3" />
                <span className="text-sm font-medium text-gray-700">Caméras</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-bold text-gray-900 mr-2">{stats.byType.camera}</span>
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(stats.byType.camera / stats.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Server className="h-5 w-5 text-green-600 mr-3" />
                <span className="text-sm font-medium text-gray-700">Serveurs</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-bold text-gray-900 mr-2">{stats.byType.server}</span>
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${(stats.byType.server / stats.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Wifi className="h-5 w-5 text-purple-600 mr-3" />
                <span className="text-sm font-medium text-gray-700">Switches</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-bold text-gray-900 mr-2">{stats.byType.switch}</span>
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{ width: `${(stats.byType.switch / stats.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Par conformité */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">État de conformité</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium text-gray-700">Conforme</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-bold text-gray-900 mr-2">{stats.byConformity.compliant}</span>
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${(stats.byConformity.compliant / stats.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium text-gray-700">Non conforme</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-bold text-gray-900 mr-2">{stats.byConformity.non_compliant}</span>
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full" 
                    style={{ width: `${(stats.byConformity.non_compliant / stats.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium text-gray-700">En attente</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-bold text-gray-900 mr-2">{stats.byConformity.pending}</span>
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full" 
                    style={{ width: `${(stats.byConformity.pending / stats.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};