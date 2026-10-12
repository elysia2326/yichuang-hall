/* A finite reading demonstration, not a reconstruction of business event order. */
(()=>{'use strict';
const duration=3500,steps=['entry','review','handoff'],labels=['公开联办','稿内程序','公开协调'],states=new WeakMap(),media=window.matchMedia?.('(prefers-reduced-motion: reduce)');
let active=null,disposed=false;
const now=()=>window.performance?.now?.()??Date.now();
const available=figure=>!disposed&&!document.hidden&&!media?.matches&&figure?.isConnected&&document.getElementById('source-dialog')?.open&&document.getElementById('dialog-body')?.contains(figure);
function controls(id){if(id!=='process')return '';return `<section class="case-replay" aria-label="流程协同案例讲解"><div class="case-replay-intro"><strong>从联办成效，看组织接续</strong><span>依次讲解三个视角，保留完整关系</span></div><div class="case-replay-buttons"><button data-case-replay="toggle"${media?.matches?' disabled':''}>演示案例关系</button><button data-case-replay="reset" disabled>结束演示</button></div><ol class="case-replay-steps">${labels.map((label,i)=>`<li data-replay-step="${i}"><span>${String(i+1).padStart(2,'0')}</span>${label}<div class="case-replay-rail" aria-hidden="true"><i></i></div></li>`).join('')}</ol><p class="case-replay-status">${media?.matches?'减少动态效果已开启，可直接选择上方阅读视角':'点击开始；各视角依据仍可展开核对'}</p></section>`;}
function record(figure){let s=states.get(figure);if(!s){s={figure,status:'idle',index:0,remaining:duration,deadline:0,timer:null,animation:null};states.set(figure,s);}return s;}
function clear(s){if(s.timer!==null){clearTimeout(s.timer);s.timer=null;}if(s.animation){try{s.animation.cancel();}catch{}s.animation=null;}}
function paint(s){const f=s.figure,run=s.status==='playing',paused=s.status==='paused';f.dataset.replayState=s.status;
 const play=f.querySelector('[data-case-replay="toggle"]'),reset=f.querySelector('[data-case-replay="reset"]');if(!play)return;
 play.textContent=run?'暂停演示':paused?'继续演示':s.status==='finished'?'重新演示':'演示案例关系';play.disabled=Boolean(disposed||media?.matches);reset.disabled=!(run||paused);
 f.querySelectorAll('[data-replay-step]').forEach((item,i)=>{const current=(run||paused)&&i===s.index,done=s.status==='finished'||((run||paused)&&i<s.index);item.dataset.stepState=current?'current':done?'done':'pending';if(current)item.setAttribute('aria-current','step');else item.removeAttribute('aria-current');item.querySelector('i').style.transform=`scaleX(${done?1:current?Math.max(0,Math.min(1,1-s.remaining/duration)):0})`;});
 const text=s.status==='finished'?'演示结束 · 返回整体关系':run?`${s.index+1} / 3 · ${labels[s.index]}`:paused?`已暂停 · ${labels[s.index]}，可继续或选择其他视角`:'点击开始；各视角依据仍可展开核对';f.querySelector('.case-replay-status').textContent=media?.matches?'减少动态效果已开启，可直接选择上方阅读视角':text;
}
function pause(s=active){if(!s||s.status!=='playing')return; s.remaining=Math.max(0,Math.min(duration,s.deadline-now()));clear(s);s.status='paused';if(active===s)active=null;paint(s);}
function schedule(s){s.status='playing';s.deadline=now()+s.remaining;active=s;paint(s);
 const rail=s.figure.querySelector(`[data-replay-step="${s.index}"] i`);if(typeof rail?.animate==='function')try{s.animation=rail.animate([{transform:`scaleX(${1-s.remaining/duration})`},{transform:'scaleX(1)'}],{duration:s.remaining,easing:'linear',fill:'none',iterations:1});}catch{}
 s.timer=setTimeout(()=>{s.timer=null;if(active!==s||s.status!=='playing')return;if(!available(s.figure)){pause(s);return;}clear(s);s.index++;if(s.index===steps.length){window.GovCaseGuide.select(s.figure,'all');s.status='finished';s.remaining=duration;active=null;paint(s);return;}s.remaining=duration;window.GovCaseGuide.select(s.figure,steps[s.index]);schedule(s);},s.remaining);
}
function toggle(figure){if(!available(figure))return;const s=record(figure);if(s.status==='playing'){pause(s);return;}if(active&&active!==s)pause(active);if(s.status!=='paused'){clear(s);s.index=0;s.remaining=duration;window.GovCaseGuide.select(figure,steps[0]);}schedule(s);}
function reset(figure,{restore=true}={}){const s=states.get(figure);if(!s)return;clear(s);if(active===s)active=null;s.status='idle';s.index=0;s.remaining=duration;if(restore&&figure.isConnected)window.GovCaseGuide.select(figure,'all');paint(s);}
function click(event){const target=event.target.closest?.('[data-case-replay]');if(target){const figure=target.closest('figure[data-case-guide="process"]');if(!figure||target.disabled)return;if(target.dataset.caseReplay==='toggle')toggle(figure);else reset(figure);return;}const choice=event.target.closest?.('[data-guide-perspective]');if(choice)reset(choice.closest('figure[data-case-guide]'),{restore:false});}
function keydown(event){if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)||event.altKey||event.ctrlKey||event.metaKey)return;const choice=event.target.closest?.('[data-guide-perspective]');if(choice)reset(choice.closest('figure[data-case-guide]'),{restore:false});}
function route(){pause();document.querySelectorAll('figure[data-case-guide="process"]').forEach(f=>paint(record(f)));}function visibility(){if(document.hidden)pause();}
function preference(){pause();document.querySelectorAll('figure[data-case-guide="process"]').forEach(f=>paint(record(f)));}
function leave(event){pause();if(event.persisted)return;disposed=true;document.removeEventListener('click',click,true);document.removeEventListener('keydown',keydown,true);document.removeEventListener('gov-route-change',route);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('resize',route);window.removeEventListener('pagehide',leave);media?.removeEventListener?.('change',preference);}
// Capture manual selections before the guide handles them, so playback cannot overwrite a choice.
document.addEventListener('click',click,true);document.addEventListener('keydown',keydown,true);document.addEventListener('gov-route-change',route);document.addEventListener('visibilitychange',visibility);window.addEventListener('resize',route);window.addEventListener('pagehide',leave);media?.addEventListener?.('change',preference);
window.GovCaseReplay=Object.freeze({controls,get running(){return active?.status==='playing';}});
})();
