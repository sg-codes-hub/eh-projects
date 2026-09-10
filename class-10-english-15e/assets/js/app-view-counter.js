/* English Hub 15-E — anonymous returning-visit counter. */
(function(){
  const API='https://countapi.mileshilliard.com/api/v1';
  const KEY='englishhub_class10_15e_app_views_2026';
  const STORAGE_KEY='englishhub_class10_15e_last_visit_v1';
  const VISIT_GAP=60*60*1000; // Count at most once per hour per browser.
  const el=document.getElementById('appViewCount');
  if(!el) return;

  let lastVisit=0;
  try { lastVisit=Number(localStorage.getItem(STORAGE_KEY))||0; } catch(e) {}

  const now=Date.now();
  const shouldCount=!lastVisit || (now-lastVisit)>=VISIT_GAP;
  const endpoint=shouldCount ? `${API}/hit/${KEY}` : `${API}/get/${KEY}`;

  el.textContent='0';

  fetch(endpoint,{cache:'no-store',mode:'cors'})
    .then(r=>r.ok?r.json():Promise.reject(new Error('Counter request failed')))
    .then(d=>{
      if(d && d.value!=null){
        el.textContent=Number(d.value).toLocaleString();
        if(shouldCount){
          try { localStorage.setItem(STORAGE_KEY,String(now)); } catch(e) {}
        }
      }
    })
    .catch(()=>{
      // Leave the visible fallback in place if the counter service is unavailable.
    });
})();
