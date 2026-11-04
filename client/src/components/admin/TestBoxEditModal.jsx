// Test component to verify BoxEditModal works
import React from 'react';
import BoxEditModal from './BoxEditModal';

const TestBoxEditModal = () => {
  const [showModal, setShowModal] = React.useState(false);

  const mockBox = null; // Test with new box

  const handleSave = async (boxData) => {
    console.log('Save called with:', boxData);
    alert('Save handler called! Check console for data.');
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">BoxEditModal Test</h1>
      
      <button
        onClick={() => setShowModal(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Open Modal (New Box)
      </button>

      {showModal && (
        <BoxEditModal
          box={mockBox}
          nextBoxNumber={1}
          existingBoxNumbers={[]}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default TestBoxEditModal;
