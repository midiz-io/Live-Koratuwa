import React from 'react';
import { BarChart3, ArrowLeft } from 'lucide-react';

const AdminPlaceholder = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-garden-50 to-garden-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-garden-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-8 h-8 text-garden-600" />
              <h1 className="text-2xl font-bold text-garden-800">
                Admin Dashboard
              </h1>
            </div>
            <button
              onClick={() => window.history.back()}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Garden</span>
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-garden-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <BarChart3 className="w-8 h-8 text-garden-600" />
          </div>
          
          <h2 className="text-3xl font-bold text-garden-800 mb-4">
            Admin Dashboard
          </h2>
          
          <p className="text-xl text-garden-600 mb-8">
            Coming in STEP E - Admin Panel Implementation
          </p>
          
          <div className="bg-garden-50 rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-garden-800 mb-4">
              Planned Features:
            </h3>
            <ul className="text-left text-garden-600 space-y-2">
              <li>• Analytics overview with total sessions and views</li>
              <li>• Box popularity statistics</li>
              <li>• Language usage trends</li>
              <li>• Session management and monitoring</li>
              <li>• CSV export functionality</li>
            </ul>
          </div>
          
          <div className="mt-8">
            <button
              onClick={() => window.history.back()}
              className="bg-garden-600 hover:bg-garden-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Return to Garden Map
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminPlaceholder;
