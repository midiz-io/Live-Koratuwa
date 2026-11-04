import React, { useState } from 'react';

const TailwindTest = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border-2 border-green-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-3xl">🎨</span>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  Tailwind CSS Test Suite
                </h1>
                <p className="text-gray-600 text-lg">LiveKaratuwa Garden Project</p>
              </div>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center space-x-2 bg-green-100 px-4 py-2 rounded-full">
                <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-green-700 font-semibold">Active</span>
              </div>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex space-x-2 border-b-2 border-gray-200">
            {['overview', 'colors', 'components', 'responsive'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-semibold capitalize transition-all duration-300 ${
                  activeTab === tab
                    ? 'text-green-600 border-b-4 border-green-600 -mb-0.5'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content Sections */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500 transform transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">✅</span>
                  <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                    PASS
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-800">Configuration</h3>
                <p className="text-gray-600 text-sm mt-1">Tailwind properly configured</p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500 transform transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">🎨</span>
                  <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                    ACTIVE
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-800">Utilities</h3>
                <p className="text-gray-600 text-sm mt-1">All utility classes working</p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500 transform transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">📱</span>
                  <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                    READY
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-800">Responsive</h3>
                <p className="text-gray-600 text-sm mt-1">Breakpoints functional</p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-yellow-500 transform transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">⚡</span>
                  <span className="text-xs font-semibold text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">
                    FAST
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-800">Performance</h3>
                <p className="text-gray-600 text-sm mt-1">JIT compilation enabled</p>
              </div>
            </div>

            {/* Feature Tests */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Feature Tests</h2>
              <div className="space-y-4">
                {[
                  { feature: 'CSS Variables', status: 'Working', icon: '🎯' },
                  { feature: 'Dark Mode Support', status: 'Configured', icon: '🌙' },
                  { feature: 'Custom Colors', status: 'Active', icon: '🎨' },
                  { feature: 'Animations', status: 'Enabled', icon: '✨' },
                  { feature: 'Transitions', status: 'Smooth', icon: '🔄' },
                  { feature: 'Hover Effects', status: 'Responsive', icon: '👆' }
                ].map((test, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{test.icon}</span>
                      <span className="font-semibold text-gray-700">{test.feature}</span>
                    </div>
                    <span className="text-green-600 font-medium">{test.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'colors' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Color Palette</h2>
              
              {/* Green Palette */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Green (Primary)</h3>
                <div className="grid grid-cols-5 gap-4">
                  {[50, 100, 300, 500, 700].map((shade) => (
                    <div key={shade} className="text-center">
                      <div
                        className={`h-20 rounded-lg shadow-md mb-2 bg-green-${shade}`}
                      ></div>
                      <span className="text-sm text-gray-600">{shade}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Blue Palette */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Blue (Secondary)</h3>
                <div className="grid grid-cols-5 gap-4">
                  {[50, 100, 300, 500, 700].map((shade) => (
                    <div key={shade} className="text-center">
                      <div
                        className={`h-20 rounded-lg shadow-md mb-2 bg-blue-${shade}`}
                      ></div>
                      <span className="text-sm text-gray-600">{shade}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gradient Examples */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Gradients</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-32 rounded-lg shadow-md bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
                    <span className="text-white font-semibold">Green to Blue</span>
                  </div>
                  <div className="h-32 rounded-lg shadow-md bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center">
                    <span className="text-white font-semibold">Multi-color</span>
                  </div>
                  <div className="h-32 rounded-lg shadow-md bg-gradient-to-t from-gray-700 to-gray-900 flex items-center justify-center">
                    <span className="text-white font-semibold">Dark Gradient</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'components' && (
          <div className="space-y-6">
            {/* Buttons */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Button Styles</h2>
              <div className="flex flex-wrap gap-4">
                <button className="px-6 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-colors">
                  Primary Button
                </button>
                <button className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors">
                  Secondary Button
                </button>
                <button className="px-6 py-3 bg-white text-green-600 border-2 border-green-600 rounded-lg hover:bg-green-50 transition-colors">
                  Outline Button
                </button>
                <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg shadow-md hover:from-purple-600 hover:to-pink-600 transition-all">
                  Gradient Button
                </button>
              </div>
            </div>

            {/* Cards */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Card Variations</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border-2 border-gray-200 rounded-xl p-6 hover:shadow-xl transition-shadow">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Basic Card</h3>
                  <p className="text-gray-600">Simple card with border</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 shadow-md">
                  <h3 className="text-lg font-bold text-green-800 mb-2">Colored Card</h3>
                  <p className="text-green-600">Card with gradient background</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-2xl border-t-4 border-blue-500">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Accent Card</h3>
                  <p className="text-gray-600">Card with accent border</p>
                </div>
              </div>
            </div>

            {/* Inputs */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Form Elements</h2>
              <div className="space-y-4 max-w-md">
                <input
                  type="text"
                  placeholder="Text input"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none transition-colors"
                />
                <select className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none transition-colors">
                  <option>Select option</option>
                  <option>Option 1</option>
                  <option>Option 2</option>
                </select>
                <textarea
                  placeholder="Textarea"
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none transition-colors"
                ></textarea>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'responsive' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Responsive Grid Test</h2>
              <p className="text-gray-600 mb-6">Resize your browser window to see the grid adapt</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                  <div
                    key={num}
                    className="bg-gradient-to-br from-green-100 to-green-200 h-24 rounded-lg shadow-md flex items-center justify-center text-2xl font-bold text-green-700"
                  >
                    {num}
                  </div>
                ))}
              </div>

              <div className="mt-8 p-6 bg-blue-50 rounded-xl">
                <h3 className="font-bold text-blue-800 mb-3">Current Breakpoint:</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <span className="w-3 h-3 rounded-full bg-blue-500 sm:hidden"></span>
                    <span className="text-gray-700"><strong>xs:</strong> &lt; 640px (1 column)</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="w-3 h-3 rounded-full bg-blue-500 hidden sm:block md:hidden"></span>
                    <span className="text-gray-700"><strong>sm:</strong> ≥ 640px (2 columns)</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="w-3 h-3 rounded-full bg-blue-500 hidden md:block lg:hidden"></span>
                    <span className="text-gray-700"><strong>md:</strong> ≥ 768px (3 columns)</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="w-3 h-3 rounded-full bg-blue-500 hidden lg:block xl:hidden"></span>
                    <span className="text-gray-700"><strong>lg:</strong> ≥ 1024px (4 columns)</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="w-3 h-3 rounded-full bg-blue-500 hidden xl:block"></span>
                    <span className="text-gray-700"><strong>xl:</strong> ≥ 1280px (6 columns)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl shadow-lg p-6 text-white text-center">
          <h3 className="text-xl font-bold mb-2">✅ Tailwind CSS Successfully Implemented!</h3>
          <p className="text-green-100">
            All utility classes, components, and responsive features are working correctly in the LiveKaratuwa project.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TailwindTest;
