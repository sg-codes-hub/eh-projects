/* Phase 2 dashboard polish — copy and interaction cleanup. */
(function(){
  'use strict';
  function apply(){
    const heading=document.querySelector('#previous-papers-heading p');
    if(heading){
      const text='Practise previous-year 15-E examination papers with solved answers and grammar help.';
      if(heading.textContent!==text) heading.textContent=text;
    }
    document.querySelectorAll('#courseGrid .module-count').forEach(el=>el.remove());
    document.querySelectorAll('.previous-paper-card em').forEach(el=>el.remove());
    document.querySelectorAll('.mock-paper-card em').forEach(el=>el.remove());
    document.querySelectorAll('.stats-grid').forEach(el=>el.remove());
  }
  function styleGeneratedHeadings(){
    if(document.getElementById('phase2-generated-heading-fix'))return;
    const style=document.createElement('style');
    style.id='phase2-generated-heading-fix';
    style.textContent=`#dashboard>#full-mock-tests-heading,#dashboard>#previous-papers-heading{display:block!important;width:100%!important;box-sizing:border-box!important;margin:25px 0 12px!important;padding:11px 16px 12px!important;border:0!important;border-radius:13px!important;background:linear-gradient(90deg,#e7f3ff 0%,#eef9f5 52%,#fff4c9 100%)!important;box-shadow:0 5px 15px rgba(52,52,52,.07)!important}#dashboard>#full-mock-tests-heading h2,#dashboard>#previous-papers-heading h2{margin:0!important;padding:0!important;font-size:22px!important;line-height:1.2!important;color:#202c42!important;white-space:normal!important}#dashboard>#full-mock-tests-heading p,#dashboard>#previous-papers-heading p{margin:4px 0 0!important;padding:0!important;font-size:11px!important;line-height:1.35!important;color:#4d5963!important}#dashboard>.previous-papers-intro{border-radius:13px!important}.hero .eyebrow{font-size:13px!important;letter-spacing:.045em!important}.hero-dashboard-btn{display:inline-flex;align-items:center;justify-content:center;margin-top:14px;padding:9px 16px;border:1px solid rgba(52,52,52,.14);border-radius:999px;background:#343434;color:#ffd92a;font:inherit;font-size:13px;font-weight:800;line-height:1;text-decoration:none;cursor:pointer;box-shadow:0 5px 12px rgba(52,52,52,.12)}.hero-dashboard-btn:hover{transform:translateY(-1px)}.previous-paper-bottom-actions{display:flex;justify-content:flex-start;padding:16px 18px;background:#fff}.previous-paper-bottom-back{margin:0!important}`;
    document.head.appendChild(style);
  }
  function setupHeroButton(){
    const hero=document.querySelector('#dashboard .hero');
    if(!hero||document.getElementById('heroDashboardBtn'))return;
    const btn=document.createElement('button');
    btn.id='heroDashboardBtn';
    btn.className='hero-dashboard-btn';
    btn.type='button';
    btn.textContent='Dashboard';
    btn.addEventListener('click',()=>{
      document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
      document.getElementById('dashboard')?.classList.add('active');
      window.scrollTo({top:0,behavior:'smooth'});
    });
    const content=hero.firstElementChild;
    if(content)content.appendChild(btn);
  }
  function setupPreviousPaperBack(){
    let tries=0;
    const timer=setInterval(()=>{
      tries++;
      const view=document.getElementById('previous-paper-view');
      const paper=view?.querySelector('.previous-paper-view');
      if(paper){
        clearInterval(timer);
        if(paper.querySelector('.previous-paper-bottom-back'))return;
        const wrap=document.createElement('div');
        wrap.className='previous-paper-bottom-actions';
        const btn=document.createElement('button');
        btn.type='button';
        btn.className='secondary-btn previous-paper-bottom-back';
        btn.textContent='← Back to Previous Papers';
        btn.addEventListener('click',()=>paper.querySelector('.previous-paper-back')?.click());
        wrap.appendChild(btn);
        paper.appendChild(wrap);
      }else if(tries>=60){
        clearInterval(timer);
      }
    },100);
  }
  document.addEventListener('click',event=>{
    if(event.target.closest('.previous-paper-card'))setupPreviousPaperBack();
  });
  function start(){
    apply();
    styleGeneratedHeadings();
    setupHeroButton();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
