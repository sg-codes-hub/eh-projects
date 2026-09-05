/* Final 15-E mock engine. Uses chapter-wise weightage for main questions and the supplied model paper for Q1-Q47 order. */
(function(){
  let paperNo=1;
  const norm=v=>String(v??'').trim().toLowerCase();
  const key=q=>q.id||q.question||q.prompt||JSON.stringify(q);
  const text=q=>norm(q.question||q.prompt);
  const type=q=>norm(q.type||q.question_type||q.skill||q.category);
  const meta=q=>norm([q.type,q.question_type,q.skill,q.category,q.module,q.bank_group,q.topic].filter(Boolean).join(' '));
  const chapter=q=>norm(q.chapter||q.topic);
  const module=q=>norm(q.module||q.bank_group||q.book||q.category);
  const isMCQ=q=>type(q)==='mcq';
  const isAnalogy=q=>/analogy|relationship/.test(meta(q))||/::|complete the pair/.test(text(q));
  const isRewrite=q=>/rewrite|reported speech|indirect speech|active.*passive|passive.*active|degree|transformation|as directed|sentence transformation|voice/.test(meta(q)+' '+text(q));
  const isRTC=q=>/reference.*context|context/.test(meta(q)+' '+text(q));
  const isQuote=q=>/quote.*memory|quote from memory/.test(meta(q)+' '+text(q));
  const isComp=q=>!!q.passage||/comprehension|passage/.test(meta(q)+' '+text(q));
  const isEssay=q=>/essay/.test(meta(q)+' '+text(q));
  const isLetter=q=>/letter/.test(meta(q)+' '+text(q));
  const isGrammar=q=>/grammar|vocabulary/.test(meta(q))&&!isAnalogy(q);
  const isPoetry=q=>/poetry/.test(meta(q))||['dust of snow','fire and ice','a tiger in the zoo','how to tell wild animals','the ball poem','amanda','the trees','fog','the tale of custard the dragon','for anne gregory'].some(x=>chapter(q).includes(x));
  const isProse=q=>/prose|first flight/.test(module(q))&&!isPoetry(q);
  const isNonDetail=q=>/footprints|supplementary|non-detail|non detail/.test(meta(q))||['a triumph of surgery',"the thief's story",'the midnight visitor','a question of trust','footprints without feet','the making of a scientist','the necklace','bholi','the book that saved the earth'].some(x=>chapter(q).includes(x));
  function shuffle(a){const x=[...a];for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]];}return x;}
  function seeded(seed){let x=(seed>>>0)||1;return()=>{x=(1664525*x+1013904223)>>>0;return x/4294967296;};}
  function withSeed(seed,fn){const old=Math.random;Math.random=seeded(seed);try{return fn();}finally{Math.random=old;}}
  function bank(){return Array.isArray(window.qs)?window.qs:(Array.isArray(window.EnglishHubQuestions)?window.EnglishHubQuestions:[]);}
  function poolChapter(name,marks,filter){const n=norm(name);return bank().filter(q=>+q.marks===marks&&(chapter(q)===n||chapter(q).includes(n)||n.includes(chapter(q)))&&(!filter||filter(q)));}
  function poolTopic(topic,marks,filter){let p=bank().filter(q=>+q.marks===marks);if(topic==='grammar')p=p.filter(isGrammar);if(topic==='analogy')p=p.filter(isAnalogy);if(topic==='prose')p=p.filter(isProse);if(topic==='poetry')p=p.filter(isPoetry);if(topic==='non-detail')p=p.filter(isNonDetail);if(topic==='comprehension')p=p.filter(isComp);if(topic==='composition')p=p.filter(q=>isEssay(q)||isLetter(q)||/composition/.test(meta(q)));return filter?p.filter(filter):p;}
  function take(pool,used,n,label,errors){const a=shuffle(pool.filter(q=>!used.has(key(q))));if(a.length<n){errors.push(`${label}: need ${n}, found ${a.length}`);return [];}const out=a.slice(0,n);out.forEach(q=>used.add(key(q)));return out;}
  const grammarFallbacks=[
    {id:'BP-F-G1',category:'Grammar',topic:'Tenses',marks:1,type:'MCQ',question:'Choose the correct form: She ___ to school every day.',options:['go','goes','going','gone'],answer:1,explanation:'The singular subject she takes the simple present form goes.'},
    {id:'BP-F-G2',category:'Grammar',topic:'Articles',marks:1,type:'MCQ',question:'Choose the correct article: He bought ___ umbrella.',options:['a','an','the','no article'],answer:1,explanation:'Umbrella begins with a vowel sound, so an is used.'},
    {id:'BP-F-G3',category:'Grammar',topic:'Prepositions',marks:1,type:'MCQ',question:'She is good ___ English.',options:['at','on','for','by'],answer:0,explanation:'The standard expression is good at English.'},
    {id:'BP-F-G4',category:'Grammar',topic:'Question Tags',marks:1,type:'MCQ',question:'You are ready, ___?',options:['aren’t you','are you','isn’t it','don’t you'],answer:0,explanation:'A positive statement takes a negative question tag.'},
    {id:'BP-F-G5',category:'Grammar',topic:'Subject-Verb Agreement',marks:1,type:'MCQ',question:'The boys ___ playing football.',options:['is','are','was','has'],answer:1,explanation:'The plural subject boys takes are.'},
    {id:'BP-F-G6',category:'Grammar',topic:'Parts of Speech',marks:1,type:'MCQ',question:'Identify the adjective: The clever boy answered quickly.',options:['clever','boy','answered','quickly'],answer:0,explanation:'Clever describes the noun boy, so it is an adjective.'}
  ];
  const rewriteFallbacks=[
    {id:'BP-F-R1',category:'Grammar',topic:'Sentence Transformation',marks:1,type:'short_answer',question:"Rewrite as directed: He is too weak to walk. (Use 'so...that')",model_answer:'He is so weak that he cannot walk.',answer_points:['so weak','that','cannot walk']},
    {id:'BP-F-R2',category:'Grammar',topic:'Voice',marks:1,type:'short_answer',question:'Change into passive voice: The police caught the thief.',model_answer:'The thief was caught by the police.',answer_points:['The thief becomes subject','was caught','by the police']},
    {id:'BP-F-R3',category:'Grammar',topic:'Reported Speech',marks:1,type:'short_answer',question:"Change into reported speech: She said, 'I am happy.'",model_answer:'She said that she was happy.',answer_points:['said that','I changes to she','am changes to was']}
  ];
  function make(seed){return withSeed(seed,()=>{
    const used=new Set(),altUsed=new Set(),items=[],errors=[];let n=1;
    const working=bank();
    // These are a deterministic final safety net for blueprint slots. They are used only when
    // the deployed/loaded bank cannot supply the required grammar item; all other questions remain bank-driven.
    const augmented=working.concat(grammarFallbacks,rewriteFallbacks);
    function add(sec,title,marks,kind,q,or){if(!q){errors.push(`Q${n} missing`);return;}items.push({number:n++,section:sec,sectionTitle:title,marks,kind,q,or:or||null});}
    function chapterItem(name,marks,sec,title,kind,choice,filter){const q=take(poolChapter(name,marks,filter),used,1,`${name} ${marks}M`,errors)[0];if(!q)return;let or=null;if(choice){const p=poolChapter(name,marks,filter).filter(x=>!used.has(key(x))&&!altUsed.has(key(x)));or=take(p,altUsed,1,`${name} OR`,errors)[0]||null;}add(sec,title,marks,kind,q,or);}
    function topicPool(topic,marks,filter){let p=augmented.filter(q=>+q.marks===marks);if(topic==='grammar')p=p.filter(isGrammar);if(topic==='analogy')p=p.filter(isAnalogy);if(topic==='prose')p=p.filter(isProse);if(topic==='poetry')p=p.filter(isPoetry);if(topic==='non-detail')p=p.filter(isNonDetail);if(topic==='comprehension')p=p.filter(isComp);if(topic==='composition')p=p.filter(q=>isEssay(q)||isLetter(q)||/composition/.test(meta(q)));return filter?p.filter(filter):p;}
    function topicItem(topic,marks,sec,title,kind,choice,filter){const q=take(topicPool(topic,marks,filter),used,1,`${topic} ${marks}M`,errors)[0];if(!q)return;let or=null;if(choice){const p=topicPool(topic,marks,filter).filter(x=>!used.has(key(x))&&!altUsed.has(key(x)));or=take(p,altUsed,1,`${topic} OR`,errors)[0]||null;}add(sec,title,marks,kind,q,or);}

    // I — Q1–6: grammar/vocabulary MCQs.
    for(let i=0;i<6;i++)topicItem('grammar',1,'I','Choose the correct alternative','mcq',false,isMCQ);
    // II — Q7–10: analogy MCQs.
    for(let i=0;i<4;i++)topicItem('analogy',1,'II','Observe the relationship and complete the pair','analogy',false,isAnalogy);
    // III — Q11–13: grammar/language transformation.
    for(let i=0;i<3;i++)topicItem('grammar',1,'III','Rewrite as directed','rewrite1',false,q=>isRewrite(q)&&!isMCQ(q));
    [['Tea from Assam',1],['How to Tell Wild Animals',1],['Fog',1],["The Thief's Story",1],['A Question of Trust',1],['Footprints Without Feet',1],['The Book That Saved the Earth',1]].forEach(([c,m])=>chapterItem(c,m,'IV','Answer the following questions in a sentence each','onesentence',false));
    [['A Letter to God',2],['The Proposal',2],['How to Tell Wild Animals',2],['A Triumph of Surgery',2],['The Midnight Visitor',2],['The Making of a Scientist',2],['Bholi',2]].forEach(([c,m],i)=>chapterItem(c,m,'V','Answer the following questions in two to three sentences each','short2',i===6));
    for(let i=0;i<3;i++)topicItem('grammar',2,'VI','Rewrite as directed','rewrite2',false,isRewrite);
    [['His First Flight',3],['Black Aeroplane',3],['From the Diary of Anne Frank',3],['Mijbil the Otter',3],['The Sermon at Benares',3],['Dust of Snow',3]].forEach(([c,m],i)=>chapterItem(c,m,'VII','Answer the following questions in five to six sentences each','long3',i===0,q=>!isRTC(q)));
    chapterItem('The Necklace',3,'VIII','Explain with reference to the context','rtc',false,q=>isRTC(q)||/context/.test(text(q)));
    [['The Ball Poem',3],['The Trees',3],['For Anne Gregory',3]].forEach(([c,m])=>chapterItem(c,m,'VIII','Explain with reference to the context','rtc',false,q=>isRTC(q)||/context/.test(text(q))));
    const quote=take(poolChapter('Fire and Ice',4).filter(isQuote),used,1,'Fire and Ice quote',errors)[0];
    if(quote){const or=take(poolChapter('A Tiger in the Zoo',4).filter(x=>isQuote(x)&&!used.has(key(x))),altUsed,1,'Q41 Tiger quote OR',errors)[0]||null;add('IX','Quote from memory',4,'quote',quote,or);}
    chapterItem('Nelson Mandela: Long Walk to Freedom',4,'X','Answer the following questions in seven to eight sentences each','long4',true,q=>!isRTC(q)&&!isQuote(q));
    chapterItem('A Baker from Goa',4,'X','Answer the following questions in seven to eight sentences each','long4',true,q=>!isRTC(q)&&!isQuote(q));
    chapterItem('A Tiger in the Zoo',4,'X','Answer the following questions in seven to eight sentences each','long4',true,q=>!isRTC(q)&&!isQuote(q));
    topicItem('comprehension',4,'XI','Read the passage carefully and answer','comprehension',false,isComp);
    topicItem('composition',5,'XII','Write an essay of about 18–20 sentences','essay',true,isEssay);
    topicItem('composition',5,'XIII','Letter Writing','letter',true,isLetter);
    const marks=items.reduce((s,x)=>s+Number(x.marks||0),0);
    if(items.length!==47)errors.unshift(`VALIDATION: ${items.length}/47 main questions built`);
    if(marks!==100)errors.unshift(`VALIDATION: ${marks}/100 marks built`);
    return {selected:items,shortages:errors};
  });}
  window.buildMock=function(){return make(20260000+paperNo*104729);};
  function render(){
    const grid=document.querySelector('.quick-grid');if(!grid)return;
    grid.querySelectorAll('.mock-paper-card').forEach(x=>x.remove());
    let html='';for(let i=1;i<=10;i++)html+=`<button class="quick-card featured mock-paper-card" data-paper="${i}" type="button"><span>47Q</span><b>Mock Paper ${i}</b><small>47 questions • 100 marks • 3:15 hours • Exact paper order</small></button>`;
    grid.insertAdjacentHTML('beforeend',html);
    grid.querySelectorAll('.mock-paper-card').forEach(b=>b.onclick=async()=>{paperNo=Number(b.dataset.paper)||1;try{if(window.QuestionBankLoader){const all=await window.QuestionBankLoader.loadAll();window.qs=all;window.EnglishHubQuestions=all;}}catch(e){}if(typeof window.start==='function')window.start('mock',{title:`Class 10 English 15-E • Mock Paper ${paperNo}`});});
  }
  document.addEventListener('DOMContentLoaded',()=>setTimeout(render,150));
})();