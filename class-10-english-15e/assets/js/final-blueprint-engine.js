/*
 * FINAL 15-E BLUEPRINT ENGINE
 *
 * Purpose:
 *   The paper structure is fixed. Questions/chapters may rotate inside the
 *   permitted slot; the slot itself must never change.
 *
 * Controlling structure:
 *   Q1-6   : 1M Grammar/Vocabulary MCQ
 *   Q7-10  : 1M Analogy
 *   Q11-13 : 1M Rewrite as directed
 *   Q14-20 : 1M Literature short answer
 *   Q21-27 : 2M Literature short answer
 *   Q28-30 : 2M Grammar/language rewrite
 *   Q31-36 : 3M Literature answer
 *   Q37-40 : 3M Reference to Context
 *   Q41    : 4M Quote from Memory
 *   Q42-44 : 4M Literature answer
 *   Q45    : 4M Unseen comprehension
 *   Q46    : 5M Essay
 *   Q47    : 5M Letter
 *
 * OR positions follow the supplied model-paper format:
 *   Q27, Q31, Q41, Q42, Q43, Q44, Q46, Q47.
 *
 * IMPORTANT:
 *   No chapter MCQ is ever eligible for a mock or chapter-wise practice.
 *   MCQs are reserved for the six opening grammar/language slots only.
 */
(function(){
  const PATTERN=[
    {section:'I',   title:'Choose the correct alternative',                         marks:1,count:6,  domain:'grammar_mcq', kind:'mcq'},
    {section:'II',  title:'Observe the relationship and complete the pair',         marks:1,count:4,  domain:'analogy',     kind:'analogy'},
    {section:'III', title:'Rewrite as directed',                                   marks:1,count:3,  domain:'rewrite1',    kind:'rewrite1'},
    {section:'IV',  title:'Answer the following questions in a sentence each',     marks:1,count:7,  domain:'literature',  kind:'onesentence'},
    {section:'V',   title:'Answer the following questions in two to three sentences each',marks:2,count:7,domain:'literature',kind:'short2',orAt:[7]},
    {section:'VI',  title:'Rewrite as directed',                                   marks:2,count:3,  domain:'grammar2',    kind:'rewrite2'},
    {section:'VII', title:'Answer the following questions in five to six sentences each',marks:3,count:6,domain:'literature',kind:'long3',orAt:[1]},
    {section:'VIII',title:'Explain with reference to the context',                 marks:3,count:4,  domain:'rtc',         kind:'rtc'},
    {section:'IX',  title:'Quote from memory',                                      marks:4,count:1,  domain:'quote',       kind:'quote',orAt:[1]},
    {section:'X',   title:'Answer the following questions in seven to eight sentences each',marks:4,count:3,domain:'literature',kind:'long4',orAt:'all'},
    {section:'XI',  title:'Read the following passage carefully and answer',        marks:4,count:1,  domain:'comprehension',kind:'comprehension'},
    {section:'XII', title:'Write an essay of about 18–20 sentences on any one',    marks:5,count:1,  domain:'essay',       kind:'essay',orAt:[1]},
    {section:'XIII',title:'Letter Writing',                                        marks:5,count:1,  domain:'letter',      kind:'letter',orAt:[1]}
  ];

  const OR_SECTIONS=new Set(['V','VII','IX','X','XII','XIII']);
  let paperNo=1;

  const norm=v=>String(v??'').trim().toLowerCase();
  const qText=q=>norm(q?.question||q?.prompt||q?.text);
  const qMeta=q=>norm([q?.type,q?.question_type,q?.skill,q?.category,q?.module,q?.bank_group,q?.topic,q?.domain,q?.blueprint_slot].filter(Boolean).join(' '));
  const qType=q=>norm(q?.type||q?.question_type);
  const key=q=>q?.id||`${q?.module||''}|${q?.chapter||''}|${q?.marks||''}|${qText(q)}`;
  const isMCQ=q=>qType(q)==='mcq';
  const isGrammar=q=>{
    const m=qMeta(q);
    return norm(q?.bank_group)==='grammar'||/grammar|vocabulary|language/.test(m)&&!/literature/.test(m);
  };
  const isAnalogy=q=>norm(q?.bank_group)==='analogy'||/analogy|relationship|complete the pair/.test(qMeta(q)+' '+qText(q));
  const isRewrite=q=>/rewrite|reported speech|indirect speech|active.*passive|passive.*active|degree.*comparison|sentence transformation|as directed|question formation|frame a question|voice transformation/.test(qMeta(q)+' '+qText(q));
  const isRTC=q=>norm(q?.bank_group)==='rtc'||/reference.*context|reference to context|rtc/.test(qMeta(q)+' '+qText(q));
  const isQuote=q=>/quote.*memory|quote from memory/.test(qMeta(q)+' '+qText(q));
  const isComprehension=q=>norm(q?.bank_group)==='comprehension'||!!q?.passage||/comprehension|unseen passage|read the following passage/.test(qMeta(q)+' '+qText(q));
  const isEssay=q=>/essay/.test(qMeta(q)+' '+qText(q));
  const isLetter=q=>/letter/.test(qMeta(q)+' '+qText(q));
  const isLiterature=q=>{
    if(isMCQ(q)||isAnalogy(q)||isRewrite(q)||isRTC(q)||isQuote(q)||isComprehension(q)||isEssay(q)||isLetter(q))return false;
    const bg=norm(q?.bank_group);
    const mod=norm(q?.module);
    return ['firstflight','footprints','poetry'].includes(bg)||/first flight|footprints without feet/.test(mod)||/poetry/.test(mod);
  };

  function shuffle(a,rng){
    const x=[...a];
    const random=rng||Math.random;
    for(let i=x.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[x[i],x[j]]=[x[j],x[i]];}
    return x;
  }
  function seeded(seed){let x=(seed>>>0)||1;return()=>{x=(1664525*x+1013904223)>>>0;return x/4294967296;};}

  function bank(){
    if(Array.isArray(window.EnglishHubQuestions)&&window.EnglishHubQuestions.length)return window.EnglishHubQuestions;
    if(Array.isArray(window.qs)&&window.qs.length)return window.qs;
    try{return qs||[];}catch(e){return []}
  }

  function domainPool(domain,marks){
    let p=bank().filter(q=>Number(q.marks)===marks);
    switch(domain){
      case 'grammar_mcq': return p.filter(q=>isMCQ(q)&&isGrammar(q));
      case 'analogy': return p.filter(q=>!isMCQ(q)&&isAnalogy(q));
      case 'rewrite1': return p.filter(q=>Number(q.marks)===1&&!isMCQ(q)&&isRewrite(q));
      case 'grammar2': return p.filter(q=>Number(q.marks)===2&&!isMCQ(q)&&isGrammar(q)&&isRewrite(q));
      case 'literature': return p.filter(isLiterature);
      case 'rtc': return p.filter(q=>Number(q.marks)===3&&isRTC(q));
      case 'quote': return p.filter(q=>Number(q.marks)===4&&isQuote(q));
      case 'comprehension': return p.filter(q=>Number(q.marks)===4&&isComprehension(q));
      case 'essay': return p.filter(q=>Number(q.marks)===5&&isEssay(q));
      case 'letter': return p.filter(q=>Number(q.marks)===5&&isLetter(q));
      default:return [];
    }
  }

  function take(pool,used,n,rng){
    const available=shuffle(pool.filter(q=>!used.has(key(q))),rng);
    const out=available.slice(0,n);
    out.forEach(q=>used.add(key(q)));
    return out;
  }

  function buildStrictMock(no){
    const rng=seeded(20260905 + (no||1)*104729);
    const used=new Set();
    const selected=[];
    const shortages=[];
    let number=1;

    PATTERN.forEach(slot=>{
      const pool=domainPool(slot.domain,slot.marks);
      const orPositions=slot.orAt==='all'?Array.from({length:slot.count},(_,i)=>i+1):(slot.orAt||[]);
      for(let pos=1;pos<=slot.count;pos++){
        const need=orPositions.includes(pos)?2:1;
        const choices=take(pool,used,need,rng);
        if(choices.length<need){
          shortages.push(`${slot.section} Q${number}: need ${need} ${slot.domain} question${need>1?'s':''}, found ${choices.length}`);
          number++;
          continue;
        }
        selected.push({
          number:number++,
          section:slot.section,
          sectionTitle:slot.title,
          marks:slot.marks,
          kind:slot.kind,
          q:choices[0],
          or:choices[1]||null
        });
      }
    });

    const totalMarks=selected.reduce((s,x)=>s+Number(x.marks||0),0);
    const hasBadMCQ=selected.some(x=>isMCQ(x.q)&&x.section!=='I');
    const badGrammarMCQ=selected.some(x=>x.section==='I'&&!isMCQ(x.q));
    const expectedQuestions=47;
    if(selected.length!==expectedQuestions)shortages.unshift(`VALIDATION: ${selected.length}/${expectedQuestions} main questions built`);
    if(totalMarks!==100)shortages.unshift(`VALIDATION: ${totalMarks}/100 marks built`);
    if(hasBadMCQ)shortages.unshift('VALIDATION: MCQ escaped the Q1-Q6 grammar section');
    if(badGrammarMCQ)shortages.unshift('VALIDATION: Q1-Q6 contains a non-MCQ item');

    return {selected,shortages,totalMarks};
  }

  /* Replace the legacy app builder. The app's original start('mock') calls
     the global buildMock function, so replacing the global is intentional. */
  window.buildMock=()=>buildStrictMock(paperNo);
  try{buildMock=window.buildMock}catch(e){}

  /*
   * The existing app renderer is retained. We only wrap start() so that:
   *   - chapter practice excludes every MCQ;
   *   - one-mark quick practice keeps MCQs restricted to grammar;
   *   - all other mark-wise practice excludes MCQs because MCQ is an exam
   *     format reserved for Q1-Q6, not a generic chapter question type.
   */
  const legacyStart=window.start;
  if(typeof legacyStart==='function'){
    window.start=function(mode,o={}){
      let original;
      try{original=qs}catch(e){original=null}
      if(!original)return legacyStart(mode,o);

      let filtered=original;
      if(mode==='chapter'){
        filtered=original.filter(q=>!isMCQ(q));
      }else if(mode==='marks'){
        const m=Number(o.marks);
        filtered=original.filter(q=>{
          if(!isMCQ(q))return true;
          return m===1&&isGrammar(q);
        });
      }

      try{
        qs=filtered;
        return legacyStart(mode,o);
      }finally{
        qs=original;
      }
    };
  }

  function renderMockCards(){
    const grid=document.querySelector('.quick-grid');
    if(!grid)return;
    grid.querySelectorAll('.mock-paper-card').forEach(x=>x.remove());
    let html='';
    for(let i=1;i<=10;i++){
      html+=`<button class="quick-card featured mock-paper-card" data-paper="${i}" type="button"><span>47Q</span><b>Mock Paper ${i}</b><small>47 questions • 100 marks • 3:15 hours • Exact paper pattern</small></button>`;
    }
    grid.insertAdjacentHTML('beforeend',html);
    grid.querySelectorAll('.mock-paper-card').forEach(btn=>btn.onclick=async()=>{
      paperNo=Number(btn.dataset.paper)||1;
      try{
        if(window.QuestionBankLoader){
          const all=await window.QuestionBankLoader.loadAll();
          window.EnglishHubQuestions=all;
          window.qs=all;
          try{qs=all}catch(e){}
        }
      }catch(e){}
      if(typeof window.start==='function')window.start('mock',{title:`Class 10 English 15-E • Mock Paper ${paperNo}`});
    });
  }

  document.addEventListener('DOMContentLoaded',()=>setTimeout(renderMockCards,150));
})();
