/* English Hub 15-E — anonymous app visit counter. */
(function(){
  const API='https://countapi.mileshilliard.com/api/v1';
  const KEY='englishhub_class10_15e_app_views_2026';
  const el=document.getElementById('appViewCount');
  if(!el) return;
  fetch(`${API}/hit/${KEY}`,{cache:'no-store'})
    .then(r=>r.ok?r.json():Promise.reject())
    .then(d=>{ if(d && d.value!=null) el.textContent=Number(d.value).toLocaleString(); })
    .catch(()=>{ el.textContent='—'; });
})();
