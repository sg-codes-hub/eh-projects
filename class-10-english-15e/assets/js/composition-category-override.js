/* Fix category routing for Composition cards.
   Some legacy composition banks use `topic` (Essay / Letter Writing)
   instead of `chapter`, which previously made an empty chapter match every
   composition question. This override keeps the existing syllabus and
   blueprint intact while routing each item to its correct category. */
(function(){
  const originalOpenSection = window.openSection;
  if (typeof originalOpenSection !== 'function') return;
  window.openSection = function(id){
    const s = syllabus && syllabus.sections ? syllabus.sections.find(x=>x.id===id) : null;
    if (!s) return originalOpenSection(id);
    if (s.id !== 'composition') return originalOpenSection(id);
    $('syllabusEyebrow').textContent = `${s.module} • ${s.group}`;
    $('syllabusTitle').textContent = s.title;
    $('syllabusIntro').innerHTML = `<div class="syllabus-banner"><strong>2026–27 exam preparation</strong><span>${s.chapters.length} units • The full loaded question treasure is available for practice.</span></div>`;
    $('chapterGrid').innerHTML = s.chapters.map((c,i)=>{
      const wanted = String(c.name||'').trim().toLowerCase();
      const n = qs.filter(q=>{
        if (String(q.module||'').trim().toLowerCase() !== String(s.module||'').trim().toLowerCase()) return false;
        const chapter = String(q.chapter||'').trim().toLowerCase();
        const topic = String(q.topic||'').trim().toLowerCase();
        const category = String(q.category||'').trim().toLowerCase();
        if (wanted === 'essay writing') return chapter === 'essay writing' || topic === 'essay' || topic === 'essay writing' || category === 'essay';
        if (wanted === 'letter writing') return chapter === 'letter writing' || topic === 'letter writing' || topic === 'letter' || category === 'letter writing' || category === 'letter';
        return chapter === wanted;
      }).length;
      return `<article class="chapter-card"><div class="chapter-number">${String(i+1).padStart(2,'0')}</div><div class="chapter-main"><h3>${esc(c.name)}</h3><div class="chapter-meta"><span>${esc(c.weight||'')}</span><span>${esc(c.priority||'')}</span><span>${n} questions</span></div><p>${n?'Practice questions, answers and model answers are available.':'No questions loaded for this unit yet.'}</p></div><button class="chapter-btn" data-c="${esc(c.name)}" data-m="${esc(s.module)}" ${n?'':'disabled'}>${n?'Practice':'Unavailable'}</button></article>`;
    }).join('');
    document.querySelectorAll('.chapter-btn:not([disabled])').forEach(b=>b.onclick=()=>start('chapter',{module:b.dataset.m,chapter:b.dataset.c,title:b.dataset.c}));
    view('syllabus');
  };
})();