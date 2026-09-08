/* English Hub 15-E — prevent mock-start race with asynchronous question-bank loading. */
(function(){
  'use strict';
  const originalStart=window.start;
  if(typeof originalStart!=='function')return;
  let bankReady=null;
  function waitForBank(){
    if(Array.isArray(window.EnglishHubQuestions)&&window.EnglishHubQuestions.length)return Promise.resolve(window.EnglishHubQuestions);
    if(bankReady)return bankReady;
    bankReady=(async function(){
      if(window.QuestionBankLoader&&typeof window.QuestionBankLoader.loadAll==='function'){
        const all=await window.QuestionBankLoader.loadAll();
        if(!Array.isArray(all)||!all.length)throw new Error('Question bank is empty');
        return all;
      }
      const started=Date.now();
      while(Date.now()-started<30000){
        if(Array.isArray(window.EnglishHubQuestions)&&window.EnglishHubQuestions.length)return window.EnglishHubQuestions;
        await new Promise(r=>setTimeout(r,100));
      }
      throw new Error('Question bank did not become ready');
    })().catch(function(err){bankReady=null;throw err;});
    return bankReady;
  }
  window.start=async function(mode,o){
    if(mode==='mock'){
      try{await waitForBank();}
      catch(err){console.error('Mock start blocked until question bank is ready:',err);alert('The question bank is still loading. Please wait a moment and try again.');return;}
    }
    return originalStart(mode,o);
  };
  window.EnglishHubMockReadinessGuard=true;
})();
