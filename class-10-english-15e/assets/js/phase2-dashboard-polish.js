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

/* English Hub promotional card */
#dashboard .continue-learning{text-align:center!important}
#dashboard .continue-learning h3,#dashboard .continue-learning p{display:block!important;width:100%!important;text-align:center!important}
#dashboard .continue-learning p{max-width:650px!important;margin:0 auto 10px!important}
#dashboard .continue-learning a{display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:7px!important;text-decoration:none!important;white-space:nowrap!important;line-height:1.2!important;box-sizing:border-box!important;background:#343434!important;color:#fff!important;font-size:13px!important;font-weight:900!important;padding:9px 15px!important;border-radius:8px!important;box-shadow:0 4px 10px rgba(52,52,52,.16)!important}
#dashboard .continue-learning a:hover{background:#202020!important;transform:translateY(-1px)!important}
#dashboard .continue-learning a span{color:#fff!important;text-decoration:none!important;font-weight:900!important}

.hero .eyebrow{font-size:13px!important;letter-spacing:.045em!important}
.hero{padding:18px 22px!important;min-height:0!important}
.hero-content-row{display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;align-items:center!important;column-gap:22px!important}
.hero-content-row>div:first-child{min-width:0!important}
.hero-content-row .hero-badge{margin:0!important;justify-self:end!important}
.hero .hero-exam-info-in-hero{display:block!important;margin:9px 0 0!important;padding:0!important;text-align:left!important;font-size:13px!important;font-weight:800!important;letter-spacing:.01em!important;color:#343434!important}
.previous-paper-bottom-actions{display:flex;justify-content:flex-start;padding:16px 18px;background:#fff}
.previous-paper-bottom-back{margin:0!important}

@media(max-width:700px){
  .hero{padding:18px 17px!important;border-radius:17px!important}
  .hero-content-row{display:block!important;width:100%!important}
  .hero-content-row>div:first-child{width:100%!important;max-width:none!important}
  .hero-content-row .hero-badge{display:none!important}
  .hero-content-row>div:first-child .eyebrow{font-size:10px!important;line-height:1.3!important;letter-spacing:.06em!important;margin:0 0 5px!important}
  .hero-content-row>div:first-child h1{font-size:28px!important;line-height:1.08!important;margin:4px 0 8px!important;letter-spacing:-.025em!important}
  .hero-content-row>div:first-child>p:not(.eyebrow):not(.hero-exam-info-in-hero){font-size:12px!important;line-height:1.42!important;margin:0!important;max-width:none!important}
  .hero .hero-exam-info-in-hero{font-size:11px!important;line-height:1.35!important;margin-top:10px!important;padding-top:9px!important;border-top:1px solid rgba(52,52,52,.16)!important}
}
@media(max-width:520px){
  .hero{padding:17px 15px!important;border-radius:16px!important}
  .hero-content-row>div:first-child h1{font-size:26px!important;line-height:1.08!important;margin:3px 0 8px!important}
  .hero-content-row>div:first-child>p:not(.eyebrow):not(.hero-exam-info-in-hero){font-size:11.5px!important;line-height:1.42!important}
  .hero .hero-exam-info-in-hero{font-size:10.5px!important;line-height:1.35!important;margin-top:9px!important;padding-top:8px!important}
  #dashboard .continue-learning{padding:14px 15px!important}
  #dashboard .continue-learning h3{font-size:15px!important;margin-bottom:4px!important}
  #dashboard .continue-learning p{font-size:10px!important;line-height:1.35!important;margin-bottom:9px!important}
  #dashboard .continue-learning a{font-size:12px!important;padding:9px 14px!important;border-radius:8px!important}
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
