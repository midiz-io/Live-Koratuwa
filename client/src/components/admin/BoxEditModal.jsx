import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Image as ImageIcon, Music, Trash2, Play, Pause } from 'lucide-react';
import { adminApiService } from '../../services/adminApi';
import RichTextEditor from '../RichTextEditor';

const BoxEditModal = ({ box, nextBoxNumber, existingBoxNumbers, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    number: '',
    name: '',
    description: '',
    funFact: '',
    mainImage: '',
    images: [],
    audioUrl: ''
  });
  const [languages, setLanguages] = useState([]);
  const [translations, setTranslations] = useState({});
  const [translationSaveStatus, setTranslationSaveStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingFile, setUploadingFile] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // File preview states
  const [mainImagePreview, setMainImagePreview] = useState('');
  const [additionalImagesPreviews, setAdditionalImagesPreviews] = useState([]);
  const [audioPlaying, setAudioPlaying] = useState({});
  const [audioRefs, setAudioRefs] = useState({});
  const autosaveTimersRef = useRef({});
  const translationsRef = useRef({});
  const translationStatusRef = useRef({});

  useEffect(() => {
    loadLanguages();
  }, []);

  useEffect(() => {
    setError('');
    setSuccessMessage('');
    setTranslations({});
    setTranslationSaveStatus({});
    setAudioPlaying({});
    setAudioRefs({});

    if (box) {
      // Parse images if it's a string (from database JSON)
      let parsedImages = [];
      if (box.images) {
        if (typeof box.images === 'string') {
          try {
            parsedImages = JSON.parse(box.images);
          } catch (e) {
            console.error('Failed to parse images:', e);
            parsedImages = [];
          }
        } else if (Array.isArray(box.images)) {
          parsedImages = box.images;
        }
      }

      const existingMainImage = box.mainImage || '';

      setFormData({
        number: box.number || '',
        name: box.name || '',
        description: box.description || '',
        funFact: box.funFact || '',
        mainImage: existingMainImage,
        images: parsedImages,
        audioUrl: box.audioUrl || ''
      });

      // Set image previews from existing box
      setMainImagePreview(existingMainImage ? normalizeAssetUrl(existingMainImage) : '');
      setAdditionalImagesPreviews(parsedImages.map(img => normalizeAssetUrl(img)));
    } else if (nextBoxNumber) {
      // Auto-fill next box number for new boxes
      setFormData({
        number: nextBoxNumber,
        name: '',
        description: '',
        funFact: '',
        mainImage: '',
        images: [],
        audioUrl: ''
      });
      setMainImagePreview('');
      setAdditionalImagesPreviews([]);
    }
  }, [box, nextBoxNumber]);

  useEffect(() => {
    if (box && languages.length > 0) {
      loadBoxTranslations();
    }
  }, [box, languages]);

  useEffect(() => {
    translationsRef.current = translations;
  }, [translations]);

  useEffect(() => {
    translationStatusRef.current = translationSaveStatus;
  }, [translationSaveStatus]);

  useEffect(() => {
    return () => {
      Object.values(autosaveTimersRef.current).forEach((timerId) => clearTimeout(timerId));
      autosaveTimersRef.current = {};
    };
  }, []);

  const loadLanguages = async () => {
    try {
      const data = await adminApiService.getLanguages();
      // Filter out English (default language)
      const nonDefaultLanguages = (data.languages || []).filter(lang => !lang.isDefault);
      setLanguages(nonDefaultLanguages);
    } catch (err) {
      console.error('Failed to load languages:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadBoxTranslations = async () => {
    if (!box) return;
    
    try {
      const data = await adminApiService.getBoxTranslations(box.id);
      const translationMap = {};
      
      (data.translations || []).forEach(trans => {
        translationMap[trans.languageCode] = {
          name: trans.name,
          description: trans.description,
          funFact: trans.funFact || '',
          audioUrl: trans.audioUrl || ''
        };
      });
      
      setTranslations(translationMap);
      const statusMap = {};
      Object.keys(translationMap).forEach((languageCode) => {
        statusMap[languageCode] = 'saved';
      });
      setTranslationSaveStatus(statusMap);
    } catch (err) {
      console.error('Failed to load translations:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // For number field, validate it's a positive integer
    if (name === 'number') {
      const numValue = parseInt(value);
      if (value === '' || (numValue > 0 && !isNaN(numValue))) {
        setFormData({
          ...formData,
          [name]: value === '' ? '' : numValue
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleTranslationChange = (languageCode, field, value) => {
    setTranslations(prev => {
      const existing = prev[languageCode] || {};
      if ((existing[field] || '') === value) {
        return prev;
      }
      return {
        ...prev,
        [languageCode]: {
          name: '',
          description: '',
          funFact: '',
          audioUrl: '',
          ...existing,
          [field]: value
        }
      };
    });

    setTranslationSaveStatus(prev => ({
      ...prev,
      [languageCode]: 'edited'
    }));

    scheduleTranslationAutosave(languageCode);
  };

  const scheduleTranslationAutosave = (languageCode) => {
    if (!box) return;

    const existingTimer = autosaveTimersRef.current[languageCode];
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    autosaveTimersRef.current[languageCode] = setTimeout(async () => {
      const currentStatus = translationStatusRef.current[languageCode];
      if (currentStatus === 'saving') return;
      await handleSaveSingleTranslation(languageCode, { silent: true, onlyIfValid: true });
    }, 1200);
  };

  const handleSaveSingleTranslation = async (languageCode, options = {}) => {
    const { silent = false, onlyIfValid = false } = options;

    if (!box) {
      setError('Save the box first, then save language translations.');
      return;
    }

    const translation = translationsRef.current[languageCode];
    if (!translation) {
      if (!silent) {
        setError(`No translation content found for ${languageCode.toUpperCase()}.`);
      }
      return;
    }

    const stripHtml = (html) => {
      const tmp = document.createElement('div');
      tmp.innerHTML = html || '';
      return tmp.textContent || tmp.innerText || '';
    };

    if (!translation.name?.trim() || !stripHtml(translation.description).trim()) {
      if (onlyIfValid) {
        return;
      }
      if (!silent) {
        setError(`Name and description are required for ${languageCode.toUpperCase()}.`);
      }
      setTranslationSaveStatus(prev => ({
        ...prev,
        [languageCode]: 'error'
      }));
      return;
    }

    try {
      setTranslationSaveStatus(prev => ({
        ...prev,
        [languageCode]: 'saving'
      }));
      setError('');

      await adminApiService.saveBoxTranslation(box.id, {
        languageCode,
        name: translation.name,
        description: translation.description,
        funFact: translation.funFact || '',
        audioUrl: translation.audioUrl || ''
      });

      setTranslationSaveStatus(prev => ({
        ...prev,
        [languageCode]: 'saved'
      }));
      if (!silent) {
        setSuccessMessage(`${languageCode.toUpperCase()} translation saved.`);
        setTimeout(() => setSuccessMessage(''), 1800);
      }
    } catch (err) {
      setTranslationSaveStatus(prev => ({
        ...prev,
        [languageCode]: 'error'
      }));
      if (!silent) {
        setError(err.response?.data?.error || `Failed to save ${languageCode.toUpperCase()} translation.`);
      }
    }
  };

  const handleMainImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      setUploadingFile(`Main Image: ${file.name}`);
      setUploadProgress(0);
      setError('');
      setSuccessMessage('');
      
      const formData = new FormData();
      formData.append('mainImage', file);
      
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) return prev;
          return prev + 10;
        });
      }, 200);
      
      const response = await adminApiService.uploadBoxFiles(formData);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setFormData(prev => ({
        ...prev,
        mainImage: response.mainImage
      }));
      
  setMainImagePreview(normalizeAssetUrl(response.mainImage));
      setSuccessMessage('Main image uploaded successfully! ✓');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to upload main image: ' + (err.response?.data?.error || err.message));
    } finally {
      setUploading(false);
      setUploadingFile('');
      setUploadProgress(0);
    }
  };

  const handleAdditionalImagesChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Ensure formData.images is an array
    const currentImages = Array.isArray(formData.images) ? formData.images : [];

    // Validate total number of images (max 10)
    if (currentImages.length + files.length > 10) {
      setError('Maximum 10 additional images allowed');
      return;
    }

    try {
      setUploading(true);
      setUploadingFile(`Uploading ${files.length} image(s)...`);
      setUploadProgress(0);
      setError('');
      setSuccessMessage('');
      
      const uploadedImages = [];
      const totalFiles = files.length;
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (!file.type.startsWith('image/')) {
          throw new Error(`Invalid file type: ${file.name}`);
        }
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`Image ${file.name} size must be less than 5MB`);
        }

        setUploadingFile(`Uploading image ${i + 1}/${totalFiles}: ${file.name}`);
        
        const formData = new FormData();
        formData.append('images', file);
        
        const response = await adminApiService.uploadBoxFiles(formData);
        uploadedImages.push(response.images[0]);
        
        // Update progress
        setUploadProgress(Math.round(((i + 1) / totalFiles) * 100));
      }
      
      setFormData(prev => ({
        ...prev,
        images: [...currentImages, ...uploadedImages]
      }));
      
      setAdditionalImagesPreviews(prev => [
        ...prev,
        ...uploadedImages.map(img => normalizeAssetUrl(img))
      ]);
      
      setSuccessMessage(`${files.length} image(s) uploaded successfully! ✓`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to upload images: ' + (err.message || err.response?.data?.error));
    } finally {
      setUploading(false);
      setUploadingFile('');
      setUploadProgress(0);
    }
  };

  const handleRemoveAdditionalImage = async (index) => {
    const imageToRemove = formData.images[index];
    
    try {
      await adminApiService.deleteFile(imageToRemove);
      
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
      
      setAdditionalImagesPreviews(prev => prev.filter((_, i) => i !== index));
    } catch (err) {
      console.error('Failed to delete image:', err);
      // Remove from UI anyway
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
      setAdditionalImagesPreviews(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleAudioChange = async (e, languageCode = null) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validAudioTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/x-m4a'];
    if (!validAudioTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|ogg|m4a)$/i)) {
      setError('Please select a valid audio file (MP3, WAV, OGG, or M4A)');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Audio size must be less than 10MB');
      return;
    }

    try {
      setUploading(true);
      setUploadingFile(`Audio: ${file.name} ${languageCode ? `(${languageCode.toUpperCase()})` : '(English)'}`);
      setUploadProgress(0);
      setError('');
      setSuccessMessage('');
      
      const uploadFormData = new FormData();
      uploadFormData.append('audio', file);
      
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) return prev;
          return prev + 10;
        });
      }, 300);
      
      // For translation audio (not English), add languageCode and use translation endpoint
      if (languageCode && languageCode !== 'en' && box) {
        uploadFormData.append('languageCode', languageCode);
        const response = await adminApiService.uploadTranslationAudio(box.id, uploadFormData);
        
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        setTranslations(prev => ({
          ...prev,
          [languageCode]: {
            ...prev[languageCode],
            audioUrl: response.audioUrl
          }
        }));
        
        setSuccessMessage(`Audio uploaded successfully for ${languageCode.toUpperCase()}! ✓`);
      } else {
        // English audio or new box - use regular upload endpoint
        const response = await adminApiService.uploadBoxFiles(uploadFormData);
        
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        setFormData(prev => ({
          ...prev,
          audioUrl: response.audioUrl
        }));
        
        setSuccessMessage('Audio uploaded successfully! ✓');
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Audio upload error:', err);
      setError('Failed to upload audio: ' + (err.response?.data?.error || err.message));
    } finally {
      setUploading(false);
      setUploadingFile('');
      setUploadProgress(0);
    }
  };

  const handleRemoveAudio = async (languageCode = null) => {
    const audioToRemove = (languageCode && languageCode !== 'en') 
      ? translations[languageCode]?.audioUrl 
      : formData.audioUrl;
    
    if (!audioToRemove) return;

    try {
      await adminApiService.deleteFile(audioToRemove);
      
      if (languageCode && languageCode !== 'en') {
        setTranslations(prev => ({
          ...prev,
          [languageCode]: {
            ...prev[languageCode],
            audioUrl: ''
          }
        }));
        // Stop audio if playing
        if (audioRefs[languageCode]) {
          audioRefs[languageCode].pause();
          setAudioPlaying(prev => ({ ...prev, [languageCode]: false }));
        }
      } else {
        setFormData(prev => ({
          ...prev,
          audioUrl: ''
        }));
        // Stop audio if playing
        if (audioRefs['en']) {
          audioRefs['en'].pause();
          setAudioPlaying(prev => ({ ...prev, ['en']: false }));
        }
      }
    } catch (err) {
      console.error('Failed to delete audio:', err);
      // Remove from UI anyway
      if (languageCode && languageCode !== 'en') {
        setTranslations(prev => ({
          ...prev,
          [languageCode]: {
            ...prev[languageCode],
            audioUrl: ''
          }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          audioUrl: ''
        }));
      }
    }
  };

  const toggleAudioPlayback = (audioUrl, key) => {
    const audio = audioRefs[key];
    const resolvedUrl = normalizeAssetUrl(audioUrl);
    if (!audio) {
      const newAudio = new Audio(resolvedUrl);
      newAudio.onended = () => setAudioPlaying(prev => ({ ...prev, [key]: false }));
      setAudioRefs(prev => ({ ...prev, [key]: newAudio }));
      newAudio.play();
      setAudioPlaying(prev => ({ ...prev, [key]: true }));
    } else {
      if (audioPlaying[key]) {
        audio.pause();
        setAudioPlaying(prev => ({ ...prev, [key]: false }));
      } else {
        audio.play();
        setAudioPlaying(prev => ({ ...prev, [key]: true }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate box number
    if (!formData.number || formData.number < 1) {
      setError('Please enter a valid box number');
      return;
    }
    
    // Check if box number already exists (for new boxes or changed numbers)
    if (!box || box.number !== formData.number) {
      if (existingBoxNumbers.includes(formData.number)) {
        setError(`Box number ${formData.number} already exists. Please choose a different number.`);
        return;
      }
    }
    
    // Validate required English fields
    if (!formData.name.trim()) {
      setError('English name is required');
      return;
    }
    
    // Strip HTML tags for validation (allow plain text or formatted content)
    const stripHtml = (html) => {
      const tmp = document.createElement('div');
      tmp.innerHTML = html;
      return tmp.textContent || tmp.innerText || '';
    };
    
    if (!stripHtml(formData.description).trim()) {
      setError('English description is required');
      return;
    }

    const mainImageToSave = formData.mainImage || box?.mainImage || '';

    // Validate required main image
    if (!mainImageToSave) {
      setError('Main image is required');
      return;
    }
    
    try {
      setSaving(true);
      setError('');
      setSuccessMessage('');
      
      // Save the box first (English default with images and audio)
      await onSave({
        ...formData,
        mainImage: mainImageToSave
      });
      
      setSuccessMessage('Box saved successfully! ✓');
      
      // If editing, save translations for all languages
      if (box) {
        for (const lang of languages) {
          const translation = translations[lang.code];
          if (translation && translation.name && translation.description) {
            await adminApiService.saveBoxTranslation(box.id, {
              languageCode: lang.code,
              name: translation.name,
              description: translation.description,
              funFact: translation.funFact || '',
              audioUrl: translation.audioUrl || ''
            });
            setTranslationSaveStatus(prev => ({
              ...prev,
              [lang.code]: 'saved'
            }));
          }
        }
        await loadBoxTranslations();
        setSuccessMessage('Box and all translations saved successfully! ✓');
      }
      
      // Show success message for 1.5 seconds before closing
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to save box';
      setError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-start sm:items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[96vh] sm:h-[92vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 shrink-0">
          <h2 className="text-xl font-semibold text-gray-800">
            {box ? 'Edit Box' : 'Add New Box'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg animate-fade-in">
              <p className="text-sm font-medium">{successMessage}</p>
            </div>
          )}

          {/* Upload Progress Bar */}
          {uploading && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-blue-700">{uploadingFile}</p>
                <span className="text-sm font-semibold text-blue-700">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-blue-600 mt-2">Uploading to server and database...</p>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-garden-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading languages...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Visual preview + upload controls (Dribbble-style card) */}
                <div className="space-y-4 lg:col-span-1">
                  <div className="rounded-2xl bg-gradient-to-br from-white to-gray-50 p-4 shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-gray-800">Preview</h4>
                      <span className="text-xs text-gray-500">Visuals</span>
                    </div>
                    <div className="mt-4 flex flex-col items-center gap-4">
                      {mainImagePreview ? (
                        <img src={mainImagePreview} alt="Main preview" className="w-full h-44 object-cover rounded-xl border-2 border-garden-500 shadow-sm" />
                      ) : (
                        <div className="w-full h-44 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400">
                          <ImageIcon className="w-8 h-8" />
                        </div>
                      )}
                      <div className="w-full flex justify-between items-center">
                        <label className="flex items-center gap-2 px-3 py-2 bg-garden-500 text-white rounded-lg hover:bg-garden-600 cursor-pointer transition-colors text-sm">
                          <Upload className="w-4 h-4" />
                          {mainImagePreview ? 'Change' : 'Upload'}
                          <input type="file" accept="image/*" onChange={handleMainImageChange} className="hidden" disabled={uploading} />
                        </label>
                        <button type="button" onClick={() => { setFormData({ ...formData, mainImage: '' }); setMainImagePreview(''); }} className="text-sm text-red-500 hover:text-red-600">Remove</button>
                      </div>
                      <p className="text-xs text-gray-500">Supported: JPEG, PNG, WebP — Max 5MB</p>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white p-4 border border-gray-100 shadow-sm">
                    <h5 className="text-sm font-semibold text-gray-800 mb-3">Additional Images</h5>
                    <div className="grid grid-cols-3 gap-2">
                      {additionalImagesPreviews.map((preview, index) => (
                        <div key={index} className="relative rounded-lg overflow-hidden h-20">
                          <img src={preview} alt={`Additional ${index + 1}`} className="w-full h-full object-cover" />
                          <button type="button" onClick={() => handleRemoveAdditionalImage(index)} className="absolute top-1 right-1 bg-white/80 p-1 rounded-full text-red-500 hover:bg-white"> <Trash2 className="w-3 h-3" /></button>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <label className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer transition-colors text-sm">
                        <ImageIcon className="w-4 h-4" /> Add
                        <input type="file" accept="image/*" multiple onChange={handleAdditionalImagesChange} className="hidden" disabled={uploading || additionalImagesPreviews.length >= 10} />
                      </label>
                      <p className="text-xs text-gray-500">{additionalImagesPreviews.length}/10</p>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white p-4 border border-gray-100 shadow-sm">
                    <h5 className="text-sm font-semibold text-gray-800 mb-3">Audio</h5>
                    {formData.audioUrl ? (
                      <div className="flex items-center gap-3">
                        <button type="button" onClick={() => toggleAudioPlayback(formData.audioUrl, 'en')} className="p-2 bg-garden-500 text-white rounded-full">{audioPlaying['en'] ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}</button>
                        <div className="flex-1 text-sm text-gray-700">Audio uploaded</div>
                        <button type="button" onClick={() => handleRemoveAudio()} className="text-red-500">Remove</button>
                      </div>
                    ) : (
                      <label className="flex items-center gap-2 px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 cursor-pointer transition-colors text-sm">
                        <Music className="w-4 h-4" /> Upload
                        <input type="file" accept="audio/*" onChange={(e) => handleAudioChange(e)} className="hidden" disabled={uploading} />
                      </label>
                    )}
                    <p className="text-xs text-gray-500 mt-2">Optional audio narration (Max 10MB)</p>
                  </div>
                </div>

                {/* Right: Form fields */}
                <div className="lg:col-span-2 space-y-4">
                {/* Box Number */}
                <div>
                <label htmlFor="number" className="block text-sm font-medium text-gray-700 mb-2">
                  Box Number *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="number"
                    name="number"
                    required
                    min="1"
                    value={formData.number}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-garden-500 focus:border-garden-500"
                    placeholder="Enter box number"
                  />
                  {!box && (
                    <p className="text-xs text-gray-500 mt-1">
                      Suggested next number: <span className="font-semibold text-garden-600">#{nextBoxNumber}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* English (Default Language) */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center">
                  <span className="bg-blue-500 text-white px-2 py-0.5 rounded text-xs mr-2">DEFAULT</span>
                  English Content
                </h3>
                <div className="space-y-3">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-garden-500 focus:border-garden-500"
                      placeholder="English name (e.g., Tomatoes)"
                    />
                  </div>
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <RichTextEditor
                      value={formData.description}
                      onChange={(value) => {
                        setFormData(prev => {
                          if ((prev.description || '') === value) return prev;
                          return { ...prev, description: value };
                        });
                      }}
                      placeholder="Enter detailed description in English..."
                    />
                  </div>
                  <div>
                    <label htmlFor="funFact" className="block text-sm font-medium text-gray-700 mb-1">
                      Fun Fact (optional)
                    </label>
                    <RichTextEditor
                      value={formData.funFact}
                      onChange={(value) => {
                        setFormData(prev => {
                          if ((prev.funFact || '') === value) return prev;
                          return { ...prev, funFact: value };
                        });
                      }}
                      placeholder="Enter an interesting fun fact..."
                    />
                  </div>
                  
                </div>
              </div>

              {/* Other Languages (Translations) */}
              {languages.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Translations (Optional)
                    </h3>
                    <p className="text-xs text-gray-500">
                      Leave blank to use English as fallback
                    </p>
                  </div>

                  {languages.map((lang) => (
                    <div key={lang.code} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <h4 className="text-sm font-medium text-gray-900 flex items-center">
                          <span className={`px-2 py-0.5 rounded text-xs mr-2 ${
                            lang.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {lang.code.toUpperCase()}
                          </span>
                          {lang.name} ({lang.nativeName})
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium ${
                            translationSaveStatus[lang.code] === 'saving'
                              ? 'text-blue-600'
                              : translationSaveStatus[lang.code] === 'saved'
                                ? 'text-green-600'
                                : translationSaveStatus[lang.code] === 'error'
                                  ? 'text-red-600'
                                  : 'text-gray-500'
                          }`}>
                            {translationSaveStatus[lang.code] === 'saving'
                              ? 'Saving...'
                              : translationSaveStatus[lang.code] === 'saved'
                                ? 'Saved'
                                : translationSaveStatus[lang.code] === 'error'
                                  ? 'Error'
                                  : 'Not saved'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleSaveSingleTranslation(lang.code)}
                            disabled={saving || uploading || translationSaveStatus[lang.code] === 'saving'}
                            className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {translationSaveStatus[lang.code] === 'saving' ? 'Saving...' : 'Save Language'}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name
                          </label>
                          <input
                            type="text"
                            value={translations[lang.code]?.name || ''}
                            onChange={(e) => handleTranslationChange(lang.code, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-garden-500 focus:border-garden-500"
                            placeholder={`Name in ${lang.name}`}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <RichTextEditor
                            value={translations[lang.code]?.description || ''}
                            onChange={(value) => handleTranslationChange(lang.code, 'description', value)}
                            placeholder={`Description in ${lang.name}`}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Fun Fact
                          </label>
                          <RichTextEditor
                            value={translations[lang.code]?.funFact || ''}
                            onChange={(value) => handleTranslationChange(lang.code, 'funFact', value)}
                            placeholder={`Fun fact in ${lang.name}`}
                          />
                        </div>
                        
                        {/* Translation Audio Upload */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Audio Description (optional)
                          </label>
                          {translations[lang.code]?.audioUrl && (
                            <div className="flex items-center gap-2 mb-2 bg-white p-3 rounded-lg border border-gray-300">
                              <button
                                type="button"
                                onClick={() => toggleAudioPlayback(translations[lang.code].audioUrl, lang.code)}
                                className="p-2 bg-garden-500 text-white rounded-full hover:bg-garden-600 transition-colors"
                              >
                                {audioPlaying[lang.code] ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                              </button>
                              <Music className="w-4 h-4 text-gray-600" />
                              <span className="text-sm text-gray-700 flex-1">Audio file uploaded</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveAudio(lang.code)}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <label className="flex items-center gap-2 px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 cursor-pointer transition-colors text-sm">
                              <Music className="w-4 h-4" />
                              {translations[lang.code]?.audioUrl ? 'Change Audio' : 'Upload Audio'}
                              <input
                                type="file"
                                accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/mp4,audio/x-m4a"
                                onChange={(e) => handleAudioChange(e, lang.code)}
                                className="hidden"
                                disabled={uploading}
                              />
                            </label>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Supported formats: MP3, WAV, OGG, M4A (Max 10MB)
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {/* Action Buttons */}
              <div className="sticky bottom-0 bg-white/95 backdrop-blur border-t border-gray-200 pt-4 pb-2 flex flex-col-reverse sm:flex-row sm:items-center gap-3 sm:gap-4">
                <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={loading || saving || uploading} className="sm:ml-auto inline-flex items-center justify-center gap-3 bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400 text-white font-semibold py-2.5 px-5 rounded-full shadow-lg hover:scale-[1.01] transition-transform disabled:opacity-50 disabled:cursor-not-allowed">
                  {saving ? 'Saving...' : (box ? 'Update Box' : 'Create Box')}
                </button>
              </div>
            </div>
          </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default BoxEditModal;

// Helper placed at end (hoisted by JS) to normalize asset URLs
function normalizeAssetUrl(url) {
  if (!url) return '';
  // If already an absolute URL (blob, http, https) return as-is
  if (/^https?:\/\//i.test(url)) return url;
  // Legacy relative path from old uploads system
  const base = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  return `${base}${url.startsWith('/') ? url : '/' + url}`;
}
