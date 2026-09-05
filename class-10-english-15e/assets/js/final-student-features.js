/* English Hub 15-E — student-facing finishing touches. */
(function(){
  const RULES_URL='data/grammar-rules.json?v=20260905-16';
  let rules=[];
  const low=v=>String(v??'').toLowerCase();
  function isGrammarQuestion(q){
    const s=low([q?.module,q?.bank_group,q?.type,q?.question_type,q?.skill,q?.category,q?.question,q?.prompt].join(' '));
    return /grammar|vocabulary|analogy|rewrite|reported speech|indirect speech|active.*passive|passive.*active|degree of comparison|transformation|as directed/.test(s);
  }
  function ruleFor(q){
    const s=low([q?.type,q?.question_type,q?.skill,q?.category,q?.question,q?.prompt].join(' '));
    if(/analogy|relationship.*complete|complete.*pair/.test(s))return rules.find(x=>x.key==='analogy');
    if(/reported|indirect/.test(s))return rules.find(x=>x.key==='reported')||rules.find(x=>x.key==='rewrite');
    if(/voice|active.*passive|passive.*active/.test(s))return rules.find(x=>x.key==='voice')||rules.find(x=>x.key==='rewrite');
    if(/degree/.test(s))return rules.find(x=>x.key==='degree')||rules.find(x=>x.key==='rewrite');
    if(/tense/.test(s))return rules.find(x=>x.key==='tense')||rules.find(x=>x.key==='rewrite');
    if(/article/.test(s))return rules.find(x=>x.key==='article')||rules.find(x=>x.key==='mcq');
    if(/preposition/.test(s))return rules.find(x=>x.key==='preposition')||rules.find(x=>x.key==='mcq');
    if(/agreement|subject.*verb/.test(s))return rules.find(x=>x.key==='agreement')||rules.find(x=>x.key==='mcq');
    if(/rewrite|as directed|transformation/.test(s))return rules.find(x=>x.key==='rewrite');
    if(/mcq/.test(s)&&/grammar|vocabulary/.test(s))return rules.find(x=>x.key==='mcq');
    return null;
  }
  function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function addRule(){
    const q=window.state?.questions?.[window.state?.i];
    if(!q||!isGrammarQuestion(q))return;
    const r=ruleFor(q);if(!r)return;
    const card=document.createElement('div');card.className='grammar-rule-card';card.innerHTML=`<div class="grammar-rule-head"><span>GRAMMAR HELP</span><b>${esc(r.title)}</b></div><p>${esc(r.rule)}</p><div class="grammar-tip"><strong>Exam tip:</strong> ${esc(r.tip)}</div>`;
    const area=document.getElementById('quizArea');const questionCard=area?.querySelector('.question-card');const feedback=area?.querySelector('#feedback');
    if(questionCard)questionCard.insertBefore(card,feedback||questionCard.lastElementChild);
  }
  async function loadRules(){try{const r=await fetch(RULES_URL,{cache:'no-store'});if(r.ok){const j=await r.json();rules=j.rules||[];}}catch(e){console.warn('Grammar rules unavailable',e);}}
  function shareScore(){
    const score=document.getElementById('scoreValue')?.textContent||'0';
    const total=(document.getElementById('scoreTotal')?.textContent||'/ 100').replace(/^\s*\/\s*/, '');
    const title=document.getElementById('resultTitle')?.textContent||'Mock Test Result';
    const text=`I scored ${score}/${total} in ${title} on English Hub — Class 10 English 15-E. Can you beat my score?`;
    const url=location.href;
    if(navigator.share){navigator.share({title:'English Hub — My Score',text,url}).catch(()=>{});return;}
    if(navigator.clipboard){navigator.clipboard.writeText(`${text}\n${url}`).then(()=>alert('Score message copied. You can paste it into WhatsApp, Instagram, Telegram or any other app.')).catch(()=>alert(text));}
    else alert(text);
  }
  function ensureShare(){
    const actions=document.querySelector('.result-actions');if(!actions||actions.querySelector('.share-score-btn'))return;
    const b=document.createElement('button');b.type='button';b.className='secondary-btn share-score-btn';b.textContent='↗ Share My Score';b.addEventListener('click',shareScore);actions.insertBefore(b,actions.firstChild);
  }
  function watch(){
    const root=document.body;new MutationObserver(()=>{ensureShare();addRule();}).observe(root,{childList:true,subtree:true});
    setTimeout(()=>{ensureShare();addRule();},200);
  }
  window.addEventListener('load',()=>{loadRules().then(()=>addRule());watch();});
})();