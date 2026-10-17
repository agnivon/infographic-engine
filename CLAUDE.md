# CLAUDE.md - Infographic & Poster Engine Integration

This guide instructs Claude (Claude Code CLI, Claude Desktop, and Claude Projects) on how to autonomously create publication-quality infographics, posters, and visual media using this engine with zero external API keys.

---

## What This Engine Does
Standard text-to-image AI tools struggle with crisp text, precise data alignment, and structured tables. This engine bridges that gap by letting Claude:
1. Compose modern HTML/CSS/SVG markup with Google Fonts, CSS Grid, and vector icons.
2. Render it locally via a headless Chromium/Edge browser to 2x Retina PNG images.
3. Deliver the rendered image directly to the user.

---

## MCP Server Integration (Recommended for Claude)

The engine includes a native Model Context Protocol (MCP) server: `scripts/mcp-server.js`.

### Adding to Claude Code:
Run in your terminal:
```bash
claude mcp add infographic-engine node "<path_to_plugin>/scripts/mcp-server.js"
```

### Adding to Claude Desktop:
Add to your `claude_desktop_config.json` (`%APPDATA%\Claude\claude_desktop_config.json` on Windows or `~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):
```json
{
  "mcpServers": {
    "infographic-engine": {
      "command": "node",
      "args": ["<path_to_plugin>/scripts/mcp-server.js"]
    }
  }
}
```

### Available MCP Tools:
- **`render_infographic`**: Renders an HTML file (`htmlPath`) or raw HTML string (`htmlContent`) to PNG (`outputPath`). Accepts `width`, `height`, `scale`, and `wait`.
- **`list_templates`**: Returns list of pre-built templates (comparison, sports matchday, hackathon poster, timeline roadmap).
- **`get_template`**: Retrieves raw HTML source code of any built-in template for customization.
- **`download_web_image`**: Downloads an image from the internet (`url`) to a local path (`outputPath`) for reliable local compositing.

---

## CLI Integration (Alternative for Claude Code)

If running without MCP, Claude Code can execute the local renderer and image fetcher directly via bash/shell tool:

```bash
# Render markup to 2x Retina PNG
node scripts/render.js "<input.html>" "<output.png>" --width 1200 --height 1600 --scale 2 --wait 2000

# Download remote web image to local file
node scripts/fetch-image.js "<imageUrl>" "<outputPath>"
```

---

## 5-Step Execution Workflow for Claude

Whenever a user asks for an infographic, poster, flyer, or matchday graphic:

1. **Plan Aspect Ratio & Dimensions**:
   - Standard Vertical Poster / Comparison: `1200 x 1600` (3:4)
   - Social / Sports Matchday: `1080 x 1350` (4:5)
   - Tall Timeline / Roadmap: `1200 x 1800`
   - Square Card: `1080 x 1080`
   - Wide Banner: `1200 x 630`

2. **Intelligent Subject Imagery Selection (Web Images vs. AI Images)**:
   - **Fetch from the Internet** for real-world, authoritative entities (official brand logos, sports club crests, real athlete/celebrity likenesses, commercial hardware).
     - *Direct Remote URL*: Embed directly via `<img src="https://..." />` (Headless Chrome renders remote HTTPS URLs).
     - *Local Download*: Call MCP `download_web_image` or run `node scripts/fetch-image.js "<url>" "assets/<name>.png"`.
   - **Generate AI Images** for creative, fictional, or conceptual subjects (fictional supercars, 3D mascots, fantasy avatars, atmospheric backgrounds).
     - *If an image generation MCP tool is active* (e.g. `generate_image`, `dalle`, `flux`): Invoke that tool to create the subject PNG.
     - *If `OPENAI_API_KEY` is present in terminal*: Claude Code can run the bundled Python runner:
       ```bash
       python "$HOME/.codex/skills/.system/imagegen/scripts/image_gen.py" generate --prompt "<Detailed prompt>" --model gpt-image-2 --out "outputs/<subject>.png"
       ```
     - *If no image generator or API key is available*: Prompt the user to provide an image asset or configure an image generation key. Never draw complex photographic/artistic subjects in SVG.
   - For icons and badges, use inline SVG.

3. **Compose HTML/CSS Markup**:
   - Check `templates/` for starting patterns or write bespoke HTML5 with Google Fonts and CSS Grid.
   - **Git Isolation Rule**: Always save user-generated HTML to `outputs/<name>.html` (or conversation scratch directory). NEVER save user designs into `templates/` (which is reserved exclusively for the 5 bundled templates).
   - Embed the generated subject PNG via `<img>` or CSS `background-image`.
   - Use high-contrast color palettes, radiant gradients, and glassmorphic panels.
   - Set fixed canvas dimensions on `body` with `overflow: hidden`.

4. **Execute Headless Rendering**:
   - Call the `render_infographic` tool (via MCP) or execute:
     ```bash
     node scripts/render.js "<input.html>" "<output.png>" --width 1200 --height 1600 --scale 2 --wait 2000
     ```

5. **Present to User**:
   - Deliver the rendered PNG directly in chat: `![Title](file:///path/to/output.png)`.
   - Provide a clickable link to the source HTML markup: `[View / Edit Source HTML](file:///path/to/input.html)`.
   - Include a concise summary of the key data points or design choices.
