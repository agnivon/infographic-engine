---
name: infographic-engine
description: >-
  Create publication-quality infographics, posters, sports matchday graphics, and rich visual media
  using structured HTML/CSS/SVG markup and AI imagery, rendered locally with zero API keys.
  Use this skill whenever the user asks to generate, design, or create infographics, posters, flyers,
  event graphics, matchday announcements, visual comparisons, architecture diagrams, or stat cards.
---

# Infographic & Poster Engine

The Infographic & Poster Engine empowers AI assistants (Antigravity, Codex, Claude) to generate high-resolution, publication-grade graphic media by combining structured markup with local headless Chromium rendering and AI image assets.

## Core Capabilities
- **Pixel-Perfect Typography**: Crisp, unblurred text using Google Fonts and modern CSS.
- **Structured Data Layouts**: Multi-column comparison tables, metric grids, timeline spines, badges, and progress counters.
- **AI Image Compositing**: Embeds AI-generated photorealistic subjects, 3D assets, athlete cutouts, or cinematic backdrops into HTML before rendering.
- **Retina Output**: Renders at 2x DPI (2.2 MB - 2.9 MB crisp graphic) with zero third-party screenshot SaaS dependencies.

---

## Workflow Runbook

### 1. Identify Format and Dimensions
Determine the graphic category:
- **Comparison / Breakdown Infographic**: `1200 x 1600` (default) or `1200 x 1800`
- **Sports Matchday / Fixture Poster**: `1080 x 1350` (4:5 social/print)
- **Event / Hackathon / Movie Poster**: `1200 x 1600`
- **Timeline / Strategic Roadmap**: `1200 x 1800`
- **Social Card / Square Post**: `1080 x 1080`
- **Wide Banner / Header**: `1200 x 630`

### 2. Prepare Visual Assets: Intelligent Selection (Web Images vs. AI Images vs. SVG)
The agent must **intelligently decide** whether to fetch an image from the internet, generate an AI image, or use inline SVG:

#### A. When to Fetch Images from the Internet
Use web images whenever the subject represents an **established, real-world entity** where exact factual likeness and brand fidelity are essential:
- **Official Brand Logos & Emblems**: PostgreSQL, MongoDB, Docker, Apple, Google, AWS, GitHub.
- **Official Sports Crests & League Badges**: Arsenal FC, Chelsea FC, Premier League, NBA, FIFA, UEFA.
- **Real Athletes & Public Figures**: Exact photographic portraits (e.g. Bukayo Saka, Lionel Messi).
- **Commercial Products & Screenshots**: iPhone 16 Pro, PlayStation 5, VS Code interface, specific hardware.
- **Reference Historical / Scientific Imagery**: Wikipedia / Wikimedia Commons assets.

**How to Integrate Web Images**:
1. **Direct Remote URL (Instant)**: Embed the HTTPS image URL directly in HTML:
   `<img src="https://upload.wikimedia.org/.../logo.png" class="brand-logo" alt="Logo" />`
   *(Headless Chrome automatically fetches and renders remote images during snapshotting).*
2. **Local Download (Recommended for Resilience)**: Download the asset to `assets/` first:
   - Via MCP: Call `download_web_image({ url: "https://...", outputPath: "assets/logo.png" })`
   - Via CLI: `node scripts/fetch-image.js "<url>" "assets/logo.png"`
   - Then embed via `<img src="assets/logo.png" />` or `file:///...`.

#### B. When to Generate AI Images (Compulsory for Creative Subjects)
Generate an AI image whenever the subject is **fictional, conceptual, futuristic, or artistic**:
- **Fictional & Sci-Fi Subjects**: Retro 80s synthwave sports cars, cyberpunk cyber-hackers, spaceships.
- **3D Mascots & Characters**: Custom stylized characters, fantasy creatures, dynamic avatars.
- **Cinematic & Atmospheric Backdrops**: Moody lighting plates, futuristic neon cityscapes, abstract 3D ribbons.
- **Novel / Mashup Visuals**: Conceptual visual metaphors where no real-world photograph exists.
- *Strict Rule*: Do NOT substitute hand-drawn SVG shapes or CSS approximations for these complex subjects.

**Execution by Assistant**:
- **Google Antigravity**: Call `invoke_subagent` with `TypeName: "image-generator"`.
- **OpenAI Codex / ChatGPT Desktop**: Call built-in `image_gen` or run:
  ```bash
  python "$HOME/.codex/skills/.system/imagegen/scripts/image_gen.py" generate --prompt "<Detailed prompt>" --model gpt-image-2 --out "outputs/<subject>.png"
  ```
- **Anthropic Claude**: Invoke active image MCP tool (`generate_image`, `dalle`, `flux`) or run the terminal Python runner with `OPENAI_API_KEY`.

#### C. When to Use Inline SVG & CSS
Use inline `<svg>` and CSS for:
- Navigation icons, checkmarks, warning badges, arrows, and stat counters (Lucide / Feather style).
- Timeline spines, grid borders, metric card glassmorphic panels, and gradient backgrounds.

### 3. Compose the Markup
Use one of the 5 official production templates as reference or compose custom markup:
- `templates/comparison-infographic.html`: Two-column architecture/product comparison (`1200 x 1600`)
- `templates/sports-matchday-poster.html`: Derby/championship sports matchday poster (`1080 x 1350`)
- `templates/event-hackathon-poster.html`: Cyberpunk tech summit & hackathon flyer (`1200 x 1600`)
- `templates/timeline-roadmap.html`: Multi-phase strategic architecture roadmap (`1200 x 1800`)
- `templates/neon-velocity.html`: Retro 80s synthwave movie poster with AI hero asset (`1200 x 1600`)

**Strict Output Location Rule (Git Isolation)**:
- **NEVER save new user designs or generations into `templates/`**. The `templates/` directory is strictly reserved for the 5 official bundled baseline templates.
- **Always save user-generated files into `outputs/`** (e.g. `outputs/<name>.html`, `outputs/<name>.png`) or the active conversation scratch directory (`<appDataDir>/brain/<conversation-id>/scratch/`).
- The `outputs/` directory is completely gitignored, ensuring user designs and image assets are never tracked or pushed into the repository.

**Essential Markup Rules**:
- Lock body dimensions: `body { width: 1200px; height: 1600px; overflow: hidden; }`
- Always import web fonts in `<head>` (e.g., `Plus Jakarta Sans`, `Space Grotesk`, `Montserrat`, `JetBrains Mono`, `Bebas Neue`).
- Use vibrant gradients, glassmorphism (`backdrop-filter: blur(16px)`), subtle borders (`rgba(255,255,255,0.1)`), and glowing drop shadows.

### 4. Execute Local Headless Rendering
Run the plugin's bundled renderer script:
```bash
node scripts/render.js "<path_to_input.html>" "<path_to_output.png>" --width 1200 --height 1600 --scale 2 --wait 2000
```
Or call the MCP tool `render_infographic` with `htmlPath` and `outputPath`.

Flags:
- `--scale 2`: Renders at 2x Retina resolution for razor-sharp typography.
- `--wait 2000`: Allows Google Fonts and images 2 seconds to load before capturing.

### 5. Present to the User
Always include the rendered image directly in chat:
```markdown
![Infographic Title](file:///path/to/output.png)

[View / Edit Source HTML](file:///path/to/input.html)
```
Provide a clear, brief explanation of the key insights and design choices.
