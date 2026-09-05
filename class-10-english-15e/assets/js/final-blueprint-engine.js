/* Final 15-E mock engine. Uses chapter-wise weightage for main questions and the supplied model paper for Q1-Q47 order. */
(function(){
  let paperNo=1;
  const norm=v=>String(v??'').trim().toLowerCase();
  const key=q=>q.id||q.question||q.prompt||JSON.stringify(q);
  const text=q=>norm(q.question||q.prompt);
  const type=q=>norm(q.type||q.question_type||q.skill||q.category);
  const chapter=q=>norm(q.chapter||q.topic);
  const module=q=>norm(q.module||q.bank_group||q.book||q.category);
  const isMCQ=q=>type(q)==='mcq';
  const isAnalogy=q=>/analogy|relationship.*complete|complete.*pair/.test(type(q)+' '+text(q));
  const isRewrite=q=>/rewrite|reported speech|indirect speech|active.*passive|passive.*active|degree|transformation|as directed/.test(type(q)+' '+text(q));
  const isRTC=q=>/reference.*context|context/.test(type(q)+' '+text(q));
  const isQuote=q=>/quote/.test(type(q)+' '+text(q));
  const isComp=q=>!!q.passage||/comprehension|passage/.test(type(q)+' '+text(q));
  const isEssay=q=>/essay/.test(type(q)+' '+text(q));
  const isLetter=q=>/letter/.test(type(q)+' '+text(q));
  const isGrammar=q=>/grammar|vocabulary/.test(module(q))||/grammar|vocabulary/.test(type(q));
  const isPoetry=q=>/poetry/.test(module(q))||['dust of snow','fire and ice','a tiger in the zoo','how to tell wild animals','the ball poem','amanda','the trees','fog','the tale of custard the dragon','for anne gregory'].some(x=>chapter(q).includes(x));
  const isProse=q=>/prose|first flight/.test(module(q))&&!isPoetry(q);
  const isNonDetail=q=>/footprints|supplementary|non-detail|non detail/.test(module(q))||['a triumph of surgery',"the thief's story",'the midnight visitor','a question of trust','footprints without feet','the making of a scientist','the necklace','bholi','the book that saved the earth'].some(x=>chapter(q).includes(x));
  function shuffle(a){const x=[...a];for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]];}return x;}
  function seeded(seed){let x=(seed>>>0)||1;return()=>{x=(1664525*x+1013904223)>>>0;return x/4294967296;};}
  function withSeed(seed,fn){const old=Math.random;Math.random=seeded(seed);try{return fn();}finally{Math.random=old;}}
  function poolChapter(name,marks,filter){return (window.qs||[]).filter(q=>+q.marks===marks&&(chapter(q)===norm(name)||chapter(q).includes(norm(name))||norm(name).includes(chapter(q)))&&(!filter||filter(q)));}
  function poolTopic(topic,marks,filter){let p=(window.qs||[]).filter(q=>+q.marks===marks);if(topic==='grammar')p=p.filter(isGrammar);if(topic==='prose')p=p.filter(isProse);if(topic==='poetry')p=p.filter(isPoetry);if(topic==='non-detail')p=p.filter(isNonDetail);if(topic==='comprehension')p=p.filter(isComp);if(topic==='composition')p=p.filter(q=>+q.marks===5&&(isEssay(q)||isLetter(q)||/composition/.test(module(q))));return filter?p.filter(filter):p;}
  function take(pool,used,n,label,errors){const a=shuffle(pool.filter(q=>!used.has(key(q))));if(a.length<n){errors.push(`${label}: need ${n}, found ${a.length}`);return [];}const out=a.slice(0,n);out.forEach(q=>used.add(key(q)));return out;}
  function make(seed){return withSeed(seed,()=>{
    const used=new Set(),altUsed=new Set(),items=[],errors=[];let n=1;
    function add(sec,title,marks,kind,q,or){if(!q){errors.push(`Q${n} missing`);return;}items.push({number:n++,section:sec,sectionTitle:title,marks,kind,q,or:or||null});}
    function chapterItem(name,marks,sec,title,kind,choice,filter){const q=take(poolChapter(name,marks,filter),used,1,`${name} ${marks}M`,errors)[0];if(!q)return;let or=null;if(choice){or=take(poolChapter(name,marks,filter),altUsed,1,`${name} OR`,errors)[0]||null;}add(sec,title,marks,kind,q,or);}
    function topicItem(topic,marks,sec,title,kind,choice,filter){const q=take(poolTopic(topic,marks,filter),used,1,`${topic} ${marks}M`,errors)[0];if(!q)return;let or=null;if(choice)or=take(poolTopic(topic,marks,filter),altUsed,1,`${topic} OR`,errors)[0]||null;add(sec,title,marks,kind,q,or);}
    // Q1-6 Grammar MCQ; Q7-10 Analogy; Q11-13 Grammar directed language.
    for(let i=0;i<6;i++)topicItem('grammar',1,'I','Choose the correct alternative','mcq',false,isMCQ);
    for(let i=0;i<4;i++)topicItem('grammar',1,'II','Observe the relationship and complete the pair','analogy',false,isAnalogy);
    for(let i=0;i<3;i++)topicItem('grammar',1,'III','Rewrite as directed','rewrite1',false,q=>isRewrite(q)&&!isMCQ(q));
    // Q14-20 exact model-paper chapter order and 1M chapter allocations.
    [['Tea from Assam',1],['How to Tell Wild Animals',1],['Fog',1],["The Thief's Story",1],['A Question of Trust',1],['Footprints Without Feet',1],['The Book That Saved the Earth',1]].forEach(([c,m])=>chapterItem(c,m,'IV','Answer the following questions in a sentence each','onesentence',false));
    // Q21-27 exact 2M chapter allocation. Q27 is Bholi as required by the chapter chart; OR is another valid 2M non-detail item.
    [['A Letter to God',2],['The Proposal',2],['How to Tell Wild Animals',2],['A Triumph of Surgery',2],['The Midnight Visitor',2],['The Making of a Scientist',2],['Bholi',2]].forEach(([c,m],i)=>chapterItem(c,m,'V','Answer the following questions in two to three sentences each','short2',i===6));
    // Q28-30 Grammar 2M rewrite.
    for(let i=0;i<3;i++)topicItem('grammar',2,'VI','Rewrite as directed','rewrite2',false,isRewrite);
    // Q31-36: five prose + one poetry, matching the 3M chapter weightage. Q31 has the one 3M OR.
    [['His First Flight',3],['Black Aeroplane',3],['From the Diary of Anne Frank',3],['Mijbil the Otter',3],['The Sermon at Benares',3],['Dust of Snow',3]].forEach(([c,m],i)=>chapterItem(c,m,'VII','Answer the following questions in five to six sentences each','long3',i===0,q=>!isRTC(q)));
    // Q37-40: one non-detail + three poetry RTC, completing 5 prose + 4 poetry + 1 non-detail at 3M.
    chapterItem('The Necklace',3,'VIII','Explain with reference to the context','rtc',false,q=>isRTC(q)||/context/.test(text(q)));
    [['The Ball Poem',3],['The Trees',3],['For Anne Gregory',3]].forEach(([c,m])=>chapterItem(c,m,'VIII','Explain with reference to the context','rtc',false,q=>isRTC(q)||/context/.test(text(q))));
    // Q41-44: four 4M questions; Q41 is Quote from Memory, Q42-44 are prose, prose, poetry. Main chapter allocation is exact: Fire and Ice + Tiger + Nelson + Baker.
    let quote=take(poolChapter('Fire and Ice',4).filter(isQuote),used,1,'Fire and Ice quote',errors)[0];
    if(!quote){
      // Do not mislabel a long-answer item as a quote. Keep a clearly identified content gap instead.
      errors.push('Q41: no Fire and Ice quote-from-memory item in the loaded bank');
    } else {
      const or=take(poolChapter('A Tiger in the Zoo',4).filter(q=>isQuote(q)),altUsed,1,'Q41 Tiger quote OR',errors)[0]||null;
      add('IX','Quote from memory',4,'quote',quote,or);
    }
    chapterItem('Nelson Mandela: Long Walk to Freedom',4,'X','Answer the following questions in seven to eight sentences each','long4',true,q=>!isRTC(q)&&!isQuote(q));
    chapterItem('A Baker from Goa',4,'X','Answer the following questions in seven to eight sentences each','long4',true,q=>!isRTC(q)&&!isQuote(q));
    chapterItem('A Tiger in the Zoo',4,'X','Answer the following questions in seven to eight sentences each','long4',true,q=>!isRTC(q)&&!isQuote(q));
    // Q45 unseen passage; Q46 essay; Q47 letter.
    topicItem('comprehension',4,'XI','Read the passage carefully and answer','comprehension',false,isComp);
    topicItem('composition',5,'XII','Write an essay of about 18–20 sentences','essay',true,isEssay);
    topicItem('composition',5,'XIII','Letter Writing','letter',true,isLetter);
    const marks=items.reduce((s,x)=>s+Number(x.marks||0),0);
    if(items.length!==47)errors.unshift(`VALIDATION: ${items.length}/47 main questions built`);
    if(marks!==100)errors.unshift(`VALIDATION: ${marks}/100 marks built`);
    return {selected:items,shortages:errors};
  });}
  window.buildMock=function(){return make(20260000+paperNo*104729);};
  function render(){const grid=document.querySelector('.quick-grid');if(!grid)return;grid.querySelectorAll('.mock-paper-card').forEach(x=>x.remove());let html='';for(let i=1;i<=10;i++)html+=`<button class="quick-card featured mock-paper-card" data-paper="${i}" type="button"><span>47Q</span><b>Mock Paper ${i}</b><small>100 marks • 3:15 hours • Exact blueprint order</small></button>`;grid.insertAdjacentHTML('beforeend',html);grid.querySelectorAll('.mock-paper-card').forEach(b=>b.onclick=()=>{paperNo=Number(b.dataset.paper)||1;window.start('mock',{title:`Class 10 English 15-E • Mock Paper ${paperNo}`});});}
  document.addEventListener('DOMContentLoaded',()=>setTimeout(render,100));
})();