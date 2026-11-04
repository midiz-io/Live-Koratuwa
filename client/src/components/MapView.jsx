import React, { useState, useEffect } from 'react';
import { MapPin, Settings, BarChart3 } from 'lucide-react';
import { useSession } from '../contexts/SessionContext';
import api from '../services/api';
import BoxCard from './BoxCard';
import BoxDetailModal from './BoxDetailModal';

const MapView = () => {
  const { sessionKey, language, isBoxVisited, markBoxAsVisited } = useSession();
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBox, setSelectedBox] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (sessionKey) {
      loadBoxes();
    }
  }, [sessionKey]);

  const loadBoxes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/boxes', {
        params: { sessionKey }
      });
      setBoxes(response.data);
    } catch (err) {
      setError('Failed to load garden boxes');
      console.error('Failed to load boxes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBoxClick = async (box) => {
    setSelectedBox(box);
    setShowModal(true);
    
    // Mark box as visited
    await markBoxAsVisited(box.id);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedBox(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-garden-50 to-garden-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-garden-600 mx-auto mb-4"></div>
          <p className="text-garden-600">Loading garden boxes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-garden-50 to-garden-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={loadBoxes}
            className="bg-garden-600 hover:bg-garden-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const visitedCount = boxes.filter(box => isBoxVisited(box.id)).length;
  const totalBoxes = boxes.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-garden-50 to-garden-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-garden-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <MapPin className="w-8 h-8 text-garden-600" />
              <h1 className="text-2xl font-bold text-garden-800">
                Interactive Garden Map
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.open('/admin', '_blank')}
                className="p-2 text-garden-600 hover:text-garden-800 hover:bg-garden-50 rounded-lg transition-colors"
                title="Admin Dashboard"
              >
                <BarChart3 className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-garden-800 mb-4">
              Your Progress
            </h2>
            <div className="flex items-center space-x-4">
              <div className="flex-1 bg-garden-100 rounded-full h-3">
                <div 
                  className="bg-garden-600 h-3 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${totalBoxes > 0 ? (visitedCount / totalBoxes) * 100 : 0}%` 
                  }}
                ></div>
              </div>
              <span className="text-sm font-medium text-garden-600">
                {visitedCount} / {totalBoxes} boxes visited
              </span>
            </div>
          </div>
        </div>

        {/* Garden Map Grid */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-garden-800 mb-6 text-center">
            Garden Boxes
          </h2>
          
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-4xl mx-auto">
            {boxes.map((box) => (
              <BoxCard
                key={box.id}
                box={box}
                isVisited={isBoxVisited(box.id)}
                onClick={() => handleBoxClick(box)}
              />
            ))}
          </div>

          {/* Legend */}
          <div className="mt-8 flex justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-garden-50 border-2 border-garden-300 rounded"></div>
              <span className="text-garden-600">Not visited</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-garden-200 border-2 border-garden-500 rounded relative">
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-garden-600 text-white rounded-full flex items-center justify-center text-xs">✓</span>
              </div>
              <span className="text-garden-600">Visited</span>
            </div>
          </div>
        </div>
      </main>

      {/* Box Detail Modal */}
      <BoxDetailModal
        box={selectedBox}
        isOpen={showModal}
        onClose={handleCloseModal}
        onVisit={markBoxAsVisited}
      />
    </div>
  );
};

export default MapView;
