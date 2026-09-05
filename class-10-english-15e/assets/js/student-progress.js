(()=>{
'use strict';
const KEY='eh15e-student-progress-v1';
const load=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return {}}};
const save=p=>{try{localStorage.setItem(KEY,JSON.stringify(p))}catch{}};
const update=patch=>{const p={...load(),...patch,lastUpdated:Date.now()};save(p);return p};
window.EHProgress={
 get:load,
 clear:()=>localStorage.removeItem(KEY),
 markQuestion:(q,answer)=>{const p=load(), id=String(q.id||`${q.module||''}|${q.chapter||''}|${q.question||q.prompt||''}`);const attempted={...(p.attempted||{})};attempted[id]={chapter:q.chapter||'',module:q.module||'',marks:q.marks||0,correct:!!answer.correct,lastSeen:Date.now()};return update({attempted});},
 saveSession:state=>{if(!state?.questions?.length)return;return update({resume:{mode:state.mode,title:state.title||'',i:state.i||0,marksFilter:state.marksFilter,module:state.questions[0]?.module||'',chapter:state.questions[0]?.chapter||'',savedAt:Date.now()}})},
 clearSession:()=>{const p=load();delete p.resume;save(p)},
 getStats:()=>{const p=load(),a=Object.values(p.attempted||{});return {attempted:a.length,correct:a.filter(x=>x.correct).length,wrong:a.filter(x=>x.correct===false).length}},
};
const resumeCard=()=>{const p=load(),r=p.resume;if(!r)return null;const age=Date.now()-Number(r.savedAt||0);if(age>30*24*60*60*1000)return null;const el=document.createElement('section');el.className='resume-progress-card';el.innerHTML=`<div class="rp-icon">🎯</div><div class="rp-main"><span class="eyebrow">CONTINUE PRACTISING</span><h2>${String(r.title||r.chapter||'Your practice').replace(/[<>&\"']/g,'')}</h2><p>You stopped at question ${Number(r.i||0)+1}. Continue where you left off.</p></div><button class="primary-btn" type="button" id="resumeProgressBtn">Continue →</button>`;return {el,r};};
function inject(){const dashboard=document.getElementById('dashboard'),hero=dashboard?.querySelector('.hero');if(!dashboard||!hero||document.getElementById('resumeProgressCard'))return;const x=resumeCard();if(!x)return;x.el.id='resumeProgressCard';hero.insertAdjacentElement('afterend',x.el);x.el.querySelector('#resumeProgressBtn').onclick=()=>{if(typeof window.resumeStudentProgress==='function')window.resumeStudentProgress(x.r)};}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',inject);else inject();
window.addEventListener('eh15e:progress-changed',inject);
})();