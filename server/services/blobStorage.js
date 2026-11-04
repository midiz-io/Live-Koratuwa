const { put, del } = require('@vercel/blob');

/**
 * Upload a file to Vercel Blob Storage
 * @param {Buffer} fileBuffer - The file buffer to upload
 * @param {string} filename - The filename to use in blob storage
 * @param {object} options - Additional options
 * @returns {Promise<{url: string}>} The blob URL
 */
async function uploadFile(fileBuffer, filename, options = {}) {
  try {
    const { url } = await put(filename, fileBuffer, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
      ...options
    });
    
    console.log(`✅ Uploaded file to blob storage: ${filename} -> ${url}`);
    return { url };
  } catch (error) {
    console.error('❌ Blob upload error:', error);
    throw new Error(`Failed to upload file to blob storage: ${error.message}`);
  }
}

/**
 * Upload an image file to Vercel Blob Storage
 * @param {Buffer} fileBuffer - The image buffer
 * @param {string} originalName - Original filename
 * @param {string} mimetype - File mimetype
 * @returns {Promise<{url: string}>} The blob URL
 */
async function uploadImage(fileBuffer, originalName, mimetype) {
  const timestamp = Date.now();
  const random = Math.round(Math.random() * 1E9);
  const ext = originalName.split('.').pop();
  const filename = `boxes/images/box-${timestamp}-${random}.${ext}`;
  
  return uploadFile(fileBuffer, filename, {
    contentType: mimetype,
    addRandomSuffix: false
  });
}

/**
 * Upload an audio file to Vercel Blob Storage
 * @param {Buffer} fileBuffer - The audio buffer
 * @param {string} originalName - Original filename
 * @param {string} mimetype - File mimetype
 * @returns {Promise<{url: string}>} The blob URL
 */
async function uploadAudio(fileBuffer, originalName, mimetype) {
  const timestamp = Date.now();
  const random = Math.round(Math.random() * 1E9);
  const ext = originalName.split('.').pop();
  const filename = `boxes/audio/audio-${timestamp}-${random}.${ext}`;
  
  return uploadFile(fileBuffer, filename, {
    contentType: mimetype,
    addRandomSuffix: false
  });
}

/**
 * Delete a file from Vercel Blob Storage
 * @param {string} url - The blob URL to delete
 * @returns {Promise<void>}
 */
async function deleteFile(url) {
  try {
    // Only delete if it's a blob URL
    if (!url || !url.includes('blob.vercel-storage.com')) {
      console.log(`⚠️  Skipping deletion of non-blob URL: ${url}`);
      return;
    }
    
    await del(url, {
      token: process.env.BLOB_READ_WRITE_TOKEN
    });
    
    console.log(`✅ Deleted file from blob storage: ${url}`);
  } catch (error) {
    console.error('❌ Blob deletion error:', error);
    throw new Error(`Failed to delete file from blob storage: ${error.message}`);
  }
}

/**
 * Delete multiple files from Vercel Blob Storage
 * @param {string[]} urls - Array of blob URLs to delete
 * @returns {Promise<void>}
 */
async function deleteFiles(urls) {
  if (!urls || urls.length === 0) {
    return;
  }
  
  const blobUrls = urls.filter(url => url && url.includes('blob.vercel-storage.com'));
  
  if (blobUrls.length === 0) {
    console.log('⚠️  No blob URLs to delete');
    return;
  }
  
  try {
    await Promise.all(blobUrls.map(url => deleteFile(url)));
    console.log(`✅ Deleted ${blobUrls.length} files from blob storage`);
  } catch (error) {
    console.error('❌ Blob batch deletion error:', error);
    throw new Error(`Failed to delete files from blob storage: ${error.message}`);
  }
}

module.exports = {
  uploadFile,
  uploadImage,
  uploadAudio,
  deleteFile,
  deleteFiles
};
