/* Label placement uses measured rectangles; no DOM or GPU dependency. */
(()=>{'use strict';
const overlap=(a,b,gap=8)=>a.x<b.x+b.w+gap&&a.x+a.w+gap>b.x&&a.y<b.y+b.h+gap&&a.y+a.h+gap>b.y;
function layout(labels,width,height,obstacles=[]){
 if(!Number.isFinite(width)||!Number.isFinite(height)||width<24||height<24)return labels.map(l=>({id:l.id,visible:false}));
 const occupied=obstacles.filter(r=>[r.x,r.y,r.w,r.h].every(Number.isFinite)&&r.w>0&&r.h>0),anchors=labels.filter(l=>Number.isFinite(l.x)&&Number.isFinite(l.y)).map(l=>({x:l.x-5,y:l.y-5,w:10,h:10})),placed=[];
 return labels.map(l=>{const hidden={id:l.id,visible:false};if(![l.x,l.y,l.w,l.h].every(Number.isFinite)||l.w<=0||l.h<=0||l.w>width-16||l.h>height-16||l.x<0||l.x>width||l.y<0||l.y>height||l.hidden)return hidden;
  const candidates=[];for(const distance of [10,32,64,104,160,240]){candidates.push([l.x-l.w/2,l.y-l.h-distance],[l.x+distance,l.y-l.h/2],[l.x-l.w-distance,l.y-l.h/2],[l.x-l.w/2,l.y+distance],[l.x+distance,l.y-l.h-distance],[l.x-l.w-distance,l.y-l.h-distance],[l.x+distance,l.y+distance],[l.x-l.w-distance,l.y+distance]);}
  if(l.previous)candidates.push([l.previous.x,l.previous.y]);let best=null,bestScore=Infinity;
  for(const [cx,cy] of candidates){const r={x:Math.max(8,Math.min(width-l.w-8,cx)),y:Math.max(8,Math.min(height-l.h-8,cy)),w:l.w,h:l.h};if([...occupied,...placed,...anchors].some(o=>overlap(r,o)))continue;const dx=Math.max(r.x-l.x,0,l.x-r.x-r.w),dy=Math.max(r.y-l.y,0,l.y-r.y-r.h),movement=l.previous?Math.hypot(r.x-l.previous.x,r.y-l.previous.y):0,score=Math.hypot(dx,dy)+movement*.12;if(score<bestScore){best=r;bestScore=score;}}
  if(!best)return hidden;placed.push(best);const tx=Math.max(best.x,Math.min(best.x+best.w,l.x)),ty=Math.max(best.y,Math.min(best.y+best.h,l.y));return {id:l.id,visible:true,rect:best,leader:{x1:l.x,y1:l.y,x2:tx,y2:ty}};
 });
}
window.GovLabelLayout=Object.freeze({layout,overlap});
})();
