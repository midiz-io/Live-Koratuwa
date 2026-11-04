// Vercel Serverless Function Entry Point

// Initialize app outside handler for better cold start performance
let app;

const initializeApp = () => {
  if (!app) {
    try {
      app = require('../server/index');
      console.log('✅ Express app initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Express app:', error);
      throw error;
    }
  }
  return app;
};

module.exports = async (req, res) => {
  try {
    const expressApp = initializeApp();
    
    // Let Express handle the request
    return expressApp(req, res);
  } catch (error) {
    console.error('❌ Serverless function error:', error);
    console.error('Error stack:', error.stack);
    
    // Return detailed error
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      code: error.code || 'UNKNOWN_ERROR',
      details: process.env.NODE_ENV === 'production' ? 'Check server logs' : error.stack
    });
  }
};
