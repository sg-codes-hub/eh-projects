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
  }
  function styleGeneratedHeadings(){
    if(document.getElementById('phase2-generated-heading-fix'))return;
    const style=document.createElement('style');
    style.id='phase2-generated-heading-fix';
    style.textContent=`#dashboard>#full-mock-tests-heading,#dashboard>#previous-papers-heading{display:block!important;width:100%!important;box-sizing:border-box!important;margin:25px 0 12px!important;padding:11px 16px 12px!important;border:0!important;border-radius:13px!important;background:linear-gradient(90deg,#e7f3ff 0%,#eef9f5 52%,#fff4c9 100%)!important;box-shadow:0 5px 15px rgba(52,52,52,.07)!important}#dashboard>#full-mock-tests-heading h2,#dashboard>#previous-papers-heading h2{margin:0!important;padding:0!important;font-size:22px!important;line-height:1.2!important;color:#202c42!important;white-space:normal!important}#dashboard>#full-mock-tests-heading p,#dashboard>#previous-papers-heading p{margin:4px 0 0!important;padding:0!important;font-size:11px!important;line-height:1.35!important;color:#4d5963!important}#dashboard>.previous-papers-intro{border-radius:13px!important}`;
    document.head.appendChild(style);
  }
  function start(){
    apply();
    styleGeneratedHeadings();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
