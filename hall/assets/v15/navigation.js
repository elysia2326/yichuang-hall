/* One route contract: hierarchy is semantic; browser history records visits. */
(()=>{'use strict';
const app=window.GovHall,D=window.GOV_V7,stories=window.GovCaseStory.stories;
const $=id=>document.getElementById(id),E=window.GovCharts.esc;
const initial=new URLSearchParams(location.search),baseTitle=document.title,previousHistory=history.state;
const session=Date.now().toString(36)+Math.random().toString(36).slice(2);
const records=new Map(),timeline=new Map();let current=null,serial=0,cursor=0,restoring=false;
const path=document.createElement('nav');path.id='detail-path';path.setAttribute('aria-label','页面归属');
const tabs=document.createElement('nav');tabs.id='detail-sections';tabs.setAttribute('aria-label','同一案例的数据、现场与证据');
const visit=document.createElement('button');visit.id='detail-history-back';visit.textContent='← 访问后退';visit.addEventListener('click',()=>back());
const toolbar=document.createElement('div');toolbar.className='detail-toolbar';
const tools=document.createElement('div');tools.className='detail-tools';
tools.append($('dialog-back'),visit,$('dialog-close'));toolbar.append(path,tools);
$('source-dialog').querySelector('.dialog-head').prepend(toolbar);$('source-dialog').querySelector('.dialog-head').append(tabs);$('dialog-title').tabIndex=-1;
const section=value=>['graph','tension','case-data','case-evidence','case'].includes(value.split(':')[0]);
const sectionLabel=value=>value.startsWith('graph:')?'补充结构图':value.startsWith('case-data:')?'数据图表':value.startsWith('case-evidence:')?'关联证据':'案例现场';
// Record ownership follows the case ledger, independently of the topic used to enter it.
const storyEntries=Object.entries(stories);
const sourceOwners=id=>storyEntries.filter(([,s])=>s.sourceIds.includes(id)||(D.cases.find(c=>c.id===s.caseId)?.sourceIds||[]).includes(id)).map(([key])=>key);
const claimOwners=id=>{
 const direct=storyEntries.filter(([,s])=>s.claimIds.includes(id)).map(([key])=>key);
 if(direct.length)return direct;
 const claim=D.claims.find(c=>c.id===id);
 return [...new Set((claim?.sourceIds||[]).flatMap(sourceOwners))];
};
function contextFor(value,preferred=current?.context){
 const [kind,id]=value.split(':');
 if(kind==='graph')return stories[id]?id:'';
 if(kind==='tension'||kind==='model'||kind==='dimension')return stories[id]?id:'';
 if(['case','case-data','case-evidence'].includes(kind))return storyEntries.find(([,s])=>s.caseId===id)?.[0]||'';
 let candidates=[];
 if(kind==='claim')candidates=claimOwners(id);
 else if(kind==='source'){
  candidates=sourceOwners(id);
  if(!candidates.length)candidates=[...new Set(D.claims.filter(c=>(c.sourceIds||[]).includes(id)).flatMap(c=>claimOwners(c.id)))];
 }else if(kind==='article')candidates=storyEntries.filter(([,s])=>s.paragraphs.includes(id)).map(([key])=>key);
 else if(kind==='constraint')candidates=(D.constraints.find(c=>c.id===id)?.dimensionIds||[]).filter(key=>stories[key]);
 if(candidates.length===1)return candidates[0];
 if(candidates.includes(preferred))return preferred;
 if(candidates.includes(app.currentTopic))return app.currentTopic;
 return '';
}
function valid(value){const [kind,...parts]=value.split(':'),id=parts.join(':');if(kind==='graph')return !!window.GovSupplement&&Object.hasOwn(window.GovSupplement.names,id);if(kind==='model')return value==='model'||!!stories[id]||['space-front','space-back','space-transfer'].includes(id);if(['statistics','trend','boundary','conditions'].includes(kind))return value===kind;if(kind==='search')return value==='search'||D.dimensions.some(d=>d.id===id);if(kind==='tension')return !!stories[id];if(kind==='article')return !!window.GovCaseStory.excerpts[id];const map={source:'sources',claim:'claims',kpi:'kpis',case:'cases','case-data':'cases','case-evidence':'cases',dimension:'dimensions',constraint:'constraints'};return !!map[kind]&&D[map[kind]].some(r=>r.id===id);}
function mode(){return window.GovExperience.mode;}
function makeUrl(route=current){const u=new URL(location.href||'http://localhost/材质智治大厅.html');u.searchParams.set('view',route?.mode||mode());u.hash=route?.topic||app.currentTopic;for(const k of ['detail','context','parent','q','kind','dimension','modelReturn','returnTo','backY'])u.searchParams.delete(k);if(route?.value){u.searchParams.set('detail',route.value);if(route.context)u.searchParams.set('context',route.context);if(route.parentValue)u.searchParams.set('parent',route.parentValue);if(route.value.startsWith('search')||route.parentValue?.startsWith('search')){const s=route.search||app.getSearchState();if(s.q)u.searchParams.set('q',s.q);if(s.kind!=='all')u.searchParams.set('kind',s.kind);if(s.dimension)u.searchParams.set('dimension',s.dimension);}}return u.pathname+u.search+u.hash;}
function save(persist=false){if(!current)return;if(current.value==='model'||current.value?.startsWith('model:')){try{const state=window.GovModelState.normalize($('hall-model-frame')?.contentWindow?.GovModelViewer?.captureState());if(state)current.modelState=state;}catch{}}current.y=window.scrollY||0;current.focus=document.activeElement;current.search=app.getSearchState();if(current.value){current.scroll=$('source-dialog').scrollTop;current.nodes=Array.from($('dialog-body').childNodes);}if(persist)history.replaceState(stateOf(current),'');}
function snapshot(entry,depth=0){if(!entry||depth>5)return null;return {value:entry.value,topic:entry.topic,mode:entry.mode,context:entry.context||'',parentValue:entry.parentValue||'',search:entry.search,y:entry.y||0,scroll:entry.scroll||0,modelState:entry.modelState||null,parent:records.has(entry.parentKey)?snapshot(records.get(entry.parentKey),depth+1):entry.parentSnapshot||null};}
function stateOf(entry){return {govSession:session,govRoute:entry.key,govIndex:cursor,route:snapshot(entry)};}
function emitRouteChange(previous,restored=false){document.dispatchEvent(new CustomEvent('gov-route-change',{detail:{value:current?.value||'',topic:current?.topic||'',previousValue:previous.value,previousTopic:previous.topic,restored}}));}
function commit(entry,replace=false,suppressMotion=false){const previous={value:current?.value||'',topic:current?.topic||''};if(!replace)cursor++;entry.key=++serial;entry.index=cursor;records.set(entry.key,entry);if(!replace)for(const index of timeline.keys())if(index>cursor)timeline.delete(index);timeline.set(cursor,entry.key);current=entry;history[replace?'replaceState':'pushState'](stateOf(entry),'',makeUrl(entry));emitRouteChange(previous,restoring||suppressMotion);}
function nearestBase(){let node=current,seen=new Set();while(node?.value&&!seen.has(node.key)){seen.add(node.key);node=records.get(node.parentKey);}return node&&!node.value?node:null;}
function chapterParent(){let node=current,seen=new Set();while(node&&!seen.has(node.key)){seen.add(node.key);if(section(node.value||''))return node;node=records.get(node.parentKey);}return null;}
// A research chapter can compare several services; display the opened record's actual object.
function recordBusiness(value){
 if(value.startsWith('graph:'))return ({items:'表单与审批 · 机制示意',process:'联办与接续 · 机制对读',data:'义务教育入学示例',regulation:'检查闭环与跨区后续'})[value.slice(6)]||'';
 if(['article:P122','article:P123','article:P124'].includes(value))return '综窗、取号与预约';
 if(['article:P095','claim:C030'].includes(value))return '年报异常信息修复';
 if(['claim:C031','source:V14'].includes(value))return '处罚信息信用修复';
 if(value==='source:V13')return '企业诉求接续与个案';
 return '';
}
function controls(){const c=current,s=stories[c?.context],base=nearestBase(),business=recordBusiness(c.value);let nodes=[`<button data-route-home>${E(window.GovArtwork.names[c.topic])}</button>`];
 if(s){const candidate=section(c.value)?c:chapterParent(),chapter=candidate?.context===c.context?candidate:null,chapterValue=chapter?.value||(section(c.parentValue||'')&&contextFor(c.parentValue)===c.context?c.parentValue:'')||(c.value.startsWith('claim:')?'case-data:':c.value.startsWith('article:')?'tension:':'case-evidence:')+(c.value.startsWith('article:')?s.id:s.caseId);nodes.push(`<button data-route-case> ${business?'对照主线 · ':''}${E(D.cases.find(x=>x.id===s.caseId)?.title||s.name)}</button>`);if(section(c.value))nodes.push(`<span aria-current="page">${sectionLabel(c.value)}</span>`);else{nodes.push(`<button data-route-chapter="${E(chapterValue)}">${business?'主线 · ':''}${sectionLabel(chapterValue)}</button>`);nodes.push(`<span aria-current="page">${E(c.label)}</span>`);}}
 else nodes.push(`<span aria-current="page">${E(c.label)}</span>`);
 path.innerHTML=nodes.join('<span aria-hidden="true">/</span>');
 const parent=records.get(c.parentKey),parentContext=parent?.context||contextFor(c.parentValue||''),parentName=parentContext&&parentContext!==c.context?stories[parentContext]?.name+' · ':'';
 $('dialog-back').textContent=c.value&&section(c.value)?'← 返回专题':parent?.value?'← 返回'+(section(parent.value)?parentName+sectionLabel(parent.value):parent.label):c.parentValue?'← 返回'+parentName+sectionLabel(c.parentValue):'← 返回专题';$('dialog-back').hidden=!(parent?.value||c.parentValue);
 $('dialog-close').textContent='返回专题 ↗';$('dialog-close').setAttribute('aria-label','返回专题');
 const kind=c.value.split(':')[0],level=['claim','kpi','case-data'].includes(kind)?'data':['tension','case','model'].includes(kind)?'scene':['article','source','constraint','case-evidence'].includes(kind)?'evidence':'';
 $('source-dialog').dataset.caseContext=c.context||'';
 $('source-dialog').dataset.businessObject=business||'';
 const caseTitle=s?D.cases.find(record=>record.id===s.caseId)?.title||s.name:'';
 tabs.setAttribute('aria-label',business?'相关主线的图表、现场与证据':'同一案例的数据、现场与证据');
 tabs.hidden=!s;tabs.innerHTML=s?`<span class="detail-context"><span>${E(business||caseTitle.split(' · ')[0])}</span><small>${E(s.name)} · ${business?'主线对照':'沿案例继续查看'}</small></span>${kind==='graph'?'<span class="detail-graph-current" aria-current="page">当前 / 补充结构图</span>':''}${[
   ['data','01',business?'主线图表':'数据图表',business?'查看对照主线的数字':'读清变化与适用范围','case-data:'+s.caseId],
   ['scene','02',business?'比较现场':'案例现场',business?'比较两类业务的接续':'看前后台怎样接续','tension:'+s.id],
   ['evidence','03',business?'主线证据':'关联证据',business?'对读主线的原文与出处':'核对原文与公开出处','case-evidence:'+s.caseId]
 ].map(([key,no,label,copy,value])=>`<button data-action="${value}" data-journey-level="${key}" aria-current="${level===key?'page':'false'}"><span class="detail-step-no" aria-hidden="true">${no}</span><span class="detail-step-copy"><span>${label}</span><small>${copy}</small></span></button>`).join('')}`:'';
 visit.textContent='← 返回上一查看';visit.setAttribute('aria-label','返回上一查看，按访问记录后退');
 visit.hidden=cursor===0;document.title=c.label+' · 一窗之后';}
// A direct iframe creates a fresh document when reattached; provide its saved observation first.
function restoreModelFrame(frame,entry){
 if(!frame)return;
 const id=entry.value.split(':')[1],observation=window.GovModelState.normalize(entry.modelState);
 if(frame.srcdoc){
  if(stories[id])frame.srcdoc=frame.srcdoc.replace(/<body data-case='[^']*'>/,"<body data-case='"+id+"'>");
  frame.srcdoc=window.GovModelState.inject(frame.srcdoc,observation);
  return;
 }
 try{
  const url=new URL(frame.src,location.href),base=new URL('assets/',location.href);
  const entries=['chatgpt-v106-items/model-frame.html','chatgpt-v105-model/model-frame.html','chatgpt-v102-legacy/model-frame.html'];
  if(url.origin!==base.origin||!entries.some(path=>url.pathname===new URL(path,base).pathname))return;
  if(stories[id])url.searchParams.set('modelCase',id);
  if(observation)url.searchParams.set('observation',JSON.stringify(observation));else url.searchParams.delete('observation');
  frame.src=url.href;
 }catch{}
}
function restore(key){const previous={value:current?.value||'',topic:current?.topic||''};save();const entry=records.get(key);if(!entry)return;restoring=true;current=entry;window.GovExperience.setView(entry.mode);app.navigate(entry.topic);app.setSearchState(entry.search);
 if(entry.value){$('dialog-title').textContent=entry.label;$('dialog-eyebrow').textContent=entry.eyebrow;if(entry.value==='model'||entry.value.startsWith('model:')){for(const node of entry.nodes){const frame=node.id==='hall-model-frame'?node:node.querySelector?.('#hall-model-frame');restoreModelFrame(frame,entry);}}$('dialog-body').replaceChildren(...entry.nodes);if(!$('source-dialog').open)$('source-dialog').showModal();controls();$('source-dialog').scrollTop=entry.scroll||0;}else{app.closeDetail();document.title=baseTitle;}
 const finish=()=>{window.scrollTo?.({top:entry.y||0,behavior:'instant'});if(entry.focus?.isConnected)entry.focus.focus({preventScroll:true});else if(entry.value)$(entry.value.startsWith('search')?'source-search':'dialog-title')?.focus({preventScroll:true});};if(window.requestAnimationFrame)window.requestAnimationFrame(finish);else finish();restoring=false;emitRouteChange(previous,true);}
function go(value,options={}){if(value==='conditions')value='tension:data';if(value.startsWith('nav:'))return topic(value.slice(4));if(!valid(value))return invalid(value);if(value.startsWith('case:')){const id=value.slice(5),s=Object.values(stories).find(s=>s.caseId===id);if(s)value='tension:'+s.id;}
 if(current?.value===value)return;save(true);const prior=current,ctx=contextFor(value,options.context||current?.context),base=nearestBase();
 const parent=section(value)||value.startsWith('search')||options.semanticBase?base:prior;restoring=true;app.dispatch(value,{modelState:window.GovModelState.normalize(options.modelState)});if(!$('source-dialog').open){restoring=false;return;}
 const entry={value,context:ctx,topic:app.currentTopic,mode:mode(),label:$('dialog-title').textContent,eyebrow:$('dialog-eyebrow').textContent,parentKey:parent?.key,parentValue:value.startsWith('search')?'':options.parent||(!section(value)&&prior?.value?prior.value:''),nodes:Array.from($('dialog-body').childNodes),parentSnapshot:options.parentSnapshot||null,modelState:window.GovModelState.normalize(options.modelState),scroll:0,y:prior?.y||0,search:app.getSearchState()};
 if(value.startsWith('search')&&options.search){app.setSearchState(options.search);app.restoreSearch();entry.search=app.getSearchState();entry.nodes=Array.from($('dialog-body').childNodes);}
 restoring=false;commit(entry,options.replace,options.restore===true);controls();$(value.startsWith('search')?'source-search':'dialog-title')?.focus({preventScroll:true});}
function invalid(value){save(true);app.dispatch('boundary');$('dialog-title').textContent='此详情地址无法识别';$('dialog-body').innerHTML=`<section class="cs-panel"><h3>未找到对应记录</h3><p>地址中的记录可能不存在，或参数不完整。可以返回专题，或重新检索资料。</p><button data-action="search">检索来源与主张</button></section>`;commit({value,context:'',topic:app.currentTopic,mode:mode(),label:'此详情地址无法识别',eyebrow:'地址检查',parentKey:nearestBase()?.key,nodes:Array.from($('dialog-body').childNodes),search:app.getSearchState()},true);controls();}
// Internal returns use app snapshots; iframe joint history is not an app-route index.
function move(entry){if(!entry)return home();if(entry.key===current?.key)return;cursor=entry.index;restore(entry.key);history.replaceState(stateOf(current),'',makeUrl(current));}
function home(){const base=nearestBase();if(base)return move(base);save();app.setSearchState({q:initial.get('q')||'',kind:['all','source','claim'].includes(initial.get('kind'))?initial.get('kind'):'all',dimension:D.dimensions.some(d=>d.id===initial.get('dimension'))?initial.get('dimension'):''});
app.closeDetail();commit({value:'',topic:app.currentTopic,mode:mode(),y:current?.y||0,search:app.getSearchState()},true);document.title=baseTitle;}
function parent(){const p=records.get(current?.parentKey);if(p?.value||section(current?.value||''))return move(p);if(current?.parentValue&&current.parentValue!==current.value&&valid(current.parentValue)){const preserved=current.parentSnapshot;go(current.parentValue,{replace:true,semanticBase:true,search:current.parentValue.startsWith('search')?current.search:undefined,parent:preserved?.parentValue||'',parentSnapshot:preserved?.parent,context:preserved?.context,modelState:preserved?.modelState});if(preserved?.value===current.value){current.scroll=preserved.scroll||0;current.y=preserved.y||0;$('source-dialog').scrollTop=current.scroll;history.replaceState(stateOf(current),'');}return;}return home();}
function back(){const previous=records.get(timeline.get(cursor-1));if(previous)return move(previous);return parent();}
function topic(id,replace=false){save(!replace);restoring=true;app.closeDetail();app.navigate(id,true);restoring=false;commit({value:'',topic:app.currentTopic,mode:mode(),y:0,search:app.getSearchState()},replace);window.scrollTo?.({top:0,behavior:'instant'});document.title=baseTitle;}
function modelState(raw){if(current?.value!=='model'&&!current?.value?.startsWith('model:'))return;const state=window.GovModelState.normalize(raw);if(!state)return;current.modelState=state;history.replaceState(stateOf(current),'',makeUrl());}
function modelCase(id){if(!stories[id]||!current?.value?.startsWith('model'))return;if(['items','process'].includes(id)&&current?.modelState?.modelId!==({'items':'items-v78','process':'process-v97'})[id])return go('model:'+id,{replace:true,parent:current.parentValue,parentSnapshot:current.parentSnapshot});save();current.value='model:'+id;current.context=id;history.replaceState(stateOf(current),'',makeUrl());controls();}
function view(){save(true);commit({...current,mode:'hall'},true);}
window.addEventListener('hashchange',()=>{if(restoring||location.hash.slice(1)===app.currentTopic)return;cursor++;topic(location.hash.slice(1),true);});
window.addEventListener('popstate',e=>{cursor=e.state?.govIndex||0;if(e.state?.govSession===session&&records.has(e.state.govRoute))return restore(e.state.govRoute);const q=new URLSearchParams(location.search),r=e.state?.route||{value:q.get('detail')||'',topic:location.hash.slice(1),mode:q.get('view'),context:q.get('context')||'',parentValue:q.get('parent')||'',search:{q:q.get('q')||'',kind:q.get('kind')||'all',dimension:q.get('dimension')||''}};save();restoring=true;app.closeDetail();window.GovExperience.setView('hall');app.navigate(r.topic);restoring=false;commit({value:'',topic:app.currentTopic,mode:mode(),y:r.y||0,search:r.search||app.getSearchState()},true,true);app.setSearchState(r.search||{q:'',kind:'all',dimension:''});if(r.value){go(r.value,{replace:true,restore:true,parent:r.parentValue,context:r.context,parentSnapshot:r.parent,modelState:r.modelState,search:r.value.startsWith('search')?r.search:undefined});$('source-dialog').scrollTop=r.scroll||0;}else restore(current.key);});
path.addEventListener('click',e=>{if(e.target.closest('[data-route-home]'))home();else if(e.target.closest('[data-route-case]')){const s=stories[current.context];go('tension:'+s.id);}else{const b=e.target.closest('[data-route-chapter]');if(b)go(b.dataset.routeChapter,{replace:true});}});
let scrollTick=0;function rememberPosition(){if(restoring)return;clearTimeout(scrollTick);scrollTick=setTimeout(()=>save(true),120);} $('source-dialog').addEventListener('scroll',rememberPosition,{passive:true});window.addEventListener('scroll',rememberPosition,{passive:true});window.addEventListener('pagehide',()=>save(true));
document.addEventListener('gov-search-change',()=>{if(restoring||!current?.value?.startsWith('search'))return;current.search=app.getSearchState();history.replaceState(stateOf(current),'',makeUrl());});
window.GovNavigation={go,back,parent,close:home,topic,view,modelCase,modelState,get observation(){return current?.modelState||null;},get restoring(){return restoring;},get current(){return current?.value||null;}};
app.setSearchState({q:initial.get('q')||'',kind:['all','source','claim'].includes(initial.get('kind'))?initial.get('kind'):'all',dimension:D.dimensions.some(d=>d.id===initial.get('dimension'))?initial.get('dimension'):''});
app.closeDetail();commit({value:'',topic:app.currentTopic,mode:mode(),y:Number(initial.get('backY'))||0,search:app.getSearchState()},true);
const requested=initial.get('detail'),recovered=previousHistory?.route?.value===(requested||'')&&previousHistory.route.topic===app.currentTopic?previousHistory.route:null;if(requested)go(requested,{replace:!!previousHistory?.route,context:initial.get('context'),parent:initial.get('parent')||'',modelState:recovered?.modelState,parentSnapshot:recovered?.parent,search:requested.startsWith('search')?{q:initial.get('q')||'',kind:['all','source','claim'].includes(initial.get('kind'))?initial.get('kind'):'all',dimension:D.dimensions.some(d=>d.id===(initial.get('dimension')||requested.slice(7)))?(initial.get('dimension')||requested.slice(7)):''}:undefined});else if(initial.get('backY'))restore(current.key);
if(previousHistory?.route&&previousHistory.route.value===(requested||'')&&previousHistory.route.topic===app.currentTopic){current.modelState=window.GovModelState.normalize(previousHistory.route.modelState);current.parentSnapshot=previousHistory.route.parent||null;current.y=previousHistory.route.y||0;current.scroll=previousHistory.route.scroll||0;$('source-dialog').scrollTop=current.scroll;if(!requested){const recover=()=>window.scrollTo?.({top:current.y,behavior:'instant'});if(window.requestAnimationFrame)window.requestAnimationFrame(recover);else recover();}}
})();
