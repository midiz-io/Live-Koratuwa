import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Onboarding = ({ onComplete, language }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
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
      const response = await api.get(`/languages/${language || 'en'}/quick-guide`);
      const content = response.data.quickGuide;
      
      if (content) {
        setGuideContent(content);
      } else {
        setError('Quick guide not available');
      }
    } catch (err) {
      console.error('Failed to load quick guide:', err);
      setError('Failed to load quick guide');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    setIsVisible(false);
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  if (!isVisible) {
    return null;
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-600"></div>
          <p className="text-gray-600 mt-4">Loading quick guide...</p>
        </div>
      </div>
    );
  }

  if (error || !guideContent) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Guide Not Available</h3>
            <p className="text-gray-600 mb-6">{error || 'Quick start guide could not be loaded'}</p>
            <button
              onClick={handleComplete}
              className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Continue to Garden
            </button>
          </div>
        </div>
      </div>
    );
  }

  const steps = [
    {
      icon: '🌱',
      title: guideContent.step1Title,
      description: guideContent.step1Desc
    },
    {
      icon: '🗺️',
      title: guideContent.step2Title,
      description: guideContent.step2Desc
    },
    {
      icon: '📱',
      title: guideContent.step3Title,
      description: guideContent.step3Desc
    },
    {
      icon: '✅',
      title: guideContent.step4Title,
      description: guideContent.step4Desc
    }
  ];

  const skipText = guideContent.skipBtn || 'Skip';
  const nextText = guideContent.startBtn || 'Get Started';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">{guideContent.title || 'Quick Start Guide'}</h2>
            <button
              onClick={handleSkip}
              className="text-white/80 hover:text-white transition-colors"
            >
              {skipText}
            </button>
          </div>
          <div className="mt-4">
            <div className="flex space-x-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 flex-1 rounded-full transition-colors ${
                    index <= currentStep ? 'bg-white' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm mt-2 opacity-90">
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 text-center">
          <div className="text-6xl mb-6">
            {steps[currentStep].icon}
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            {steps[currentStep].title}
          </h3>
          <p className="text-gray-600 text-lg leading-relaxed">
            {steps[currentStep].description}
          </p>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex space-x-4">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex-1 py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              {currentStep === steps.length - 1 ? nextText : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;