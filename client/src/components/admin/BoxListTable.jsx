import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, Search } from 'lucide-react';
import { adminApiService } from '../../services/adminApi';
import BoxEditModal from './BoxEditModal';

const BoxListTable = () => {
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingBox, setEditingBox] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadBoxes();
  }, []);

  const loadBoxes = async () => {
    try {
      setLoading(true);
      const data = await adminApiService.getBoxes();
      setBoxes(data);
    } catch (err) {
      setError('Failed to load boxes');
      console.error('Failed to load boxes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (box) => {
    setEditingBox(box);
  };

  const handleDelete = async (boxId) => {
    if (window.confirm('Are you sure you want to delete this box?')) {
      try {
        await adminApiService.deleteBox(boxId);
        await loadBoxes();
      } catch (err) {
        setError('Failed to delete box');
        console.error('Failed to delete box:', err);
      }
    }
  };

  const handleSave = async (boxData) => {
    try {
      let savedBox;
      if (editingBox) {
        savedBox = await adminApiService.updateBox(editingBox.id, boxData);
        setBoxes(prev =>
          prev
            .map(item => (item.id === editingBox.id ? { ...item, ...savedBox } : item))
            .sort((a, b) => (a.number || 0) - (b.number || 0))
        );
      } else {
        savedBox = await adminApiService.createBox(boxData);
        setBoxes(prev =>
          [...prev, savedBox].sort((a, b) => (a.number || 0) - (b.number || 0))
        );
      }
      setError('');
      return savedBox;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to save box';
      setError(errorMsg);
      console.error('Failed to save box:', err);
      throw err; // Re-throw so modal can handle it
    }
  };

  const getNextBoxNumber = () => {
    if (boxes.length === 0) return 1;
    const maxNumber = Math.max(...boxes.map(b => b.number));
    return maxNumber + 1;
  };

  const filteredBoxes = boxes.filter(box =>
    box.number.toString().includes(searchTerm) ||
    box.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-garden-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">Garden Boxes</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-garden-600 text-white rounded-lg hover:bg-garden-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Box</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="p-6 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search boxes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-garden-500 focus:border-garden-500"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-400">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Box #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredBoxes.map((box) => (
              <tr key={box.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-semibold text-garden-600">
                    #{box.number}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {box.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(box.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleEdit(box)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                      title="Edit box"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(box.id)}
                      className="text-red-600 hover:text-red-800 font-medium"
                      title="Delete box"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredBoxes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No boxes found</p>
        </div>
      )}

      {/* Edit/Add Modal */}
      {(editingBox || showAddModal) && (
        <BoxEditModal
          box={editingBox}
          nextBoxNumber={getNextBoxNumber()}
          existingBoxNumbers={boxes.map(b => b.number)}
          onSave={handleSave}
          onClose={() => {
            setEditingBox(null);
            setShowAddModal(false);
            setError('');
          }}
        />
      )}
    </div>
  );
};

export default BoxListTable;
