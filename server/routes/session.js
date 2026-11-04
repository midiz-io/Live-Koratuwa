const express = require('express');
const { body, validationResult } = require('express-validator');
const { supabase } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const { getSriLankanTimestamp } = require('../utils/timezone');

const router = express.Router();

/**
 * POST /api/session/start
 * Purpose: Initialize a visitor session
 * Request: { ipAddress, language }
 * Response: { sessionKey, language, createdAt }
 */
router.post('/start', [
  body('language').isIn(['en', 'si', 'zh', 'fr', 'de', 'ja', 'ru', 'hi', 'ar', 'es']),
  body('ipAddress').optional().isIP()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Invalid input', 
        details: errors.array() 
      });
    }

    const { language } = req.body;
    let { ipAddress } = req.body;
    
    // Get IP address from request if not provided
    if (!ipAddress) {
      ipAddress = req.ip || req.connection.remoteAddress || '127.0.0.1';
    }
    
    // Generate UUID sessionKey
    const sessionKey = uuidv4();
    
    // Get current Sri Lankan time
    const sriLankanTime = getSriLankanTimestamp();
    
    // Create new session
    const { data: session, error } = await supabase
      .from('sessions')
      .insert({
        sessionKey,
        ipAddress,
        language,
        createdAt: sriLankanTime,
        lastSeen: sriLankanTime
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Set httpOnly cookie for additional security
    res.cookie('sessionKey', sessionKey, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax'
    });
    
    res.status(201).json({
      sessionKey: session.sessionKey,
      language: session.language,
      createdAt: session.createdAt
    });
    
  } catch (error) {
    console.error('Session start error:', error);
    res.status(500).json({ error: 'Failed to start session' });
  }
});

module.exports = router;module.exports = router;
