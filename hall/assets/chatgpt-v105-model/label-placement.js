import * as THREE from 'three';

// Prioritize the small props and people that explain an observation, not its large plinth.
export function isProtectedMesh(mesh){return mesh.isMesh&&(/(?:head|torso|forearm|upper_arm|_hand\d*$|Receiver_arm|Record_arm|Signing_pen|Signoff_grip|Review_grip|Receiver_grip|Coordination_record|Coordination_pen|Pen_nib|Separate_signing_rack|Telephone_|Review_magnifier|Concept_document|Concept_site_map|Concept_map_block|Concept_map_path|Concept_access_branch|Unprinted_certificate_paper|Unprinted_result_certificate_frame|Unprinted_fee_record|Calculator|Calculation|Road_|Project_entry|Result_document)/i.test(mesh.name)||/^Routing_(?:system_[AB]_(?:name|.*spine|.*document|procedure|审批)|intake_label|common_material_label|reception_monitor_meaning)/.test(mesh.name));}
const worldBounds=new WeakMap();
export function projectProtectedRectangles(model,camera,width,height){
 if(!model||width<24||height<24)return [];
 let objects=worldBounds.get(model);
 if(!objects){model.updateMatrixWorld(true);objects=[];model.traverse(mesh=>{if(isProtectedMesh(mesh))objects.push({name:mesh.name,box:new THREE.Box3().setFromObject(mesh)});});worldBounds.set(model,objects);}
 camera.updateMatrixWorld();const result=[];
 for(const {name,box} of objects){const points=[];let clipped=false;for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z]){const p=new THREE.Vector3(x,y,z).project(camera);if(!Number.isFinite(p.x)||!Number.isFinite(p.y)||p.z< -1||p.z>1){clipped=true;break;}points.push({x:(p.x+1)*width/2,y:(1-p.y)*height/2});}if(clipped||points.length!==8)continue;
  const x=Math.max(0,Math.min(...points.map(p=>p.x))-3),y=Math.max(0,Math.min(...points.map(p=>p.y))-3),right=Math.min(width,Math.max(...points.map(p=>p.x))+3),bottom=Math.min(height,Math.max(...points.map(p=>p.y))+3);if(right>x&&bottom>y)result.push({name,x,y,w:right-x,h:bottom-y});
 }
 return result;
}
export const overlap=(a,b,gap=8)=>a.x<b.x+b.w+gap&&a.x+a.w+gap>b.x&&a.y<b.y+b.h+gap&&a.y+a.h+gap>b.y;
export function coverageArea(a,b){return Math.max(0,Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x))*Math.max(0,Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y));}
export function layoutObjectLabels(labels,width,height,obstacles=[],protectedRects=[]){
 if(!Number.isFinite(width)||!Number.isFinite(height)||width<24||height<24)return labels.map(l=>({id:l.id,visible:false}));
 const valid=r=>[r.x,r.y,r.w,r.h].every(Number.isFinite)&&r.w>0&&r.h>0;
 const occupied=obstacles.filter(valid),protectedObjects=protectedRects.filter(valid),anchors=labels.filter(l=>Number.isFinite(l.x)&&Number.isFinite(l.y)).map(l=>({x:l.x-5,y:l.y-5,w:10,h:10})),placed=[];
 const result=labels.map(l=>{const hidden={id:l.id,visible:false};if(![l.x,l.y,l.w,l.h].every(Number.isFinite)||l.w<=0||l.h<=0||l.w>width-16||l.h>height-16||l.x<0||l.x>width||l.y<0||l.y>height||l.hidden)return hidden;
  const candidates=[];for(const distance of [10,32,64,104,160,240,360,480])candidates.push([l.x-l.w/2,l.y-l.h-distance],[l.x+distance,l.y-l.h/2],[l.x-l.w-distance,l.y-l.h/2],[l.x-l.w/2,l.y+distance],[l.x+distance,l.y-l.h-distance],[l.x-l.w-distance,l.y-l.h-distance],[l.x+distance,l.y+distance],[l.x-l.w-distance,l.y+distance]);
  if(l.previous)candidates.push([l.previous.x,l.previous.y]);let best=null,bestScore=Infinity,bestCoverage=0;
  const anchorObstacles=l.priority>0?[{x:l.x-5,y:l.y-5,w:10,h:10}]:anchors;
  for(const [cx,cy] of candidates){const r={x:Math.max(8,Math.min(width-l.w-8,cx)),y:Math.max(8,Math.min(height-l.h-8,cy)),w:l.w,h:l.h};if([...occupied,...placed,...anchorObstacles].some(o=>overlap(r,o)))continue;
   const covered=protectedObjects.reduce((sum,o)=>sum+coverageArea(r,o),0),dx=Math.max(r.x-l.x,0,l.x-r.x-r.w),dy=Math.max(r.y-l.y,0,l.y-r.y-r.h),movement=l.previous?Math.hypot(r.x-l.previous.x,r.y-l.previous.y):0;
   // Keep complete names on narrow screens; where space exists, choose no-object overlap first.
   // Establish a complete, compact layout before improving object avoidance.
   // Greedy object avoidance can consume the only remaining slot for another title.
   const score=Math.hypot(dx,dy)+movement*.12;
   if(score<bestScore){best=r;bestScore=score;bestCoverage=covered;}
  }
  // On a cramped viewport a selected system explanation takes precedence over
  // an invisible anchor marker. Dock it at an edge only if ordinary slots fail.
  let docked=false;
  if(!best&&l.priority>1){for(const [x,y] of [[8,8],[width-l.w-8,8],[8,height-l.h-8],[width-l.w-8,height-l.h-8]]){const r={x,y,w:l.w,h:l.h};if([...occupied,...placed].some(o=>overlap(r,o)))continue;const covered=protectedObjects.reduce((sum,o)=>sum+coverageArea(r,o),0);if(!best||covered<bestCoverage){best=r;bestCoverage=covered;docked=true;}}}
  if(!best)return hidden;placed.push(best);return {id:l.id,visible:true,docked,rect:best,protectedCoverage:bestCoverage,leader:{x1:l.x,y1:l.y,x2:Math.max(best.x,Math.min(best.x+best.w,l.x)),y2:Math.max(best.y,Math.min(best.y+best.h,l.y))}};
 });
 // Improve existing slots while preserving every title that already fitted.
 // Other labels are hard obstacles throughout this refinement, so no slot is stolen.
 for(let pass=0;pass<2;pass++)for(let i=0;i<result.length;i++){
  const item=result[i],l=labels[i];if(!item.visible)continue;
  const anchorObstacles=l.priority>0?[{x:l.x-5,y:l.y-5,w:10,h:10}]:anchors;
  const blocked=[...occupied,...anchorObstacles,...result.filter((r,j)=>j!==i&&r.visible).map(r=>r.rect)];
  const score=r=>{const covered=protectedObjects.reduce((s,o)=>s+coverageArea(r,o),0),dx=Math.max(r.x-l.x,0,l.x-r.x-r.w),dy=Math.max(r.y-l.y,0,l.y-r.y-r.h);return {covered,value:Math.hypot(dx,dy)+(covered>0?1000+Math.min(2,covered/(r.w*r.h))*500:0)};};
  let best=item.rect,bestScore=score(best);
  for(const d of [10,32,64,104,160,240,360,480])for(const [cx,cy] of [[l.x-l.w/2,l.y-l.h-d],[l.x+d,l.y-l.h/2],[l.x-l.w-d,l.y-l.h/2],[l.x-l.w/2,l.y+d],[l.x+d,l.y-l.h-d],[l.x-l.w-d,l.y-l.h-d],[l.x+d,l.y+d],[l.x-l.w-d,l.y+d]]){
   const r={x:Math.max(8,Math.min(width-l.w-8,cx)),y:Math.max(8,Math.min(height-l.h-8,cy)),w:l.w,h:l.h};if(blocked.some(o=>overlap(r,o)))continue;
   const next=score(r);if(next.value<bestScore.value-.01){best=r;bestScore=next;}
  }
  item.rect=best;item.protectedCoverage=bestScore.covered;item.leader={x1:l.x,y1:l.y,x2:Math.max(best.x,Math.min(best.x+best.w,l.x)),y2:Math.max(best.y,Math.min(best.y+best.h,l.y))};
 }
 return result;
}
