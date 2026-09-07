/* Generic previous-paper numbering guard: a single numbered question may contain OR alternatives. */
(function(){
  'use strict';
  const sectionStarts={I:1,II:7,III:11,IV:14,V:21,VI:28,VII:31,VIII:37,IX:41,X:42,XI:45,XII:46,XIII:47};
  const paperIds={'2025 Exam–1':'2025-exam-1','2025 Exam–2':'2025-exam-2','2025 Exam–3':'2025-exam-3'};
  let busy=false;

  function text(el){return (el&&el.textContent||'').trim()}
  function escapeHtml(s){return String(s??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]))}
  function installAnswerFormatting(){
    if(document.getElementById('previousPaperAnswerFormatting'))return;
    const style=document.createElement('style');
    style.id='previousPaperAnswerFormatting';
    style.textContent=`#previous-paper-view .pp-answer{white-space:pre-wrap!important;line-height:1.7!important}#previous-paper-view .pp-answer strong{display:inline;font-weight:800}#previous-paper-view .pp-question{white-space:normal}#previous-paper-view .pp-letter-answer{font-family:inherit}`;
    document.head.appendChild(style);
  }

  async function repair(view){
    if(busy||view.dataset.numberingFixed==='1')return;
    const sections=Array.from(view.querySelectorAll('.previous-paper-section'));
    if(!sections.length)return;
    busy=true;
    try{
      installAnswerFormatting();
      const title=text(view.querySelector('.previous-paper-top h2'));
      const paperId=paperIds[title];
      let solution=null;
      if(paperId){
        try{
          const r=await fetch('data/previous-papers-2025-solutions.json?v=20260907-07',{cache:'no-store'});
          if(r.ok){const all=await r.json();solution=all.papers&&all.papers[paperId]}
        }catch(e){console.warn('Numbering-fix solution lookup failed',e)}
      }

      sections.forEach(section=>{
        const head=section.querySelector('.previous-paper-section-head b');
        const m=text(head).match(/^Section\s+([IVX]+)\s+—/);
        if(!m)return;
        const roman=m[1];
        const start=sectionStarts[roman];
        if(!start)return;
        const countText=text(section.querySelector('.previous-paper-section-head span'));
        const countMatch=countText.match(/^(\d+)\s×/);
        const declaredCount=countMatch?Number(countMatch[1]):null;
        let items=Array.from(section.querySelectorAll(':scope > .previous-paper-item'));

        /* If the source declares one question but stores multiple OR alternatives as items,
           combine them into one displayed question. This makes the renderer safe for future papers too. */
        if(declaredCount===1 && items.length>1){
          const first=items[0];
          const questionParts=items.map(item=>text(item.querySelector('.pp-question'))).filter(Boolean);
          const q=first.querySelector('.pp-question');
          if(q){
            q.innerHTML=questionParts.map((part,i)=>`${i?'b':'a'}) ${escapeHtml(part).replace(/^[ab]\)\s*/i,'')}`).join('<br><strong>OR</strong><br>');
          }
          items.slice(1).forEach(item=>item.remove());
          items=[first];
        }

        items=Array.from(section.querySelectorAll(':scope > .previous-paper-item'));
        items.forEach((item,index)=>{
          const qno=start+index;
          const q=item.querySelector('.pp-qno');
          if(q)q.textContent='Q'+qno;

          /* Rebuild a missing answer from the verified v3 solution set. */
          if(solution&&solution.answers&&qno<=solution.answers.length&&!item.querySelector('.pp-solution')){
            const ans=solution.answers[qno-1];
            if(ans){
              const details=document.createElement('details');details.className='pp-solution';
              const summary=document.createElement('summary');summary.textContent='View model answer';
              const body=document.createElement('div');body.className='pp-answer';body.innerHTML='<strong>Model Answer:</strong> '+escapeHtml(ans);
              details.append(summary,body);item.appendChild(details);
            }
          }
        });
      });
      view.dataset.numberingFixed='1';
    }finally{busy=false}
  }

  const observer=new MutationObserver(()=>{
    const view=document.querySelector('#previous-paper-view');
    if(view)repair(view);
  });
  function start(){
    installAnswerFormatting();
    observer.observe(document.body,{childList:true,subtree:true});
    const view=document.querySelector('#previous-paper-view');if(view)repair(view);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
