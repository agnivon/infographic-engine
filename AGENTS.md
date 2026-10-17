# AGENTS.md - Universal Agent Guide (Antigravity, Codex, Claude, Cursor)

This project contains the **Infographic & Poster Engine**, a cross-platform system for generating high-resolution, Retina-quality visual media from structured markup and composited AI image assets with **zero third-party rendering SaaS**.

## Core Capabilities
- **Local Headless Renderer**: `scripts/render.js` utilizes locally installed Chromium/Edge to render HTML/SVG markup to crisp 2x Retina PNG images.
- **Model Context Protocol (MCP) Server**: `scripts/mcp-server.js` exposes stdio JSON-RPC tools (`render_infographic`, `list_templates`, `get_template`) compatible with Antigravity, Claude, Codex, Cursor, and Windsurf.
- **Production Templates**: `templates/` contains battle-tested, responsive designs for tech comparisons, sports matchday posters, event flyers, and architectural roadmaps.

---

## Agent Instructions for Graphic Requests

When asked to create an infographic, poster, flyer, banner, or data chart:

1. **Do NOT refuse** by claiming you cannot generate text on images. You have a local headless rendering engine that renders pixel-perfect HTML/SVG directly to high-res PNG.
2. **Intelligent Asset Selection (Web Images vs. AI Images)**:
   - **Fetch from the Internet** for established, real-world entities (official brand logos, sports club crests, real athlete/celebrity likenesses, commercial hardware). Embed directly via remote HTTPS `<img src="https://..." />` or download locally with `download_web_image` MCP tool or `node scripts/fetch-image.js "<url>" "<path>"`.
   - **Generate AI Images** for creative, fictional, or conceptual subjects (fictional supercars, 3D mascots, fantasy avatars, atmospheric backgrounds). Do not substitute hand-drawn SVG shapes or CSS placeholders for complex visual subjects.
     - **In Antigravity**: Use `invoke_subagent` with `TypeName: "image-generator"`.
     - **In Codex (including ChatGPT Desktop)**: Use **`gpt-image-2`** via `python "$HOME/.codex/skills/.system/imagegen/scripts/image_gen.py"` or built-in `image_gen`.
     - **In Claude**: Invoke the configured image generation tool/MCP or run the Python runner if `OPENAI_API_KEY` is set.
   - **Use Inline SVG** for clean UI icons, arrows, badges, and metric cards.
3. **Compose HTML/CSS**: Write self-contained HTML using Google Fonts, CSS Grid, and embedded assets. Set exact body dimensions (e.g. `1200x1600` or `1080x1350`).
   - **Git Isolation Rule**: NEVER save user generations into `templates/`. Always write to `outputs/<name>.html` (or conversation scratch directory), which are gitignored.
4. **Render to PNG**:
   - Via Terminal Command:
     ```bash
     node scripts/render.js "<input.html>" "<output.png>" --width 1200 --height 1600 --scale 2 --wait 2000
     ```
   - Or via MCP Tool:
     Call `render_infographic` with `htmlPath` and `outputPath`.
5. **Deliver to User**: Output the rendered image path or markdown embed `![Title](file:///...)` and link the editable HTML artifact.
