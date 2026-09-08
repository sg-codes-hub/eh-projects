/* Phase 2 dashboard polish — copy, interaction, navigation and statistics cleanup. */
(function(){
  'use strict';
  function dashboard(){
    if(typeof window.view==='function')window.view('dashboard');
    else document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id==='dashboard'));
    window.scrollTo({top:0,behavior:'smooth'});
  }
  function addHeroDashboard(){
    const hero=document.querySelector('#dashboard .hero');
    if(!hero||hero.querySelector('.hero-dashboard-btn'))return;
    const btn=document.createElement('button');
    btn.type='button';btn.className='hero-dashboard-btn';btn.textContent='Dashboard';
    btn.setAttribute('aria-label','Dashboard');btn.addEventListener('click',dashboard);hero.appendChild(btn);
  }
  function addStat(){
    const stats=document.querySelector('#dashboard .stats-grid');
    if(!stats||stats.querySelector('.previous-papers-stat'))return;
    const card=document.createElement('div');card.className='stat previous-papers-stat';
    card.innerHTML='<b>📄</b><span>Previous year papers</span>';stats.appendChild(card);
  }
  function addPaperEndButton(){
    const view=document.querySelector('#previous-paper-view');
    if(!view)return;
    const paper=view.querySelector('.previous-paper-view');
    if(!paper||paper.querySelector('.previous-paper-end-back'))return;
    const wrap=document.createElement('div');wrap.className='previous-paper-end-nav';
    const btn=document.createElement('button');btn.type='button';btn.className='secondary-btn previous-paper-end-back';btn.textContent='← Back to Previous Papers';
    btn.addEventListener('click',()=>{const section=document.querySelector('#previous-papers-section');const heading=document.querySelector('#previous-papers-heading');view.remove();if(section)section.hidden=false;if(heading)heading.hidden=false;if(section)window.scrollTo({top:section.offsetTop-20,behavior:'smooth'});});
    wrap.appendChild(btn);paper.appendChild(wrap);
  }
  function apply(){
    const heading=document.querySelector('#previous-papers-heading p');
    if(heading)heading.textContent='Practise previous-year 15-E examination papers with solved answers and grammar help.';
    document.querySelectorAll('#courseGrid .module-count').forEach(el=>el.remove());
    document.querySelectorAll('.previous-paper-card em').forEach(el=>el.remove());
    document.querySelectorAll('.mock-paper-card em').forEach(el=>el.remove());
    addHeroDashboard();addStat();addPaperEndButton();
  }
  const observer=new MutationObserver(apply);
  function start(){apply();observer.observe(document.getElementById('dashboard')||document.body,{childList:true,subtree:true});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
