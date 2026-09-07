/*
 * Validation helper for previous-paper data.
 * Run in a browser console on the Class 10 English 15-E page, or adapt for Node.
 * It deliberately checks the declared paper structure rather than trusting item-array length,
 * because a single numbered question may contain OR alternatives.
 */
(function(){
  'use strict';
  const expectedSections=[
    ['I',1,6],['II',7,4],['III',11,3],['IV',14,7],['V',21,7],['VI',28,3],
    ['VII',31,6],['VIII',37,4],['IX',41,1],['X',42,3],['XI',45,1],['XII',46,1],['XIII',47,1]
  ];
  const expectedAnswers=47;

  function cleanJson(text){return text.replace(/\\“/g,'“').replace(/\\”/g,'”')}
  function fail(errors,msg){errors.push(msg)}
  function sentenceCount(text){return String(text||'').split(/[.!?]+/).map(s=>s.trim()).filter(Boolean).length}

  async function load(path){
    const r=await fetch(path,{cache:'no-store'});
    if(!r.ok)throw new Error('Unable to load '+path);
    return r.json();
  }

  async function validate(){
    const errors=[],warnings=[];
    const [paperText,solutions,corrections]=await Promise.all([
      fetch('data/previous-papers-2025.json?v=20260907-audit',{cache:'no-store'}).then(r=>r.text()),
      load('data/previous-papers-2025-solutions.json?v=20260907-audit'),
      load('data/previous-papers-2025-answer-corrections.json?v=20260907-audit')
    ]);
    const papers=JSON.parse(cleanJson(paperText)).papers||[];
    if(papers.length!==3)fail(errors,'Expected exactly 3 previous papers.');

    papers.forEach(paper=>{
      const label=paper.id||paper.title;
      if(paper.questions!==47)fail(errors,`${label}: declared question count is not 47.`);
      if(paper.marks!==100)fail(errors,`${label}: declared marks are not 100.`);
      const sections=paper.sections||[];
      const declaredTotal=sections.reduce((n,s)=>n+Number(s.count||0),0);
      if(declaredTotal!==47)fail(errors,`${label}: section counts add to ${declaredTotal}, not 47.`);
      expectedSections.forEach(([roman,start,count])=>{
        const s=sections.find(x=>x.section===roman);
        if(!s)fail(errors,`${label}: missing Section ${roman}.`);
        else if(Number(s.count)!==count)fail(errors,`${label}: Section ${roman} declares ${s.count}, expected ${count}.`);
      });

      const solved=solutions.papers&&solutions.papers[paper.id];
      if(!solved)fail(errors,`${label}: missing solved-paper dataset.`);
      else{
        if(!Array.isArray(solved.answers)||solved.answers.length!==expectedAnswers)
          fail(errors,`${label}: solved answers count is ${solved.answers&&solved.answers.length}, expected 47.`);
        if(solved.answers&&solved.answers[46]){
          const letter=solved.answers[46];
          if(!/\bTo\b/i.test(letter)||!/\bSubject:/i.test(letter)||!/Respected Sir\/Madam/i.test(letter)||!/Yours (faithfully|obediently)/i.test(letter))
            warnings.push(`${label} Q47: formal-letter structure should be checked.`);
          if(!/Dear (Uncle|Grandfather|Father)/i.test(letter)&&!/With love|Yours lovingly/i.test(letter))
            warnings.push(`${label} Q47: informal-letter alternative should be checked.`);
        }
        if(solved.answers&&solved.answers[45]){
          const essay=solved.answers[45];
          const parts=essay.split(/\s+OR\s+/i);
          parts.forEach((part,i)=>{
            if(sentenceCount(part)<15)warnings.push(`${label} Q46 alternative ${i+1}: essay has fewer than 15 sentences.`);
          });
        }
      }

      const correction=corrections[paper.id]||{};
      Object.keys(correction).forEach(q=>{
        if(Number(q)<1||Number(q)>47)fail(errors,`${label}: correction contains invalid Q${q}.`);
      });
    });

    const report={ok:errors.length===0,errors,warnings,checkedAt:new Date().toISOString()};
    console.table(report.errors.map(x=>({type:'ERROR',message:x})).concat(report.warnings.map(x=>({type:'WARNING',message:x}))));
    console.log('Previous-paper audit:',report);
    return report;
  }

  window.validatePreviousPapers2025=validate;
})();
