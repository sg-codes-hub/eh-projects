/* English Hub 15-E — reliable navigation for dynamically rendered student controls. */
(function(){
  'use strict';
  let lastStart={mode:null,options:{}};
  const nativeStart=window.start;
  if(typeof nativeStart==='function'&&!window.__EH_NAV_START_WRAPPED){
    window.start=function(mode,options){
      lastStart={mode:mode,options:options||{}};
      return nativeStart(mode,options||{});
    };
    window.__EH_NAV_START_WRAPPED=true;
  }
  function dashboard(){
    if(typeof window.view==='function')window.view('dashboard');
    else document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id==='dashboard'));
  }
  function retry(){
    if(lastStart.mode==='mock'&&typeof window.start==='function')return window.start('mock',lastStart.options||{});
    if(lastStart.mode==='chapter'&&typeof window.start==='function')return window.start('chapter',lastStart.options||{});
    if(lastStart.mode==='marks'&&typeof window.start==='function')return window.start('marks',lastStart.options||{});
    dashboard();
  }
  document.addEventListener('click',function(e){
    const b=e.target.closest('button');
    if(!b||b.disabled)return;
    const id=b.id;
    if(id==='homeBtn'||id==='resultHomeBtn'||id==='backBtn'||id==='syllabusBackBtn'||id==='quitBtn'){
      e.preventDefault();e.stopImmediatePropagation();dashboard();return;
    }
    if(id==='retryBtn'){
      e.preventDefault();e.stopImmediatePropagation();retry();return;
    }
    if(id==='prevBtn'){
      e.preventDefault();e.stopImmediatePropagation();if(typeof window.previous==='function')window.previous();return;
    }
    if(id==='nextBtn'){
      e.preventDefault();e.stopImmediatePropagation();if(typeof window.next==='function')window.next();return;
    }
  },true);
  window.EnglishHubNavigationFix=true;
})();