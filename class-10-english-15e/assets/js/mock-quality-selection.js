/* 15-E mock content-quality selector — keeps the fixed blueprint, but rejects weak model answers */
(function(){
  const original=window.buildStrictMock;
  if(typeof original!=='function')return;
  const norm=v=>String(v??'').trim().toLowerCase();
  const text=q=>String(q?.question||q?.prompt||q?.text||'').trim();
  const answer=q=>{const v=q?.model_answer??q?.answer??q?.answer_points??'';if(Array.isArray(v))return v.join('. ');if(v&&typeof v==='object')return Object.values(v).join('. ');return String(v||'').trim();};
  const sentences=q=>answer(q).replace(/\n+/g,' ').split(/[.!?]+(?:\s|$)/).map(x=>x.trim()).filter(Boolean).length;
  const isMCQ=q=>norm(q?.type||q?.question_type)==='mcq';
  const meta=q=>norm([q?.type,q?.question_type,q?.skill,q?.category,q?.module,q?.bank_group,q?.topic,q?.domain,q?.blueprint_slot].filter(Boolean).join(' '));
  const isLit=q=>{if(!q||isMCQ(q))return false;const m=meta(q);return ['firstflight','footprints','poetry'].includes(norm(q?.bank_group))||/first flight|footprints without feet|poetry/.test(m);};
  const isEssay=q=>!isMCQ(q)&&Number(q?.marks)===5&&/essay/.test(meta(q)+' '+norm(text(q)));
  const letterKind=q=>{const s=norm([q?.letter_type,q?.skill,q?.topic,q?.category,q?.question].filter(Boolean).join(' '));if(/informal\s*letter|informal_letter|informal/.test(s))return'informal';if(/formal\s*letter|formal_letter|formal/.test(s))return'formal';const t=norm(text(q));if(/to your (friend|cousin|brother|sister|uncle|aunt)|to (my|your) friend|inviting (him|her)|write a letter to your/.test(t))return'informal';if(/to the (editor|headmaster|principal|municipal|commissioner|chief engineer|authority)|complaining|requesting|expressing concern|suggesting measures|application to/.test(t))return'formal';return'unknown'};
  const letterFormatScore=q=>{const a=answer(q).toLowerCase(),k=letterKind(q);if(!k||k==='unknown')return 0;let s=0;if(/\[address\]|address|street|road|nagar|shahapur|kalaburagi|kalburgi|karnataka|india/.test(a))s++;if(/\[date\]|\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2}|\b\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}\b/.test(a))s++;if(k==='formal'){if(/\bto\s*\n|\bto\s+(?:the|a)\b/.test(a))s++;if(/\bsubject\s*:/.test(a))s++;if(/\b(?:sir|madam|respected sir|respected madam)\b/.test(a))s++;if(/\b(?:yours faithfully|yours sincerely|yours obediently)\b/.test(a))s++;}else{if(/\bdear\b/.test(a))s++;if(/\b(?:yours lovingly|yours affectionately|with love|love)\b/.test(a))s++;}return s;};
  const bank=()=>Array.isArray(window.EnglishHubQuestions)&&window.EnglishHubQuestions.length?window.EnglishHubQuestions:(Array.isArray(window.qs)?window.qs:[]);
  const key=q=>q?.id||meta(q)+'|'+text(q);
  function candidates(predicate,used){return bank().filter(q=>!used.has(key(q))&&predicate(q));}
  function replaceChoice(current,predicate,used,score){
    if(current&&predicate(current)){
      if(!score||score(current)>=6)return current;
    }
    const list=candidates(predicate,used);
    list.sort((a,b)=>(score?score(b):sentences(b))-(score?score(a):sentences(a)));
    return list[0]||current;
  }
  function preferred(ids,predicate,used){
    for(const id of ids){const q=bank().find(x=>x?.id===id&&!used.has(key(x))&&predicate(x));if(q)return q;}
    return null;
  }
  function bestEssay(used){
    const preferredIds=['COMPOS1-001','COMPOS1-002','COMPOS1-006','COMPOS1-007','COMPOS1-008','COMPOS1-012','COMPOS1-015','COMPOS1-017','COMPOS1-018'];
    return preferred(preferredIds,q=>isEssay(q)&&sentences(q)>=16,used)||candidates(q=>isEssay(q)&&sentences(q)>=16,used).sort((a,b)=>sentences(b)-sentences(a))[0]||null;
  }
  function bestLetter(kind,used){
    const ids=kind==='formal'?['LETTER-T01','LETTER-T03','LETTER-T05']:['LETTER-T02','LETTER-T04','LETTER-T06'];
    return preferred(ids,q=>letterKind(q)===kind&&letterFormatScore(q)>=(kind==='formal'?6:4),used)||candidates(q=>letterKind(q)===kind&&letterFormatScore(q)>=(kind==='formal'?6:4),used).sort((a,b)=>letterFormatScore(b)-letterFormatScore(a))[0]||null;
  }
  window.buildStrictMock=function(no){
    const p=original(no),used=new Set();
    p.selected.forEach(x=>{if(x.q)used.add(key(x.q));if(x.or)used.add(key(x.or));});
    const process=(x,pred,min)=>{
      if(!x)return;
      const old=x.q;
      if(!pred(old)||sentences(old)<min){const cand=replaceChoice(old,q=>pred(q)&&sentences(q)>=min,used);if(cand&&cand!==old){used.delete(key(old));x.q=cand;used.add(key(cand));}}
      if(x.or){const oldOr=x.or;if(!pred(oldOr)||sentences(oldOr)<min){const cand=replaceChoice(oldOr,q=>pred(q)&&sentences(q)>=min,used);if(cand&&cand!==oldOr){used.delete(key(oldOr));x.or=cand;used.add(key(cand));}}}
    };
    p.selected.filter(x=>x.section==='V').forEach(x=>process(x,isLit,2));
    p.selected.filter(x=>x.section==='VII').forEach(x=>process(x,isLit,5));
    p.selected.filter(x=>x.section==='X').forEach(x=>process(x,isLit,7));
    p.selected.filter(x=>x.section==='XII').forEach(x=>{const old=x.q;if(!isEssay(old)||sentences(old)<16){const cand=bestEssay(used);if(cand&&cand!==old){used.delete(key(old));x.q=cand;used.add(key(cand));}}});
    p.selected.filter(x=>x.section==='XIII').forEach(x=>{
      const old=x.q;if(letterKind(old)!=='formal'||letterFormatScore(old)<6){const cand=bestLetter('formal',used);if(cand&&cand!==old){used.delete(key(old));x.q=cand;used.add(key(cand));}}
      const oldOr=x.or;if(letterKind(oldOr)!=='informal'||letterFormatScore(oldOr)<4){const cand=bestLetter('informal',used);if(cand&&cand!==oldOr){if(oldOr)used.delete(key(oldOr));x.or=cand;used.add(key(cand));}}
    });
    p.totalMarks=p.selected.reduce((s,x)=>s+Number(x.marks||0),0);
    return p;
  };
  window.__EH_MOCK_QUALITY_SELECTOR_VERSION='20260908-05';
})();
