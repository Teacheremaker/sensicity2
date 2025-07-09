import React from 'react';
import { Shield, User, Bell, Settings, LogOut } from 'lucide-react';

interface HeaderProps {
  user?: {
    firstName: string;
    lastName: string;
    role: string;
  };
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo et titre */}
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <h1 className="text-xl font-semibold text-gray-900">Sensicity</h1>
              <p className="text-xs text-gray-500">Gestion Vidéoprotection</p>
            </div>
          </div>

          {/* Navigation principale */}
          <nav className="hidden md:flex space-x-8">
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'dashboard' }))}
              className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
            >
              Tableau de bord
            </button>
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'equipment' }))}
              className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
            >
              Inventaire
            </button>
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'compliance' }))}
              className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
            >
              Conformité
            </button>
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'logbook' }))}
              className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
            >
              Main courante
            </button>
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'documents' }))}
              className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
            >
              Documents
            </button>
          </nav>

          {/* Actions utilisateur */}
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Bell className="h-5 w-5" />
            </button>
            
            {user && (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{user.role}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <Settings className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={onLogout}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};