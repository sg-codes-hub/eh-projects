/* Fix question numbering when a single numbered question contains OR alternatives, and preserve formatted model answers. */
(function(){
  'use strict';
  const sectionStarts={I:1,II:7,III:11,IV:14,V:21,VI:28,VII:31,VIII:37,IX:41,X:42,XI:45,XII:46,XIII:47};
  const paperIds={'2025 Exam–1':'2025-exam-1','2025 Exam–2':'2025-exam-2','2025 Exam–3':'2025-exam-3'};
  let busy=false;

  function text(el){return (el&&el.textContent||'').trim()}
  function escapeHtml(s){return String(s??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]))}
  function installAnswerFormatting(){
    if(document.getElementById('previous-paper-answer-formatting'))return;
    const style=document.createElement('style');style.id='previous-paper-answer-formatting';
    style.textContent='.pp-answer{white-space:pre-line!important;line-height:1.7!important}.pp-answer strong{font-weight:800}.pp-answer br{line-height:1.7}';
    document.head.appendChild(style);
  }

  async function repair(view){
    installAnswerFormatting();
    if(busy||view.dataset.numberingFixed==='1')return;
    const sections=Array.from(view.querySelectorAll('.previous-paper-section'));
    if(!sections.length)return;
    busy=true;
    try{
      const title=text(view.querySelector('.previous-paper-top h2'));
      const paperId=paperIds[title];
      let solution=null;
      if(paperId){
        try{
          const r=await fetch('data/previous-papers-2025-solutions.json?v=20260907-06',{cache:'no-store'});
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
        const items=Array.from(section.querySelectorAll(':scope > .previous-paper-item'));

        /* Section XII is question 46 with two OR alternatives, not two questions. */
        if(roman==='XII' && items.length>1){
          const first=items[0], second=items[1];
          const q1=first.querySelector('.pp-question'),q2=second.querySelector('.pp-question');
          if(q1&&q2){q1.innerHTML='a) '+escapeHtml(text(q1)).replace(/^a\)\s*/i,'')+'<br><strong>OR</strong><br>b) '+escapeHtml(text(q2)).replace(/^b\)\s*/i,'');}
          second.remove();
        }

        const currentItems=Array.from(section.querySelectorAll(':scope > .previous-paper-item'));
        currentItems.forEach((item,index)=>{
          const qno=start+index;
          const q=item.querySelector('.pp-qno');
          if(q)q.textContent='Q'+qno;

          /* If an answer was lost because the old numbering reached Q48, restore it from v3. */
          if(solution&&solution.answers&&qno<=solution.answers.length&&!item.querySelector('.pp-solution')){
            const ans=solution.answers[qno-1];
            if(ans){
              const details=document.createElement('details');details.className='pp-solution';
              const summary=document.createElement('summary');summary.textContent='View model answer';
              const body=document.createElement('div');body.className='pp-answer';body.innerHTML='<strong>Model Answer:</strong> '+escapeHtml(ans).replace(/\n/g,'<br>');
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
