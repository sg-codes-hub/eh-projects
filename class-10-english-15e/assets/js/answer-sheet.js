(()=>{
  const ready=()=>{
    const result=document.getElementById('result');
    if(!result||document.getElementById('answerSheetBtn')) return;
    const actions=result.querySelector('.result-actions');
    if(!actions) return;
    const btn=document.createElement('button');btn.id='answerSheetBtn';btn.className='secondary-btn';btn.type='button';btn.textContent='📄 My Answer Sheet';
    actions.insertBefore(btn,actions.firstChild);btn.onclick=showSheet;
  };
  function showSheet(){
    const source=document.getElementById('reviewList');if(!source)return;
    let modal=document.getElementById('answerSheetModal');
    if(!modal){
      modal=document.createElement('div');modal.id='answerSheetModal';modal.className='answer-sheet-modal';
      modal.innerHTML='<div class="answer-sheet-dialog"><div class="answer-sheet-head"><div><div class="eyebrow">COMPLETED MOCK TEST</div><h2>My Answer Sheet</h2><p>Your submitted responses and the available model answers.</p></div><div class="answer-sheet-actions"><button id="printAnswerSheet" class="primary-btn" type="button">🖨 Print / Save PDF</button><button id="closeAnswerSheet" class="secondary-btn" type="button">Close</button></div></div><div id="answerSheetBody" class="answer-sheet-body"></div></div>';
      document.body.appendChild(modal);
      document.getElementById('closeAnswerSheet').onclick=()=>modal.classList.remove('open');
      document.getElementById('printAnswerSheet').onclick=printSheet;
    }
    const body=document.getElementById('answerSheetBody');body.innerHTML='';
    const cards=[...source.children];
    if(!cards.length){body.innerHTML='<div class="phase-note"><strong>No answer review is available.</strong><span>Please complete the mock test again.</span></div>';}
    else cards.forEach((card,i)=>{const copy=card.cloneNode(true);copy.classList.add('answer-sheet-item');const n=copy.querySelector('[class*=number]');if(n&&!/^Q\d+/.test(n.textContent.trim()))n.textContent=`Q${i+1}`;body.appendChild(copy);});
    modal.classList.add('open');
  }
  function buildPrintDocument(bodyHtml){
    return '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ENGLISH HUB — My Answer Sheet</title><style>*{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#222;background:#fff;margin:0;padding:24px;line-height:1.5}h1{margin:0 0 4px;font-size:22px}.sub{color:#666;margin:0 0 20px}.answer-sheet-item{display:block!important;position:relative!important;background:#fff!important;color:#222!important;border:1px solid #ddd;border-radius:10px;padding:14px;margin:10px 0;break-inside:avoid;page-break-inside:avoid}.answer-sheet-item button,.answer-sheet-item input,.answer-sheet-item textarea{display:none!important}.answer-sheet-item [hidden]{display:block!important}.answer-sheet-item *{visibility:visible!important;opacity:1!important}.answer-sheet-item p{margin:7px 0}.eyebrow{font-size:11px;font-weight:700;letter-spacing:.08em}@media print{body{padding:12mm}.answer-sheet-item{break-inside:avoid;page-break-inside:avoid}}</style></head><body><h1>ENGLISH HUB — Class 10 English 15-E</h1><div class="sub">Completed Mock Test — My Answer Sheet</div>'+bodyHtml+'</body></html>';
  }
  function printSheet(){
    const body=document.getElementById('answerSheetBody');if(!body)return;
    const html=buildPrintDocument(body.innerHTML);
    const w=window.open('','_blank');
    if(!w){alert('Please allow pop-ups for this site to print or save the answer sheet as PDF.');return;}
    w.document.open();w.document.write(html);w.document.close();
    const print=()=>{w.focus();w.print();};
    if(w.document.readyState==='complete')setTimeout(print,150);else w.onload=()=>setTimeout(print,150);
  }
  const mo=new MutationObserver(ready);mo.observe(document.body,{childList:true,subtree:true});ready();
})();