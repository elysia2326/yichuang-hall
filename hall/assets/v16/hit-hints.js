/* On-demand destination cues for every main hall hit region. */
(()=>{'use strict';
 const cue=document.createElement('div');cue.id='hall-destination-cue';cue.className='hall-destination-cue';cue.setAttribute('role','tooltip');cue.hidden=true;
 const category=document.createElement('span'),title=document.createElement('strong'),copy=document.createElement('p');cue.append(category,title,copy);document.body.append(cue);
 let owner=null,previousDescription=null;
 function hide(){if(owner){if(previousDescription===null)owner.removeAttribute('aria-describedby');else owner.setAttribute('aria-describedby',previousDescription);}owner=null;previousDescription=null;cue.hidden=true;}
 function description(action){const kind=String(action||'').split(':')[0];return ({graph:['补充结构图','放大查看本专题结构图，再进入对应出处与原文。'],source:['原始出处','查看发布主体、原文与相关数据。'],claim:['数据图表','展开数字对照、单位与适用范围。'],kpi:['指标解释','查看指标口径、图表及相关出处。'],tension:['案例现场','对读公开记录、办理接续与原文观察。'],article:['稿件原文','查看匿名摘录及其前后语境。'],model:['三维场景','进入完整模型，旋转、缩放并查看对应区域。'],'case-data':['案例数据','查看同一案例的完整指标与图表。'],boundary:['组织接续','查看权限、程序、数据与平台之间的关系。'],trend:['月度图表','展开月度受理与咨询记录，保留缺失数据。'],search:['资料检索','按记录类型和案例主线查找资料。'],dimension:['改革主线','查看机制、相关案例与依据。'],constraint:['组织条件','查看这一条件与案例的对应关系。']})[kind]||['继续查看','在大屏内展开对应内容。'];}
 function show(button){if(!button?.isConnected||button.closest('[hidden]'))return hide();if(owner!==button){hide();owner=button;previousDescription=button.getAttribute('aria-describedby');button.setAttribute('aria-describedby',[previousDescription,cue.id].filter(Boolean).join(' '));}
  const [label,explanation]=description(button.dataset.action);category.textContent=label;title.textContent=button.getAttribute('aria-label')||button.textContent;copy.textContent=explanation;cue.hidden=false;
  const rect=button.getBoundingClientRect(),width=cue.offsetWidth||Math.min(360,Math.max(1,innerWidth-24)),height=cue.offsetHeight||100,pad=12;
  const x=Math.max(pad,Math.min(rect.left+(rect.width-width)/2,innerWidth-width-pad));const above=rect.top-height-12;const y=above>=pad?above:Math.max(pad,Math.min(rect.bottom+12,innerHeight-height-pad));cue.style.left=x+'px';cue.style.top=y+'px';
 }
 document.addEventListener('pointerover',e=>{if(e.pointerType==='touch')return;const b=e.target.closest?.('.art-hit');if(b&&!b.contains(e.relatedTarget))show(b);});
 document.addEventListener('pointerout',e=>{const b=e.target.closest?.('.art-hit');if(b&&b===owner&&!b.contains(e.relatedTarget)&&document.activeElement!==b)hide();});
 document.addEventListener('focusin',e=>{const b=e.target.closest?.('.art-hit');if(b)show(b);else hide();});
 document.addEventListener('focusout',e=>{if(e.target===owner)hide();});
 document.addEventListener('click',hide);document.addEventListener('keydown',e=>{if(e.key==='Escape')hide();});
 window.addEventListener('resize',hide);window.addEventListener('scroll',hide,true);window.addEventListener('pagehide',hide);window.addEventListener('popstate',hide);window.addEventListener('hashchange',hide);
 window.GovHitHints=Object.freeze({hide,description});
})();
