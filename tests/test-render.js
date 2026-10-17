/**
 * Infographic & Poster Engine - Automated Test Suite
 * 
 * Verifies browser detection, CLI argument handling, and rendering of all built-in templates.
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const renderScript = path.join(rootDir, 'scripts', 'render.js');
const outDir = path.join(rootDir, 'test_output');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const tests = [
  {
    name: 'Comparison Infographic (PostgreSQL vs MongoDB)',
    template: path.join(rootDir, 'templates', 'comparison-infographic.html'),
    output: path.join(outDir, 'test-comparison.png'),
    width: 1200,
    height: 1600,
    scale: 2,
    wait: 2500
  },
  {
    name: 'Sports Matchday Poster (Arsenal vs Chelsea)',
    template: path.join(rootDir, 'templates', 'sports-matchday-poster.html'),
    output: path.join(outDir, 'test-sports-matchday.png'),
    width: 1080,
    height: 1350,
    scale: 2,
    wait: 2000
  },
  {
    name: 'Event / Hackathon Poster',
    template: path.join(rootDir, 'templates', 'event-hackathon-poster.html'),
    output: path.join(outDir, 'test-hackathon-poster.png'),
    width: 1200,
    height: 1600,
    scale: 2,
    wait: 2000
  },
  {
    name: 'Timeline & Milestone Roadmap',
    template: path.join(rootDir, 'templates', 'timeline-roadmap.html'),
    output: path.join(outDir, 'test-timeline.png'),
    width: 1200,
    height: 1800,
    scale: 2,
    wait: 2000
  }
];

console.log('========================================================');
console.log('  Infographic & Poster Engine - Automated Test Suite    ');
console.log('========================================================\n');

// Step 1: Check browser
console.log('Test 1: Probing local browser engine...');
const checkRes = spawnSync('node', [renderScript, '--check-browser'], { encoding: 'utf8' });
if (checkRes.status !== 0) {
  console.error('[FAIL] Browser check failed!');
  console.error(checkRes.stderr || checkRes.stdout);
  process.exit(1);
}
console.log('  ' + checkRes.stdout.trim());
console.log('  [PASS] Browser detection verified.\n');

// Step 2: Render each template
let failed = 0;
for (let i = 0; i < tests.length; i++) {
  const t = tests[i];
  console.log(`Test ${i + 2}: Rendering ${t.name}...`);
  console.log(`  Template: ${path.basename(t.template)}`);

  // Remove old output if exists
  if (fs.existsSync(t.output)) {
    fs.unlinkSync(t.output);
  }

  const args = [
    renderScript,
    t.template,
    t.output,
    '--width', String(t.width),
    '--height', String(t.height),
    '--scale', String(t.scale),
    '--wait', String(t.wait)
  ];

  const startTime = Date.now();
  const res = spawnSync('node', args, { encoding: 'utf8' });
  const duration = Date.now() - startTime;

  if (res.status !== 0 || !fs.existsSync(t.output)) {
    console.error(`  [FAIL] Rendering failed for ${t.name}`);
    console.error(res.stderr || res.stdout);
    failed++;
  } else {
    const stats = fs.statSync(t.output);
    const sizeKB = (stats.size / 1024).toFixed(1);
    if (stats.size < 50000) {
      console.warn(`  [WARN] Output size unusually small: ${sizeKB} KB`);
    }
    console.log(`  [PASS] Rendered ${sizeKB} KB PNG in ${duration}ms -> ${path.basename(t.output)}\n`);
  }
}

console.log('========================================================');
if (failed === 0) {
  console.log(`  ALL ${tests.length + 1} TESTS PASSED SUCCESSFULLY! 🚀`);
  console.log('========================================================\n');
  process.exit(0);
} else {
  console.error(`  ${failed} TESTS FAILED.`);
  console.log('========================================================\n');
  process.exit(1);
}
