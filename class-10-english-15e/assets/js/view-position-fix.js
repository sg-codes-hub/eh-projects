/* English Hub 15-E — keep every SPA view structurally isolated and pinned to the top. */
(function(){
  'use strict';

  function repairSyllabusStructure(){
    var syllabus=document.getElementById('syllabus');
    var intro=document.getElementById('syllabusIntro');
    var grid=document.getElementById('chapterGrid');
    if(!syllabus||!intro||!grid)return;

    /* The syllabus content must live inside #syllabus; otherwise it remains
       visible when another .view is active. Repair legacy malformed markup
       once at startup without changing any content or functionality. */
    if(!syllabus.contains(intro))syllabus.appendChild(intro);
    if(!syllabus.contains(grid))syllabus.appendChild(grid);
  }

  function resetScroll(){
    window.scrollTo(0,0);
    document.documentElement.scrollTop=0;
    document.body.scrollTop=0;
  }

  window.view=function(id){
    repairSyllabusStructure();
    document.querySelectorAll('.view').forEach(function(x){x.classList.remove('active');});
    var target=document.getElementById(id);
    if(!target)return;
    target.classList.add('active');
    resetScroll();
    requestAnimationFrame(resetScroll);
  };

  document.addEventListener('DOMContentLoaded',function(){
    repairSyllabusStructure();
    resetScroll();
  });
})();
