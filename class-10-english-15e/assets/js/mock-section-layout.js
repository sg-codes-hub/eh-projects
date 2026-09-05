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

    if(!section){
      section=document.createElement('section');
      section.id='full-mock-tests-section';
      section.className='mock-tests-section';
      section.setAttribute('aria-labelledby','mock-tests-title');
      section.innerHTML='<div class="mock-tests-heading"><div class="section-title"><h2 id="mock-tests-title">Full Mock Tests</h2><p>Ten full-length papers designed around the 47-question, 100-mark examination pattern.</p></div></div><div class="quick-grid mock-tests-grid"></div>';

      const promo=document.querySelector('.continue-learning');
      if(promo)promo.parentNode.insertBefore(section,promo);
      else dashboard.appendChild(section);
    }

    const mockGrid=section.querySelector('.mock-tests-grid');
    if(!mockGrid)return false;
    cards.forEach(card=>mockGrid.appendChild(card));
    quickGrid.querySelectorAll('.mock-paper-card').forEach(card=>card.remove());
    return !!mockGrid.querySelector('.mock-paper-card');
  }

  function watch(){
    if(arrange())return;
    const dashboard=document.querySelector('#dashboard');
    if(!dashboard)return;
    const observer=new MutationObserver(()=>arrange());
    observer.observe(dashboard,{childList:true,subtree:true});
    let attempts=0;
    timer=setInterval(()=>{attempts++;if(arrange()||attempts>=48){clearInterval(timer);observer.disconnect();}},250);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',watch);else watch();
})();
