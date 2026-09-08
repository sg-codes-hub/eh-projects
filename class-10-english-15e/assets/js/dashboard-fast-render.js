(()=>{
  const injectRefresh=()=>{
    if(document.getElementById('dashboard-refresh-css'))return;
    const link=document.createElement('link');
    link.id='dashboard-refresh-css';
    link.rel='stylesheet';
    link.href='assets/css/dashboard-refresh.css?v=20260908-01';
    document.head.appendChild(link);
    const v2=document.createElement('link');
    v2.id='dashboard-refresh-v2-css';
    v2.rel='stylesheet';
    v2.href='assets/css/dashboard-refresh-v2.css?v=20260908-01';
    document.head.appendChild(v2);
    const v3=document.createElement('link');
    v3.id='dashboard-refresh-v3-css';
    v3.rel='stylesheet';
    v3.href='assets/css/dashboard-refresh-v3.css?v=20260908-01';
    document.head.appendChild(v3);
  };
  const render=()=>{
    injectRefresh();
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
    grid.innerHTML=items.map(x=>`<button class="module-card" data-sec="${x[0]}" type="button"><div class="module-icon">${x[1]}</div><h3>${x[2]}</h3><p>${x[3]}</p></button>`).join('');
    grid.dataset.fastRendered='1';
    document.querySelectorAll('#courseGrid [data-sec]').forEach(b=>b.onclick=()=>window.openSection?.(b.dataset.sec));
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render);else render();
})();