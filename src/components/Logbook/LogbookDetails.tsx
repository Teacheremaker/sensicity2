import React, { useState } from 'react';
import { X, Clock, AlertTriangle, MapPin, Camera, User, Plus, Play, FileText, Shield } from 'lucide-react';
import { LogbookEntry, LogbookAction } from '../../types';

interface LogbookDetailsProps {
  entry: LogbookEntry;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onAddAction: (entryId: number, action: Omit<LogbookAction, 'id' | 'createdAt'>) => Promise<void>;
}

const actionTypes = [
  'Appel Police Nationale',
  'Appel Police Municipale',
  'Appel Pompiers',
  'Appel SAMU',
  'Simple surveillance',
  'Levée de doute négative',
  'Intervention sur site',
  'Contact témoin',
  'Rédaction rapport',
  'Transmission autorités',
  'Archivage vidéo',
  'Autre'
];

export const LogbookDetails: React.FC<LogbookDetailsProps> = ({
  entry,
  isOpen,
  onClose,
  onEdit,
  onAddAction
}) => {
  const [showActionForm, setShowActionForm] = useState(false);
  const [newAction, setNewAction] = useState({
    actionType: 'Simple surveillance',
    description: ''
  });
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

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

  const handleAddAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAction.description.trim()) return;

    setIsSubmittingAction(true);
    try {
      await onAddAction(entry.id, {
        logbookEntryId: entry.id,
        actionType: newAction.actionType,
        description: newAction.description,
        timestamp: new Date().toISOString(),
        userId: '1' // TODO: Récupérer l'utilisateur connecté
      });
      
      setNewAction({ actionType: 'Simple surveillance', description: '' });
      setShowActionForm(false);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'action:', error);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Clock className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{entry.eventType}</h2>
              <p className="text-sm text-gray-500">
                {new Date(entry.timestamp).toLocaleDateString('fr-FR')} à {new Date(entry.timestamp).toLocaleTimeString('fr-FR')}
              </p>
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
              {/* Statuts et priorité */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Statuts et priorité</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Priorité</p>
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(entry.priority)}`}>
                      {entry.priority === 'critical' ? 'Critique' :
                       entry.priority === 'high' ? 'Élevée' :
                       entry.priority === 'medium' ? 'Moyenne' :
                       entry.priority === 'low' ? 'Faible' : entry.priority}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Statut</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(entry.status)}`}>
                      {entry.status === 'new' ? 'Nouveau' :
                       entry.status === 'in_progress' ? 'En cours' :
                       entry.status === 'closed' ? 'Clôturé' :
                       entry.status === 'awaiting_requisition' ? 'Attente réquisition' : entry.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Catégorie</p>
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {entry.type === 'incident' ? 'Incident' :
                       entry.type === 'observation' ? 'Observation' :
                       entry.type === 'requisition' ? 'Réquisition' : entry.type}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Description de l'événement</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{entry.description}</p>
              </div>

              {/* Actions menées */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Actions menées</h3>
                  <button
                    onClick={() => setShowActionForm(true)}
                    className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Ajouter une action
                  </button>
                </div>

                {/* Formulaire d'ajout d'action */}
                {showActionForm && (
                  <form onSubmit={handleAddAction} className="mb-4 p-4 bg-white border border-gray-200 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Type d'action
                        </label>
                        <select
                          value={newAction.actionType}
                          onChange={(e) => setNewAction(prev => ({ ...prev, actionType: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {actionTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description de l'action
                      </label>
                      <textarea
                        value={newAction.description}
                        onChange={(e) => setNewAction(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Décrivez l'action menée..."
                        required
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => setShowActionForm(false)}
                        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmittingAction}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        {isSubmittingAction ? 'Ajout...' : 'Ajouter'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Liste des actions */}
                <div className="space-y-3">
                  {entry.actions && entry.actions.length > 0 ? (
                    entry.actions.map((action, index) => (
                      <div key={action.id || index} className="flex items-start space-x-3 p-3 bg-white rounded border">
                        <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-gray-900">{action.actionType}</p>
                            <span className="text-xs text-gray-500">
                              {new Date(action.timestamp).toLocaleTimeString('fr-FR')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mt-1">{action.description}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">Aucune action enregistrée</p>
                  )}
                </div>
              </div>

              {/* Bookmarks vidéo */}
              {entry.videoBookmarks && entry.videoBookmarks.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Play className="h-5 w-5 mr-2 text-blue-600" />
                    Séquences vidéo associées
                  </h3>
                  <div className="space-y-3">
                    {entry.videoBookmarks.map((bookmark, index) => (
                      <div key={bookmark.id || index} className="flex items-center justify-between p-3 bg-white rounded border">
                        <div className="flex items-center space-x-3">
                          <Camera className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="font-medium text-gray-900">Caméra associée</p>
                            <p className="text-sm text-gray-600">
                              {new Date(bookmark.startTime).toLocaleTimeString('fr-FR')} - {new Date(bookmark.endTime).toLocaleTimeString('fr-FR')}
                            </p>
                          </div>
                        </div>
                        <button className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                          <Play className="h-4 w-4 mr-1" />
                          Voir
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Panneau latéral */}
            <div className="space-y-6">
              {/* Informations générales */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Informations</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Horodatage</p>
                    <p className="font-medium text-gray-900">
                      {new Date(entry.timestamp).toLocaleDateString('fr-FR')} à {new Date(entry.timestamp).toLocaleTimeString('fr-FR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Agent</p>
                    <p className="font-medium text-gray-900 flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      Jean Dupont
                    </p>
                  </div>
                  {entry.location && (
                    <div>
                      <p className="text-sm text-gray-600">Localisation</p>
                      <p className="font-medium text-gray-900 flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {entry.location}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Dernière mise à jour</p>
                    <p className="font-medium text-gray-900">
                      {new Date(entry.updatedAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Réquisition judiciaire */}
              {entry.isJudicialRequisition && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Shield className="h-5 w-5 text-orange-600 mr-2" />
                    <h4 className="font-medium text-orange-900">Réquisition judiciaire</h4>
                  </div>
                  <p className="text-sm text-orange-700">
                    Cet événement fait l'objet d'une réquisition judiciaire. Les données associées sont protégées.
                  </p>
                </div>
              )}

              {/* Actions rapides */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Actions rapides</h3>
                <div className="space-y-2">
                  <button className="w-full flex items-center p-3 text-left hover:bg-white rounded border border-transparent hover:border-gray-200 transition-colors">
                    <FileText className="h-4 w-4 text-blue-600 mr-3" />
                    <span className="text-sm font-medium text-gray-900">Générer rapport</span>
                  </button>
                  <button className="w-full flex items-center p-3 text-left hover:bg-white rounded border border-transparent hover:border-gray-200 transition-colors">
                    <Play className="h-4 w-4 text-green-600 mr-3" />
                    <span className="text-sm font-medium text-gray-900">Voir vidéos</span>
                  </button>
                  <button className="w-full flex items-center p-3 text-left hover:bg-white rounded border border-transparent hover:border-gray-200 transition-colors">
                    <Shield className="h-4 w-4 text-purple-600 mr-3" />
                    <span className="text-sm font-medium text-gray-900">Archiver</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};