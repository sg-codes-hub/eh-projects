/* Phase 2 dashboard polish — copy and interaction cleanup. */
(function(){
  'use strict';

  const PREVIOUS_PAPER_DESCRIPTION='Practise previous-year 15-E question papers with solved answers, explanations and focused grammar support.';

  function normalizePreviousPaperHeading(){
    const headings=Array.from(document.querySelectorAll('#previous-papers-heading'));
    if(!headings.length)return false;
    const primary=headings[headings.length-1];
    headings.slice(0,-1).forEach(el=>el.remove());
    primary.querySelectorAll('p').forEach(el=>el.remove());
    primary.querySelectorAll('h2').forEach((el,i)=>{if(i>0)el.remove()});
    const p=document.createElement('p');
    p.textContent=PREVIOUS_PAPER_DESCRIPTION;
    primary.appendChild(p);
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
#dashboard>#full-mock-tests-heading,#dashboard>#previous-papers-heading{display:block!important;width:100%!important;box-sizing:border-box!important;margin:25px 0 12px!important;padding:11px 16px 12px!important;border:0!important;border-radius:13px!important;background:linear-gradient(90deg,#e7f3ff 0%,#eef9f5 52%,#fff4c9 100%)!important;box-shadow:0 5px 15px rgba(52,52,52,.07)!important}
#dashboard>#full-mock-tests-heading h2,#dashboard>#previous-papers-heading h2{margin:0!important;padding:0!important;font-size:22px!important;line-height:1.2!important;color:#202c42!important;white-space:normal!important}
#dashboard>#previous-papers-heading p,#dashboard>#full-mock-tests-heading p{margin:4px 0 0!important;padding:0!important;font-size:11px!important;line-height:1.35!important;color:#4d5963!important}
#dashboard>.previous-papers-intro{border-radius:13px!important}
.hero .eyebrow{font-size:13px!important;letter-spacing:.045em!important}
.hero{padding:18px 22px!important;min-height:0!important}
.hero-content-row{display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;align-items:center!important;column-gap:22px!important}
.hero-content-row>div:first-child{min-width:0!important}
.hero-content-row .hero-badge{margin:0!important;justify-self:end!important}
.hero .hero-exam-info-in-hero{display:block!important;margin:9px 0 0!important;padding:0!important;text-align:left!important;font-size:13px!important;font-weight:800!important;letter-spacing:.01em!important;color:#343434!important}
.previous-paper-bottom-actions{display:flex;justify-content:flex-start;padding:16px 18px;background:#fff}
.previous-paper-bottom-back{margin:0!important}
@media(max-width:700px){.hero-content-row{grid-template-columns:minmax(0,1fr) auto!important;column-gap:12px!important;align-items:start!important}.hero-content-row .hero-badge{display:none!important}.hero-content-row>div:first-child h1{font-size:30px!important;line-height:1.12!important}}
@media(max-width:520px){.hero{padding:17px 15px!important;border-radius:17px!important}.hero-content-row{grid-template-columns:minmax(0,1fr) auto!important;column-gap:10px!important;align-items:start!important}.hero-content-row>div:first-child h1{font-size:25px!important;line-height:1.12!important;margin:4px 0 7px!important}.hero-content-row>div:first-child>p:not(.eyebrow):not(.hero-exam-info-in-hero){font-size:11px!important;line-height:1.4!important;margin:0!important}.hero .hero-exam-info-in-hero{font-size:11px!important;line-height:1.35!important;margin-top:8px!important}.hero .eyebrow{font-size:10px!important;line-height:1.25!important}}
`;
    document.head.appendChild(style);
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

  function watchPreviousHeading(){
    let checks=0;
    const timer=setInterval(()=>{checks++;if(normalizePreviousPaperHeading()||checks>=120)clearInterval(timer)},100);
  }

  document.addEventListener('click',event=>{if(event.target.closest('.previous-paper-card'))setupPreviousPaperBack()});

  function start(){apply();moveExamInfoIntoHero();styleGeneratedHeadings();watchPreviousHeading()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
