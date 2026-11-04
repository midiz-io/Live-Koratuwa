import React, { useState, useEffect } from 'react';
import { MapPin, Eye, CheckCircle, ArrowRight, X } from 'lucide-react';
import api from '../services/api';

const QuickStartOverlay = ({ onComplete, onSkip, language }) => {
  const [guideContent, setGuideContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadQuickGuide();
  }, [language]);

  const loadQuickGuide = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching quick guide from API...');
      const response = await api.get(`/languages/${language || 'en'}/quick-guide`);
      console.log('📦 API Response:', response.data);
      
      const content = response.data.quickGuide;
      if (content) {
        setGuideContent(content);
      } else {
        setError('Quick guide not available');
      }
    } catch (err) {
      console.error('❌ Failed to load quick guide:', err);
      setError('Failed to load quick guide');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-2xl p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-garden-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading quick guide...</p>
        </div>
      </div>
    );
  }

  // Show error state if guide failed to load
  if (error || !guideContent) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-8 text-center">
          <div className="mb-6 text-6xl">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Guide Not Available
          </h2>
          <p className="text-gray-600 mb-8">
            The quick start guide couldn't be loaded. Please continue to explore the garden.
          </p>
          <button
            onClick={onComplete}
            className="w-full bg-garden-600 hover:bg-garden-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2"
          >
            <span>Continue to Garden</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  const steps = [
    {
      icon: MapPin,
      title: guideContent.step1Title,
      description: guideContent.step1Desc,
      completed: true
    },
    {
      icon: Eye,
      title: guideContent.step2Title,
      description: guideContent.step2Desc,
      completed: false
    },
    {
      icon: CheckCircle,
      title: guideContent.step3Title,
      description: guideContent.step3Desc,
      completed: false
    },
    {
      icon: CheckCircle,
      title: guideContent.step4Title,
      description: guideContent.step4Desc,
      completed: false
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-garden-800">
            {guideContent.title}
          </h2>
          <button
            onClick={onSkip}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Steps */}
          <div className="space-y-6 mb-8">
            {steps.map((step, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="relative">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    step.completed 
                      ? 'bg-garden-100 text-garden-600' 
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    <step.icon className="w-6 h-6" />
                  </div>
                  {step.completed && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-garden-600 text-white rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Visual Example */}
          <div className="bg-garden-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-garden-800 mb-4 text-center">
              {guideContent.exampleTitle}
            </h3>
            <div className="grid grid-cols-4 gap-3 max-w-sm mx-auto">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((number) => (
                <div
                  key={number}
                  className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center font-bold text-sm transition-all duration-200 ${
                    number <= 3
                      ? 'bg-garden-200 border-garden-500 text-garden-900'
                      : 'bg-garden-50 border-garden-300 text-garden-800'
                  }`}
                >
                  {number}
                  {number <= 3 && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-garden-600 text-white rounded-full flex items-center justify-center text-xs">
                      ✓
                    </div>
                  )}
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-garden-600 mt-3">
              {guideContent.exampleDesc}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={onSkip}
              className="flex-1 px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {guideContent.skipBtn}
            </button>
            <button
              onClick={onComplete}
              className="flex-1 bg-garden-600 hover:bg-garden-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <span>{guideContent.startBtn}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickStartOverlay;
