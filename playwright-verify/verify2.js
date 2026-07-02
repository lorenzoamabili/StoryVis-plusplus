const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const OUT = 'C:\\dev\\StoryVis\\playwright-verify\\screenshots';
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
  page.setDefaultTimeout(15000);

  const errors = [];
  const warnLogs = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') warnLogs.push(`[${m.type()}] ${m.text()}`); });

  await page.goto('https://storyvis.netlify.app/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(4000); // let WebGL load data
  await page.screenshot({ path: path.join(OUT, 'A1-loaded.png') });
  console.log('=== App loaded ===');

  // ── HISTORY panel (right sidebar) ──
  console.log('\n=== HISTORY tab click ===');
  // The sidebar tabs are on x:1600, find the HISTORY button
  const historyBtn = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button, [role="tab"], .sidebar-tab, span'));
    const h = btns.find(b => b.textContent?.includes('HISTORY') || b.textContent?.includes('history'));
    if (h) return { tag: h.tagName, text: h.textContent?.trim(), rect: h.getBoundingClientRect() };
    return null;
  });
  console.log('History btn:', JSON.stringify(historyBtn));

  // Try clicking the HISTORY text on the right
  await page.mouse.click(1431, 70); // approximate position from screenshot
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUT, 'A2-history-click.png') });

  const provBbox = await page.evaluate(() => {
    const el = document.querySelector('app-provenance-visualization');
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height };
  });
  console.log('Prov tree bbox after click:', JSON.stringify(provBbox));

  // ── SVG state of provenance tree ──
  const svgInfo = await page.evaluate(() => {
    const svg = document.querySelector('app-provenance-visualization svg');
    if (!svg) return 'no svg';
    const rects = Array.from(svg.querySelectorAll('rect')).slice(0, 5)
      .map(r => ({ x: r.getAttribute('x'), y: r.getAttribute('y'), w: r.getAttribute('width'), h: r.getAttribute('height') }));
    return { svgWH: `${svg.getAttribute('width')}x${svg.getAttribute('height')}`, rects };
  });
  console.log('SVG info:', JSON.stringify(svgInfo));

  // ── Story Deck ──
  console.log('\n=== Story Deck ===');
  // The "Story Deck" button is visible at bottom center
  const storyDeckBtn = await page.$('text=Story Deck');
  console.log('Story Deck button found:', !!storyDeckBtn);
  if (storyDeckBtn) {
    await storyDeckBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(OUT, 'B1-story-deck-open.png'), fullPage: true });
    const slidesBbox = await page.evaluate(() => {
      const el = document.querySelector('app-provenance-slides');
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, w: r.width, h: r.height };
    });
    console.log('Slides bbox after open:', JSON.stringify(slidesBbox));
  }

  // ── Alt+Click to add frame to story deck ──
  console.log('\n=== Alt+Click canvas to add frame ===');
  const canvasBbox = await page.evaluate(() => {
    const el = document.querySelector('app-brainvis-canvas');
    const r = el?.getBoundingClientRect();
    return r ? { x: r.x, y: r.y, w: r.width, h: r.height } : null;
  });
  console.log('Canvas bbox:', JSON.stringify(canvasBbox));
  if (canvasBbox) {
    await page.mouse.click(canvasBbox.x + 200, canvasBbox.y + 200, { modifiers: ['Alt'] });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(OUT, 'B2-after-alt-click.png'), fullPage: true });
    console.log('Alt+clicked canvas at', canvasBbox.x + 200, canvasBbox.y + 200);

    // Try again
    await page.mouse.click(canvasBbox.x + 200, canvasBbox.y + 200, { modifiers: ['Alt'] });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(OUT, 'B3-second-frame.png'), fullPage: true });
  }

  // ── Save story ──
  console.log('\n=== Save story ===');
  const saveBtn = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const s = btns.find(b => b.textContent?.trim() === 'save');
    if (s) { const r = s.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, text: s.textContent?.trim() }; }
    return null;
  });
  console.log('Save btn:', JSON.stringify(saveBtn));

  // ── Scroll on a canvas panel ──
  console.log('\n=== Scroll slices ===');
  if (canvasBbox) {
    // hover top-left panel (axial)
    await page.mouse.move(canvasBbox.x + 200, canvasBbox.y + 200);
    await page.waitForTimeout(200);
    for (let i = 0; i < 5; i++) {
      await page.mouse.wheel(0, -100); // scroll up
      await page.waitForTimeout(100);
    }
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(OUT, 'C1-after-scroll.png') });
    console.log('Scrolled slices');
  }

  // ── Bookmarks ──
  console.log('\n=== Bookmark (B key) ===');
  await page.keyboard.press('b');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT, 'D1-bookmark.png') });

  // ── MARKS panel ──
  console.log('\n=== MARKS panel ===');
  await page.mouse.click(1431, 115); // MARKS tab
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUT, 'D2-marks-panel.png') });

  // ── AI panel ──
  console.log('\n=== AI panel ===');
  await page.mouse.click(1431, 205); // AI tab
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUT, 'E1-ai-panel.png') });

  // ── Dataset dropdown ──
  console.log('\n=== Dataset dropdown ===');
  const datasetSel = await page.$('select, mat-select');
  if (datasetSel) {
    const val = await datasetSel.evaluate(el => el.textContent || el.value);
    console.log('Dataset selector value:', val?.trim());
    await datasetSel.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(OUT, 'F1-dataset-dropdown.png') });
    await page.keyboard.press('Escape');
  } else {
    console.log('No select/mat-select found');
    // find by position
    const dsInfo = await page.evaluate(() => {
      const el = document.querySelector('.mat-select, [class*="dataset"]');
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, text: el.textContent?.trim() };
    });
    console.log('Dataset element:', JSON.stringify(dsInfo));
  }

  // ── W/L sliders ──
  console.log('\n=== W/L range inputs ===');
  const ranges = await page.evaluate(() =>
    Array.from(document.querySelectorAll('input[type=range]'))
      .map(r => ({ id: r.id, min: r.min, max: r.max, value: r.value, name: r.name }))
  );
  console.log('Range inputs:', JSON.stringify(ranges));

  // ── Final screenshot ──
  await page.screenshot({ path: path.join(OUT, 'Z-final.png'), fullPage: true });

  // ── Report errors ──
  console.log('\n=== PAGE ERRORS ===');
  console.log(errors.join('\n') || '(none)');
  console.log('\n=== CONSOLE ERRORS/WARNINGS (unique) ===');
  const unique = [...new Set(warnLogs)];
  console.log(unique.slice(0, 20).join('\n') || '(none)');

  await browser.close();
})().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
