/* Reading perspectives compare evidence layers; they are not business steps. */
(()=>{'use strict';
const esc=window.GovCharts.esc;
const records={
 items:{name:'事项集成',layers:{'统一申请字段':'entry','原业务系统 A':'review','原业务系统 B':'review','整体答复':'handoff'},views:{
  all:{label:'整体对读',title:'入口合在一起，审批与解释怎样接续？',copy:'证照联办时限已有29→5工作日的公开记录。稿内一般观察表明，统一字段与原系统、原审批权限可以同时存在。',basis:'公开场景 × 稿内机制观察',refs:['source:V04','article:P104']},
  entry:{label:'统一字段',title:'申请字段集中到前台',copy:'稿内访谈描述：前端统一申请字段，再分别推送给不同原业务系统。此处聚焦入口组织与材料分派。',basis:'稿内访谈 / P104',refs:['article:P104']},
  review:{label:'原系统审查',title:'审批权限、节奏与责任仍在原部门',copy:'各部门在各自系统按既定流程审批。材料统一收取之后，还需要对齐不同事项的进度，并处理受阻环节。',basis:'稿件作者分析 / P103',refs:['article:P103','article:P104']},
  handoff:{label:'整体答复',title:'窗口整体答复，解释权仍需衔接',copy:'窗口依部门规则答复，最终解释由审批主体作出。接续点在办理进度、退件原因与最终判断。',basis:'稿内访谈 / P134；作者分析 / P103',refs:['article:P134','article:P103']}
 }},
 process:{name:'流程协同',layers:{'一次提交':'entry','一次踏勘':'entry','一次缴费':'entry','一次办结':'entry','审查条件':'review','签批与进度':'review','协调与反馈':'handoff'},views:{
  all:{label:'整体对读',title:'联办已有成效，后台接续怎样稳定？',copy:'道路开口公开记录呈现时限、跑动压缩与已有协调安排。稿内分析进一步追问各事项的法定条件、签批和进度怎样接续。',basis:'道路开口公开记录 × 稿内一般组织观察',refs:['source:V01','article:P106','article:P107']},
  entry:{label:'公开联办',title:'四项联办安排共同组织服务',copy:'一次提交、一次踏勘、一次缴费、一次办结按场景条件组织相应事项。图中保留四项安排的并列关系。',basis:'公开报道 V01 / 60平方公里联办范围',refs:['source:V01']},
  review:{label:'稿内程序',title:'法定条件与签批进度仍需接续',copy:'各事项保留法定受理条件、审查标准和签批层级。稿内还讨论退件、系统断层或权限缺失时的协调与补救。',basis:'稿内一般组织观察 / P106—P107',refs:['article:P106','article:P107']},
  handoff:{label:'公开协调',title:'会商、容缺与反馈已有公开安排',copy:'道路开口报道已记载专题会商、容缺受理和常态问题反馈。研究继续关注这些安排怎样支撑职责与办理进度的接续。',basis:'公开报道 V01 / 已有协调安排',refs:['source:V01']}
 }},
 data:{name:'数据共享',layers:{'已有材料':'entry','适用条件':'entry','授权取得与业务核验':'review handoff'},views:{
  all:{label:'整体对读',title:'少交材料之后，怎样确认数据可用？',copy:'试点计划与材料取得条件提供公开背景。稿内访谈继续追问跨部门调用的管理、反馈和出错责任。',basis:'试点计划 V06 × 稿内访谈 P113',refs:['source:V06','article:P113']},
  entry:{label:'取得条件',title:'先匹配材料，再核对适用条件',copy:'不同材料复用途径需各自核对适用条件。图中聚焦已有材料与条件判断；V06的数量保留试点计划口径。',basis:'公开试点推进计划 / V06',refs:['source:V06']},
  review:{label:'业务核验',title:'取得材料，还需核对业务可用性',copy:'关系图继续呈现授权、有效性与业务适用的核验。稿内访谈同时讨论跨部门调用需要逐项谈、逐项签。',basis:'办理关系示意 × 稿内访谈 / P113',refs:['article:P113','source:V06']},
  handoff:{label:'责任接续',title:'调用之后归谁管，出错由谁接续？',copy:'稿内访谈将调用后的管理、异常反馈与解释责任作为待接续的问题。此处聚焦责任关系，保留访谈原有的追问。',basis:'稿内访谈 / P113',refs:['article:P113']}
 }},
 regulation:{name:'监管统筹',layers:{'部门检查计划':'entry','统筹与安全优先':'entry','部门落实与留痕':'review','结果接续':'review','市区接口适配':'handoff'},views:{
  all:{label:'整体对读',title:'计划已有统筹，跨层接口怎样接续？',copy:'公开机制涵盖计划汇合、安全优先、扫码留痕和结果接续。市区接口适配按报道提出的后续安排另行观察。',basis:'公开组织机制与后续安排 / V07',refs:['source:V07']},
  entry:{label:'计划统筹',title:'多部门计划汇合，安全优先',copy:'多个部门的检查计划进入统筹，组织联合检查。安全部门计划提级置顶，形成安排检查的公开机制。',basis:'公开检查机制 / V07',refs:['source:V07']},
  review:{label:'部门落实',title:'检查主体、内容和结果可追溯',copy:'部门落实相应检查，通过主动扫码留痕，使主体、内容与结果可查，并接续评价反馈和后续处置。',basis:'公开检查机制 / V07',refs:['source:V07']},
  handoff:{label:'市区接口',title:'市区接口适配是报道中的下一步',copy:'继续优化填报和市区两级数据接口适配，是公开报道提出的后续安排。选择此视角会强调对应连接，并保留其后续安排性质。',basis:'公开后续安排 / V07',refs:['source:V07']}
 }}
};
function panel(id,key='all'){
 const v=records[id]?.views[key];if(!v)return '';
 return `<section class="case-guide-panel" data-guide-panel="${key}" data-guide-active="${key==='all'}" aria-hidden="${key!=='all'}"${key==='all'?'':' inert'}><div class="case-guide-copy"><small>${esc(v.basis)}</small><h3>${esc(v.title)}</h3><p>${esc(v.copy)}</p></div><nav class="case-guide-evidence" aria-label="当前阅读视角的依据"><span>核对当前依据</span>${v.refs.map(ref=>`<button data-action="${ref}">${ref.startsWith('article:')?'稿内':'公开'} ${ref.split(':')[1]} ↗</button>`).join('')}</nav></section>`;
}
function panels(id){return records[id]?`<div class="case-guide-panels">${Object.keys(records[id].views).map(key=>panel(id,key)).join('')}</div><span class="sr-only case-guide-announcement" aria-live="polite" aria-atomic="true"></span>`:'';}
function controls(id){const r=records[id];return r?`<div class="case-guide-head"><div><small>阅读视角 / ${esc(r.name)}</small><strong>切换焦点，保留完整关系</strong></div><nav class="case-guide-controls" aria-label="${esc(r.name)}阅读视角">${Object.entries(r.views).map(([key,v])=>`<button data-guide-perspective="${key}" aria-pressed="${key==='all'}">${esc(v.label)}</button>`).join('')}</nav></div>${window.GovCaseReplay?.controls(id)||''}`:'';}
function select(figure,key){
 const id=figure?.dataset.caseGuide,v=records[id]?.views[key];if(!figure?.isConnected||!v||figure.dataset.perspective===key)return false;
 figure.dataset.perspective=key;figure.querySelectorAll('[data-guide-perspective]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.guidePerspective===key)));
 figure.querySelectorAll('[data-reading-layer]').forEach(node=>{if(key==='all')node.removeAttribute('data-reading-active');else node.dataset.readingActive=String(node.dataset.readingLayer.split(' ').includes(key));});
 let selected;figure.querySelectorAll('[data-guide-panel]').forEach(node=>{const chosen=node.dataset.guidePanel===key;node.dataset.guideActive=String(chosen);node.setAttribute('aria-hidden',String(!chosen));if(chosen){node.removeAttribute('inert');selected=node;}else node.setAttribute('inert','');});figure.querySelector('.case-guide-announcement').textContent=v.title+'。'+v.basis;window.GovScreenMotion?.focusReading(selected);return true;
}
function click(event){const button=event.target.closest?.('[data-guide-perspective]');if(button)select(button.closest('figure[data-case-guide]'),button.dataset.guidePerspective);}
function keydown(event){const button=event.target.closest?.('[data-guide-perspective]');if(!button||event.altKey||event.ctrlKey||event.metaKey)return;const figure=button.closest('figure[data-case-guide]'),buttons=[...figure.querySelectorAll('[data-guide-perspective]')];let index=buttons.indexOf(button);if(event.key==='ArrowRight')index=(index+1)%buttons.length;else if(event.key==='ArrowLeft')index=(index+buttons.length-1)%buttons.length;else if(event.key==='Home')index=0;else if(event.key==='End')index=buttons.length-1;else return;event.preventDefault();buttons[index].focus({preventScroll:true});select(figure,buttons[index].dataset.guidePerspective);}
document.addEventListener('click',click);document.addEventListener('keydown',keydown);
window.GovCaseGuide=Object.freeze({controls,panel,panels,select,layers:(id,title)=>records[id]?.layers[title]||'',get:(id,key='all')=>records[id]?.views[key]||null});
})();
