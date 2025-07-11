import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Building, Save, Shield } from 'lucide-react';
import { User as UserType, Role, Group } from '../../types';

interface UserFormProps {
  user?: UserType;
  roles: Role[];
  groups: Group[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: Partial<UserType>) => void;
  isSubmitting?: boolean;
}

export const UserForm: React.FC<UserFormProps> = ({
  user,
  roles,
  groups,
  isOpen,
  onClose,
  onSave,
  isSubmitting = false
}) => {
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.department || '',
    roleId: user?.roleId || (roles.length > 0 ? roles[0].id : 1),
    status: user?.status || 'active',
    isActive: user?.isActive !== false,
    emailVerified: user?.emailVerified || false,
    failedLoginAttempts: user?.failedLoginAttempts || 0
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Réinitialiser le formulaire quand l'utilisateur change
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || '',
        department: user.department || '',
        roleId: user.roleId,
        status: user.status,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        failedLoginAttempts: user.failedLoginAttempts
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        department: '',
        roleId: roles.length > 0 ? roles[0].id : 1,
        status: 'active',
        isActive: true,
        emailVerified: false,
        failedLoginAttempts: 0
      });
    }
  }, [user, roles]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Le prénom est requis';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Le nom est requis';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }
    if (formData.phone && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Format de téléphone invalide';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave({
        ...formData,
        id: user?.id,
        createdAt: user?.createdAt,
        updatedAt: user?.updatedAt,
        lastLogin: user?.lastLogin,
        lockedUntil: user?.lockedUntil
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <User className="h-5 w-5 mr-2 text-blue-600" />
            {user ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informations personnelles */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2 text-blue-600" />
              Informations personnelles
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prénom *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.firstName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Jean"
                />
                {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.lastName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Dupont"
                />
                {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Mail className="h-4 w-4 mr-1" />
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="jean.dupont@sensicity.fr"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Phone className="h-4 w-4 mr-1" />
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="01 23 45 67 89"
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Building className="h-4 w-4 mr-1" />
                  Département
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Centre de Supervision Urbaine"
                />
              </div>
            </div>
          </div>

          {/* Rôle et permissions */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-blue-600" />
              Rôle et permissions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rôle *
                </label>
                <select
                  value={formData.roleId}
                  onChange={(e) => handleInputChange('roleId', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.name} - {role.description}
                    </option>
                  ))}
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
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                  <option value="suspended">Suspendu</option>
                  <option value="pending">En attente</option>
                </select>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                  Compte actif
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="emailVerified"
                  checked={formData.emailVerified}
                  onChange={(e) => handleInputChange('emailVerified', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="emailVerified" className="ml-2 text-sm text-gray-700">
                  Email vérifié
                </label>
              </div>
            </div>
          </div>

          {/* Informations sur le rôle sélectionné */}
          {formData.roleId && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">
                Permissions du rôle sélectionné
              </h4>
              <div className="text-sm text-blue-700">
                {(() => {
                  const selectedRole = roles.find(r => r.id === formData.roleId);
                  if (selectedRole?.permissions && selectedRole.permissions.length > 0) {
                    return (
                      <div className="grid grid-cols-2 gap-2">
                        {selectedRole.permissions.map(permission => (
                          <div key={permission.id} className="flex items-center">
                            <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                            {permission.description || permission.name}
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return <p>Aucune permission spécifique définie pour ce rôle.</p>;
                })()}
              </div>
            </div>
          )}

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
              {isSubmitting ? 'Enregistrement...' : user ? 'Mettre à jour' : 'Créer l\'utilisateur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};