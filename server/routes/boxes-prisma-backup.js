const express = require('express');
const { query, param, body, validationResult } = require('express-validator');
const prisma = require('../lib/prisma');

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
    
    if (sessionKey) {
      session = await prisma.session.findUnique({
        where: { sessionKey },
        include: { views: true }
      });
      
      if (session && session.language) {
        language = session.language;
      }
    }
    
    // Get language ID for translations
    const languageRecord = await prisma.language.findUnique({
      where: { code: language }
    });
    
    // Get all boxes with translations
    const boxes = await prisma.box.findMany({
      include: {
        translations: {
          where: languageRecord ? { languageId: languageRecord.id } : undefined
        }
      },
      orderBy: { number: 'asc' }
    });
    
    // Map boxes with translated names and visited status
    const translatedBoxes = boxes.map(box => {
      const translation = box.translations[0];
      const visited = session ? 
        session.views.some(view => view.boxId === box.id) : 
        false;
      
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
        name: translation?.name || box.name, // Use translation or default English
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
    let language = queryLanguage || 'en'; // default language
    
    if (sessionKey) {
      const session = await prisma.session.findUnique({
        where: { sessionKey }
      });
      
      if (session && session.language) {
        language = session.language;
      }
    }
    
    // Get language ID for translations
    const languageRecord = await prisma.language.findUnique({
      where: { code: language }
    });
    
    // Get box by ID with translations
    const box = await prisma.box.findUnique({
      where: { id: parseInt(id) },
      include: {
        translations: {
          where: languageRecord ? { languageId: languageRecord.id } : undefined
        }
      }
    });
    
    if (!box) {
      return res.status(404).json({ error: 'Box not found' });
    }
    
    const translation = box.translations[0];
    
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