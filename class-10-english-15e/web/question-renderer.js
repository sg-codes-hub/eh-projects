const QuestionRenderer={
  render(item,container,onAnswer){
    container.innerHTML='';
    const type=(item.type||'').toLowerCase();
    if(type.includes('unseen_passage')) return this.comprehension(item,container,onAnswer);
    if(type==='essay'||type==='letter') return this.writing(item,container,onAnswer);
    if(Array.isArray(item.options)) return this.mcq(item,container,onAnswer);
    return this.shortAnswer(item,container,onAnswer);
  },
  mcq(item,c,onAnswer){
    c.innerHTML=`<fieldset><legend>${escapeHtml(item.prompt||item.text||item.question||'')}</legend>${item.options.map((o,i)=>`<label class="option"><input type="radio" name="answer" value="${i}"><span>${escapeHtml(o)}</span></label>`).join('')}</fieldset>`; this.bind(c,()=>{const x=c.querySelector('input:checked');return x?Number(x.value):null},onAnswer)},
  shortAnswer(item,c,onAnswer){c.innerHTML=`<label for="answer"><strong>${escapeHtml(item.prompt||item.text||item.question||'')}</strong></label><textarea id="answer" rows="5" placeholder="Type your answer here..."></textarea>`;this.bind(c,()=>c.querySelector('textarea').value.trim(),onAnswer)},
  writing(item,c,onAnswer){c.innerHTML=`<label for="answer"><strong>${escapeHtml(item.prompt||'Write your response:')}</strong></label><textarea id="answer" rows="14" placeholder="Write your answer here..."></textarea>`;this.bind(c,()=>c.querySelector('textarea').value.trim(),onAnswer)},
  comprehension(item,c,onAnswer){c.innerHTML=`<article class="passage"><h3>Read the passage</h3><p>${escapeHtml(item.passage||'')}</p></article><div class="comp-questions">${(item.questions||[]).map((x,i)=>`<div><p><strong>${i+1}. ${escapeHtml(x.q||'')}</strong></p><textarea data-q="${i}" rows="3" placeholder="Write your answer..."></textarea></div>`).join('')}</div>`;this.bind(c,()=>[...c.querySelectorAll('textarea')].map(x=>x.value.trim()),onAnswer)},
  bind(c,getAnswer,onAnswer){let b=document.createElement('button');b.type='button';b.className='submit-answer';b.textContent='Submit Answer';b.addEventListener('click',()=>onAnswer(getAnswer()));c.appendChild(b)}
};
function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
window.QuestionRenderer=QuestionRenderer;