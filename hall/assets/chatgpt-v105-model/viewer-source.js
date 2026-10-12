import {createCameraTransition} from '../chatgpt-v110/camera-transition.js';
import {layoutObjectLabels,projectProtectedRectangles} from './label-placement.js';
import {createModelFocus} from './model-focus.js';
import {readObservationBounds} from './focus-bounds.js';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {HDRLoader} from 'three/addons/loaders/HDRLoader.js';

const $=id=>document.getElementById(id),host=$('model-canvas');
const modelId='process-v97',embedded=window.parent!==window;
const actions=new Set(['tension:process','source:V01','article:P103','article:P106','article:P107','article:P109']);
const groups={submission:['UNIFIED_SUBMISSION'],survey:['JOINT_SITE_SURVEY'],payment:['COORDINATED_PAYMENT'],result:['ASSISTED_RESULT'],window:['ENTERPRISE_SERVICE_WINDOW'],review:['REVIEW_CONDITIONS'],signoff:['SIGNOFF_PROGRESS'],coordination:['MANUAL_COORDINATION'],routing:['SEPARATE_SYSTEM_ROUTING']};
const stations=[
 {key:'submission',title:'一次提交',label:'公开联办安排 / V01',copy:'服务专窗组织咨询、统一接件和帮办代办，多事项材料可以一次提交。它与踏勘、缴费和办结并列呈现；不表示企业必须依次跑四个窗口。',objects:'材料、接件台与工作屏：表达统一接件。',action:'source:V01',direction:[-.35,.8,1]},
 {key:'survey',title:'一次踏勘',label:'公开联办安排 / V01',copy:'统一踏勘标准，开展联合踏勘，减少对企业的打扰。道路与项目出入口是踏勘对象示意；公开报道还记载可踏勘后补齐材料的容缺受理安排。',objects:'道路、项目出入口与定位标记：表达共同踏勘的对象。',action:'source:V01',direction:[-.3,1.1,1]},
 {key:'payment',title:'一次缴费',label:'公开联办安排 / V01',copy:'通过跨部门核定征收机制，衔接征收标准与缴费安排。核定记录和计算工具表达核对工作，不代表自动审批，也没有虚构收费金额。',objects:'核定记录、计算器与材料：表达跨部门核定征收。',action:'source:V01',direction:[-.3,.8,1]},
 {key:'result',title:'一次办结',label:'公开联办安排 / V01',copy:'公开报道将一次办结与全流程帮办指导相连。结果文件与帮办位置表达指导和交付，不表示合并了各事项的法定审批权限。',objects:'结果文件、帮办台与人员：表达指导及结果办理。',action:'source:V01',direction:[-.3,.8,1]},
 {key:'window',title:'企业对接一个专窗',label:'企业端 / V01',copy:'企业只对接道路开口一件事专窗，获得全流程咨询、统一接件与帮办代办。后侧四个场景是联办工作安排；观察编号用于选看场景，不是强制办理顺序。',objects:'一个企业对接台、一份申请材料：表达企业端入口合一。',action:'source:V01',direction:[-.3,.75,1]},
 {key:'review',title:'各事项条件与审查',label:'稿内机制观察 / P106',copy:'稿件讨论跨部门服务时指出，各事项仍保留受理条件与审查标准。核对台表达这些要求仍需分别满足；这一观察与道路开口公开安排对读，不是该业务的逐笔审批记录。',objects:'受理条件、审查标准、核对动作与分类卷宗：表达各事项分别审查。',action:'article:P106',direction:[-.25,.85,1]},
 {key:'signoff',title:'各事项签批层级',label:'稿内机制观察 / P106',copy:'并联安排需要与各事项的法定程序、签批层级和进度衔接。分置的文件架、记录与核签位置表达各事项仍保留签批程序；构件数量为示意，不对应实际事项数与签批级数。',objects:'分置文件架、各自保留的记录与执笔动作：表达签批程序仍需分别接续。',action:'article:P106',direction:[.45,.85,1]},
 {key:'coordination',title:'个案协调与补救',label:'稿内机制观察 / P107',copy:'稿件指出，会商把各部门的时间表与现场踏勘对齐合并，但跨部门联审仍多依赖个案协调与人工兜底。电话和记录表达这类协调工作；公开道路开口已有专题会商与常态反馈安排，模型追问的是个案经验怎样形成可持续的通用流程。',objects:'电话按键、听筒、连线及协调记录：表达沟通、异常协调与补救。',action:'article:P107',direction:[-.25,.85,1]},
 {key:'routing',title:'统一接件之后，材料怎样分派？',label:'稿内机制剖面 / P103',copy:'窗口将材料收进后分派至各部门，各部门在各自系统中按既定流程审批。审批权限、审批节奏与审批责任保留于原部门。两条接收路径仅说明这种分派关系，不表示实际部门数量、自动审批或系统已经贯通。',objects:'一个接件台与两条材料分派路径，连接两个示意原业务系统；每个系统保留审批权限、节奏和责任。',action:'article:P103',direction:[.30,1.12,1]}
];
let cameraMotion,presented=false,focusIndicator,renderer,scene,camera,controls,model,legacyModel,routingModel,environmentTarget,observer,wholeBox,lastFit,animation=0,generation=0;
let ready=false,disposed=false,activeView='all',activeStep=-1,glassHidden=false,pointerStart=null;
const pointers=new Set(),ray=new THREE.Raycaster(),pointer=new THREE.Vector2();
let gestureMoved=false,pending=window.GovModelState.read();
function notify(message){if(!embedded)return;const origin=location.origin==='null'?'*':location.origin;if(['gov-model-action','gov-model-close'].includes(message.type)){cameraMotion?.stop();const snapshot=state();if(snapshot)window.parent.postMessage({type:'gov-model-state',state:snapshot},origin);}window.parent.postMessage(message,origin);}
function say(copy){$('model-status').textContent=copy;}
function state(){return ready?window.GovModelState.normalize({version:1,modelId,caseId:'process',caseStep:activeStep,zone:activeStep>=5?'back':activeStep>=0?'front':'',view:activeView,tour:-1,roof:false,position:camera.position.toArray(),target:controls.target.toArray()}):null;}
function schedule(){if(disposed||!ready||animation||document.hidden)return;animation=requestAnimationFrame(now=>{animation=0;if(!ready||disposed)return;try{const moving=cameraMotion?.update(now);renderer.render(scene,camera);presented=true;annotations();document.body.classList.add('model-ready');const current=state();if(current)notify({type:'gov-model-state',state:current});if(moving)schedule();}catch(error){pending=state();dispose();say('三维画面暂未显示 · 已恢复静态图，可重试加载');console.warn('Spatial frame unavailable.',error);}});}
function buttons(){for(const id of ['zoom-in','zoom-out'])$(id).disabled=!ready;$('model-retry').hidden=ready;$('gesture-guide').textContent=ready?'拖动旋转 · 滚轮或双指缩放':'静态预览 · 可继续阅读观察说明与原文';}
function updateFallback(record){const image=$('model-fallback');image.src=record?(record.key==='routing'?'assets/chatgpt-v100-model/observation_8_render.png?rev=chatgpt-v123':'assets/chatgpt-v105-model/observation_'+stations.indexOf(record)+'.png?rev=chatgpt-v123'):'assets/chatgpt-v105-model/process_explained_v105.png?rev=chatgpt-v123';image.alt=record?record.title+' · '+record.label+'。'+record.objects:'完整机制场景：企业专窗、四项公开联办安排与稿内后台机制观察';image.dataset.observation=record?.key||'all';}
function detail(record){document.body.dataset.cutaway=record?.key==='routing'?'routing':'gallery';const heading=document.querySelector('.stage-heading h1');heading.innerHTML=record?.key==='routing'?'统一接件，<br>分别在原系统审批。':'企业只对接一个专窗，<br>后台协同怎样稳定接续？';updateFallback(record);$('observation-reading-title').textContent=record?.title||'前台入口归一，后台程序仍需衔接';$('observation-reading-copy').textContent=record?.objects||'统一接件之后，各事项的条件、标准与签批程序仍需分别衔接。';$('observation-reading-source').dataset.action=record?.action||'article:P103';$('observation-reading-source').textContent=record?'核对 '+(record.action.split(':')[1])+' ↗':'核对 P103 ↗';$('detail-label').textContent=record?.label||'公开机制 V01 / 稿内观察 P103 · P106 · P107 · P109';$('detail-title').textContent=record?.title||'一个入口，后台怎样接续？';$('detail-copy').textContent=record?.copy||'企业只对接一个专窗，四个联办安排组织服务。稿件进一步追问：各事项的审查、签批与异常协调，怎样形成稳定协同？公开道路开口改革已有容缺受理、专题会商与常态反馈记录。';$('detail-objects').textContent=record?.objects||'前侧呈现公开服务安排，后侧呈现稿内跨部门机制观察；两层对读，没有逐项因果连线。';$('research-link').dataset.action=record?.action||'tension:process';$('research-link').textContent=record?'核对对应原文 ↗':'查看案例与数据图 ↗';}
const previousLabels=new Map();
let activeRoutingPart='';
const routingParts={intake:'ROUTING_INTAKE',systemA:'ORIGINAL_SYSTEM_A',systemB:'ORIGINAL_SYSTEM_B'};
const routingPartNames={intake:'统一接件台',systemA:'原业务系统 A（示意）',systemB:'原业务系统 B（示意）'};
function labelNode(id){return document.querySelector(typeof id==='number'?'[data-label="'+id+'"]':'[data-routing-label="'+id+'"]');}
function focusRoutingPart(key){const role=routingParts[key];if(!role)return;station(8);activeRoutingPart=key;selection();if(ready)fit(readObservationBounds(model,role),[.30,1.12,1],1.45);}
function annotations(){
 if(!ready)return;
 for(let i=0;i<stations.length;i++){if((activeStep===8&&i!==8)||(activeStep!==8&&i===8)){document.querySelector('[data-label="'+i+'"]').hidden=true;previousLabels.delete(i);}}
 camera.updateMatrixWorld();
 const width=host.clientWidth,height=host.clientHeight,labels=[];
 for(const [id,role] of Object.entries(routingParts)){
  const node=labelNode(id),selected=id===activeRoutingPart;
  node.classList.toggle('selected',selected);node.setAttribute('aria-pressed',String(selected));node.hidden=activeStep!==8;
  if(activeStep!==8){previousLabels.delete(id);continue;}
  const box=readObservationBounds(model,role),p=box.getCenter(new THREE.Vector3());p.y=box.max.y+.14;p.project(camera);
  let x=(p.x+1)*width/2,y=(1-p.y)*height/2;
  const clipped=p.z< -1||p.z>1||x<0||x>width||y<0||y>height;
  node.dataset.detached=String(clipped);node.classList.toggle('detached',clipped);node.hidden=clipped&&!selected;
  if(node.hidden){previousLabels.delete(id);continue;}
  if(clipped){x=width/2;y=24;previousLabels.delete(id);}
  const measured=node.getBoundingClientRect();labels.push({id,x,y,w:measured.width||274,h:measured.height||133,previous:previousLabels.get(id)});
 }
 for(const i of stations.map((_,i)=>i).filter(i=>activeStep===8?i===8:i!==8).sort((a,b)=>(b===activeStep)-(a===activeStep))){
  const node=document.querySelector('[data-label="'+i+'"]'),box=i===8?readObservationBounds(model,'MATERIAL_DISTRIBUTION'):i===activeStep?readObservationBounds(model,groups[stations[i].key][0]):bounds(stations[i].key),p=box.getCenter(new THREE.Vector3());p.y=box.max.y+.13;p.project(camera);
  let x=(p.x+1)*width/2,y=(1-p.y)*height/2;
  node.classList.toggle('selected',i===activeStep);node.setAttribute('aria-pressed',String(i===activeStep));
  const clipped=p.z< -1||p.z>1||x<0||x>width||y<0||y>height;
  node.dataset.detached=String(clipped);node.classList.toggle('detached',clipped);node.title=clipped?'当前物件离开视野，点击重新定位':'';
  node.hidden=clipped&&i!==activeStep;if(node.hidden){previousLabels.delete(i);continue;}
  if(clipped){x=width/2;y=24;previousLabels.delete(i);}
  // Measure the complete label after selected styling; never replace its name with an index.
  const measured=node.getBoundingClientRect();
  const w=measured.width||node.offsetWidth||164,h=measured.height||node.offsetHeight||42;
  labels.push({id:i,x,y,w,h,previous:previousLabels.get(i)});
 }
 const hostRect=host.getBoundingClientRect(),statusRect=$('model-status').getBoundingClientRect?.(),obstacles=[];
 if(statusRect?.width>0&&statusRect?.height>0){const r={x:statusRect.left-hostRect.left-4,y:statusRect.top-hostRect.top-4,w:statusRect.width+8,h:statusRect.height+8};if(r.x<width&&r.x+r.w>0&&r.y<height&&r.y+r.h>0)obstacles.push(r);}
 const priority=id=>id===activeRoutingPart?2:id===activeStep?1:0;
 labels.sort((a,b)=>priority(b.id)-priority(a.id));
 labels.forEach(label=>{label.priority=priority(label.id);});
 const placed=layoutObjectLabels(labels,width,height,obstacles,projectProtectedRectangles(activeStep===8?routingModel:legacyModel,camera,width,height)),leaders=$('model-leaders');
 leaders.setAttribute('viewBox','0 0 '+width+' '+height);leaders.replaceChildren();
 for(const item of placed){
  const node=labelNode(item.id);node.hidden=!item.visible;
  if(!item.visible){previousLabels.delete(item.id);continue;}
  previousLabels.set(item.id,item.rect);node.style.left=item.rect.x+'px';node.style.top=item.rect.y+'px';
  if(node.dataset.detached==='true'||item.docked)continue;
  const color=typeof item.id==='string'||item.id>=5?'#d1b988':'#a4cede';
  const line=document.createElementNS('http://www.w3.org/2000/svg','line');
  for(const [key,value] of Object.entries(item.leader))line.setAttribute(key,String(value));
  line.setAttribute('stroke',color);line.setAttribute('stroke-opacity',item.id===activeStep?'.9':'.55');line.setAttribute('stroke-width',item.id===activeStep?'1.5':'1');line.setAttribute('data-leader',String(item.id));leaders.appendChild(line);
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
function selection(){$('mechanism-reading').dataset.highlight=activeStep===5?'review':activeStep===6?'signoff':'none';const selectedPart=activeStep===8&&routingParts[activeRoutingPart];focusIndicator?.set(selectedPart?[selectedPart]:activeStep>=0?groups[stations[activeStep].key]:[],activeStep>=5?0xd1b988:0xa4cede);$('focus-caption').textContent=activeStep<0?'点击物件或名称，定位对应内容':activeStep>=5?'当前观察 / 稿内后台接续 · '+stations[activeStep].title:'当前观察 / 公开联办安排 · '+stations[activeStep].title;if(selectedPart){$('focus-caption').textContent='当前观察 / P103 · '+routingPartNames[activeRoutingPart];$('observation-reading-title').textContent=routingPartNames[activeRoutingPart];$('observation-reading-copy').textContent=activeRoutingPart==='intake'?'窗口将材料收进后，再分派至各部门。':'示意原部门系统，分别保留审批权限、审批节奏与审批责任。';}$('focus-caption').dataset.kind=activeStep>=5?'observation':'public';document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(activeStep<0&&b.dataset.view===activeView)));document.querySelectorAll('[data-station]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.station)===activeStep)));}
function showGeometry(index){if(legacyModel)legacyModel.visible=index!==8;if(routingModel)routingModel.visible=index===8;}
function view(name){activeRoutingPart='';showGeometry(-1);activeView=['all','front','back','top'].includes(name)?name:'all';activeStep=-1;detail(null);selection();if(ready)fit(wholeBox,name==='top'?[.001,1,.001]:name==='back'?[.3,.9,-1]:name==='front'?[0,.65,1]:[.5,.95,1],1.25);say(({all:'完整机制场景',front:'企业端观察',back:'后台观察',top:'顶部观察'})[activeView]+(ready?' · 可旋转与缩放':' · 静态说明'));}
function station(index){if(!Number.isInteger(index)||!stations[index])return;activeRoutingPart='';activeStep=index;activeView='all';showGeometry(index);detail(stations[index]);selection();if(ready)fit(readObservationBounds(model,groups[stations[index].key][0]),stations[index].direction,1.42);say(stations[index].title+(ready?' · 可旋转与缩放':' · 静态说明'));}
function isGlass(node){return node.isMesh&&(Array.isArray(node.material)?node.material:[node.material]).some(m=>m?.transmission>0);}
function restoreObservation(raw){const s=window.GovModelState.normalize(raw);if(!ready||!s||s.modelId!==modelId)return false;const target=new THREE.Vector3(...s.target),position=new THREE.Vector3(...s.position);const restoreBox=s.caseStep===8?readObservationBounds(model,'SEPARATE_SYSTEM_ROUTING'):wholeBox;if(!restoreBox.clone().expandByScalar(restoreBox.getSize(new THREE.Vector3()).length()).containsPoint(target)||position.distanceTo(target)>controls.maxDistance)return false;if(s.caseStep>=0)station(s.caseStep);else view(s.view);cameraMotion?.stop();lastFit=null;camera.position.copy(position);controls.target.copy(target);controls.update();if(s.caseStep===8){activeRoutingPart=Object.entries(routingParts).find(([,role])=>readObservationBounds(model,role).getCenter(new THREE.Vector3()).distanceTo(target)<1e-6)?.[0]||'';selection();}schedule();return true;}
function zoom(factor){if(!ready)return;cameraMotion?.stop();lastFit=null;const delta=camera.position.clone().sub(controls.target);camera.position.copy(controls.target).add(delta.setLength(THREE.MathUtils.clamp(delta.length()*factor,controls.minDistance,controls.maxDistance)));controls.update();schedule();}
function activate(event){if(!ready)return;const rect=host.getBoundingClientRect();pointer.set((event.clientX-rect.left)/rect.width*2-1,1-(event.clientY-rect.top)/rect.height*2);ray.setFromCamera(pointer,camera);for(const hit of ray.intersectObject(model,true)){let invisible=false;for(let n=hit.object;n;n=n.parent)if(!n.visible)invisible=true;if(invisible)continue;for(let n=hit.object;n;n=n.parent){const index=stations.findIndex(s=>groups[s.key].includes(n.name));if(index>=0){station(index);return;}}}}
function dispose(){cameraMotion?.dispose();cameraMotion=null;presented=false;focusIndicator?.dispose();focusIndicator=null;previousLabels.clear();$('model-leaders').replaceChildren();disposed=true;ready=false;generation++;if(animation)cancelAnimationFrame(animation);animation=0;observer?.disconnect();controls?.dispose();const geometries=new Set(),materials=new Set(),textures=new Set();scene?.traverse(o=>{if(o.geometry)geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])if(m){materials.add(m);for(const v of Object.values(m))if(v?.isTexture)textures.add(v);}});for(const t of textures)t.dispose();for(const m of materials)m.dispose();for(const g of geometries)g.dispose();environmentTarget?.dispose();environmentTarget=null;renderer?.dispose();renderer?.domElement.remove();model=null;legacyModel=null;routingModel=null;document.body.classList.remove('model-ready');document.querySelectorAll('[data-label],[data-routing-label]').forEach(n=>n.hidden=true);buttons();}
async function environment(id){let hdr,generator,next;try{hdr=await new HDRLoader().loadAsync('assets/v12/environment/studio_small_09_1k.hdr');if(disposed||id!==generation)return;generator=new THREE.PMREMGenerator(renderer);next=generator.fromEquirectangular(hdr);const old=environmentTarget;environmentTarget=next;next=null;scene.environment=environmentTarget.texture;old?.dispose();schedule();}catch(error){if(!disposed)console.warn('Studio environment unavailable; local environment retained.',error);}finally{hdr?.dispose();generator?.dispose();next?.dispose();}}
async function load(){
 disposed=false;const id=++generation;ready=false;buttons();say('正在加载完整三维模型…');
 try{
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.75));renderer.setClearColor(0x09172a,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.9;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;host.appendChild(renderer.domElement);
  scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(36,1,.03,200);controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=false;controls.rotateSpeed=.65;controls.zoomSpeed=.8;controls.maxPolarAngle=Math.PI*.49;controls.minDistance=.6;controls.addEventListener('change',schedule);controls.addEventListener('start',()=>{cameraMotion?.stop();lastFit=null;});cameraMotion=createCameraTransition({camera,controls,requestFrame:schedule,canAnimate:()=>presented&&!disposed&&!document.hidden,reducedMotion:()=>Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)});
  const generator=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();try{environmentTarget=generator.fromScene(room,.04);scene.environment=environmentTarget.texture;}finally{room.dispose();generator.dispose();}scene.environmentIntensity=.7;void environment(id);
  scene.add(new THREE.HemisphereLight(0xe3edf7,0x243345,.6));const key=new THREE.DirectionalLight(0xf5f3ef,2.3);key.position.set(-8,14,10);key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.normalBias=.025;key.shadow.bias=-.0002;scene.add(key);const fill=new THREE.DirectionalLight(0xb5cadd,.85);fill.position.set(12,8,-8);scene.add(fill);
  const [loaded,routed]=await Promise.all([new GLTFLoader().loadAsync('assets/chatgpt-v105-model/process_lettering_v105.glb?rev=chatgpt-v123'),new GLTFLoader().loadAsync('assets/chatgpt-v100-model/routing_p103_readable_v100.glb?rev=chatgpt-v123')]);
  if(disposed||id!==generation){[loaded.scene,routed.scene].forEach(part=>part.traverse(o=>{o.geometry?.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material])m?.dispose();}));return;}
  model=new THREE.Group();model.name='Process mechanisms V97';legacyModel=loaded.scene;routingModel=routed.scene;model.add(legacyModel,routingModel);routingModel.visible=false;for(const names of Object.values(groups))for(const name of names)if(!model.getObjectByName(name))throw Error('Missing model role '+name);
  model.traverse(o=>{if(o.isMesh){o.castShadow=!isGlass(o);o.receiveShadow=true;}});wholeBox=new THREE.Box3().setFromObject(legacyModel);if(wholeBox.isEmpty())throw Error('Empty model');scene.add(model);focusIndicator=createModelFocus(model,{bounds:role=>readObservationBounds(model,role)});scene.add(focusIndicator.object);
  const center=wholeBox.getCenter(new THREE.Vector3()),span=wholeBox.getSize(new THREE.Vector3()).length();controls.maxDistance=span*3;key.target.position.copy(center);scene.add(key.target);Object.assign(key.shadow.camera,{left:-span,right:span,top:span,bottom:-span,near:.1,far:100});key.shadow.camera.updateProjectionMatrix();
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(span*2,span*2),new THREE.ShadowMaterial({color:0x030c18,opacity:.27}));floor.rotation.x=-Math.PI/2;floor.position.set(center.x,wholeBox.min.y-.02,center.z);floor.receiveShadow=true;scene.add(floor);
  ready=true;resize();if(activeStep>=0)station(activeStep);else view(activeView);if(pending){restoreObservation(pending);pending=null;}buttons();schedule();observer=new ResizeObserver(resize);observer.observe(host);
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();pending=state();dispose();say('三维环境中断 · 已恢复静态图，可重试加载或继续阅读');});
 }catch(error){if(id!==generation)return;dispose();say((()=>{try{return!!document.createElement('canvas').getContext('webgl')}catch(e){return false}})()?'三维暂未打开 · 已保留完整静态图和案例说明，可重试加载':'三维未打开：当前浏览器未启用 WebGL（硬件加速）· 已保留完整静态图和案例说明');console.warn('Spatial model unavailable.',error);}
}
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>view(b.dataset.view)));
document.querySelectorAll('[data-routing-label],[data-routing-part]').forEach(b=>b.addEventListener('click',()=>focusRoutingPart(b.dataset.routingLabel??b.dataset.routingPart)));
document.querySelectorAll('[data-station],[data-label]').forEach(b=>b.addEventListener('click',()=>station(Number(b.dataset.station??b.dataset.label))));
document.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',()=>{const action=b.dataset.action;if(!actions.has(action))return;if(embedded)notify({type:'gov-model-action',action});else{const u=new URL('材质智治大厅.html',document.baseURI);u.searchParams.set('view','hall');u.searchParams.set('detail',action);u.searchParams.set('context','process');u.hash='process';location.href=u.href;}}));
$('model-fallback').addEventListener('error',()=>{const image=$('model-fallback');if(!image.src.endsWith('process_explained_v105.png?rev=chatgpt-v123')){image.src='assets/chatgpt-v105-model/process_explained_v105.png?rev=chatgpt-v123';image.alt='完整机制场景；当前观察请结合侧栏名称与说明阅读';}});
$('hall-return').addEventListener('click',e=>{if(embedded){e.preventDefault();notify({type:'gov-model-close'});}});
$('zoom-in').addEventListener('click',()=>zoom(.8));$('zoom-out').addEventListener('click',()=>zoom(1.25));$('reset').addEventListener('click',()=>{view('all');});$('model-retry').addEventListener('click',()=>{dispose();void load();});
$('fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('viewer-shell').requestFullscreen();}catch{say('当前环境不支持全屏，可继续观察与缩放');}});document.addEventListener('fullscreenchange',()=>{$('fullscreen').textContent=document.fullscreenElement?'退出全屏':'全屏观察 ↗';resize();});
host.addEventListener('pointerdown',e=>{cameraMotion?.stop();pointers.add(e.pointerId);if(pointers.size>1)gestureMoved=true;pointerStart={id:e.pointerId,x:e.clientX,y:e.clientY};});host.addEventListener('pointermove',e=>{if(pointerStart&&Math.hypot(e.clientX-pointerStart.x,e.clientY-pointerStart.y)>5)gestureMoved=true;});host.addEventListener('pointerup',e=>{if(!gestureMoved&&pointerStart?.id===e.pointerId)activate(e);pointers.delete(e.pointerId);if(!pointers.size){pointerStart=null;gestureMoved=false;}});host.addEventListener('pointercancel',e=>{pointers.delete(e.pointerId);pointerStart=null;if(!pointers.size)gestureMoved=false;});
window.addEventListener('resize',resize);document.addEventListener('visibilitychange',()=>{if(document.hidden)cameraMotion?.stop();else schedule();});window.addEventListener('pagehide',e=>{cameraMotion?.stop();if(!e.persisted)dispose();});window.addEventListener('pageshow',e=>{if(e.persisted)resize();});
window.GovModelViewer=Object.freeze({captureState:state,restoreObservation,view,focusCaseStep:station,reset:()=>{view('all');},get ready(){return ready;},get modelId(){return modelId;},get activeCase(){return 'process';}});
load();
