# Universal Infographic & Poster Engine
### For Google Antigravity, Anthropic Claude & OpenAI Codex

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Zero API Keys](https://img.shields.io/badge/API_Keys-Zero_Required-success.svg)](#zero-api-keys)
[![Platform](https://img.shields.io/badge/Platform-Windows_%7C_macOS_%7C_Linux-lightgrey.svg)](#cross-platform)
[![Assistants](https://img.shields.io/badge/Assistants-Antigravity_%7C_Claude_%7C_Codex-purple.svg)](#installation--setup)

An autonomous, multi-assistant plugin that creates publication-grade **infographics, posters, sports matchday graphics, event flyers, and architectural roadmaps** directly in chat with **zero external API keys**.

---

## Why Infographic Engine?

Standard text-to-image AI diffusion models (DALL-E, Imagen, Midjourney) often produce garbled typography, misaligned data tables, hallucinated metrics, and blurry text. 

The **Universal Infographic Engine** bridges this gap by uniting the precision of **structured HTML/CSS/SVG markup** with the power of **local headless browser rendering** and **AI image generation**:

- 🔤 **Razor-Sharp Typography**: Crystal-clear, unblurred text rendered at 2x Retina DPI with Google Fonts.
- 📊 **Structured Data & Layouts**: Multi-column comparison matrices, stat highlights, timeline spines, and glassmorphic panels.
- 🎨 **Hybrid AI Image Compositing**: Seamlessly embeds AI-generated character cutouts, 3D mascots, and photographic backdrops.
- ⚡ **Zero API Keys**: Uses your system's locally installed Google Chrome, Microsoft Edge, Chromium, or Brave browser. No external API keys or cloud subscriptions required.
- 💬 **Direct In-Chat Delivery**: Automatically renders and delivers high-resolution PNG images directly into your conversation alongside the editable HTML source.

---

## Architecture & How It Works

```
User Query in Chat (Antigravity, Claude, or Codex)
       │
       ▼
1. Architecture & Design Planning (Dimensions, Palette, Content Grid)
       │
       ├──► Need custom artwork / 3D subject? ──► Acquire or generate visual image asset
       │
       ▼
2. Markup Composition (HTML5 + CSS Grid + Google Fonts + Inline SVGs)
       │
       ▼
3. Local Headless Renderer (`scripts/render.js` or `scripts/mcp-server.js`)
       │
       ▼
4. Output 2x Retina PNG Image (2.2 MB - 2.9 MB crisp graphic)
       │
       ▼
5. Direct Presentation in Chat (`![Title](file:///...)` + Editable HTML Source)
```

---

## Installation & Setup

You can install the engine universally across all three assistants with a single command or configure each environment individually.

### 🚀 Universal 1-Click Install (All Assistants)

Deploys, stages, and configures the plugin across **Google Antigravity**, **Anthropic Claude**, and **OpenAI Codex** simultaneously:

```bash
git clone https://github.com/agnivon/infographic-engine.git
cd infographic-engine
npm run install:all
```

---

### 1. Google Antigravity

The plugin conforms to the [Antigravity Plugin Specification](https://antigravity.google/docs/plugins/).

#### Global Install (Available across all projects):
```bash
npm run install:antigravity
```
* **Staged to**: `~/.gemini/config/plugins/infographic-engine/`
* **Auto-configured**: Enabled in `~/.gemini/config/config.json`.
* **In-Chat Plugin Manager**: Run the `/plugin` slash command in Antigravity to view, enable, or configure the plugin.

#### Workspace Install (Project-scoped):
Copy the repository into `.agents/plugins/infographic-engine/` at your repository root. Antigravity will discover it automatically via hierarchical project traversal.

#### How Antigravity Executes:
- Antigravity loads the skill from `skills/infographic-engine/SKILL.md` via progressive disclosure.
- Antigravity enforces the design rules in `rules/AGENTS.md`.
- Tools are accessible via the zero-dependency stdio MCP server (`mcp_config.json`).

---

### 2. Anthropic Claude (Claude Code & Claude Desktop)

The plugin conforms to the official [Claude Code Plugin Specification](https://code.claude.com/docs/en/plugins/overview) via `.claude-plugin/plugin.json` and `.mcp.json`.

#### Option A: Auto-Load in Every Session (Recommended)
```bash
npm run install:claude
```
* **Auto-loads in every session**: Deployed to `~/.claude/skills/infographic-engine/` where Claude Code automatically discovers and loads any directory with a `.claude-plugin/plugin.json` without requiring extra flags (`infographic-engine@skills-dir`).
* **Plugin cache**: Also staged to `~/.claude/plugins/infographic-engine/`.
* **Desktop integration**: Automatically writes MCP settings to Claude Desktop configuration if installed.

#### Option B: Single Session / Development Mode
Load the plugin directly from disk for the current session without installing:
```bash
claude --plugin-dir ./
```
Or set the environment variable:
```bash
# Linux/macOS
export CLAUDE_CODE_PLUGIN_DIRS="/path/to/infographic-engine"
claude

# Windows (PowerShell)
$env:CLAUDE_CODE_PLUGIN_DIRS="C:\path\to\infographic-engine"
claude
```

#### Option C: Claude Code Interactive Plugin Manager
Inside an interactive Claude Code terminal session:
```text
/plugin marketplace add ./
/plugin install infographic-engine
```

#### Option D: Claude Desktop Configuration
Add the MCP server to your `claude_desktop_config.json`:
* **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
* **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "infographic-engine": {
      "command": "node",
      "args": ["<path_to_repo>/scripts/mcp-server.js"]
    }
  }
}
```

#### In-Session Controls:
* **Validate Plugin**: `claude plugin validate ./`
* **Reload during session**: `/reload-plugins`
* **Check MCP Tool Health**: `/mcp`

---

### 3. OpenAI Codex & ChatGPT Desktop

The plugin conforms to the official [OpenAI Plugin Packaging Specification](https://developers.openai.com/plugins/build/plugins) via portable root `plugin.json` (schema `https://agent-plugins.org/schemas/1.0.0/plugin.schema.json`), root `mcp.json`, and fallback `.codex-plugin/plugin.json`.

#### Option A: Personal Marketplace Install (All Projects)
```bash
npm run install:codex
```
* **Staged to**: `~/.codex/plugins/infographic-engine/`
* **Registered in**: `~/.agents/plugins/marketplace.json` under the personal marketplace catalog with `category: "Design & Visuals"`.

#### Option B: Repository Marketplace (Team / Project-Scoped)
To share this plugin with collaborators in a repository:
1. Copy or submodule the folder into `$REPO_ROOT/plugins/infographic-engine`.
2. Add or update `$REPO_ROOT/.agents/plugins/marketplace.json`:
   ```json
   {
     "name": "local-repo",
     "interface": {
       "displayName": "Project Plugins"
     },
     "plugins": [
       {
         "name": "infographic-engine",
         "source": {
           "source": "local",
           "path": "./plugins/infographic-engine"
         },
         "policy": {
           "installation": "AVAILABLE",
           "authentication": "ON_INSTALL"
         },
         "category": "Design & Visuals"
       }
     ]
   }
   ```
3. Enable in `$REPO_ROOT/.codex/config.toml`:
   ```toml
   [plugins."infographic-engine@local-repo"]
   enabled = true
   ```

#### Option C: CLI Marketplace Commands
Add this repository directly as a marketplace and install the plugin using Codex CLI:
```bash
# 1. Add this repository as a configured marketplace source
codex plugin marketplace add ./

# 2. Verify that it is registered
codex plugin marketplace list

# 3. Install the plugin from the marketplace
codex plugin add infographic-engine@infographic-engine-marketplace
```

#### Option D: ChatGPT Desktop (Work Mode / Codex)
1. Restart the ChatGPT Desktop application.
2. Navigate to **Plugins Directory** (via the plus menu or settings).
3. Select your **Personal** or **Project** marketplace source.
4. Locate **Infographic & Poster Engine** and click **Install**.

#### Codex CLI & GitHub Copilot:
Codex and GitHub Copilot automatically ingest instructions from [`AGENTS.md`](AGENTS.md) and [`.github/copilot-instructions.md`](.github/copilot-instructions.md).

---

### 4. Cursor & Windsurf IDE

To use with Cursor or Windsurf:
1. Navigate to **Settings ➔ Features ➔ MCP ➔ Add New MCP Server**.
2. Fill in:
   - **Name**: `infographic-engine`
   - **Type**: `command` (stdio)
   - **Command**: `node <path_to_repo>/scripts/mcp-server.js`

---

## Exposed MCP Tools

The bundled zero-dependency Model Context Protocol (MCP) server (`scripts/mcp-server.js`) exposes four standard tools:

| Tool | Parameters | Description |
|---|---|---|
| **`render_infographic`** | `htmlPath`, `htmlContent`, `outputPath`, `width`, `height`, `scale`, `wait`, `transparent` | Renders an HTML file or raw HTML markup string directly to a 2x Retina PNG image. |
| **`download_web_image`** | `url`, `outputPath` | Fetches an image from the internet (logos, crests, portraits, hardware photos) and saves it locally. |
| **`list_templates`** | *(none)* | Returns a list of all available production templates with dimensions and descriptions. |
| **`get_template`** | `templateName` | Retrieves the complete HTML/CSS source code of any built-in template for customization. |

---

## Intelligent Asset Selection (Web Images vs. AI Images vs. SVG)

The engine empowers agents to intelligently select the optimal asset pipeline:

| Asset Category | Recommended Source | Integration Mechanism |
|---|---|---|
| **Real-World & Brand Entities** <br>*(Official logos, club crests, athlete/celebrity likenesses, real hardware)* | **Fetch from Web** <br>(Wikipedia, official sites, brand repositories) | Embed directly via remote HTTPS `<img src="https://..." />` or download locally using `download_web_image` / `node scripts/fetch-image.js`. |
| **Creative & Conceptual Subjects** <br>*(Fictional sci-fi cars, 3D mascots, fantasy avatars, cinematic mood art)* | **Generate via AI** <br>(Antigravity `image-generator`, Codex `gpt-image-2`) | Mandatory AI image generation. Never substitute hand-drawn SVG approximations for complex photographic/artistic subjects. |
| **UI Badges & Spines** <br>*(Icons, checkmarks, arrows, progress bars, metric cards)* | **Inline SVG & CSS** | Inline `<svg>` with `currentColor` and modern CSS glassmorphism. |

---

## Testing & Verification Guide

Follow these testing procedures to verify the plugin across all environments:

### 1. Automated Render Test Suite
Runs the end-to-end rendering test against all 4 production templates at 2x Retina scale:
```bash
npm test
```
*Expected result*: All templates render successfully to `test_output/` with exit code 0.

### 2. Browser Detection Diagnostic
Verifies that your local Chrome, Edge, Chromium, or Brave executable is detected correctly:
```bash
node scripts/render.js --check-browser
```

### 3. Claude Code Plugin Validation
Validates the plugin manifest, skill YAML frontmatter, and component layout according to Claude Code standards:
```bash
claude plugin validate ./
```
*Expected result*: `✔ Validation passed`

### 4. MCP Stdio Server Diagnostic
Tests the MCP server startup and JSON-RPC readiness:
```bash
node scripts/mcp-server.js
```
*(Press `Ctrl+C` to exit).*

### 5. Live In-Chat Testing
In any assistant (Antigravity, Claude Code, or Codex), test with prompts such as:
- *"Create an infographic comparing PostgreSQL and MongoDB with key features and metrics."*
- *"Design an energetic sports matchday poster for Arsenal vs Chelsea."*
- *"Generate a tech conference poster for an AI & Quantum Computing summit."*

---

## Built-In Templates

The plugin ships with production-grade, responsive templates in `templates/`:

| Template | File | Viewport | Best For |
|---|---|---|---|
| **Comparison Infographic** | [`templates/comparison-infographic.html`](templates/comparison-infographic.html) | `1200x1600` | "A vs B" tech evaluations, product comparisons |
| **Sports Matchday Poster** | [`templates/sports-matchday-poster.html`](templates/sports-matchday-poster.html) | `1080x1350` | Football/sports fixtures, derby posters, athlete stat cards |
| **Event & Hackathon Poster** | [`templates/event-hackathon-poster.html`](templates/event-hackathon-poster.html) | `1200x1600` | Conferences, summits, buildathons, prize pool announcements |
| **Timeline & Milestone Roadmap** | [`templates/timeline-roadmap.html`](templates/timeline-roadmap.html) | `1200x1800` | Phased roadmaps, product evolutions, history guides |

---

## Standalone CLI Usage

You can also run the local renderer directly from your terminal:

```bash
# Render any HTML file to high-resolution PNG
node scripts/render.js input.html output.png --width 1200 --height 1600 --scale 2

# Render with custom wait budget for external Google Fonts
node scripts/render.js poster.html poster.png --wait 3000

# Start MCP stdio server
node scripts/mcp-server.js
```

### CLI Options:
- `--width <px>`: Viewport width in CSS pixels (default: `1200`, supports `--width=1200`)
- `--height <px>`: Viewport height in CSS pixels (default: `1600`, supports `--height=1600`)
- `--scale <factor>`: Device scale factor for Retina crispness (default: `2`, supports `--scale=2`)
- `--wait <ms>`: Wait budget in milliseconds for font loading and layout (default: `2000`, supports `--wait=2000`)
- `--transparent`: Render with a transparent background
- `--browser <path>`: Explicit path to Chrome/Edge binary (optional, auto-detected by default)

---

## Repository Structure

```text
infographic_engine/
├── plugin.json                            # Portable Agent Plugins & OpenAI Codex manifest
├── mcp.json                               # Portable Agent Plugins MCP specification
├── .agents/
│   └── plugins/
│       └── marketplace.json               # Codex repository marketplace manifest
├── .claude-plugin/
│   ├── plugin.json                        # Claude Code manifest
│   └── marketplace.json                   # Claude Code marketplace manifest
├── .codex-plugin/
│   └── plugin.json                        # Codex backward-compatibility fallback manifest
├── .mcp.json                              # Claude Code MCP server configuration
├── mcp_config.json                        # Antigravity MCP server configuration
├── CLAUDE.md                              # Claude Code & Desktop guide
├── AGENTS.md                              # Universal agent guide (Codex, Cursor, Windsurf)
├── .github/
│   └── copilot-instructions.md            # GitHub Copilot instructions
├── README.md                              # Main documentation & multi-assistant guide
├── package.json                           # NPM scripts & metadata
├── assets/
│   └── logo.svg                           # Vector logo
├── scripts/
│   ├── render.js                          # Local headless Chromium/Edge renderer
│   ├── mcp-server.js                      # Standard stdio JSON-RPC MCP server
│   └── install.js                         # Universal multi-assistant installer
├── rules/
│   └── AGENTS.md                          # Antigravity rule file
├── skills/
│   └── infographic-engine/
│       └── SKILL.md                       # Universal skill runbook
├── templates/                             # 4 Core production templates
└── tests/
    └── test-render.js                     # Test suite
```

---

## License

Licensed under the [Apache License, Version 2.0](LICENSE).
