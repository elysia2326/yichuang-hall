import {createCameraTransition} from '../chatgpt-v110/camera-transition.js';
import {layoutObjectLabels,projectProtectedRectangles} from './label-placement.js';
import {createModelFocus} from '../chatgpt-v87/model-focus.js';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {HDRLoader} from 'three/addons/loaders/HDRLoader.js';

const $=id=>document.getElementById(id),host=$('model-canvas');
const modelId='items-v78',embedded=window.parent!==window;
const actions=new Set(['tension:items','article:P104','article:P134']);
const groups={front:['UNIFIED_ACCEPTANCE'],back:['INDEPENDENT_APPROVAL_A','INDEPENDENT_APPROVAL_B'],handoff:['PAPER_HANDOFF_A','PAPER_HANDOFF_B']};
const stations=[
 {key:'front',title:'统一申请与收件',label:'前台 / P104',copy:'前台围绕完整需求组织统一申请信息，统一告知、收件与流转。字段统一后仍分别推送至原业务系统，统一入口需要与后续审批接续。',action:'article:P104',direction:[-.5,.7,1]},
 {key:'back',title:'各自审批与解释',label:'后台 / P104 · P134',copy:'后台继续依相应权限分别审批。这里以两间工作区示意原业务系统的分立；A/B并非真实部门数量。结果、进度与最终解释仍需要由相应审批主体接续。',action:'article:P104',direction:[-.6,.9,1]},
 {key:'handoff',title:'窗口与部门交接',label:'解释接续 / P134',copy:'窗口依据部门说明组织答复，最终解释仍由审批主体提供。人员与纸张用于展示交接关系，不代表某家企业的逐笔办理日志。',action:'article:P134',direction:[-.7,.75,1]}
];
let cameraMotion,presented=false,focusIndicator,renderer,scene,camera,controls,model,environmentTarget,observer,wholeBox,lastFit,animation=0,generation=0;
let ready=false,disposed=false,activeView='all',activeStep=-1,glassHidden=false,pointerStart=null,activeObject='';
const pointers=new Set(),ray=new THREE.Raycaster(),pointer=new THREE.Vector2();
let gestureMoved=false,pending=window.GovModelState.read();
function notify(message){if(!embedded)return;const origin=location.origin==='null'?'*':location.origin;if(['gov-model-action','gov-model-close'].includes(message.type)){cameraMotion?.stop();const snapshot=state();if(snapshot)window.parent.postMessage({type:'gov-model-state',state:snapshot},origin);}window.parent.postMessage(message,origin);}
function say(copy){$('model-status').textContent=copy;}
function state(){return ready?window.GovModelState.normalize({version:1,modelId,glassHidden,caseId:'items',caseStep:activeStep,zone:activeStep===0?'front':activeStep===1?'back':'',view:activeView,tour:-1,roof:false,position:camera.position.toArray(),target:controls.target.toArray()}):null;}
function schedule(){if(disposed||!ready||animation||document.hidden)return;animation=requestAnimationFrame(now=>{animation=0;if(!ready||disposed)return;try{const moving=cameraMotion?.update(now);renderer.render(scene,camera);presented=true;annotations();document.body.classList.add('model-ready');const current=state();if(current)notify({type:'gov-model-state',state:current});if(moving)schedule();}catch(error){pending=state();dispose();say('三维画面暂未显示 · 已恢复静态图，可重试加载');console.warn('Spatial frame unavailable.',error);}});}
function buttons(){for(const id of ['zoom-in','zoom-out','glass-toggle'])$(id).disabled=!ready;$('model-retry').hidden=ready;$('gesture-guide').textContent=ready?'拖动旋转 · 滚轮或双指缩放':'静态预览 · 可继续阅读观察说明与原文';}
const objectCopy={front:'统一柜台、申请材料与工作屏：表达统一申请、收件和分别推送。',back:'两间工作区、各自工作屏与材料：表达原系统及审批权限的分立；A/B不代表真实部门数量。',handoff:'工作人员与纸张：呈现窗口依据部门说明组织答复，最终解释仍由审批主体提供。'};
function detail(record){focusIndicator?.set(record?groups[record.key]:[],record?.key==='front'?0xa4cede:0xd1b988);$('focus-caption').textContent=record?'当前观察 / '+record.title:'点击物件或名称，定位对应内容';$('focus-caption').dataset.kind=record?.key==='front'?'public':'observation';$('detail-label').textContent=record?.label||'组织剖面 / P104 · P134';$('detail-objects').textContent=objectCopy[record?.key]||'统一柜台、各自审批工作区、人员与纸张，共同呈现入口合一与职责分立。A/B为机制示意分组。';$('detail-title').textContent=record?.title||'前台集成与后台分立';$('detail-copy').textContent=record?.copy||'前台围绕完整需求组织统一申请；后台仍按原业务系统与相应权限分别审批。结果与解释需要接续，窗口组织答复，最终解释仍由审批主体提供。';$('research-link').dataset.action=record?.action||'tension:items';$('research-link').textContent=record?'核对对应原文 ↗':'查看案例与数据图 ↗';}
const labelSpecs=[
 {group:'UNIFIED_ACCEPTANCE',step:0,title:'统一申请与收件',prefix:'前台'},
 {group:'INDEPENDENT_APPROVAL_A',step:1,title:'各自审批 A',prefix:'后台'},
 {group:'INDEPENDENT_APPROVAL_B',step:1,title:'各自审批 B',prefix:'后台'},
 {group:'PAPER_HANDOFF_A',step:2,title:'材料与解释交接 A',prefix:'交接'},
 {group:'PAPER_HANDOFF_B',step:2,title:'材料与解释交接 B',prefix:'交接'}
];
const previousLabels=new Map();
function annotations(){
 if(!ready)return;
 camera.updateMatrixWorld();
 const width=host.clientWidth,height=host.clientHeight,labels=[];
 for(const i of labelSpecs.map((_,i)=>i).sort((a,b)=>(labelSpecs[b].step===activeStep)-(labelSpecs[a].step===activeStep))){
  const node=document.querySelector('[data-label="'+i+'"]'),box=new THREE.Box3().setFromObject(model.getObjectByName(labelSpecs[i].group)),p=box.getCenter(new THREE.Vector3());p.y=box.max.y+.13;p.project(camera);
  const x=(p.x+1)*width/2,y=(1-p.y)*height/2;
  node.classList.toggle('selected',labelSpecs[i].step===activeStep);node.setAttribute('aria-pressed',String(labelSpecs[i].step===activeStep));
  const clipped=p.z< -1||p.z>1||x<0||x>width||y<0||y>height;
  node.hidden=clipped;if(clipped){previousLabels.delete(i);continue;}
  // Measure the complete label after selected styling; never replace its name with an index.
  const measured=node.getBoundingClientRect();
  const w=measured.width||node.offsetWidth||164,h=measured.height||node.offsetHeight||42;
  labels.push({id:i,x,y,w,h,priority:labelSpecs[i].step===activeStep?2:0,previous:previousLabels.get(i)});
 }
 const hostRect=host.getBoundingClientRect(),statusRect=$('model-status').getBoundingClientRect?.(),obstacles=[];
 if(statusRect?.width>0&&statusRect?.height>0){const r={x:statusRect.left-hostRect.left-4,y:statusRect.top-hostRect.top-4,w:statusRect.width+8,h:statusRect.height+8};if(r.x<width&&r.x+r.w>0&&r.y<height&&r.y+r.h>0)obstacles.push(r);}
 const placed=layoutObjectLabels(labels,width,height,obstacles,projectProtectedRectangles(model,camera,width,height)),leaders=$('model-leaders');
 leaders.setAttribute('viewBox','0 0 '+width+' '+height);leaders.replaceChildren();
 for(const item of placed){
  const node=document.querySelector('[data-label="'+item.id+'"]');node.hidden=!item.visible;
  if(!item.visible){previousLabels.delete(item.id);continue;}
  previousLabels.set(item.id,item.rect);node.style.left=item.rect.x+'px';node.style.top=item.rect.y+'px';
  const color=labelSpecs[item.id].step>0?'#d1b988':'#a4cede';
  const line=document.createElementNS('http://www.w3.org/2000/svg','line');
  for(const [key,value] of Object.entries(item.leader))line.setAttribute(key,String(value));
  line.setAttribute('stroke',color);line.setAttribute('stroke-opacity',labelSpecs[item.id].step===activeStep?'.9':'.55');line.setAttribute('stroke-width',labelSpecs[item.id].step===activeStep?'1.5':'1');line.setAttribute('data-leader',String(item.id));leaders.appendChild(line);
  const point=document.createElementNS('http://www.w3.org/2000/svg','circle');point.setAttribute('cx',String(item.leader.x1));point.setAttribute('cy',String(item.leader.y1));point.setAttribute('r','2.5');point.setAttribute('fill',color);leaders.appendChild(point);
 }
}
function fontLayoutRefresh(){previousLabels.clear();schedule();}
document.fonts?.ready.then(fontLayoutRefresh);
document.fonts?.addEventListener('loadingdone',fontLayoutRefresh);

function bounds(key){const box=new THREE.Box3();for(const name of groups[key]||[]){const node=model?.getObjectByName(name);if(node)box.expandByObject(node);}return box.isEmpty()?wholeBox.clone():box;}
function fit(box,direction=[-.3,.7,1],padding=1.22,animate=true){
 const axis=new THREE.Vector3(...direction).normalize(),center=box.getCenter(new THREE.Vector3());
 const right=new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0),axis).normalize(),up=new THREE.Vector3().crossVectors(axis,right).normalize();
 const tangent=Math.tan(THREE.MathUtils.degToRad(camera.fov)/2);let distance=.5;
 for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z]){const v=new THREE.Vector3(x,y,z).sub(center);distance=Math.max(distance,v.dot(axis)+Math.abs(v.dot(right))*padding/(tangent*camera.aspect),v.dot(axis)+Math.abs(v.dot(up))*padding/tangent);}
 const position=center.clone().addScaledVector(axis,distance);camera.near=.03;camera.far=Math.max(150,distance*10);camera.updateProjectionMatrix();lastFit={box:box.clone(),direction:[...direction],padding};cameraMotion.move(position,center,{animate});
}
function resize(){cameraMotion?.stop();previousLabels.clear();if(!renderer)return;const width=host.clientWidth||900,height=host.clientHeight||520;renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();if(ready&&lastFit)fit(lastFit.box,lastFit.direction,lastFit.padding,false);else schedule();}
function view(name){activeObject='';objectButtons();objectFallback('');activeView=['all','front','back','top'].includes(name)?name:'all';activeStep=name==='front'?0:name==='back'?1:-1;detail(stations[activeStep]);document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===activeView)));document.querySelectorAll('[data-station]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.station)===activeStep)));if(ready)fit(activeStep>=0?bounds(stations[activeStep].key):wholeBox,name==='top'?[.001,1,.001]:stations[activeStep]?.direction||[-.3,.7,1]);say((stations[activeStep]?.title||name==='top'&&'顶部剖视'||'完整全景')+(ready?' · 可旋转与缩放':' · 静态说明'));}
function station(index){if(!Number.isInteger(index)||!stations[index])return;activeObject='';objectButtons();objectFallback('');activeStep=index;activeView=index===0?'front':index===1?'back':'all';detail(stations[index]);document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===activeView)));document.querySelectorAll('[data-station]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.station)===index)));if(ready)fit(bounds(stations[index].key),stations[index].direction,1.35);say(stations[index].title+(ready?' · 可旋转与缩放':' · 静态说明'));}
function isGlass(node){return node.isMesh&&(Array.isArray(node.material)?node.material:[node.material]).some(m=>m?.transmission>0);}
function glass(hidden){glassHidden=Boolean(hidden);model?.traverse(o=>{if(isGlass(o))o.visible=!glassHidden;});$('glass-toggle').setAttribute('aria-pressed',String(glassHidden));$('glass-toggle').textContent=glassHidden?'恢复玻璃隔断':'透视内部';schedule();}
function restoreObservation(raw){const s=window.GovModelState.normalize(raw);if(!ready||!s||s.modelId!==modelId)return false;const target=new THREE.Vector3(...s.target),position=new THREE.Vector3(...s.position);if(!wholeBox.clone().expandByScalar(wholeBox.getSize(new THREE.Vector3()).length()).containsPoint(target)||position.distanceTo(target)>controls.maxDistance)return false;glass(s.glassHidden);if(s.caseStep>=0)station(s.caseStep);else view(s.view);cameraMotion?.stop();lastFit=null;camera.position.copy(position);controls.target.copy(target);controls.update();activeObject=labelSpecs.find(r=>r.step===s.caseStep&&new THREE.Box3().setFromObject(model.getObjectByName(r.group)).getCenter(new THREE.Vector3()).distanceTo(target)<.001)?.group||'';objectButtons();objectFallback(activeObject);schedule();return true;}
function zoom(factor){if(!ready)return;cameraMotion?.stop();lastFit=null;const delta=camera.position.clone().sub(controls.target);camera.position.copy(controls.target).add(delta.setLength(THREE.MathUtils.clamp(delta.length()*factor,controls.minDistance,controls.maxDistance)));controls.update();schedule();}
function objectButtons(){document.querySelectorAll('[data-object]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.object===activeObject)));}
function objectFallback(name){const index=labelSpecs.findIndex(r=>r.group===name),image=$('model-fallback');image.src=index>=0?'assets/chatgpt-v106-items/object_'+index+'_render.png?rev=chatgpt-v123':'assets/chatgpt-v106-items/organization_lettering_v106.png?rev=chatgpt-v123';image.alt=index>=0?labelSpecs[index].title+'：当前完整模型的实际 Blender 特写':'统一收件、各自审批与材料解释交接的完整 Blender 模型';}
function focusObject(name){const spec=labelSpecs.find(r=>r.group===name);if(!spec)return;station(spec.step);activeObject=name;objectButtons();objectFallback(name);if(!ready){say(spec.title+' · 静态特写，可继续核对原文');return;}const obj=model.getObjectByName(name);fit(new THREE.Box3().setFromObject(obj),[-1.15,.70,.85],1.20);say(spec.title+' · 已放大物件与实体字牌');}
function activate(event){if(!ready)return;const rect=host.getBoundingClientRect();pointer.set((event.clientX-rect.left)/rect.width*2-1,1-(event.clientY-rect.top)/rect.height*2);ray.setFromCamera(pointer,camera);for(const hit of ray.intersectObject(model,true)){let invisible=false;for(let n=hit.object;n;n=n.parent)if(!n.visible)invisible=true;if(invisible)continue;for(let n=hit.object;n;n=n.parent){const index=stations.findIndex(s=>groups[s.key].includes(n.name));if(index>=0){station(index);return;}}}}
function dispose(){cameraMotion?.dispose();cameraMotion=null;presented=false;focusIndicator?.dispose();focusIndicator=null;previousLabels.clear();$('model-leaders').replaceChildren();document.querySelectorAll('[data-label]').forEach(n=>n.hidden=true);disposed=true;ready=false;generation++;if(animation)cancelAnimationFrame(animation);animation=0;observer?.disconnect();controls?.dispose();const geometries=new Set(),materials=new Set(),textures=new Set();scene?.traverse(o=>{if(o.geometry)geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])if(m){materials.add(m);for(const v of Object.values(m))if(v?.isTexture)textures.add(v);}});for(const t of textures)t.dispose();for(const m of materials)m.dispose();for(const g of geometries)g.dispose();environmentTarget?.dispose();environmentTarget=null;renderer?.dispose();renderer?.domElement.remove();model=null;document.body.classList.remove('model-ready');buttons();}
async function environment(id){let hdr,generator,next;try{hdr=await new HDRLoader().loadAsync('assets/v12/environment/studio_small_09_1k.hdr');if(disposed||id!==generation)return;generator=new THREE.PMREMGenerator(renderer);next=generator.fromEquirectangular(hdr);const old=environmentTarget;environmentTarget=next;next=null;scene.environment=environmentTarget.texture;old?.dispose();schedule();}catch(error){if(!disposed)console.warn('Studio environment unavailable; local environment retained.',error);}finally{hdr?.dispose();generator?.dispose();next?.dispose();}}
async function load(){
 disposed=false;const id=++generation;ready=false;buttons();say('正在加载完整三维模型…');
 try{
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.75));renderer.setClearColor(0x09172a,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.9;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;host.appendChild(renderer.domElement);
  scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(36,1,.03,200);controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=false;controls.rotateSpeed=.65;controls.zoomSpeed=.8;controls.maxPolarAngle=Math.PI*.49;controls.minDistance=.6;controls.addEventListener('change',schedule);controls.addEventListener('start',()=>{cameraMotion?.stop();lastFit=null;});cameraMotion=createCameraTransition({camera,controls,requestFrame:schedule,canAnimate:()=>presented&&!disposed&&!document.hidden,reducedMotion:()=>Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)});
  const generator=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();try{environmentTarget=generator.fromScene(room,.04);scene.environment=environmentTarget.texture;}finally{room.dispose();generator.dispose();}scene.environmentIntensity=.7;void environment(id);
  scene.add(new THREE.HemisphereLight(0xe3edf7,0x243345,.6));const key=new THREE.DirectionalLight(0xf5f3ef,2.3);key.position.set(-8,14,10);key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.normalBias=.025;key.shadow.bias=-.0002;scene.add(key);const fill=new THREE.DirectionalLight(0xb5cadd,.85);fill.position.set(12,8,-8);scene.add(fill);
  const loaded=await new GLTFLoader().loadAsync('assets/chatgpt-v106-items/organization_lettering_v106.glb?rev=chatgpt-v123');
  if(disposed||id!==generation){loaded.scene.traverse(o=>{o.geometry?.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material])m?.dispose();});return;}
  model=loaded.scene;for(const names of Object.values(groups))for(const name of names)if(!model.getObjectByName(name))throw Error('Missing model role '+name);
  model.traverse(o=>{if(o.isMesh){o.castShadow=!isGlass(o);o.receiveShadow=true;}});wholeBox=new THREE.Box3().setFromObject(model);if(wholeBox.isEmpty())throw Error('Empty model');scene.add(model);focusIndicator=createModelFocus(model);scene.add(focusIndicator.object);
  const center=wholeBox.getCenter(new THREE.Vector3()),span=wholeBox.getSize(new THREE.Vector3()).length();controls.maxDistance=span*3;key.target.position.copy(center);scene.add(key.target);Object.assign(key.shadow.camera,{left:-span,right:span,top:span,bottom:-span,near:.1,far:100});key.shadow.camera.updateProjectionMatrix();
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(span*2,span*2),new THREE.ShadowMaterial({color:0x030c18,opacity:.27}));floor.rotation.x=-Math.PI/2;floor.position.set(center.x,wholeBox.min.y-.02,center.z);floor.receiveShadow=true;scene.add(floor);
  ready=true;resize();glass(glassHidden);if(activeStep>=0)station(activeStep);else view(activeView);if(pending){restoreObservation(pending);pending=null;}buttons();schedule();observer=new ResizeObserver(resize);observer.observe(host);
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();pending=state();dispose();say('三维环境中断 · 已恢复静态图，可重试加载或继续阅读');});
 }catch(error){if(id!==generation)return;dispose();say((()=>{try{return!!document.createElement('canvas').getContext('webgl')}catch(e){return false}})()?'三维暂未打开 · 已保留完整静态图和案例说明，可重试加载':'三维未打开：当前浏览器未启用 WebGL（硬件加速）· 已保留完整静态图和案例说明');console.warn('Spatial model unavailable.',error);}
}
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>view(b.dataset.view)));
document.querySelectorAll('[data-station]').forEach(b=>b.addEventListener('click',()=>station(Number(b.dataset.station))));document.querySelectorAll('[data-label]').forEach(b=>b.addEventListener('click',()=>focusObject(labelSpecs[Number(b.dataset.label)].group)));
document.querySelectorAll('[data-object]').forEach(button=>button.addEventListener('click',()=>focusObject(button.dataset.object)));
document.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',()=>{const action=b.dataset.action;if(!actions.has(action))return;if(embedded)notify({type:'gov-model-action',action});else{const u=new URL('材质智治大厅.html',document.baseURI);u.searchParams.set('view','hall');u.searchParams.set('detail',action);u.searchParams.set('context','items');u.hash='items';location.href=u.href;}}));
$('model-fallback').addEventListener('error',()=>{if(!$('model-fallback').src.endsWith('organization_lettering_v106.png?rev=chatgpt-v123'))objectFallback('');});
$('hall-return').addEventListener('click',e=>{if(embedded){e.preventDefault();notify({type:'gov-model-close'});}});
$('zoom-in').addEventListener('click',()=>zoom(.8));$('zoom-out').addEventListener('click',()=>zoom(1.25));$('reset').addEventListener('click',()=>{glass(false);view('all');});$('glass-toggle').addEventListener('click',()=>glass(!glassHidden));$('model-retry').addEventListener('click',()=>{dispose();void load();});
$('fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('viewer-shell').requestFullscreen();}catch{say('当前环境不支持全屏，可继续观察与缩放');}});document.addEventListener('fullscreenchange',()=>{$('fullscreen').textContent=document.fullscreenElement?'退出全屏':'全屏观察 ↗';resize();});
host.addEventListener('pointerdown',e=>{cameraMotion?.stop();pointers.add(e.pointerId);if(pointers.size>1)gestureMoved=true;pointerStart={id:e.pointerId,x:e.clientX,y:e.clientY};});host.addEventListener('pointermove',e=>{if(pointerStart&&Math.hypot(e.clientX-pointerStart.x,e.clientY-pointerStart.y)>5)gestureMoved=true;});host.addEventListener('pointerup',e=>{if(!gestureMoved&&pointerStart?.id===e.pointerId)activate(e);pointers.delete(e.pointerId);if(!pointers.size){pointerStart=null;gestureMoved=false;}});host.addEventListener('pointercancel',e=>{pointers.delete(e.pointerId);pointerStart=null;if(!pointers.size)gestureMoved=false;});
window.addEventListener('resize',resize);document.addEventListener('visibilitychange',()=>{if(document.hidden)cameraMotion?.stop();else schedule();});window.addEventListener('pagehide',e=>{cameraMotion?.stop();if(!e.persisted)dispose();});window.addEventListener('pageshow',e=>{if(e.persisted)resize();});
window.GovModelViewer=Object.freeze({captureState:state,restoreObservation,view,focusCaseStep:station,focusObject,reset:()=>{glass(false);view('all');},get ready(){return ready;},get modelId(){return modelId;},get activeCase(){return 'items';}});
load();
