/* Eye-catching end-of-paper navigation for every Previous Year Question Paper. */
(function(){
  'use strict';

  function install(){
    if(document.getElementById('previousPaperEndButtonStyle'))return;
    const style=document.createElement('style');
    style.id='previousPaperEndButtonStyle';
    style.textContent=`
      #previous-paper-view .pp-end-navigation{display:flex;justify-content:center;align-items:center;margin:0;padding:28px 18px 32px;background:linear-gradient(135deg,#fffdf0,#fff4b8);border-top:1px solid #eadf9b}
      #previous-paper-view .pp-end-back{display:inline-flex;align-items:center;justify-content:center;gap:9px;min-width:240px;padding:13px 24px;border:2px solid #343434;border-radius:999px;background:#343434;color:#ffd92a;font:inherit;font-size:14px;font-weight:800;line-height:1.2;cursor:pointer;box-shadow:0 8px 18px rgba(52,52,52,.18);transition:transform .18s ease,box-shadow .18s ease,background .18s ease}
      #previous-paper-view .pp-end-back:hover{transform:translateY(-2px);box-shadow:0 12px 24px rgba(52,52,52,.24);background:#222}
      #previous-paper-view .pp-end-back:active{transform:translateY(0);box-shadow:0 5px 12px rgba(52,52,52,.16)}
      #previous-paper-view .pp-end-back .pp-end-arrow{font-size:18px;line-height:1}
      @media(max-width:600px){#previous-paper-view .pp-end-navigation{padding:22px 14px 26px}#previous-paper-view .pp-end-back{width:100%;min-width:0;padding:12px 18px}}
    `;
    document.head.appendChild(style);
  }

  function addButton(){
    const view=document.querySelector('#previous-paper-view');
    const paperView=view&&view.querySelector('.previous-paper-view');
    if(!paperView||paperView.querySelector('.pp-end-navigation'))return;
    const topBack=paperView.querySelector('.previous-paper-back');
    if(!topBack)return;

    const nav=document.createElement('div');
    nav.className='pp-end-navigation';
    nav.innerHTML='<button class="pp-end-back" type="button"><span class="pp-end-arrow">←</span><span>Back to Previous Papers</span></button>';
    nav.querySelector('.pp-end-back').addEventListener('click',()=>topBack.click());
    paperView.appendChild(nav);
  }

  function start(){
    install();
    addButton();
    const observer=new MutationObserver(addButton);
    observer.observe(document.body,{childList:true,subtree:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
