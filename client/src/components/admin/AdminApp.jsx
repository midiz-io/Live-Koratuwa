import React, { useState } from 'react';
import { AdminProvider, useAdmin } from '../../contexts/AdminContext';
import AdminLoginForm from './AdminLoginForm';
import AdminAppShell from './AdminAppShell';
import AdminDashboard from './AdminDashboard';
import LanguageManagement from './LanguageManagement';

const AdminAppContent = () => {
  const { isAuthenticated, loading } = useAdmin();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-garden-50 to-garden-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-garden-600 mx-auto mb-4"></div>
          <p className="text-garden-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLoginForm />;
  }

  return (
    <AdminAppShell currentPage={currentPage} onPageChange={setCurrentPage}>
      {currentPage === 'languages' ? (
        <LanguageManagement />
      ) : (
        <AdminDashboard currentPage={currentPage} />
      )}
    </AdminAppShell>
  );
};

const AdminApp = () => {
  return (
    <AdminProvider>
      <AdminAppContent />
    </AdminProvider>
  );
};

export default AdminApp;
