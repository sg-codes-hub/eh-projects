/* English Hub 15-E question-bank loader. Loads the core bank plus every bank listed in data/banks/manifest.json. */
(function () {
  const originalFetch = window.fetch.bind(window);
  const manifestPath = 'data/banks/manifest.json';

  function normalize(q, source) {
    const copy = { ...q };
    copy.type = copy.type || copy.question_type || 'MCQ';
    copy.question_type = copy.question_type || copy.type;
    copy.module = copy.module || (
      copy.book === 'First Flight' && copy.chapter && ['Dust of Snow','Fire and Ice','A Tiger in the Zoo','How to Tell Wild Animals','The Ball Poem','Amanda','The Trees','Fog','The Tale of Custard the Dragon','For Anne Gregory'].includes(copy.chapter)
        ? 'First Flight Poetry'
        : copy.book === 'First Flight' ? 'First Flight Prose'
        : copy.book === 'Footprints Without Feet' ? 'Footprints Without Feet'
        : copy.category === 'Grammar' ? 'Grammar'
        : copy.category || 'Other'
    );
    copy.source = copy.source || source;
    return copy;
  }

  async function loadAll() {
    const baseResponse = await originalFetch('data/questions.json', { cache: 'no-store' });
    if (!baseResponse.ok) throw new Error(`Core question bank failed: ${baseResponse.status}`);
    const base = await baseResponse.json();
    const baseQuestions = Array.isArray(base.questions) ? base.questions.map(q => normalize(q, 'questions.json')) : [];

    const manifestResponse = await originalFetch(manifestPath, { cache: 'no-store' });
    if (!manifestResponse.ok) throw new Error(`Question-bank manifest failed: ${manifestResponse.status}`);
    const manifest = await manifestResponse.json();
    const bankNames = Array.isArray(manifest.banks) ? manifest.banks : [];

    const extras = [];
    const failed = [];
    for (const name of bankNames) {
      try {
        const response = await originalFetch(`data/banks/${name}`, { cache: 'no-store' });
        if (!response.ok) { failed.push(`${name} (${response.status})`); continue; }
        const bank = await response.json();
        const items = Array.isArray(bank) ? bank : bank.questions;
        if (Array.isArray(items)) extras.push(...items.map(q => normalize(q, name)));
      } catch (_) { failed.push(name); }
    }

    const seen = new Set();
    const merged = [];
    for (const q of [...baseQuestions, ...extras]) {
      const key = q.id ? `id:${q.id}` : `text:${String(q.question || q.prompt || '').trim().toLowerCase()}|marks:${q.marks}|chapter:${q.chapter || ''}`;
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(q);
    }
    window.EnglishHubBankStatus = { manifest: bankNames.length, loaded: merged.length, failed };
    return merged;
  }

  window.QuestionBankLoader = { loadAll };

  window.fetch = async function (input, init) {
    const url = typeof input === 'string' ? input : input.url;
    if (!url.endsWith('data/questions.json')) return originalFetch(input, init);
    try {
      const merged = await loadAll();
      return new Response(JSON.stringify({ course: 'Class 10 First Language English (15-E)', academic_year: '2026-27', bank_version: 'Core + all manifest banks', questions: merged }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (_) {
      return originalFetch(input, init);
    }
  };
})();
