/* Serve the fully rebuilt v3 answer sets to the existing previous-paper viewer. */
(function(){
  'use strict';
  const nativeFetch=window.fetch.bind(window);
  const urls={
    '2025-exam-1':'data/previous-papers-2025-solved-exam-1.json?v=20260907-01',
    '2025-exam-2':'data/previous-papers-2025-solved-exam-2.json?v=20260907-01',
    '2025-exam-3':'data/previous-papers-2025-solved-exam-3.json?v=20260907-01'
  };
  window.fetch=function(input,init){
    const url=typeof input==='string'?input:(input&&input.url)||'';
    if(url.indexOf('data/previous-papers-2025-solutions.json')!==-1){
      return Promise.all(Object.entries(urls).map(([id,path])=>nativeFetch(path,init).then(r=>{if(!r.ok)throw new Error('Solved paper data unavailable: '+id);return r.json()})))
        .then(rows=>new Response(JSON.stringify({course:'Class 10 First Language English (NCERT)',code:'15-E',version:'2025-solved-v3',papers:Object.fromEntries(rows.map((paper,i)=>[Object.keys(urls)[i],paper]))}),{status:200,headers:{'Content-Type':'application/json'}}));
    }
    return nativeFetch(input,init);
  };
})();
