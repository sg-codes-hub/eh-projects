/* Normalize loaded question records before the main app consumes them. */
(function(){
  const original=window.QuestionBankLoader&&window.QuestionBankLoader.loadAll;
  if(!original)return;
  window.QuestionBankLoader.loadAll=async function(){
    const all=await original.apply(this,arguments);
    return (all||[]).map(q=>{
      const s=String([q.type,q.question_type,q.skill,q.category,q.question,q.prompt].filter(Boolean).join(' ')).toLowerCase();
      const analogy=/analogy|relationship.*complete|complete.*pair|observe the relationship/.test(s);
      if(!analogy)return q;
      const x={...q,type:'analogy',question_type:'written',options:undefined,answer:undefined};
      return x;
    });
  };
})();