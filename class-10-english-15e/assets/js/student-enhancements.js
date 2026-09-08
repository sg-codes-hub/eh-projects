/* English Hub 15-E — exact blueprint + model-paper aligned mock engine. */
(function(){
  const PAPER_COUNT=10;
  let selectedPaper=1;

  function seededRandom(seed){let x=(seed>>>0)||1;return function(){x=(1664525*x+1013904223)>>>0;return x/4294967296;};}
  function withSeed(seed,fn){const old=Math.random;Math.random=seededRandom(seed);try{return fn();}finally{Math.random=old;}}
  function shuffle(a){const x=[...a];for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]];}return x;}
  function str(v){return String(v??'').trim().toLowerCase();}
  function qtext(q){return str(q.question||q.prompt);}
  function qtype(q){return str(q.type||q.question_type||q.skill||q.category);}
  function qmodule(q){return str(q.module||q.bank_group||q.book||q.category);}
  function qchapter(q){return str(q.chapter||q.topic);}
  function isMCQ(q){return qtype(q)==='mcq';}
  function isAnalogy(q){return /analogy|relationship.*complete|complete.*pair/.test(qtype(q)+' '+qtext(q));}
  function isRewrite(q){return /rewrite|reported speech|indirect speech|active.*passive|passive.*active|degree|transformation|as directed/.test(qtype(q)+' '+qtext(q));}
  function isRTC(q){return /reference.*context|context/.test(qtype(q)+' '+qtext(q));}
  function isQuote(q){return /quote.*memory/.test(qtype(q)+' '+qtext(q));}
  function isComprehension(q){return !!q.passage || /comprehension|passage/.test(qtype(q)+' '+qtext(q));}
  function isEssay(q){return /essay/.test(qtype(q)+' '+qtext(q));}
  function isLetter(q){return /letter/.test(qtype(q)+' '+qtext(q));}
  function isGrammar(q){return /grammar|vocabulary/.test(qmodule(q)) || /grammar|vocabulary/.test(qtype(q));}
  function isPoetry(q){return /poetry/.test(qmodule(q)) || ['dust of snow','fire and ice','a tiger in the zoo','how to tell wild animals','the ball poem','amanda','the trees','fog','the tale of custard the dragon','for anne gregory'].some(x=>qchapter(q).includes(x));}
  function isProse(q){return /prose|first flight/.test(qmodule(q)) && !isPoetry(q);}
  function isNonDetail(q){return /footprints|supplementary|non-detail|non detail/.test(qmodule(q)) || ['a triumph of surgery',"the thief's story",'the midnight visitor','a question of trust','footprints without feet','the making of a scientist','the necklace','bholi','the book that saved the earth'].some(x=>qchapter(q).includes(x));}
  function key(q){return q.id||q.question||q.prompt||JSON.stringify(q);}

  const CHAPTER_ALLOCATION=[
    ['A Letter to God',2,1],['Nelson Mandela: Long Walk to Freedom',4,1],['His First Flight',3,1],['Black Aeroplane',3,1],['From the Diary of Anne Frank',3,1],['A Baker from Goa',4,1],['Tea from Assam',1,1],['Mijbil the Otter',3,1],['The Sermon at Benares',3,1],['The Proposal',2,1],
    ['Dust of Snow',3,1],['Fire and Ice',4,1],['A Tiger in the Zoo',4,1],['How to Tell Wild Animals',1,1],['How to Tell Wild Animals',2,1],['The Ball Poem',3,1],['The Trees',3,1],['Fog',1,1],['For Anne Gregory',3,1],
    ['A Triumph of Surgery',2,1],["The Thief's Story",1,1],['The Midnight Visitor',2,1],['A Question of Trust',1,1],['Footprints Without Feet',1,1],['The Making of a Scientist',2,1],['The Necklace',3,1],['Bholi',2,1],['The Book That Saved the Earth',1,1]
  ];

  function chapterMatches(q,name){const c=qchapter(q),n=str(name);return c===n||c.includes(n)||n.includes(c);}
  function chapterPool(name,marks,extra){let all=Array.isArray(window.qs)?window.qs:[];let p=all.filter(q=>+q.marks===+marks&&chapterMatches(q,name));return extra?p.filter(extra):p;}
  function topicPool(topic,marks,extra){let all=Array.isArray(window.qs)?window.qs:[];let p=all.filter(q=>+q.marks===+marks);if(topic==='grammar')p=p.filter(isGrammar);if(topic==='prose')p=p.filter(isProse);if(topic==='poetry')p=p.filter(isPoetry);if(topic==='non-detail')p=p.filter(isNonDetail);if(topic==='comprehension')p=p.filter(isComprehension);if(topic==='composition')p=p.filter(q=>+q.marks===5&&(!q.chapter||isEssay(q)||isLetter(q)||/composition/.test(qmodule(q))));return extra?p.filter(extra):p;}
  function take(pool,used,count,label,shortages){const available=shuffle(pool.filter(q=>!used.has(key(q))));if(available.length<count){shortages.push(`${label}: need ${count}, found ${available.length}`);return [];}const out=available.slice(0,count);out.forEach(q=>used.add(key(q)));return out;}
  function fallbackByTopic(topic,marks,used,filter,label,shortages){return take(topicPool(topic,marks,filter),used,1,label,shortages)[0]||null;}

  function buildAccurateMock(seed){return withSeed(seed,function(){
    const usedMain=new Set(),usedAlt=new Set(),items=[],shortages=[];let number=1;
    function add(section,title,marks,kindName,q,or){if(!q){shortages.push(`${section} Q${number}: missing question`);return;}items.push({number:number++,section,sectionTitle:title,marks,kind:kindName,q,or:or||null});}
    function mainChapter(name,marks,section,title,kindName,choice,filter){
      const q=take(chapterPool(name,marks,filter),usedMain,1,`${name} ${marks}M`,shortages)[0];if(!q)return;
      let or=null;if(choice){const pool=chapterPool(name,marks,filter).filter(x=>!usedMain.has(key(x))&&!usedAlt.has(key(x)));or=take(pool,usedAlt,1,`${name} OR`,shortages)[0]||null;}
      add(section,title,marks,kindName,q,or);
    }
    function topicQuestion(topic,marks,section,title,kindName,choice,filter){
      const q=take(topicPool(topic,marks,filter),usedMain,1,`${topic} ${marks}M`,shortages)[0];if(!q)return;
      let or=null;if(choice){const pool=topicPool(topic,marks,filter).filter(x=>!usedMain.has(key(x))&&!usedAlt.has(key(x)));or=take(pool,usedAlt,1,`${topic} OR`,shortages)[0]||null;}
      add(section,title,marks,kindName,q,or);
    }
    for(let i=0;i<6;i++)topicQuestion('grammar',1,'I','Choose the correct alternative','mcq',false,isMCQ);
    for(let i=0;i<4;i++)topicQuestion('grammar',1,'II','Observe the relationship and complete the pair','analogy',false,isAnalogy);
    for(let i=0;i<3;i++)topicQuestion('grammar',1,'III','Rewrite as directed','rewrite1',false,q=>isRewrite(q)&&!isMCQ(q));
    [['Tea from Assam',1],['How to Tell Wild Animals',1],['Fog',1],["The Thief's Story",1],['A Question of Trust',1],['Footprints Without Feet',1],['The Book That Saved the Earth',1]].forEach(([n,m])=>mainChapter(n,m,'IV','Answer the following questions in a sentence each','onesentence',false));
    [['A Letter to God',2],['The Proposal',2],['How to Tell Wild Animals',2],['A Triumph of Surgery',2],['The Midnight Visitor',2],['The Making of a Scientist',2],['The Necklace',3]].forEach(([n,m],idx)=>{
      if(idx<6)mainChapter(n,m,'V','Answer the following questions in two to three sentences each','short2',false);
      else {const q=take(chapterPool('The Necklace',3),usedMain,1,'The Necklace 3M',shortages)[0];const or=take(chapterPool('Bholi',2).filter(x=>!usedAlt.has(key(x))),usedAlt,1,'Q27 OR Bholi',shortages)[0]||null;if(q)add('V','Answer the following questions in two to three sentences each',2,'short2',q,or);}
    });
    const bad=items.pop();number--;usedMain.delete(key(bad.q));
    const q27=take(chapterPool('Bholi',2),usedMain,1,'Bholi 2M',shortages)[0]||take(chapterPool('The Necklace',2),usedMain,1,'2M Q27',shortages)[0];
    const or27=take(topicPool('non-detail',2).filter(x=>!usedAlt.has(key(x))&&!usedMain.has(key(x))),usedAlt,1,'Q27 OR',shortages)[0]||null;
    add('V','Answer the following questions in two to three sentences each',2,'short2',q27,or27);
    for(let i=0;i<3;i++)topicQuestion('grammar',2,'VI','Rewrite as directed','rewrite2',false,isRewrite);
    [['His First Flight',3],['Black Aeroplane',3],['From the Diary of Anne Frank',3],['Mijbil the Otter',3],['The Sermon at Benares',3],['Dust of Snow',3]].forEach(([n,m],idx)=>mainChapter(n,m,'VII','Answer the following questions in five to six sentences each','long3',idx===0,q=>!isRTC(q)));
    mainChapter('The Necklace',3,'VIII','Explain with reference to the context','rtc',false,q=>isRTC(q)||/context/.test(qtext(q)));
    [['The Ball Poem',3],['The Trees',3],['For Anne Gregory',3]].forEach(([n,m])=>mainChapter(n,m,'VIII','Explain with reference to the context','rtc',false,q=>isRTC(q)||/context/.test(qtext(q))));
    let quote=take(chapterPool('Fire and Ice',4).filter(q=>isQuote(q)),usedMain,1,'Fire and Ice quote',shortages)[0];
    if(!quote)quote=take(chapterPool('Fire and Ice',4),usedMain,1,'Fire and Ice 4M quote',shortages)[0];
    if(quote){let or=take(chapterPool('A Tiger in the Zoo',4).filter(x=>!usedMain.has(key(x))),usedAlt,1,'Q41 OR Tiger',shortages)[0]||null;add('IX','Quote from memory',4,'quote',quote,or);}
    mainChapter('Nelson Mandela: Long Walk to Freedom',4,'X','Answer the following questions in seven to eight sentences each','long4',true,q=>!isQuote(q)&&!isRTC(q));
    mainChapter('A Baker from Goa',4,'X','Answer the following questions in seven to eight sentences each','long4',true,q=>!isQuote(q)&&!isRTC(q));
    mainChapter('A Tiger in the Zoo',4,'X','Answer the following questions in seven to eight sentences each','long4',true,q=>!isQuote(q)&&!isRTC(q));
    topicQuestion('comprehension',4,'XI','Read the passage carefully and answer','comprehension',false,isComprehension);
    topicQuestion('composition',5,'XII','Write an essay of about 18–20 sentences','essay',true,q=>isEssay(q));
    topicQuestion('composition',5,'XIII','Letter Writing','letter',true,q=>isLetter(q));
    const marks=items.reduce((a,x)=>a+Number(x.marks||0),0);
    if(items.length!==47)shortages.unshift(`Paper validation: built ${items.length} main questions; expected 47.`);
    if(marks!==100)shortages.unshift(`Paper validation: built ${marks} marks; expected 100.`);
    return {selected:items,shortages};
  });}

  window.buildMock=function(){return buildAccurateMock(20260000+selectedPaper*7919);};

  function dedupeMockCards(){
    const seen=new Set();
    document.querySelectorAll('.mock-paper-card').forEach(card=>{
      const paper=card.dataset.paper;
      if(!paper)return;
      if(seen.has(paper))card.remove();
      else seen.add(paper);
    });
  }

  function renderMocks(){
    if(window.__EH_MOCK_CARDS_RENDERED)return;
    const grid=document.querySelector('.quick-grid');if(!grid)return;
    document.querySelectorAll('.mock-paper-card').forEach(x=>x.remove());
    const cards=[];for(let i=1;i<=PAPER_COUNT;i++)cards.push(`<button class="quick-card featured mock-paper-card" data-mode="mock" data-paper="${i}" type="button"><span>47Q</span><b>Mock Paper ${i}</b><small>100 marks • 3:15 hours • Blueprint + model-paper order</small></button>`);
    grid.insertAdjacentHTML('beforeend',cards.join(''));
    window.__EH_MOCK_CARDS_RENDERED=true;
    grid.querySelectorAll('.mock-paper-card').forEach(b=>b.addEventListener('click',()=>{selectedPaper=Number(b.dataset.paper)||1;if(typeof window.start==='function')window.start('mock',{title:`Class 10 English 15-E • Mock Paper ${selectedPaper}`});setTimeout(()=>{const t=document.getElementById('practiceTitle');if(t)t.textContent=`Class 10 English 15-E • Mock Paper ${selectedPaper}`;const e=document.getElementById('practiceEyebrow');if(e)e.textContent=`FULL MOCK TEST • PAPER ${selectedPaper}`;},0);}));
    dedupeMockCards();
  }

  document.addEventListener('DOMContentLoaded',()=>{
    setTimeout(renderMocks,50);
    const dashboard=document.getElementById('dashboard');
    if(dashboard){
      const observer=new MutationObserver(()=>dedupeMockCards());
      observer.observe(dashboard,{childList:true,subtree:true});
    }
  });
})();

/* Guard normal student clicks against the asynchronous question-bank load race. */
(function(){
  'use strict';
  const originalStart=window.start;
  if(typeof originalStart!=='function')return;
  let readyPromise=null;
  function ensureBankReady(){
    if(Array.isArray(window.EnglishHubQuestions)&&window.EnglishHubQuestions.length)return Promise.resolve(window.EnglishHubQuestions);
    if(readyPromise)return readyPromise;
    readyPromise=Promise.resolve().then(function(){
      if(!window.QuestionBankLoader||typeof window.QuestionBankLoader.loadAll!=='function')throw new Error('Question-bank loader unavailable');
      return window.QuestionBankLoader.loadAll();
    }).then(function(all){
      if(!Array.isArray(all)||!all.length)throw new Error('Question bank is empty');
      return all;
    }).catch(function(err){readyPromise=null;throw err;});
    return readyPromise;
  }
  window.start=function(mode,o){
    if(mode!=='mock')return originalStart(mode,o);
    ensureBankReady().then(function(){
      if(typeof window.buildStrictMock!=='function'){
        setTimeout(function(){window.start('mock',o);},0);
        return;
      }
      originalStart(mode,o);
    }).catch(function(err){
      console.error('Mock start blocked until question bank is ready:',err);
      alert('The question bank is still loading. Please wait a moment and try again.');
    });
  };
  window.EnglishHubMockReadinessGuard=true;
})();

/* Dashboard practice-card reliability: wait for the real bank/app before opening a study area. */
(function(){
  'use strict';
  let appReadyPromise=null;
  function ensureAppReady(){
    if(appReadyPromise)return appReadyPromise;
    appReadyPromise=Promise.resolve().then(async function(){
      if(typeof window.load==='function')await window.load();
      else if(window.QuestionBankLoader&&typeof window.QuestionBankLoader.loadAll==='function')await window.QuestionBankLoader.loadAll();
      return true;
    }).catch(function(err){appReadyPromise=null;throw err;});
    return appReadyPromise;
  }
  function markTitle(m){return ({1:'One-mark practice',2:'Two-mark practice',3:'Three-mark practice',4:'Four-mark practice',5:'Five-mark practice'})[m]||`${m}-Mark Practice`;}
  function bind(){
    if(window.__EH_PRACTICE_CARDS_BOUND)return;
    document.addEventListener('click',function(e){
      const card=e.target.closest('.quick-card[data-mode="marks"]');
      if(!card)return;
      e.preventDefault();e.stopImmediatePropagation();
      const marks=Number(card.dataset.marks);
      if(!marks)return;
      ensureAppReady().then(function(){
        if(!Array.isArray(window.EnglishHubQuestions)||!window.EnglishHubQuestions.length){alert('The question bank could not be loaded. Please refresh the page and try again.');return;}
        if(typeof window.start==='function')window.start('marks',{marks,title:markTitle(marks)});
      }).catch(function(err){console.error('Practice-card startup failed:',err);alert('The practice questions are still loading. Please wait a moment and try again.');});
    },true);
    document.addEventListener('click',function(e){
      const card=e.target.closest('#courseGrid .module-card[data-sec]');
      if(!card)return;
      e.preventDefault();e.stopImmediatePropagation();
      const id=card.dataset.sec;
      ensureAppReady().then(function(){
        if(typeof window.openSection==='function')window.openSection(id);
        else alert('The study area is still loading. Please wait a moment and try again.');
      }).catch(function(err){console.error('Study-card startup failed:',err);alert('The study content is still loading. Please wait a moment and try again.');});
    },true);
    window.__EH_PRACTICE_CARDS_BOUND=true;
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();