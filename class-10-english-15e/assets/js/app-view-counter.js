/* English Hub 15-E — anonymous app visit counter. */
(function(){
  const API='https://countapi.mileshilliard.com/api/v1';
  const KEY='englishhub_class10_15e_app_views_2026';
  const el=document.getElementById('appViewCount');
  if(!el) return;

  // Keep the card visibly usable even while the external counter responds.
  el.textContent='0';

  fetch(`${API}/hit/${KEY}`,{cache:'no-store',mode:'cors'})
    .then(r=>r.ok?r.json():Promise.reject(new Error('Counter request failed')))
    .then(d=>{
      if(d && d.value!=null){
        el.textContent=Number(d.value).toLocaleString();
      }
    })
    .catch(()=>{
      // Leave the visible fallback in place if the counter service is unavailable.
    });
})();
