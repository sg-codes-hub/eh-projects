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
  const observer=new MutationObserver(apply);
  function start(){
    apply();
    observer.observe(document.getElementById('dashboard')||document.body,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
