const sharp = require('sharp');

/**
 * Process image buffer: rotate (EXIF), resize to fit within max, and convert/compress
 * @param {Buffer} buffer
 * @param {Object} opts
 * @param {number} [opts.maxWidth=1600]
 * @param {number} [opts.maxHeight=1600]
 * @param {number} [opts.quality=80]
 * @param {('webp'|'jpeg'|'png')} [opts.format='webp']
 * @returns {Promise<{ buffer: Buffer, mimetype: string, ext: string }>}
 */
async function processImage(buffer, opts = {}) {
  const { maxWidth = 1600, maxHeight = 1600, quality = 80, format = 'webp' } = opts;

  let pipeline = sharp(buffer).rotate().resize({
    width: maxWidth,
    height: maxHeight,
    fit: 'inside',
    withoutEnlargement: true
  });

  let mimetype = 'image/webp';
  let ext = 'webp';

  if (format === 'webp') {
    pipeline = pipeline.webp({ quality });
    mimetype = 'image/webp';
    ext = 'webp';
  } else if (format === 'jpeg' || format === 'jpg') {
    pipeline = pipeline.jpeg({ quality, mozjpeg: true });
    mimetype = 'image/jpeg';
    ext = 'jpg';
  } else if (format === 'png') {
    pipeline = pipeline.png({ quality });
    mimetype = 'image/png';
    ext = 'png';
  }

  const out = await pipeline.toBuffer();
  return { buffer: out, mimetype, ext };
}

module.exports = { processImage };
