const express = require('express');
const { supabase } = require('../config/database');

const router = express.Router();

// Get all active languages
router.get('/', async (req, res) => {
  try {
    const { data: languages, error } = await supabase
      .from('languages')
      .select('*')
      .eq('isActive', true)
      .order('isDefault', { ascending: false })
      .order('name', { ascending: true });
    
    if (error) throw error;
    
    res.json({ languages });
  } catch (error) {
    console.error('Error fetching languages:', error);
    res.status(500).json({ error: 'Failed to fetch languages' });
  }
});

// Get language by code
router.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;
    
    const { data: language, error } = await supabase
      .from('languages')
      .select('*')
      .eq('code', code)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    
    if (!language) {
      return res.status(404).json({ error: 'Language not found' });
    }
    
    res.json(language);
  } catch (error) {
    console.error('Error fetching language:', error);
    res.status(500).json({ error: 'Failed to fetch language' });
  }
});

// Get quick guide for a specific language
router.get('/:languageCode/quick-guide', async (req, res) => {
  try {
    const { languageCode } = req.params;
    
    // Try to find the requested language
    let { data: language, error } = await supabase
      .from('languages')
      .select('*')
      .eq('code', languageCode)
      .single();
    
    // If not found or no quick guide content, fall back to English (default)
    if (!language || !language.quickGuideTitle) {
      const { data: defaultLang, error: defaultError } = await supabase
        .from('languages')
        .select('*')
        .eq('isDefault', true)
        .not('quickGuideTitle', 'is', null)
        .single();
      
      language = defaultLang;
      error = defaultError;
    }
    
    // If still no language found, return error
    if (!language) {
      return res.status(404).json({ 
        error: 'Quick guide not available. Please configure it in the admin panel.' 
      });
    }
    
    // Return the language-specific quick guide content
    res.json({
      quickGuide: {
        title: language.quickGuideTitle,
        step1Title: language.quickGuideStep1Title,
        step1Desc: language.quickGuideStep1Desc,
        step2Title: language.quickGuideStep2Title,
        step2Desc: language.quickGuideStep2Desc,
        step3Title: language.quickGuideStep3Title,
        step3Desc: language.quickGuideStep3Desc,
        step4Title: language.quickGuideStep4Title,
        step4Desc: language.quickGuideStep4Desc,
        exampleTitle: language.quickGuideExampleTitle,
        exampleDesc: language.quickGuideExampleDesc,
        skipBtn: language.quickGuideSkipBtn,
        startBtn: language.quickGuideStartBtn
      }
    });
  } catch (error) {
    console.error('Error fetching quick guide:', error);
    res.status(500).json({ error: 'Failed to fetch quick guide' });
  }
});

module.exports = router;
