/* English Hub 15-E — keep every SPA view pinned to the top when opened. */
(function(){
  'use strict';
  function resetScroll(){
    window.scrollTo(0,0);
    document.documentElement.scrollTop=0;
    document.body.scrollTop=0;
  }
  window.view=function(id){
    document.querySelectorAll('.view').forEach(function(x){x.classList.remove('active');});
    var target=document.getElementById(id);
    if(!target)return;
    target.classList.add('active');
    resetScroll();
    requestAnimationFrame(resetScroll);
  };
})();
