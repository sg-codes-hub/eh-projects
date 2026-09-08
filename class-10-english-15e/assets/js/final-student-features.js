/* English Hub 15-E — student-facing finishing touches and answer-quality guard. */
(function(){
  const RULES_URL='data/grammar-rules.json?v=20260905-19';
  let rules=[];
  const low=v=>String(v??'').toLowerCase().replace(/\s+/g,' ').trim();
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clean=v=>low(v).replace(/[“”‘’'".,!?;:()]/g,'');

  function currentQuestion(){
    const card=document.querySelector('#quizArea .question-card');
    if(!card)return null;
    return {text:low(card.querySelector('.question-text')?.textContent||''),meta:low(card.querySelector('.question-meta')?.textContent||'')};
  }

  function ruleForCurrent(){
    const q=currentQuestion();if(!q)return null;const s=q.text+' '+q.meta;
    if(/analogy|relationship.*complete|complete.*pair|observe the relationship/.test(s))return rules.find(x=>x.key==='analogy');
    if(/reported|indirect speech/.test(s))return rules.find(x=>x.key==='reported')||rules.find(x=>x.key==='rewrite');
    if(/active.*passive|passive.*active|voice/.test(s))return rules.find(x=>x.key==='voice')||rules.find(x=>x.key==='rewrite');
    if(/degree of comparison|comparative|superlative|positive degree/.test(s))return rules.find(x=>x.key==='degree')||rules.find(x=>x.key==='rewrite');
    if(/tense|simple present|simple past|present perfect|future/.test(s))return rules.find(x=>x.key==='tense')||rules.find(x=>x.key==='mcq');
    if(/preposition/.test(s))return rules.find(x=>x.key==='preposition')||rules.find(x=>x.key==='mcq');
    if(/subject.*verb|agreement/.test(s))return rules.find(x=>x.key==='agreement')||rules.find(x=>x.key==='mcq');
    if(/rewrite|as directed|transformation/.test(s))return rules.find(x=>x.key==='rewrite');
    if(/grammar|vocabulary/.test(q.meta))return rules.find(x=>x.key==='mcq');
    return null;
  }

  function addRule(){
    const area=document.getElementById('quizArea');if(!area||area.querySelector('.grammar-rule-card'))return;
    const r=ruleForCurrent();if(!r)return;
    const card=document.createElement('div');card.className='grammar-rule-card';
    card.innerHTML=`<div class="grammar-rule-head"><span>GRAMMAR HELP</span><b>${esc(r.title)}</b></div><p>${esc(r.rule)}</p><div class="grammar-tip"><strong>Exam tip:</strong> ${esc(r.tip)}</div>`;
    const questionCard=area.querySelector('.question-card');const actions=area.querySelector('.question-actions');
    if(questionCard)questionCard.insertBefore(card,actions||questionCard.lastElementChild);
  }

  async function loadRules(){
    try{const r=await fetch(RULES_URL,{cache:'no-store'});if(r.ok){const j=await r.json();rules=j.rules||[];}}
    catch(e){console.warn('Grammar rules unavailable',e);}
  }

  async function findSourceAnswer(questionText){
    const target=clean(questionText);if(!target)return null;
    let all=window.EnglishHubQuestions||window.qs;
    try{if((!Array.isArray(all)||!all.length)&&window.QuestionBankLoader)all=await window.QuestionBankLoader.loadAll();}catch(e){}
    if(!Array.isArray(all))return null;
    const q=all.find(x=>clean(x.question||x.prompt||x.text)===target)||all.find(x=>{const t=clean(x.question||x.prompt||x.text);return t&&target.length>40&&(t.includes(target)||target.includes(t));});
    if(!q)return null;
    const ans=q.model_answer||q.answer||((q.answer_points||[]).join(' '))||q.explanation;
    return ans?String(ans):null;
  }

  async function repairFallbackAnswers(){
    const fallback='Model answer not supplied for this item.';
    const nodes=[...document.querySelectorAll('#modelAnswer p,.review-detail .feedback p,.mock-or .feedback p')];
    for(const node of nodes){
      if(low(node.textContent)!==low(fallback))continue;
      const card=node.closest('.question-card,.review-detail,.mock-or');
      const question=card?.querySelector('.question-text,h3')?.textContent||'';
      const answer=await findSourceAnswer(question);
      if(answer){node.textContent=answer;}
    }
  }

  function isLetterContext(el){
    const host=el.closest('.question-card,.review-card,.review-detail,.mock-or')||el.parentElement;
    const text=low(host?.textContent||'');
    return /letter writing|write a letter|letter to|informal letter|formal letter/.test(text);
  }

  /* Letter answers are stored as answer text, but the student UI must teach the
     examination layout. Convert the standard labelled template into explicit
     line/paragraph breaks without changing its wording. */
  function formatLetterText(value){
    let s=String(value||'').replace(/\r\n?/g,'\n').trim();
    if(!s)return s;
    s=s.replace(/\s+/g,' ');
    s=s.replace(/\s+(To\s+)/i,'\n\n$1');
    s=s.replace(/\s+(Subject\s*:\s*)/i,'\n$1');
    s=s.replace(/\s+(Sir\/Madam,|Sir,|Madam,|Dear\s+[^,]+,)/i,'\n\n$1');
    s=s.replace(/\s+(Yours\s+(?:faithfully|sincerely|lovingly),?)/i,'\n\n$1');
    s=s.replace(/(\bYours\s+(?:faithfully|sincerely|lovingly),?)(?:\s+)/i,'$1\n');
    /* Separate the common sender block when placeholders are used. */
    s=s.replace(/^(\[[^\]]+\])\s+(\[[^\]]+\])\s+(\[[^\]]+\])\s+/,'$1\n$2\n$3\n\n');
    /* Keep the salutation/body/closing readable even when the source answer is one line. */
    s=s.replace(/(Sir\/Madam,|Sir,|Madam,|Dear\s+[^,]+,)\s+/i,'$1\n\n');
    s=s.replace(/\s+(Kindly\s+take|I\s+request|I\s+am\s+a|Thank\s+you|Please\s+)/i,'\n$1');
    return s.replace(/\n{3,}/g,'\n\n').trim();
  }

  function formatLetterAnswers(){
    const selectors=['#modelAnswer p','.review-detail .feedback p','.mock-or .feedback p','.pp-answer'];
    document.querySelectorAll(selectors.join(',')).forEach(node=>{
      if(node.dataset.letterFormatted==='1'||!isLetterContext(node))return;
      const raw=node.textContent||'';
      const formatted=formatLetterText(raw);
      if(formatted!==raw){
        node.textContent=formatted;
        node.style.whiteSpace='pre-line';
      }
      node.dataset.letterFormatted='1';
    });
  }

  function shareScore(){
    const score=document.getElementById('scoreValue')?.textContent||'0';
    const total=(document.getElementById('scoreTotal')?.textContent||'/ 100').replace(/^\s*\/\s*/,'');
    const title=document.getElementById('resultTitle')?.textContent||'Mock Test Result';
    const text=`I scored ${score}/${total} in ${title} on ENGLISH HUB — Class 10 English 15-E. Can you beat my score?`;
    const url=location.href;
    if(navigator.share){navigator.share({title:'ENGLISH HUB — My Score',text,url}).catch(()=>{});return;}
    if(navigator.clipboard){navigator.clipboard.writeText(`${text}\n${url}`).then(()=>alert('Score message copied. You can paste it into WhatsApp, Telegram or another app.')).catch(()=>alert(text));}
    else alert(text);
  }

  function ensureShare(){
    const actions=document.querySelector('.result-actions');if(!actions||actions.querySelector('.share-score-btn'))return;
    const b=document.createElement('button');b.type='button';b.className='secondary-btn share-score-btn';b.textContent='↗ Share My Score';b.addEventListener('click',shareScore);actions.insertBefore(b,actions.firstChild);
  }

  function watch(){
    new MutationObserver(()=>{ensureShare();addRule();repairFallbackAnswers();formatLetterAnswers();}).observe(document.body,{childList:true,subtree:true});
    setTimeout(()=>{ensureShare();addRule();repairFallbackAnswers();formatLetterAnswers();},300);
  }

  window.addEventListener('load',()=>{loadRules().then(()=>{addRule();repairFallbackAnswers();formatLetterAnswers();});watch();});
})();
