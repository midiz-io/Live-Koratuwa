const express = require('express');
const { body, validationResult } = require('express-validator');
const { supabase } = require('../config/database');
const { getSriLankanTimestamp } = require('../utils/timezone');

const router = express.Router();

/**
 * POST /api/visit
 * Purpose: Mark a box as visited
 * Request: { sessionKey, boxId }
 * Response: { success, boxId, visitedAt }
 */
router.post('/', [
  body('sessionKey').isString(),
  body('boxId').isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Invalid request body', 
        details: errors.array() 
      });
    }

    const { sessionKey, boxId } = req.body;
    
    // Validate sessionKey exists
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('sessionKey', sessionKey)
      .single();
    
    if (sessionError || !session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Check if session is expired (older than 24 hours)
    const sessionAge = Date.now() - new Date(session.createdAt).getTime();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    
    if (sessionAge > twentyFourHours) {
      return res.status(401).json({ 
        error: 'Session expired', 
        message: 'This session has expired. Please start a new session.' 
      });
    }
    
    // Update lastSeen timestamp with Sri Lankan time
    const sriLankanTime = getSriLankanTimestamp();
    await supabase
      .from('sessions')
      .update({ lastSeen: sriLankanTime })
      .eq('id', session.id);
    
    // Validate boxId exists
    const { data: box, error: boxError } = await supabase
      .from('boxes')
      .select('id')
      .eq('id', boxId)
      .single();
    
    if (boxError || !box) {
      return res.status(404).json({ error: 'Box not found' });
    }
    
    // Check if visit already exists
    const { data: existingVisit } = await supabase
      .from('views')
      .select('*')
      .eq('sessionId', session.id)
      .eq('boxId', boxId)
      .single();
    
    let visit;
    const visitTime = getSriLankanTimestamp();
    
    if (existingVisit) {
      // Update existing visit timestamp
      const { data, error } = await supabase
        .from('views')
        .update({ createdAt: visitTime })
        .eq('id', existingVisit.id)
        .select()
        .single();
      visit = data;
    } else {
      // Create new visit
      const { data, error } = await supabase
        .from('views')
        .insert({
          sessionId: session.id,
          boxId: boxId,
          language: session.language,
          createdAt: visitTime
        })
        .select()
        .single();
      visit = data;
    }
    
    res.json({
      success: true,
      boxId: boxId,
      visitedAt: visit.createdAt
    });
    
  } catch (error) {
    console.error('Visit tracking error:', error);
    res.status(500).json({ error: 'Failed to record visit' });
  }
});

module.exports = router;
