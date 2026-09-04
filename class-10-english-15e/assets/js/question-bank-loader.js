/* Phase 2 bank loader: merges the core bank with expandable chapter batches. */
(function () {
  const originalFetch = window.fetch.bind(window);
  const extraBanks = [
    'data/banks/first-flight-prose-batch-01.json'
  ];
  window.fetch = async function (input, init) {
    const url = typeof input === 'string' ? input : input.url;
    if (!url.endsWith('data/questions.json')) return originalFetch(input, init);
    const [baseResponse, ...extraResponses] = await Promise.all([
      originalFetch(input, init),
      ...extraBanks.map(path => originalFetch(path, { cache: 'no-store' }))
    ]);
    const base = await baseResponse.json();
    const extras = [];
    for (const response of extraResponses) {
      if (!response.ok) continue;
      const bank = await response.json();
      if (Array.isArray(bank.questions)) extras.push(...bank.questions);
    }
    const merged = {
      ...base,
      bank_version: 'Phase 2 • Core + chapter batches',
      questions: [...(Array.isArray(base.questions) ? base.questions : []), ...extras]
    };
    return new Response(JSON.stringify(merged), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  };
})();
