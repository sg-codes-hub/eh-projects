/* FINAL MOCK PAPER EXPERIENCE
   - Fixed official Q1-Q47 slot order from blueprint-matrix-2026-27.json.
   - MCQs are only Q1-Q6 and must be Grammar/Language; analogy is its own domain
     even when stored as question_type=mcq in the bank.
   - Renders the entire paper at once for students.
   - Question selection varies by mock paper; slot format never changes.
*/
(function(){
'use strict';
const SLOTS=[
 {a:1,b:6,m:1,d:'grammar_mcq',title:'MCQ — Grammar / Language'},
 {a:7,b:10,m:1,d:'analogy',title:'Analogy'},
 {a:11,b:13,m:1,d:'directed1',title:'Rewrite / Directed Language'},
 {a:14,b:20,m:1,d:'lit1',title:'Literature — Very Short Answers'},
 {a:21,b:27,m:2,d:'lit2',title:'Literature — Short Answers'},
 {a:28,b:30,m:2,d:'directed2',title:'Grammar / Directed Language'},
 {a:31,b:36,m:3,d:'lit3',title:'Literature — Long Answers'},
 {a:37,b:40,m:3,d:'rtc',title:'Reference to Context'},
 {a:41,b:41,m:4,d:'quote',title:'Quote from Memory'},
 {a:42,b:44,m:4,d:'lit4',title:'Literature — Long Answers'},
 {a:45,b:45,m:4,d:'comprehension',title:'Unseen Comprehension'},
 {a:46,b:46,m:5,d:'essay',title:'Essay'},
 {a:47,b:47,m:5,d:'letter',title:'Letter Writing'}
];
const $=id=>document.getElementById(id);
const norm=x=>String(x??'').trim().toLowerCase();
const text=q=>norm([q?.question,q?.prompt,q?.topic,q?.skill,q?.type,q?.question_type,q?.category,q?.bank_group,q?.domain,q?.blueprint_slot].filter(Boolean).join(' '));
const cat=q=>norm(q?.category);
const mod=q=>norm(q?.module||q?.book||'');
const chapter=q=>norm(q?.chapter||'');
const isAnalogy=q=>cat(q)==='analogy'||/analogy|word relationship|relationship/.test(text(q));
const isGrammar=q=>cat(q)==='grammar'||/grammar|vocabulary|language/.test(text(q));
const isMCQ=q=>norm(q?.question_type||q?.type)==='mcq'||Array.isArray(q?.options);
const isSpecial=q=>isAnalogy(q)||isRTC(q)||isQuote(q)||isComp(q)||isEssay(q)||isLetter(q);
const isRTC=q=>/reference to context|reference.*context|rtc/.test(text(q));
const isQuote=q=>/quote from memory|quote.*memory/.test(text(q));
const isComp=q=>!!q?.passage||/unseen passage|comprehension|read.*passage/.test(text(q));
const isEssay=q=>cat(q)==='composition'&&/essay/.test(text(q))||/essay/.test(text(q));
const isLetter=q=>cat(q)==='composition'&&/letter/.test(text(q))||/letter writing/.test(text(q));
const isLit=q=>{
  if(isSpecial(q)||isAnalogy(q)||isGrammar(q)) return false;
  const m=mod(q), c=cat(q);
  return /first flight|footprints without feet|poetry|prose|supplementary|literature/.test(m+' '+c) || !!q.chapter;
};
const isDirected=q=>isGrammar(q)&&!isMCQ(q)&&/voice|reported speech|question formation|parts of speech|sentence transformation|degrees of comparison|simple.*compound|compound.*complex|as directed|rewrite/.test(text(q));
function poolFor(all,d,m){
  const p=all.filter(q=>Number(q.marks)===m);
  if(d==='grammar_mcq') return p.filter(q=>isGrammar(q)&&isMCQ(q)&&!isAnalogy(q));
  if(d==='analogy') return p.filter(q=>isAnalogy(q));
  if(d==='directed1') return p.filter(q=>m===1&&isDirected(q));
  if(d==='directed2') return p.filter(q=>m===2&&isDirected(q));
  if(d==='lit1'||d==='lit2'||d==='lit3'||d==='lit4') return p.filter(q=>isLit(q));
  if(d==='rtc') return p.filter(q=>isRTC(q));
  if(d==='quote') return p.filter(q=>isQuote(q));
  if(d==='comprehension') return p.filter(q=>isComp(q));
  if(d==='essay') return p.filter(q=>isEssay(q));
  if(d==='letter') return p.filter(q=>isLetter(q));
  return [];
}
function seedRand(seed){let x=(seed>>>0)||1;return()=>{x=(1664525*x+1013904223)>>>0;return x/4294967296};}
function shuffle(a,r){const x=[...a];for(let i=x.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[x[i],x[j]]=[x[j],x[i]]}return x;}
function pick(pool,n,used,r){
 let a=shuffle(pool.filter(q=>!used.has(q.id||q.question)),r),out=a.slice(0,n);
 out.forEach(q=>used.add(q.id||q.question));
 if(out.length<n){
   const refill=shuffle(pool,r);let k=0;
   while(out.length<n&&refill.length){const q=refill[k++%refill.length];if(!out.includes(q)){out.push(q);}}
 }
 return out;
}
function build(all,paperNo){
 const r=seedRand(917431+paperNo*10007),used=new Set(),items=[];
 for(const s of SLOTS){const n=s.b-s.a+1,p=poolFor(all,s.d,s.m),got=pick(p,n,used,r);for(let i=0;i<n;i++){items.push({number:s.a,marks:s.m,domain:s.d,title:s.title,q:got[i]||null});s.a++;}}
 return items;
}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function answer(q){return q?.model_answer||q?.answer||q?.explanation||((q?.answer_points||[]).join(' '))||'Model answer not supplied for this item.';}
function ensureStyle(){if($('finalMockStyle'))return;const st=document.createElement('style');st.id='finalMockStyle';st.textContent=`
.final-mock-wrap{max-width:1100px;margin:0 auto;padding:18px 0 60px}.mock-brandline{background:linear-gradient(90deg,#5b35e8,#c53ecb);color:#fff;border-radius:18px;padding:18px 22px;margin-bottom:18px}.mock-brandline b{display:block;font-size:18px}.mock-brandline span{opacity:.9;font-size:13px}.paper-head{background:#fff;border:1px solid #e6e8f0;border-radius:18px;padding:22px;text-align:center;box-shadow:0 8px 28px rgba(35,30,80,.06)}.paper-head h1{margin:4px 0;font-size:28px}.paper-head p{margin:5px 0;color:#667085}.paper-meta{display:flex;justify-content:center;gap:12px;flex-wrap:wrap;margin-top:14px}.paper-meta span{background:#f1efff;border-radius:999px;padding:7px 12px;font-weight:700;font-size:13px}.paper-actions{position:sticky;bottom:12px;z-index:10;display:flex;justify-content:center;gap:10px;padding:12px;background:rgba(255,255,255,.92);backdrop-filter:blur(8px);border:1px solid #e7e8ef;border-radius:16px;margin:18px 0}.paper-section{margin-top:20px}.paper-section-head{padding:13px 16px;border-radius:14px 14px 0 0;background:#17133f;color:#fff;display:flex;justify-content:space-between;gap:10px}.paper-section-head b{font-size:15px}.paper-section-head span{font-size:12px;opacity:.85}.paper-q{background:#fff;border:1px solid #e5e7ef;border-top:0;padding:18px 20px}.paper-q:last-child{border-radius:0 0 14px 14px}.qtop{display:flex;justify-content:space-between;gap:10px;color:#667085;font-weight:700;font-size:13px}.qtext{font-size:17px;line-height:1.55;margin:10px 0 14px;color:#171b2e}.qtag{display:inline-block;padding:5px 9px;border-radius:999px;background:#f2f4f8;margin-right:6px;font-size:11px}.paper-options{display:grid;gap:9px}.paper-options label{border:1px solid #dfe3eb;border-radius:10px;padding:11px 13px;cursor:pointer}.paper-options label:hover{border-color:#7252ed;background:#faf9ff}.paper-answer{width:100%;box-sizing:border-box;border:1px solid #dfe3eb;border-radius:10px;padding:12px;min-height:90px;font:inherit}.answer-actions{margin-top:9px}.model{margin-top:10px;padding:12px;border-radius:10px;background:#f5f7fb;border-left:4px solid #7252ed;line-height:1.55}.paper-submit{font-size:16px;padding:13px 22px}.mock-score{background:#fff;border:1px solid #e5e7ef;border-radius:16px;padding:20px;margin-top:20px;text-align:center}.mock-score b{font-size:30px}.muted{color:#667085}`;document.head.appendChild(st)}
function render(items,no){ensureStyle();const qv=$('quizArea');$('practiceEyebrow').textContent='FULL MOCK TEST';$('practiceTitle').textContent=`Class 10 English 15-E • Mock Paper ${no}`;$('progressText').textContent='47 questions • 100 marks • 3:15 hours';$('progressBar').style.width='0%';$('questionPalette').hidden=true;
 let currentSection='';let html=`<div class="final-mock-wrap"><div class="mock-brandline"><b>PM Shri Adarsha Vidyalaya, Shahapur</b><span>Class 10 • First Language English 15-E • Academic Year 2026–27</span><br><span>Designed by <strong>Sharanu Gogi, English Language Teacher</strong></span></div><div class="paper-head"><div class="muted">FULL MOCK QUESTION PAPER</div><h1>Class 10 First Language English — 15-E</h1><p>Mock Paper ${no}</p><div class="paper-meta"><span>47 Questions</span><span>100 Marks</span><span>3 Hours 15 Minutes</span><span>Follow the official paper order</span></div></div>`;
 items.forEach((it,idx)=>{const q=it.q;if(it.title!==currentSection){currentSection=it.title;html+=`<section class="paper-section"><div class="paper-section-head"><b>${esc(it.title)}</b><span>${it.a||''}</span></div>`}const chapter=q?.chapter||q?.topic||'';const objective=(it.domain==='grammar_mcq'||it.domain==='analogy')&&Array.isArray(q?.options);html+=`<article class="paper-q" data-paper-q="${idx}"><div class="qtop"><span>Q${it.number}</span><span>${it.marks} mark${it.marks>1?'s':''}</span></div><div><span class="qtag">${esc(chapter)}</span><span class="qtag">${esc(it.domain.replaceAll('_',' '))}</span></div><div class="qtext">${esc(q?.question||q?.prompt||'Question not available')}</div>`;
 if(objective){html+=`<div class="paper-options">${q.options.map((o,i)=>`<label><input type="radio" name="mq${idx}" value="${i}"> ${String.fromCharCode(65+i)}. ${esc(o)}</label>`).join('')}</div>`}else{html+=`<textarea class="paper-answer" placeholder="Write your answer here…"></textarea><div class="answer-actions"><button class="secondary-btn reveal-model" type="button">Reveal Model Answer</button></div><div class="model" hidden>${esc(answer(q))}</div>`}html+='</article>';if(idx===items.length-1||items[idx+1].title!==currentSection)html+='</section>'});
 html+=`<div class="paper-actions"><button class="secondary-btn" id="finalMockBack" type="button">← Back</button><button class="primary-btn paper-submit" id="submitFullMock" type="button">Submit / Finish Mock Paper</button></div><div id="mockScore" class="mock-score" hidden></div></div>`;qv.innerHTML=html;
 document.querySelectorAll('.reveal-model').forEach(b=>b.onclick=()=>{const box=b.closest('.paper-q').querySelector('.model');box.hidden=!box.hidden;b.textContent=box.hidden?'Reveal Model Answer':'Hide Model Answer'});
 $('finalMockBack').onclick=()=>{if(typeof window.start==='function'){};viewDashboard()};
 $('submitFullMock').onclick=()=>scorePaper(items);
}
function scorePaper(items){let score=0,max=0,answered=0,auto=0;items.forEach((it,idx)=>{max+=it.marks;const q=it.q;if((it.domain==='grammar_mcq'||it.domain==='analogy')&&Array.isArray(q?.options)){auto+=it.marks;const el=document.querySelector(`input[name="mq${idx}"]:checked`);if(el){answered++;if(Number(el.value)===Number(q.answer))score+=it.marks;}}});const box=$('mockScore');box.hidden=false;box.innerHTML=`<b>${score}/${auto}</b><p>Auto-scored marks from objective questions. Written-answer sections should be checked using the model answers above.</p><p class="muted">Paper total: ${max}/100 • Objective marks available: ${auto}</p>`;box.scrollIntoView({behavior:'smooth',block:'center'});}
function viewDashboard(){document.querySelectorAll('.view').forEach(x=>x.classList.remove('active'));const d=$('dashboard');if(d)d.classList.add('active');window.scrollTo({top:0,behavior:'smooth'})}
async function openMock(no){
 try{const all=Array.isArray(window.EnglishHubQuestions)?window.EnglishHubQuestions:await window.QuestionBankLoader.loadAll();if(!all||!all.length){alert('Question bank is still loading. Please wait a moment and try again.');return;}const items=build(all,no);const valid=items.length===47&&items.reduce((s,x)=>s+x.marks,0)===100;if(!valid){alert('Mock generation failed its 47-question / 100-mark safety check. No incomplete paper was opened.');return;}
  window.__EH_FINAL_MOCK_ITEMS=items;window.__EH_FINAL_MOCK_NO=no;clearInterval(window.__ehMockTimer);document.querySelectorAll('.view').forEach(x=>x.classList.remove('active'));$('practice').classList.add('active');render(items,no);window.scrollTo({top:0,behavior:'smooth'});
 }catch(e){console.error(e);alert('Unable to load the complete question bank. Please refresh once and try again.');}
}
function intercept(){document.addEventListener('click',function(e){const b=e.target.closest('.mock-paper-card');if(!b)return;e.preventDefault();e.stopImmediatePropagation();const no=Number(b.dataset.paper)||1;openMock(no)},true)}
function boot(){intercept();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
