/* English Hub 15-E production question-bank loader. */
(function () {
  const originalFetch = window.fetch.bind(window);
  const MERGED_PATH = 'data/questions-merged.json';
  const manifestPath = 'data/banks/manifest.json';
  const qualityOverridePaths = ['data/model-answer-quality-overrides.json','data/model-answer-quality-overrides-lit-01.json','data/model-answer-quality-overrides-lit-02.json','data/model-answer-quality-overrides-lit-03.json','data/model-answer-quality-overrides-lit-04.json','data/model-answer-quality-overrides-lit-05.json','data/model-answer-quality-overrides-lit-06.json','data/model-answer-quality-overrides-lit-07.json','data/model-answer-quality-overrides-lit-08.json','data/model-answer-quality-overrides-letter-01.json'];
  const poetryChapters = new Set(['Dust of Snow','Fire and Ice','A Tiger in the Zoo','How to Tell Wild Animals','The Ball Poem','Amanda','The Trees','Fog','The Tale of Custard the Dragon','For Anne Gregory']);
  const FETCH_OPTIONS = { cache: 'default' };
  function normalize(q, source) {
    const copy = { ...q };
    copy.type = String(copy.type || copy.question_type || 'MCQ').trim();
    copy.question_type = String(copy.question_type || copy.type).trim();
    copy.module = String(copy.module || (copy.book === 'First Flight' && copy.chapter && poetryChapters.has(copy.chapter) ? 'First Flight Poetry' : copy.book === 'First Flight' ? 'First Flight Prose' : copy.book === 'Footprints Without Feet' ? 'Footprints Without Feet' : copy.category === 'Grammar' ? 'Grammar' : copy.category || 'Other')).trim();
    copy.chapter = copy.chapter == null ? '' : String(copy.chapter).trim();
    copy.marks = Number(copy.marks);
    copy.source = copy.source || source;
    return copy;
  }
  function publish(questions, meta) { window.EnglishHubQuestions = questions; window.qs = questions; window.EnglishHubBankStatus = meta; return questions; }
  async function loadMerged() {
    const response = await originalFetch(MERGED_PATH, FETCH_OPTIONS);
    if (!response.ok) throw new Error(`Merged question bank failed: ${response.status}`);
    const data = await response.json();
    const questions = Array.isArray(data.questions) ? data.questions.map(q => normalize(q, 'questions-merged.json')) : [];
    if (!questions.length) throw new Error('Merged question bank is empty.');
    return publish(questions, { source: 'merged', manifest: 25, loaded: questions.length, failed: [] });
  }
  async function loadLegacy() {
    const baseResponse = await originalFetch('data/questions.json', FETCH_OPTIONS);
    if (!baseResponse.ok) throw new Error(`Core question bank failed: ${baseResponse.status}`);
    const base = await baseResponse.json();
    const baseQuestions = Array.isArray(base.questions) ? base.questions.map(q => normalize(q, 'questions.json')) : [];
    const manifestResponse = await originalFetch(manifestPath, FETCH_OPTIONS);
    if (!manifestResponse.ok) throw new Error(`Question-bank manifest failed: ${manifestResponse.status}`);
    const manifest = await manifestResponse.json();
    const bankNames = Array.isArray(manifest.banks) ? manifest.banks : [];
    const bankResults = await Promise.all(bankNames.map(async name => {
      try {
        const response = await originalFetch(`data/banks/${name}`, FETCH_OPTIONS);
        if (!response.ok) return { name, items: [], failed: `${name} (${response.status})` };
        const bank = await response.json(); const items = Array.isArray(bank) ? bank : bank.questions;
        return { name, items: Array.isArray(items) ? items.map(q => normalize(q, name)) : [], failed: null };
      } catch (_) { return { name, items: [], failed: name }; }
    }));
    const extras = [], failed = [];
    for (const result of bankResults) { if (result.failed) failed.push(result.failed); extras.push(...result.items); }
    const seen = new Set(), merged = [];
    for (const q of [...baseQuestions, ...extras]) { const key = q.id ? `id:${q.id}` : `text:${String(q.question || q.prompt || '').trim().toLowerCase()}|marks:${q.marks}|chapter:${q.chapter || ''}`; if (seen.has(key)) continue; seen.add(key); merged.push(q); }
    const overrideResults = await Promise.all(qualityOverridePaths.map(async path => { try { const response = await originalFetch(path, FETCH_OPTIONS); if (!response.ok) return {}; const data = await response.json(); return data && data.overrides && typeof data.overrides === 'object' ? data.overrides : {}; } catch (_) { return {}; } }));
    for (const overrides of overrideResults) for (const q of merged) { const o = overrides[q.id]; if (!o) continue; if (typeof o.model_answer === 'string' && o.model_answer.trim()) q.model_answer = o.model_answer.trim(); if (typeof o.answer === 'string' && o.answer.trim()) q.answer = o.answer.trim(); if (Array.isArray(o.answer_points)) q.answer_points = o.answer_points.slice(); if (typeof o.letter_type === 'string' && o.letter_type.trim()) q.letter_type = o.letter_type.trim(); if (typeof o.skill === 'string' && o.skill.trim()) q.skill = o.skill.trim(); if (typeof o.topic === 'string' && o.topic.trim()) q.topic = o.topic.trim(); if (typeof o.question_type === 'string' && o.question_type.trim()) q.question_type = o.question_type.trim(); }
    return publish(merged, { source: 'legacy-fallback', manifest: bankNames.length, loaded: merged.length, failed });
  }
  let readyPromise;
  async function loadAll() { if (Array.isArray(window.EnglishHubQuestions) && window.EnglishHubQuestions.length) return window.EnglishHubQuestions; if (readyPromise) return readyPromise; readyPromise = loadMerged().catch(() => loadLegacy()); try { return await readyPromise; } catch (e) { readyPromise = null; throw e; } }
  window.QuestionBankLoader = { loadAll };
  window.QuestionBankReady = loadAll();
  window.fetch = async function (input, init) { const url = typeof input === 'string' ? input : input.url; if (!url.endsWith('data/questions.json')) return originalFetch(input, init); try { const merged = await loadAll(); return new Response(JSON.stringify({ course: 'Class 10 First Language English (15-E)', academic_year: '2026-27', bank_version: 'Merged production bank', questions: merged }), { status: 200, headers: { 'Content-Type': 'application/json' } }); } catch (_) { return originalFetch(input, init); } };
})();
