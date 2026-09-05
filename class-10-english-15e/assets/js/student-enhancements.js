/* Student-use enhancements: multiple full papers without replacing the core app. */
(function(){
  const PAPER_COUNT=10;
  const PAPER_BLUEPRINT={1:20,2:10,3:10,4:5,5:2};
  const ZERO=new Set(['Coorg','Madam Rides the Bus','Amanda!','The Tale of Custard the Dragon']);
  let selectedPaper=1;
  function seededShuffle(arr,seed){const a=[...arr];let x=(seed>>>0)||1;for(let i=a.length-1;i>0;i--){x=(1664525*x+1013904223)>>>0;const j=x%(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
  function paper(seed){const selected=[];const shortages=[];for(const [m,n] of Object.entries(PAPER_BLUEPRINT)){const pool=seededShuffle(qs.filter(q=>+q.marks===+m&&!ZERO.has(String(q.chapter||''))),seed*1009+Number(m)*97);if(pool.length<n)shortages.push(`${n-pool.length} fewer ${m}M candidates`);selected.push(...pool.slice(0,n));}return {selected,shortages};}
  const originalBuildMock=window.buildMock;
  window.buildMock=function(){return paper(selectedPaper);};
  function renderMocks(){
    const grid=document.querySelector('.quick-grid'); if(!grid)return;
    const old=grid.querySelector('.featured'); if(old)old.remove();
    const cards=[];
    for(let i=1;i<=PAPER_COUNT;i++)cards.push(`<button class="quick-card featured mock-paper-card" data-mode="mock" data-paper="${i}" type="button"><span>47Q</span><b>Mock Paper ${i}</b><small>100 marks • 3:15 hours • Full blueprint practice</small></button>`);
    grid.insertAdjacentHTML('beforeend',cards.join(''));
    grid.querySelectorAll('.mock-paper-card').forEach(b=>b.addEventListener('click',()=>{
      selectedPaper=Number(b.dataset.paper)||1;
      window.buildMock=function(){return paper(selectedPaper);};
      const originalTitle=document.getElementById('practiceTitle');
      if(typeof window.start==='function') window.start('mock',{title:`Class 10 English 15-E • Mock Paper ${selectedPaper}`});
      setTimeout(()=>{if(originalTitle)originalTitle.textContent=`Class 10 English 15-E • Mock Paper ${selectedPaper}`;const e=document.getElementById('practiceEyebrow');if(e)e.textContent=`FULL MOCK TEST • PAPER ${selectedPaper}`;},0);
    }));
  }
  document.addEventListener('DOMContentLoaded',()=>setTimeout(renderMocks,0));
})();
