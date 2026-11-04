const multer = require('multer');
const path = require('path');

console.log('📁 Upload middleware: Using memory storage for Vercel Blob');

// Use memory storage - files will be uploaded to Vercel Blob instead
const memoryStorage = multer.memoryStorage();

// File filter for images
const imageFilter = function (req, file, cb) {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

// File filter for audio
const audioFilter = function (req, file, cb) {
  const allowedTypes = /mp3|wav|ogg|m4a/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = /audio/.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only audio files are allowed (mp3, wav, ogg, m4a)'));
  }
};

// Multer upload instances with memory storage
const uploadImage = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit for images
  },
  fileFilter: imageFilter
});

const uploadAudio = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for audio
  },
  fileFilter: audioFilter
});

// Combined upload for box creation/editing
const uploadBoxFiles = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.fieldname === 'audio') {
      audioFilter(req, file, cb);
    } else {
      imageFilter(req, file, cb);
    }
  }
});

module.exports = {
  uploadImage,
  uploadAudio,
  uploadBoxFiles
};
