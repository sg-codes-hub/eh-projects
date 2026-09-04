const DEMO_QUESTIONS = [
  {id:'ff-demo-01',module:'First Flight',chapter:'Sample Practice',marks:1,type:'MCQ',skill:'Recall',question:'Which section of the First Flight book contains poems?',options:['Poetry','Grammar','Composition','Supplementary Reader'],answer:0,explanation:'First Flight contains both prose and poetry.'},
  {id:'ff-demo-02',module:'First Flight',chapter:'Sample Practice',marks:2,type:'MCQ',skill:'Literature',question:'Which approach is most suitable for a two-mark literature answer?',options:['Give relevant points in clear sentences','Write only the chapter title','Copy the question twice','Add unrelated details'],answer:0,explanation:'A short-answer response should be relevant, concise and clearly expressed.'},
  {id:'ff-demo-03',module:'First Flight',chapter:'Sample Practice',marks:3,type:'MCQ',skill:'Literature',question:'For a three-mark literature answer, what should the student normally provide?',options:['A developed answer with supporting points','Only one word','Only the question','An unrelated paragraph'],answer:0,explanation:'The board-style practice engine treats three-mark questions as developed answers.'},
  {id:'ff-demo-04',module:'First Flight',chapter:'Sample Practice',marks:4,type:'MCQ',skill:'Literature',question:'What is most important in a four-mark literature answer?',options:['A clear, organised response addressing all parts','A random list of words','Only the introduction','No connection to the text'],answer:0,explanation:'Longer answers should address the task fully and remain connected to the prescribed text.'},
  {id:'fp-demo-01',module:'Footprints Without Feet',chapter:'Sample Practice',marks:1,type:'MCQ',skill:'Recall',question:'Footprints Without Feet is the supplementary reader for Class 10 English.',options:['True','False','Only for grammar','Only for composition'],answer:0,explanation:'Footprints Without Feet is the supplementary reader included in the prescribed English course.'},
  {id:'fp-demo-02',module:'Footprints Without Feet',chapter:'Sample Practice',marks:2,type:'MCQ',skill:'Literature',question:'What should a two-mark supplementary-reader answer focus on?',options:['Relevant events and characters from the story','Personal information unrelated to the story','Only spelling','Only the title'],answer:0,explanation:'The response should use relevant details from the prescribed story.'},
  {id:'gr-demo-01',module:'Grammar',chapter:'Simple Present Tense',marks:1,type:'MCQ',skill:'Grammar',question:'Choose the correct form: She ___ to school every day.',options:['go','goes','going','gone'],answer:1,explanation:'With the singular subject “She” in the simple present, the verb takes -s: “goes.”'},
  {id:'gr-demo-02',module:'Grammar',chapter:'Question Tags',marks:1,type:'MCQ',skill:'Grammar',question:'Choose the correct question tag: He is ready, ___.',options:["isn't he?",'is he?','doesn’t he?','wasn’t he?'],answer:0,explanation:'A positive statement with “is” takes the negative tag “isn’t he?”.'},
  {id:'gr-demo-03',module:'Grammar',chapter:'Reported Speech',marks:2,type:'MCQ',skill:'Grammar',question:'Which skill is tested when direct speech is changed into reported speech?',options:['Narration transformation','Spelling only','Paragraph indentation','Handwriting'],answer:0,explanation:'Changing direct speech into reported speech is a narration transformation.'},
  {id:'an-demo-01',module:'Analogy',chapter:'Word Formation',marks:1,type:'MCQ',skill:'Vocabulary',question:'Complete the analogy: kind : kindness :: happy : ___.',options:['happily','happiness','happier','happy'],answer:1,explanation:'“Kindness” is the noun formed from “kind”; “happiness” is the noun formed from “happy.”'},
  {id:'an-demo-02',module:'Analogy',chapter:'Opposites',marks:1,type:'MCQ',skill:'Vocabulary',question:'Complete the analogy: humane : inhumane :: polite : ___.',options:['impolite','politely','politeness','politer'],answer:0,explanation:'The prefix “im-” forms the opposite of “polite”: “impolite.”'},
  {id:'co-demo-01',module:'Comprehension',chapter:'Unseen Passage',marks:4,type:'MCQ',skill:'Reading',passage:'Water is essential for life. Conserving water helps communities meet their needs and protects this limited resource for the future.',question:'What is the main idea of the passage?',options:['The importance of conserving water','How to build a bridge','Why books are expensive','How to learn grammar'],answer:0,explanation:'The passage focuses on the importance of water conservation.'},
  {id:'cp-demo-01',module:'Composition',chapter:'Essay',marks:5,type:'MCQ',skill:'Writing',question:'Which feature strengthens a five-mark essay?',options:['Clear organisation and relevant ideas','No paragraphing','Unrelated ideas','Ignoring the topic'],answer:0,explanation:'A good essay should address the topic clearly and organise relevant ideas logically.'},
  {id:'cp-demo-02',module:'Composition',chapter:'Letter Writing',marks:5,type:'MCQ',skill:'Writing',question:'What should a formal letter maintain throughout?',options:['Appropriate format, purpose and formal language','Only informal slang','No clear purpose','Random ideas'],answer:0,explanation:'A formal letter requires an appropriate format, clear purpose and suitable language.'}
];

const MODULES = [
 {id:'first-flight',icon:'📖',title:'First Flight',desc:'Prose & poetry practice',filter:q=>q.module==='First Flight'},
 {id:'footprints',icon:'📚',title:'Footprints Without Feet',desc:'Supplementary reader practice',filter:q=>q.module==='Footprints Without Feet'},
 {id:'grammar',icon:'✏️',title:'Grammar & Vocabulary',desc:'Language practice',filter:q=>q.module==='Grammar'},
 {id:'analogy',icon:'🔤',title:'Analogy',desc:'Word relationships',filter:q=>q.module==='Analogy'},
 {id:'comprehension',icon:'🔎',title:'Comprehension',desc:'Unseen passage practice',filter:q=>q.module==='Comprehension'},
 {id:'composition',icon:'📝',title:'Composition',desc:'Essay & letter practice',filter:q=>q.module==='Composition'}
];

const BLUEPRINT = {1:20,2:10,3:10,4:5,5:2};
let allQuestions = [...DEMO_QUESTIONS];
let state = {mode:'',questions:[],index:0,score:0,answered:false,correct:0,wrong:0,answers:[],startedAt:null,elapsed:0,marksFilter:null};
let timerId = null;
const $ = id => document.getElementById(id);

function showView(id){document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));$(id).classList.add('active');window.scrollTo({top:0,behavior:'smooth'});}
function shuffled(a){return [...a].sort(()=>Math.random()-.5)}
function saveProgress(){localStorage.setItem('eh15e-progress',JSON.stringify({lastResult:state.score,attempted:state.questions.length,date:new Date().toISOString()}));}
function escapeHtml(value){return String(value).replace(/[&<>\'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function loadQuestions(){
  fetch('data/questions.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error('data unavailable');return r.json()}).then(data=>{if(Array.isArray(data.questions))allQuestions=data.questions;renderModules();}).catch(()=>renderModules());
}
function renderModules(){
 $('moduleGrid').innerHTML=MODULES.map(m=>{const count=allQuestions.filter(m.filter).length;return `<button class="module-card" data-module="${m.id}" type="button"><div class="module-icon">${m.icon}</div><h3>${m.title}</h3><p>${m.desc}</p><small class="module-count">${count} sample question${count===1?'':'s'}</small></button>`}).join('');
 document.querySelectorAll('[data-module]').forEach(btn=>{const m=MODULES.find(x=>x.id===btn.dataset.module);btn.addEventListener('click',()=>startTest('module',{filter:m.filter,title:m.title}))});
}
function eligibleForMarks(marks){return allQuestions.filter(q=>Number(q.marks)===Number(marks));}
function startTest(mode,opts={}){
 stopTimer();let qs=[];
 if(mode==='module')qs=allQuestions.filter(opts.filter);
 else if(mode==='marks')qs=eligibleForMarks(opts.marks);
 else if(mode==='mock'){
   const missing=[];for(const [marks,count] of Object.entries(BLUEPRINT)){const pool=eligibleForMarks(marks);if(pool.length<count)missing.push(`${count} questions of ${marks} mark${marks>1?'s':''}`);}
   if(missing.length){showMockNotice(missing);return;}
   for(const [marks,count] of Object.entries(BLUEPRINT))qs.push(...shuffled(eligibleForMarks(marks)).slice(0,count));
 }
 if(!qs.length){showEmptyNotice();return;}
 state={mode,questions:shuffled(qs),index:0,score:0,answered:false,correct:0,wrong:0,answers:[],startedAt:Date.now(),elapsed:0,marksFilter:opts.marks||null};
 $('practiceEyebrow').textContent=mode==='mock'?'FULL MOCK TEST':mode==='marks'?`${opts.marks}-MARK PRACTICE`:'PRACTICE';
 $('practiceTitle').textContent=mode==='mock'?'Class 10 English 15-E Mock Test':mode==='marks'?`${opts.marks}-Mark Questions`:opts.title;
 showView('practice');renderQuestion();
 if(mode==='mock')startTimer(195*60);
}
function showEmptyNotice(){alert('This practice area is ready in the Phase 1 interface, but its question bank is still being populated.');}
function showMockNotice(missing){alert(`The 47-question mock engine is ready, but the Phase 1 sample bank is not large enough yet.\n\nStill needed: ${missing.join(', ')}.\n\nThese limits will disappear when the complete question bank is added in Phase 2.`);}
function startTimer(seconds){let remaining=seconds;updateTimer(remaining);timerId=setInterval(()=>{remaining--;state.elapsed=(seconds-remaining);updateTimer(remaining);if(remaining<=0){stopTimer();finish(true)}},1000)}
function stopTimer(){if(timerId){clearInterval(timerId);timerId=null}}
function updateTimer(seconds){const el=$('timer');if(!el)return;const h=Math.floor(seconds/3600),m=Math.floor((seconds%3600)/60),s=seconds%60;el.textContent=`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;el.classList.toggle('timer-warning',seconds<=300)}
function renderQuestion(){
 const q=state.questions[state.index];state.answered=false;$('progressText').textContent=`Question ${state.index+1} of ${state.questions.length}`;$('progressBar').style.width=`${((state.index)/state.questions.length)*100}%`;
 const passage=q.passage?`<div class="passage"><strong>Read the passage</strong><p>${escapeHtml(q.passage)}</p></div>`:'';
 $('quizArea').innerHTML=`<article class="question-card">${state.mode==='mock'?'<div class="mock-strip"><span>FULL MOCK</span><span id="timer">03:15:00</span></div>':''}<div class="question-meta"><span class="pill">${escapeHtml(q.module)}</span><span class="pill">${q.marks} mark${q.marks>1?'s':''}</span><span class="pill">${escapeHtml(q.type)}</span><span class="pill">${escapeHtml(q.skill||'Exam Skill')}</span></div>${passage}<h3 class="question-text">${escapeHtml(q.question)}</h3><div class="options">${q.options.map((o,i)=>`<button class="option" data-i="${i}" type="button">${String.fromCharCode(65+i)}. ${escapeHtml(o)}</button>`).join('')}</div><div id="feedback"></div><div class="question-actions"><button id="quitBtn" class="secondary-btn" type="button">Exit</button><button id="nextBtn" class="primary-btn" type="button" disabled>${state.index===state.questions.length-1?'Finish':'Next'}</button></div></article>`;
 document.querySelectorAll('.option').forEach(btn=>btn.addEventListener('click',()=>answer(Number(btn.dataset.i))));$('nextBtn').addEventListener('click',nextQuestion);$('quitBtn').addEventListener('click',()=>{stopTimer();showView('dashboard')});
}
function answer(i){if(state.answered)return;state.answered=true;const q=state.questions[state.index];state.answers[state.index]={selected:i,correct:i===q.answer,id:q.id};const buttons=document.querySelectorAll('.option');buttons.forEach((b,n)=>{b.disabled=true;if(n===q.answer)b.classList.add('correct');if(n===i&&i!==q.answer)b.classList.add('wrong')});if(i===q.answer){state.correct++;state.score+=Number(q.marks)}else state.wrong++;$('feedback').innerHTML=`<div class="feedback"><strong>${i===q.answer?'✓ Correct':'✗ Not quite'}</strong><span>${escapeHtml(q.explanation||'Review the lesson and try again.')}</span></div>`;$('nextBtn').disabled=false;}
function nextQuestion(){if(!state.answered)return;if(state.index<state.questions.length-1){state.index++;renderQuestion()}else finish(false)}
function finish(auto=false){stopTimer();const total=state.questions.reduce((s,q)=>s+Number(q.marks),0);const pct=total?Math.round(state.score/total*100):0;saveProgress();$('scoreValue').textContent=state.score;$('scoreTotal').textContent=`/ ${total}`;$('resultTitle').textContent=state.mode==='mock'?'Mock Test Result':'Practice Result';$('resultStats').innerHTML=`<div><b>${state.correct}</b><span>Correct</span></div><div><b>${state.wrong}</b><span>Wrong</span></div><div><b>${state.questions.length}</b><span>Questions</span></div>`;$('resultMessage').textContent=auto?'Time is up. Review your result and practise the weak areas.':pct>=80?'Excellent start. Keep strengthening exam-specific skills.':pct>=50?'Good attempt. Review explanations and practise again.':'Keep practising. Use the chapter and mark-wise modes to build confidence.';localStorage.setItem('eh15e-last-result',JSON.stringify({score:state.score,total,correct:state.correct,wrong:state.wrong,date:new Date().toISOString()}));showReview();}
function showReview(){showView('result');$('reviewList').innerHTML=state.answers.map((a,i)=>{const q=state.questions[i];return `<button class="review-item ${a.correct?'is-correct':'is-wrong'}" data-review="${i}"><span>Q${i+1}</span><b>${a.correct?'Correct':'Review'}</b><small>${q.marks} mark${q.marks>1?'s':''} • ${escapeHtml(q.chapter)}</small></button>`}).join('');document.querySelectorAll('[data-review]').forEach(b=>b.addEventListener('click',()=>reviewQuestion(Number(b.dataset.review))));}
function reviewQuestion(i){const q=state.questions[i],a=state.answers[i];$('reviewDetail').innerHTML=`<div class="review-detail"><div class="question-meta"><span class="pill">${escapeHtml(q.module)}</span><span class="pill">${q.marks} mark${q.marks>1?'s':''}</span></div><h3>${escapeHtml(q.question)}</h3><p><strong>Your answer:</strong> ${escapeHtml(q.options[a.selected]||'Not answered')}</p><p><strong>Correct answer:</strong> ${escapeHtml(q.options[q.answer])}</p><div class="feedback"><strong>${a.correct?'✓ Correct':'✗ Review this question'}</strong><span>${escapeHtml(q.explanation||'')}</span></div></div>`;document.getElementById('reviewDetail').scrollIntoView({behavior:'smooth',block:'start'});}
function init(){document.querySelectorAll('.quick-card').forEach(btn=>btn.addEventListener('click',()=>startTest(btn.dataset.mode,{marks:btn.dataset.marks,title:btn.dataset.title})));$('homeBtn').addEventListener('click',()=>{stopTimer();showView('dashboard')});$('backBtn').addEventListener('click',()=>{stopTimer();showView('dashboard')});$('resultHomeBtn').addEventListener('click',()=>showView('dashboard'));$('retryBtn').addEventListener('click',()=>startTest(state.mode,{marks:state.marksFilter,title:$('practiceTitle').textContent}));loadQuestions();}
document.addEventListener('DOMContentLoaded',init);
