/* Resilient bank fetch: a single missing/malformed bank must not prevent the rest of the question bank from loading. */
(()=>{
  const nativeFetch=window.fetch.bind(window);
  window.fetch=(input,init)=>nativeFetch(input,init).then(response=>{
    const url=typeof input==='string'?input:(input&&input.url)||'';
    if(!/data\/banks\/[^/?#]+\.json(?:[?#]|$)/i.test(url)) return response;
    return response.clone().json().then(data=>new Response(JSON.stringify(data),{status:response.status,statusText:response.statusText,headers:response.headers})).catch(()=>new Response('[]',{status:200,headers:{'Content-Type':'application/json'}}));
  }).catch(error=>{
    const url=typeof input==='string'?input:(input&&input.url)||'';
    if(/data\/banks\/[^/?#]+\.json(?:[?#]|$)/i.test(url)) return new Response('[]',{status:200,headers:{'Content-Type':'application/json'}});
    throw error;
  });
})();