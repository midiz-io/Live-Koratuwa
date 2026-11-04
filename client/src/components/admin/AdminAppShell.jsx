import React from 'react';
import { 
  BarChart3, 
  LogOut, 
  Home, 
  Package, 
  Users, 
  Download,
  Menu,
  X,
  Globe
} from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext';

const AdminAppShell = ({ children, currentPage, onPageChange }) => {
  const { logout, admin } = useAdmin();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: Home },
    { id: 'boxes', name: 'Garden Boxes', icon: Package },
    { id: 'languages', name: 'Languages', icon: Globe },
    { id: 'sessions', name: 'Sessions', icon: Users },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Fixed width, clean design */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-garden-700 to-garden-800 shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Logo & Title */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-garden-600">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-7 h-7 text-white" />
            <h1 className="text-lg font-bold text-white">Live Karatuwa</h1>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 text-white/80 hover:text-white hover:bg-garden-600 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-4 px-2">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onPageChange(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-white text-garden-800 shadow-md'
                      : 'text-white/90 hover:bg-garden-600 hover:text-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-garden-600' : ''}`} />
                  {item.name}
                </button>
              );
            })}
          </div>
        </nav>

        {/* User info and logout - Fixed at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-garden-600 bg-garden-800">
          <div className="flex items-center justify-between bg-garden-700 rounded-lg p-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{admin?.email || 'Admin'}</p>
              <p className="text-xs text-white/70">Administrator</p>
            </div>
            <button
              onClick={handleLogout}
              className="ml-2 p-2 text-white/80 hover:text-white hover:bg-garden-600 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Compact Top Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between h-14 px-4 sm:px-6">
            {/* Mobile menu button */}
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h2 className="ml-2 text-lg font-semibold text-gray-800 capitalize lg:ml-0">
                {navigation.find(item => item.id === currentPage)?.name || 'Dashboard'}
              </h2>
            </div>
            
            {/* Export button */}
            <button
              onClick={() => {
                window.open('/api/admin/export/csv', '_blank');
              }}
              className="flex items-center space-x-2 px-3 py-2 bg-garden-600 text-white text-sm font-medium rounded-lg hover:bg-garden-700 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export Data</span>
              <span className="sm:hidden">Export</span>
            </button>
          </div>
        </header>

        {/* Page content - Reduced padding */}
        <main className="p-4 sm:p-5 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminAppShell;
