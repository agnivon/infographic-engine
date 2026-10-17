#!/usr/bin/env node

/**
 * Infographic & Poster Engine - Local Headless Renderer
 * 
 * Renders HTML/CSS/SVG markup directly to high-resolution, Retina-sharp PNG images
 * using the local Chromium/Edge engine installed on the user's machine.
 * 
 * ZERO external API keys or cloud services required.
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const url = require('url');
const os = require('os');

function printUsage() {
  console.log(`
Infographic & Poster Engine - Local Headless Renderer

Usage:
  node scripts/render.js <input.html> <output.png> [options]

Options:
  --width <number>      Viewport width in CSS pixels (default: 1200)
  --height <number>     Viewport height in CSS pixels (default: 1600)
  --scale <number>      Device scale factor for Retina crispness (default: 2)
  --wait <ms>           Virtual time wait budget for fonts/images in ms (default: 2000)
  --transparent         Render with transparent background
  --browser <path>      Explicit path to Chrome/Edge/Chromium executable
  --check-browser       Locate and print the detected browser path and exit
  --help                Show this help message

Supports both '--width 1200' and '--width=1200' syntax.

Examples:
  node scripts/render.js poster.html poster.png --width 1200 --height 1600
  node scripts/render.js matchday.html matchday.png --width 1080 --height 1350 --scale 2
  node scripts/render.js banner.html banner.png --width 1200 --height 630
`);
}

function findBrowser(customPath) {
  if (customPath && fs.existsSync(customPath)) {
    return customPath;
  }
  if (process.env.CHROME_PATH && fs.existsSync(process.env.CHROME_PATH)) {
    return process.env.CHROME_PATH;
  }
  if (process.env.BROWSER_PATH && fs.existsSync(process.env.BROWSER_PATH)) {
    return process.env.BROWSER_PATH;
  }

  const isWin = process.platform === 'win32';
  const isMac = process.platform === 'darwin';

  const candidates = [];
  if (isWin) {
    const pf86 = process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)';
    const pf = process.env.ProgramFiles || 'C:\\Program Files';
    const localApp = process.env.LOCALAPPDATA || '';
    candidates.push(
      path.join(pf, 'Google\\Chrome\\Application\\chrome.exe'),
      path.join(pf86, 'Google\\Chrome\\Application\\chrome.exe'),
      path.join(pf86, 'Microsoft\\Edge\\Application\\msedge.exe'),
      path.join(pf, 'Microsoft\\Edge\\Application\\msedge.exe'),
      path.join(localApp, 'Google\\Chrome\\Application\\chrome.exe'),
      path.join(localApp, 'Microsoft\\Edge\\Application\\msedge.exe'),
      path.join(pf, 'BraveSoftware\\Brave-Browser\\Application\\brave.exe'),
      path.join(pf86, 'BraveSoftware\\Brave-Browser\\Application\\brave.exe')
    );
  } else if (isMac) {
    const home = os.homedir();
    candidates.push(
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
      '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
      '/Applications/Chromium.app/Contents/MacOS/Chromium',
      path.join(home, 'Applications/Google Chrome.app/Contents/MacOS/Google Chrome'),
      path.join(home, 'Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge')
    );
  } else {
    // Linux - check common direct filesystem paths first
    const linuxDirectPaths = [
      '/usr/bin/google-chrome',
      '/usr/bin/google-chrome-stable',
      '/usr/bin/chromium',
      '/usr/bin/chromium-browser',
      '/snap/bin/chromium',
      '/usr/bin/microsoft-edge',
      '/usr/bin/microsoft-edge-stable',
      '/usr/bin/brave-browser'
    ];
    for (const p of linuxDirectPaths) {
      if (fs.existsSync(p)) return p;
    }

    // Fallback: which
    const linuxBinaries = [
      'google-chrome',
      'google-chrome-stable',
      'chromium',
      'chromium-browser',
      'microsoft-edge-stable',
      'brave-browser'
    ];
    for (const b of linuxBinaries) {
      try {
        const res = spawnSync('which', [b], { encoding: 'utf8' });
        if (res.status === 0 && res.stdout.trim()) {
          return res.stdout.trim();
        }
      } catch (e) {
        // which not available
      }
    }
  }

  for (const c of candidates) {
    if (fs.existsSync(c)) {
      return c;
    }
  }
  return null;
}

function parseArgs(args) {
  const options = {
    inputFile: null,
    outputFile: null,
    width: 1200,
    height: 1600,
    scale: 2,
    wait: 2000,
    transparent: false,
    customBrowser: null,
    checkBrowser: false,
    help: false
  };

  const positional = [];
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--check-browser') {
      options.checkBrowser = true;
    } else if (arg === '--transparent') {
      options.transparent = true;
    } else if (arg.startsWith('--width=')) {
      options.width = parseInt(arg.slice(8), 10) || options.width;
    } else if (arg === '--width' && i + 1 < args.length) {
      options.width = parseInt(args[++i], 10) || options.width;
    } else if (arg.startsWith('--height=')) {
      options.height = parseInt(arg.slice(9), 10) || options.height;
    } else if (arg === '--height' && i + 1 < args.length) {
      options.height = parseInt(args[++i], 10) || options.height;
    } else if (arg.startsWith('--scale=')) {
      options.scale = parseFloat(arg.slice(8)) || options.scale;
    } else if (arg === '--scale' && i + 1 < args.length) {
      options.scale = parseFloat(args[++i]) || options.scale;
    } else if (arg.startsWith('--wait=')) {
      options.wait = parseInt(arg.slice(7), 10) || options.wait;
    } else if (arg === '--wait' && i + 1 < args.length) {
      options.wait = parseInt(args[++i], 10) || options.wait;
    } else if (arg.startsWith('--browser=')) {
      options.customBrowser = arg.slice(10);
    } else if (arg === '--browser' && i + 1 < args.length) {
      options.customBrowser = args[++i];
    } else if (!arg.startsWith('--')) {
      positional.push(arg);
    }
  }

  if (positional.length >= 1) options.inputFile = positional[0];
  if (positional.length >= 2) options.outputFile = positional[1];

  return options;
}

function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    printUsage();
    process.exit(0);
  }

  const browser = findBrowser(options.customBrowser);

  if (options.checkBrowser) {
    if (browser) {
      console.log(`[OK] Detected browser executable: ${browser}`);
      process.exit(0);
    } else {
      console.error('[ERROR] No Chromium-based browser (Chrome, Edge, Chromium, Brave) detected.');
      process.exit(1);
    }
  }

  if (!options.inputFile || !options.outputFile) {
    console.error('[ERROR] Missing input HTML file or output PNG file path.');
    printUsage();
    process.exit(1);
  }

  if (!browser) {
    console.error('[ERROR] Could not find a Chromium-based browser on this system.');
    console.error('Please install Google Chrome, Microsoft Edge, or specify path with --browser <path>');
    process.exit(1);
  }

  const resolvedInput = path.resolve(options.inputFile);
  const resolvedOutput = path.resolve(options.outputFile);

  if (!fs.existsSync(resolvedInput)) {
    console.error(`[ERROR] Input HTML file not found: ${resolvedInput}`);
    process.exit(1);
  }

  // Ensure output directory exists
  const outDir = path.dirname(resolvedOutput);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const inputUrl = url.pathToFileURL(resolvedInput).href;

  console.log(`[Infographic Engine] Rendering: ${path.basename(resolvedInput)} -> ${path.basename(resolvedOutput)}`);
  console.log(`  Dimensions: ${options.width}x${options.height} @ ${options.scale}x Retina scale`);
  console.log(`  Browser: ${browser}`);

  const startTime = Date.now();

  // Create isolated temp user profile directory to prevent collisions with running Chrome instances
  const tempProfileDir = path.join(os.tmpdir(), `antigravity-render-profile-${Date.now()}-${Math.floor(Math.random() * 10000)}`);

  const chromeArgs = [
    '--headless=new',
    `--user-data-dir=${tempProfileDir}`,
    `--screenshot=${resolvedOutput}`,
    `--window-size=${options.width},${options.height}`,
    `--force-device-scale-factor=${options.scale}`,
    `--virtual-time-budget=${options.wait}`,
    '--hide-scrollbars',
    '--disable-gpu',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--allow-file-access-from-files'
  ];

  if (options.transparent) {
    chromeArgs.push('--default-background-color=00000000');
  }

  chromeArgs.push(inputUrl);

  const result = spawnSync(browser, chromeArgs, {
    stdio: 'pipe',
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024
  });

  // Clean up temp profile directory
  try {
    if (fs.existsSync(tempProfileDir)) {
      fs.rmSync(tempProfileDir, { recursive: true, force: true });
    }
  } catch (e) {
    // Non-fatal if temp directory cleanup fails
  }

  const durationMs = Date.now() - startTime;

  if (fs.existsSync(resolvedOutput)) {
    const stats = fs.statSync(resolvedOutput);
    const sizeKB = (stats.size / 1024).toFixed(1);
    console.log(`[SUCCESS] Generated ${resolvedOutput} (${sizeKB} KB) in ${durationMs}ms`);
    process.exit(0);
  } else {
    console.error('[ERROR] Headless rendering failed to produce output image.');
    if (result.stderr) console.error('Stderr:', result.stderr);
    if (result.stdout) console.error('Stdout:', result.stdout);
    process.exit(1);
  }
}

main();
