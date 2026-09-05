/* English Hub 15-E — student enhancements and blueprint-accurate mock generator. */
(function(){
  const PAPER_COUNT=10;
  let selectedPaper=1;

  function seededRandom(seed){
    let x=(seed>>>0)||1;
    return function(){ x=(1664525*x+1013904223)>>>0; return x/4294967296; };
  }
  function withSeed(seed,fn){
    const old=Math.random; Math.random=seededRandom(seed);
    try{return fn();}finally{Math.random=old;}
  }
  function shuffle(a){const x=[...a];for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]];}return x;}
  function kind(q){return String(q.type||q.question_type||q.skill||q.category||'').toLowerCase();}
  function text(q){return String(q.question||q.prompt||'').toLowerCase();}
  function module(q){return String(q.module||q.bank_group||q.book||q.category||'').toLowerCase();}
  function chapter(q){return String(q.chapter||q.topic||'').toLowerCase();}
  function isGrammar(q){return /grammar|vocabulary|analogy|rewrite|reported|voice|degree|transformation|question tag|question word|prefix|suffix|articles?|preposition|conjunction|tense|verb|adjective|adverb|error|editing|punctuation|capital|spelling|idiom|homophone/.test(module(q)+' '+kind(q)+' '+text(q));}
  function isPoetry(q){return /poetry/.test(module(q)) || ['dust of snow','fire and ice','a tiger in the zoo','how to tell wild animals','the ball poem','amanda','the trees','fog','the tale of custard the dragon','for anne gregory'].some(x=>chapter(q).includes(x));}
  function isProse(q){return /prose|first flight prose/.test(module(q)) && !isPoetry(q);}
  function isNonDetail(q){return /footprints|supplementary|non-detail|non detail/.test(module(q)) || /a triumph of surgery|the thief's story|the midnight visitor|a question of trust|footprints without feet|the making of a scientist|the necklace|bholi|the book that saved the earth/.some(x=>chapter(q).includes(x));}
  function isComposition(q){return /composition|essay|letter/.test(module(q)+' '+kind(q)+' '+text(q)) || +q.marks===5;}
  function isComprehension(q){return !!q.passage || /comprehension|passage/.test(module(q)+' '+kind(q)+' '+text(q));}
  function isAnalogy(q){return /analogy|relationship.*complete|complete.*pair/.test(kind(q)+' '+text(q));}
  function isRewrite(q){return /rewrite|reported speech|indirect speech|active.*passive|passive.*active|degree|transformation|as directed/.test(kind(q)+' '+text(q));}
  function isMCQ(q){return String(q.question_type||q.type||'').toLowerCase()==='mcq';}
  function isRTC(q){return /reference.*context|context/.test(kind(q)+' '+text(q));}
  function isQuote(q){return /quote.*memory|memory/.test(kind(q)+' '+text(q));}
  function isLong(q,marks){return +q.marks===marks && !isGrammar(q) && !isComposition(q) && !isComprehension(q);}

  function topicPool(topic,marks){
    const all=Array.isArray(window.qs)?window.qs:[];
    return all.filter(q=>+q.marks===marks && (
      topic==='grammar' ? isGrammar(q) :
      topic==='prose' ? isProse(q) :
      topic==='poetry' ? isPoetry(q) :
      topic==='non-detail' ? isNonDetail(q) :
      topic==='composition' ? isComposition(q) :
      topic==='comprehension' ? isComprehension(q) : true
    ));
  }
  function take(pool,used,count,label,shortages){
    const available=shuffle(pool.filter(q=>!used.has(q.id||q.question||q.prompt)));
    if(available.length<count){shortages.push(`${label}: need ${count}, found ${available.length}`);return []}
    const out=available.slice(0,count);out.forEach(q=>used.add(q.id||q.question||q.prompt));return out;
  }
  function pick(topic,marks,count,used,label,shortages,extraFilter){
    let p=topicPool(topic,marks);
    if(extraFilter)p=p.filter(extraFilter);
    return take(p,used,count,label,shortages);
  }

  /*
   * Exact 15-E paper architecture from the supplied documents.
   * 1M: Grammar 20 (6 MCQ + 4 analogy + 3 rewrite + 7 VSA)
   * 2M: Prose 2 + Poetry 1 + Non-detail 4 + Grammar 3 = 10
   * 3M: Prose 5 + Poetry 4 + Non-detail 1 = 10
   * 4M: Prose 2 + Poetry 2 + Passage 1 = 5
   * 5M: Composition 2 (Essay + Letter) = 10
   */
  function buildAccurateMock(seed){
    return withSeed(seed,function(){
      const used=new Set(),items=[],shortages=[];let number=1;
      function add(section,title,marks,kindName,q,or){items.push({number:number++,section,sectionTitle:title,marks,kind:kindName,q,or:or||null});}
      function pair(section,title,marks,kindName,topic,choice,filter){
        const n=choice?2:1;const got=pick(topic,marks,n,used,`${section} question`,shortages,filter);if(got.length<n)return;add(section,title,marks,kindName,got[0],got[1]);
      }
      // I. Grammar MCQs: Q1–6
      for(let i=1;i<=6;i++)pair('I','Choose the correct alternative',1,'mcq','grammar',false,isMCQ);
      // II. Grammar analogy: Q7–10
      for(let i=1;i<=4;i++)pair('II','Observe the relationship and complete the pair',1,'analogy','grammar',false,isAnalogy);
      // III. Grammar rewrite: Q11–13
      for(let i=1;i<=3;i++)pair('III','Rewrite as directed',1,'rewrite1','grammar',false,q=>isRewrite(q)&&!isMCQ(q));
      // IV. 1-mark VSA: prose 1, poetry 2, non-detail 4, grammar 3
      [['prose',1],['poetry',2],['non-detail',4],['grammar',3]].forEach(([topic,n])=>{for(let i=0;i<n;i++)pair('IV','Answer in a sentence each',1,'onesentence',topic,false,q=>!isMCQ(q)&&!isAnalogy(q)&&!isRewrite(q));});
      // V. 2-mark: prose 2, poetry 1, non-detail 4, grammar 3. Q27 carries the OR choice.
      [['prose',2],['poetry',1],['non-detail',4],['grammar',3]].forEach(([topic,n])=>{for(let i=0;i<n;i++){const choice=(number===27);pair('V','Answer in two to three sentences each',2,'short2',topic,choice,q=>!isRewrite(q)&&!isAnalogy(q)&&!isMCQ(q));}});
      // VI. 2-mark grammar rewrite: Q28–30
      for(let i=0;i<3;i++)pair('VI','Rewrite as directed',2,'rewrite2','grammar',false,isRewrite);
      // VII–VIII. 3-mark total: prose 5, poetry 4, non-detail 1. Q36 carries OR; remaining four are RTC slots.
      // Six long-answer slots: 5 prose + 1 poetry.
      for(let i=0;i<5;i++){const choice=(number===36);pair('VII','Answer in five to six sentences each',3,'long3','prose',choice,q=>!isRTC(q));}
      pair('VII','Answer in five to six sentences each',3,'long3','poetry',false,q=>!isRTC(q));
      // Four reference-to-context slots: 3 poetry + 1 non-detail.
      for(let i=0;i<3;i++)pair('VIII','Explain with reference to the context',3,'rtc','poetry',false,q=>isRTC(q)||/context/.test(text(q))); 
      pair('VIII','Explain with reference to the context',3,'rtc','non-detail',false,q=>isRTC(q)||/context/.test(text(q)));
      // IX. Quote from memory: poetry 4M
      pair('IX','Quote from memory',4,'quote','poetry',true,q=>isQuote(q)||/poem|poetry|lines/.test(text(q)));
      // X. 4-mark long answers: remaining prose 2 + poetry 1 (quote consumed one poetry allocation).
      for(let i=0;i<2;i++)pair('X','Answer in seven to eight sentences each',4,'long4','prose',true,q=>!isRTC(q)&&!isQuote(q));
      pair('X','Answer in seven to eight sentences each',4,'long4','poetry',true,q=>!isRTC(q)&&!isQuote(q));
      // XI. Passage: 4M
      pair('XI','Read the passage carefully and answer',4,'comprehension','comprehension',false,isComprehension);
      // XII/XIII. Composition: one essay and one letter, each 5M.
      pair('XII','Write an essay of about 18–20 sentences',5,'essay','composition',true,q=>/essay/.test(kind(q)+' '+text(q)));
      pair('XIII','Letter Writing',5,'letter','composition',true,q=>/letter/.test(kind(q)+' '+text(q)));
      return {selected:items,shortages};
    });
  }

  window.buildMock=function(){return buildAccurateMock(20260000+selectedPaper*7919);};

  function renderMocks(){
    const grid=document.querySelector('.quick-grid');if(!grid)return;
    grid.querySelectorAll('.mock-paper-card').forEach(x=>x.remove());
    const cards=[];
    for(let i=1;i<=PAPER_COUNT;i++)cards.push(`<button class="quick-card featured mock-paper-card" data-mode="mock" data-paper="${i}" type="button"><span>47Q</span><b>Mock Paper ${i}</b><small>100 marks • 3:15 hours • Exact 15-E blueprint order</small></button>`);
    grid.insertAdjacentHTML('beforeend',cards.join(''));
    grid.querySelectorAll('.mock-paper-card').forEach(b=>b.addEventListener('click',()=>{selectedPaper=Number(b.dataset.paper)||1;if(typeof window.start==='function')window.start('mock',{title:`Class 10 English 15-E • Mock Paper ${selectedPaper}`});setTimeout(()=>{const t=document.getElementById('practiceTitle');if(t)t.textContent=`Class 10 English 15-E • Mock Paper ${selectedPaper}`;const e=document.getElementById('practiceEyebrow');if(e)e.textContent=`FULL MOCK TEST • PAPER ${selectedPaper}`;},0);}));
  }
  document.addEventListener('DOMContentLoaded',()=>setTimeout(renderMocks,50));
})();