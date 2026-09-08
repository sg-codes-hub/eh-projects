/* Phase 2 dashboard polish — copy and interaction cleanup. */
(function(){
  'use strict';

  function apply(){
    /* The previous-year heading should stand on its own; no fixed-year subtitle. */
    document.querySelectorAll('#previous-papers-heading p').forEach(el=>el.remove());

    document.querySelectorAll('#courseGrid .module-count').forEach(el=>el.remove());
    document.querySelectorAll('.previous-paper-card em').forEach(el=>el.remove());
    document.querySelectorAll('.mock-paper-card em').forEach(el=>el.remove());
    document.querySelectorAll('.stats-grid').forEach(el=>el.remove());
  }

  function styleGeneratedHeadings(){
    if(document.getElementById('phase2-generated-heading-fix'))return;
    const style=document.createElement('style');
    style.id='phase2-generated-heading-fix';
    style.textContent=`
#dashboard>#full-mock-tests-heading,
#dashboard>#previous-papers-heading{
  display:block!important;
  width:100%!important;
  box-sizing:border-box!important;
  margin:25px 0 12px!important;
  padding:11px 16px 12px!important;
  border:0!important;
  border-radius:13px!important;
  background:linear-gradient(90deg,#e7f3ff 0%,#eef9f5 52%,#fff4c9 100%)!important;
  box-shadow:0 5px 15px rgba(52,52,52,.07)!important;
}
#dashboard>#full-mock-tests-heading h2,
#dashboard>#previous-papers-heading h2{
  margin:0!important;
  padding:0!important;
  font-size:22px!important;
  line-height:1.2!important;
  color:#202c42!important;
  white-space:normal!important;
}
#dashboard>#previous-papers-heading p{display:none!important}
#dashboard>#full-mock-tests-heading p{
  margin:4px 0 0!important;
  padding:0!important;
  font-size:11px!important;
  line-height:1.35!important;
  color:#4d5963!important;
}
#dashboard>.previous-papers-intro{border-radius:13px!important}
.hero .eyebrow{font-size:13px!important;letter-spacing:.045em!important}
.hero{padding:18px 22px!important;min-height:0!important}
.hero-content-row{
  display:grid!important;
  grid-template-columns:minmax(0,1fr) auto auto!important;
  align-items:center!important;
  column-gap:22px!important;
}
.hero-content-row>div:first-child{min-width:0!important}
.hero-content-row .hero-badge{margin:0!important;justify-self:end!important}
.hero-content-row .hero-dashboard-btn{
  display:inline-flex!important;
  align-items:center!important;
  justify-content:center!important;
  width:128px!important;
  min-width:128px!important;
  height:42px!important;
  box-sizing:border-box!important;
  margin:0!important;
  padding:0 18px!important;
  border:1px solid rgba(52,52,52,.18)!important;
  border-radius:10px!important;
  background:#343434!important;
  color:#ffd92a!important;
  font:inherit!important;
  font-size:14px!important;
  font-weight:800!important;
  line-height:1!important;
  text-decoration:none!important;
  cursor:pointer!important;
  box-shadow:0 5px 12px rgba(52,52,52,.14)!important;
}
.hero-content-row .hero-dashboard-btn:hover{transform:translateY(-1px)}
.hero-exam-info{margin:10px 0 22px!important}
.previous-paper-bottom-actions{
  display:flex;
  justify-content:flex-start;
  padding:16px 18px;
  background:#fff;
}
.previous-paper-bottom-back{margin:0!important}
@media(max-width:700px){
  .hero-content-row{grid-template-columns:minmax(0,1fr) auto!important;column-gap:12px!important}
  .hero-content-row .hero-badge{display:none!important}
  .hero-content-row .hero-dashboard-btn{width:112px!important;min-width:112px!important;height:40px!important;font-size:13px!important;padding:0 14px!important}
}
@media(max-width:520px){
  .hero{padding:16px 16px!important}
  .hero-content-row{grid-template-columns:1fr!important;row-gap:12px!important}
  .hero-content-row .hero-dashboard-btn{justify-self:start!important}
}
`;
    document.head.appendChild(style);
  }

  function setupHeroButton(){
    const hero=document.querySelector('#dashboard .hero');
    if(!hero)return;

    let btn=document.getElementById('heroDashboardBtn');
    if(!btn){
      btn=document.createElement('button');
      btn.id='heroDashboardBtn';
      btn.className='hero-dashboard-btn';
      btn.type='button';
      btn.textContent='Dashboard';
      const row=hero.querySelector('.hero-content-row');
      if(row)row.appendChild(btn);
      else hero.appendChild(btn);
    }

    if(btn.dataset.dashboardBound==='1')return;
    btn.dataset.dashboardBound='1';
    btn.addEventListener('click',()=>{
      document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
      document.getElementById('dashboard')?.classList.add('active');
      window.scrollTo({top:0,behavior:'smooth'});
    });
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
