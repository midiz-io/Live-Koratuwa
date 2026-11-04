import React, { useState, useEffect } from 'react';
import { adminApiService } from '../../services/adminApi';
import DashboardCards from './DashboardCards';
import Charts from './Charts';
import BoxListTable from './BoxListTable';
import SessionsTable from './SessionsTable';

const AdminDashboard = ({ currentPage }) => {
  const [stats, setStats] = useState(null);
  const [boxStats, setBoxStats] = useState([]);
  const [languageStats, setLanguageStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentPage === 'dashboard') {
      loadDashboardData();
    }
  }, [currentPage]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [overviewData, boxesData, languageData] = await Promise.all([
        adminApiService.getOverviewStats(),
        adminApiService.getBoxStats(),
        adminApiService.getLanguageTrends()
      ]);

      setStats(overviewData);
      setBoxStats(boxesData);
      setLanguageStats(languageData);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderPageContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <div>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-garden-600"></div>
              </div>
            ) : (
              <>
                <DashboardCards stats={stats} />
                <Charts boxStats={boxStats} languageStats={languageStats} />
              </>
            )}
          </div>
        );
      case 'boxes':
        return <BoxListTable />;
      case 'sessions':
        return <SessionsTable />;
      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      {renderPageContent()}
    </div>
  );
};

export default AdminDashboard;