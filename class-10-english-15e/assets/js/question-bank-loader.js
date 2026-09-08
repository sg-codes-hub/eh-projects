/* Question-bank loader — loads core + active bank manifest, then applies quality overrides. */
(function(){
  const BASE='data/';
  const manifestUrl=BASE+'banks/manifest.json';
  const overrideUrls=[
    BASE+'model-answer-quality-overrides.json',
    BASE+'model-answer-quality-overrides-lit-01.json',
    BASE+'model-answer-quality-overrides-lit-02.json',
    BASE+'model-answer-quality-overrides-lit-03.json',
    BASE+'model-answer-quality-overrides-lit-04.json',
    BASE+'model-answer-quality-overrides-lit-05.json',
    BASE+'model-answer-quality-overrides-lit-06.json',
    BASE+'model-answer-quality-overrides-lit-07.json',
    BASE+'model-answer-quality-overrides-lit-08.json',
    BASE+'model-answer-quality-overrides-letter-01.json'
  ];

  function asArray(v){
    if(Array.isArray(v)) return v;
    if(v && Array.isArray(v.questions)) return v.questions;
    if(v && Array.isArray(v.items)) return v.items;
    return [];
  }
  function normalizeBankUrl(u){
    if(!u) return null;
    if(typeof u==='string') return u;
    return u.path || u.url || u.file || u.src || null;
  }
  async function getJson(url){
    const r=await fetch(url,{cache:'no-store'});
    if(!r.ok) throw new Error(r.status+' '+r.statusText+' — '+url);
    return r.json();
  }
  async function loadAll(){
    const loaded=[], failed=[], merged=[], seen=new Set(), overrides={};
    try{
      const core=await getJson(BASE+'questions.json');
      asArray(core).forEach(q=>{ if(q && q.id && !seen.has(q.id)){seen.add(q.id);merged.push(q);} });
      loaded.push('data/questions.json');
    }catch(e){ failed.push({url:'data/questions.json',error:String(e)}); }

    try{
      const manifest=await getJson(manifestUrl);
      const banks=Array.isArray(manifest)?manifest:(manifest.banks||manifest.files||[]);
      for(const entry of banks){
        const url=normalizeBankUrl(entry);
        if(!url) continue;
        try{
          const data=await getJson(url);
          asArray(data).forEach(q=>{ if(q && q.id && !seen.has(q.id)){seen.add(q.id);merged.push(q);} });
          loaded.push(url);
        }catch(e){ failed.push({url,error:String(e)}); }
      }
    }catch(e){ failed.push({url:manifestUrl,error:String(e)}); }

    for(const url of overrideUrls){
      try{
        const data=await getJson(url);
        const obj=data && data.overrides ? data.overrides : {};
        Object.keys(obj).forEach(id=>{overrides[id]=Object.assign({},overrides[id]||{},obj[id]);});
        loaded.push(url);
      }catch(e){
        /* Optional quality packs may not exist in older deployments. */
      }
    }

    for(const q of merged){
      if(q && q.id && overrides[q.id]) Object.assign(q,overrides[q.id]);
    }

    window.EnglishHubQuestions=merged;
    window.qs=merged;
    window.EnglishHubBankStatus={manifest:manifestUrl,loaded,failed,overrides:Object.keys(overrides).length};
    return merged;
  }

  window.QuestionBankLoader={loadAll};
  window.EnglishHubQuestions=[];
  window.qs=window.EnglishHubQuestions;

  const originalFetch=window.fetch.bind(window);
  window.fetch=function(input,init){
    const url=typeof input==='string'?input:(input&&input.url)||'';
    return originalFetch(input,init);
  };
})();
