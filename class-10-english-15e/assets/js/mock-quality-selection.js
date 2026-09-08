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
  const letterFormatScore=q=>{const a=answer(q).toLowerCase(),k=letterKind(q);if(!k||k==='unknown')return 0;let s=0;if(/\[address\]|address|street|road|nagar|shahapur|kalaburagi|kalburgi|karnataka|india/.test(a))s++;if(/\[date\]|\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2}|\b\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}\b/.test(a))s++;if(k==='formal'){if(/\bto\b/.test(a))s++;if(/\bsubject\s*:/.test(a))s++;if(/\b(?:sir|madam|respected sir|respected madam)\b/.test(a))s++;if(/\b(?:yours faithfully|yours sincerely|yours obediently)\b/.test(a))s++;}else{if(/\bdear\b/.test(a))s++;if(/\b(?:yours lovingly|yours affectionately|with love|love)\b/.test(a))s++;}return s;};
  const bank=()=>Array.isArray(window.EnglishHubQuestions)&&window.EnglishHubQuestions.length?window.EnglishHubQuestions:(Array.isArray(window.qs)?window.qs:[]);
  const key=q=>q?.id||meta(q)+'|'+text(q);
  function candidates(predicate,used){return bank().filter(q=>!used.has(key(q))&&predicate(q));}
  function preferred(ids,predicate,used){for(const id of ids){const q=bank().find(x=>x?.id===id&&!used.has(key(x))&&predicate(x));if(q)return q;}return null;}
  function bestEssay(used){const ids=['COMPOS1-001','COMPOS1-002','COMPOS1-006','COMPOS1-007','COMPOS1-008','COMPOS1-012','COMPOS1-015','COMPOS1-017','COMPOS1-018'];return preferred(ids,q=>isEssay(q)&&sentences(q)>=16,used)||candidates(q=>isEssay(q)&&sentences(q)>=16,used).sort((a,b)=>sentences(b)-sentences(a))[0]||null;}
  function bestLetter(kind,used){const ids=kind==='formal'?['LETTER-T01','LETTER-T03','LETTER-T05']:['LETTER-T02','LETTER-T04','LETTER-T06'];return preferred(ids,q=>letterKind(q)===kind&&letterFormatScore(q)>=(kind==='formal'?6:4),used)||candidates(q=>letterKind(q)===kind&&letterFormatScore(q)>=(kind==='formal'?6:4),used).sort((a,b)=>letterFormatScore(b)-letterFormatScore(a))[0]||null;}
  function replaceWeak(x,pred,min,used){
    if(!x)return;
    const old=x.q;
    if(!pred(old)||sentences(old)<min){const cand=candidates(q=>Number(q?.marks)===Number(x.marks)&&pred(q)&&sentences(q)>=min,used)[0]||null;if(cand){used.delete(key(old));x.q=cand;used.add(key(cand));}}
    if(x.or){const oldOr=x.or;if(!pred(oldOr)||sentences(oldOr)<min){const cand=candidates(q=>Number(q?.marks)===Number(x.marks)&&pred(q)&&sentences(q)>=min,used)[0]||null;if(cand){used.delete(key(oldOr));x.or=cand;used.add(key(cand));}}}
  }
  const DIVERSITY_SECTIONS=new Set(['IV','V','VII','VIII','IX','X']);
  const chapter=q=>String(q?.chapter||q?.topic||'Unknown').trim();
  const diversityPredicate=section=>{
    if(section==='VIII')return q=>!isMCQ(q)&&/rtc|reference.*context|reference to context/.test(meta(q)+' '+text(q));
    if(section==='IX')return q=>!isMCQ(q)&&/quote.*memory|quote from memory/.test(meta(q)+' '+text(q));
    return isLit;
  };
  const diversityMinimum=section=>section==='V'?2:section==='VII'?5:section==='X'?7:0;

  // Usage is tracked by paper number so rebuilding a paper does not double-count it.
  // The audit builds Papers 1–10 in order, allowing later papers to prefer fresh IDs.
  const usageByPaper=Object.create(null);
  const usageTotals=Object.create(null);
  const removeUsage=(no)=>{
    const old=usageByPaper[no];
    if(!old)return;
    old.forEach(k=>{usageTotals[k]=Math.max(0,(usageTotals[k]||1)-1);});
    delete usageByPaper[no];
  };
  const addUsage=(no,p)=>{
    const ids=[];
    p.selected.filter(x=>DIVERSITY_SECTIONS.has(x.section)).forEach(x=>{if(x.q)ids.push(key(x.q));if(x.or)ids.push(key(x.or));});
    usageByPaper[no]=ids;
    ids.forEach(k=>usageTotals[k]=(usageTotals[k]||0)+1);
  };
  const usage=q=>usageTotals[key(q)]||0;

  function rebalanceLiterature(p,used){
    const counts={};
    const add=q=>{if(q){const c=chapter(q);counts[c]=(counts[c]||0)+1;}};
    p.selected.filter(x=>DIVERSITY_SECTIONS.has(x.section)).forEach(x=>{add(x.q);add(x.or);});
    for(const x of p.selected.filter(x=>DIVERSITY_SECTIONS.has(x.section))){
      const pred=diversityPredicate(x.section),min=diversityMinimum(x.section);
      const oldMain=x.q,oldOr=x.or;
      const oldMainKey=oldMain&&key(oldMain),oldOrKey=oldOr&&key(oldOr);
      if(oldMain)used.delete(oldMainKey);if(oldOr)used.delete(oldOrKey);
      if(oldMain){const c=chapter(oldMain);counts[c]=Math.max(0,(counts[c]||1)-1);}
      if(oldOr){const c=chapter(oldOr);counts[c]=Math.max(0,(counts[c]||1)-1);}
      const pool=bank().filter(q=>Number(q?.marks)===Number(x.marks)&&!used.has(key(q))&&pred(q)&&sentences(q)>=min);
      const choose=blocked=>{
        const available=pool.filter(q=>!blocked.has(chapter(q)));
        if(!available.length)return null;
        const fresh=available.filter(q=>usage(q)<4);
        const ranked=(fresh.length?fresh:available).sort((a,b)=>{
          const ca=counts[chapter(a)]||0,cb=counts[chapter(b)]||0;
          if(ca!==cb)return ca-cb;
          const ua=usage(a),ub=usage(b);
          if(ua!==ub)return ua-ub;
          const sa=sentences(a),sb=sentences(b);
          if(sa!==sb)return sb-sa;
          return String(key(a)).localeCompare(String(key(b)));
        });
        return ranked[0]||null;
      };
      let main=choose(new Set());
      if(!main&&oldMain)main=oldMain;
      if(main){x.q=main;used.add(key(main));const c=chapter(main);counts[c]=(counts[c]||0)+1;}
      let or=null;
      if(oldOr){or=choose(new Set([chapter(x.q)]));if(!or&&oldOr&&chapter(oldOr)!==chapter(x.q))or=oldOr;if(or){x.or=or;used.add(key(or));const c=chapter(or);counts[c]=(counts[c]||0)+1;}}
      else x.or=null;
      if(x.or&&chapter(x.q)===chapter(x.or)){
        used.delete(key(x.or));const c=chapter(x.or);counts[c]=Math.max(0,(counts[c]||1)-1);
        const alt=choose(new Set([chapter(x.q)]));
        if(alt){x.or=alt;used.add(key(alt));const ac=chapter(alt);counts[ac]=(counts[ac]||0)+1;}
      }
    }
  }

  window.buildStrictMock=function(no){
    removeUsage(no);
    const p=original(no),used=new Set();
    p.selected.forEach(x=>{if(x.q)used.add(key(x.q));if(x.or)used.add(key(x.or));});
    p.selected.filter(x=>x.section==='V').forEach(x=>replaceWeak(x,isLit,2,used));
    p.selected.filter(x=>x.section==='VII').forEach(x=>replaceWeak(x,isLit,5,used));
    p.selected.filter(x=>x.section==='X').forEach(x=>replaceWeak(x,isLit,7,used));
    p.selected.filter(x=>x.section==='XII').forEach(x=>{
      const old=x.q;if(old)used.delete(key(old));let cand=bestEssay(used);if(cand){x.q=cand;used.add(key(cand));}
      const oldOr=x.or;if(oldOr)used.delete(key(oldOr));cand=bestEssay(used);if(cand){x.or=cand;used.add(key(cand));}
    });
    p.selected.filter(x=>x.section==='XIII').forEach(x=>{
      const old=x.q;if(old)used.delete(key(old));const oldOr=x.or;if(oldOr)used.delete(key(oldOr));let cand=bestLetter('formal',used);if(cand){x.q=cand;used.add(key(cand));}cand=bestLetter('informal',used);if(cand){x.or=cand;used.add(key(cand));}
    });
    rebalanceLiterature(p,used);
    p.totalMarks=p.selected.reduce((s,x)=>s+Number(x.marks||0),0);
    addUsage(no,p);
    return p;
  };
  window.__EH_MOCK_QUALITY_SELECTOR_VERSION='20260908-10';
})();
