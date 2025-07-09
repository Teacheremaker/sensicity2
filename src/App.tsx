import React, { useState } from 'react';
import { useEffect } from 'react';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { Dashboard } from './components/Dashboard/Dashboard';
import { EquipmentList } from './components/Equipment/EquipmentList';
import { LoginForm } from './components/Auth/LoginForm';
import { LogbookList } from './components/Logbook/LogbookList';

// Simulation d'un utilisateur connecté
const mockUser = {
  id: '1',
  email: 'admin@sensicity.fr',
  firstName: 'Jean',
  lastName: 'Dupont',
  role: 'Administrateur',
  isActive: true,
  roleId: 1,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z'
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Écouter les événements de navigation depuis le header
  useEffect(() => {
    const handleNavigate = (event: CustomEvent) => {
      setActiveSection(event.detail);
    };

    window.addEventListener('navigate', handleNavigate as EventListener);
    return () => window.removeEventListener('navigate', handleNavigate as EventListener);
  }, []);

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setLoginError('');

    // Simulation d'une authentification
    setTimeout(() => {
      if (email === 'admin@sensicity.fr' && password === 'admin123') {
        setIsAuthenticated(true);
      } else {
        setLoginError('Identifiants incorrects');
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setActiveSection('dashboard');
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'equipment':
        return <EquipmentList />;
      case 'map':
        return (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900">Cartographie</h2>
            <p className="text-gray-600 mt-2">Module en cours de développement</p>
          </div>
        );
      case 'compliance':
        return (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900">Gestion de la Conformité</h2>
            <p className="text-gray-600 mt-2">Module en cours de développement</p>
          </div>
        );
      case 'logbook':
        return <LogbookList />;
      case 'access-requests':
        return (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900">Demandes RGPD</h2>
            <p className="text-gray-600 mt-2">Module en cours de développement</p>
          </div>
        );
      case 'documents':
        return (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900">Gestion Documentaire</h2>
            <p className="text-gray-600 mt-2">Module en cours de développement</p>
          </div>
        );
      case 'users':
        return (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900">Gestion des Utilisateurs</h2>
            <p className="text-gray-600 mt-2">Module en cours de développement</p>
          </div>
        );
      case 'settings':
        return (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900">Paramètres</h2>
            <p className="text-gray-600 mt-2">Module en cours de développement</p>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  if (!isAuthenticated) {
    return (
      <LoginForm 
        onLogin={handleLogin} 
        isLoading={isLoading}
        error={loginError}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={mockUser} onLogout={handleLogout} />
      <div className="flex">
        <Sidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection} 
        />
        <main className="flex-1 p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;