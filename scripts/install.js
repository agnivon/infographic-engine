#!/usr/bin/env node

/**
 * Universal Plugin Installer
 * 
 * Installs the Infographic & Poster Engine across:
 * 1. Google Antigravity (~/.gemini/config/plugins/infographic-engine/)
 * 2. Anthropic Claude Code (~/.claude/plugins/infographic-engine/ + .claude-plugin/)
 * 3. OpenAI Codex / ChatGPT Desktop (~/.codex/plugins/infographic-engine/ + marketplace.json)
 * 
 * Usage:
 *   node scripts/install.js          (Installs for all supported assistants)
 *   node scripts/install.js --antigravity
 *   node scripts/install.js --claude
 *   node scripts/install.js --codex
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');

const HOME = os.homedir();
const SOURCE_DIR = path.resolve(__dirname, '..');

const ITEMS_TO_COPY = [
  'plugin.json',
  '.claude-plugin',
  '.codex-plugin',
  '.agents',
  '.mcp.json',
  'mcp.json',
  'mcp_config.json',
  'README.md',
  'CLAUDE.md',
  'AGENTS.md',
  'assets',
  'scripts',
  'templates',
  'rules',
  'skills'
];

function copyRecursiveSync(src, dest) {
  if (!fs.existsSync(src)) return;
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((child) => {
      copyRecursiveSync(path.join(src, child), path.join(dest, child));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

function deployToDirectory(targetDir) {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  for (const item of ITEMS_TO_COPY) {
    const src = path.join(SOURCE_DIR, item);
    const dest = path.join(targetDir, item);
    if (fs.existsSync(src)) {
      copyRecursiveSync(src, dest);
    }
  }
}

// 1. Install to Google Antigravity
function installAntigravity() {
  console.log('\n[1/3] Installing for Google Antigravity...');
  const targetDir = path.join(HOME, '.gemini', 'config', 'plugins', 'infographic-engine');
  deployToDirectory(targetDir);
  console.log(`  ✓ Deployed plugin to: ${targetDir}`);

  // Ensure config.json has plugin enabled
  const configPath = path.join(HOME, '.gemini', 'config', 'config.json');
  try {
    let config = {};
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
    config.plugins = config.plugins || {};
    config.plugins['infographic-engine'] = config.plugins['infographic-engine'] || {};
    config.plugins['infographic-engine'].enabled = true;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
    console.log(`  ✓ Enabled in ~/.gemini/config/config.json`);
  } catch (e) {
    console.warn(`  ! Note: Could not update config.json: ${e.message}`);
  }

  // Attempt agy enable if present
  try {
    const res = spawnSync('agy', ['plugin', 'enable', 'infographic-engine'], { encoding: 'utf8' });
    if (res.status === 0) console.log(`  ✓ Enabled via agy CLI`);
  } catch (e) {}
}

// 2. Install to Anthropic Claude (Claude Code & Claude Desktop)
function installClaude() {
  console.log('\n[2/3] Installing for Anthropic Claude (Claude Code & Desktop)...');
  const targetPluginDir = path.join(HOME, '.claude', 'plugins', 'infographic-engine');
  deployToDirectory(targetPluginDir);
  console.log(`  ✓ Deployed Claude plugin cache to: ${targetPluginDir}`);

  // Also deploy to ~/.claude/skills/infographic-engine/ for automatic session-wide loading without flags
  const targetSkillsDir = path.join(HOME, '.claude', 'skills', 'infographic-engine');
  deployToDirectory(targetSkillsDir);
  console.log(`  ✓ Deployed to autoload skills directory: ${targetSkillsDir}`);

  // Register in Claude CLI via `claude mcp add` if claude is in PATH
  try {
    const mcpScript = path.join(targetPluginDir, 'scripts', 'mcp-server.js');
    const res = spawnSync('claude', ['mcp', 'add', 'infographic-engine', 'node', mcpScript], { encoding: 'utf8' });
    if (res.status === 0) {
      console.log(`  ✓ Registered MCP server with Claude Code CLI`);
    }
  } catch (e) {}

  // Update Claude Desktop config if it exists
  const isWin = process.platform === 'win32';
  const claudeDesktopConfig = isWin
    ? path.join(process.env.APPDATA || path.join(HOME, 'AppData', 'Roaming'), 'Claude', 'claude_desktop_config.json')
    : path.join(HOME, 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');

  if (fs.existsSync(path.dirname(claudeDesktopConfig))) {
    try {
      let cfg = {};
      if (fs.existsSync(claudeDesktopConfig)) {
        cfg = JSON.parse(fs.readFileSync(claudeDesktopConfig, 'utf8'));
      }
      cfg.mcpServers = cfg.mcpServers || {};
      cfg.mcpServers['infographic-engine'] = {
        command: 'node',
        args: [path.join(targetPluginDir, 'scripts', 'mcp-server.js')]
      };
      fs.writeFileSync(claudeDesktopConfig, JSON.stringify(cfg, null, 2), 'utf8');
      console.log(`  ✓ Configured MCP server in Claude Desktop config: ${claudeDesktopConfig}`);
    } catch (e) {
      console.warn(`  ! Could not write Claude Desktop config: ${e.message}`);
    }
  }
}

// 3. Install to OpenAI Codex / ChatGPT Desktop
function installCodex() {
  console.log('\n[3/3] Installing for OpenAI Codex / ChatGPT Desktop...');
  const targetDir = path.join(HOME, '.codex', 'plugins', 'infographic-engine');
  deployToDirectory(targetDir);
  console.log(`  ✓ Deployed Codex plugin to: ${targetDir}`);

  // Register in ~/.agents/plugins/marketplace.json per OpenAI Codex plugin spec
  const marketplaceDir = path.join(HOME, '.agents', 'plugins');
  const marketplaceFile = path.join(marketplaceDir, 'marketplace.json');

  try {
    if (!fs.existsSync(marketplaceDir)) {
      fs.mkdirSync(marketplaceDir, { recursive: true });
    }
    let market = { 
      name: 'personal',
      interface: {
        displayName: 'Personal Plugins'
      },
      plugins: [] 
    };
    if (fs.existsSync(marketplaceFile)) {
      market = JSON.parse(fs.readFileSync(marketplaceFile, 'utf8'));
      market.plugins = market.plugins || [];
    }

    // Upsert infographic-engine
    const existingIdx = market.plugins.findIndex(p => p.name === 'infographic-engine');
    const entry = {
      name: 'infographic-engine',
      source: {
        source: 'local',
        path: targetDir
      },
      policy: {
        installation: 'AVAILABLE',
        authentication: 'ON_INSTALL'
      },
      category: 'Design & Visuals'
    };

    if (existingIdx >= 0) {
      market.plugins[existingIdx] = entry;
    } else {
      market.plugins.push(entry);
    }

    fs.writeFileSync(marketplaceFile, JSON.stringify(market, null, 2), 'utf8');
    console.log(`  ✓ Registered in Codex marketplace: ${marketplaceFile}`);
  } catch (e) {
    console.warn(`  ! Could not register in marketplace.json: ${e.message}`);
  }

  // Also deploy/sync to active Codex marketplace cache if present (used by ChatGPT Desktop)
  const cacheBaseDir = path.join(HOME, '.codex', 'plugins', 'cache', 'infographic-engine-marketplace', 'infographic-engine');
  try {
    if (fs.existsSync(cacheBaseDir)) {
      const versions = fs.readdirSync(cacheBaseDir);
      for (const ver of versions) {
        const verDir = path.join(cacheBaseDir, ver);
        if (fs.statSync(verDir).isDirectory()) {
          deployToDirectory(verDir);
          console.log(`  ✓ Synced to Codex active runtime cache: ${verDir}`);
        }
      }
    } else {
      const defaultCache = path.join(cacheBaseDir, '1.0.0');
      deployToDirectory(defaultCache);
      console.log(`  ✓ Staged to Codex cache: ${defaultCache}`);
    }
  } catch (e) {
    console.warn(`  ! Note: Could not sync Codex cache: ${e.message}`);
  }
}

function main() {
  const args = process.argv.slice(2);
  const doAntigravity = args.length === 0 || args.includes('--antigravity') || args.includes('--all');
  const doClaude = args.length === 0 || args.includes('--claude') || args.includes('--all');
  const doCodex = args.length === 0 || args.includes('--codex') || args.includes('--all');

  console.log('========================================================');
  console.log('  Infographic & Poster Engine - Universal Installer     ');
  console.log('========================================================');

  if (doAntigravity) installAntigravity();
  if (doClaude) installClaude();
  if (doCodex) installCodex();

  console.log('\n========================================================');
  console.log('  SUCCESS: Plugin installed and ready for all agents!   ');
  console.log('========================================================\n');
}

main();
