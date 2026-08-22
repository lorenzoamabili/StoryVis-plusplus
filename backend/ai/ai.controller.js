const express = require('express');
const router = express.Router();
const { Ollama } = require('ollama');

// Default to localhost; override with OLLAMA_HOST env var for remote setups
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';

// Model to use — override with OLLAMA_MODEL env var.
// 'llama3.2' is a good default (lightweight, capable, free).
// Other good options: 'mistral', 'llama3.1', 'phi3'
const MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

const SYSTEM_PROMPT = `You are an AI assistant embedded in StoryVis, a medical imaging analysis and visual-reporting tool for medical students.

The student has been exploring volumetric CT/MRI data using a viewer that records their full exploration history as a provenance graph. You will receive structured context about their session including:
- bookmarks: key states they flagged with labels (regular bookmarks and named analysis phases)
- reflections: typed notes they wrote during exploration (observations, questions, hypotheses, uncertainties)
- coverage: % of each anatomical orientation (axial / coronal / sagittal) they scrolled through
- frames: metadata for any imaging frames captured in the Data-Comics visual report editor
- slides: story deck slides they created from provenance states
- provenancePath: the sequence of actions they performed

Your role is to help them:
1. ANALYSE their exploration — summarise what they examined, identify blind spots or low-coverage orientations, highlight patterns in their reflections
2. GENERATE REPORT content — write captions for captured imaging frames, structured summaries, clinical narrative paragraphs
3. SUGGEST STORY content — propose concise titles and annotations for provenance slides
4. GUIDE their next steps — suggest which anatomical region to revisit, which finding to clarify

Rules:
- Be concise and clinically relevant; use language appropriate for medical students
- Never invent findings not present in the user's own reflections/bookmarks
- When generating captions, format each as "Frame N – [panel] – [brief clinical description]"
- When writing report summaries, use structured headings (Findings, Impression, Recommendation)
- If context is sparse (no bookmarks or reflections), acknowledge this and ask the student to add notes before generating a full report`;

// POST /ai/chat
router.post('/chat', async (req, res) => {
  try {
    const { messages, context } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array is required' });
    }
    if (messages.length > 50) {
      return res.status(400).json({ error: 'Too many messages (max 50)' });
    }
    const contextSize = JSON.stringify(context || {}).length;
    if (contextSize > 100_000) {
      return res.status(400).json({ error: 'Context payload too large (max 100 KB)' });
    }

    // Prepend session context to the first user message
    let contextBlock = '';
    if (context && Object.keys(context).length > 0) {
      contextBlock = buildContextBlock(context) + '\n\n---\n\n';
    }

    const augmented = messages.map((m, i) =>
      i === 0 ? { ...m, content: contextBlock + m.content } : m
    );

    // A fresh client per request so an abort() on timeout only cancels this
    // request's own in-flight call, not other concurrent users' chats.
    const client = new Ollama({ host: OLLAMA_HOST });

    const chatPromise = (async () => {
      const stream = await client.chat({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...augmented,
        ],
        stream: true,
        options: {
          temperature: 0.7,
          num_predict: 1024,
        },
      });
      let content = '';
      for await (const part of stream) {
        content += part.message.content;
      }
      return content;
    })();

    let timeoutHandle;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutHandle = setTimeout(() => {
        client.abort();
        reject(new Error('Ollama request timed out'));
      }, 60_000);
    });

    let content;
    try {
      content = await Promise.race([chatPromise, timeoutPromise]);
    } finally {
      clearTimeout(timeoutHandle);
    }

    res.json({ content });
  } catch (err) {
    console.error('[AI] chat error:', err.message);

    // Friendly error if Ollama is not running
    const isConnRefused = err.message && (
      err.message.includes('ECONNREFUSED') ||
      err.message.includes('fetch failed')
    );
    if (isConnRefused) {
      return res.status(503).json({
        error: 'Ollama is not running',
        detail: `Start Ollama and pull a model: ollama pull ${MODEL}`,
      });
    }

    res.status(500).json({ error: 'AI service error', detail: err.message });
  }
});

/** Convert the structured context object into a readable plain-text block. */
function buildContextBlock(ctx) {
  const lines = ['## Session Context'];

  if (ctx.coverage) {
    lines.push('\n### Volume Coverage');
    lines.push(`- Axial:    ${ctx.coverage.axial ?? '?'}% (${ctx.coverage.axialCount ?? '?'} / ${ctx.coverage.axialMax ?? '?'} slices)`);
    lines.push(`- Coronal:  ${ctx.coverage.coronal ?? '?'}%`);
    lines.push(`- Sagittal: ${ctx.coverage.sagittal ?? '?'}%`);
  }

  if (ctx.phases && ctx.phases.length > 0) {
    lines.push('\n### Analysis Phases');
    ctx.phases.forEach((p, i) => lines.push(`  ${i + 1}. ${p.label}  (at ${p.time})`));
  }

  if (ctx.bookmarks && ctx.bookmarks.length > 0) {
    lines.push('\n### Bookmarks');
    ctx.bookmarks.forEach(b => lines.push(`  • [BM] ${b.label}  (${b.time})`));
  }

  if (ctx.reflections && ctx.reflections.length > 0) {
    lines.push('\n### Reflections');
    ctx.reflections.forEach(r => lines.push(`  • [${r.type.toUpperCase()}] ${r.text}  (${r.time})`));
  }

  if (ctx.frames && ctx.frames.length > 0) {
    lines.push('\n### Captured Data-Comics Frames');
    ctx.frames.forEach((f, i) => lines.push(`  Frame ${i + 1}: ${f.panel} view · slice ${f.slice} · W/L ${f.wl}`));
  }

  if (ctx.slides && ctx.slides.length > 0) {
    lines.push('\n### Story Deck Slides');
    ctx.slides.forEach((s, i) => lines.push(`  Slide ${i + 1}: "${s.title}"${s.annotation ? ' — ' + s.annotation : ''}`));
  }

  if (ctx.provenancePath && ctx.provenancePath.length > 0) {
    lines.push('\n### Provenance Path (most recent 20 actions)');
    ctx.provenancePath.slice(-20).forEach((a, i) => lines.push(`  ${i + 1}. ${a}`));
  }

  return lines.join('\n');
}

module.exports = router;
