(()=>{
'use strict';
const KEY='eh15e-student-progress-v1';
const load=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return {}}};
const save=p=>{try{localStorage.setItem(KEY,JSON.stringify(p))}catch{}};
const update=patch=>{const p={...load(),...patch,lastUpdated:Date.now()};save(p);return p};
const esc=s=>String(s??'').replace(/[<>&\"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','\"':'&quot;',"'":'&#39;'}[c]));
window.EHProgress={
 get:load,
 clear:()=>localStorage.removeItem(KEY),
 markQuestion:(q,answer)=>{const p=load(),id=String(q.id||`${q.module||''}|${q.chapter||''}|${q.question||q.prompt||''}`),attempted={...(p.attempted||{})};attempted[id]={chapter:q.chapter||'',module:q.module||'',marks:q.marks||0,correct:!!answer.correct,lastSeen:Date.now()};return update({attempted});},
 saveSession:r=>update({resume:{...r,savedAt:Date.now()}}),
 clearSession:()=>{const p=load();delete p.resume;save(p)},
 getStats:()=>{const p=load(),a=Object.values(p.attempted||{});return {attempted:a.length,correct:a.filter(x=>x.correct).length,wrong:a.filter(x=>x.correct===false).length}}
};
function currentSession(){
 const practice=document.getElementById('practice'), title=document.getElementById('practiceTitle'), progress=document.getElementById('progressText');
 if(!practice||!practice.classList.contains('active'))return null;
 const m=(progress?.textContent||'').match(/Question\s+(\d+)\s+of\s+(\d+)/i);
 const pills=[...document.querySelectorAll('#quizArea .question-meta .pill')].map(x=>x.textContent.trim()).filter(Boolean);
 return {mode:(document.getElementById('practiceEyebrow')?.textContent||'').includes('MOCK')?'mock':'practice',title:title?.textContent||'',i:m?Math.max(0,+m[1]-1):0,total:m?+m[2]:0,module:pills[0]||'',chapter:pills[1]||''};
}
function saveCurrent(){const r=currentSession();if(r)window.EHProgress.saveSession(r);}
function installWiring(){
 if(window.__ehProgressWired)return;
 if(typeof window.start!=='function')return;
 window.__ehProgressWired=true;
 const originalStart=window.start;
 window.start=function(mode,o={}){window.EHProgress.clearSession();const result=originalStart.apply(this,arguments);setTimeout(saveCurrent,30);return result;};
 ['next','previous'].forEach(name=>{if(typeof window[name]==='function'){const fn=window[name];window[name]=function(){const r=fn.apply(this,arguments);setTimeout(saveCurrent,30);return r;};}});
 document.addEventListener('click',e=>{if(e.target.closest('#nextBtn,#prevBtn,[data-p]'))setTimeout(saveCurrent,40);if(e.target.closest('#quitBtn,#homeBtn,#backBtn,#syllabusBackBtn'))setTimeout(()=>window.EHProgress.clearSession(),40);});
}
function resumeStudentProgress(r){
 if(!r)return;
 if(r.mode==='mock'&&typeof window.start==='function'){window.start('mock');return;}
 const module=r.module,chapter=r.chapter;
 if(!module||!chapter||typeof window.start!=='function')return;
 window.start('chapter',{module,chapter,title:r.title||chapter});
 let remaining=Number(r.i||0);
 const advance=()=>{if(remaining<=0)return;const b=document.getElementById('nextBtn');if(!b)return;remaining--;b.click();setTimeout(advance,25)};
 setTimeout(advance,100);
}
window.resumeStudentProgress=resumeStudentProgress;
function resumeCard(){const p=load(),r=p.resume;if(!r)return null;const age=Date.now()-Number(r.savedAt||0);if(age>30*24*60*60*1000)return null;const el=document.createElement('section');el.className='resume-progress-card';el.innerHTML=`<div class="rp-icon">🎯</div><div class="rp-main"><span class="eyebrow">CONTINUE PRACTISING</span><h2>${esc(r.title||r.chapter||'Your practice')}</h2><p>You stopped at question ${Number(r.i||0)+1}${r.total?' of '+r.total:''}. Continue where you left off.</p></div><button class="primary-btn" type="button" id="resumeProgressBtn">Continue →</button>`;return {el,r};}
function inject(){const dashboard=document.getElementById('dashboard'),hero=dashboard?.querySelector('.hero');if(!dashboard||!hero)return;installWiring();if(document.getElementById('resumeProgressCard'))return;const x=resumeCard();if(!x)return;x.el.id='resumeProgressCard';hero.insertAdjacentElement('afterend',x.el);x.el.querySelector('#resumeProgressBtn').onclick=()=>resumeStudentProgress(x.r);}
function boot(){installWiring();inject();setTimeout(installWiring,300);setTimeout(inject,500);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();