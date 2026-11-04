import React from 'react';

/**
 * Simple Diagnostic Component to Verify Tailwind CSS
 * This component uses basic Tailwind utilities to confirm styles are loading
 */
const TailwindDiagnostic = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-green-500 rounded-full mb-4">
              <span className="text-5xl">✅</span>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Tailwind CSS is Working!
            </h1>
            <p className="text-xl text-gray-600">
              If you can see this styled page, Tailwind CSS is properly configured.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-red-100 p-4 rounded-xl text-center">
              <div className="text-3xl mb-2">🎨</div>
              <div className="text-sm font-semibold text-red-800">Colors</div>
            </div>
            <div className="bg-blue-100 p-4 rounded-xl text-center">
              <div className="text-3xl mb-2">📐</div>
              <div className="text-sm font-semibold text-blue-800">Layout</div>
            </div>
            <div className="bg-green-100 p-4 rounded-xl text-center">
              <div className="text-3xl mb-2">✨</div>
              <div className="text-sm font-semibold text-green-800">Effects</div>
            </div>
            <div className="bg-yellow-100 p-4 rounded-xl text-center">
              <div className="text-3xl mb-2">📱</div>
              <div className="text-sm font-semibold text-yellow-800">Responsive</div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap gap-4 justify-center">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 hover:shadow-xl transition-all transform hover:-translate-y-1">
              Button with Hover
            </button>
            <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg shadow-md hover:from-purple-700 hover:to-pink-700 transition-all">
              Gradient Button
            </button>
            <a 
              href="/" 
              className="px-6 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-colors inline-block"
            >
              Back to Home
            </a>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Working Features:</h2>
          <div className="space-y-2 text-gray-700">
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              <span>Gradient backgrounds</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              <span>Rounded corners and shadows</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              <span>Hover effects and transitions</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              <span>Responsive grid layout</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              <span>Custom color utilities</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TailwindDiagnostic;
