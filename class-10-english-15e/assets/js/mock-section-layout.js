/* Dashboard-only layout: moves generated mock-paper cards out of Quick Exam Practice. */
(function(){
  'use strict';
  function arrange(){
    const quickGrid=document.querySelector('.quick-grid');
    if(!quickGrid)return false;
    const cards=Array.from(quickGrid.querySelectorAll('.mock-paper-card'));
    if(!cards.length)return false;

    let section=document.querySelector('.mock-tests-section');
    if(!section){
      section=document.createElement('section');
      section.className='mock-tests-section';
      section.setAttribute('aria-labelledby','mock-tests-title');
      section.innerHTML='<div class="section-title"><h2 id="mock-tests-title">Full Mock Tests</h2><p>Ten full-length papers designed around the 47-question, 100-mark examination pattern.</p></div><div class="quick-grid mock-tests-grid"></div>';
      const promo=document.querySelector('.continue-learning');
      if(promo)promo.parentNode.insertBefore(section,promo);
      else quickGrid.parentNode.appendChild(section);
    }

    const mockGrid=section.querySelector('.mock-tests-grid');
    cards.forEach(card=>mockGrid.appendChild(card));
    return true;
  }

  function init(){
    if(arrange())return;
    const dashboard=document.querySelector('#dashboard');
    if(!dashboard)return;
    const observer=new MutationObserver(()=>{
      if(arrange())observer.disconnect();
    });
    observer.observe(dashboard,{childList:true,subtree:true});
    setTimeout(()=>observer.disconnect(),5000);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
  else init();
})();
