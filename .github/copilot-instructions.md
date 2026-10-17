# GitHub Copilot / OpenAI Codex Instructions

When generating infographics, posters, or visual media in this workspace:

1. Always generate structured HTML/CSS using modern CSS Grid, Flexbox, Google Fonts, and inline SVGs instead of relying solely on diffusion image generation for text-heavy content.
2. Render HTML files to PNG using the local zero-dependency renderer:
   ```bash
   node scripts/render.js "<input.html>" "<output.png>" --width 1200 --height 1600 --scale 2 --wait 2000
   ```
3. Use templates in `templates/` as starting points when applicable.
4. Output image embeds and link to the source HTML file.
