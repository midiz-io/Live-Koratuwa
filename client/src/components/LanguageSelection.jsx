import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

const LanguageSelection = ({ onLanguageSelect }) => {
  const { t } = useTranslation();
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Emoji flags mapping for common languages
  const flagEmojis = {
    'en': '🇺🇸',
    'si': '🇱🇰',
    'zh': '🇨🇳',
    'fr': '��',
    'de': '🇩🇪',
    'ja': '🇯🇵',
    'ru': '��',
    'hi': '🇮🇳',
    'ar': '🇸🇦',
    'es': '��',
    'pt': '🇵🇹',
    'it': '🇮🇹',
    'ko': '��',
    'tr': '🇹🇷',
    'ta': '🇱🇰',
    'default': '�'
  };

  useEffect(() => {
    loadLanguages();
  }, []);

  const loadLanguages = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching languages from API...');
      const response = await api.get('/languages');
      console.log('API Response:', response.data);
      
      // Handle response structure - server returns { languages: [...] }
      const languageList = response.data.languages || response.data || [];
      console.log('Language list:', languageList);
      console.log('Number of languages:', languageList.length);
      
      // Filter only active languages (double-check in case server doesn't filter)
      const activeLanguages = languageList.filter(lang => lang.isActive === true);
      console.log('Active languages:', activeLanguages.length);
      
      // Map languages with flags and use nativeName for display
      const languagesWithFlags = activeLanguages.map(lang => ({
        code: lang.code,
        name: lang.nativeName || lang.name, // Use nativeName for display
        englishName: lang.name,
        isActive: lang.isActive,
        flag: flagEmojis[lang.code] || flagEmojis['default']
      }));
      
      console.log('Final languages to display:', languagesWithFlags);
      setLanguages(languagesWithFlags);
      setError('');
    } catch (err) {
      console.error('Failed to load languages:', err);
      console.error('Error details:', err.response?.data || err.message);
      setError('Failed to load languages. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-garden-50 to-garden-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-garden-600 mb-4"></div>
          <p className="text-xl text-garden-700">Loading languages...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-garden-50 to-garden-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-xl text-red-600 mb-4">{error}</p>
          <button
            onClick={loadLanguages}
            className="px-6 py-3 bg-garden-600 text-white rounded-lg hover:bg-garden-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-garden-50 to-garden-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-garden-800 mb-4">
            {t('welcome.title')}
          </h1>
          <p className="text-xl md:text-2xl text-garden-600 mb-8">
            {t('welcome.subtitle')}
          </p>
          <h2 className="text-2xl md:text-3xl font-semibold text-garden-700">
            {t('welcome.selectLanguage')}
          </h2>
          <p className="text-sm text-garden-500 mt-2">
            {languages.length} {languages.length === 1 ? 'language' : 'languages'} available
          </p>
        </div>

        {languages.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-xl text-garden-700 mb-2">No active languages found</p>
            <p className="text-sm text-garden-600">Please contact the administrator to add languages.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-4xl mx-auto">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => onLanguageSelect(language.code)}
                className="group relative bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 p-6 border-2 border-transparent hover:border-garden-300"
              >
                {/* Hover effect overlay - behind content */}
                <div className="absolute inset-0 bg-garden-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                
                <div className="text-center relative z-10">
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                    {language.flag}
                  </div>
                  <div className="text-lg font-semibold text-garden-800 group-hover:text-garden-600 transition-colors duration-300">
                    {language.name}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <div className="inline-flex items-center space-x-2 text-garden-600">
            <div className="w-2 h-2 bg-garden-400 rounded-full animate-pulse"></div>
            <span className="text-sm">Choose your preferred language to continue</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageSelection;
