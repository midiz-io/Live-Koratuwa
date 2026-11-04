const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../lib/prisma');
const { supabaseAdmin } = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { uploadBoxFiles } = require('../middleware/upload');
const { uploadImage, uploadAudio, deleteFile, deleteFiles, uploadFile } = require('../services/blobStorage');
const { processImage } = require('../services/imageProcessing');
const { loginAdmin, requireAdmin, USE_SUPABASE_AUTH } = require('../services/authService');
const { getSriLankanTimestamp } = require('../utils/timezone');

const router = express.Router();

// JWT Secret (for backward compatibility)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

/**
 * Legacy middleware - now use requireAdmin from authService
 */
const verifyAdminToken = requireAdmin;

/**
 * POST /api/admin/login
 * Purpose: Authenticate admin user (supports both JWT and Supabase Auth)
 * Request: { email, password }
 * Response: { token, admin }
 */
router.post('/login', [
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Invalid credentials', 
        details: errors.array() 
      });
    }

    const { email, password } = req.body;
    
    console.log('[Admin Login] Attempting login for:', email);
    console.log('[Admin Login] Using auth provider:', USE_SUPABASE_AUTH ? 'Supabase' : 'JWT');
    
    const result = await loginAdmin(email, password);
    
    console.log('[Admin Login] Login successful for:', email);
    console.log('[Admin Login] Provider:', result.provider);
    
    res.json({
      token: result.token,
      admin: result.admin
    });
    
  } catch (error) {
    console.error('[Admin Login] Error:', error.message);
    res.status(401).json({ 
      error: error.message || 'Login failed'
    });
  }
});

/**
 * GET /api/admin/check-setup
 * Purpose: Check if admin table is set up and has users
 * This is a debug endpoint to verify the database state
 */
router.get('/check-setup', async (req, res) => {
  try {
    console.log('[Admin Check] Checking admin table setup...');
    
    // Try to count admins
    const adminCount = await prisma.admin.count();
    console.log('[Admin Check] Admin count:', adminCount);
    
    // Get admin emails (without passwords)
    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        email: true,
        createdAt: true
      }
    });
    console.log('[Admin Check] Admins found:', admins);
    
    res.json({
      status: 'OK',
      adminTableExists: true,
      adminCount,
      admins,
      message: adminCount === 0 
        ? 'Admin table exists but no admin users found. Run seed script.'
        : `Found ${adminCount} admin user(s)`
    });
    
  } catch (error) {
    console.error('[Admin Check] Error:', error);
    res.status(500).json({
      status: 'ERROR',
      adminTableExists: false,
      error: error.message,
      message: 'Failed to check admin setup. Table may not exist.',
      hint: 'Run database migrations: npx prisma migrate deploy'
    });
  }
});

/**
 * POST /api/admin/test-login
 * Purpose: Test login with detailed diagnostics
 * This endpoint provides step-by-step feedback for debugging
 */
router.post('/test-login', async (req, res) => {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    steps: []
  };
  
  try {
    const { email, password } = req.body;
    
    // Step 1: Validate input
    diagnostics.steps.push({
      step: 1,
      name: 'Input Validation',
      email: email || 'missing',
      passwordProvided: !!password,
      status: 'OK'
    });
    
    if (!email || !password) {
      diagnostics.error = 'Email or password missing';
      return res.status(400).json(diagnostics);
    }
    
    // Step 2: Check bcrypt
    diagnostics.steps.push({
      step: 2,
      name: 'Bcrypt Module',
      loaded: typeof bcrypt !== 'undefined',
      compareAvailable: typeof bcrypt.compare === 'function',
      status: 'OK'
    });
    
    // Step 3: Database lookup
    const admin = await prisma.admin.findUnique({
      where: { email }
    });
    
    diagnostics.steps.push({
      step: 3,
      name: 'Database Lookup',
      found: !!admin,
      email: email,
      status: admin ? 'OK' : 'FAILED'
    });
    
    if (!admin) {
      diagnostics.error = 'Admin user not found';
      return res.status(401).json(diagnostics);
    }
    
    // Step 4: Password comparison
    try {
      const isPasswordValid = await bcrypt.compare(password, admin.password);
      
      diagnostics.steps.push({
        step: 4,
        name: 'Password Verification',
        hashFormat: admin.password.substring(0, 4),
        hashLength: admin.password.length,
        passwordMatches: isPasswordValid,
        status: isPasswordValid ? 'OK' : 'FAILED'
      });
      
      if (!isPasswordValid) {
        diagnostics.error = 'Password does not match';
        return res.status(401).json(diagnostics);
      }
      
    } catch (bcryptError) {
      diagnostics.steps.push({
        step: 4,
        name: 'Password Verification',
        status: 'ERROR',
        error: bcryptError.message
      });
      diagnostics.error = 'Bcrypt comparison failed: ' + bcryptError.message;
      return res.status(500).json(diagnostics);
    }
    
    // Step 5: JWT generation
    try {
      const token = jwt.sign(
        { id: admin.id, email: admin.email },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      diagnostics.steps.push({
        step: 5,
        name: 'JWT Generation',
        tokenLength: token.length,
        status: 'OK'
      });
      
      diagnostics.success = true;
      diagnostics.token = token;
      diagnostics.admin = {
        id: admin.id,
        email: admin.email
      };
      
      return res.json(diagnostics);
      
    } catch (jwtError) {
      diagnostics.steps.push({
        step: 5,
        name: 'JWT Generation',
        status: 'ERROR',
        error: jwtError.message
      });
      diagnostics.error = 'JWT generation failed: ' + jwtError.message;
      return res.status(500).json(diagnostics);
    }
    
  } catch (error) {
    diagnostics.error = error.message;
    diagnostics.stack = error.stack;
    console.error('[Test Login] Critical error:', error);
    return res.status(500).json(diagnostics);
  }
});

/**
 * GET /api/admin/stats/overview
 * Purpose: High level analytics dashboard
 * Headers: Authorization: Bearer <jwt-token>
 * Response: { totalSessions, totalViews, topLanguages, recentActivity }
 */
router.get('/stats/overview', verifyAdminToken, async (req, res) => {
  try {
    // Count total sessions
    const { count: totalSessions, error: sessionsError } = await supabaseAdmin
      .from('sessions')
      .select('*', { count: 'exact', head: true });
    
    if (sessionsError) throw sessionsError;
    
    // Count total views
    const { count: totalViews, error: viewsError } = await supabaseAdmin
      .from('views')
      .select('*', { count: 'exact', head: true });
    
    if (viewsError) throw viewsError;
    
    // Get top languages by usage
    const { data: allSessions, error: langError } = await supabaseAdmin
      .from('sessions')
      .select('language');
    
    if (langError) throw langError;
    
    // Group by language manually
    const languageCounts = {};
    allSessions.forEach(session => {
      if (session.language) {
        languageCounts[session.language] = (languageCounts[session.language] || 0) + 1;
      }
    });
    
    const topLanguages = Object.entries(languageCounts)
      .map(([lang, count]) => ({ lang, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // Calculate recent activity (today's sessions/views)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { count: sessionsToday, error: sessionsTodayError } = await supabaseAdmin
      .from('sessions')
      .select('*', { count: 'exact', head: true })
      .gte('createdAt', today.toISOString());
    
    if (sessionsTodayError) throw sessionsTodayError;
    
    const { count: viewsToday, error: viewsTodayError } = await supabaseAdmin
      .from('views')
      .select('*', { count: 'exact', head: true })
      .gte('createdAt', today.toISOString());
    
    if (viewsTodayError) throw viewsTodayError;
    
    res.json({
      totalSessions,
      totalViews,
      topLanguages,
      recentActivity: {
        sessionsToday,
        viewsToday
      }
    });
    
  } catch (error) {
    console.error('Overview stats error:', error);
    res.status(500).json({ error: 'Failed to fetch overview stats' });
  }
});

/**
 * GET /api/admin/stats/boxes
 * Purpose: Show popularity of each box
 * Headers: Authorization: Bearer <jwt-token>
 * Response: [{ boxId, number, name, views, popularity }]
 */
router.get('/stats/boxes', verifyAdminToken, async (req, res) => {
  try {
    // Get all boxes
    const { data: boxes, error: boxesError } = await supabaseAdmin
      .from('boxes')
      .select('*')
      .order('number', { ascending: true });
    
    if (boxesError) throw boxesError;
    
    // Get all views with box info
    const { data: views, error: viewsError } = await supabaseAdmin
      .from('views')
      .select('boxId');
    
    if (viewsError) throw viewsError;
    
    // Count views per box
    const viewCounts = {};
    views.forEach(view => {
      viewCounts[view.boxId] = (viewCounts[view.boxId] || 0) + 1;
    });
    
    const totalViews = views.length;
    
    // Transform data to include view counts and popularity
    const boxStats = boxes.map(box => ({
      boxId: box.id,
      number: box.number,
      name: box.name,
      views: viewCounts[box.id] || 0,
      popularity: totalViews > 0 ? (viewCounts[box.id] || 0) / totalViews : 0
    }));
    
    // Sort by views descending
    boxStats.sort((a, b) => b.views - a.views);
    
    res.json(boxStats);
    
  } catch (error) {
    console.error('Box stats error:', error);
    res.status(500).json({ error: 'Failed to fetch box stats' });
  }
});

/**
 * GET /api/admin/stats/language-trend
 * Purpose: Language usage analytics over time
 * Headers: Authorization: Bearer <jwt-token>
 * Response: [{ language, count, percentage }]
 */
router.get('/stats/language-trend', verifyAdminToken, async (req, res) => {
  try {
    // Count sessions by language
    const { data: allSessions, error } = await supabaseAdmin
      .from('sessions')
      .select('language');
    
    if (error) throw error;
    
    // Group by language manually
    const languageCounts = {};
    allSessions.forEach(session => {
      if (session.language) {
        languageCounts[session.language] = (languageCounts[session.language] || 0) + 1;
      }
    });
    
    // Calculate total for percentages
    const total = Object.values(languageCounts).reduce((sum, count) => sum + count, 0);
    
    // Transform data with percentages
    const languageTrends = Object.entries(languageCounts)
      .map(([language, count]) => ({
        language,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count);
    
    res.json(languageTrends);
    
  } catch (error) {
    console.error('Language trend error:', error);
    res.status(500).json({ error: 'Failed to fetch language trends' });
  }
});

/**
 * GET /api/admin/sessions
 * Purpose: List all sessions with pagination
 * Headers: Authorization: Bearer <jwt-token>
 * Query params: page, limit, startDate, endDate, language
 * Response: { sessions: [], total, page, pages }
 */
router.get('/sessions', verifyAdminToken, async (req, res) => {
  try {
    console.log('Sessions endpoint called with query:', req.query);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const where = {};
    
    if (req.query.language) {
      where.language = req.query.language;
    }
    
    if (req.query.startDate || req.query.endDate) {
      where.createdAt = {};
      if (req.query.startDate) {
        where.createdAt.gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        where.createdAt.lte = new Date(req.query.endDate);
      }
    }
    
    console.log('Query where clause:', JSON.stringify(where, null, 2));
    
    // Build Supabase query
    let sessionsQuery = supabaseAdmin
      .from('sessions')
      .select(`
        *,
        views (
          id,
          boxId,
          createdAt,
          boxes (
            number
          )
        )
      `, { count: 'exact' })
      .order('lastSeen', { ascending: false })
      .range(skip, skip + limit - 1);
    
    // Apply filters
    if (req.query.language) {
      sessionsQuery = sessionsQuery.eq('language', req.query.language);
    }
    
    if (req.query.startDate) {
      sessionsQuery = sessionsQuery.gte('createdAt', new Date(req.query.startDate).toISOString());
    }
    
    if (req.query.endDate) {
      sessionsQuery = sessionsQuery.lte('createdAt', new Date(req.query.endDate).toISOString());
    }
    
    const { data: sessions, error, count: total } = await sessionsQuery;
    
    if (error) throw error;
    
    console.log(`Found ${total} sessions, returning ${sessions.length}`);
    
    // Transform sessions to include viewCount and viewedBoxes
    const transformedSessions = sessions.map(session => ({
      id: session.id,
      sessionKey: session.sessionKey,
      ipAddress: session.ipAddress,
      language: session.language,
      viewCount: session.views?.length || 0,
      viewedBoxes: (session.views || []).map(view => ({
        boxId: view.boxId,
        boxNumber: view.boxes?.number,
        viewedAt: view.createdAt
      })),
      lastSeen: session.lastSeen,
      createdAt: session.createdAt
    }));
    
    const pages = Math.ceil(total / limit);
    
    const response = {
      sessions: transformedSessions,
      pagination: {
        total,
        page,
        pages,
        limit
      }
    };
    
    console.log('Sending response with', transformedSessions.length, 'sessions');
    res.json(response);
    
  } catch (error) {
    console.error('Sessions list error:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

/**
 * DELETE /api/admin/sessions/:id
 * Purpose: Delete a specific session (for reset functionality)
 * Headers: Authorization: Bearer <jwt-token>
 * Response: { message: 'Session deleted successfully' }
 */
router.delete('/sessions/:id', verifyAdminToken, async (req, res) => {
  try {
    const sessionId = parseInt(req.params.id);
    
    console.log('Deleting session:', sessionId);
    
    // Delete all views associated with this session first
    const { error: viewsError } = await supabaseAdmin
      .from('views')
      .delete()
      .eq('sessionId', sessionId);
    
    if (viewsError) {
      console.error('Error deleting views:', viewsError);
      // Continue anyway - views might not exist
    }
    
    // Delete the session
    const { error: sessionError } = await supabaseAdmin
      .from('sessions')
      .delete()
      .eq('id', sessionId);
    
    if (sessionError) {
      console.error('Supabase delete session error:', sessionError);
      throw sessionError;
    }
    
    console.log('Session deleted successfully:', sessionId);
    res.json({ message: 'Session deleted successfully' });
    
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({ error: 'Failed to delete session', details: error.message });
  }
});

/**
 * GET /api/admin/boxes
 * Purpose: Get all boxes for admin management
 * Headers: Authorization: Bearer <jwt-token>
 * Response: [{ box objects with all fields }]
 */
router.get('/boxes', verifyAdminToken, async (req, res) => {
  try {
    // Get all boxes
    const { data: boxes, error: boxesError } = await supabaseAdmin
      .from('boxes')
      .select('*')
      .order('number', { ascending: true });
    
    if (boxesError) throw boxesError;
    
    // Get view counts for each box
    const { data: views, error: viewsError } = await supabaseAdmin
      .from('views')
      .select('boxId');
    
    if (viewsError) throw viewsError;
    
    // Count views per box
    const viewCounts = {};
    views.forEach(view => {
      viewCounts[view.boxId] = (viewCounts[view.boxId] || 0) + 1;
    });
    
    // Transform to include view counts
    const boxesWithStats = boxes.map(box => ({
      id: box.id,
      number: box.number,
      name: box.name,
      description: box.description,
      funFact: box.funFact,
      mainImage: box.mainImage,
      images: box.images ? JSON.parse(box.images) : [],
      audioUrl: box.audioUrl,
      viewCount: viewCounts[box.id] || 0,
      createdAt: box.createdAt,
      updatedAt: box.updatedAt
    }));
    
    res.json(boxesWithStats);
    
  } catch (error) {
    console.error('Get boxes error:', error);
    res.status(500).json({ error: 'Failed to fetch boxes' });
  }
});

/**
 * POST /api/admin/boxes
 * Purpose: Create a new box (English default)
 * Headers: Authorization: Bearer <jwt-token>
 * Body: { number, name, description, funFact, mainImage, images, audioUrl }
 * Response: { created box object }
 */
router.post('/boxes', verifyAdminToken, async (req, res) => {
  try {
    const {
      number,
      name,
      description,
      funFact,
      mainImage,
      images,
      audioUrl
    } = req.body;
    
    console.log('Creating box with data:', { number, name, audioUrl, mainImage });
    
    // Validate required fields
    if (!mainImage) {
      return res.status(400).json({ error: 'Main image is required' });
    }
    
    // Check if box number already exists
    const { data: existing, error: checkError } = await supabaseAdmin
      .from('boxes')
      .select('id, number')
      .eq('number', number)
      .single();
    
    if (existing && !checkError) {
      return res.status(400).json({ error: 'Box number already exists' });
    }
    
    // Get current Sri Lankan time
    const sriLankanTime = getSriLankanTimestamp();
    
    // Create the box
    const { data: box, error: createError } = await supabaseAdmin
      .from('boxes')
      .insert({
        number,
        name,
        description,
        funFact: funFact || null,
        mainImage,
        images: images ? JSON.stringify(images) : null,
        audioUrl: audioUrl || null,
        createdAt: sriLankanTime,
        updatedAt: sriLankanTime
      })
      .select()
      .single();
    
    if (createError) {
      console.error('Supabase create box error:', createError);
      throw createError;
    }
    
    console.log('Box created successfully:', box.id);
    res.status(201).json(box);
    
  } catch (error) {
    console.error('Create box error:', error);
    res.status(500).json({ error: 'Failed to create box', details: error.message });
  }
});

/**
 * PUT /api/admin/boxes/:id
 * Purpose: Update an existing box (English default)
 * Headers: Authorization: Bearer <jwt-token>
 * Body: { number, name, description, funFact, mainImage, images, audioUrl }
 * Response: { updated box object }
 */
router.put('/boxes/:id', verifyAdminToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const {
      number,
      name,
      description,
      funFact,
      mainImage,
      images,
      audioUrl
    } = req.body;
    
    console.log('Updating box:', id, 'with data:', { number, name, audioUrl, mainImage });
    
    // Check if box exists
    const { data: existingBox, error: checkError } = await supabaseAdmin
      .from('boxes')
      .select('id, number')
      .eq('id', id)
      .single();
    
    if (checkError || !existingBox) {
      return res.status(404).json({ error: 'Box not found' });
    }
    
    // Check if changing number to one that already exists
    if (number && number !== existingBox.number) {
      const { data: duplicateBox, error: dupError } = await supabaseAdmin
        .from('boxes')
        .select('id, number')
        .eq('number', number)
        .neq('id', id)
        .single();
      
      if (duplicateBox && !dupError) {
        return res.status(400).json({ error: 'Box number already exists' });
      }
    }
    
    // Build update object
    const updateData = {
      updatedAt: getSriLankanTimestamp()
    };
    
    if (number !== undefined) updateData.number = number;
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (funFact !== undefined) updateData.funFact = funFact || null;
    if (mainImage !== undefined) updateData.mainImage = mainImage;
    if (images !== undefined) updateData.images = images ? JSON.stringify(images) : null;
    if (audioUrl !== undefined) updateData.audioUrl = audioUrl || null;
    
    // Update the box
    const { data: box, error: updateError } = await supabaseAdmin
      .from('boxes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (updateError) {
      console.error('Supabase update box error:', updateError);
      throw updateError;
    }
    
    console.log('Box updated successfully:', box.id);
    res.json(box);
    
  } catch (error) {
    console.error('Update box error:', error);
    res.status(500).json({ error: 'Failed to update box', details: error.message });
  }
});

/**
 * DELETE /api/admin/boxes/:id
 * Purpose: Delete a box
 * Headers: Authorization: Bearer <jwt-token>
 * Response: { message: 'Box deleted successfully' }
 */
router.delete('/boxes/:id', verifyAdminToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    console.log('Deleting box:', id);
    
    // Delete associated views first
    const { error: viewsError } = await supabaseAdmin
      .from('views')
      .delete()
      .eq('boxId', id);
    
    if (viewsError) {
      console.error('Error deleting views:', viewsError);
      // Continue anyway - views might not exist
    }
    
    // Delete associated translations
    const { error: translationsError } = await supabaseAdmin
      .from('box_translations')
      .delete()
      .eq('boxId', id);
    
    if (translationsError) {
      console.error('Error deleting translations:', translationsError);
      // Continue anyway - translations might not exist
    }
    
    // Delete the box
    const { error: deleteError } = await supabaseAdmin
      .from('boxes')
      .delete()
      .eq('id', id);
    
    if (deleteError) {
      console.error('Supabase delete box error:', deleteError);
      throw deleteError;
    }
    
    console.log('Box deleted successfully:', id);
    res.json({ message: 'Box deleted successfully' });
    
  } catch (error) {
    console.error('Delete box error:', error);
    res.status(500).json({ error: 'Failed to delete box', details: error.message });
  }
});

/**
 * POST /api/admin/boxes/upload-files
 * Purpose: Upload images and audio for a box to Vercel Blob Storage
 * Headers: Authorization: Bearer <jwt-token>
 * Body: multipart/form-data with mainImage (required), images[] (optional), audio (optional)
 * Response: { mainImage, images, audioUrl }
 */
router.post('/boxes/upload-files', verifyAdminToken, uploadBoxFiles.fields([
  { name: 'mainImage', maxCount: 1 },
  { name: 'images', maxCount: 10 },
  { name: 'audio', maxCount: 1 }
]), async (req, res) => {
  try {
    const files = req.files;
    const response = {};

    // Main image (required)
    if (files.mainImage && files.mainImage[0]) {
      const file = files.mainImage[0];
      try {
        const { buffer: processed, mimetype, ext } = await processImage(file.buffer, { quality: 80, format: 'webp' });
        const timestamp = Date.now();
        const rand = Math.round(Math.random() * 1e9);
        const filename = `boxes/images/box-${timestamp}-${rand}.${ext}`;
  const { url } = await uploadFile(processed, filename, { access: 'public', contentType: mimetype, token: process.env.BLOB_READ_WRITE_TOKEN });
        response.mainImage = url;
      } catch (imgErr) {
        console.error('Image processing failed, uploading original:', imgErr.message);
        const { url } = await uploadImage(file.buffer, file.originalname, file.mimetype);
        response.mainImage = url;
      }
    }

    // Additional images (optional)
    if (files.images && files.images.length > 0) {
      const uploadPromises = files.images.map(async (file) => {
        try {
          const { buffer: processed, mimetype, ext } = await processImage(file.buffer, { quality: 75, format: 'webp' });
          const timestamp = Date.now();
          const rand = Math.round(Math.random() * 1e9);
          const filename = `boxes/images/box-${timestamp}-${rand}.${ext}`;
          const { url } = await uploadFile(processed, filename, { access: 'public', contentType: mimetype, token: process.env.BLOB_READ_WRITE_TOKEN });
          return url;
        } catch (imgErr) {
          console.error('Additional image processing failed, uploading original:', imgErr.message);
          const { url } = await uploadImage(file.buffer, file.originalname, file.mimetype);
          return url;
        }
      });
      const results = await Promise.all(uploadPromises);
      response.images = results;
    }

    // Audio file (optional)
    if (files.audio && files.audio[0]) {
      const file = files.audio[0];
      const { url } = await uploadAudio(file.buffer, file.originalname, file.mimetype);
      response.audioUrl = url;
    }

    res.json(response);
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'Failed to upload files', details: error.message });
  }
});

/**
 * POST /api/admin/boxes/:id/upload-translation-audio
 * Purpose: Upload audio for a specific language translation to Vercel Blob Storage
 * Headers: Authorization: Bearer <jwt-token>
 * Body: multipart/form-data with audio file and languageCode
 * Response: { audioUrl }
 */
router.post('/boxes/:id/upload-translation-audio', verifyAdminToken, uploadBoxFiles.single('audio'), async (req, res) => {
  try {
    const boxId = parseInt(req.params.id);
    const languageCode = req.body.languageCode;

    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    if (!languageCode) {
      return res.status(400).json({ error: 'Language code is required' });
    }

  const { url } = await uploadAudio(req.file.buffer, req.file.originalname, req.file.mimetype);

    res.json({ audioUrl: url });
  } catch (error) {
    console.error('Audio upload error:', error);
    res.status(500).json({ error: 'Failed to upload audio', details: error.message });
  }
});

/**
 * DELETE /api/admin/boxes/files
 * Purpose: Delete uploaded files from Vercel Blob Storage
 * Headers: Authorization: Bearer <jwt-token>
 * Body: { filePath } or { filePaths: [] }
 * Response: { message: 'File(s) deleted successfully' }
 */
router.delete('/boxes/files', verifyAdminToken, async (req, res) => {
  try {
    const { filePath, filePaths } = req.body;
    
    if (!filePath && (!filePaths || filePaths.length === 0)) {
      return res.status(400).json({ error: 'File path or file paths are required' });
    }

    // Handle single file deletion
    if (filePath) {
      await deleteFile(filePath);
      return res.json({ message: 'File deleted successfully' });
    }

    // Handle multiple file deletion
    if (filePaths && filePaths.length > 0) {
      await deleteFiles(filePaths);
      return res.json({ message: `${filePaths.length} file(s) deleted successfully` });
    }

  } catch (error) {
    console.error('File deletion error:', error);
    res.status(500).json({ error: 'Failed to delete file(s)', details: error.message });
  }
});

/**
 * GET /api/admin/export/csv
 * Purpose: Export session data as CSV
 * Headers: Authorization: Bearer <jwt-token>
 * Response: CSV file download
 */
router.get('/export/csv', verifyAdminToken, async (req, res) => {
  try {
    // Get all sessions with views
    const sessions = await prisma.session.findMany({
      include: {
        views: {
          include: {
            box: {
              select: {
                name_en: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Create CSV content
    let csv = 'Session ID,Language,Created At,Views Count,Boxes Viewed\n';
    
    sessions.forEach(session => {
      const boxNames = session.views.map(v => v.box.name_en).join('; ');
      csv += `"${session.sessionKey}","${session.language || 'N/A'}","${session.createdAt.toISOString()}",${session.views.length},"${boxNames}"\n`;
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="sessions-export.csv"');
    res.send(csv);
    
  } catch (error) {
    console.error('Export CSV error:', error);
    res.status(500).json({ error: 'Failed to export CSV' });
  }
});

module.exports = router;