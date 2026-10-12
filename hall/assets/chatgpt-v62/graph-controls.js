/* Delegated controls survive navigation's retained DOM nodes without per-board listeners. */
(() => {
 'use strict';
 const scales=Object.freeze([1,1.25,1.5]);
 function setScale(board,scale){
  if(!board||!scales.includes(scale))return false;
  const drawing=board.querySelector('.gs-svg');if(!drawing)return false;
  drawing.style.width=(scale*100)+'%';drawing.style.minWidth=(scale*1200)+'px';
  board.dataset.gsScale=String(scale);
  for(const b of board.querySelectorAll('[data-gs-control="zoom"]'))b.setAttribute('aria-pressed',String(Number(b.dataset.gsScale)===scale));
  return true;
 }
 document.addEventListener('click',event=>{
  const button=event.target.closest?.('[data-gs-control="zoom"]');
  if(button)setScale(button.closest('.gs-board'),Number(button.dataset.gsScale));
 });
 window.GovGraphControls=Object.freeze({scales,setScale});
})();
