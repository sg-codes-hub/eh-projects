/* Student-use enhancements: multiple full papers while preserving the real 15-E paper structure. */
(function(){
  const PAPER_COUNT=10;
  let selectedPaper=1;
  const originalBuildMock=window.buildMock;

  function seededRandom(seed){
    let x=(seed>>>0)||1;
    return function(){
      x=(1664525*x+1013904223)>>>0;
      return x/4294967296;
    };
  }

  /* The core buildMock() already knows the actual section/order/choice pattern.
     We only seed Math.random temporarily so each paper is different. */
  window.buildMock=function(){
    const oldRandom=Math.random;
    Math.random=seededRandom(20260000+selectedPaper*7919);
    try{return originalBuildMock();}
    finally{Math.random=oldRandom;}
  };

  function renderMocks(){
    const grid=document.querySelector('.quick-grid');
    if(!grid)return;
    grid.querySelectorAll('.mock-paper-card').forEach(x=>x.remove());
    const cards=[];
    for(let i=1;i<=PAPER_COUNT;i++){
      cards.push(`<button class="quick-card featured mock-paper-card" data-mode="mock" data-paper="${i}" type="button"><span>47Q</span><b>Mock Paper ${i}</b><small>100 marks • 3:15 hours • Full 15-E paper pattern</small></button>`);
    }
    grid.insertAdjacentHTML('beforeend',cards.join(''));
    grid.querySelectorAll('.mock-paper-card').forEach(b=>b.addEventListener('click',()=>{
      selectedPaper=Number(b.dataset.paper)||1;
      if(typeof window.start==='function')window.start('mock',{title:`Class 10 English 15-E • Mock Paper ${selectedPaper}`});
      setTimeout(()=>{
        const title=document.getElementById('practiceTitle');
        if(title)title.textContent=`Class 10 English 15-E • Mock Paper ${selectedPaper}`;
        const e=document.getElementById('practiceEyebrow');
        if(e)e.textContent=`FULL MOCK TEST • PAPER ${selectedPaper}`;
      },0);
    }));
  }

  document.addEventListener('DOMContentLoaded',()=>setTimeout(renderMocks,0));
})();
