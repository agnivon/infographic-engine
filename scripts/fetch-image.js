#!/usr/bin/env node

/**
 * Infographic & Poster Engine - Web Image Downloader
 * 
 * Safely downloads remote images from the internet with:
 * - Redirect following (HTTP 301, 302, 307, 308)
 * - Modern browser User-Agent (prevents 403 Forbidden bot blocks)
 * - Automatic parent directory creation
 * - Zero external npm dependencies (pure Node.js http/https)
 * 
 * Usage CLI:
 *   node scripts/fetch-image.js <url> <outputPath>
 * 
 * Usage Module:
 *   const { downloadImage } = require('./fetch-image.js');
 *   await downloadImage(url, outputPath);
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const { URL } = require('url');

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

function downloadImage(imageUrl, outputPath, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    if (maxRedirects < 0) {
      return reject(new Error('Too many redirects while fetching image'));
    }

    let parsedUrl;
    try {
      parsedUrl = new URL(imageUrl);
    } catch (e) {
      return reject(new Error(`Invalid URL: ${imageUrl}`));
    }

    const client = parsedUrl.protocol === 'http:' ? http : https;

    const requestOptions = {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': parsedUrl.origin
      }
    };

    const req = client.get(imageUrl, requestOptions, (res) => {
      // Handle HTTP redirects (301, 302, 303, 307, 308)
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let redirectUrl = res.headers.location;
        if (!redirectUrl.startsWith('http://') && !redirectUrl.startsWith('https://')) {
          redirectUrl = new URL(redirectUrl, parsedUrl.origin).href;
        }
        res.resume(); // consume response data to free up memory
        return resolve(downloadImage(redirectUrl, outputPath, maxRedirects - 1));
      }

      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`Failed to download image. HTTP status code: ${res.statusCode} (${res.statusMessage})`));
      }

      const contentType = res.headers['content-type'] || '';
      const resolvedOutput = path.resolve(outputPath);
      const outDir = path.dirname(resolvedOutput);

      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
      }

      const fileStream = fs.createWriteStream(resolvedOutput);
      res.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close(() => {
          const stats = fs.statSync(resolvedOutput);
          resolve({
            success: true,
            outputPath: resolvedOutput,
            sizeBytes: stats.size,
            sizeKB: (stats.size / 1024).toFixed(1),
            contentType: contentType
          });
        });
      });

      fileStream.on('error', (err) => {
        fs.unlink(resolvedOutput, () => {});
        reject(err);
      });
    });

    req.on('error', (err) => {
      reject(new Error(`Network error fetching image: ${err.message}`));
    });

    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Request timed out after 15 seconds'));
    });
  });
}

// CLI Execution support
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error('Usage: node scripts/fetch-image.js <imageUrl> <outputPath>');
    process.exit(1);
  }

  const [imageUrl, outputPath] = args;
  console.log(`[Infographic Engine] Fetching remote image: ${imageUrl} -> ${outputPath}`);

  downloadImage(imageUrl, outputPath)
    .then((result) => {
      console.log(`[SUCCESS] Downloaded ${result.outputPath} (${result.sizeKB} KB, ${result.contentType})`);
    })
    .catch((err) => {
      console.error(`[ERROR] ${err.message}`);
      process.exit(1);
    });
}

module.exports = { downloadImage };
