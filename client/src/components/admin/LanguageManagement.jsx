import React, { useState, useEffect } from 'react';
import { Search, Globe, Languages, Sparkles, Save, BookOpen, Plus, CheckCircle2, Palette, Settings2 } from 'lucide-react';
import { adminApiService } from '../../services/adminApi';

const LanguageManagement = () => {
  const [languages, setLanguages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [boxes, setBoxes] = useState([]);
  const [translations, setTranslations] = useState({});
  const [quickGuide, setQuickGuide] = useState({});
  const [activeTab, setActiveTab] = useState('translations'); // 'translations' or 'quickguide'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddLanguage, setShowAddLanguage] = useState(false);
  const [languageSearch, setLanguageSearch] = useState('');
  const [boxSearch, setBoxSearch] = useState('');
  const [newLanguage, setNewLanguage] = useState({
    code: '',
    name: '',
    nativeName: '',
    isActive: true
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadLanguages();
    loadBoxes();
  }, []);

  const loadLanguages = async () => {
    try {
      setLoading(true);
      const data = await adminApiService.getLanguages();
      setLanguages(data.languages || []);
    } catch (err) {
      setError('Failed to load languages');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadBoxes = async () => {
    try {
      const data = await adminApiService.getBoxes();
      setBoxes(Array.isArray(data) ? data : (data.boxes || []));
    } catch (err) {
      console.error('Failed to load boxes:', err);
    }
  };

  const loadTranslations = async (languageCode) => {
    try {
      const translationsData = {};
      const results = await Promise.allSettled(
        boxes.map(async (box) => {
          const data = await adminApiService.getBoxTranslations(box.id);
          const translation = data.translations?.find(t => t.languageCode === languageCode);
          return {
            boxId: box.id,
            translation: {
              name: translation?.name || '',
              description: translation?.description || '',
              funFact: translation?.funFact || ''
            }
          };
        })
      );

      results.forEach(result => {
        if (result.status === 'fulfilled') {
          translationsData[result.value.boxId] = result.value.translation;
        }
      });

      setTranslations(translationsData);
    } catch (err) {
      console.error('Failed to load translations:', err);
    }
  };

  const handleSelectLanguage = async (language) => {
    setSelectedLanguage(language);
    setError('');
    setSuccess('');
    setActiveTab('translations');
    await loadTranslations(language.code);
    await loadQuickGuide(language.code);
  };

  const loadQuickGuide = async (languageCode) => {
    try {
      const response = await adminApiService.getLanguageByCode(languageCode);
      setQuickGuide({
        title: response.quickGuideTitle || '',
        step1Title: response.quickGuideStep1Title || '',
        step1Desc: response.quickGuideStep1Desc || '',
        step2Title: response.quickGuideStep2Title || '',
        step2Desc: response.quickGuideStep2Desc || '',
        step3Title: response.quickGuideStep3Title || '',
        step3Desc: response.quickGuideStep3Desc || '',
        step4Title: response.quickGuideStep4Title || '',
        step4Desc: response.quickGuideStep4Desc || '',
        exampleTitle: response.quickGuideExampleTitle || '',
        exampleDesc: response.quickGuideExampleDesc || '',
        skipBtn: response.quickGuideSkipBtn || '',
        startBtn: response.quickGuideStartBtn || ''
      });
    } catch (err) {
      console.error('Failed to load quick guide:', err);
    }
  };

  const handleQuickGuideChange = (field, value) => {
    setQuickGuide(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveQuickGuide = async () => {
    if (!selectedLanguage) return;

    try {
      setSaving(true);
      setError('');
      await adminApiService.updateLanguageQuickGuide(selectedLanguage.code, quickGuide);
      setSuccess(`✅ Quick Guide saved for ${selectedLanguage.name}!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save quick guide');
    } finally {
      setSaving(false);
    }
  };

  const handleAddLanguage = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!newLanguage.code || !newLanguage.name || !newLanguage.nativeName) {
      setError('Please fill all language fields');
      return;
    }

    try {
      setSaving(true);
      await adminApiService.addLanguage(newLanguage);
      setSuccess(`Language "${newLanguage.name}" added successfully!`);
      setNewLanguage({ code: '', name: '', nativeName: '', isActive: true });
      setShowAddLanguage(false);
      await loadLanguages();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add language');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateLanguage = async (languageCode, updates) => {
    try {
      setSaving(true);
      await adminApiService.updateLanguage(languageCode, updates);
      setSuccess('Language updated successfully!');
      await loadLanguages();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update language');
    } finally {
      setSaving(false);
    }
  };

  const handleTranslationChange = (boxId, field, value) => {
    setTranslations(prev => ({
      ...prev,
      [boxId]: {
        ...prev[boxId],
        [field]: value
      }
    }));
  };

  const handleSaveTranslation = async (boxId) => {
    if (!selectedLanguage) return;

    const translation = translations[boxId];
    if (!translation.name || !translation.description) {
      setError('Name and description are required');
      return;
    }

    try {
      setSaving(true);
      setError('');
      await adminApiService.saveBoxTranslation(boxId, {
        languageCode: selectedLanguage.code,
        name: translation.name,
        description: translation.description,
        funFact: translation.funFact || ''
      });
      setSuccess(`Translation saved for Box #${boxes.find(b => b.id === boxId)?.number}`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save translation');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAllTranslations = async () => {
    if (!selectedLanguage) return;

    try {
      setSaving(true);
      setError('');
      
      let saved = 0;
      for (const boxId in translations) {
        const translation = translations[boxId];
        if (translation.name && translation.description) {
          await adminApiService.saveBoxTranslation(boxId, {
            languageCode: selectedLanguage.code,
            name: translation.name,
            description: translation.description,
            funFact: translation.funFact || ''
          });
          saved++;
        }
      }
      
      setSuccess(`✅ Saved ${saved} translations for ${selectedLanguage.name}!`);
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save translations');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[420px] rounded-3xl bg-gradient-to-br from-white via-emerald-50 to-sky-50 border border-white/60 shadow-lg">
        <div className="text-center">
          <div className="mx-auto mb-4 h-14 w-14 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
          <p className="text-sm font-medium text-gray-600">Loading language studio...</p>
        </div>
      </div>
    );
  }

  const visibleLanguages = languages.filter(lang =>
    `${lang.name} ${lang.nativeName} ${lang.code}`.toLowerCase().includes(languageSearch.toLowerCase())
  );

  const visibleBoxes = boxes.filter(box =>
    `${box.number} ${box.name}`.toLowerCase().includes(boxSearch.toLowerCase())
  );

  const selectedLanguageStats = selectedLanguage
    ? {
        totalBoxes: boxes.length,
        translatedBoxes: Object.values(translations).filter(t => t.name && t.description).length
      }
    : null;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 text-white shadow-xl">
        <div className="grid gap-6 p-6 lg:grid-cols-[1.2fr_0.8fr] lg:p-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm">
              <Sparkles className="h-4 w-4" /> Translation Studio
            </div>
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Modern language editing workspace</h2>
              <p className="mt-2 max-w-2xl text-sm text-white/85">
                Edit box translations and quick guide content in a clean, focused interface designed for faster updates.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowAddLanguage(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <Plus className="h-4 w-4" /> Add Language
              </button>
              <div className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur-sm">
                <Globe className="h-4 w-4" /> {languages.length} languages
              </div>
              <div className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur-sm">
                <BookOpen className="h-4 w-4" /> {boxes.length} boxes
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-white/70">Active</p>
              <p className="mt-2 text-2xl font-bold">{languages.filter(lang => lang.isActive).length}</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-white/70">Default</p>
              <p className="mt-2 text-2xl font-bold">EN</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-white/70">Ready</p>
              <p className="mt-2 text-2xl font-bold">{selectedLanguage ? `${selectedLanguageStats?.translatedBoxes || 0}/${selectedLanguageStats?.totalBoxes || 0}` : '—'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 shadow-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-green-700 shadow-sm">
          {success}
        </div>
      )}

      {/* Add Language Modal */}
      {showAddLanguage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/70 bg-white p-6 shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-900">Add New Language</h3>
            <p className="mt-1 text-sm text-gray-500">Create a new language option for the visitor experience.</p>
            <form onSubmit={handleAddLanguage} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Language Code (e.g., ta, hi, fr)
                </label>
                <input
                  type="text"
                  value={newLanguage.code}
                  onChange={(e) => setNewLanguage({ ...newLanguage, code: e.target.value.toLowerCase() })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-garden-500"
                  placeholder="ta"
                  maxLength="5"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Language Name (English)
                </label>
                <input
                  type="text"
                  value={newLanguage.name}
                  onChange={(e) => setNewLanguage({ ...newLanguage, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-garden-500"
                  placeholder="Tamil"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Native Name (in that language)
                </label>
                <input
                  type="text"
                  value={newLanguage.nativeName}
                  onChange={(e) => setNewLanguage({ ...newLanguage, nativeName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-garden-500"
                  placeholder="தமிழ்"
                  required
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={newLanguage.isActive}
                  onChange={(e) => setNewLanguage({ ...newLanguage, isActive: e.target.checked })}
                  className="mr-2"
                />
                <label className="text-sm text-gray-700">Active (visible to users)</label>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddLanguage(false)}
                  className="rounded-xl bg-gray-100 px-4 py-2 text-gray-700 transition hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? 'Adding...' : 'Add Language'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Workspace */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[340px_1fr]">
        {/* Left: Language rail */}
        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 p-5">
            <h3 className="text-lg font-semibold text-gray-900">Languages</h3>
            <p className="text-sm text-gray-500">Choose a language to manage box translations.</p>
            <div className="relative mt-4">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={languageSearch}
                onChange={(e) => setLanguageSearch(e.target.value)}
                placeholder="Search languages..."
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:bg-white"
              />
            </div>
          </div>
          <div className="max-h-[720px] overflow-y-auto p-3">
            <div className="space-y-2">
              {visibleLanguages.map((lang) => (
              <div
                key={lang.code}
                onClick={() => handleSelectLanguage(lang)}
                className={`cursor-pointer rounded-2xl border p-4 transition-all duration-200 ${
                  selectedLanguage?.code === lang.code
                    ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                    : 'border-gray-200 bg-white hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="truncate font-semibold text-gray-900">{lang.name}</div>
                      {lang.isDefault && (
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-700">Default</span>
                      )}
                    </div>
                    <div className="mt-1 text-sm text-gray-600">{lang.nativeName}</div>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                      <span className="rounded-full bg-gray-100 px-2 py-1">{lang.code.toUpperCase()}</span>
                      <span className={`rounded-full px-2 py-1 ${lang.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {lang.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {typeof lang.translationCount === 'number' && (
                        <span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-700">
                          {lang.translationCount} translations
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {!lang.isDefault && (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateLanguage(lang.code, { isActive: !lang.isActive });
                      }}
                      className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-slate-700"
                    >
                      {lang.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                )}
              </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Translation workspace */}
        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          {selectedLanguage ? (
            <>
              <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white p-5 sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                      <Languages className="h-4 w-4" /> {selectedLanguage.code.toUpperCase()}
                    </div>
                    <h3 className="mt-3 text-2xl font-bold text-gray-900">
                      {selectedLanguage.name} <span className="text-gray-400">/</span> {selectedLanguage.nativeName}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">Edit box translations and the onboarding quick guide in one place.</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400">Translation progress</p>
                      <p className="mt-1 text-sm font-semibold text-gray-900">
                        {selectedLanguageStats?.translatedBoxes || 0}/{selectedLanguageStats?.totalBoxes || 0} boxes
                      </p>
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400">Mode</p>
                      <p className="mt-1 text-sm font-semibold text-gray-900">{activeTab === 'translations' ? 'Box copy' : 'Quick guide'}</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Tabs */}
              <div className="flex gap-2 border-b border-gray-200 px-5 pt-5 sm:px-6">
                <button
                  onClick={() => setActiveTab('translations')}
                  className={`inline-flex items-center gap-2 rounded-t-2xl border border-b-0 px-4 py-3 text-sm font-semibold transition-colors ${
                    activeTab === 'translations'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-transparent bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                  }`}
                >
                  <BookOpen className="h-4 w-4" /> Box Translations
                </button>
                <button
                  onClick={() => setActiveTab('quickguide')}
                  className={`inline-flex items-center gap-2 rounded-t-2xl border border-b-0 px-4 py-3 text-sm font-semibold transition-colors ${
                    activeTab === 'quickguide'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-transparent bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                  }`}
                >
                  <Settings2 className="h-4 w-4" /> Quick Start Guide
                </button>
              </div>

              {/* Box Translations Tab */}
              {activeTab === 'translations' && (
                <div className="p-5 sm:p-6">
                  <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="relative w-full max-w-lg">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={boxSearch}
                        onChange={(e) => setBoxSearch(e.target.value)}
                        placeholder="Search boxes to translate..."
                        className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:bg-white"
                      />
                    </div>
                    <button
                      onClick={handleSaveAllTranslations}
                      disabled={saving}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save All'}
                    </button>
                  </div>

                  <div className="grid gap-4 xl:grid-cols-2">
                    {visibleBoxes.map((box) => (
                      <div key={box.id} className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                        <div className="flex items-center justify-between gap-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-emerald-100 text-emerald-700">
                              {box.mainImage ? (
                                <img src={box.mainImage} alt={box.name} className="h-full w-full object-cover" />
                              ) : (
                                <Palette className="h-5 w-5" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">Box #{box.number}</h4>
                              <p className="text-sm text-gray-500">{box.name}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleSaveTranslation(box.id)}
                            disabled={saving}
                            className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Save
                          </button>
                        </div>

                        <div className="space-y-4 p-4">
                          <div>
                            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                              Name in {selectedLanguage.name}
                            </label>
                            <input
                              type="text"
                              value={translations[box.id]?.name || ''}
                              onChange={(e) => handleTranslationChange(box.id, 'name', e.target.value)}
                              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white"
                              placeholder={`Enter name in ${selectedLanguage.name}`}
                            />
                          </div>

                          <div>
                            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                              Description in {selectedLanguage.name}
                            </label>
                            <textarea
                              value={translations[box.id]?.description || ''}
                              onChange={(e) => handleTranslationChange(box.id, 'description', e.target.value)}
                              className="min-h-[110px] w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white"
                              placeholder={`Enter description in ${selectedLanguage.name}`}
                            />
                          </div>

                          <div>
                            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                              Fun fact in {selectedLanguage.name}
                            </label>
                            <textarea
                              value={translations[box.id]?.funFact || ''}
                              onChange={(e) => handleTranslationChange(box.id, 'funFact', e.target.value)}
                              className="min-h-[84px] w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white"
                              placeholder={`Enter fun fact in ${selectedLanguage.name} (optional)`}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {visibleBoxes.length === 0 && (
                    <div className="mt-6 rounded-3xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
                      <CheckCircle2 className="mx-auto h-10 w-10 text-gray-400" />
                      <p className="mt-3 font-medium text-gray-700">No boxes match your search</p>
                    </div>
                  )}
                </div>
              )}

              {/* Quick Guide Tab */}
              {activeTab === 'quickguide' && (
                <div className="p-5 sm:p-6">
                  <div className="mb-4 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
                    <strong>Note:</strong> Empty fields automatically fall back to English.
                  </div>

                  <div className="mb-4 flex justify-end">
                    <button
                      onClick={handleSaveQuickGuide}
                      disabled={saving}
                      className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Quick Guide'}
                    </button>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4">
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Main title</label>
                      <input
                        type="text"
                        value={quickGuide.title || ''}
                        onChange={(e) => handleQuickGuideChange('title', e.target.value)}
                        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                        placeholder="How to Explore the Garden"
                      />
                    </div>

                    <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4">
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Skip button</label>
                      <input
                        type="text"
                        value={quickGuide.skipBtn || ''}
                        onChange={(e) => handleQuickGuideChange('skipBtn', e.target.value)}
                        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                        placeholder="Skip Tutorial"
                      />
                    </div>

                    <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4">
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Start button</label>
                      <input
                        type="text"
                        value={quickGuide.startBtn || ''}
                        onChange={(e) => handleQuickGuideChange('startBtn', e.target.value)}
                        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                        placeholder="Start Exploring"
                      />
                    </div>

                    <div className="mt-6 grid gap-4 xl:grid-cols-2">
                      {[
                        ['Step 1 - Language Selection', 'step1Title', 'step1Desc'],
                        ['Step 2 - Tap Boxes', 'step2Title', 'step2Desc'],
                        ['Step 3 - View Details', 'step3Title', 'step3Desc'],
                        ['Step 4 - Track Progress', 'step4Title', 'step4Desc']
                      ].map(([title, titleKey, descKey]) => (
                        <div key={titleKey} className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                          <h4 className="mb-4 text-sm font-semibold text-gray-900">{title}</h4>
                          <div className="space-y-3">
                            <div>
                              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Title</label>
                              <input
                                type="text"
                                value={quickGuide[titleKey] || ''}
                                onChange={(e) => handleQuickGuideChange(titleKey, e.target.value)}
                                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white"
                              />
                            </div>
                            <div>
                              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Description</label>
                              <textarea
                                value={quickGuide[descKey] || ''}
                                onChange={(e) => handleQuickGuideChange(descKey, e.target.value)}
                                className="min-h-[96px] w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white"
                              />
                            </div>
                          </div>
                        </div>
                      ))}

                    <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm xl:col-span-2">
                      <h4 className="mb-4 text-sm font-semibold text-gray-900">Example Garden Map Section</h4>
                      <div className="space-y-3">
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Title</label>
                        <input
                          type="text"
                          value={quickGuide.exampleTitle || ''}
                          onChange={(e) => handleQuickGuideChange('exampleTitle', e.target.value)}
                          className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white"
                          placeholder="How to Explore the Garden"
                        />
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Description</label>
                        <textarea
                          value={quickGuide.exampleDesc || ''}
                          onChange={(e) => handleQuickGuideChange('exampleDesc', e.target.value)}
                          className="min-h-[100px] w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex min-h-[640px] items-center justify-center px-6 text-gray-500">
              <div className="max-w-sm text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-sm">
                  <Languages className="h-8 w-8" />
                </div>
                <h4 className="mt-4 text-lg font-semibold text-gray-900">Select a language</h4>
                <p className="mt-2 text-sm text-gray-500">Pick a language from the left panel to start editing translations in a focused workspace.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LanguageManagement;
