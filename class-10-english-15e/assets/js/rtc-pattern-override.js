/* 15-E MOCK PATCH: Section VIII must contain exactly 2 First Flight prose + 2 First Flight poetry RTC questions. */
(function(){
  const norm=v=>String(v??'').trim().toLowerCase();
  const text=q=>norm(q?.question||q?.prompt||q?.text);
  const meta=q=>norm([q?.type,q?.question_type,q?.skill,q?.category,q?.module,q?.bank_group,q?.topic,q?.domain,q?.blueprint_slot,q?.book].filter(Boolean).join(' '));
  const type=q=>norm(q?.type||q?.question_type);
  const id=q=>q?.id||`${q?.module||''}|${q?.chapter||''}|${q?.marks||''}|${text(q)}`;
  const mcq=q=>type(q)==='mcq';
  const analogy=q=>norm(q?.bank_group)==='analogy'||/analogy|relationship|complete the pair/.test(meta(q)+' '+text(q));
  const rewrite=q=>/rewrite|reported speech|indirect speech|active.*passive|passive.*active|degree.*comparison|sentence transformation|as directed|question formation|frame a question|voice transformation/.test(meta(q)+' '+text(q));
  const grammar=q=>norm(q?.bank_group)==='grammar'||(/grammar|vocabulary|language/.test(meta(q))&&!/literature/.test(meta(q)));
  const rtc=q=>norm(q?.bank_group)==='rtc'||/reference.*context|reference to context|rtc/.test(meta(q)+' '+text(q));
  const quote=q=>/quote.*memory|quote from memory/.test(meta(q)+' '+text(q));
  const comp=q=>norm(q?.bank_group)==='comprehension'||!!q?.passage||/comprehension|unseen passage|read the following passage/.test(meta(q)+' '+text(q));
  const essay=q=>/essay/.test(meta(q)+' '+text(q));
  const letter=q=>/letter/.test(meta(q)+' '+text(q));
  const literature=q=>{if(mcq(q)||analogy(q)||rewrite(q)||rtc(q)||quote(q)||comp(q)||essay(q)||letter(q))return false;const m=norm(q?.module),b=norm(q?.book),g=norm(q?.bank_group);return ['firstflight','footprints','poetry'].includes(g)||/first flight|footprints without feet/.test(m+' '+b)||/poetry/.test(m+' '+b);};
  const shuffle=(a,r)=>{const x=[...a];for(let i=x.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[x[i],x[j]]=[x[j],x[i]]}return x};
  const seeded=s=>()=>{s=(1664525*s+1013904223)>>>0;return s/4294967296};
  const bank=()=>Array.isArray(window.EnglishHubQuestions)?window.EnglishHubQuestions:(Array.isArray(window.qs)?window.qs:[]);
  const take=(pool,used,n,r)=>{const a=shuffle(pool.filter(q=>!used.has(id(q))),r).slice(0,n);a.forEach(q=>used.add(id(q)));return a};
  const pair=(pool,used,pred,r)=>{const a=shuffle(pool.filter(q=>!used.has(id(q))&&pred(q)),r)[0];if(!a)return null;used.add(id(a));return a};
  const isFFProse=q=>norm(q?.book)==='first flight'&&norm(q?.module)==='first flight'&&['a letter to god','nelson mandela: long walk to freedom','his first flight','the black aeroplane','from the diary of anne frank','a baker from goa','coorg','tea from assam','mijbil the otter','madam rides the bus','the sermon at benares','the proposal'].includes(norm(q?.chapter));
  const isFFPoetry=q=>norm(q?.book)==='first flight'&&/first flight poetry/.test(norm(q?.module));
  function build(no){
    const b=bank(),r=seeded((20260905+(no||1)*104729)>>>0),used=new Set(),selected=[],shortages=[];let n=1;
    const slots=[
      ['I',1,6,'mcq'],['II',1,4,'analogy'],['III',1,3,'rewrite1'],['IV',1,7,'literature'],['V',2,7,'short2'],['VI',2,3,'rewrite2'],['VII',3,6,'long3'],['VIII',3,4,'rtc'],['IX',4,1,'quote'],['X',4,3,'long4'],['XI',4,1,'comprehension'],['XII',5,1,'essay'],['XIII',5,1,'letter']
    ];
    function pool(kind,m){let p=b.filter(q=>Number(q.marks)===m);switch(kind){
      case 'mcq':return p.filter(q=>mcq(q)&&grammar(q));
      case 'analogy':return p.filter(q=>!mcq(q)&&analogy(q));
      case 'rewrite1':return p.filter(q=>!mcq(q)&&Number(q.marks)===1&&rewrite(q));
      case 'rewrite2':return p.filter(q=>!mcq(q)&&Number(q.marks)===2&&grammar(q)&&rewrite(q));
      case 'literature':return p.filter(literature);
      case 'short2':return p.filter(q=>literature(q)&&Number(q.marks)===2);
      case 'long3':return p.filter(q=>literature(q)&&Number(q.marks)===3);
      case 'long4':return p.filter(q=>literature(q)&&Number(q.marks)===4);
      case 'rtc':return p.filter(q=>rtc(q)&&norm(q?.bank_group)==='rtc-firstflight');
      case 'quote':return p.filter(q=>quote(q));
      case 'comprehension':{const all=p.filter(q=>comp(q));const long=all.filter(q=>String(q.passage||'').trim().length>=600);return long.length?long:all;}
      case 'essay':return p.filter(essay);
      case 'letter':return p.filter(letter);
      default:return [];
    }}
    for(const s of slots){
      const [section,m,count,kind]=s;
      if(section==='VIII'){
        const prose=take(pool(kind,m).filter(isFFProse),used,2,r);
        const poetry=take(pool(kind,m).filter(isFFPoetry),used,2,r);
        if(prose.length<2)shortages.push(`VIII: need 2 First Flight prose reference-to-context questions, found ${prose.length}`);
        if(poetry.length<2)shortages.push(`VIII: need 2 First Flight poetry reference-to-context questions, found ${poetry.length}`);
        [...prose,...poetry].forEach(q=>selected.push({number:n++,section,sectionTitle:'Explain with reference to the context',marks:m,kind,q,or:null}));
        continue;
      }
      const orAll=section==='X';
      for(let pos=1;pos<=count;pos++){
        const need=(section==='V'&&pos===7)||(section==='VII'&&pos===1)||(section==='IX')||orAll||section==='XII'||section==='XIII'?2:1;
        let choices=[];
        if(section==='XIII'&&need===2){
          const p=pool(kind,m),formal=shuffle(p.filter(q=>!used.has(id(q))&&(/formal/.test(norm(q?.letter_type||q?.skill||''))||/formal letter/.test(meta(q)+' '+text(q)))),r)[0],informal=shuffle(p.filter(q=>!used.has(id(q))&&(/informal/.test(norm(q?.letter_type||q?.skill||''))||/informal letter/.test(meta(q)+' '+text(q)))),r)[0];
          choices=[formal,informal].filter(Boolean);if(formal)used.add(id(formal));if(informal)used.add(id(informal));
        } else choices=take(pool(kind,m),used,need,r);
        if(choices.length<need){shortages.push(`${section} Q${n}: need ${need} ${kind} question${need>1?'s':''}, found ${choices.length}`);n++;continue;}
        selected.push({number:n++,section,sectionTitle:section==='I'?'Choose the correct alternative':section==='II'?'Observe the relationship and complete the pair':section==='III'||section==='VI'?'Rewrite as directed':section==='IV'?'Answer the following questions in a sentence each':section==='V'?'Answer the following questions in two to three sentences each':section==='VII'?'Answer the following questions in five to six sentences each':section==='IX'?'Quote from memory':section==='X'?'Answer the following questions in seven to eight sentences each':section==='XI'?'Read the following passage carefully and answer':section==='XII'?'Write an essay of about 18–20 sentences on any one':'Letter Writing',marks:m,kind,q:choices[0],or:choices[1]||null});
      }
    }
    const total=selected.reduce((a,x)=>a+Number(x.marks||0),0);
    if(selected.length!==47)shortages.unshift(`VALIDATION: ${selected.length}/47 main questions built`);
    if(total!==100)shortages.unshift(`VALIDATION: ${total}/100 marks built`);
    if(selected.slice(0,6).some(x=>!mcq(x.q)))shortages.unshift('VALIDATION: Q1-Q6 must all be grammar MCQs');
    if(selected.slice(6,10).some(x=>mcq(x.q)))shortages.unshift('VALIDATION: Q7-Q10 analogy questions must not be MCQs');
    const rtcItems=selected.filter(x=>x.section==='VIII');
    if(rtcItems.length!==4||rtcItems.filter(x=>isFFProse(x.q)).length!==2||rtcItems.filter(x=>isFFPoetry(x.q)).length!==2)shortages.unshift('VALIDATION: Section VIII must be exactly 2 First Flight prose + 2 First Flight poetry reference-to-context questions');
    return {selected,shortages,totalMarks:total};
  }
  window.buildStrictMock=build;
})();
