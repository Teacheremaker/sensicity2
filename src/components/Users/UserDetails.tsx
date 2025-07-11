import React from 'react';
import { X, User, Mail, Phone, Building, Shield, Clock, AlertTriangle, CheckCircle, Edit } from 'lucide-react';
import { User as UserType, Role, Group } from '../../types';

interface UserDetailsProps {
  user: UserType;
  roles: Role[];
  groups: Group[];
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
}

export const UserDetails: React.FC<UserDetailsProps> = ({
  user,
  roles,
  groups,
  isOpen,
  onClose,
  onEdit
}) => {
  if (!isOpen) return null;

  const getStatusColor = (status: UserType['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: UserType['status']) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'inactive': return <Clock className="h-5 w-5 text-gray-600" />;
      case 'suspended': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'pending': return <Clock className="h-5 w-5 text-yellow-600" />;
      default: return <Shield className="h-5 w-5 text-gray-600" />;
    }
  };

  const getUserRole = () => {
    return roles.find(r => r.id === user.roleId);
  };

  const getUserGroups = () => {
    // En production, cette information viendrait de la base de données
    return groups.filter(g => g.users?.some(u => u.id === user.id));
  };

  const role = getUserRole();
  const userGroups = getUserGroups();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-lg font-medium text-blue-600">
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors flex items-center"
            >
              <Edit className="h-4 w-4 mr-2" />
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
              {/* Statut et informations de base */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Informations générales</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Statut</p>
                    <div className="flex items-center mt-1">
                      {getStatusIcon(user.status)}
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                        {user.status === 'active' ? 'Actif' :
                         user.status === 'inactive' ? 'Inactif' :
                         user.status === 'suspended' ? 'Suspendu' :
                         user.status === 'pending' ? 'En attente' : user.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Compte actif</p>
                    <p className="font-medium text-gray-900 mt-1">
                      {user.isActive ? 'Oui' : 'Non'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email vérifié</p>
                    <div className="flex items-center mt-1">
                      {user.emailVerified ? (
                        <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-yellow-600 mr-1" />
                      )}
                      <span className="text-sm font-medium text-gray-900">
                        {user.emailVerified ? 'Vérifié' : 'Non vérifié'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tentatives de connexion échouées</p>
                    <p className="font-medium text-gray-900 mt-1">
                      {user.failedLoginAttempts}
                    </p>
                  </div>
                </div>
              </div>

              {/* Informations de contact */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-600" />
                  Informations de contact
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 flex items-center">
                      <Mail className="h-4 w-4 mr-1" />
                      Email
                    </p>
                    <p className="font-medium text-gray-900 mt-1">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      Téléphone
                    </p>
                    <p className="font-medium text-gray-900 mt-1">
                      {user.phone || 'Non renseigné'}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600 flex items-center">
                      <Building className="h-4 w-4 mr-1" />
                      Département
                    </p>
                    <p className="font-medium text-gray-900 mt-1">
                      {user.department || 'Non renseigné'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Rôle et permissions */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-blue-600" />
                  Rôle et permissions
                </h3>
                {role && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Rôle assigné</p>
                      <div className="mt-1">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {role.name}
                        </span>
                        <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                      </div>
                    </div>
                    
                    {role.permissions && role.permissions.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Permissions</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {role.permissions.map(permission => (
                            <div key={permission.id} className="flex items-center p-2 bg-white rounded border">
                              <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {permission.description || permission.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {permission.module} - {permission.action}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Groupes */}
              {userGroups.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Groupes d'appartenance</h3>
                  <div className="space-y-2">
                    {userGroups.map(group => (
                      <div key={group.id} className="flex items-center p-3 bg-white rounded border">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{group.name}</p>
                          <p className="text-sm text-gray-600">{group.description}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          group.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {group.isActive ? 'Actif' : 'Inactif'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Panneau latéral */}
            <div className="space-y-6">
              {/* Dates importantes */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-blue-600" />
                  Historique
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Création du compte</p>
                    <p className="font-medium text-gray-900">
                      {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Dernière modification</p>
                    <p className="font-medium text-gray-900">
                      {new Date(user.updatedAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Dernière connexion</p>
                    <p className="font-medium text-gray-900">
                      {user.lastLogin ? 
                        new Date(user.lastLogin).toLocaleDateString('fr-FR') : 
                        'Jamais connecté'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions rapides */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Actions rapides</h3>
                <div className="space-y-2">
                  <button className="w-full flex items-center p-3 text-left hover:bg-white rounded border border-transparent hover:border-gray-200 transition-colors">
                    <Mail className="h-4 w-4 text-blue-600 mr-3" />
                    <span className="text-sm font-medium text-gray-900">Envoyer un email</span>
                  </button>
                  <button className="w-full flex items-center p-3 text-left hover:bg-white rounded border border-transparent hover:border-gray-200 transition-colors">
                    <Shield className="h-4 w-4 text-green-600 mr-3" />
                    <span className="text-sm font-medium text-gray-900">Réinitialiser mot de passe</span>
                  </button>
                  <button className="w-full flex items-center p-3 text-left hover:bg-white rounded border border-transparent hover:border-gray-200 transition-colors">
                    <Clock className="h-4 w-4 text-purple-600 mr-3" />
                    <span className="text-sm font-medium text-gray-900">Voir l'historique</span>
                  </button>
                </div>
              </div>

              {/* Alertes */}
              {user.status === 'suspended' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                    <h4 className="font-medium text-red-900">Compte suspendu</h4>
                  </div>
                  <p className="text-sm text-red-700">
                    Ce compte utilisateur est actuellement suspendu et ne peut pas accéder à la plateforme.
                  </p>
                </div>
              )}

              {!user.emailVerified && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                    <h4 className="font-medium text-yellow-900">Email non vérifié</h4>
                  </div>
                  <p className="text-sm text-yellow-700">
                    L'adresse email de cet utilisateur n'a pas encore été vérifiée.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};