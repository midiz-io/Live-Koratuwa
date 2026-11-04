import React, { useState, useEffect } from 'react';
import api from '../services/api';

const LanguageSelector = ({ onLanguageSelect }) => {
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Emoji flags mapping for common languages
  const flagEmojis = {
    'en': '🇺🇸',
    'si': '🇱🇰',
    'zh': '🇨🇳',
    'fr': '🇫🇷',
    'de': '🇩🇪',
    'ja': '🇯🇵',
    'ru': '🇷🇺',
    'hi': '🇮🇳',
    'ar': '🇸🇦',
    'es': '🇪🇸',
    'pt': '🇵🇹',
    'it': '🇮🇹',
    'ko': '🇰🇷',
    'tr': '🇹🇷',
    'ta': '🇱🇰',
    'default': '🌐'
  };

  useEffect(() => {
    loadLanguages();
  }, []);

  const loadLanguages = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔍 Fetching languages from API...');
      const response = await api.get('/languages');
      console.log('📦 API Response:', response.data);
      
      // Handle response structure - server returns { languages: [...] }
      const languageList = response.data.languages || response.data || [];
      console.log('📋 Language list:', languageList);
      console.log('🔢 Number of languages:', languageList.length);
      
      // Filter only active languages (double-check in case server doesn't filter)
      const activeLanguages = languageList.filter(lang => lang.isActive === true);
      console.log('✅ Active languages:', activeLanguages.length);
      console.log('📝 Active language codes:', activeLanguages.map(l => l.code).join(', '));
      
      // Map languages with flags
      const languagesWithFlags = activeLanguages.map(lang => ({
        code: lang.code,
        name: lang.name, // English name
        native: lang.nativeName || lang.name, // Native name for display
        flag: flagEmojis[lang.code] || flagEmojis['default'],
        isActive: lang.isActive
      }));
      
      console.log('🎨 Final languages to display:', languagesWithFlags);
      setLanguages(languagesWithFlags);
      setError('');
    } catch (err) {
      console.error('❌ Failed to load languages:', err);
      console.error('📛 Error details:', err.response?.data || err.message);
      setError('Failed to load languages. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-200 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600 mb-4"></div>
          <p className="text-xl text-green-700 font-semibold">Loading languages...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-200 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-xl text-red-600 mb-4 font-semibold">{error}</p>
          <button
            onClick={loadLanguages}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (languages.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-200 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">📚</div>
          <p className="text-xl text-green-700 mb-2 font-semibold">No active languages found</p>
          <p className="text-sm text-green-600">Please contact the administrator to add languages.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-200 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-600 rounded-full mb-6">
            <span className="text-4xl">🌱</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-green-800 mb-4">
            Interactive Garden Experience
          </h1>
          <p className="text-xl text-green-600 mb-2">
            Explore our beautiful garden boxes
          </p>
          <p className="text-lg text-green-500">
            Choose your language to begin
          </p>
          <p className="text-sm text-green-600 mt-3 font-semibold">
            {languages.length} {languages.length === 1 ? 'language' : 'languages'} available
          </p>
        </div>

        {/* Language Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => onLanguageSelect(lang.code)}
              className="group relative bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 border-2 border-transparent hover:border-green-300"
            >
              <div className="text-center">
                <div className="text-3xl mb-3">{lang.flag}</div>
                <h3 className="font-semibold text-gray-800 text-sm mb-1">
                  {lang.native}
                </h3>
                <p className="text-xs text-gray-500">
                  {lang.name}
                </p>
              </div>
              
              {/* Hover effect */}
              <div className="absolute inset-0 bg-green-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Selection indicator */}
              <div className="absolute top-2 right-2 w-6 h-6 bg-green-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-green-600 text-sm">
            Select your preferred language to start exploring the garden
          </p>
        </div>
      </div>
    </div>
  );
};

export default LanguageSelector;