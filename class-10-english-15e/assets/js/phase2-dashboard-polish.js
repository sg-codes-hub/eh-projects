/* Phase 2 dashboard polish — copy and interaction cleanup. */
(function(){
  'use strict';

  const PREVIOUS_PAPER_TITLE='Previous Year Question Papers';
  const PREVIOUS_PAPER_DESCRIPTION='Practise previous-year 15-E question papers with solved answers, explanations and focused grammar support.';

  function normalizePreviousPaperHeading(){
    const headings=Array.from(document.querySelectorAll('#previous-papers-heading, .previous-papers-heading'));
    if(!headings.length)return false;
    const primary=headings[headings.length-1];
    headings.slice(0,-1).forEach(el=>el.remove());
    primary.id='previous-papers-heading';
    primary.className='section-title previous-papers-heading';
    primary.replaceChildren();
    const h2=document.createElement('h2');
    h2.textContent=PREVIOUS_PAPER_TITLE;
    const p=document.createElement('p');
    p.textContent=PREVIOUS_PAPER_DESCRIPTION;
    primary.append(h2,p);
    return true;
  }

  function apply(){
    document.querySelectorAll('#courseGrid .module-count').forEach(el=>el.remove());
    document.querySelectorAll('.previous-paper-card em').forEach(el=>el.remove());
    document.querySelectorAll('.mock-paper-card em').forEach(el=>el.remove());
    document.querySelectorAll('.stats-grid').forEach(el=>el.remove());
    document.querySelectorAll('#heroDashboardBtn').forEach(el=>el.remove());
    normalizePreviousPaperHeading();
  }

  function moveExamInfoIntoHero(){
    const hero=document.querySelector('#dashboard .hero');
    const info=document.querySelector('#dashboard .hero-exam-info');
    const textBlock=hero?.querySelector('.hero-content-row>div:first-child');
    if(!hero||!info||!textBlock)return;
    info.classList.add('hero-exam-info-in-hero');
    if(info.parentElement!==textBlock)textBlock.appendChild(info);
  }

  function styleGeneratedHeadings(){
    if(document.getElementById('phase2-generated-heading-fix'))return;
    const style=document.createElement('style');
    style.id='phase2-generated-heading-fix';
    style.textContent=`
#dashboard>#full-mock-tests-heading,#dashboard>#previous-papers-heading{display:block!important;width:100%!important;box-sizing:border-box!important;margin:25px 0 12px!important;padding:11px 16px 12px!important;border:0!important;border-radius:13px!important;background:linear-gradient(90deg,#e7f3ff 0%,#eef9f5 52%,#fff4c9 100%)!important;box-shadow:0 5px 15px rgba(52,52,52,.07)!important;user-select:text!important;-webkit-user-select:text!important;pointer-events:auto!important}
#dashboard>#full-mock-tests-heading h2,#dashboard>#previous-papers-heading h2{margin:0!important;padding:0!important;font-size:22px!important;line-height:1.2!important;color:#202c42!important;white-space:normal!important}
#dashboard>#previous-papers-heading p,#dashboard>#full-mock-tests-heading p{display:block!important;margin:4px 0 0!important;padding:0!important;font-size:11px!important;line-height:1.35!important;color:#4d5963!important;white-space:normal!important;user-select:text!important;-webkit-user-select:text!important;pointer-events:auto!important}
#dashboard>#previous-papers-heading p::before,#dashboard>#previous-papers-heading p::after,#dashboard>#full-mock-tests-heading p::before,#dashboard>#full-mock-tests-heading p::after{content:none!important;display:none!important}
#dashboard>.previous-papers-intro{border-radius:13px!important}
#dashboard .continue-learning{text-align:center!important}
#dashboard .continue-learning h3,#dashboard .continue-learning p{display:block!important;width:100%!important;text-align:center!important}
#dashboard .continue-learning p{max-width:650px!important;margin:0 auto 9px!important}
#dashboard .continue-learning a{display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:7px!important;text-decoration:none!important;white-space:nowrap!important;line-height:1.2!important;box-sizing:border-box!important}
#dashboard .continue-learning a span{text-decoration:none!important}
.hero .eyebrow{font-size:13px!important;letter-spacing:.045em!important}
.hero{padding:18px 22px!important;min-height:0!important}
.hero-content-row{display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;align-items:center!important;column-gap:22px!important}
.hero-content-row>div:first-child{min-width:0!important}
.hero-content-row .hero-badge{margin:0!important;justify-self:end!important}
.hero .hero-exam-info-in-hero{display:block!important;margin:9px 0 0!important;padding:0!important;text-align:left!important;font-size:13px!important;font-weight:800!important;letter-spacing:.01em!important;color:#343434!important}
.previous-paper-bottom-actions{display:flex;justify-content:flex-start;padding:16px 18px;background:#fff}
.previous-paper-bottom-back{margin:0!important}
@media(max-width:700px){.hero-content-row{grid-template-columns:minmax(0,1fr) auto!important;column-gap:12px!important;align-items:start!important}.hero-content-row .hero-badge{display:none!important}.hero-content-row>div:first-child h1{font-size:30px!important;line-height:1.12!important}}
@media(max-width:520px){
  .hero{padding:13px 14px 11px!important;border-radius:16px!important}
  .hero-content-row{display:block!important;width:100%!important;min-width:0!important}
  .hero-content-row>div:first-child{display:block!important;width:100%!important;min-width:0!important}
  .hero-content-row>div:first-child h1{display:block!important;width:100%!important;max-width:none!important;font-size:clamp(18px,6.3vw,23px)!important;line-height:1.05!important;letter-spacing:-.025em!important;margin:3px 0 6px!important;white-space:nowrap!important;overflow:visible!important}
  .hero-content-row>div:first-child>p:not(.eyebrow):not(.hero-exam-info-in-hero){font-size:10px!important;line-height:1.3!important;margin:0!important;width:100%!important;max-width:none!important}
  .hero .hero-exam-info-in-hero{font-size:9px!important;line-height:1.25!important;margin-top:6px!important;padding-top:6px!important;border-top:1px solid rgba(52,52,52,.16)!important;white-space:nowrap!important;width:100%!important}
  .hero .eyebrow{font-size:9px!important;line-height:1.2!important;margin:0 0 2px!important;white-space:nowrap!important}
  .hero-badge{display:none!important}
}
@media(max-width:390px){
  .hero{padding:11px 12px 10px!important;border-radius:15px!important}
  .hero-content-row>div:first-child h1{font-size:18px!important;line-height:1.05!important;letter-spacing:-.03em!important}
  .hero .eyebrow{font-size:8.5px!important}
  .hero-content-row>div:first-child>p:not(.eyebrow):not(.hero-exam-info-in-hero){font-size:9px!important}
  .hero .hero-exam-info-in-hero{font-size:8.5px!important}
}
`;
    document.head.appendChild(style);
  }

  function watchPreviousHeading(){
    const dashboard=document.getElementById('dashboard');
    if(!dashboard||dashboard.dataset.previousHeadingObserver)return;
    dashboard.dataset.previousHeadingObserver='1';
    let scheduled=false;
    const observer=new MutationObserver(()=>{
      if(scheduled)return;
      scheduled=true;
      requestAnimationFrame(()=>{scheduled=false;normalizePreviousPaperHeading()});
    });
    observer.observe(dashboard,{childList:true,subtree:true});
    setTimeout(()=>observer.disconnect(),5000);
  }

  function setupPreviousPaperBack(){
    let tries=0;
    const timer=setInterval(()=>{
      tries++;
      const view=document.getElementById('previous-paper-view');
      const paper=view?.querySelector('.previous-paper-view');
      if(paper){clearInterval(timer);if(paper.querySelector('.previous-paper-bottom-back'))return;const wrap=document.createElement('div');wrap.className='previous-paper-bottom-actions';const btn=document.createElement('button');btn.type='button';btn.className='secondary-btn previous-paper-bottom-back';btn.textContent='← Back to Previous Papers';btn.addEventListener('click',()=>paper.querySelector('.previous-paper-back')?.click());wrap.appendChild(btn);paper.appendChild(wrap)}else if(tries>=60)clearInterval(timer);
    },100);
  }

  document.addEventListener('click',event=>{if(event.target.closest('.previous-paper-card'))setupPreviousPaperBack()});

  function start(){
    apply();
    moveExamInfoIntoHero();
    styleGeneratedHeadings();
    watchPreviousHeading();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
