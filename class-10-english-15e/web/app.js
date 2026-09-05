(() => {
  const STORAGE_KEY = 'eh15e.dashboard';
  const state = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"practiceSessions":0,"mockTests":0,"areas":[]}');
  state.practiceSessions = Number(state.practiceSessions) || 0;
  state.mockTests = Number(state.mockTests) || 0;
  state.areas = Array.isArray(state.areas) ? state.areas : [];

  const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  const updateStats = () => {
    const practice = document.getElementById('practice-count');
    const areas = document.getElementById('area-count');
    const mocks = document.getElementById('mock-count');
    if (practice) practice.textContent = state.practiceSessions;
    if (areas) areas.textContent = state.areas.length;
    if (mocks) mocks.textContent = state.mockTests;
  };

  document.querySelectorAll('[data-area]').forEach(card => {
    card.addEventListener('click', () => {
      const area = card.dataset.area;
      if (area && !state.areas.includes(area)) {
        state.areas.push(area);
        state.practiceSessions += 1;
        save();
        updateStats();
      }
    });
  });

  const continueButton = document.querySelector('.hero .cta');
  if (continueButton) {
    continueButton.addEventListener('click', () => {
      state.practiceSessions += 1;
      save();
      updateStats();
    });
  }

  const quickButton = document.querySelector('.challenge-strip .cta');
  if (quickButton) {
    quickButton.addEventListener('click', () => {
      state.practiceSessions += 1;
      save();
      updateStats();
    });
  }

  const mockButton = document.getElementById('mock-start');
  if (mockButton) {
    mockButton.addEventListener('click', () => {
      state.mockTests += 1;
      save();
      updateStats();
    });
  }

  updateStats();
})();