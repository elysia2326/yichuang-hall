/* Single hall presentation; all detail and model actions stay inside. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
document.body.classList.remove('reading-mode');$('gov-screen').hidden=false;
const tip=document.createElement('div');tip.id='interaction-hint';tip.hidden=true;tip.setAttribute('aria-hidden','true');document.body.appendChild(tip);
function motion(){window.GovScreenMotion?.stop();}
function hint(target){if(!target?.classList.contains('art-hit')){tip.hidden=true;return;}tip.textContent=target.getAttribute('aria-label');tip.hidden=false;const r=target.getBoundingClientRect();tip.style.left=Math.max(12,Math.min(innerWidth-300,r.left+r.width/2-140))+'px';tip.style.top=Math.max(12,Math.min(innerHeight-60,r.top-45))+'px';}
document.addEventListener('gov-topic-change',()=>{tip.hidden=true;});
document.addEventListener('focusin',e=>hint(e.target));document.addEventListener('pointerover',e=>hint(e.target.closest?.('.art-hit')));document.addEventListener('pointerout',e=>{if(e.target.classList?.contains('art-hit'))tip.hidden=true;});
window.GovExperience={setView:()=>{document.body.classList.remove('reading-mode');$('gov-screen').hidden=false;},get mode(){return 'hall';},refresh:motion};
})();
