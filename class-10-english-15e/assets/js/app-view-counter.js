/* English Hub 15-E — anonymous unique-browser visit counter. */
(function(){
  const API='https://countapi.mileshilliard.com/api/v1';
  const KEY='englishhub_class10_15e_app_views_2026';
  const STORAGE_KEY='englishhub_class10_15e_visit_counted_v1';
  const el=document.getElementById('appViewCount');
  if(!el) return;

  // Only count the first visit from this browser. Refreshes/reloads do not increment it.
  let counted=false;
  try { counted=localStorage.getItem(STORAGE_KEY)==='1'; } catch(e) {}

  el.textContent='0';

  const endpoint=counted ? `${API}/get/${KEY}` : `${API}/hit/${KEY}`;
  fetch(endpoint,{cache:'no-store',mode:'cors'})
    .then(r=>r.ok?r.json():Promise.reject(new Error('Counter request failed')))
    .then(d=>{
      if(d && d.value!=null){
        el.textContent=Number(d.value).toLocaleString();
        if(!counted){
          try { localStorage.setItem(STORAGE_KEY,'1'); } catch(e) {}
        }
      }
    })
    .catch(()=>{
      // Leave the visible fallback in place if the counter service is unavailable.
    });
})();
