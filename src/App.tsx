import React, { useState } from 'react';
import { useEffect } from 'react';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { Dashboard } from './components/Dashboard/Dashboard';
import { EquipmentList } from './components/Equipment/EquipmentList';
import { LogbookList } from './components/Logbook/LogbookList';
import { UsersList } from './components/Users/UsersList';
import { LoginForm } from './components/Auth/LoginForm';
import { AuthContext, useAuthProvider } from './hooks/useAuth';

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
  const authProvider = useAuthProvider();
  const [activeSection, setActiveSection] = useState('dashboard');

  // Écouter les événements de navigation depuis le header
  useEffect(() => {
    const handleNavigate = (event: CustomEvent) => {
      setActiveSection(event.detail);
    };

    window.addEventListener('navigate', handleNavigate as EventListener);
    return () => window.removeEventListener('navigate', handleNavigate as EventListener);
  }, []);

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
          <UsersList />
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

  if (authProvider.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!authProvider.user) {
    return (
      <AuthContext.Provider value={authProvider}>
        <LoginForm />
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={authProvider}>
      <div className="min-h-screen bg-gray-50">
        <Header user={authProvider.user} onLogout={authProvider.logout} />
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
    </AuthContext.Provider>
  );
}

export default App;