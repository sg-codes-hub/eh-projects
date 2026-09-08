// Production merged-bank generator. Keep this file in sync with the runtime loader normalization rules.
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const BANKS = path.join(DATA, 'banks');
const OUTPUT = path.join(DATA, 'questions-merged.json');

const poetryChapters = new Set(['Dust of Snow','Fire and Ice','A Tiger in the Zoo','How to Tell Wild Animals','The Ball Poem','Amanda','The Trees','Fog','The Tale of Custard the Dragon','For Anne Gregory']);
function readJson(file){return JSON.parse(fs.readFileSync(file,'utf8'));}
function normalize(q,source){const copy={...q};copy.type=String(copy.type||copy.question_type||'MCQ').trim();copy.question_type=String(copy.question_type||copy.type).trim();copy.module=String(copy.module||(copy.book==='First Flight'&&copy.chapter&&poetryChapters.has(copy.chapter)?'First Flight Poetry':copy.book==='First Flight'?'First Flight Prose':copy.book==='Footprints Without Feet'?'Footprints Without Feet':copy.category==='Grammar'?'Grammar':copy.category||'Other')).trim();copy.chapter=copy.chapter==null?'':String(copy.chapter).trim();copy.marks=Number(copy.marks);copy.source=copy.source||source;return copy;}
const base=readJson(path.join(DATA,'questions.json'));const baseQuestions=Array.isArray(base.questions)?base.questions.map(q=>normalize(q,'questions.json')):[];
const manifest=readJson(path.join(BANKS,'manifest.json'));const bankNames=Array.isArray(manifest.banks)?manifest.banks:[];const extras=[];
for(const name of bankNames){const bank=readJson(path.join(BANKS,name));const items=Array.isArray(bank)?bank:bank.questions;if(Array.isArray(items))extras.push(...items.map(q=>normalize(q,name)));}
const seen=new Set(),merged=[];for(const q of [...baseQuestions,...extras]){const key=q.id?`id:${q.id}`:`text:${String(q.question||q.prompt||'').trim().toLowerCase()}|marks:${q.marks}|chapter:${q.chapter||''}`;if(seen.has(key))continue;seen.add(key);merged.push(q);}
const overrideFiles=['model-answer-quality-overrides.json','model-answer-quality-overrides-lit-01.json','model-answer-quality-overrides-lit-02.json','model-answer-quality-overrides-lit-03.json','model-answer-quality-overrides-lit-04.json','model-answer-quality-overrides-lit-05.json','model-answer-quality-overrides-lit-06.json','model-answer-quality-overrides-lit-07.json','model-answer-quality-overrides-lit-08.json','model-answer-quality-overrides-letter-01.json'];
for(const fileName of overrideFiles){const file=path.join(DATA,fileName);if(!fs.existsSync(file))continue;const data=readJson(file);const overrides=data&&data.overrides&&typeof data.overrides==='object'?data.overrides:{};for(const q of merged){const o=overrides[q.id];if(!o)continue;if(typeof o.model_answer==='string'&&o.model_answer.trim())q.model_answer=o.model_answer.trim();if(typeof o.answer==='string'&&o.answer.trim())q.answer=o.answer.trim();if(Array.isArray(o.answer_points))q.answer_points=o.answer_points.slice();if(typeof o.letter_type==='string'&&o.letter_type.trim())q.letter_type=o.letter_type.trim();if(typeof o.skill==='string'&&o.skill.trim())q.skill=o.skill.trim();if(typeof o.topic==='string'&&o.topic.trim())q.topic=o.topic.trim();if(typeof o.question_type==='string'&&o.question_type.trim())q.question_type=o.question_type.trim();}}
const output={course:'Class 10 First Language English (15-E)',academic_year:'2026-27',bank_version:`Merged production bank • manifest ${manifest.version||'unknown'}`,generated_from:['data/questions.json','data/banks/manifest.json',...bankNames.map(n=>`data/banks/${n}`),...overrideFiles.map(n=>`data/${n}`)],question_count:merged.length,questions:merged};
fs.writeFileSync(OUTPUT,JSON.stringify(output,null,2)+'\n','utf8');console.log(`Generated ${OUTPUT} with ${merged.length} questions.`);
