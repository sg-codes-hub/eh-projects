const BANK_MANIFEST={
  firstFlight:[
    '../data/questions.json',
    '../data/banks/first-flight-practice-batch-01.json',
    '../data/banks/first-flight-practice-batch-02.json',
    '../data/banks/descriptive-prose-treasure-01.json'
  ],
  footprints:[
    '../data/banks/footprints-practice-batch-01.json',
    '../data/banks/footprints-practice-batch-02.json',
    '../data/banks/descriptive-supplementary-treasure-01.json'
  ],
  poetry:[
    '../data/banks/descriptive-poetry-treasure-01.json'
  ],
  grammar:[
    '../data/banks/grammar-practice-batch-01.json',
    '../data/banks/grammar-practice-batch-02.json',
    '../data/banks/grammar-practice-batch-03.json',
    '../data/banks/grammar-practice-batch-04.json'
  ],
  analogy:['../data/banks/analogy-batch-01.json'],
  rtc:['../data/banks/rtc-quote-memory-batch-01.json'],
  composition:['../data/banks/composition-batch-01.json'],
  comprehension:[
    '../data/banks/comprehension-batch-01.json',
    '../data/banks/comprehension-batch-02.json',
    '../data/banks/comprehension-composition-treasure-01.json'
  ]
};
async function loadJson(url){const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw new Error(`Unable to load ${url}`);return r.json()}
function unwrap(doc){let d=doc;if(typeof d?.content==='string'){try{d=JSON.parse(d.content)}catch{throw new Error('Invalid JSON content wrapper')}}if(Array.isArray(d))return d;if(Array.isArray(d?.items))return d.items;if(Array.isArray(d?.questions))return d.questions;return []}
function normalize(item){const x={...item};if(x.question&&!x.prompt)x.prompt=x.question;if(x.question_type&&!x.type)x.type=x.question_type;if(x.answer_points&&!x.answer)x.answer=x.answer_points;return x}
async function loadBank(type){const urls=BANK_MANIFEST[type]||[];const docs=await Promise.all(urls.map(loadJson));return docs.flatMap(unwrap).map(normalize)}
async function loadAll(){const groups=Object.keys(BANK_MANIFEST);const docs=await Promise.all(groups.map(async type=>[type,await loadBank(type)]));const seen=new Set();return docs.flatMap(([type,items])=>items.map(q=>({...q,bank_group:type}))).filter(q=>{const key=q.id||`${q.module||''}|${q.chapter||''}|${q.marks||''}|${q.question||q.prompt||''}`;if(seen.has(key))return false;seen.add(key);return true})}
async function loadPractice(type='grammar',count=10){const items=await loadBank(type);return shuffle(items).slice(0,Math.min(count,items.length))}
function shuffle(items){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
window.QuestionBankLoader={loadBank,loadAll,loadPractice,BANK_MANIFEST};