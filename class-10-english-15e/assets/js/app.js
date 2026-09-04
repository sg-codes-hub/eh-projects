const DEMO_QUESTIONS=[
{id:'demo-1',module:'First Flight',chapter:'Sample Practice',marks:1,type:'MCQ',question:'Which skill is being tested in this sample question?',options:['Recall','Account creation','File upload','Login'],answer:0,explanation:'Phase 1 uses this sample only to demonstrate the quiz engine. The full syllabus question bank will be added in Phase 2.'},
{id:'demo-2',module:'Grammar',chapter:'Sample Practice',marks:1,type:'MCQ',question:'Choose the best option to complete the sentence: She ___ to school every day.',options:['go','goes','going','gone'],answer:1,explanation:'With the singular subject “She” in the simple present, the verb takes -s: “goes.”'},
{id:'demo-3',module:'Analogy',chapter:'Sample Practice',marks:1,type:'MCQ',question:'Complete the analogy: kind : kindness :: happy : ___',options:['happily','happiness','happier','happy'],answer:1,explanation:'“Kindness” is the noun formed from “kind”; “happiness” is the noun formed from “happy.”'},
{id:'demo-4',module:'Footprints Without Feet',chapter:'Sample Practice',marks:2,type:'MCQ',question:'A two-mark question in the final bank will require a short developed answer. What should the student focus on?',options:['A random guess','Relevant points and clear expression','Only copying the question','Writing unrelated details'],answer:1,explanation:'The engine will support mark-specific practice and feedback. This sample demonstrates the 2-mark mode.'},
{id:'demo-5',module:'Composition',chapter:'Sample Practice',marks:5,type:'MCQ',question:'Which is a key feature of good exam composition?',options:['Clear organisation','No paragraphing','Unrelated ideas','Ignoring the task'],answer:0,explanation:'The Phase 1 engine can later host essay and letter practice. This sample demonstrates the 5-mark filter.'}
];

const MODULES=[
 {id:'first-flight',icon:'📖',title:'First Flight',desc:'Prose & poetry practice',filter:q=>q.module==='First Flight'},
 {id:'footprints',icon:'📚',title:'Footprints Without Feet',desc:'Supplementary reader practice',filter:q=>q.module==='Footprints Without Feet'},
 {id:'grammar',icon:'✏️',title:'Grammar & Vocabulary',desc:'Language practice',filter:q=>q.module==='Grammar'},
 {id:'analogy',icon:'🔤',title:'Analogy',desc:'Word relationships',filter:q=>q.module==='Analogy'},
 {id:'comprehension',icon:'🔎',title:'Comprehension',desc:'Unseen passage practice',filter:q=>q.module==='Comprehension'},
 {id:'composition',icon:'📝',title:'Composition',desc:'Essay & letter practice',filter:q=>q.module==='Composition'}
];

let state={mode:'',questions:[],index:0,score:0,answered:false,correct:0,wrong:0};
const $=id=>document.getElementById(id);

function showView(id){document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));$(id).classList.add('active');window.scrollTo({top:0,behavior:'smooth'});}
function shuffled(a){return [...a].sort(()=>Math.random()-.5)}
function filteredQuestions(filter){return DEMO_QUESTIONS.filter(filter)}
function startTest(mode,opts={}){
 let qs=[];
 if(mode==='module') qs=filteredQuestions(opts.filter);
 else if(mode==='marks') qs=DEMO_QUESTIONS.filter(q=>q.marks===Number(opts.marks));
 else if(mode==='mock') qs=shuffled(DEMO_QUESTIONS);
 if(!qs.length){alert('This practice area is ready in the Phase 1 interface, but its full question bank will be populated in Phase 2.');return;}
 state={mode,questions:shuffled(qs),index:0,score:0,answered:false,correct:0,wrong:0};
 $('practiceEyebrow').textContent=mode==='mock'?'FULL MOCK TEST':mode==='marks'?`${opts.marks}-MARK PRACTICE`:'CHAPTER PRACTICE';
 $('practiceTitle').textContent=mode==='mock'?'Class 10 English 15-E Mock Test':mode==='marks'?`${opts.marks}-Mark Questions`:opts.title;
 showView('practice');renderQuestion();
}
function renderQuestion(){
 const q=state.questions[state.index];state.answered=false;
 $('progressText').textContent=`Question ${state.index+1} of ${state.questions.length}`;
 $('progressBar').style.width=`${((state.index)/state.questions.length)*100}%`;
 $('quizArea').innerHTML=`<article class="question-card"><div class="question-meta"><span class="pill">${q.module}</span><span class="pill">${q.marks} mark${q.marks>1?'s':''}</span><span class="pill">${q.type}</span></div><h3 class="question-text">${q.question}</h3><div class="options">${q.options.map((o,i)=>`<button class="option" data-i="${i}" type="button">${String.fromCharCode(65+i)}. ${o}</button>`).join('')}</div><div id="feedback"></div><div class="question-actions"><button id="quitBtn" class="secondary-btn" type="button">Exit</button><button id="nextBtn" class="primary-btn" type="button" disabled>${state.index===state.questions.length-1?'Finish':'Next'}</button></div></article>`;
 document.querySelectorAll('.option').forEach(btn=>btn.addEventListener('click',()=>answer(Number(btn.dataset.i))));
 $('nextBtn').addEventListener('click',nextQuestion);$('quitBtn').addEventListener('click',()=>showView('dashboard'));
}
function answer(i){if(state.answered)return;state.answered=true;const q=state.questions[state.index];const buttons=document.querySelectorAll('.option');buttons.forEach((b,n)=>{b.disabled=true;if(n===q.answer)b.classList.add('correct');if(n===i&&i!==q.answer)b.classList.add('wrong')});if(i===q.answer){state.correct++;state.score+=q.marks}else state.wrong++;$('feedback').innerHTML=`<div class="feedback"><strong>${i===q.answer?'✓ Correct':'✗ Not quite'}</strong><span>${q.explanation}</span></div>`;$('nextBtn').disabled=false;}
function nextQuestion(){if(!state.answered)return;if(state.index<state.questions.length-1){state.index++;renderQuestion()}else finish()}
function finish(){const total=state.questions.reduce((s,q)=>s+q.marks,0);$('scoreValue').textContent=state.score;$('scoreTotal').textContent=`/ ${total}`;$('resultTitle').textContent=state.mode==='mock'?'Mock Test Result':'Practice Result';$('resultStats').innerHTML=`<div><b>${state.correct}</b><span>Correct</span></div><div><b>${state.wrong}</b><span>Wrong</span></div><div><b>${state.questions.length}</b><span>Questions</span></div>`;const pct=Math.round((state.score/total)*100);$('resultMessage').textContent=pct>=80?'Excellent start. Keep strengthening exam-specific skills.':pct>=50?'Good attempt. Review explanations and practise again.':'Keep practising. Use the chapter and mark-wise modes to build confidence.';localStorage.setItem('eh15e-last-result',JSON.stringify({score:state.score,total,correct:state.correct,wrong:state.wrong,date:new Date().toISOString()}));showView('result');}

function init(){
 $('moduleGrid').innerHTML=MODULES.map(m=>`<button class="module-card" data-module="${m.id}" type="button"><div class="module-icon">${m.icon}</div><h3>${m.title}</h3><p>${m.desc}</p></button>`).join('');
 document.querySelectorAll('[data-module]').forEach(btn=>{const m=MODULES.find(x=>x.id===btn.dataset.module);btn.addEventListener('click',()=>startTest('module',{filter:m.filter,title:m.title}))});
 document.querySelectorAll('.quick-card').forEach(btn=>btn.addEventListener('click',()=>startTest(btn.dataset.mode,{marks:btn.dataset.marks,title:btn.dataset.title})));
 $('homeBtn').addEventListener('click',()=>showView('dashboard'));$('backBtn').addEventListener('click',()=>showView('dashboard'));$('resultHomeBtn').addEventListener('click',()=>showView('dashboard'));$('retryBtn').addEventListener('click',()=>startTest(state.mode,{marks:state.questions[0]?.marks,title:$('practiceTitle').textContent}));
}
document.addEventListener('DOMContentLoaded',init);
