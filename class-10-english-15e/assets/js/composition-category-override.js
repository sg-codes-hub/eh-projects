/* Composition category routing fix.
   Essay and Letter Writing records use topic/skill/category fields rather
   than a chapter field. Keep these two practice areas strictly separated. */
(function(){
  const norm=v=>String(v??'').trim().toLowerCase();
  const compositionType=q=>{
    const fields=[q?.topic,q?.skill,q?.category,q?.type,q?.question_type,q?.question,q?.prompt].map(norm).join(' ');
    if(/\bessay\b/.test(fields)) return 'essay';
    if(/\binformal\s+letter\b|\bformal\s+letter\b|\bletter\s+writing\b|\bwrite\s+a\s+letter\b/.test(fields)) return 'letter';
    return '';
  };
  const isComposition=q=>norm(q?.module)==='composition' || norm(q?.category)==='composition';
  const isChapterType=(q,c)=>{
    if(!isComposition(q)) return false;
    const wanted=norm(c?.name);
    if(wanted==='essay writing') return compositionType(q)==='essay';
    if(wanted==='letter writing') return compositionType(q)==='letter';
    return false;
  };
  const oldChapterMatch=window.chapterMatch;
  window.chapterMatch=function(q,c,s){
    if(s && norm(s.id)==='composition') return isChapterType(q,c);
    return typeof oldChapterMatch==='function' ? oldChapterMatch(q,c,s) : false;
  };
  const oldOpenSection=window.openSection;
  if(typeof oldOpenSection!=='function') return;
  window.openSection=function(id){
    if(id!=='composition') return oldOpenSection(id);
    const s=window.syllabus?.sections?.find(x=>x.id===id);
    if(!s) return oldOpenSection(id);
    $('syllabusEyebrow').textContent=`${s.module} • ${s.group}`;
    $('syllabusTitle').textContent=s.title;
    $('syllabusIntro').innerHTML=`<div class="syllabus-banner"><strong>2026–27 exam preparation</strong><span>${s.chapters.length} units • Essay and letter practice are kept separate.</span></div>`;
    const bank=Array.isArray(window.EnglishHubQuestions)?window.EnglishHubQuestions:(window.qs||[]);
    $('chapterGrid').innerHTML=s.chapters.map((c,i)=>{
      const n=bank.filter(q=>isChapterType(q,c)).length;
      return `<article class="chapter-card"><div class="chapter-number">${String(i+1).padStart(2,'0')}</div><div class="chapter-main"><h3>${esc(c.name)}</h3><div class="chapter-meta"><span>${esc(c.weight||'')}</span><span>${esc(c.priority||'')}</span><span>${n} questions</span></div><p>${n?'Only '+esc(c.name)+' questions are shown in this practice area.':'No questions loaded for this unit yet.'}</p></div><button class="chapter-btn" data-c="${esc(c.name)}" data-m="${esc(s.module)}" ${n?'':'disabled'}>${n?'Practice':'Unavailable'}</button></article>`;
    }).join('');
    document.querySelectorAll('.chapter-btn:not([disabled])').forEach(b=>b.onclick=()=>start('chapter',{module:b.dataset.m,chapter:b.dataset.c,title:b.dataset.c}));
    view('syllabus');
  };
})();