/* Dashboard-only layout: mock papers belong only in their own section. */
(function(){
  'use strict';
  let timer=null;
  function arrange(){
    const dashboard=document.querySelector('#dashboard');
    const quickGrid=document.querySelector('.quick-grid');
    if(!dashboard||!quickGrid)return false;

    const cards=Array.from(quickGrid.querySelectorAll('.mock-paper-card'));
    let section=document.querySelector('#full-mock-tests-section');
    let heading=document.querySelector('#full-mock-tests-heading');

    if(!heading){
      heading=document.createElement('div');
      heading.id='full-mock-tests-heading';
      heading.className='section-title mock-tests-heading';
      heading.innerHTML='<h2 id="mock-tests-title">Full Mock Tests</h2><p>Ten full-length papers designed around the 47-question, 100-mark examination pattern.</p>';
    }

    if(!section){
      section=document.createElement('section');
      section.id='full-mock-tests-section';
      section.className='mock-tests-section';
      section.setAttribute('aria-labelledby','mock-tests-title');
      section.innerHTML='<div class="quick-grid mock-tests-grid"></div>';

      /* Put the standalone heading and mock grid immediately after Quick Exam Practice. */
      const promo=document.querySelector('.continue-learning');
      if(promo){
        promo.parentNode.insertBefore(heading,promo);
        promo.parentNode.insertBefore(section,promo);
      }else{
        dashboard.appendChild(heading);
        dashboard.appendChild(section);
      }
    }else{
      /* Repair older DOM/CSS states: heading must be a sibling before the card section. */
      if(heading.parentNode!==dashboard)dashboard.appendChild(heading);
      const promo=document.querySelector('.continue-learning');
      if(promo && heading.parentNode===dashboard && heading.nextElementSibling!==section){
        promo.parentNode.insertBefore(heading,promo);
        promo.parentNode.insertBefore(section,promo);
      }
      if(section.contains(heading))heading.remove();
      if(section.previousElementSibling!==heading)section.parentNode.insertBefore(heading,section);
    }

    const mockGrid=section.querySelector('.mock-tests-grid');
    if(!mockGrid)return false;

    /* Move every generated mock card out of Quick Exam Practice. */
    cards.forEach(card=>mockGrid.appendChild(card));

    /* Safety cleanup: no mock card is allowed to remain in the original quick grid. */
    quickGrid.querySelectorAll('.mock-paper-card').forEach(card=>card.remove());

    return !!mockGrid.querySelector('.mock-paper-card');
  }

  function addPreviousPapers(){
    const dashboard=document.querySelector('#dashboard');
    const promo=document.querySelector('.continue-learning');
    if(!dashboard||!promo||document.querySelector('#previous-papers-section'))return;

    const heading=document.createElement('div');
    heading.id='previous-papers-heading';
    heading.className='section-title previous-papers-heading';
    heading.innerHTML='<h2>Previous Year Question Papers</h2><p>Practise the 2025 15-E Exam–1, Exam–2 and Exam–3 papers in their original question order.</p>';

    const section=document.createElement('section');
    section.id='previous-papers-section';
    section.className='previous-papers-section';
    section.setAttribute('aria-label','Previous Year Question Papers');
    section.innerHTML=`<div class="previous-papers-intro"><strong>2025 Examination Papers</strong><span>47 questions • 100 marks • 3:15 hours • First Language English 15-E</span></div><div class="previous-papers-grid">
      <button class="previous-paper-card" type="button" data-paper="2025-exam-1"><span class="pp-year">2025</span><b>Exam–1</b><small>21 March 2025</small><em>Open Paper →</em></button>
      <button class="previous-paper-card" type="button" data-paper="2025-exam-2"><span class="pp-year">2025</span><b>Exam–2</b><small>26 May 2025</small><em>Open Paper →</em></button>
      <button class="previous-paper-card" type="button" data-paper="2025-exam-3"><span class="pp-year">2025</span><b>Exam–3</b><small>05 July 2025</small><em>Open Paper →</em></button>
    </div>`;

    const style=document.createElement('style');
    style.id='previousPapersStyle';
    style.textContent=`
      #previous-papers-heading{display:block!important;width:100%!important;max-width:none!important;box-sizing:border-box!important;margin:38px 0 18px!important;padding:0 0 14px!important;background:transparent!important;border:0!important;box-shadow:none!important;border-radius:0!important}
      #previous-papers-heading::before,#previous-papers-heading::after{content:none!important;display:none!important}
      #previous-papers-heading h2{display:block!important;width:100%!important;margin:0!important;font-size:24px!important;line-height:1.2!important;color:#343434!important;white-space:nowrap!important}
      #previous-papers-heading p{display:block!important;width:100%!important;margin:5px 0 0!important;color:#66645d!important;line-height:1.5!important}
      #previous-papers-section{width:100%!important;margin:0 0 10px!important;padding:0!important;background:transparent!important;border:0!important}
      .previous-papers-intro{display:flex;align-items:center;justify-content:space-between;gap:14px;margin:0 0 14px;padding:12px 15px;border:1px solid #eadf9b;border-radius:14px;background:#fffdf0;color:#343434}
      .previous-papers-intro span{font-size:12px;color:#66645d;text-align:right}
      .previous-papers-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
      .previous-paper-card{display:flex;flex-direction:column;align-items:flex-start;text-align:left;min-height:178px;padding:18px;border:1px solid #e5e7ef;border-radius:18px;background:#fff;box-shadow:0 8px 22px rgba(52,52,52,.07);cursor:pointer;font:inherit;color:#343434;transition:transform .16s ease,box-shadow .16s ease,border-color .16s ease}
      .previous-paper-card:hover{transform:translateY(-2px);box-shadow:0 12px 26px rgba(52,52,52,.11);border-color:#eadf9b}
      .previous-paper-card .pp-year{display:inline-flex;padding:5px 9px;border-radius:999px;background:#fff3b0;color:#343434;font-size:11px;font-weight:800;margin-bottom:18px}
      .previous-paper-card b{font-size:22px;line-height:1.15;margin-bottom:5px}
      .previous-paper-card small{color:#66645d;font-size:13px}
      .previous-paper-card em{font-style:normal;margin-top:auto;padding-top:18px;color:#343434;font-size:13px;font-weight:800}
      .previous-paper-view{margin-top:18px;background:#fff;border:1px solid #e5e7ef;border-radius:18px;box-shadow:0 8px 24px rgba(52,52,52,.07);overflow:hidden}
      .previous-paper-top{padding:20px;background:linear-gradient(135deg,#fffdf0,#fff8d6);border-bottom:1px solid #eadf9b}
      .previous-paper-top .eyebrow{margin:0 0 5px;font-size:10px}
      .previous-paper-top h2{margin:0;font-size:25px;color:#343434}
      .previous-paper-meta{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}.previous-paper-meta span{padding:6px 10px;border-radius:999px;background:#fff;color:#343434;border:1px solid #eadf9b;font-size:12px;font-weight:700}
      .previous-paper-section{border-bottom:1px solid #ececf0}.previous-paper-section:last-child{border-bottom:0}
      .previous-paper-section-head{padding:13px 16px;background:#343434;color:#fff;display:flex;justify-content:space-between;gap:10px;align-items:center}.previous-paper-section-head b{font-size:14px}.previous-paper-section-head span{font-size:11px;opacity:.9}
      .previous-paper-item{padding:16px 18px;border-bottom:1px solid #eeeef2}.previous-paper-item:last-child{border-bottom:0}.previous-paper-item .pp-qno{font-weight:800;font-size:13px;color:#343434;margin-bottom:6px}.previous-paper-item p{margin:0;color:#30323a;line-height:1.55;font-size:14px}.previous-paper-item .pp-or{margin-top:8px;padding:9px 11px;border-left:3px solid #eadf9b;background:#fffdf0;color:#555;font-size:13px;line-height:1.5}
      .previous-paper-back{margin:16px 18px 18px}
      @media(max-width:760px){#previous-papers-heading{margin:30px 0 16px!important;padding-bottom:12px!important}#previous-papers-heading h2{font-size:22px!important}.previous-papers-intro{display:block}.previous-papers-intro span{display:block;text-align:left;margin-top:4px}.previous-papers-grid{grid-template-columns:1fr}.previous-paper-card{min-height:145px}.previous-paper-top h2{font-size:21px}.previous-paper-item{padding:14px}.previous-paper-section-head{align-items:flex-start;flex-direction:column;gap:3px}}
    `;
    document.head.appendChild(style);
    dashboard.insertBefore(heading,promo);
    dashboard.insertBefore(section,promo);

    section.querySelectorAll('.previous-paper-card').forEach(card=>card.addEventListener('click',()=>openPreviousPaper(card.dataset.paper,section,heading)));
  }

  async function openPreviousPaper(id,section,heading){
    try{
      const res=await fetch('data/previous-papers-2025.json?v=20260907-01',{cache:'no-store'});
      if(!res.ok)throw new Error('Paper data unavailable');
      const data=await res.json();
      const paper=data.papers.find(p=>p.id===id);if(!paper)throw new Error('Paper not found');
      section.hidden=true;heading.hidden=true;
      let view=document.querySelector('#previous-paper-view');
      if(!view){view=document.createElement('div');view.id='previous-paper-view';section.parentNode.insertBefore(view,section);}
      view.innerHTML=`<div class="previous-paper-view"><div class="previous-paper-top"><p class="eyebrow">PREVIOUS YEAR QUESTION PAPER</p><h2>${escapeHtml(paper.title)}</h2><div class="previous-paper-meta"><span>15-E</span><span>${paper.date}</span><span>${paper.questions} Questions</span><span>${paper.marks} Marks</span><span>${paper.duration}</span></div></div>${paper.sections.map(s=>`<section class="previous-paper-section"><div class="previous-paper-section-head"><b>Section ${escapeHtml(s.section)} — ${escapeHtml(s.title)}</b><span>${s.count} × ${s.marks} mark${s.marks===1?'':'s'}</span></div>${s.items.map((item,i)=>`<article class="previous-paper-item"><div class="pp-qno">Q${questionNumber(paper,s,i)}</div><p>${escapeHtml(item)}</p></article>`).join('')}</section>`).join('')}<button class="secondary-btn previous-paper-back" type="button">← Back to Previous Papers</button></div>`;
      view.querySelector('.previous-paper-back').onclick=()=>{view.remove();section.hidden=false;heading.hidden=false;window.scrollTo({top:section.offsetTop-20,behavior:'smooth'})};
      window.scrollTo({top:view.offsetTop-20,behavior:'smooth'});
    }catch(e){console.error(e);alert('Unable to open this previous paper. Please refresh after GitHub Pages finishes deploying.');}
  }
  function questionNumber(paper,s,i){let n=0;for(const x of paper.sections){if(x===s)break;n+=x.count}return n+i+1}
  function escapeHtml(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

  function watch(){
    if(arrange()){
      addPreviousPapers();
      return;
    }
    const dashboard=document.querySelector('#dashboard');
    if(!dashboard)return;
    const observer=new MutationObserver(()=>{if(arrange()){addPreviousPapers();}});
    observer.observe(dashboard,{childList:true,subtree:true});
    let attempts=0;
    timer=setInterval(()=>{
      attempts++;
      if(arrange()||attempts>=48){clearInterval(timer);observer.disconnect();addPreviousPapers();}
    },250);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',watch);
  else watch();
})();
