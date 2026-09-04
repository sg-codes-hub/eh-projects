/* Phase 2 bank loader: merges the core bank with every modular bank listed in manifest.json. */
(function () {
  const originalFetch = window.fetch.bind(window);
  const manifestPath = 'data/banks/manifest.json';

  function normalize(q, source) {
    const copy = { ...q };
    copy.type = copy.type || copy.question_type || 'MCQ';
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

  window.fetch = async function (input, init) {
    const url = typeof input === 'string' ? input : input.url;
    if (!url.endsWith('data/questions.json')) return originalFetch(input, init);

    const baseResponse = await originalFetch(input, init);
    const base = await baseResponse.json();
    let bankNames = [];

    try {
      const manifestResponse = await originalFetch(manifestPath, { cache: 'no-store' });
      if (manifestResponse.ok) {
        const manifest = await manifestResponse.json();
        bankNames = Array.isArray(manifest.banks) ? manifest.banks : [];
      }
    } catch (_) {}

    const extraResponses = await Promise.all(
      bankNames.map(name => originalFetch(`data/banks/${name}`, { cache: 'no-store' }).catch(() => null))
    );
    const extras = [];

    for (let i = 0; i < extraResponses.length; i++) {
      const response = extraResponses[i];
      if (!response || !response.ok) continue;
      try {
        const bank = await response.json();
        const items = Array.isArray(bank) ? bank : bank.questions;
        if (Array.isArray(items)) extras.push(...items.map(q => normalize(q, bankNames[i])));
      } catch (_) {}
    }

    const baseQuestions = Array.isArray(base.questions)
      ? base.questions.map(q => normalize(q, 'questions.json'))
      : [];

    const merged = {
      ...base,
      bank_version: 'Phase 2 • Core + manifest banks',
      questions: [...baseQuestions, ...extras]
    };

    return new Response(JSON.stringify(merged), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  };
})();
