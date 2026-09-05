(()=>{
  const init=()=>{
    const practice=document.getElementById('practice');
    if(!practice||document.getElementById('prevQuestionBtn')) return;
    const actions=document.getElementById('quizArea');
    if(!actions) return;
    const mo=new MutationObserver(()=>{
      const next=document.getElementById('nextBtn');
      if(!next||document.getElementById('prevQuestionBtn')) return;
      const btn=document.createElement('button');
      btn.id='prevQuestionBtn';btn.type='button';btn.className='secondary-btn';btn.textContent='← Previous';
      btn.addEventListener('click',()=>{
        if(window.state && Number.isInteger(window.state.i) && window.state.i>0){window.state.i--;window.draw?.();return;}
        const ev=new CustomEvent('eh15e-previous-question');document.dispatchEvent(ev);
      });
      next.parentNode.insertBefore(btn,next);
      const sync=()=>{btn.disabled=!(window.state&&Number.isInteger(window.state.i)&&window.state.i>0)};
      sync();
      const timer=setInterval(()=>{if(!document.body.contains(btn)){clearInterval(timer);return}sync()},200);
    });
    mo.observe(actions,{childList:true,subtree:true});
  };
  init();
})();