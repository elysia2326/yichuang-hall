/* Topic diagrams complement the spatial study; conditional methods stay parallel. */
(()=>{
 'use strict';
 const stage=document.querySelector('.model-stage');
 const explorer=document.querySelector('.case-explorer');
 if(!stage||!explorer)return;
 const heading=document.querySelector('.inspector-heading');
 const originals={title:heading.querySelector('h2').textContent,copy:heading.querySelector('p').textContent};
 const methods=[
  ['数据调用','证照源文件已存储'],
  ['承诺复用','其他平台已提交，且内容未变更'],
  ['共享核验','核验接口能将文件存入复写模板'],
  ['线上开具证明','证明数据可在线开具'],
  ['告知承诺','材料已适用告知承诺制度']
 ];
 const topics={
  data:{title:'数据流通',copy:'看材料怎样按条件免交，再看专网隔离、材料传递与调用责任。',question:'材料少交了，调用与责任怎样接住？',source:'V06 · 2025.01',article:'P111 / P113',stations:['材料入口','共享核验','使用责任']},
  regulation:{title:'监管统筹',copy:'看检查计划、扫码记录与后续反馈怎样衔接，再看统筹能否接续部门职责与市区接口。',question:'检查合并了，职责与系统怎样接续？',source:'V07 · 2025.08',article:'P122—P124',stations:['统筹接续','监管职责']}
 };
 let topic='',mode='model',readingScroll=0;
 let pendingReading=window.GovModelState?.read()?.diagram||null;
 const make=(tag,className,text)=>{const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el;};
 const controls=make('div','mechanism-controls');controls.hidden=true;
 controls.setAttribute('role','group');controls.setAttribute('aria-label','模型与机制图切换');
 const modelButton=make('button','','空间模型');const diagramButton=make('button','','机制对读');
 for(const [button,value] of [[modelButton,'model'],[diagramButton,'diagram']]){
  button.type='button';button.dataset.mechanismMode=value;button.setAttribute('aria-controls','case-mechanism-diagram');
  button.addEventListener('click',()=>{setMode(value);saveReading();});controls.append(button);
 }
 heading.after(controls);
 const panel=make('section','mechanism-panel');panel.id='case-mechanism-diagram';panel.hidden=true;
 panel.setAttribute('aria-label','案例机制对读图');stage.append(panel);
 function setMode(value,restoredScroll){
  if(restoredScroll!==undefined)readingScroll=restoredScroll;
  else if(mode==='diagram')readingScroll=scrollValue();
  mode=value==='diagram'&&topics[topic]?'diagram':'model';
  panel.hidden=mode!=='diagram';stage.dataset.mechanismMode=mode;
  if(mode==='diagram'){panel.scrollTop=readingScroll;readingScroll=scrollValue();}
  modelButton.setAttribute('aria-pressed',String(mode==='model'));diagramButton.setAttribute('aria-pressed',String(mode==='diagram'));
 }
 function scrollValue(){return Math.min(100000,Math.max(0,Math.round(Number(panel.scrollTop)||0)));}
 function captureState(){
  if(!topics[topic])return undefined;
  if(mode==='diagram')readingScroll=scrollValue();
  return {topic,mode,scroll:readingScroll};
 }
 function restoreState(raw){
  if(!raw||!topics[raw.topic]||!['model','diagram'].includes(raw.mode)||!Number.isInteger(raw.scroll)||raw.scroll<0||raw.scroll>100000)return false;
  sync();if(raw.topic!==topic)return false;
  setMode(raw.mode,raw.scroll);return true;
 }
 function saveReading(){
  if(window.parent===window)return;
  const state=window.GovModelViewer?.captureState();
  if(state)window.parent.postMessage({type:'gov-model-state',state},location.origin);
 }
 panel.addEventListener('scroll',()=>{if(mode==='diagram'){readingScroll=scrollValue();saveReading();}},{passive:true});
 function evidence(action){
  if(!/^(source:V0[67]|article:P(?:111|113|123|124))$/.test(action))return;
  if(window.parent!==window){
   const state=window.GovModelViewer?.captureState();
   if(state)window.parent.postMessage({type:'gov-model-state',state},location.origin);
   window.parent.postMessage({type:'gov-model-action',action},location.origin);return;
  }
  const target=new URL('材质智治大厅.html',document.baseURI);
  target.searchParams.set('view','hall');target.searchParams.set('edition','chatgpt-v123');
  target.searchParams.set('detail',action);target.searchParams.set('context',topic);target.hash=topic;
  location.assign(target.href);
 }
 function sourceButton(label,action){const button=make('button','mechanism-source',label+' ↗');button.type='button';button.dataset.mechanismEvidence=action;button.addEventListener('click',()=>evidence(action));return button;}
 function sectionTitle(label,meta){const el=make('div','mechanism-section-title');el.append(make('h3','',label),make('span','',meta));return el;}
 function card(title,copy){const el=make('div','mechanism-card');el.append(make('strong','',title),make('p','',copy));return el;}
 function relationship(nodes,label){
  const block=make('section','mechanism-reading');block.append(sectionTitle(label,topics[topic].article));
  const row=make('div','mechanism-relationships');
  nodes.forEach(([title,copy],i)=>{if(i)row.append(make('span','mechanism-join','→'));row.append(card(title,copy));});block.append(row);return block;
 }
 function dataDiagram(){
  panel.append(sectionTitle('公开改革安排',topics.data.source));
  const materials=make('div','mechanism-materials');materials.setAttribute('aria-label','四类材料');
  ['政府核发证照证明','内部流转批复文件','申请人已提交材料','部分社会服务机构报告'].forEach(label=>materials.append(make('span','',label)));panel.append(materials);
  panel.append(make('p','mechanism-key','五种免提交方式各有条件，按材料情况分别适用。'));
  const branches=make('div','mechanism-branches');branches.setAttribute('aria-label','五种方式与各自适用条件');
  methods.forEach(([title,condition],i)=>{const row=make('div','mechanism-branch');row.dataset.method=String(i);row.append(make('strong','',title),make('span','mechanism-join','←'),make('p','',condition));branches.append(row);});panel.append(branches);
  panel.append(sourceButton('查看五种方式的公开原文','source:V06'));
  const reading=relationship([
   ['企业少交','满足条件的材料免提交'],['专网与权限','稿件讨论隔离与调用条件'],['责任接续','调用之后谁管理、谁担责']
  ],'稿件中的组织追问');
  reading.append(make('p','mechanism-key','原稿分别讨论专网隔离、线下传递与跨部门调用责任；材料免交与后台接续条件分开对读。'));
  const links=make('div','mechanism-sources');links.append(sourceButton('专网与传递 · P111','article:P111'),sourceButton('调用与责任 · P113','article:P113'));reading.append(links);panel.append(reading);
 }
 function regulationDiagram(){
  panel.append(sectionTitle('公开监管安排',topics.regulation.source));
  const phases=make('div','mechanism-phases');phases.setAttribute('aria-label','查前、查中、查后');
  [['查前','计划统筹与提前公示'],['查中','主动扫码，记录主体、时间、内容及结果'],['查后','跟踪问效，企业评价与反馈']].forEach(([title,copy],i)=>{const el=card(title,copy);el.dataset.phase=String(i);phases.append(el);});panel.append(phases);
  panel.append(make('p','mechanism-key','综合查一次组织检查计划；扫码检查形成可追溯记录。'));
  panel.append(sourceButton('核对统筹、扫码和接口安排','source:V07'));
  const reading=make('section','mechanism-reading');reading.append(sectionTitle('组织接续：两种业务分开看','V07 / '+topics.regulation.article));
  const matrix=make('div','mechanism-responsibilities');
  matrix.append(card('检查计划统筹','公开报道的监管检查安排'),card('检查接口接续','报道提出市区数据接口适配'),card('受理平台对接','原稿另谈综窗与取号终端'));reading.append(matrix);
  reading.append(make('p','mechanism-key','检查业务与综窗受理是两个对象：共同讨论跨层接续，各自保留自己的来源。'));
  const comparison=make('div','mechanism-object-comparison');
  comparison.setAttribute('aria-label','检查业务与综窗受理的分对象对读');
  const objects=[
   {key:'inspection',title:'监管检查',basis:'公开报道 · V07',nodes:['部门检查计划','联合检查与留痕','市区检查接口适配'],note:'接口适配是报道提出的后续安排。',label:'核对检查业务 · V07',action:'source:V07'},
   {key:'reception',title:'综窗受理',basis:'案例原稿 · P122—P124',nodes:['区级综窗与取号预约','平台对接的转换成本','市级申办受理平台'],note:'原稿讨论既有系统与终端投入；连线表示待对接关系。',label:'系统与终端投入 · P124',action:'article:P124'}
  ];
  for(const object of objects){
   const row=make('section','mechanism-object');row.dataset.businessObject=object.key;
   const head=make('div','mechanism-object-heading');head.append(make('h4','',object.title),make('span','',object.basis));row.append(head);
   const chain=make('ol','mechanism-object-chain');
   object.nodes.forEach((text,i)=>{const node=make('li','',text);node.dataset.objectStep=String(i);if(object.key==='inspection'&&i===2)node.dataset.status='planned';if(object.key==='inspection'&&i===1)node.dataset.nextPlanned='true';chain.append(node);});row.append(chain);
   row.append(make('p','mechanism-key',object.note),sourceButton(object.label,object.action));comparison.append(row);
  }
  reading.append(comparison,sourceButton('取号预约的原文语境 · P123','article:P123'));panel.append(reading);
 }
 function selection(){
  const index=Number(document.querySelector('#case-stations [aria-pressed="true"]')?.dataset.caseStep??-1);
  panel.dataset.station=String(index);
  panel.querySelectorAll('.mechanism-branch').forEach(row=>row.dataset.active=String(index===0||index===1&&row.dataset.method==='2'));
  panel.querySelectorAll('.mechanism-phases .mechanism-card').forEach(row=>row.dataset.active=String(index===0));
  const reading=panel.querySelector('.mechanism-reading');if(reading)reading.dataset.active=String(topic==='data'?index===2:index===1);
 }
 function sync(){
  const selected=document.querySelector('.case-explorer [data-case][aria-pressed="true"]')?.dataset.case||'';
  if(selected!==topic){
   topic=selected;const config=topics[topic];controls.hidden=!config;panel.replaceChildren();
   heading.querySelector('h2').textContent=config?.title||originals.title;
   heading.querySelector('p').textContent=config?.copy||originals.copy;
   if(config){const title=make('h2','mechanism-question',config.question);panel.append(title);if(topic==='data')dataDiagram();else regulationDiagram();}
   setMode('model',0);
  }
  selection();
  if(pendingReading?.topic===topic){const saved=pendingReading;pendingReading=null;restoreState(saved);}
 }
 const observer=new MutationObserver(sync);observer.observe(explorer,{subtree:true,attributes:true,attributeFilter:['aria-pressed'],childList:true});
 sync();window.addEventListener('pagehide',event=>{if(!event.persisted)observer.disconnect();});
 window.GovMechanismDiagram={sync,captureState,restoreState,get topic(){return topic;},get mode(){return mode;}};
})();
