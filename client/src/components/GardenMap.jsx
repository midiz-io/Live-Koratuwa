import React, { useState, useEffect } from 'react';
import { RefreshCw, Globe } from 'lucide-react';
import BoxDetail from './BoxDetail';
import api from '../services/api';

const GardenMap = ({ language, visitedBoxes, onBoxVisit, onResetSession }) => {
  const [selectedBox, setSelectedBox] = useState(null);
  const [gardenBoxes, setGardenBoxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Fetch boxes from API
  useEffect(() => {
    const fetchBoxes = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/boxes');
        console.log('GardenMap - Fetched boxes:', response.data);
        console.log('GardenMap - First box:', response.data[0]);
        setGardenBoxes(response.data);
      } catch (err) {
        console.error('Error fetching boxes:', err);
        setError('Failed to load garden boxes. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBoxes();
  }, [language]); // Refetch when language changes

  const handleBoxClick = (box) => {
    setSelectedBox(box);
    onBoxVisit(box.id);
  };

  const handleCloseDetail = () => {
    setSelectedBox(null);
  };

  const handleResetClick = () => {
    setShowResetConfirm(true);
  };

  const handleConfirmReset = () => {
    setShowResetConfirm(false);
    onResetSession();
  };

  const handleCancelReset = () => {
    setShowResetConfirm(false);
  };

  const visitedCount = visitedBoxes.size;
  const totalBoxes = gardenBoxes.length;
  const progressPercentage = totalBoxes > 0 ? (visitedCount / totalBoxes) * 100 : 0;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600 mb-4"></div>
          <p className="text-xl text-green-700 font-semibold">Loading garden boxes...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <h1 className="text-3xl font-bold text-green-800 mb-2">
                🌱 Interactive Garden Map
              </h1>
              <p className="text-green-600">
                Explore our garden boxes and learn about different vegetables
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Progress Stats */}
              <div className="text-right">
                <div className="text-2xl font-bold text-green-700">
                  {visitedCount}/{totalBoxes}
                </div>
                <div className="text-sm text-green-600">Boxes Visited</div>
              </div>
              
              {/* Reset Session Button */}
              <button
                onClick={handleResetClick}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
                title="Change language or start over"
              >
                <Globe className="w-5 h-5" />
                <span className="hidden sm:inline">Change Language</span>
              </button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-green-600 mb-2">
              <span>Progress</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-green-200 rounded-full h-3">
              <div 
                className="bg-green-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Garden Grid */}
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Garden Boxes
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {gardenBoxes.map((box) => {
              const isVisited = visitedBoxes.has(box.id);
              return (
                <button
                  key={box.id}
                  onClick={() => handleBoxClick(box)}
                  className={`
                    relative group aspect-square rounded-xl border-2 transition-all duration-300 transform hover:scale-105 hover:shadow-lg
                    ${isVisited 
                      ? 'bg-green-200 border-green-400 text-green-800' 
                      : 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100 hover:border-green-400'
                    }
                  `}
                >
                  {/* Box Number */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold">
                      {box.number}
                    </span>
                  </div>
                  
                  {/* Visited Indicator */}
                  {isVisited && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">✓</span>
                    </div>
                  )}
                  
                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Box Name (appears on hover) */}
                  <div className="absolute bottom-0 left-0 right-0 bg-green-600 text-white text-xs p-2 rounded-b-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {box.name}
                  </div>
                </button>
              );
            })}
          </div>
          
          {/* Instructions */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Click on any numbered box to learn more about the vegetables inside
            </p>
          </div>
        </div>
      </div>

      {/* Box Detail Modal */}
      {selectedBox && (
        <BoxDetail 
          box={selectedBox} 
          onClose={handleCloseDetail}
          isVisited={visitedBoxes.has(selectedBox.id)}
        />
      )}

      {/* Reset Session Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-slideUp">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Change Language?
              </h2>
              <p className="text-gray-600">
                This will reset your current session and take you back to language selection. 
                You'll be able to explore the garden again in a different language.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleCancelReset}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg"
              >
                Change Language
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GardenMap;