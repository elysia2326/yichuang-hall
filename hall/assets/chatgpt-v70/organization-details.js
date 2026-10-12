/* Cross-dimensional organization questions; all nodes read the existing ledger.
 * Lines are reading associations, not measured flow or a sequence of events. */
(() => {
  'use strict';
  const D=window.GOV_V7, S=window.GovCaseStory, V=window.GovDetailVisuals;
  const esc=window.GovCharts.esc, material=window.GovDiagramMaterial;
  const ink='#edf5ff',muted='#aebdd2',blue='#a4e3f4',gold='#e8cea0';
  const text=(x,y,value,size=20,color=ink,weight=400)=>`<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${color}">${esc(value)}</text>`;
  function lines(value,count){
    const chars=Array.from(value),rows=[];let i=0;
    while(i<chars.length){let end=Math.min(i+count,chars.length);while(end>i+1&&/[，。；：！？、）》”]/.test(chars[end]||''))end--;rows.push(chars.slice(i,end).join(''));i=end;}
    if(rows.length>1&&Array.from(rows.at(-1)).length<5){const last=Array.from(rows.pop()),prior=Array.from(rows.pop()),shift=Math.min(6-last.length,prior.length-1);rows.push(prior.slice(0,-shift).join(''),prior.slice(-shift).join('')+last.join(''));}
    return rows;
  }
  function multiline(x,y,value,count,size=20,color=muted,lineHeight=30){return lines(value,count).map((row,i)=>text(x,y+i*lineHeight,row,size,color)).join('');}
  function node(x,y,w,h,action,label,content,prefix,warm=false){
    return `<g class="gs-node oc-node" data-organization-node="${esc(action)}" role="button" tabindex="0" data-action="${esc(action)}" aria-label="${esc(label)}">${material.tile(x,y,w,h,{prefix,accent:warm?gold:blue,warm})}<rect x="${x+1}" y="${y+1}" width="${w-2}" height="${h-2}" rx="3" fill="transparent" stroke="transparent" data-node-focus="true"/>${content}${text(x+w-31,y+32,'↗',22,warm?gold:blue)}</g>`;
  }
  function diagram(id){
    const c=D.constraints.find(row=>row.id===id);if(!c)return '';
    const prefix='org-'+id,paragraphs=c.paragraphIds,centers=paragraphs.map((_,i)=>161+i*104);
    const dims=c.dimensionIds.map(key=>D.dimensions.find(d=>d.id===key));
    const story=S.stories[{authority:'items',procedure:'process',responsibility:'data',platform:'regulation'}[id]];
    const lastDescription=275+(lines(c.description,20).length-1)*30;
    const body=material.defs(prefix)+`<rect width="1200" height="620" fill="#0c172a"/><path d="M24 20H1176V598H24Z" fill="none" stroke="#91abc4" stroke-opacity=".22"/>`+
      text(38,58,'关联主线',21,blue,600)+text(386,58,'组织问题',21,gold,600)+text(882,58,'稿内定位',21,gold,600)+
      `<path d="M318 234H338V326H360M318 396H338V326M820 326H842M842 ${centers[0]}V${centers.at(-1)}${centers.map(y=>`M842 ${y}H864`).join('')}" fill="none" stroke="#b3c4d7" stroke-opacity=".42" stroke-width="1.4" stroke-dasharray="5 6" data-organization-links="association"/>`+
      dims.map((d,i)=>{const y=180+i*162;return node(38,y,280,108,'dimension:'+d.id,'查看'+d.name+'专题',text(58,y+35,d.name,24,blue,600)+multiline(58,y+67,d.subtitle,12,18,muted,25),prefix);}).join('')+
      material.tile(360,148,460,352,{prefix,warm:true,accent:gold})+
      text(386,191,c.label,28,gold,600)+text(386,223,'案例稿机制解释',18,muted)+
      `<path d="M386 240H793" stroke="#e8cea0" stroke-opacity=".2"/>`+
      multiline(386,275,c.description,20,20,ink,30)+
      `<path d="M386 ${lastDescription+24}H793" stroke="#a4e3f4" stroke-opacity=".18"/>`+
      text(386,lastDescription+53,'稿内观察 / '+story.quoteParagraph,18,blue)+
      multiline(386,lastDescription+88,'“'+story.quote+'”',22,18,blue,26)+
      paragraphs.map((p,i)=>{const y=116+i*104,m=S.excerptMeta[p],label={direct:'稿内访谈',analysis:'作者解释',paraphrase:'研究概括',excerpt:'删节摘录'}[m.type]||m.label,chars=Array.from(S.excerpts[p]),preview=chars.slice(0,25).join('')+(chars.length>25?'…':'');return node(864,y,306,90,'article:'+p,'阅读'+p+' · '+m.label+' · '+m.object,text(882,y+29,p,21,gold,600)+text(961,y+29,label,18,muted)+multiline(882,y+58,preview,13,18,ink,24),prefix,true);}).join('')+
      text(38,581,'主线与段落共同解释组织问题',20,blue)+text(386,581,'连线表示关联阅读；段落位置按稿件编号。',18,muted);
    return `<svg class="gs-svg oc-svg" data-organization-diagram="${esc(id)}" viewBox="0 0 1200 620" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="${prefix}-title ${prefix}-desc"><title id="${prefix}-title">${esc(c.label)}：关联主线、组织问题与稿内定位</title><desc id="${prefix}-desc">${esc(c.description)}。关联${dims.map(d=>d.name).join('、')}；稿内依据${paragraphs.join('、')}。节点可展开；连接只表示阅读关联。</desc>${body}</svg>`;
  }
  function render(c){
    if(typeof c==='string')c=D.constraints.find(row=>row.id===c);if(!c)return '';
    const title={authority:'受理合在一窗，审批职责怎样接续？',procedure:'场景可以联办，程序条件怎样接续？',responsibility:'材料可以调用，核验与责任怎样接续？',platform:'已有系统投入，市区平台怎样衔接？'}[c.id];
    const buttons=c.sourceIds.map(id=>{const s=D.sources.find(row=>row.id===id);return `<button class="gs-reference" data-action="source:${esc(id)}"><span class="gs-reference-id">${esc(id)} / 公开背景</span><strong>${esc(s.title)}</strong><small>${esc(s.publisher)} · ${esc(s.publishedDate||'日期未载明')}</small></button>`;}).join('');
    return `<section class="dv-panel gs-board oc-board" data-constraint-board="${esc(c.id)}" data-gs-scale="1"><header class="oc-heading"><span>组织接续 / ${esc(c.label)}</span><h3>${esc(title)}</h3><p>从关联主线进入组织问题，再回到稿内段落核对解释。</p></header><div class="gs-toolbar"><span>主线—问题—依据<small>关系结构 / 可展开节点</small></span><div class="gs-zoom-controls" aria-label="组织关系图缩放">${[1,1.25,1.5].map(scale=>`<button data-gs-control="zoom" data-gs-scale="${scale}" aria-pressed="${scale===1}">${scale*100}%</button>`).join('')}</div></div><figure class="gs-figure"><div class="gs-scroll" tabindex="0" aria-label="组织关系图；小屏可横向滚动">${diagram(c.id)}</div><figcaption><span class="gs-legend-dashed">关联阅读</span><span>蓝色 / 关联主线</span><span>金色 / 组织解释与稿内依据</span></figcaption></figure><section class="gs-sources" aria-label="组织问题的公开背景"><h4>公开背景 / 与稿内依据分别核对</h4><div class="gs-references">${buttons}</div></section></section>`;
  }
  const originalInspection=V.exhibitInspection;
  V.exhibitInspection=function(id){
    const markup=originalInspection(id);if(id!=='C014'||!markup)return markup;
    const drawing=V.mechanismSvg('regulation').replace('<svg ','<svg class="gs-svg" data-inspection-organization="C014" ');
    const board=`<section class="gs-board oc-inspection-board" data-gs-scale="1" aria-label="统筹规模对应的组织结构"><div class="gs-toolbar"><span>部门计划怎样汇合<small>公开机制 / V07</small></span><div class="gs-zoom-controls" aria-label="计划统筹图缩放">${[1,1.25,1.5].map(scale=>`<button data-gs-control="zoom" data-gs-scale="${scale}" aria-pressed="${scale===1}">${scale*100}%</button>`).join('')}</div></div><figure class="gs-figure"><div class="gs-scroll" tabindex="0" aria-label="计划统筹结构图；可横向滚动">${drawing}</div><figcaption>接续关系 / 部门计划、统筹安排、联合落实与结果接续；接口适配保留后续安排。</figcaption></figure></section>`;
    return markup.replace('<div class="de-scene">',board+'<div class="de-scene">');
  };
  V.constraint=render;
  window.GovOrganizationDetails=Object.freeze({diagram,render});
})();
