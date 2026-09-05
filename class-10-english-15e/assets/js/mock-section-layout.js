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
    let heading=document.querySelector('#full-mock-tests-heading');

    if(!heading){
      heading=document.createElement('div');
      heading.id='full-mock-tests-heading';
      heading.className='section-title mock-tests-heading';
      heading.innerHTML='<h2 id="mock-tests-title">Full Mock Tests</h2><p>Ten full-length papers designed around the 47-question, 100-mark examination pattern.</p>';
    }

    if(!section){
      section=document.createElement('section');
      section.id='full-mock-tests-section';
      section.className='mock-tests-section';
      section.setAttribute('aria-labelledby','mock-tests-title');
      section.innerHTML='<div class="quick-grid mock-tests-grid"></div>';

      /* Put the standalone heading and mock grid immediately after Quick Exam Practice. */
      const promo=document.querySelector('.continue-learning');
      if(promo){
        promo.parentNode.insertBefore(heading,promo);
        promo.parentNode.insertBefore(section,promo);
      }else{
        dashboard.appendChild(heading);
        dashboard.appendChild(section);
      }
    }else{
      /* Repair older DOM/CSS states: heading must be a sibling before the card section. */
      if(heading.parentNode!==dashboard)dashboard.appendChild(heading);
      const promo=document.querySelector('.continue-learning');
      if(promo && heading.parentNode===dashboard && heading.nextElementSibling!==section){
        promo.parentNode.insertBefore(heading,promo);
        promo.parentNode.insertBefore(section,promo);
      }
      if(section.contains(heading))heading.remove();
      if(section.previousElementSibling!==heading)section.parentNode.insertBefore(heading,section);
    }

    const mockGrid=section.querySelector('.mock-tests-grid');
    if(!mockGrid)return false;

    /* Move every generated mock card out of Quick Exam Practice. */
    cards.forEach(card=>mockGrid.appendChild(card));

    /* Safety cleanup: no mock card is allowed to remain in the original quick grid. */
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
    timer=setInterval(()=>{
      attempts++;
      if(arrange()||attempts>=48){clearInterval(timer);observer.disconnect();}
    },250);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',watch);
  else watch();
})();
