#!/usr/bin/env node

/**
 * Infographic & Poster Engine - Model Context Protocol (MCP) Server
 * 
 * Standard stdio JSON-RPC 2.0 server compatible with:
 * - Google Antigravity
 * - Anthropic Claude (Claude Code CLI & Claude Desktop)
 * - OpenAI Codex / Cursor / Windsurf / Copilot
 * 
 * ZERO external dependencies.
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const url = require('url');
const os = require('os');
const readline = require('readline');
const { downloadImage } = require('./fetch-image.js');

// Import findBrowser logic or inline
function findBrowser() {
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
      path.join(home, 'Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
    );
  } else {
    const linuxDirectPaths = [
      '/usr/bin/google-chrome',
      '/usr/bin/google-chrome-stable',
      '/usr/bin/chromium',
      '/usr/bin/chromium-browser',
      '/snap/bin/chromium',
      '/usr/bin/microsoft-edge'
    ];
    for (const p of linuxDirectPaths) {
      if (fs.existsSync(p)) return p;
    }
    const linuxBinaries = ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser', 'microsoft-edge-stable'];
    for (const b of linuxBinaries) {
      try {
        const res = spawnSync('which', [b], { encoding: 'utf8' });
        if (res.status === 0 && res.stdout.trim()) return res.stdout.trim();
      } catch (e) {}
    }
  }

  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

function renderHtml(htmlPath, outputPath, options = {}) {
  const width = options.width || 1200;
  const height = options.height || 1600;
  const scale = options.scale || 2;
  const wait = options.wait || 2000;
  const transparent = options.transparent || false;

  const browser = findBrowser();
  if (!browser) {
    throw new Error('No Chromium-based browser (Chrome, Edge, Chromium) found on this machine.');
  }

  const resolvedInput = path.resolve(htmlPath);
  const resolvedOutput = path.resolve(outputPath);

  if (!fs.existsSync(resolvedInput)) {
    throw new Error(`Input HTML file not found: ${resolvedInput}`);
  }

  const outDir = path.dirname(resolvedOutput);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const inputUrl = url.pathToFileURL(resolvedInput).href;
  const tempProfileDir = path.join(os.tmpdir(), `mcp-render-profile-${Date.now()}-${Math.floor(Math.random() * 10000)}`);

  const chromeArgs = [
    '--headless=new',
    `--user-data-dir=${tempProfileDir}`,
    `--screenshot=${resolvedOutput}`,
    `--window-size=${width},${height}`,
    `--force-device-scale-factor=${scale}`,
    `--virtual-time-budget=${wait}`,
    '--hide-scrollbars',
    '--disable-gpu',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--allow-file-access-from-files'
  ];

  if (transparent) {
    chromeArgs.push('--default-background-color=00000000');
  }

  chromeArgs.push(inputUrl);

  const startTime = Date.now();
  const result = spawnSync(browser, chromeArgs, {
    stdio: 'pipe',
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024
  });

  try {
    if (fs.existsSync(tempProfileDir)) {
      fs.rmSync(tempProfileDir, { recursive: true, force: true });
    }
  } catch (e) {}

  const durationMs = Date.now() - startTime;

  if (fs.existsSync(resolvedOutput)) {
    const stats = fs.statSync(resolvedOutput);
    return {
      success: true,
      outputPath: resolvedOutput,
      sizeBytes: stats.size,
      sizeKB: (stats.size / 1024).toFixed(1),
      durationMs,
      width,
      height,
      scale
    };
  } else {
    throw new Error(`Rendering failed: ${result.stderr || result.stdout || 'Unknown error'}`);
  }
}

const templatesDir = path.resolve(__dirname, '..', 'templates');

const TOOLS = [
  {
    name: 'render_infographic',
    description: 'Render an HTML/CSS/SVG markup file or string into a high-resolution 2x Retina PNG image using local Chromium/Edge with zero API keys.',
    inputSchema: {
      type: 'object',
      properties: {
        htmlPath: {
          type: 'string',
          description: 'Absolute or relative path to the source .html file to render.'
        },
        htmlContent: {
          type: 'string',
          description: 'Optional raw HTML markup to render directly (will be temporarily saved to disk if htmlPath is omitted).'
        },
        outputPath: {
          type: 'string',
          description: 'File path where the rendered PNG image should be saved.'
        },
        width: {
          type: 'number',
          description: 'Viewport width in CSS pixels (default: 1200).'
        },
        height: {
          type: 'number',
          description: 'Viewport height in CSS pixels (default: 1600).'
        },
        scale: {
          type: 'number',
          description: 'Device scale factor for Retina crispness (default: 2).'
        },
        wait: {
          type: 'number',
          description: 'Virtual time wait budget for fonts and image loading in ms (default: 2000).'
        },
        transparent: {
          type: 'boolean',
          description: 'Whether to render with a transparent background (default: false).'
        }
      },
      required: ['outputPath']
    }
  },
  {
    name: 'list_templates',
    description: 'List all available production-grade infographic and poster templates included in the plugin.',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'get_template',
    description: 'Retrieve the raw HTML/CSS source code of a built-in template to customize or extend.',
    inputSchema: {
      type: 'object',
      properties: {
        templateName: {
          type: 'string',
          description: 'Name of the template (e.g., "comparison-infographic", "sports-matchday-poster", "event-hackathon-poster", "timeline-roadmap").'
        }
      },
      required: ['templateName']
    }
  },
  {
    name: 'download_web_image',
    description: 'Download an image from the internet (e.g. official brand logo, sports club crest, product photo, Wikipedia/Wikimedia asset) to a local file for compositing into infographics and posters.',
    inputSchema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'The HTTP or HTTPS URL of the image to download.'
        },
        outputPath: {
          type: 'string',
          description: 'Local destination path to save the downloaded image (e.g. "assets/brand-logo.png" or "outputs/subject.jpg").'
        }
      },
      required: ['url', 'outputPath']
    }
  }
];

async function handleToolsCall(name, args) {
  if (name === 'list_templates') {
    const list = [
      {
        name: 'comparison-infographic',
        file: 'comparison-infographic.html',
        dimensions: '1200x1600',
        description: 'Two-column architectural or product comparison ("A vs B") with metrics, feature tags, and pros/cons.'
      },
      {
        name: 'sports-matchday-poster',
        file: 'sports-matchday-poster.html',
        dimensions: '1080x1350',
        description: 'High-energy sports derby/championship matchday poster with team crests, player avatars, and fixture details.'
      },
      {
        name: 'event-hackathon-poster',
        file: 'event-hackathon-poster.html',
        dimensions: '1200x1600',
        description: 'Modern cyberpunk/tech summit poster with track cards, metric ribbons, and venue/callout details.'
      },
      {
        name: 'timeline-roadmap',
        file: 'timeline-roadmap.html',
        dimensions: '1200x1800',
        description: 'Multi-phase strategic architecture roadmap with connected milestones and tech tags.'
      }
    ];
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(list, null, 2)
        }
      ]
    };
  }

  if (name === 'get_template') {
    let cleanName = args.templateName.replace(/\.html$/, '');
    const candidateFile = path.join(templatesDir, `${cleanName}.html`);
    if (fs.existsSync(candidateFile)) {
      const code = fs.readFileSync(candidateFile, 'utf8');
      return {
        content: [
          {
            type: 'text',
            text: code
          }
        ]
      };
    } else {
      throw new Error(`Template not found: ${args.templateName}. Available: comparison-infographic, sports-matchday-poster, event-hackathon-poster, timeline-roadmap.`);
    }
  }

  if (name === 'render_infographic') {
    let inputPath = args.htmlPath;
    let tempCreated = false;

    if (!inputPath && args.htmlContent) {
      inputPath = path.join(os.tmpdir(), `infographic-temp-${Date.now()}.html`);
      fs.writeFileSync(inputPath, args.htmlContent, 'utf8');
      tempCreated = true;
    }

    if (!inputPath) {
      throw new Error('Either htmlPath or htmlContent must be provided.');
    }

    try {
      const result = renderHtml(inputPath, args.outputPath, {
        width: args.width,
        height: args.height,
        scale: args.scale,
        wait: args.wait,
        transparent: args.transparent
      });

      return {
        content: [
          {
            type: 'text',
            text: `[SUCCESS] Rendered ${result.outputPath} (${result.sizeKB} KB) in ${result.durationMs}ms at ${result.width}x${result.height} (${result.scale}x Retina).`
          }
        ]
      };
    } finally {
      if (tempCreated && fs.existsSync(inputPath)) {
        try { fs.unlinkSync(inputPath); } catch (e) {}
      }
    }
  }

  if (name === 'download_web_image') {
    if (!args.url || !args.outputPath) {
      throw new Error('Both "url" and "outputPath" are required for download_web_image.');
    }
    const result = await downloadImage(args.url, args.outputPath);
    return {
      content: [
        {
          type: 'text',
          text: `[SUCCESS] Downloaded ${result.outputPath} (${result.sizeKB} KB, ${result.contentType})`
        }
      ]
    };
  }

  throw new Error(`Unknown tool: ${name}`);
}

// JSON-RPC 2.0 stdio loop
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', async (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;

  let request;
  try {
    request = JSON.parse(trimmed);
  } catch (err) {
    return;
  }

  const { id, method, params } = request;

  function sendResponse(result, error = null) {
    if (id === undefined || id === null) return; // Notification, no response
    const response = { jsonrpc: '2.0', id };
    if (error) {
      response.error = { code: -32603, message: error.message || String(error) };
    } else {
      response.result = result;
    }
    process.stdout.write(JSON.stringify(response) + '\n');
  }

  try {
    if (method === 'initialize') {
      sendResponse({
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {}
        },
        serverInfo: {
          name: 'infographic-engine',
          version: '1.0.0'
        }
      });
    } else if (method === 'notifications/initialized') {
      // No response needed for notification
    } else if (method === 'ping') {
      sendResponse({});
    } else if (method === 'tools/list') {
      sendResponse({ tools: TOOLS });
    } else if (method === 'tools/call') {
      const toolName = params && params.name;
      const toolArgs = (params && params.arguments) || {};
      const result = await handleToolsCall(toolName, toolArgs);
      sendResponse(result);
    } else {
      sendResponse(null, new Error(`Method not found: ${method}`));
    }
  } catch (err) {
    sendResponse(null, err);
  }
});
