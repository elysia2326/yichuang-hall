/* One finite response per successful route change; data and layout stay fixed. */
(()=>{'use strict';
const $=id=>document.getElementById(id),media=window.matchMedia?.('(prefers-reduced-motion: reduce)'),active=new Map();
let disposed=false;
function stop(){for(const [animation,cleanup] of [...active]){cleanup();try{animation.cancel();}catch{}}active.clear();}
function reveal(node,opacity,duration){
 if(!node?.isConnected||typeof node.animate!=='function')return;
 try{
  const animation=node.animate([{opacity},{opacity:1}],{duration,easing:'cubic-bezier(.22,.61,.36,1)',fill:'none',iterations:1});
  const cleanup=()=>{active.delete(animation);animation.removeEventListener?.('finish',cleanup);animation.removeEventListener?.('cancel',cleanup);};
  active.set(animation,cleanup);animation.addEventListener?.('finish',cleanup,{once:true});animation.addEventListener?.('cancel',cleanup,{once:true});
 }catch{ /* Unavailable animation leaves the already rendered content readable. */ }
}
function change(event){
 stop();if(disposed||document.hidden||media?.matches)return;
 const route=event.detail;if(!route||route.restored)return;
 const value=route.value||'',before=route.previousValue||'';
 if(value===before&&route.topic===route.previousTopic)return;
 if(value){
  // The model has its own camera feedback; search fields remain stable.
  if(value==='model'||value.startsWith('model:')||value.startsWith('search')||!$('source-dialog')?.open)return;
  reveal($('dialog-title'),.88,180);reveal($('dialog-body'),.80,260);
 }else if(!before&&route.topic!==route.previousTopic){
  reveal($(route.topic==='overview'?'home-view':'topic-view'),.82,280);
 }
}
function focusReading(node){stop();if(disposed||document.hidden||media?.matches||!node?.closest('#dialog-body')||node.dataset.guideActive!=='true')return;reveal(node,.90,180);}
function visibility(){if(document.hidden)stop();}
function preference(){if(media?.matches)stop();}
function dispose(){if(disposed)return;disposed=true;stop();document.removeEventListener('gov-route-change',change);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('resize',stop);window.removeEventListener('pagehide',leave);media?.removeEventListener?.('change',preference);}
function leave(event){stop();if(!event.persisted)dispose();}
document.addEventListener('gov-route-change',change);document.addEventListener('visibilitychange',visibility);window.addEventListener('resize',stop);window.addEventListener('pagehide',leave);media?.addEventListener?.('change',preference);
window.GovScreenMotion=Object.freeze({stop,focusReading,get activeCount(){return active.size;}});
})();
