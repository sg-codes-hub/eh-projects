(()=>{
  const render=()=>{
    const grid=document.getElementById('courseGrid');
    if(!grid||grid.dataset.fastRendered==='1')return;
    const items=[
      ['ff-prose','📖','First Flight – Prose','Prose chapters'],
      ['ff-poetry','🪶','First Flight – Poetry','Poems'],
      ['footprints','📚','Footprints Without Feet','Supplementary reader'],
      ['grammar','✏️','Grammar','Grammar concepts'],
      ['analogy','🔤','Analogy','Relationship questions'],
      ['comprehension','🔎','Comprehension','Passage practice'],
      ['composition','📝','Composition','Essay & letter writing']
    ];
    grid.innerHTML=items.map(x=>`<button class="module-card" data-sec="${x[0]}" type="button"><div class="module-icon">${x[1]}</div><h3>${x[2]}</h3><p>${x[3]}</p><small class="module-count">Open →</small></button>`).join('');
    grid.dataset.fastRendered='1';
    const bind=()=>document.querySelectorAll('#courseGrid [data-sec]').forEach(b=>b.onclick=()=>window.openSection?.(b.dataset.sec));
    bind();
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render);else render();
})();