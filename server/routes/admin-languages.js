const express = require('express');
const prisma = require('../lib/prisma');
const { supabaseAdmin } = require('../config/database');
const { authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all languages (admin view)
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    // Get all languages
    const { data: languages, error: langError } = await supabaseAdmin
      .from('languages')
      .select('*')
      .order('isDefault', { ascending: false })
      .order('name', { ascending: true });
    
    if (langError) throw langError;
    
    // Get translation counts for each language
    const { data: translations, error: transError } = await supabaseAdmin
      .from('box_translations')
      .select('languageId');
    
    if (transError) throw transError;
    
    // Count translations per language
    const translationCounts = {};
    translations.forEach(trans => {
      translationCounts[trans.languageId] = (translationCounts[trans.languageId] || 0) + 1;
    });
    
    // Format response with translationCount
    const formattedLanguages = languages.map(lang => ({
      id: lang.id,
      code: lang.code,
      name: lang.name,
      nativeName: lang.nativeName,
      isDefault: lang.isDefault,
      isActive: lang.isActive,
      translationCount: translationCounts[lang.id] || 0,
      createdAt: lang.createdAt,
      updatedAt: lang.updatedAt
    }));
    
    res.json({ languages: formattedLanguages });
  } catch (error) {
    console.error('Error fetching languages:', error);
    res.status(500).json({ error: 'Failed to fetch languages' });
  }
});

// Add new language
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const { code, name, nativeName, isActive } = req.body;
    
    // Validate input
    if (!code || !name || !nativeName) {
      return res.status(400).json({ error: 'Code, name, and nativeName are required' });
    }
    
    // Check if language already exists
    const { data: existing } = await supabaseAdmin
      .from('languages')
      .select('*')
      .eq('code', code)
      .single();
    
    if (existing) {
      return res.status(400).json({ error: 'Language with this code already exists' });
    }
    
    // Create new language
    const timestamp = new Date().toISOString();
    const { data: language, error: createError } = await supabaseAdmin
      .from('languages')
      .insert({
        code,
        name,
        nativeName,
        isActive: isActive !== undefined ? isActive : true,
        isDefault: false, // Only English is default
        createdAt: timestamp,
        updatedAt: timestamp
      })
      .select()
      .single();
    
    if (createError) throw createError;
    
    res.status(201).json({ language, message: 'Language created successfully' });
  } catch (error) {
    console.error('Error creating language:', error);
    res.status(500).json({ error: 'Failed to create language' });
  }
});

// Update language
router.put('/:code', authenticateAdmin, async (req, res) => {
  try {
    const { code } = req.params;
    const { name, nativeName, isActive } = req.body;
    
    // Cannot change default language status
    const { data: language, error: findError } = await supabaseAdmin
      .from('languages')
      .select('*')
      .eq('code', code)
      .single();
    
    if (findError || !language) {
      return res.status(404).json({ error: 'Language not found' });
    }
    
    if (language.isDefault && isActive === false) {
      return res.status(400).json({ error: 'Cannot deactivate the default language' });
    }
    
    // Build update data
    const updateData = {
      updatedAt: new Date().toISOString()
    };
    if (name) updateData.name = name;
    if (nativeName) updateData.nativeName = nativeName;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    // Update language
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('languages')
      .update(updateData)
      .eq('code', code)
      .select()
      .single();
    
    if (updateError) throw updateError;
    
    res.json({ language: updated, message: 'Language updated successfully' });
  } catch (error) {
    console.error('Error updating language:', error);
    res.status(500).json({ error: 'Failed to update language' });
  }
});

// Get all translations for a specific box
router.get('/box/:boxId', authenticateAdmin, async (req, res) => {
  try {
    const { boxId } = req.params;
    const boxIdInt = parseInt(boxId);
    
    console.log('[Admin] Fetching translations for box:', boxIdInt);
    
    // Get box from Supabase
    const { data: box, error: boxError } = await supabaseAdmin
      .from('boxes')
      .select('*')
      .eq('id', boxIdInt)
      .single();
    
    if (boxError || !box) {
      console.error('[Admin] Box not found:', boxError);
      return res.status(404).json({ error: 'Box not found' });
    }
    
    // Get all translations for this box
    const { data: boxTranslations, error: transError } = await supabaseAdmin
      .from('box_translations')
      .select('*')
      .eq('boxId', boxIdInt);
    
    if (transError) {
      console.error('[Admin] Error fetching translations:', transError);
      throw transError;
    }
    
    console.log('[Admin] Found translations:', boxTranslations?.length || 0);
    
    // Get all languages to map IDs to codes
    const { data: languages, error: langError } = await supabaseAdmin
      .from('languages')
      .select('*');
    
    if (langError) {
      console.error('[Admin] Error fetching languages:', langError);
      throw langError;
    }
    
    // Create language lookup map
    const languageMap = {};
    languages.forEach(lang => {
      languageMap[lang.id] = lang;
    });
    
    // Format translations with language details
    const translations = (boxTranslations || []).map(t => {
      const lang = languageMap[t.languageId];
      console.log(`[Admin] Translation for language ${t.languageId}:`, lang?.code, lang?.name);
      return {
        languageCode: lang?.code || 'unknown',
        languageName: lang?.name || 'Unknown',
        name: t.name,
        description: t.description,
        funFact: t.funFact,
        audioUrl: t.audioUrl
      };
    });
    
    console.log('[Admin] Returning translations:', translations.map(t => t.languageCode));
    
    res.json({ box, translations });
  } catch (error) {
    console.error('[Admin] Error fetching box translations:', error);
    res.status(500).json({ error: 'Failed to fetch box translations' });
  }
});

// Add or update translation for a box
router.post('/box/:boxId/translation', authenticateAdmin, async (req, res) => {
  try {
    const { boxId } = req.params;
    const { languageCode, name, description, funFact, audioUrl } = req.body;
    const boxIdInt = parseInt(boxId);
    
    console.log('[Admin] Saving translation for box:', boxIdInt, 'language:', languageCode);
    
    // Validate input
    if (!languageCode || !name || !description) {
      return res.status(400).json({ error: 'Language code, name, and description are required' });
    }
    
    // Check if box exists
    const { data: box, error: boxError } = await supabaseAdmin
      .from('boxes')
      .select('id')
      .eq('id', boxIdInt)
      .single();
    
    if (boxError || !box) {
      console.error('[Admin] Box not found:', boxError);
      return res.status(404).json({ error: 'Box not found' });
    }
    
    // Get language
    const { data: language, error: langError } = await supabaseAdmin
      .from('languages')
      .select('*')
      .eq('code', languageCode)
      .single();
    
    if (langError || !language) {
      console.error('[Admin] Language not found:', langError);
      return res.status(404).json({ error: 'Language not found' });
    }
    
    // Cannot add translation for English (it's the default)
    if (language.code === 'en') {
      return res.status(400).json({ 
        error: 'Cannot add translation for English. Update the box directly instead.' 
      });
    }
    
    // Check if translation already exists
    const { data: existingTranslation, error: checkError } = await supabaseAdmin
      .from('box_translations')
      .select('*')
      .eq('boxId', boxIdInt)
      .eq('languageId', language.id)
      .single();
    
    let translation;
    const timestamp = new Date().toISOString();
    
    if (existingTranslation && !checkError) {
      // Update existing translation
      console.log('[Admin] Updating existing translation');
      const { data: updated, error: updateError } = await supabaseAdmin
        .from('box_translations')
        .update({
          name,
          description,
          funFact: funFact || null,
          audioUrl: audioUrl || null,
          updatedAt: timestamp
        })
        .eq('boxId', boxIdInt)
        .eq('languageId', language.id)
        .select()
        .single();
      
      if (updateError) {
        console.error('[Admin] Error updating translation:', updateError);
        throw updateError;
      }
      translation = updated;
    } else {
      // Create new translation
      console.log('[Admin] Creating new translation');
      const { data: created, error: createError } = await supabaseAdmin
        .from('box_translations')
        .insert({
          boxId: boxIdInt,
          languageId: language.id,
          name,
          description,
          funFact: funFact || null,
          audioUrl: audioUrl || null,
          createdAt: timestamp,
          updatedAt: timestamp
        })
        .select()
        .single();
      
      if (createError) {
        console.error('[Admin] Error creating translation:', createError);
        throw createError;
      }
      translation = created;
    }
    
    console.log('[Admin] Translation saved successfully');
    
    res.json({ 
      translation: {
        ...translation,
        language: {
          code: language.code,
          name: language.name
        }
      }, 
      message: 'Translation saved successfully' 
    });
  } catch (error) {
    console.error('[Admin] Error saving translation:', error);
    res.status(500).json({ error: 'Failed to save translation' });
  }
});

// Delete translation
router.delete('/box/:boxId/translation/:languageCode', authenticateAdmin, async (req, res) => {
  try {
    const { boxId, languageCode } = req.params;
    const boxIdInt = parseInt(boxId);
    
    console.log('[Admin] Deleting translation for box:', boxIdInt, 'language:', languageCode);
    
    // Get language
    const { data: language, error: langError } = await supabaseAdmin
      .from('languages')
      .select('*')
      .eq('code', languageCode)
      .single();
    
    if (langError || !language) {
      console.error('[Admin] Language not found:', langError);
      return res.status(404).json({ error: 'Language not found' });
    }
    
    // Cannot delete English (default language)
    if (language.code === 'en') {
      return res.status(400).json({ error: 'Cannot delete English translation' });
    }
    
    // Delete translation
    const { error: deleteError } = await supabaseAdmin
      .from('box_translations')
      .delete()
      .eq('boxId', boxIdInt)
      .eq('languageId', language.id);
    
    if (deleteError) {
      console.error('[Admin] Error deleting translation:', deleteError);
      throw deleteError;
    }
    
    console.log('[Admin] Translation deleted successfully');
    res.json({ message: 'Translation deleted successfully' });
  } catch (error) {
    console.error('[Admin] Error deleting translation:', error);
    res.status(500).json({ error: 'Failed to delete translation' });
  }
});

// Get language by code (for admin)
router.get('/:code', authenticateAdmin, async (req, res) => {
  try {
    const { code } = req.params;
    
    const { data: language, error } = await supabaseAdmin
      .from('languages')
      .select('*')
      .eq('code', code)
      .single();
    
    if (error || !language) {
      return res.status(404).json({ error: 'Language not found' });
    }
    
    res.json(language);
  } catch (error) {
    console.error('Error fetching language:', error);
    res.status(500).json({ error: 'Failed to fetch language' });
  }
});

// Update quick guide for a language
router.put('/:code/quick-guide', authenticateAdmin, async (req, res) => {
  try {
    const { code } = req.params;
    const {
      title,
      step1Title,
      step1Desc,
      step2Title,
      step2Desc,
      step3Title,
      step3Desc,
      step4Title,
      step4Desc,
      exampleTitle,
      exampleDesc,
      skipBtn,
      startBtn
    } = req.body;
    
    // Check if language exists
    const { data: language, error: findError } = await supabaseAdmin
      .from('languages')
      .select('*')
      .eq('code', code)
      .single();
    
    if (findError || !language) {
      return res.status(404).json({ error: 'Language not found' });
    }
    
    // Update quick guide fields
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('languages')
      .update({
        quickGuideTitle: title || null,
        quickGuideStep1Title: step1Title || null,
        quickGuideStep1Desc: step1Desc || null,
        quickGuideStep2Title: step2Title || null,
        quickGuideStep2Desc: step2Desc || null,
        quickGuideStep3Title: step3Title || null,
        quickGuideStep3Desc: step3Desc || null,
        quickGuideStep4Title: step4Title || null,
        quickGuideStep4Desc: step4Desc || null,
        quickGuideExampleTitle: exampleTitle || null,
        quickGuideExampleDesc: exampleDesc || null,
        quickGuideSkipBtn: skipBtn || null,
        quickGuideStartBtn: startBtn || null,
        updatedAt: new Date().toISOString()
      })
      .eq('code', code)
      .select()
      .single();
    
    if (updateError) throw updateError;
    
    res.json({ language: updated, message: 'Quick guide updated successfully' });
  } catch (error) {
    console.error('Error updating quick guide:', error);
    res.status(500).json({ error: 'Failed to update quick guide' });
  }
});

module.exports = router;