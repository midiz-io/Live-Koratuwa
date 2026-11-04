// Load environment variables FIRST
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy for Vercel (REQUIRED for serverless deployments)
app.set('trust proxy', true);

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Dynamic CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = process.env.CORS_ORIGINS 
      ? process.env.CORS_ORIGINS.split(',')
      : [
          'http://localhost:5173',
          'http://localhost:3000',
          'https://live-karatuwa-server.vercel.app' // Allow production domain
        ];
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(null, false); // Don't crash, just deny
    }
  },
  credentials: true
};

app.use(cors(corsOptions));

// Note: File uploads now use Vercel Blob Storage instead of local static files
// Blob URLs are served directly from blob.vercel-storage.com

// Rate limiting with proper trust proxy configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  // Use a custom key generator that works with proxies
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress || 'unknown';
  },
  skip: (req) => {
    // Skip rate limiting in serverless environment if needed
    return process.env.VERCEL === '1' && !req.path.startsWith('/api/admin');
  }
});
app.use('/api/', limiter);

app.use(express.json());
app.use(cookieParser());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    ip: req.ip,
    message: 'Server scaffolded successfully - Ready for STEP B'
  });
});

// Database health check
app.get('/api/db-health', async (req, res) => {
  try {
    const prisma = require('./lib/prisma');
    await prisma.$connect();
    const count = await prisma.language.count();
    res.json({ 
      status: 'OK',
      message: 'Database connection successful',
      languageCount: count,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR',
      message: 'Database connection failed',
      error: error.message,
      code: error.code,
      timestamp: new Date().toISOString()
    });
  }
});

// API Routes
app.use('/api/session', require('./routes/session'));
app.use('/api/boxes', require('./routes/boxes'));
app.use('/api/visit', require('./routes/visit'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/languages', require('./routes/languages'));
app.use('/api/admin/languages', require('./routes/admin-languages'));

// Serve static files from React build (client/dist)
const clientDistPath = path.join(__dirname, '../client/dist');
console.log('📁 Serving static files from:', clientDistPath);

// Serve static assets (JS, CSS, images, etc.)
app.use(express.static(clientDistPath));

// SPA fallback: serve index.html for all non-API routes
app.get('*', (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  
  // Serve index.html for all other routes (SPA routing)
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server only if not in serverless environment
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔧 Trust proxy: ${app.get('trust proxy')}`);
  });
}

module.exports = app;