'use strict';
(() => {
  const D=window.GOV_V7, A=window.GovArtwork, C=window.GovCharts;
  const $=id=>document.getElementById(id), esc=C.esc, fmt=C.fmt;
  const topics=Object.keys(A.names);
  const mainViews=new Map();
  let mountedTopic=null,ambientTopic=null;
  let currentTopic='overview',returnFocus=null,searchState={q:'',kind:'all',dimension:''},searchContextActive=false,assetPromise;
  function summary(topic){
    if(topic==='overview')return '一件事办得成，一盘棋为何仍难接续？前台按需求集成，后台按职责运行。入口整合不自动等同于权责、程序与系统整合。'+D.kpis.map(k=>`${k.label}${fmt(k.value)}${k.unit}，${k.period}`).join('。')+'。月报、趋势、场景案例与组织条件均可展开。';
    if(topic==='evidence')return `检索${D.sources.length}条来源、${D.claims.length}项主张、${D.monthly.length}期月报和${D.cases.length}个案例，关联四维主线与组织条件。`;
    const d=D.dimensions.find(d=>d.id===topic);
    return d?`${d.name}：${window.GovCaseStory?.stories[topic]?.title||d.subtitle}。${window.GovCaseStory?.stories[topic]?.question||''}。${d.mechanisms.join('、')}。${d.question}。`+d.caseIds.map(id=>{const c=D.cases.find(c=>c.id===id);return c.title+'：'+c.metrics.map(m=>`${m.label} ${m.before==null?'':m.before+'至'}${m.after}${m.unit} ${m.note||''}`).join('；')+'。'+c.scope;}).join('。'):'';
  }
  for(const key of ['header','body','footer'])$('gov-screen').style.setProperty('--hall-'+key,A.layout[key]+'px');
  function resize(){ $('gov-screen').style.setProperty('--scale',Math.min(innerWidth/A.layout.width,innerHeight/A.layout.height)); }
  function svg(body,title,topic){return `<svg class="topic-art" viewBox="0 0 ${A.layout.width} ${A.layout.body}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><style>${A.svgStyle}</style>${body}</svg><h2 class="sr-only">${esc(title)}</h2><p class="sr-only">${esc(summary(topic))}</p>`;}
  function controls(hits){return `<div class="art-controls" aria-label="本专题图表与场景详情">${hits.map(h=>`<button class="art-hit" style="left:${h.x}px;top:${h.y}px;width:${h.w}px;height:${h.h}px" data-action="${esc(h.action)}" aria-label="${esc(h.label)}"><span class="sr-only">${esc(h.label)}</span></button>`).join('')}</div>`;}
  function home(){
    const view=A.render('overview',{hall:'assets/chatgpt-v73/hall/hall-display-1440.webp'});
    $('home-view').innerHTML=svg(view.body,view.title,'overview')+controls(view.hits);
  }
  function mountTopic(topic){
    if(topic==='overview'||mountedTopic===topic)return;
    let nodes=mainViews.get(topic);
    if(!nodes){
      const view=A.render(topic),holder=document.createElement('div');
      holder.innerHTML=svg(view.body,view.title,topic)+controls(view.hits);
      nodes=Array.from(holder.childNodes);mainViews.set(topic,nodes);
    }
    // Keep the actual controls so History can restore the original focus target.
    $('topic-view').replaceChildren(...nodes);mountedTopic=topic;
  }
  function navigate(topic,focus=false){
    if(focus&&window.GovNavigation&&!window.GovNavigation.restoring)return window.GovNavigation.topic(topic);
    if(!topics.includes(topic))topic='overview';currentTopic=topic;
    $('gov-screen').dataset.topic=topic;
    if(ambientTopic!==topic){$('ambient').innerHTML=`<svg viewBox="0 0 1920 1080" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${A.background('assets/v9/material-stage.webp',topic)}</svg>`;ambientTopic=topic;}
    $('home-view').hidden=topic!=='overview';$('topic-view').hidden=topic==='overview';
    mountTopic(topic);
    $('topic-nav').querySelectorAll('button').forEach(b=>b.setAttribute('aria-current',b.dataset.topic===topic?'page':'false'));
    $('live-announcement').textContent=`已切换至${A.names[topic]}专题。图表与场景可展开关联证据。`;
    document.dispatchEvent(new CustomEvent('gov-topic-change',{detail:{topic}}));
    if(location.hash!=='#'+topic&&!window.GovNavigation){const update=focus&&typeof history.pushState==='function'?history.pushState:history.replaceState;update.call(history,null,'','#'+topic);}
    if(focus)$('topic-nav').querySelector('[aria-current="page"]')?.focus();
  }
  function link(url,label='打开原始出处 ↗'){
    try{const u=new URL(url);return ['https:','http:'].includes(u.protocol)?`<a href="${esc(u.href)}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>`:'';}catch{return '';}
  }
  function modal(title,body,eyebrow='公开证据与适用条件'){
    if(!$('source-dialog').open)returnFocus=document.activeElement;
    $('dialog-title').textContent=title;$('dialog-eyebrow').textContent=eyebrow;$('dialog-body').innerHTML=body;$('source-dialog').scrollTop=0;
    $('dialog-back').hidden=!searchContextActive;
    if(!$('source-dialog').open)$('source-dialog').showModal();$('dialog-close').focus();
  }
  function closeDetail(){ const wasOpen=$('source-dialog').open;$('source-dialog').close();searchContextActive=false;if(!wasOpen)return;if(returnFocus?.isConnected&&!returnFocus.closest('[hidden]'))returnFocus.focus();else ($('topic-nav'))?.querySelector('[aria-current="page"]')?.focus(); }
  function close(){if(window.GovNavigation)window.GovNavigation.close();else closeDetail();}
  function dl(values){return `<dl class="detail-dl">${Object.entries(values).filter(([,v])=>v!=null&&v!=='').map(([k,v])=>`<dt>${esc(k)}</dt><dd>${esc(Array.isArray(v)?v.join('、'):v)}</dd>`).join('')}</dl>`;}
  function visual(kind,...args){return window.GovDetailVisuals?.[kind]?.(...args)||'';}
  function raw(body,label='展开原始数据、统计口径与出处'){return `<details class="detail-raw"><summary>${esc(label)}</summary><div>${body}</div></details>`;}
  function sources(ids){
    return `<h3>关联原始出处</h3>${[...new Set(ids)].map(id=>D.sources.find(s=>s.id===id)).filter(Boolean).map(s=>`<article class="source-card"><strong>${esc(s.id)} · ${esc(s.title)}</strong><small>${esc(s.publisher)} · ${esc(s.publishedDate||'发布日期未载明')} · ${esc(s.type)}</small>${link(s.url)}<button data-action="source:${esc(s.id)}">核验与归档记录</button></article>`).join('')}`;
  }
  function modelDetail(caseId='',savedObservation){
    modal('前台与后台 · 三维场景','<div class="hall-model-stage"><p role="status">正在打开完整三维场景…</p><iframe id="hall-model-frame" allow="fullscreen" title="前后台三维场景，可旋转与缩放"></iframe></div>','同一大屏 · 模型与证据联动');
    const initialZone=({'space-front':'front','space-back':'back','space-transfer':'transfer'})[caseId]||'';
    const selectedCase=initialZone?'':caseId||(['items','process'].includes(currentTopic)?currentTopic:'');
    const template=selectedCase==='items'?'assets/chatgpt-v106-items/model-frame.html':selectedCase==='process'?'assets/chatgpt-v105-model/model-frame.html':'assets/chatgpt-v102-legacy/model-frame.html';
    const frame=$('hall-model-frame'),status=frame.previousElementSibling,url=new URL(template,location.href);
    url.searchParams.set('rev','chatgpt-v123');
    if(['items','process','data','regulation'].includes(selectedCase))url.searchParams.set('modelCase',selectedCase);
    if(initialZone)url.searchParams.set('modelZone',initialZone);
    const observation=window.GovModelState?.normalize(savedObservation===undefined?window.GovNavigation?.observation:savedObservation);
    if(observation)url.searchParams.set('observation',JSON.stringify(observation));
    frame.addEventListener('load',()=>{if(frame.isConnected)status.remove();});
    frame.addEventListener('error',()=>{
      if(!frame.isConnected)return;
      status.textContent='三维页面未能打开，请重新加载。';
      const retry=document.createElement('button');retry.type='button';retry.textContent='重新加载三维场景';
      retry.style.cssText='display:block;margin-top:18px;padding:12px 20px;border:1px solid #789eb5;background:#1a3b53;color:#e0eff9;font:inherit;cursor:pointer';
      retry.addEventListener('click',()=>{if(frame.isConnected&&$('source-dialog').open)modelDetail(caseId);});status.append(retry);
    });
    frame.src=url.href;
  }
  window.addEventListener('message',e=>{const frame=$('hall-model-frame');if(!frame||e.source!==frame.contentWindow||!$('source-dialog').open)return;if(e.data?.type==='gov-model-state')window.GovNavigation.modelState(e.data.state);else if(e.data?.type==='gov-model-case')window.GovNavigation.modelCase(e.data.caseId);else if(e.data?.type==='gov-model-close')window.GovNavigation.parent();else if(e.data?.type==='gov-model-action'&&/^(?:tension:(items|process|data|regulation)|article:P(?:103|104|106|107|109|111|113|123|124|134)|source:V(?:01|06|07)|boundary)$/.test(e.data.action))window.GovHall.action(e.data.action);});
  function sourceDetail(id){
    const s=D.sources.find(v=>v.id===id);if(!s)return;const exhibit=visual('exhibitSource',id);if(exhibit){modal(s.title,exhibit,'公开原始出处 · '+id);return;}
    modal(s.title,visual('source',s)+raw(dl({'来源编号':s.id,'发布主体':s.publisher,'资料类型':s.type,'发布日期':s.publishedDate||'未载明','核读日期':s.verifiedDate,'核验与归档':s.status,'口径说明':s.note,'原件位置':s.archivePath}),'展开来源与归档信息'),'来源记录 · '+id);
  }
  function claimDetail(id){
    const c=D.claims.find(v=>v.id===id);if(!c)return;if(['C030','C031'].includes(id)){modal(c.title,visual('exhibitCredit',id),'信用修复 · 比较业务');return;}if(['C014','C015','C016','C032','X006','X007'].includes(id)){modal(c.title,visual('exhibitInspection',id),'检查统筹 · 公开记录');return;}if(['C012','C013'].includes(id)){modal(c.title,visual('exhibitMaterials',id),'材料免交 · 条件与计划');return;}if(['C005','C006','C007','C008','C009'].includes(id)){modal(c.title,visual('exhibitMetric',id),'具体场景 · 公开变化');return;}
    modal(c.title,visual('claim',c)+raw(dl({'主张编号':c.id,'数值与单位':`${Array.isArray(c.value)?c.value.join(' / '):c.value} ${c.unit}`,'期间':c.period,'适用范围':c.scope,'证据性质':c.evidenceType,'核验状态':c.status,'限定说明':c.note,'案例稿定位':c.articleLines?.length?`提取行 ${c.articleLines.join('、')}（不是Word页码）`:''})+sources(c.sourceIds)),'可核验主张 · '+id);
  }
  function caseDetail(id,withStory=true){
    const c=D.cases.find(v=>v.id===id);if(!c)return;
    const story=Object.values(window.GovCaseStory?.stories||{}).find(s=>s.caseId===id);
    modal(c.title,visual('exhibitCase',id),'场景突破与组织接续');
  }
  function kpiDetail(id){
    const k=D.kpis.find(v=>v.id===id);if(!k)return;
    modal(k.label,visual('kpi',k)+(id==='accepted'||id==='consultations'?'<button class="outline-button" data-action="statistics">查看八期月度变化 ↗</button>':'')+raw(dl({'数值':`${fmt(k.value)} ${k.unit}`,'统计期间':k.period,'范围':k.scope,'计算与限定':k.note})+sources(k.sourceIds)),'指标解读');
  }
  function statistics(all=false){
    const rows=all?D.monthly:D.series.monthly2026;
    modal(all?'32期大厅月报 · 服务规模趋势':'区级大厅 · 2026年1—8月月度变化',visual('statistics',all)+raw(`<p>咨询单位为次，受理单位为件。2024年早期月报范围保留原文表述；2024年6月两项均称受理量，暂留空值。</p><table class="detail-table"><thead><tr><th>月份</th><th>咨询 / 次</th><th>受理 / 件</th><th>范围与口径</th><th>出处</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${esc(r.month)}</td><td>${r.consultations==null?'—':fmt(r.consultations)}</td><td>${r.accepted==null?'—':fmt(r.accepted)}</td><td>${esc(r.scope)}${r.note?'<br>'+esc(r.note):''}</td><td><button data-action="source:${r.sourceId}">${esc(r.sourceId)}</button></td></tr>`).join('')}${all?'':`<tr class="total"><td>1—8月合计</td><td>${fmt(D.kpis.find(k=>k.id==='consultations').value)}</td><td>${fmt(D.kpis.find(k=>k.id==='accepted').value)}</td><td>八期月报求和</td><td>可逐期追溯</td></tr>`}</tbody></table><h3>同期业务量对照</h3>${dl(Object.fromEntries(D.series.comparison.map(c=>[c.label,`2025年1—8月 ${fmt(c.previous)} ${c.unit} → 2026年同期 ${fmt(c.current)} ${c.unit}（${c.changePercent}%）`])))}<p>同期变化描述业务规模；服务效率与改革净效果需要额外评价证据。</p>`),all?'月度运行背景 · 2024.01—2026.08':'公开月报 · 八期合计');
  }
  function dimensionDetail(id){
    const d=D.dimensions.find(v=>v.id===id);if(!d)return;
    modal(d.name+' · '+d.subtitle,visual('dimension',d)+`<div class="related-actions">${d.caseIds.map(id=>`<button data-action="case:${id}">${esc(D.cases.find(c=>c.id===id).title)}</button>`).join('')}<button data-action="search:${id}">检索本维度关联主张</button></div>`+raw(dl({'机制':d.mechanisms,'研究问题':d.question})+sources(d.sourceIds)),'四维主线 · 案例研究');
  }
  function constraintDetail(id){
    const c=D.constraints.find(v=>v.id===id);if(!c)return;
    modal(c.label,visual('constraint',c)+raw(dl({'关联维度':c.dimensionIds.map(id=>A.names[id]),'研究解释':c.description,'证据性质':c.evidenceType||'公开案例、制度安排与职责解释','阅读条件':c.status==='pending'?'明细待补核':'场景条件适用'})+sources(c.sourceIds)),'组织协同 · 交叉关联');
  }
  function boundary(){
    modal(D.researchQuestion,(window.GovCaseStory?.core()||visual('boundary'))+`<div class="related-actions">${D.constraints.map(c=>`<button data-action="constraint:${c.id}">${esc(c.label)}</button>`).join('')}</div>`,'核心问题 · 局部突破与组织边界');
  }
  function tensionDetail(id){const s=window.GovCaseStory?.stories[id];if(s)modal(s.title,visual('exhibitScene',id),'组织现场 · '+s.name);}
  function caseEvidence(id){const story=Object.values(window.GovCaseStory.stories).find(s=>s.caseId===id);if(!story)return;
    modal(story.name+' · 证据对读',visual('exhibitEvidence',id),'公开记录与组织接续');
  }
  function articleDetail(id){const exhibit=visual('exhibitExcerpt',id);if(exhibit){modal('案例原文 · '+id,exhibit,'案例稿匿名摘录 · '+id);return;}const body=window.GovCaseStory?.article(id);if(body)modal('案例原文 · '+id,body,'原文定位 · 稿件摘录与研究解释');}
  function search(dimension='',restore=false){
    if(!restore){searchState.dimension=dimension;searchState.q='';searchState.kind='all';}
    dimension=searchState.dimension;
    modal('来源与主张检索',`<div class="dialog-search-tools"><label class="sr-only" for="source-search">搜索来源或主张</label><input id="source-search" class="dialog-search" type="search" placeholder="搜索标题、机构、来源编号、主张、期间或口径" autocomplete="off"><label class="sr-only" for="search-kind">记录类别</label><select id="search-kind"><option value="all">来源与主张</option><option value="source">66条来源</option><option value="claim">39项主张</option></select><label class="sr-only" for="search-dimension">主线维度</label><select id="search-dimension"><option value="">全部维度</option>${D.dimensions.map(d=>`<option value="${d.id}" ${d.id===dimension?'selected':''}>${esc(d.name)}</option>`).join('')}</select></div><p id="result-count" role="status"></p><div id="source-results"></div>`,'可追溯证据 · 快照 '+D.asOf);
    $('source-search').addEventListener('input',e=>{searchState.q=e.target.value;results();});
    $('search-kind').addEventListener('change',e=>{searchState.kind=e.target.value;results();});
    $('search-dimension').addEventListener('change',e=>{searchState.dimension=e.target.value;results();});
    $('source-search').value=searchState.q;$('search-kind').querySelectorAll('option').forEach(option=>{option.selected=option.value===searchState.kind;});
    searchContextActive=true;$('dialog-back').hidden=true;
    results();$('source-search').focus();
  }
  function results(){
    const {q,kind,dimension}=searchState,v=q.trim().toLocaleLowerCase();
    const matches=x=>JSON.stringify(x).toLocaleLowerCase().includes(v);
    const cs=kind==='source'?[]:D.claims.filter(c=>matches(c)&&(!dimension||c.dimensionIds.includes(dimension)));
    const dim=D.dimensions.find(d=>d.id===dimension);
    const related=new Set([...(dim?.sourceIds||[]),...D.claims.filter(c=>!dimension||c.dimensionIds.includes(dimension)).flatMap(c=>c.sourceIds)]);
    const ss=kind==='claim'?[]:D.sources.filter(s=>matches(s)&&(!dimension||related.has(s.id)));
    $('result-count').textContent=`找到 ${cs.length} 项主张、${ss.length} 条来源记录${dim?' · '+dim.name:''}`;
    document.dispatchEvent(new CustomEvent('gov-search-change'));
    $('source-results').innerHTML=(cs.length?`<h3>可检索主张</h3>${cs.map(c=>`<article class="source-card"><strong>${esc(c.id)} · ${esc(c.title)}</strong><small>${esc(c.scope)} · ${esc(c.period)} · ${esc(c.evidenceType)}</small><span>${esc(c.status)}</span><button data-action="claim:${c.id}">展开主张与证据</button></article>`).join('')}`:'')+(ss.length?`<h3>公开来源记录</h3>${ss.map(s=>`<article class="source-card"><strong>${esc(s.id)} · ${esc(s.title)}</strong><small>${esc(s.publisher)} · ${esc(s.publishedDate||'日期未载明')} · ${esc(s.type)}</small>${link(s.url)}<button data-action="source:${s.id}">核验与归档记录</button></article>`).join('')}`:'')||'<p class="empty-result">没有匹配记录。可调整关键词、记录类别或主线维度。</p>';
  }
  const actions={graph:id=>modal(window.GovSupplement.names[id],window.GovSupplement.render(id),'补充结构图 · 原始记录与研究对读'),source:sourceDetail,claim:claimDetail,case:caseDetail,'case-data':id=>caseDetail(id,false),'case-evidence':caseEvidence,tension:tensionDetail,article:articleDetail,kpi:kpiDetail,dimension:dimensionDetail,constraint:constraintDetail,nav:t=>navigate(t,true),search};
  function dispatchAction(value,options={}){
    if(value==='statistics')statistics();else if(value==='trend')statistics(true);else if(value==='search')search();else if(value==='boundary')boundary();
    else if(value==='conditions')tensionDetail('data');
    else if(value==='model'||/^model:(items|process|data|regulation|space-front|space-back|space-transfer)$/.test(value))modelDetail(value.split(':')[1]||'',options.modelState);
    else {const [type,...id]=value.split(':');actions[type]?.(id.join(':'));}
  }
  function action(value){if(window.GovNavigation)window.GovNavigation.go(value);else dispatchAction(value);}
  async function artworkAssets(){
    if(window.GOV_ARTWORK_ASSETS)return window.GOV_ARTWORK_ASSETS;
    if(!assetPromise)assetPromise=Promise.all([['digits','assets/v8/fonts/Rajdhani-SemiBold.woff2'],['stage','assets/v8/material-stage.png'],['hall','assets/chatgpt-v73/hall/hall_hero_chatgpt_v73.png'],['itemsSpatial','assets/chatgpt-v106-items/organization_lettering_v106_wide.png?rev=claude-1'],['servicePlatform','assets/chatgpt-v84/public_arrangements_v84.png'],['regular','assets/v7/fonts/ReformSans-Regular.woff2'],['bold','assets/v7/fonts/ReformSans-Bold.woff2']].map(async([key,path])=>{const r=await fetch(path);if(!r.ok)throw Error('Artwork asset '+path);const b=await r.blob();const uri=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(b);});return [key,uri];})).then(Object.fromEntries).catch(e=>{assetPromise=null;throw e;});
    return assetPromise;
  }
  /** Promise<string>: standalone SVG, embedded PNG/WOFF2, no foreignObject.
   * Node exporters can inject GOV_ARTWORK_ASSETS to avoid file-protocol fetch. */
  async function exportArtwork(topic,assets){ return A.exportSvg(topic,assets||await artworkAssets()); }
  $('ambient').innerHTML=`<svg viewBox="0 0 1920 1080" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${A.background('assets/v9/material-stage.webp')}</svg>`;
  $('topic-nav').innerHTML=topics.map(t=>`<button data-topic="${t}" aria-current="false">${A.names[t]}</button>`).join('');
  home();resize();navigate(location.hash.slice(1));
  document.addEventListener('click',e=>{const b=e.target.closest('[data-action],button');if(!b)return;if(b.tagName==='A'&&b.dataset.action)e.preventDefault();if(b.dataset.topic)navigate(b.dataset.topic,true);else if(b.dataset.action)action(b.dataset.action);});
  document.addEventListener('keydown',e=>{const node=e.target.closest?.('[data-action][role="button"]');if(node&&['Enter',' '].includes(e.key)&&!e.repeat){e.preventDefault();action(node.dataset.action);}});
  $('sources-open').addEventListener('click',()=>action('search'));$('dialog-close').addEventListener('click',close);
  $('dialog-back').addEventListener('click',()=>window.GovNavigation?window.GovNavigation.parent():search(searchState.dimension,true));
  $('source-dialog').addEventListener('cancel',e=>{e.preventDefault();close();});
  $('source-dialog').addEventListener('click',e=>{if(e.target!==$('source-dialog'))return;const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close();});
  $('fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{modal('全屏展示未开启','<p>浏览器未允许这次全屏操作。当前大厅仍按窗口大小等比显示。</p>','展示设置');}});
  document.addEventListener('fullscreenchange',()=>{const active=!!document.fullscreenElement;$('fullscreen').setAttribute('aria-pressed',String(active));$('fullscreen').firstChild.textContent=active?'退出全屏 ':'全屏展示 ';resize();});
  window.addEventListener('resize',resize);window.addEventListener('hashchange',()=>{if(!window.GovNavigation)navigate(location.hash.slice(1));});
  document.addEventListener('keydown',e=>{if($('source-dialog').open||e.altKey||e.ctrlKey||e.metaKey||e.shiftKey)return;const nav=e.target.closest?.('#topic-nav, #read-nav');if(!nav)return;let index=topics.indexOf(currentTopic);if(e.key==='ArrowRight')index=(index+1)%topics.length;else if(e.key==='ArrowLeft')index=(index+topics.length-1)%topics.length;else if(e.key==='Home')index=0;else if(e.key==='End')index=topics.length-1;else return;e.preventDefault();navigate(topics[index],true);});
  window.GovHall={navigate,search:(dimension='')=>action('search'+(dimension?':'+dimension:'')),statistics:all=>action(all?'trend':'statistics'),action,dispatch:dispatchAction,closeDetail,getSearchState:()=>({...searchState}),restoreSearch:()=>{if($('source-search')){$('source-search').value=searchState.q;for(const [id,value] of [['search-kind',searchState.kind],['search-dimension',searchState.dimension]])$(id).querySelectorAll('option').forEach(o=>o.selected=o.value===value);results();}},setSearchState:s=>{searchState={...s};},exportArtwork,artworkAssets,topics,version:'38.0-hall-only',get currentTopic(){return currentTopic;},dataCounts:{sources:D.sources.length,claims:D.claims.length,monthly:D.monthly.length,cases:D.cases.length}};
  window.exportArtwork=exportArtwork;
  const requestedDetail=new URLSearchParams(location.search||'').get('detail');
  if(requestedDetail&&!document.querySelector('script[src^="assets/v15/navigation.js"]'))action(requestedDetail);
})();
