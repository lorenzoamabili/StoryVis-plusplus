const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const OUT = 'C:\\dev\\StoryVis\\playwright-verify\\screenshots';
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
  page.setDefaultTimeout(20000);

  const logs = [];
  const errors = [];
  page.on('console', m => { if (m.type() !== 'log') logs.push(`[${m.type()}] ${m.text()}`); });
  page.on('pageerror', e => errors.push(e.message));

  // ── STEP 1: Load ──
  console.log('\n=== STEP 1: Load app ===');
  await page.goto('https://storyvis.netlify.app/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(OUT, '01-load.png'), fullPage: false });
  console.log('URL:', page.url());
  const elements = await page.evaluate(() => {
    const sel = ['app-menu-bar', 'app-brainvis-canvas', 'app-provenance-visualization',
                  'app-provenance-slides', 'canvas', 'mat-toolbar'];
    return sel.map(s => ({ s, n: document.querySelectorAll(s).length }));
  });
  console.log('Elements found:', JSON.stringify(elements));

  // visible buttons
  const buttons = await page.evaluate(() =>
    Array.from(document.querySelectorAll('button, [mat-button], [mat-icon-button]'))
      .map(b => b.textContent?.trim().substring(0, 40)).filter(Boolean).slice(0, 20)
  );
  console.log('Buttons:', buttons);

  // ── STEP 2: Check menu bar ──
  console.log('\n=== STEP 2: Menu bar ===');
  const menuBar = await page.$('app-menu-bar');
  if (menuBar) {
    console.log('Menu bar found');
    await page.screenshot({ path: path.join(OUT, '02-menubar.png') });
  } else {
    console.log('NO MENU BAR');
  }

  // ── STEP 3: Try keyboard shortcut ? ──
  console.log('\n=== STEP 3: Keyboard shortcuts dialog ===');
  await page.keyboard.press('?');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUT, '03-shortcuts-dialog.png') });
  const dialogOpen = await page.$('mat-dialog-container, .cdk-overlay-container mat-card');
  console.log('Dialog opened:', !!dialogOpen);
  if (dialogOpen) await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  // ── STEP 4: Explore provenance tree area ──
  console.log('\n=== STEP 4: Provenance tree ===');
  const provTree = await page.$('app-provenance-visualization');
  console.log('Prov tree found:', !!provTree);
  if (provTree) {
    const bb = await provTree.boundingBox();
    console.log('Prov tree bbox:', JSON.stringify(bb));
    // right-click to test context menu
    if (bb) {
      await page.mouse.click(bb.x + bb.width/2, bb.y + bb.height/2, { button: 'right' });
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(OUT, '04-prov-tree-context.png') });
      await page.keyboard.press('Escape');
    }
  }

  // ── STEP 5: Load medical data ──
  console.log('\n=== STEP 5: Load medical data ===');
  // Look for load data button
  const loadButtons = await page.evaluate(() =>
    Array.from(document.querySelectorAll('button, mat-icon, [mat-icon-button]'))
      .map(b => ({ text: b.textContent?.trim(), title: b.getAttribute('title'), aria: b.getAttribute('aria-label') }))
      .filter(b => b.text || b.title || b.aria)
      .slice(0, 30)
  );
  console.log('All buttons/icons:', JSON.stringify(loadButtons, null, 2));
  await page.screenshot({ path: path.join(OUT, '05-before-load.png') });

  // Try clicking any "load" or "open" related button
  const loadBtn = await page.$('[title*="load" i], [title*="open" i], [aria-label*="load" i], button[title]');
  if (loadBtn) {
    const title = await loadBtn.getAttribute('title');
    console.log('Clicking button with title:', title);
    await loadBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(OUT, '05b-after-load-click.png') });
  }

  // ── STEP 6: Brainvis canvas ──
  console.log('\n=== STEP 6: Canvas area ===');
  const canvas = await page.$('app-brainvis-canvas');
  if (canvas) {
    const bb = await canvas.boundingBox();
    console.log('Canvas bbox:', JSON.stringify(bb));
    await page.screenshot({ path: path.join(OUT, '06-canvas.png') });
    // Try clicking quadrants of canvas
    if (bb) {
      await page.mouse.click(bb.x + bb.width * 0.25, bb.y + bb.height * 0.25);
      await page.waitForTimeout(500);
      await page.mouse.wheel(0, -5); // scroll
      await page.waitForTimeout(300);
      await page.screenshot({ path: path.join(OUT, '06b-canvas-interact.png') });
    }
  } else {
    console.log('NO CANVAS COMPONENT');
  }

  // ── STEP 7: Provenance slides / story deck ──
  console.log('\n=== STEP 7: Story deck / slides ===');
  const slides = await page.$('app-provenance-slides');
  console.log('Slides component found:', !!slides);
  if (slides) {
    const bb = await slides.boundingBox();
    console.log('Slides bbox:', JSON.stringify(bb));
    await page.screenshot({ path: path.join(OUT, '07-slides.png') });
  }

  // ── STEP 8: Undo/Redo buttons ──
  console.log('\n=== STEP 8: Undo/Redo ===');
  const undoBtn = await page.$('[aria-label*="undo" i], [title*="undo" i], button:has(mat-icon)');
  console.log('Undo button:', !!undoBtn);

  // ── STEP 9: AI assistant ──
  console.log('\n=== STEP 9: AI assistant ===');
  const ai = await page.$('app-ai-assistant-panel');
  console.log('AI panel:', !!ai);

  // ── STEP 10: Bookmark panel ──
  console.log('\n=== STEP 10: Bookmark panel ===');
  const bookmark = await page.$('app-bookmark-panel');
  console.log('Bookmark panel:', !!bookmark);

  // ── STEP 11: Full page screenshot ──
  console.log('\n=== STEP 11: Final state ===');
  await page.screenshot({ path: path.join(OUT, '11-final.png'), fullPage: true });

  // ── STEP 12: Undo key ──
  console.log('\n=== STEP 12: Ctrl+Z ===');
  await page.keyboard.press('Control+z');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT, '12-after-undo.png') });

  // ── ERRORS ──
  console.log('\n=== CONSOLE ERRORS ===');
  console.log(errors.join('\n') || '(none)');
  console.log('\n=== CONSOLE LOGS (warnings/errors) ===');
  console.log(logs.slice(0, 30).join('\n') || '(none)');

  await browser.close();
  console.log('\nScreenshots saved to:', OUT);
})().catch(e => { console.error('FATAL:', e.message, e.stack); process.exit(1); });
