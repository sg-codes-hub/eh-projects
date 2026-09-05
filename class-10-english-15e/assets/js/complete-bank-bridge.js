/* Bridge: replaces the legacy early-return loader with an always-complete manifest loader. */
(function(){
const rawFetch=window.fetch.bind(window);
async function loadComplete(){
 if(window.__EH_COMPLETE_BANK_READY&&Array.isArray(window.EnglishHubQuestions)&&window.EnglishHubQuestions.length)return window.EnglishHubQuestions;
 const manifest=await rawFetch('data/banks/manifest.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('manifest '+r.status);return r.json()});
 const base=await rawFetch('data/questions.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('core '+r.status);return r.json()});
 const all=Array.isArray(base.questions)?base.questions.slice():[],failed=[];
 for(const name of(Array.isArray(manifest.banks)?manifest.banks:[])){try{const r=await rawFetch(`data/banks/${name}`,{cache:'no-store'});if(!r.ok){failed.push(`${name} (${r.status})`);continue}const b=await r.json(),arr=Array.isArray(b)?b:b.questions;if(Array.isArray(arr))all.push(...arr)}catch(e){failed.push(name)}}
 const seen=new Set(),merged=[];
 for(const q0 of all){const q={...q0};q.marks=Number(q.marks);q.type=String(q.type||q.question_type||'').trim();q.question_type=String(q.question_type||q.type).trim();q.category=String(q.category||'').trim();q.module=String(q.module||q.category||'').trim();q.chapter=q.chapter==null?'':String(q.chapter).trim();const k=q.id?`id:${q.id}`:`text:${String(q.question||q.prompt||'').trim().toLowerCase()}|marks:${q.marks}|chapter:${q.chapter}`;if(!seen.has(k)){seen.add(k);merged.push(q)}}
 window.EnglishHubQuestions=merged;window.qs=merged;window.EnglishHubBankStatus={manifest:(manifest.banks||[]).length,loaded:merged.length,failed};window.__EH_COMPLETE_BANK_READY=true;return merged;
}
window.QuestionBankLoader={loadAll:loadComplete};
})();
