const express = require('express');
const { query, param, validationResult } = require('express-validator');
const { supabase } = require('../config/database');

const router = express.Router();

/**
 * GET /api/boxes
 * Purpose: Get list of all garden boxes for rendering on map
 * Query: sessionKey (optional), language (optional, default: 'en')
 * Response: [{ id, number, name, description, visited }]
 */
router.get('/', [
  query('sessionKey').optional().isString(),
  query('language').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Invalid parameters', 
        details: errors.array() 
      });
    }

    const { sessionKey, language: queryLanguage } = req.query;
    
    // Get session to determine language and visited boxes
    let session = null;
    let language = queryLanguage || 'en'; // default language
    let visitedBoxIds = [];
    
    if (sessionKey) {
      // Fetch session first
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select('*')
        .eq('sessionKey', sessionKey)
        .single();

      if (!sessionError && sessionData) {
        session = sessionData;
        if (session.language) {
          language = session.language;
        }

        // Fetch visited views for this session
        const { data: viewsData } = await supabase
          .from('views')
          .select('boxId')
          .eq('sessionId', session.id);
        visitedBoxIds = (viewsData || []).map(v => v.boxId);
      }
    }
    
    // Get language ID for translations
    const { data: languageRecord } = await supabase
      .from('languages')
      .select('id')
      .eq('code', language)
      .single();
    
    // Get all boxes
    const { data: boxes, error: boxesError } = await supabase
      .from('boxes')
      .select('*')
      .order('number', { ascending: true });
    
    if (boxesError) throw boxesError;
    
    // Get translations for the selected language
    let translations = [];
    if (languageRecord) {
      const { data: translationsData } = await supabase
        .from('box_translations')
        .select('*')
        .eq('languageId', languageRecord.id);
      translations = translationsData || [];
    }
    
    // Map boxes with translated names and visited status
    const translatedBoxes = boxes.map(box => {
      const translation = translations.find(t => t.boxId === box.id);
      const visited = visitedBoxIds.includes(box.id);
      
      // Parse images JSON if it exists
      let parsedImages = [];
      if (box.images) {
        try {
          parsedImages = typeof box.images === 'string' ? JSON.parse(box.images) : box.images;
        } catch (e) {
          console.error('Failed to parse images for box', box.id, e);
          parsedImages = [];
        }
      }
      
      return {
        id: box.id,
        number: box.number,
        name: translation?.name || box.name,
        description: translation?.description || box.description,
        funFact: translation?.funFact || box.funFact || null,
        mainImage: box.mainImage || null,
        images: parsedImages,
        audioUrl: translation?.audioUrl || box.audioUrl || null,
        visited
      };
    });
    
    res.json(translatedBoxes);
    
  } catch (error) {
    console.error('Boxes listing error:', error);
    res.status(500).json({ error: 'Failed to fetch boxes' });
  }
});

/**
 * GET /api/boxes/:id
 * Purpose: Get full details of a single garden box
 * Path: id (required)
 * Query: sessionKey (optional), language (optional)
 * Response: { id, number, name, description, translations }
 */
router.get('/:id', [
  param('id').isInt({ min: 1 }),
  query('sessionKey').optional().isString(),
  query('language').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Invalid parameters', 
        details: errors.array() 
      });
    }

    const { id } = req.params;
    const { sessionKey, language: queryLanguage } = req.query;
    
    // Get session to determine language
    let language = queryLanguage || 'en';
    
    if (sessionKey) {
      const { data: session } = await supabase
        .from('sessions')
        .select('language')
        .eq('sessionKey', sessionKey)
        .single();
      
      if (session && session.language) {
        language = session.language;
      }
    }
    
    // Get language ID for translations
    const { data: languageRecord } = await supabase
      .from('languages')
      .select('id')
      .eq('code', language)
      .single();
    
    // Get box by ID
    const { data: box, error: boxError } = await supabase
      .from('boxes')
      .select('*')
      .eq('id', parseInt(id))
      .single();
    
    if (boxError || !box) {
      return res.status(404).json({ error: 'Box not found' });
    }
    
    // Get translation
    let translation = null;
    if (languageRecord) {
      const { data: translationData } = await supabase
        .from('box_translations')
        .select('*')
        .eq('boxId', box.id)
        .eq('languageId', languageRecord.id)
        .single();
      translation = translationData;
    }
    
    // Parse images JSON if it exists
    let parsedImages = [];
    if (box.images) {
      try {
        parsedImages = typeof box.images === 'string' ? JSON.parse(box.images) : box.images;
      } catch (e) {
        console.error('Failed to parse images for box', box.id, e);
        parsedImages = [];
      }
    }
    
    // Return translated box details
    res.json({
      id: box.id,
      number: box.number,
      name: translation?.name || box.name,
      description: translation?.description || box.description,
      funFact: translation?.funFact || box.funFact || null,
      mainImage: box.mainImage || null,
      images: parsedImages,
      audioUrl: translation?.audioUrl || box.audioUrl || null,
      defaultName: box.name,
      defaultDescription: box.description
    });
    
  } catch (error) {
    console.error('Box detail error:', error);
    res.status(500).json({ error: 'Failed to fetch box details' });
  }
});

module.exports = router;
