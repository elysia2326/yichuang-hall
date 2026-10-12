'use strict';
/* One drawing source for the live screen and editable SVG exports. All coordinates
 * are in the 1920 × 1080 design space; topic views occupy y=90…1008; no chart or text is stretched. */
(() => {
  const D = window.GOV_V7, C = window.GovCharts;
  const P = {white:'#e4f7ff', cyan:'#45e7ff', blue:'#398cff', gold:'#ffdc88', muted:'#92bad1', green:'#68f4bd', line:'#225b7b'};
  const names = {overview:'改革总览',items:'事项集成',process:'流程协同',data:'数据流通',regulation:'监管统筹',evidence:'结论与证据'};
  const esc = C.esc, fmt = C.fmt;
  const layout=Object.freeze({width:1920,height:1080,header:90,body:918,footer:72});
  let hits = [];
  // V98: small Chinese captions start at 16; explanatory labels at 18.
  // This scale is shared by the live drawing and editable static export.
  const typeScale = Object.freeze({11:16,12:16,13:16,14:18,15:18,16:18,17:18,18:20,19:20,20:22,21:22,22:24,23:24});
  const text = (x,y,s,size=16,color=P.white,weight=400,anchor='start',extra='') => `<text x="${x}" y="${y}" fill="${color}" font-size="${typeScale[size]||size}" font-weight="${weight}" text-anchor="${anchor}" ${/^[\d,.%–—+\- ]+$/.test(String(s)) && /\d/.test(String(s)) && size>=24?'font-family="V8Digits" style="font-family:V8Digits"':''} ${extra}>${esc(s)}</text>`;
  const lines = (x,y,ss,size=15,color=P.muted,step=26) => ss.map((s,i)=>text(x,y+i*step,s,size,color)).join('');
  const line = (x1,y1,x2,y2,color=P.line,extra='') => `<path d="M${x1} ${y1}L${x2} ${y2}" fill="none" stroke="${color}" ${extra}/>`;
  const chart = (x,y,w,h,s) => s.replace('<svg ',`<svg x="${x}" y="${y}" width="${w}" height="${h}" overflow="visible" `).replace(/class="tick"/g,'class="tick" font-size="11" fill="#84b4ce"');
  const hit = (x,y,w,h,label,action) => { hits.push({x,y,w,h,label,action}); };
  function arrow(x1,y1,x2,y2,color=P.cyan,dashed=false) {
    return line(x1,y1,x2,y2,color,`stroke-opacity=".7" stroke-width="1.5" marker-end="url(#v7arrow)" ${dashed?'stroke-dasharray="4 7"':''}`);
  }
  const kpi = id => D.kpis.find(k=>k.id===id);
  const claim = id => D.claims.find(c=>c.id===id);
  const caseById = id => D.cases.find(c=>c.id===id);
  function mainPair(x,y,w,before,after,unit,label,id,minimum=false){
    const left=x+94,plot=w-120,max=integerScale(Math.max(before,after,1)),description=label+'：改革前'+before+unit+'，改革后'+(minimum?'最少':'')+after+unit+'；共用零起点刻度。';
    let s=`<g data-main-pair="${esc(id)}" role="img" aria-label="${esc(description)}"><title>${esc(description)}</title>`;
    [0,.5,1].forEach(r=>s+=line(left+plot*r,y+2,left+plot*r,y+52,'#abc8dd','stroke-opacity="'+(r===0?'.32':'.14')+'"'));
    [[before,'改革前',y+6,'#8da7bd'],[after,'改革后',y+35,'#93ceda']].forEach(([value,period,top,color])=>{
      s+=text(x+24,top+14,period,16,period==='改革前'?V.muted:V.cyan)+`<rect x="${left}" y="${top}" width="${plot}" height="16" rx="2" fill="#31465a"/><rect data-value="${value}" data-period="${period==='改革前'?'before':'after'}" x="${left}" y="${top}" width="${plot*value/max}" height="16" rx="2" fill="${color}"/>`;
    });
    [0,.5,1].forEach(r=>s+=text(left+plot*r,y+71,fmt(max*r),12,V.muted,400,r===0?'start':r===1?'end':'middle'));
    return s+'</g>';
  }
  // Every cached topic SVG owns its paint IDs, including hidden overview definitions.
  function scopePaintIds(body,topic){
    const ids=[...body.matchAll(/<(?:linearGradient|radialGradient|marker|filter|pattern|clipPath|mask)\b[^>]*\sid="([^\"]+)"/g)].map(m=>m[1]);
    const prefix='hall-'+topic+'-';
    let scoped=body;
    for(const id of new Set(ids))scoped=scoped.split(' id="'+id+'"').join(' id="'+prefix+id+'"').split('url(#'+id+')').join('url(#'+prefix+id+')');
    return scoped;
  }
  // V11: dense exhibition composition; every statistic comes from GOV_V7.
  function overview(modelHref) {
    let s=text(34,29,'01 / 改革总览',14,V.cyan,700,'start','letter-spacing="3"')+text(34,76,'一件事办得成，一盘棋为何仍难接续？',39,V.ink,700)+text(35,105,'办理成效已经发生；入口合一之后，审批、责任与系统怎样接成一盘棋？',17,V.muted)+text(1884,43,'北京经开区 / 案例研究',17,V.gold,500,'end')+text(1884,75,'ONE WINDOW / MULTIPLE RESPONSIBILITIES',10,'#799db7',400,'end','letter-spacing="2"');
    s+=surface(30,130,420,346)+text(58,173,'成效 / 办事端少交、少跑、少等',22,V.ink,700)+text(58,204,'超市便利店 · 2023.04公开报道',15,V.muted);
    [['办理时限','C006'],['申请材料','C005'],['办事跑动','C007']].forEach(([label,id],i)=>{
      const c=claim(id),[before,after]=c.value,y=239+i*77,left=172,plot=248;
      s+=`<g data-overview-outcome="${id}" role="img" aria-label="${esc(label+'：'+before+'→'+(id==='C005'?'最少':'')+after+c.unit+'，超市便利店具体场景')}"><title>${esc(c.label)}</title>`+text(58,y,label,18,V.ink,500)+text(225,y,before,32,V.muted,700,'end')+text(250,y-2,'→',24,V.cyan)+(id==='C005'?text(280,y-2,'最少',15,V.gold):'')+text(id==='C005'?350:315,y,after,36,V.gold,700)+text(420,y,c.unit,15,V.muted,400,'end');
      [[before,'改革前',y+12,'#8098ac'],[after,'改革后',y+30,'#93ceda']].forEach(([value,period,top,color])=>{
        s+=text(58,top+11,period,14,V.muted)+`<rect x="${left}" y="${top}" width="${plot}" height="10" rx="2" fill="#31465a"/><rect data-period="${period==='改革前'?'before':'after'}" data-value="${value}" x="${left}" y="${top}" width="${plot*value/before}" height="10" rx="2" fill="${color}"/>`;
      });
      s+='</g>';hit(51,y-25,384,70,label+'公开对照','claim:'+id);
    });s+=text(58,453,'具体场景的前后对照 · 保留适用条件',14,V.muted);
    s+=surface(30,494,420,166,V.gold)+text(58,535,'边界 / 字段统一，系统仍分',21,V.ink,700)+lines(58,566,['“前端统一了所有的字段，','再分别推送给两个不同的系统。”'],19,'#e6d5b6',29)+text(58,627,'原系统、原权限继续分别审批。',16,V.ink,500)+text(420,638,'稿内 P104 ↗',12,V.cyan,500,'end');hit(50,550,386,104,'P104统一表单与分别审批的上下文','article:P104');
    s+=surface(30,682,420,180)+text(58,723,'月度受理 / 运行背景',19,V.ink,700)+text(420,723,'2026.01—08',12,V.muted,400,'end')+text(58,746,'受理量 / 万件',12,V.muted)+compactColumns(58,754,362,83,D.series.monthly2026,'accepted');
    s+=surface(474,130,992,538)+text(502,173,'组织空间 / 入口合一，后台怎样接续？',22,V.ink,700);
    s+=`<rect x="1250" y="147" width="190" height="36" rx="3" fill="#284c63" stroke="#a8cddd" stroke-opacity=".55"/>`+text(1345,171,'进入完整三维 ↗',16,V.ink,700,'middle');hit(1250,147,190,36,'进入完整三维场景，旋转放大与分区观察','model');
    s+=modelPlinth();
    const stage=window.GovOverviewStage,b=stage.imageBox;
    if(modelHref)s+=`<image id="hall-image" data-overview-panorama="chatgpt-v66" x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" href="${esc(modelHref)}" preserveAspectRatio="xMidYMid meet"><title>原创研究场景示意：一个统一前台与分属后台，可进入完整三维模型</title></image>`;
    const rp=stage.relationshipPoints;
    s+=`<g data-overview-front-span="continuous" aria-hidden="true"><path d="M${rp.counterLeft.x} ${rp.counterLeft.y-5}v5L${rp.counterRight.x} ${rp.counterRight.y}v-5" fill="none" stroke="${V.cyan}" stroke-width="1.7" stroke-opacity=".75"/></g>`;
    s+=`<g data-overview-back-separation="designed-workspaces" aria-hidden="true">`+[0,1,2,3].map(i=>{const p=rp['back'+i];return `<path d="M${p.x-9} ${p.y-6}v-5h18v5" fill="none" stroke="${V.gold}" stroke-width="1.4" stroke-opacity=".75"/>`;}).join('')+'</g>';
    const spatial=[
      {key:'front',x:502,y:204,w:306,h:56,title:'01 / 统一受理前台',copy:'一口收件，组织完整办事需求',color:V.cyan,action:'model:space-front'},
      {key:'back',x:1132,y:204,w:306,h:56,title:'03 / 分属部门后台',copy:'原系统、原权限分别审批',color:V.gold,action:'model:space-back'},
      {key:'verify',x:704,y:588,w:538,h:48,title:'进度、结果与解释谁来接？',copy:'02 / 协调交接 · 核验、信息与反馈接续',color:'#9dd0c7',action:'model:space-transfer'}
    ];
    for(const label of spatial){
      const p=label.key==='front'?stage.relationshipPoints.frontLeft:stage.points[label.key];
      const sx=label.key==='verify'?label.x+label.w/2:label.key==='front'?label.x+label.w-24:label.x+24;
      const sy=label.key==='verify'?label.y:label.y+label.h;
      const leader=label.key==='verify'?`M${sx} ${sy}H${p.x+115}V${p.y}H${p.x}`:`M${sx} ${sy}L${p.x} ${p.y}`;
      s+=`<g data-spatial-role="${label.key}" data-projection-x="${p.x}" data-projection-y="${p.y}"><path d="${leader}" fill="none" stroke="${label.color}" stroke-opacity="${label.key==='verify'?'.7':'.48'}" stroke-width="1.1" ${label.key==='verify'?'stroke-dasharray="3 6"':''}/><circle data-spatial-locator="${label.key}" cx="${p.x}" cy="${p.y}" r="${label.key==='verify'?7:3}" fill="${label.key==='verify'?'#0a1827':label.color}" stroke="${label.color}" stroke-width="${label.key==='verify'?2:0}"/><rect x="${label.x}" y="${label.y}" width="${label.w}" height="${label.h}" rx="3" fill="#0a1827" fill-opacity=".93" stroke="${label.color}" stroke-opacity=".32"/>${text(label.x+14,label.y+23,label.title,18,label.color,700)}${text(label.x+14,label.y+44,label.copy,13,V.muted)}</g>`;
      hit(label.x,label.y,label.w,label.h,label.title+'三维观察',label.action);
    }
    s+=`<g data-overview-handoff="true" role="img" aria-label="统一前台、分属后台与协调接续的研究关系；不表示某企业办理顺序"><title>前台入口的连续性与后台权限的分属关系分别呈现；下沿追问解释和结果怎样接续</title></g>`;
    s+=text(1438,645,'研究场景示意 / 工作区数量为设计 / 非测绘、非日志',12,V.muted,400,'end');
    const cards=[
      {id:'items',claimId:'C006',unit:'工作日 / 场景对照',question:['成效｜部门事项转场景','边界｜前台合，后台分']},
      {id:'process',claimId:'C008',unit:'工作日 / 场景对照',question:['成效｜前台集成一次办','边界｜前台并，后台串']},
      {id:'data',claimId:'C013',unit:'事项、证照 / 计划',question:['成效｜证照调用免材料','边界｜权属锁，安全悬']},
      {id:'regulation',claimId:'C014',unit:'统筹部门 / 个',question:['成效｜只查一次减干扰','边界｜条块分，跨层隔']}
    ];
    cards.forEach(({id,claimId,unit,question},i)=>{
      const x=474+i*253,c=claim(claimId);s+=`<g data-overview-case="${id}" data-claim-id="${claimId}">`+surface(x,682,233,180,V.gold,'observation')+businessFigure(x+176,694,{items:'submission',process:'survey',data:'submitted',regulation:'plan'}[id],32,V.gold)+text(x+20,716,names[id],18,V.ink,700);
      question.forEach((q,j)=>s+=text(x+20,747+j*27,q,18,j?V.gold:V.cyan,500));
      const evidence=id==='data'?c.value[0]+'项事项 / '+c.value[1]+'种证照':id==='regulation'?c.value[0]+'个统筹部门':c.value[0]+' → '+c.value[1]+'工作日';
      s+=line(x+20,792,x+213,792,'#9eabac','stroke-opacity=".2"')+text(x+20,816,evidence,15,V.cyan,500)+text(x+20,839,id==='data'?'公开试点计划':'公开场景记录',12,V.muted)+text(x+213,840,'↗',16,V.cyan,700,'end')+'</g>';
      hit(x,682,233,180,names[id]+'：成效与边界对读','tension:'+id);
    });
    s+=surface(1490,130,400,370)+text(1518,173,'边界 / 拆不开的四道墙',22,V.ink,700);
    s+=`<g data-overview-parallel-constraints="true" role="img" aria-label="原稿P099—P124四道墙：事项回弹、流程回弹、数据回弹、监管回弹，与四个专题一一对应，不表示先后或完成率"><path d="M1505 190h-7v239h7M1498 220h8M1498 286h8M1498 352h8M1498 418h8" fill="none" stroke="${V.gold}" stroke-opacity=".38" stroke-width="1.2"/></g>`;
    [['事项回弹','受理权可以集中，审批权则不能','items'],['流程回弹','法定程序未再造，联审靠个案协调','process'],['数据回弹','调用逐项谈签，出错谁负责无定论','data'],['监管回弹','系统林立、标准各异，市区未对接','regulation']].forEach(([label,copy,id],i)=>{const y=213+i*66;s+=`<g data-overview-constraint="${id}" role="group" aria-label="${esc(label+'：'+copy)}">`+mechanismTile(1506,y-27,368,61,V.gold,true)+businessRelation(1764,y-22,id,V.gold)+text(1518,y,'0'+(i+1),12,V.cyan,700)+text(1556,y,label,18,V.ink,700)+text(1518,y+29,copy,16,V.muted)+text(1862,y,'↗',17,V.gold,700,'end')+line(1518,y+43,1862,y+43,'#839caf','stroke-opacity=".2"')+'</g>';hit(1510,y-24,366,64,label+'与'+names[id],'tension:'+id);});s+=text(1518,478,'稿内 P101—P124 · 组织机制观察，不作量化评分',13,V.muted);
    s+=surface(1490,524,400,326,V.gold)+text(1518,568,'边界 / 前台减负，后台增负',21,V.ink,700)+lines(1518,610,['“不能说为了前台给办事人','办得最好，后台就更加辛苦。”'],19,'#e6d5b6',31)+text(1518,681,'稿内 P108—P109 · 流程回弹',13,V.muted)+line(1518,704,1862,704,'#839caf','stroke-opacity=".3"')+text(1518,744,'四道墙弹回的是同一事物',20,V.ink,700)+lines(1518,780,['技术能把前台一次次向前推进，','却不能替组织决定权与责。'],16,V.muted,27)+text(1862,828,'原文与解释 ↗',14,V.cyan,500,'end');hit(1510,583,366,114,'P109后台协调的原文与语境','article:P109');hit(1510,719,366,120,'P125四道墙的共同指向','article:P125');
    return s;
  }
  function render(id,options={}) {
    hits=[];if(!names[id])id='overview';
    const body=({overview:()=>overview(options.hall),items:()=>items(options),process:()=>process(options),data,regulation,evidence})[id]()+readingBand(id);
    return {body:scopePaintIds(defs()+body,id),hits:hits.map(h=>({...h})),title:names[id]};
  }
  const svgStyle = `.chart .grid{stroke:#205177;stroke-width:.6;stroke-dasharray:2 5}.chart .tick{fill:#84b4ce;font-size:11px}text{font-family:ReformSans,'Microsoft YaHei',sans-serif}.flow-stream{stroke-dasharray:9 14}`;
  function exportSvg(id,assets) {
    if(!names[id])throw new Error('Unknown topic: '+id);
    for(const key of (id==='items'?['hall','regular','bold','itemsSpatial']:id==='process'?['hall','regular','bold','servicePlatform']:['hall','regular','bold']))if(!assets[key]?.startsWith('data:'))throw new Error('Embedded artwork asset missing: '+key);
    const font=`@font-face{font-family:V8Digits;src:url('${assets.digits}') format('woff2');font-weight:600 900}@font-face{font-family:ReformSans;src:url('${assets.regular}') format('woff2');font-weight:400 500}@font-face{font-family:ReformSans;src:url('${assets.bold}') format('woff2');font-weight:600 900}`;
    return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1920" height="1080" viewBox="0 0 1920 1080" role="img" aria-labelledby="art-title art-desc"><title id="art-title">北京经开区智治数据大厅 · ${esc(names[id])}</title><desc id="art-desc">数据快照2026年10月1日；视觉版本2026年10月9日。来源、单位与期间随图展示；完整口径可在配套网页检索。图版与网页共用绘制函数。</desc><style>${font}${svgStyle}</style>${background(assets.stage,id)}${id!=='overview'?'<rect width="1920" height="1080" fill="#010913" opacity=".15"/>':''}${header()}<g transform="translate(0 ${layout.header})">${render(id,{hall:assets.hall,itemsSpatial:assets.itemsSpatial,servicePlatform:assets.servicePlatform}).body}</g>${footer(id)}</svg>`;
  }

  function background(stage,topic='overview'){return window.GovExhibitMaterial.background(topic);}
  function header(){return `<defs><linearGradient id="v8head" x2="0" y2="1"><stop stop-color="#456182"/><stop offset=".07" stop-color="#293f60"/><stop offset=".65" stop-color="#14253f"/><stop offset="1" stop-color="#102038"/></linearGradient></defs><path d="M0 0H1920V66H1430L1360 80H1030L960 89L890 80H560L490 66H0Z" fill="#010a17"/><path d="M0 0H1920V64H1425L1355 77H1030L960 85L890 77H565L495 64H0Z" fill="url(#v8head)"/><path d="M0 64H495L565 77H890L960 85L1030 77H1355L1425 64H1920" fill="none" stroke="#93c8e5" stroke-opacity=".5"/>${text(960,39,'一窗之后　·　改革智治大厅',30,'#edf5ff',700,'middle','letter-spacing="2"')}${text(960,65,'局部突围　·　组织边界　·　前后台张力',14,'#a0c9e0',400,'middle','letter-spacing="4"')}${text(38,31,'整体智治 · 集成场景改革',20,'#bdd6e8',500)}${text(38,54,'INTEGRATED GOVERNANCE DATA HALL',9,'#799db7',400,'start','letter-spacing="2"')}${text(1880,30,'视觉版本　2026.10.09',15,'#bdcedc',400,'end')}${text(1880,58,'公开资料　/　四维主线',12,'#709ab9',400,'end')}`;}
  function footer(id){let s=`<rect x="0" y="1008" width="1920" height="72" fill="#030d17"/><path d="M0 1009H1920" stroke="#5985a7" stroke-opacity=".4"/>`+text(40,1041,'场景集成 · 组织协同',14,'#96b3c9')+text(40,1060,'CASE EXPLORATION',8,'#65859e',400,'start','letter-spacing="3"');Object.entries(names).forEach(([key,label],i)=>{const x=400+i*188;s+=`<path d="M${x+8} 1022H${x+180}V1055L${x+172} 1063H${x}V1030Z" fill="${key===id?'#315879':'#12253f'}" stroke="${key===id?'#b5d9f2':'#547395'}"/>`+text(x+90,1049,label,18,key===id?'#edf6fc':'#9cb6cc',500,'middle');});return s+text(1880,1046,'01—06 / 案例专题',12,'#8aabc1',400,'end');}
  function zones(id){
    const z={items:['事项之越：部门事项转场景，一次提交联审批','事项回弹：前台合，后台分，职权难打破'],process:['流程之越：前台集成一次办，后台并联协同转','流程回弹：前台并，后台串，程序难再造'],data:['数据之越：证照调用免材料，数据流通提效率','数据回弹：权属锁，安全悬，决策难跨越'],regulation:['监管之越：只查一次减干扰，协同监管向纵深','监管回弹：条块分，跨层隔，协同难贯通']}[id];
    return `<g data-result-boundary-zones="${id}" aria-hidden="true"><rect x="20" y="116" width="1378" height="746" rx="6" fill="${V.cyan}" fill-opacity=".018" stroke="${V.cyan}" stroke-opacity=".2" stroke-dasharray="2 6"/><rect x="1404" y="116" width="496" height="746" rx="6" fill="#d3b47c" fill-opacity=".045" stroke="${V.gold}" stroke-opacity=".34"/></g>`+text(35,105,'成效｜'+z[0],17,V.cyan,500,'start','data-zone-label="result"')+text(1414,105,'边界｜'+z[1],17,V.gold,500,'start','data-zone-label="boundary"');
  }
  function readingBand(id){
    const notes={overview:['成效：具体场景少交、少跑、少等；边界：事项、流程、数据、监管四道墙仍在后台。','boundary'],items:['成效：6证合1，材料94→31份、时限29→5工作日；边界：受理权集中，审批权仍分属各部门。','tension:items'],process:['成效：道路开口“四个一”，30→15工作日；边界：法定程序未再造，联审多靠个案协调与人工兜底。','tension:process'],data:['成效：四类材料免交，调取—核验—承诺分层办理；边界：专网隔离、逐项协商，调用责任无定论。','tension:data'],regulation:['成效：28个部门计划统筹，检查量较统筹前降54.2%；边界：条块系统各异，市区平台未完整对接。','tension:regulation'],evidence:['结论：四道墙弹回的是同一条边界——技术推进前台，组织决定谁有权、谁担责；证据：来源与原稿段落均可回溯。','boundary']};
    const labels={overview:'核心问题与解释',items:'事项成效与边界',process:'流程成效与边界',data:'数据成效与边界',regulation:'监管成效与边界',evidence:'核心问题与解释'};
    const [copy,action]=notes[id],label=labels[id];hit(1688,882,184,34,label,action);
    hit(1460,882,180,34,names[id]+'补充结构图','graph:'+id);
    return `<g data-reading-band="${id}"><path d="M30 884H1890" stroke="#a8c1d6" stroke-opacity=".14"/><rect x="1460" y="886" width="180" height="28" rx="3" fill="#234155" stroke="${V.cyan}" stroke-opacity=".3"/><rect x="1688" y="886" width="184" height="28" rx="3" fill="#173149" fill-opacity=".55"/><path d="M46 889V909" stroke="${V.cyan}" stroke-opacity=".6"/>${text(60,905,'本页要点',14,V.cyan,700)}${text(172,905,copy,16,V.ink)}${text(1550,905,'补充结构图 ↗',15,V.cyan,700,'middle')}${text(1860,905,label+' ↗',15,V.cyan,500,'end')}</g>`;
  }


  /* V13: one visual system across all six exhibition views. Chart geometry is
     derived from the verified ledger; relationship diagrams carry no scores. */
  const V = {ink:'#edf5ff',muted:'#bccbe1',cyan:'#adebfa',gold:'#e8cea0',blue:'#bfd5f2',green:'#9cd8d0'};
  const integerScale=value=>[1,2,4,5,8,10,12,15,20,25,30,40,50,60,80,100,120,150,200,250,500,1000].find(n=>n>=value)||Math.ceil(value/1000)*1000;
  function displayNumber(x,y,value,size,color=V.gold){
    const str=String(value);
    return str.startsWith('−')?`<g data-display-number="${esc(str)}">${text(x,y,'−',size*.9,color,700)}${text(x+size*.7,y,str.slice(1),size,color,700)}</g>`:text(x,y,str,size,color,700);
  }
  function surface(x,y,w,h,accent='#8db4cf',role='auto'){
    if(role==='auto')role=[V.gold,'#cbb58d','#cbb58c'].includes(accent)?'observation':h<=260?'metric':w>=850?'main':'support';
    return window.GovExhibitMaterial.surface(x,y,w,h,accent,role);
  }
  function lineIcon(x,y,type,color=V.cyan,size=24){
    const shapes={chart:'M4 3V22H22M8 18V13H11V18M14 18V8H17V18M20 18V5H23V18',document:'M6 3H15L20 8V22H6ZM15 3V8H20M9 12H17M9 16H17M9 19H14',link:'M10 9L13 6C16 3 22 7 19 11L16 14M14 15L11 18C8 21 2 17 5 13L8 10M9 15L15 9',check:'M5 5H19V21H5ZM8 12L11 15L17 9',cloud:'M6 18C0 16 3 9 8 10C9 3 20 4 20 11C25 12 24 18 19 18ZM12 11V21M9 18L12 21L15 18',shield:'M12 3L21 7V13C21 18 16 21 12 23C8 21 3 18 3 13V7ZM8 13L11 16L17 10',window:'M3 4H21V21H3ZM3 9H21M8 4V9M13 4V9M7 13H11M7 17H17'};
    return `<g transform="translate(${x} ${y})" aria-hidden="true"><svg width="${size}" height="${size}" viewBox="0 0 24 26" overflow="visible"><path d="${shapes[type]||shapes.document}" fill="none" stroke="${color}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg></g>`;
  }
  const businessFigure=(...args)=>window.GovMainFigures?.figure(...args)||'';
  const businessRelation=(...args)=>window.GovMainFigures?.relation(...args)||'';
  function modelPlinth(){
    return `<g data-model-plinth="layered-observation" data-stage-revision="chatgpt-v66" aria-hidden="true"><ellipse cx="970" cy="480" rx="437" ry="132" fill="url(#v53modelLight)"/><ellipse cx="970" cy="575" rx="414" ry="45" fill="#030c16" fill-opacity=".55"/><ellipse cx="970" cy="563" rx="428" ry="58" fill="url(#v53plinth)" stroke="#759eb5" stroke-opacity=".2"/><ellipse cx="970" cy="552" rx="428" ry="58" fill="url(#v53plinth)" stroke="#99d4e9" stroke-opacity=".34"/><ellipse cx="970" cy="552" rx="405" ry="53" fill="none" stroke="#b9e2f0" stroke-opacity=".1"/><path d="M558 568A428 58 0 0 0 1382 568" fill="none" stroke="#83d9ef" stroke-width="1.5" stroke-opacity=".38"/></g>`;
  }
  function mechanismTile(x,y,w,h,color=V.cyan,quiet=false){
    return `<g data-mechanism-tile="true">${window.GovDiagramMaterial.tile(x,y,w,h,{prefix:'hall-v65',accent:color,warm:color===V.gold,quiet})}</g>`;
  }
  function tensionLine(x,y,w,label,id){
    hit(x,y-15,w,30,label,`tension:${id}`);
    return `<path d="M${x} ${y}H${x+w}" stroke="#d8b980" stroke-opacity=".65" stroke-dasharray="4 5"/><rect x="${x+w/2-300}" y="${y-14}" width="600" height="28" rx="6" fill="#253044" stroke="#d8b980" stroke-opacity=".3"/>${text(x+w/2,y+6,label,16,'#eddbb7',500,'middle')}`;
  }
  function glass(x,y,w,h,title,tag='',action){
    if(action)hit(x,y,w,h,title,action);
    if(w<900)return `<g transform="translate(${x} ${y})"><rect width="${w}" height="${h}" rx="8" fill="url(#v13glass)" stroke="#8399b8" stroke-opacity=".25"/><path d="M20 1H${w-20}" stroke="#b8d4ef" stroke-opacity=".35"/><path d="M20 58H${w-20}" stroke="#6b83a7" stroke-opacity=".28"/><rect x="20" y="24" width="3" height="17" rx="1" fill="${V.cyan}"/>${text(35,39,title,21,V.ink,700)}${tag?text(w-22,37,tag,13,V.muted,500,'end'):''}</g>`;
    return `<g transform="translate(${x} ${y})"><rect x="0" y="5" width="${w}" height="${h}" rx="13" fill="#050a1d" opacity=".7"/><rect width="${w}" height="${h}" rx="13" fill="url(#v13tray)" stroke="url(#v13rim)"/><rect x="5" y="5" width="${w-10}" height="${h-10}" rx="10" fill="url(#v13glass)" stroke="#8ea9d2" stroke-opacity=".1"/><path d="M14 42V24Q14 13 25 13H${Math.min(w-90,280)}L${Math.min(w-74,296)} 30H${w-18}V51H25Q14 51 14 42" fill="url(#v13tab)"/><path d="M18 51H${w-18}" stroke="url(#v13rim)" stroke-opacity=".55"/><path d="M18 14H${w-20}" stroke="#d5e6ff" stroke-opacity=".2"/><path d="M18 ${h-9}H${w-18}" stroke="#030817"/><circle cx="27" cy="32" r="3" fill="${V.cyan}"/>${text(39,39,title,23,V.ink,700)}${tag?text(w-22,37,tag,13,V.muted,500,'end'):''}</g>`;
  }
  function vhead(id,sub,value,unit){
    return text(31,36,`0${Object.keys(names).indexOf(id)+1}`,16,V.cyan,700)+text(87,43,names[id],32,V.ink,700)+text(87,75,sub,18,V.muted)+text(1838,46,value,38,V.gold,700,'end')+text(1853,43,unit,17,V.muted)+line(31,96,1889,96,'#3b4d74');
  }
  function vfoot(id,label='展开研究解释',action=`dimension:${id}`){
    const q=D.dimensions.find(d=>d.id===id)?.question||'每个数值回到原始出处；每个结论匹配证据层次。';
    hit(30,804,1860,59,label,action);
    return `<rect x="30" y="804" width="1860" height="59" rx="8" fill="#12213c" stroke="#526789" stroke-opacity=".5"/>${text(53,841,'研究追问',16,V.cyan,700)}${text(154,841,q,20,V.ink,500)}${text(1867,841,label+' ↗',17,V.cyan,500,'end')}`;
  }
  function vspec(x,y,w,label,value,unit,sub,action,color=V.gold){
    if(action)hit(x,y,w,107,label,action);
    return text(x,y+19,label,18,V.muted)+text(x,y+70,typeof value==='number'?fmt(value):value,43,color,700)+text(x+w-4,y+68,unit,17,V.muted,400,'end')+text(x,y+101,sub,14,V.muted)+line(x,y+111,x+w,y+111,'#344361');
  }
  function vcompare(x,y,w,m,action){
    if(action)hit(x,y,w,129,`查看${m.label}`,action);
    const max=Math.max(m.before||0,m.after||0,1),barWidth=w-130;
    return text(x,y+19,m.label,21,V.ink,700)+text(x+w,y+18,m.unit,16,V.muted,400,'end')+
      text(x,y+52,'改革前',15,V.muted)+`<rect x="${x+65}" y="${y+39}" width="${barWidth}" height="12" rx="3" fill="#273652"/><rect x="${x+65}" y="${y+39}" width="${barWidth*m.before/max}" height="12" rx="3" fill="#697b9f"/>`+text(x+w,y+55,m.before,22,V.muted,700,'end')+
      text(x,y+89,'改革后',15,V.cyan)+`<rect x="${x+65}" y="${y+76}" width="${barWidth}" height="12" rx="3" fill="#273652"/><rect x="${x+65}" y="${y+76}" width="${barWidth*m.after/max}" height="12" rx="3" fill="#93ceda"/>`+text(x+w,y+91,m.after,27,V.gold,700,'end')+text(x,y+117,m.note||'同一场景、同一计量单位',14,V.muted)+line(x,y+132,x+w,y+132,'#304260');
  }
  function vnode(x,y,w,h,title,subtitle,color=V.cyan){
    return `<g><rect x="${x}" y="${y+4}" width="${w}" height="${h}" rx="10" fill="#050b1c"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="url(#v13glass)" stroke="${color}" stroke-opacity=".38"/><path d="M${x+13} ${y+2}H${x+w-13}" stroke="#d7e8ff" stroke-opacity=".18"/>${text(x+w/2,y+h/2-2,title,23,V.ink,700,'middle')}${text(x+w/2,y+h/2+27,subtitle,16,V.muted,400,'middle')}</g>`;
  }
  function vbars(x,y,w,values,action){
    const max=Math.max(...values.map(d=>d.value));
    return values.map((d,i)=>{const yy=y+i*63; if(action)hit(x,yy-19,w,56,d.name,action); return text(x,yy,d.name,18,V.muted)+text(x+w,yy,d.value,24,V.ink,700,'end')+`<rect x="${x}" y="${yy+14}" width="${w}" height="10" rx="3" fill="#23314d"/><rect x="${x}" y="${yy+14}" width="${w*d.value/max}" height="10" rx="3" fill="${[V.cyan,V.blue,V.gold,V.green][i%4]}"/>`;}).join('');
  }
  function compactColumns(x,y,w,h,rows,key){
    const values=rows.map(r=>r[key]),max=Math.max(...values.filter(Number.isFinite),1),step=w/rows.length;
    let s=line(x,y+h-16,x+w,y+h-16,'#597591','stroke-opacity=".5"');
    rows.forEach((r,i)=>{if(!Number.isFinite(r[key]))return;const bh=r[key]/max*(h-34),xx=x+i*step+step*.2,yy=y+h-16-bh;s+=`<rect x="${xx}" y="${yy}" width="${step*.6}" height="${bh}" rx="2" fill="#93ceda"><title>${esc(r.month)}：${r[key]}件</title></rect>`+text(xx+step*.3,yy-5,(r[key]/10000).toFixed(2),11,V.muted,400,'middle')+text(xx+step*.3,y+h,String(r.month).slice(-2)+'月',11,V.muted,400,'middle');hit(x+i*step,y-18,step,h+24,`${r.month}受理${r[key]}件`,'source:'+r.sourceId);});return s;
  }
  function vstep(x,y,w,n,title,sub,color=V.cyan){return `<rect x="${x}" y="${y}" width="${w}" height="84" rx="8" fill="#182747" stroke="#607aa6" stroke-opacity=".35"/><circle cx="${x+32}" cy="${y+29}" r="15" fill="${color}" fill-opacity=".12"/>${text(x+32,y+35,n,17,color,700,'middle')}${text(x+61,y+34,title,21,V.ink,700)}${text(x+20,y+64,sub,16,V.muted)}`;}
  function items(options={}){
    const c=caseById('supermarket'),scene=kpi('integratedScenes'),local=kpi('localServices'),hf=D.series.highFrequency;
    const panel=surface;
    let s=`<defs><linearGradient id="v21document" x2="0" y2="1"><stop stop-color="#284861"/><stop offset="1" stop-color="#172c41"/></linearGradient><radialGradient id="v21light"><stop stop-color="#689bc1" stop-opacity=".16"/><stop offset="1" stop-color="#689bc1" stop-opacity="0"/></radialGradient><marker id="v64answerArrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0L7 3.5L0 7Z" fill="${V.gold}"/></marker></defs>`;
    s+=text(34,29,'02 / 事项集成',14,V.cyan,700,'start','letter-spacing="3"')+text(34,76,'部门事项合成一件事，审批职权为何仍难打破？',39,V.ink,700)+zones('items')+text(1884,43,'事项之越 × 事项回弹',17,V.gold,500,'end')+text(1884,75,'ITEMS · BREAKTHROUGH / REBOUND',10,'#799db7',400,'end','letter-spacing="2"');
    s+=panel(30,130,1358,460)+window.GovSpatialCase.scene({image:options.itemsSpatial,text,colors:V});
    window.GovSpatialCase.mainHits.forEach(h=>hit(h.x,h.y,h.w,h.h,h.label,h.action));
    s+=text(60,611,'成效 / 超市便利店证照联办',17,V.cyan,700)+text(1386,611,'2023.04报道 · 条件适用场景',14,V.muted,400,'end');
    c.metrics.forEach((m,i)=>{const x=30+i*460,w=438,y=630;s+=panel(x,y,w,220);s+=text(x+24,y+36,m.label,22,V.ink,700)+text(x+w-24,y+34,m.unit,16,V.muted,400,'end');s+=text(x+24,y+95,m.before,48,'#94a9bf',700)+text(x+111,y+91,'→',27,V.cyan,400)+(m.note.includes('最少')?text(x+163,y+89,'最少',15,V.gold):'')+text(x+(m.note.includes('最少')?210:163),y+95,m.after,48,V.gold,700);s+=mainPair(x,y+106,w,m.before,m.after,m.unit,m.label,['C005','C006','C007'][i],m.note.includes('最少'))+text(x+24,y+195,'公开出处 V04  /  点击看图与解释',14,V.muted)+text(x+w-24,y+195,'↗',18,V.cyan,700,'end');hit(x,y,w,220,m.label+' '+m.before+'→'+m.after+m.unit,['claim:C005','claim:C006','claim:C007'][i]);});
    s+=panel(1414,130,476,720,'#cbb58c')+text(1442,173,'边界 / 前台合，后台分',22,V.ink,700)+text(1862,173,'职权难打破',14,V.gold,500,'end')+text(1442,205,'稿内 P077 · P103 · P104',14,V.muted)+line(1442,229,1862,229,'#a39073','stroke-opacity=".35"');
    s+=lines(1442,272,['“前端统一了所有的字段，','再分别推送给两个不同的系统。”'],21,'#e6d5b6',33)+text(1442,336,'稿内 P104 · 匿名访谈',13,V.muted)+text(1862,336,'原文 ↗',14,V.cyan,500,'end');hit(1436,244,440,104,'P104统一字段与分别审批的原文','article:P104');
    s+=line(1442,360,1862,360,'#a39073','stroke-opacity=".28"')+text(1442,400,'受理权可以集中，审批权则不能',24,V.ink,700);
    ['审批权限','审批节奏','审批责任'].forEach((label,i)=>{const y=422+i*54;s+=`<g data-items-boundary-retained="${i}" role="group" aria-label="${esc(label+'保留于原部门；稿内 P103')}">`+mechanismTile(1442,y,420,42,V.gold,true)+`<rect x="1442" y="${y+10}" width="2" height="22" fill="${V.gold}" fill-opacity=".6"/>`+text(1462,y+28,label,19,V.ink,700)+text(1846,y+28,'均保留于原部门',15,V.gold,500,'end')+'</g>';});
    hit(1436,372,440,210,'受理集中、审批权分属：核对稿内 P103','article:P103');
    s+=line(1442,600,1862,600,'#a39073','stroke-opacity=".28"')+text(1442,640,'部门之间进度如何对齐？',22,V.ink,700)+text(1442,674,'某一部门受阻，整体如何推进？',22,V.ink,700)+text(1442,706,'简单的前端集成无法解决此类问题 · P103',15,V.muted);hit(1436,612,440,104,'部门进度对齐问题：核对稿内 P103','article:P103');
    s+=line(1442,728,1862,728,'#a39073','stroke-opacity=".28"')+text(1442,764,'材料虽统一受理，审批权限并未同步归集。',17,V.ink,500)+text(1442,792,'企业获得便利，治理考验体现在后续环节。',15,V.muted)+text(1862,832,'稿内 P077 ↗',14,V.cyan,500,'end');hit(1436,738,440,104,'P077统一受理与审批权限的原文','article:P077');
    s+=text(42,873,'部分审批已集中；跨部门事项仍按职责衔接。',13,V.muted)+text(1880,873,'公开记录与稿内机制观察分别呈现',13,V.muted,400,'end');
    return s;
  }

  function process(options={}){
    const c=caseById('road'),story=window.GovCaseStory.stories.process;
    const panel=surface;
    let s=`<defs><linearGradient id="v22node" x2="0" y2="1"><stop stop-color="#28455c"/><stop offset="1" stop-color="#183147"/></linearGradient><radialGradient id="v22light"><stop stop-color="#679abb" stop-opacity=".14"/><stop offset="1" stop-color="#679abb" stop-opacity="0"/></radialGradient></defs>`;
    s+=text(34,29,'03 / 流程协同',14,V.cyan,700,'start','letter-spacing="3"')+text(34,76,'前台一次办成，后台程序为何仍难再造？',39,V.ink,700)+zones('process')+text(1884,43,'流程之越 × 流程回弹',17,V.gold,500,'end')+text(1884,75,'PROCESS · BREAKTHROUGH / REBOUND',10,'#799db7',400,'end','letter-spacing="2"');
    s+=panel(30,130,1358,282)+`<ellipse cx="700" cy="290" rx="602" ry="130" fill="url(#v22light)"/>`+text(60,171,'成效 / 公开的“四个一”联办机制',22,V.ink,700)+text(1313,171,'2025.05.09 · V01',14,V.muted,400,'end')+line(60,190,1313,190,'#829fb5','stroke-opacity=".28"');
    const names=caseById('road').stages,copies=['服务专窗统一接件','统一标准、联合踏勘','跨部门核定征收','全流程帮办指导'];
    // Actual orthographic x projection: camera scale 15.35, x=±5.4/±1.8.
    // xMidYMid meet fits 2800x320 to the 1201x117 image box, so labels follow
    // the actual image width (1023.75), not its surrounding SVG viewport.
    const serviceBox={x:82,y:259,w:1201,h:117},projectedW=serviceBox.h*2800/320;
    const centers=window.GovProcessObjects.anchors.map(u=>serviceBox.x+(serviceBox.w-projectedW)/2+projectedW*u);
    s+=text(83,215,'企业端 / 只对接一个道路开口专窗',18,V.cyan,500)+text(1298,215,'四项公开联办安排并列呈现',13,V.muted,400,'end');
    s+=`<g data-public-mechanism-group="four-in-one" aria-hidden="true"><path d="M${centers[0]} 222H${centers[3]}" fill="none" stroke="${V.cyan}" stroke-opacity=".25"/>`+centers.map(x=>`<path d="M${x} 222v5" stroke="${V.cyan}" stroke-opacity=".36"/>`).join('')+'</g>';
    s+=`<g data-process-unified-front="four-parallel-arrangements" role="img" aria-label="原创联办场景示意：收件柜台、联合踏勘台、缴费核定台与办结指导台共用连续服务底座；四个安排并列，不表示实际企业先后日志、实际建筑或与下层观察的逐项对应"><title>联办机制的原创场景示意，不是实际大厅或逐笔日志</title><image data-service-render="blender-v84" x="${serviceBox.x}" y="${serviceBox.y}" width="${serviceBox.w}" height="${serviceBox.h}" href="${esc(options.servicePlatform||'assets/chatgpt-v84/public_arrangements_v84.png')}" preserveAspectRatio="xMidYMid meet" aria-hidden="true"/></g>`;
    names.forEach((name,i)=>{const center=centers[i],x=center-113,y=228;s+=`<g data-service-arrangement="${i}" data-service-anchor-x="${center}" role="group" aria-label="${esc(name+'：'+copies[i]+'；公开联办安排；场景为机制示意')}">`+mechanismTile(x,y,226,40)+`<circle cx="${center-78}" cy="${y+20}" r="14" fill="#90d4ec19"/>`+text(center-78,y+26,'0'+(i+1),14,V.cyan,700,'middle')+text(center-48,y+28,name,20,V.ink,700)+text(center,392,copies[i],17,V.muted,400,'middle')+'</g>';hit(x,y,226,167,name+'的公开联办机制','case-data:road');});
    s+=mechanismTile(1191,290,120,38)+text(1251,315,'三维讲解 ↗',16,V.cyan,500,'middle');hit(1191,290,120,38,'放大联办安排与后台接续三维场景','model:process');
    s+=text(60,428,'成效 / 道路开口公开办理变化',17,V.cyan,700)+text(1386,428,'60平方公里适用联办 · V01',14,V.muted,400,'end');
    c.metrics.forEach((m,i)=>{const x=30+i*694,y=440,w=664;s+=panel(x,y,w,181);s+=text(x+26,y+35,m.label,22,V.ink,700)+text(x+w-25,y+34,m.unit,16,V.muted,400,'end')+text(x+26,y+75,m.before,46,'#97acc1',700)+text(x+144,y+71,'→',28,V.cyan)+text(x+212,y+75,m.after,46,V.gold,700);s+=mainPair(x,y+90,w,m.before,m.after,m.unit,m.label,['C008','C009'][i])+text(x+w-25,y+75,'2025.05 · V01 ↗',14,V.cyan,500,'end');hit(x,y,w,181,m.label+' '+m.before+'→'+m.after+m.unit,['claim:C008','claim:C009'][i]);});
    s+=panel(30,641,664,209)+text(58,680,'背景 / 同一改革，办理范围有差异',20,V.ink,700)+text(666,680,'不叠加为统一覆盖',12,V.muted,400,'end')+line(58,697,666,697,'#7893ae','stroke-opacity=".28"');
    const areas=[{value:60,label:'四个一联办模式',copy:'道路开口相关事项'},{value:165,label:'新扩区域咨询引导',copy:'不等同于同一联办安排'}],areaPlot={x:356,w:290,max:180};
    s+=`<g data-scope-area-chart="V01" data-scale-max="180" data-unit="平方公里" role="img" aria-label="60平方公里联办与新扩165平方公里咨询引导分别呈现；同一0至180面积刻度，不是同一联办范围扩张"><title>两种不同适用安排的面积口径，不叠加为统一办理覆盖</title>`;
    areas.forEach((r,i)=>{const y=732+i*56,by=y-11;
      s+=`<g data-scope-area="${r.value}" data-area-arrangement="${esc(r.label)}">`+text(58,y,r.label,16,i?V.gold:V.cyan,700)+text(58,y+22,r.copy,13,V.muted)+text(226,y+10,r.value,30,V.blue,700)+text(286,y+9,'平方公里',13,V.muted);
      [0,.5,1].forEach(f=>s+=line(areaPlot.x+areaPlot.w*f,by-3,areaPlot.x+areaPlot.w*f,by+17,'#abc8dd','stroke-opacity="'+(f===0?'.44':'.16')+'"'));
      s+=`<rect x="${areaPlot.x}" y="${by}" width="${areaPlot.w}" height="14" rx="2" fill="#2a4054"/><rect data-area-bar="${r.value}" x="${areaPlot.x}" y="${by}" width="${areaPlot.w*r.value/areaPlot.max}" height="14" rx="2" fill="${V.cyan}"/></g>`;
      hit(54,y-20,616,50,r.label+'的适用范围','source:V01');
    });
    [0,90,180].forEach(n=>s+=text(areaPlot.x+areaPlot.w*n/areaPlot.max,834,n,12,V.muted,400,n===0?'start':n===180?'end':'middle'));
    s+='</g>';
    s+=panel(724,641,664,209)+text(752,680,'成效 / 稿内：流程之越',20,V.ink,700)+text(1360,680,'P080',13,V.muted,400,'end')+line(752,697,1360,697,'#7893ae','stroke-opacity=".28"');
    s+=text(752,734,'一次提交、一次勘验、一次缴费、一次办结，',18,V.ink,500)+text(752,762,'最快15天即可完成，效率提升50%。',18,V.ink,500)+text(752,796,'营商环境建设局通过数据治理闭环识别堵点，',15,V.muted)+text(752,820,'联合交通、审批、市政公司等多方会商协调。',15,V.muted)+text(1360,836,'原文 ↗',14,V.cyan,500,'end');hit(724,641,664,209,'P080道路开口流程之越的原文','article:P080');
    s+=panel(1414,130,476,430,'#cbb58c')+text(1442,173,'边界 / 前台并，后台串',22,V.ink,700)+text(1862,173,'程序难再造',14,V.gold,500,'end')+text(1442,205,'稿内 P106 · P107',14,V.muted)+line(1442,229,1862,229,'#a39073','stroke-opacity=".35"');
    s+=`<g data-process-distribution="P106" role="group" aria-label="稿内P106：前台把多窗压缩成一窗，各事项仍按各自法定的受理条件、审查标准和签批层级办理；A/B仅为机制示意">`+mechanismTile(1442,246,420,46,V.gold,true)+text(1652,276,'前台一窗 · 多窗压成一窗',19,V.ink,700,'middle')+`<path d="M1652 292V308" stroke="${V.gold}" stroke-opacity=".6"/>`+'</g>';hit(1442,246,420,46,'前台一窗与后台法定程序：核对稿内 P106','article:P106');
    s+=text(1442,330,'后台没有统一的“并联流程”',17,V.gold,700);
    [['conditions','法定受理条件'],['review','法定审查标准'],['signing','法定签批层级']].forEach(([key,label],i)=>{const y=344+i*50;s+=`<g data-process-program-dimension="${key}" data-backend-observation="P106" data-observation-source="P106" role="group" aria-label="${esc(label+'：各事项分别保留；稿内 P106')}">`+mechanismTile(1442,y,420,40,V.gold,true)+`<rect x="1442" y="${y+9}" width="2" height="22" fill="${V.gold}" fill-opacity=".6"/>`+text(1462,y+27,label,18,V.ink,700)+text(1846,y+27,'事项A / 事项B 各自保留',14,V.muted,400,'end')+'</g>';hit(1442,y,420,40,label+'：核对稿内 P106','article:P106');});
    s+=`<g data-backend-observation="P107" data-observation-source="P107" data-process-conditional-coordination="manuscript-mechanism" role="group" aria-label="稿内P107：出现退件、系统断层或权限缺失时，需要沟通、催办、补录等人工接续">`+mechanismTile(1442,500,420,40,V.gold,true)+text(1458,525,'退件 / 系统断层 / 权限缺失',15,V.muted)+text(1846,525,'人工接续 · P107',15,V.gold,700,'end')+'</g>';hit(1442,500,420,40,'人工协调与补救：核对稿内 P107','article:P107');
    s+=panel(1414,580,476,270,'#cbb58d')+text(1442,621,'边界 / 前台减负，后台增负',22,V.ink,700)+text(1442,649,'稿内 P108 · P109 匿名访谈',14,V.muted)+line(1442,668,1862,668,'#9d8f78','stroke-opacity=".35"');
    s+=lines(1442,706,['“不能说为了前台给办事人','办得最好，后台就更加辛苦。”'],21,'#e6d6b8',33)+text(1442,778,'前台减负的每一分，都以后台增负重新计价。',16,V.ink,500)+text(1442,806,'V01 · 容缺受理、专题会商等协同安排已公开。',13,V.cyan,400,'start','data-acknowledgement-source="V01"')+text(1862,836,'原文与解释 ↗',15,V.cyan,500,'end');hit(1436,680,440,160,'读取P109原文与后台协调解释','article:P109');
    s+=text(42,873,'公开联办结果与稿内协调观察分别呈现；不推算后台工作量。',13,V.muted);
    return s;
  }

  function data(){
    const c=caseById('materials'),p=claim('C013'),st=window.GovCaseStory.stories.data;
    const panel=surface;
    let s=`<defs><radialGradient id="v23light"><stop stop-color="#629bab" stop-opacity=".14"/><stop offset="1" stop-color="#629bab" stop-opacity="0"/></radialGradient></defs>`;
    s+=text(34,29,'04 / 数据流通',14,V.cyan,700,'start','letter-spacing="3"')+text(34,76,'证照调用免了材料，跨部门数据为何仍难放开？',39,V.ink,700)+zones('data')+text(1884,43,'数据之越 × 数据回弹',17,V.gold,500,'end')+text(1884,75,'DATA · BREAKTHROUGH / REBOUND',10,'#799db7',400,'end','letter-spacing="2"');
    s+=panel(30,130,410,468)+text(56,172,'成效 / 哪些材料免交',22,V.ink,700)+text(412,172,'四类',14,V.muted,400,'end')+text(56,205,'按相应制度和条件适用',15,V.muted);
    c.materialCategories.forEach((name,i)=>{const y=237+i*75;s+=`${window.GovSemanticObjects.materialSheet(56,y,358,56,[V.cyan,V.blue,V.gold,V.green][i])}`+businessFigure(71,y+11,['certificate','internal','submitted','report'][i],34,[V.cyan,V.blue,V.gold,V.green][i])+text(117,y+35,name,19,V.ink,500);hit(56,y,358,56,name+'的适用条件与取得路径','claim:C012');});s+=text(56,570,'类别并列，不表示四个办理步骤。',14,V.muted);
    s+=panel(474,130,914,468)+`<ellipse cx="940" cy="355" rx="425" ry="216" fill="url(#v23light)"/>`+text(502,172,'成效 / 如何取得：五种实现方式',22,V.ink,700)+text(1360,172,'公开方案 · 按条件匹配',14,V.muted,400,'end')+line(502,192,1360,192,'#809bb2','stroke-opacity=".28"');
    s+=text(502,217,'五种条件路径并列 · 条件满足时可采用相应方式',12,V.muted,400,'start','data-conditional-caption="parallel"');
    c.submissionMethods.forEach((m,i)=>{
      const exhibit=window.GovConditionalExhibit,b=exhibit.stands[i],{x,y,w,h}=b,conditionLines=exhibit.conditionLines(m.condition,i);
      s+=`<g data-main-method="${i}" data-conditional-stand="${i}" role="group" aria-label="${esc(m.condition+'：可采用'+m.title+'；五种条件路径并列，不表示办理先后')}"><g data-method-condition="${i}">${exhibit.source(b)}`+lineIcon(x+16,y+15,['document','link','check','cloud','shield'][i],V.cyan,31);
      conditionLines.forEach((copy,row)=>s+=text(x+64,y+(conditionLines.length===1?37:25)+row*23,copy,17,V.ink,400,'start','data-condition-line="'+row+'"'));
      s+='</g>'+exhibit.junction(b)+`<g data-method-result="${i}">${exhibit.result(b)}`+text(x+24,y+98,m.title,22,V.cyan,700)+'</g>'+arrow(x+w-36,y+58,x+w-36,y+76,'#b9e7f2').replace('<path ',`<path data-condition-method-link="${i}" `)+'</g>';
      hit(x,y,w,h,m.condition+'：'+m.title,'claim:C012');
    });
    s+=line(502,488,1360,488,'#9aafbc','stroke-opacity=".3"')+text(502,519,'成效 / 稿内：调取—核验—承诺分层办理',18,V.cyan,700)+text(1360,519,'P087',12,V.cyan,500,'end');
    [['能调取的','直接调取'],['无法调取的','核验确认'],['仍无法核验的','承诺办理']].forEach(([cond,way],i)=>{const x=502+i*292;s+=`<g data-data-tier="${i}">`+mechanismTile(x,533,266,50)+text(x+18,564,cond,16,V.muted)+text(x+248,565,way,19,V.cyan,700,'end')+'</g>'+(i<2?arrow(x+268,558,x+290,558,V.cyan):'');});hit(498,500,866,90,'数据调取、核验与承诺分层办理：核对稿内 P087','article:P087');
    s+=panel(1414,130,476,468,'#cbb58c')+text(1442,172,'边界 / 调用之后谁负责',22,V.ink,700)+text(1442,205,'案例稿 P113 · 匿名访谈',14,V.muted)+line(1442,229,1862,229,'#a39073','stroke-opacity=".35"');
    s+=window.GovSemanticObjects.responsibilityGap();
    s+=lines(1442,276,['“调用之后归谁管、错了谁负责，','没有现成的说法。”'],22,'#e6d5b6',35)+text(1442,384,'实际流转的仅占小部分，',26,V.ink,700)+text(1442,428,'放行与否更多取决于人。',26,V.ink,700)+text(1442,507,'稿内 P111 · P114 · 数据之越止步于“不敢用”',16,V.muted)+text(1862,568,'原文与语境 ↗',16,V.cyan,500,'end');hit(1436,244,440,331,'P113数据调用后的责任原文','article:P113');
    s+=text(58,625,'成效 / 公开试点安排 · 2025.01',17,V.cyan,700)+text(1386,625,'以下均为计划规模，不是已完成数量',14,V.muted,400,'end');
    s+=panel(30,642,410,208)+text(56,678,'计划涉及规模',21,V.ink,700);
    [[p.value[0],'事项 / 项',56],[p.value[1],'证照 / 种',250]].forEach(([n,label,x])=>{s+=text(x,748,n,52,V.gold,700)+text(x,785,label,16,V.muted);hit(x-3,695,175,113,label+'计划数量','claim:C013');});s+=text(56,820,'有序逐步推进 · 来源 V06',14,V.muted);
    s+=panel(474,642,914,208)+text(502,678,'两类计划事项规模',21,V.ink,700)+text(1080,678,'条形单位 / 项',13,V.muted,400,'end')+text(1360,678,'完整场景 ↗',12,V.cyan,500,'end');hit(1290,656,86,32,'材料免交的完整场景图与解释','case-data:materials');
    s+=`<g data-main-material-plan="parallel" role="img" aria-label="107项与23项并列计划事项，共用0至120项刻度；9个计划套餐另列">`;
    [0,40,80,120].forEach(n=>s+=line(502+605*n/120,704,502+605*n/120,809,'#a3baca','stroke-opacity=".09"'));
    D.series.materialPlans.slice(0,2).forEach((r,i)=>{const y=724+i*56;s+=text(502,y,r.name,17,V.muted)+text(1107,y,r.value,27,V.ink,700,'end')+`<rect x="502" y="${y+12}" width="605" height="16" rx="3" fill="#243d50"/><rect data-plan-value="${r.value}" x="502" y="${y+12}" width="${605*r.value/120}" height="16" rx="3" fill="#93ceda"/>`;hit(499,y-22,614,43,r.name+' '+r.value+'计划事项','claim:C013');});
    [0,40,80,120].forEach(n=>s+=text(502+605*n/120,827,n,12,V.muted,400,n===0?'start':n===120?'end':'middle'));s+='</g>';
    s+=line(1150,698,1150,813,'#7a90a6','stroke-opacity=".3"')+text(1175,718,'另有',14,V.muted)+text(1175,773,p.value[4],49,V.gold,700)+text(1175,805,'个计划套餐',15,V.muted)+text(1175,823,'单独保留单位',12,V.muted);hit(1170,695,194,136,'9个免提交计划套餐','claim:C013');
    s+=panel(1414,642,476,208,'#cbb58c')+text(1442,680,'边界 / 数据回弹的四处表现',21,V.ink,700)+text(1862,680,'P111—P114',12,V.gold,500,'end');
    [['专网隔离','敏感数据不出部门','P111'],['逐项协商','调用逐项谈、逐项签','P113'],['责任悬空','出错谁负责无定论','P113'],['人工兜底','智能预审需人签字','P114']].forEach(([label,copy,para],i)=>{const x=1442+(i%2)*214,y=700+Math.floor(i/2)*72;s+=`<g data-data-responsibility="${i}" role="group" aria-label="${esc(label+'：'+copy+'；稿内 '+para)}">`+mechanismTile(x,y,206,62,V.gold,true)+text(x+16,y+27,label,18,V.gold,700)+text(x+16,y+50,copy,14,V.muted)+'</g>';hit(x,y,206,62,label+'：'+copy+'；核对稿内 '+para,'article:'+para);});
    s+=text(42,873,'四类材料和五种取得方式分别并列；关系示意不表示实测流量。',13,V.muted)+text(1880,873,'公开计划与稿内机制观察分别呈现',13,V.muted,400,'end');return s;
  }

  function regulation(){
    const p=claim('C014'),q=claim('C015'),e=claim('C016'),joint=claim('X006'),blocked=claim('X007');
    const panel=surface;
    let s=`<defs></defs>`;
    s+=text(34,29,'05 / 监管统筹',14,V.cyan,700,'start','letter-spacing="3"')+text(34,76,'检查可以只查一次，协同监管为何仍难贯通？',39,V.ink,700)+zones('regulation')+text(1884,43,'监管之越 × 监管回弹',17,V.gold,500,'end')+text(1884,75,'REGULATION · BREAKTHROUGH / REBOUND',10,'#799db7',400,'end','letter-spacing="2"');
    s+=panel(30,130,440,438)+text(58,173,'成效 / 检查量变化',23,V.ink,700)+text(441,173,'公开报道',14,V.muted,400,'end')+displayNumber(58,237,'−'+q.value[2]+'%',57)+text(58,272,'较统筹前的报道降幅',17,V.muted);
    const remaining=+(100-q.value[2]).toFixed(1);
    [[100,'统筹前基准',V.muted],[remaining,'统筹后相对量',V.cyan]].forEach(([value,label,color],i)=>{const y=325+i*72;s+=text(58,y,label,16,V.muted)+text(441,y,value,27,color,700,'end')+`<rect x="58" y="${y+13}" width="383" height="18" rx="3" fill="#34485d"/><rect x="58" y="${y+13}" width="${383*value/100}" height="18" rx="3" fill="${color}"/>`;});
    s+=text(58,454,'0',12,V.muted)+text(441,454,'100',12,V.muted,400,'end')+text(58,483,'相对指数：基准100，报道后为'+remaining,15,V.muted)+text(58,516,'指数由降幅换算，不是原始检查家次。',14,V.muted)+text(441,546,'核对统计范围 ↗',15,V.cyan,500,'end');hit(51,190,398,362,'检查量降幅与相对指数口径','claim:C015');
    s+=panel(494,130,896,438)+text(522,173,'成效 / 把分散计划组织成一次检查',23,V.ink,700)+text(1362,173,'60平方公里',14,V.muted,400,'end');
    s+=`<g data-regulation-scale="C014" role="group" aria-label="28部门、64领域、75条规则是三项并列统筹规模，单位不同，不与查前查中查后一一对应">`;
    [[p.value[0],'统筹部门 / 个'],[p.value[1],'检查领域 / 个'],[p.value[2],'统筹规则 / 条']].forEach(([n,label],i)=>{const x=522+i*285;s+=`<g data-regulation-scale-item="${i}" data-scale-value="${n}">`+mechanismTile(x,198,264,51,V.blue,true)+text(x+16,233,n,33,V.blue,700)+text(x+80,229,label,15,V.muted)+'</g>';});s+='</g>';hit(515,188,850,61,'28部门64领域75条统筹规则','claim:C014');
    s+=line(522,263,1362,263,'#839caf','stroke-opacity=".3"')+text(522,279,'公开检查流程',12,V.cyan,500)+text(1362,279,'规模与流程分别展示',12,V.muted,400,'end');
    const parts=[['查前','公示与统筹','整合检查计划','安全部门计划优先'],['查中','扫码与记录','记录主体、时间、内容','企业可评价和反馈'],['查后','跟踪与问效','结果可查可追溯','责任接续到执法主体']];
    parts.forEach(([phase,title,a,b],i)=>{const x=522+i*285;s+=`<g data-regulation-phase="${phase}" role="group" aria-label="公开检查模式：${phase}，${title}；${a}；${b}">`+mechanismTile(x,292,264,161)+businessFigure(x+207,305,['plan','record','feedback'][i],39,V.cyan)+text(x+20,315,phase,14,V.cyan,700)+text(x+20,350,title,19,V.ink,700)+`<path d="M${x+20} 365H${x+243}" stroke="${V.cyan}" stroke-opacity=".15"/><path d="M${x+14} 380v44" stroke="${V.cyan}" stroke-opacity=".45"/>`+text(x+20,389,a,16,V.muted)+text(x+20,419,b,16,V.muted)+'</g>';if(i<2)s+=arrow(x+266,369,x+282,369,V.cyan).replace('<path ',`<path data-inspection-phase-link="${i}" `);});
    s+=text(522,488,'计划可统筹，落实仍由相应部门承担',21,V.ink,700)+text(522,521,'公开闭环示意；连线不表示检查次数或实时数据流。',14,V.muted)+text(1362,546,'完整监管场景 ↗',15,V.cyan,500,'end');hit(516,275,855,281,'监管闭环与具体检查场景','case-data:inspection');
    s+=panel(1414,130,476,720,'#cbb58c')+text(1442,173,'边界 / 条块分，跨层隔',22,V.ink,700)+text(1862,173,'协同难贯通',14,V.gold,500,'end')+text(1442,205,'稿内 P121—P124',14,V.muted)+line(1442,229,1862,229,'#a39073','stroke-opacity=".35"');
    s+=`<g data-boundary-kind="条块分" data-boundary-source="P121">`+text(1442,264,'条块分 · P121',14,V.gold,700)+text(1442,302,'各部门系统林立、标准各异',24,V.ink,700)+lines(1442,338,['监管“只查一次”需要统一平台来调度，','协同监管卡在“条块分割”的体制缝隙中，','在操作层面始终落不了地。'],16,V.muted,27)+'</g>';hit(1436,244,440,170,'条块分：核对稿内 P121','article:P121');
    s+=line(1442,428,1862,428,'#a39073','stroke-opacity=".28"')+text(1442,462,'跨层隔 · P122—P124',14,V.gold,700)+`<path d="M1449 486V700" stroke="${V.gold}" stroke-opacity=".35"/>`;
    [['2018年','市级推出统一申办受理平台，','要求各区对接。','P122'],['至2026年','“没有一个区完完整整跟市里','直接对接”。','P123'],['转向市级','区级系统、终端与数据按区级','标准建设，“无异于推倒重来”。','P124']].forEach(([date,a,b,para],i)=>{const y=500+i*80;s+=`<g data-boundary-kind="跨层隔" data-boundary-source="${para}">`+`<rect x="1444" y="${y-9}" width="10" height="10" fill="#10233a" stroke="${V.gold}"/>`+text(1472,y,date,20,V.gold,700)+text(1862,y,para+' ↗',12,V.gold,500,'end')+text(1472,y+26,a,16,V.ink)+text(1472,y+50,b,16,V.muted)+'</g>';hit(1436,y-22,440,78,date+'：核对稿内 '+para,'article:'+para);});
    s+=line(1442,742,1862,742,'#a39073','stroke-opacity=".28"')+lines(1442,774,['P122—P124所指为综窗受理平台的市区对接，','与“综合查一次”检查业务分别阅读。'],14,V.muted,24);
    s+=panel(30,592,440,258)+text(58,635,'成效 / 同一报道，两种计量',22,V.ink,700);
    [[q.value[1],'涉及重点企业','家'],[q.value[0],'累计检查','家次']].forEach(([n,label,unit],i)=>{const y=699+i*72;s+=`<g data-inspection-support="${unit}">`+text(58,y,label,17,V.muted)+text(380,y+2,n,32,V.blue,700,'end')+text(441,y+1,unit,14,V.muted,400,'end')+line(58,y+23,441,y+23,'#839caf','stroke-opacity=".18"')+'</g>';});s+=text(58,824,'2024.03—2025.07 · 60平方公里',14,V.muted);hit(51,653,398,180,'758家与2229家次的不同计量','claim:C015');
    s+=panel(494,592,432,258)+text(522,635,'成效 / 减少重复，规范请求',22,V.ink,700);
    [[joint.value,'一次查全企业','家','claim:X006','2024.03—2025.07 / 企业数量'],[blocked.value,'异常请求拦截','次','claim:X007','实施以来至2025.08.20报道']].forEach(([n,label,unit,action,period],i)=>{const y=693+i*83;s+=`<g data-inspection-request="${i?'X007':'X006'}">`+text(522,y,n,32,V.blue,700)+text(590,y,unit,15,V.muted)+text(622,y-8,label,17,V.muted,500)+text(522,y+29,period,14,V.muted)+'</g>';hit(517,y-41,382,75,label,action);});s+=text(522,827,'两项分别计量 · 点击核对原始口径',13,V.muted);
    s+=panel(950,592,438,258)+text(978,635,'成效 / 一家企业自述',22,V.ink,700)+text(1360,635,'次/年 · 报道个案',13,V.muted,400,'end');
    s+=text(978,700,e.value[0],46,V.muted,700)+text(1052,693,'→',28,V.cyan)+text(1098,700,e.value[1],56,V.gold,700)+text(1180,680,'一年迎检次数减少',17,V.ink,700)+text(1180,704,'个案经历，不代表全区平均。',13,V.muted);
    s+=`<g data-regulation-company="true" role="img" aria-label="报道中一家企业自述，原来59次每年，后来9次每年；共用0至60次每年刻度">`;
    [0,30,60].forEach(n=>s+=line(1058+300*n/60,724,1058+300*n/60,790,'#acc1cf','stroke-opacity=".12"'));
    [[e.value[0],V.muted],[e.value[1],V.gold]].forEach(([n,color],i)=>{const y=730+i*34;s+=text(978,y+14,i?'报道自述':'原来每年',15,V.muted)+`<rect x="1058" y="${y}" width="300" height="18" rx="3" fill="#243b4d"/><rect data-company-value="${n}" x="1058" y="${y}" width="${300*n/60}" height="18" rx="3" fill="${color}"/>`;});
    [0,30,60].forEach(n=>s+=text(1058+300*n/60,808,n,12,V.muted,400,n===0?'start':n===60?'end':'middle'));
    s+='</g>'+text(1360,836,'查看个案出处 ↗',14,V.cyan,500,'end');hit(950,592,438,258,'一家企业自述59至9次检查','claim:C016');
    s+=text(42,873,'总体报道与企业自述分别保留范围和期间。',13,V.muted)+text(1880,873,'图形描述公开记录，不作为独立效果评估。',13,V.muted,400,'end');return s;
  }
  function evidenceMonthly(){
    const rows=D.series.monthly2026,px=94,pw=306,top=260,height=196,bottom=top+height,max=40000;
    let s=`<g data-evidence-monthly="accepted" role="img" aria-label="2026年1至8月区级大厅受理量，万件；共用零起点刻度0至4万件。选择月份核对原始月报。"><title>${esc(rows.map(r=>r.month+'受理'+r.accepted+'件，出处'+r.sourceId).join('；'))}</title>`;
    [0,20000,40000].forEach(n=>{const y=bottom-height*n/max;s+=line(px,y,px+pw,y,'#abc8dd','stroke-opacity="'+(n===0?'.32':'.15')+'"')+text(px-14,y+5,n/10000,12,V.muted,400,'end');});
    const points=rows.map((r,i)=>[px+pw*(i+.5)/rows.length,bottom-height*r.accepted/max]);
    // Conservative label boxes reserve clearance from every line segment.
    // The exported glyph audit checks these placements with the actual font.
    const intersects=(a,b,box)=>{
      let lo=0,hi=1;
      for(const [o,d,min,max] of [[a[0],b[0]-a[0],box[0],box[2]],[a[1],b[1]-a[1],box[1],box[3]]]){
        if(d===0){if(o<min||o>max)return false;continue;}
        const t0=(min-o)/d,t1=(max-o)/d;
        lo=Math.max(lo,Math.min(t0,t1));hi=Math.min(hi,Math.max(t0,t1));
        if(lo>hi)return false;
      }
      return true;
    };
    const positions=rows.map((r,i)=>{
      const [x,y]=points[i],valley=i>0&&r.accepted<rows[i-1].accepted&&(i===rows.length-1||r.accepted<rows[i+1].accepted);
      const choices=valley?[25,40,-18,-34]:[-18,-34,25,40];
      const offset=choices.find(d=>y+d>=top+2&&y+d<=bottom-6&&!points.slice(1).some((p,j)=>intersects(points[j],p,[x-20,y+d-17,x+20,y+d+5])));
      if(offset===undefined)throw Error('Monthly label needs a new layout: '+r.month);
      return {y:y+offset,placement:offset>0?'below':'above'};
    });
    s+=`<path d="M${points.map(p=>p.join(' ')).join('L')}L${points.at(-1)[0]} ${bottom}H${points[0][0]}Z" fill="url(#v61monthlyArea)"/><path d="M${points.map(p=>p.join(' ')).join('L')}" fill="none" stroke="${V.cyan}" stroke-width="2.5"/>`;
    rows.forEach((r,i)=>{const [x,y]=points[i],left=px+pw*i/rows.length;s+=`<g data-monthly-record="${r.sourceId}" data-accepted="${r.accepted}" data-month="${r.month}" data-label-placement="${positions[i].placement}"><title>${esc(r.month+'：'+r.accepted+'件；出处'+r.sourceId)}</title><circle cx="${x}" cy="${y}" r="4" fill="#0d2334" stroke="${V.cyan}" stroke-width="2"/>`+text(x,positions[i].y,(r.accepted/10000).toFixed(2),15,V.ink,500,'middle','data-month-value-label="true"')+`<rect x="${left+1}" y="483" width="${pw/rows.length-2}" height="28" rx="2" fill="#16364b" stroke="#99dff4" stroke-opacity=".2"/>`+text(x,502,String(r.monthNumber)+'月',15,V.cyan,500,'middle','data-month-name-label="true"')+'</g>';hit(left,253,pw/rows.length,259,r.month+'月报：受理'+r.accepted+'件；查看原始出处','source:'+r.sourceId);});
    return s+'</g>';
  }
  function evidence(){
    let s=text(34,29,'06 / 结论与证据',14,V.cyan,700,'start','letter-spacing="3"')+text(34,76,'四道墙弹回的，是同一条边界',39,V.ink,700)+text(35,105,'成效｜四越：前台一次次向前推进',17,V.cyan,500,'start','data-zone-label="result"')+text(1414,105,'边界｜四墙：谁有权、谁担责',17,V.gold,500,'start','data-zone-label="boundary"')+text(1884,43,'结论 × 证据',17,V.gold,500,'end')+text(1884,75,'CONCLUSION / EVIDENCE',10,'#799db7',400,'end','letter-spacing="2"');
    // 四越四墙总览：每行左成效、右边界
    s+=surface(30,130,1358,368)+text(58,173,'四越四墙 / 每一项成效对应一道边界',22,V.ink,700)+text(1360,173,'点击一行进入矛盾现场',13,V.muted,400,'end');
    s+=text(58,210,'维度',13,V.muted,500)+text(200,210,'成效（之越）',13,V.cyan,700)+text(560,210,'关键数字 · 灰前青后 · 零起点',13,V.cyan,500)+text(936,210,'边界（回弹）',13,V.gold,700)+text(1360,210,'原稿依据',13,V.muted,500,'end');
    const rows=[
      ['items','事项集成','部门事项转场景，一次提交联审批',{pair:claim('C006').value,max:30,unit:'工作日',scale:'超市便利店 · 0—30',labels:['前','后']},'前台合，后台分，职权难打破','P073 · P101—P104'],
      ['process','流程协同','前台集成一次办，后台并联协同转',{pair:claim('C008').value,max:30,unit:'工作日',scale:'道路开口 · 0—30',labels:['前','后']},'前台并，后台串，程序难再造','P079 · P105—P109'],
      ['data','数据流通','证照调用免材料，数据流通提效率',{counts:claim('C012').value,scale:'试点计划 '+claim('C013').value[0]+'项事项'},'权属锁，安全悬，决策难跨越','P085 · P110—P118'],
      ['regulation','监管统筹','只查一次减干扰，协同监管向纵深',{pair:[100,+(100-claim('C015').value[2]).toFixed(1)],max:100,unit:'',head:'−'+claim('C015').value[2]+'%',scale:'换算指数 · 0—100',labels:['基','后']},'条块分，跨层隔，协同难贯通','P091 · P120—P124']];
    const metric=(m,y)=>{let g=text(866,y+17,m.scale,11,V.muted,400,'end');
      if(m.counts){const [a,b]=m.counts;g+=text(560,y+18,a+'类材料 · '+b+'种方式',17,V.cyan,700)+`<g data-summary-counts="${a}-${b}" role="img" aria-label="${a}类免交材料、${b}种实现方式；计数方块，不同类别不计算比例">`;
        for(let k=0;k<a;k++)g+=`<rect x="${600+k*20}" y="${y+31}" width="14" height="14" rx="2" fill="${V.cyan}" fill-opacity=".85"/>`;
        for(let k=0;k<b;k++)g+=`<rect x="${700+k*20}" y="${y+31}" width="14" height="14" rx="2" fill="${V.blue}" fill-opacity=".55" stroke="${V.blue}" stroke-opacity=".8"/>`;
        return g+text(560,y+44,'材料',12,V.muted)+text(806,y+44,'方式',12,V.muted)+'</g>';}
      const [b0,a0]=m.pair,head=m.head||(b0+' → '+a0+' '+m.unit);g+=text(560,y+18,head,17,V.cyan,700)+`<g data-summary-pair="${b0}-${a0}" data-scale-max="${m.max}" role="img" aria-label="${esc(m.labels[0]+b0+'，'+m.labels[1]+a0+'；零起点，0至'+m.max)}">`;
      [b0,a0].forEach((v,k)=>{const yy=y+29+k*14;g+=`<rect x="560" y="${yy}" width="306" height="9" rx="2" fill="#2a4054"/><rect x="560" y="${yy}" width="${306*v/m.max}" height="9" rx="2" fill="${k?V.cyan:'#8da7bd'}"/>`;});
      return g+'</g>';};
    rows.forEach(([id,label,gain,m,wall,para],i)=>{const y=226+i*66;
      s+=`<g data-summary-row="${id}" role="group" aria-label="${esc(label+'：成效 '+gain+'；边界 '+wall)}"><rect x="182" y="${y}" width="688" height="58" rx="4" fill="${V.cyan}" fill-opacity=".05" stroke="${V.cyan}" stroke-opacity=".2"/><rect x="916" y="${y}" width="456" height="58" rx="4" fill="#d3b47c" fill-opacity=".07" stroke="${V.gold}" stroke-opacity=".3"/>`
        +text(58,y+36,label,21,V.ink,700)+text(200,y+25,gain,18,V.ink,500)+text(200,y+47,'成效',12,V.cyan,500)+metric(m,y)
        +text(893,y+35,'回弹',12,V.gold,700,'middle')+`<path d="M876 ${y+40}H910" stroke="${V.gold}" stroke-opacity=".5" marker-end="url(#v7arrow)"/>`
        +text(936,y+25,wall,18,V.ink,500)+text(936,y+47,'边界',12,V.gold,500)+text(1352,y+47,para,12,V.muted,400,'end')+text(1352,y+25,'↗',16,V.gold,700,'end')+'</g>';
      hit(46,y,1328,58,label+'：成效与边界','tension:'+id);});
    // 结论：P125
    s+=surface(1414,130,476,368,'#cbb58c')+text(1442,173,'结论 / 回答主问题',22,V.ink,700)+text(1862,173,'P125',13,V.gold,500,'end')+text(1442,205,'一件事办得成，一盘棋为何仍难接续？',14,V.muted)+line(1442,229,1862,229,'#a39073','stroke-opacity=".35"');
    s+=text(1442,272,'四道墙所弹回的，',27,V.ink,700)+text(1442,310,'实为同一事物——边界。',27,V.gold,700);
    [['数据弹回权属与安全',1442,346],['流程弹回审批权力',1652,346],['智能弹回语料与责任',1442,372],['平台弹回体制与成本',1652,372]].forEach(([t,x,y])=>s+=text(x,y,t,15,V.muted));
    s+=line(1442,392,1862,392,'#a39073','stroke-opacity=".28"')+text(1442,428,'技术能把前台一次次向前推进，',18,V.ink,500)+text(1442,456,'却不能替组织决定谁有权、谁担责。',18,V.ink,500)+text(1862,484,'原文 ↗',13,V.cyan,500,'end');hit(1436,244,440,246,'结论：核对稿内 P125','article:P125');
    // 原稿结尾三段
    s+=surface(30,518,1358,224)+text(58,553,'原稿结尾 / 拆开的墙，立着的墙，还有几道要拆？',20,V.ink,700)+text(1360,553,'P126—P140',12,V.muted,400,'end');
    [['01 成效之显','沙盒审批开新路，亦庄模式出京城',null,'P128—P131',V.cyan,'article:P131'],
     ['02 限度之存','前台渐快后台慢，咨询分层解释难',['窗口只能转述，最终解释在审批部门；','场景按部门理解集成，需求仍待验证。'],'P133—P135',V.gold,'article:P134'],
     ['03 未尽之问','场景谁定权谁担，后台何时真正动',['AI答错了谁来负责，尚无定论；','市级平台迟迟未推进，后台格局依旧。'],'P136—P140',V.gold,'article:P140']].forEach(([label,head,copy,para,color,action],i)=>{const x=58+i*444;
      s+=`<g data-case-ending="${i}">`+mechanismTile(x,572,420,156,color,true)+`<rect x="${x}" y="${582}" width="2" height="136" fill="${color}" fill-opacity=".55"/>`+text(x+20,600,label,15,color,700)+text(x+400,600,para+' ↗',12,V.muted,400,'end')+text(x+20,634,head,18,V.ink,700)+(copy?text(x+20,666,copy[0],15,V.muted)+text(x+20,692,copy[1],15,V.muted):[['200余','项举措落地见效'],['近30','项成果推广'],['10','个区试点查一次']].map(([n,u],k)=>text(x+20+k*132,678,n,30,V.cyan,700)+text(x+20+k*132,702,u,11,V.muted)).join(''))+'</g>';hit(x,572,420,156,label+'：核对稿内 '+para,action);});
    // 出路
    s+=surface(30,762,1358,88)+text(58,798,'出路 / 从“局部突围”到“深层突围”',20,V.ink,700)+text(58,830,'技术可以拓展协同空间，却难以单独重塑权责机构（P384）',14,V.muted);
    [['流程','联合审批流程实质制度化'],['技术','数据“联得上”也“对得上”'],['制度','协同职责从“额外任务”转为“法定职能”']].forEach(([k,v],i)=>{const x=[520,762,1004][i],w=[230,230,368][i];s+=mechanismTile(x,780,w,52,V.cyan,true)+text(x+14,803,k,13,V.cyan,700)+text(x+14,823,v,14,V.ink);});
    hit(46,770,1328,72,'深层突围：核对稿内 P384—P388','article:P384');
    // 证据底座
    s+=surface(1414,518,476,332)+text(1442,553,'证据底座 / 每个结论可回溯',20,V.ink,700);
    const groups=[['月度统计',t=>t==='月度统计',V.cyan],['公开报道',t=>/报道/.test(t),V.blue],['制度与指南',t=>/办事指南|登记材料|OPC|制度文件|机构职责/.test(t),V.gold],['其他背景',()=>true,'#7f93a8']];
    const counts=groups.map(()=>0);D.sources.forEach(r=>{const k=groups.findIndex(g=>g[1](r.type||''));counts[k]++;});
    s+=text(1442,594,D.sources.length,28,V.blue,700)+text(1490,593,'条公开来源 · 按类型',15,V.ink,500)+text(1862,593,'↗',17,V.cyan,700,'end');
    let sx=1442;s+=`<g data-evidence-source-types="true" role="img" aria-label="${esc(groups.map((g,k)=>g[0]+counts[k]+'条').join('，'))}">`;
    groups.forEach((g,k)=>{const w=420*counts[k]/D.sources.length;s+=`<rect x="${sx.toFixed(1)}" y="606" width="${Math.max(w-2,1).toFixed(1)}" height="14" rx="2" fill="${g[2]}" fill-opacity="${k===3?'.6':'.85'}"/>`+text(1442+k*108,640,g[0]+' '+counts[k],11,V.muted)+`<rect x="${1442+k*108-9}" y="632" width="6" height="6" fill="${g[2]}"/>`;sx+=w;});
    s+='</g>';hit(1436,572,440,76,'公开来源索引','search');
    const mo=D.monthly,mx=Math.ceil(Math.max(...mo.map(r=>r.accepted))/10000)*10000,cx=x=>1442+420*x/(mo.length-1),cy=v=>748-58*v/mx;
    s+=text(1442,672,mo.length,22,V.blue,700)+text(1474,671,'期区级大厅月报 · 月受理量',14,V.ink,500)+text(1862,671,'0—'+mx/10000+'万件',11,V.muted,400,'end');
    const pts=mo.map((r,k)=>cx(k).toFixed(1)+' '+cy(r.accepted).toFixed(1)).join(' L');
    s+=`<g data-evidence-monthly-spark="${mo.length}" role="img" aria-label="${esc(mo[0].month+'至'+mo.at(-1).month+'共'+mo.length+'期月受理量，零起点，0至'+mx+'件')}"><path d="M1442 748H1862" stroke="#a6bfd2" stroke-opacity=".35"/><path d="M1442 748L${pts}L1862 748Z" fill="${V.cyan}" fill-opacity=".12"/><path d="M${pts}" fill="none" stroke="${V.cyan}" stroke-width="1.6"/></g>`+text(1442,764,mo[0].month.replace('-','.'),11,V.muted)+text(1862,764,mo.at(-1).month.replace('-','.'),11,V.muted,400,'end');hit(1436,654,440,116,'月度运行记录','trend');
    s+=line(1442,778,1862,778,'#829eb4','stroke-opacity=".28"')+text(1442,806,D.claims.length,22,V.blue,700)+text(1474,805,'项数值与机制主张 · 均附出处',14,V.ink,500)+text(1862,805,'↗',17,V.cyan,700,'end');hit(1436,784,440,30,'主张索引','search');
    s+=text(1442,836,'三类证据分别标注：运行统计 · 公开场景 · 稿内访谈',12,V.muted);
    s+=text(42,873,'突破不等于边界消失；边界仍在也不等于改革全盘无效。',13,V.muted)+text(1880,873,'每个入口保留原始范围、期间与出处。',13,V.muted,400,'end');return s;
  }
  function defs(){return window.GovApplicationExhibit.defs()+window.GovExhibitMaterial.shadeConditionalDefs(window.GovConditionalExhibit.defs())+window.GovSemanticObjects.defs()+window.GovExhibitMaterial.defs()+window.GovExhibitMaterial.shadeNodeDefs(window.GovDiagramMaterial.defs('hall-v65'))+(window.GovMainFigures?.defs()||'')+`<defs>
    <radialGradient id="v56reflection" cx="10%" cy="0%" r="90%"><stop stop-color="#c5dff5" stop-opacity=".14"/><stop offset=".38" stop-color="#879bbe" stop-opacity=".045"/><stop offset="1" stop-color="#467eac" stop-opacity="0"/></radialGradient>
    <linearGradient id="v25surface" x1="0" y1="0" x2=".7" y2="1"><stop stop-color="#253b60"/><stop offset=".18" stop-color="#1c2e50"/><stop offset=".6" stop-color="#12233e"/><stop offset="1" stop-color="#0c1930"/></linearGradient>
    <linearGradient id="v53support" x1="0" y1="0" x2=".4" y2="1"><stop stop-color="#17233b"/><stop offset=".45" stop-color="#111c32"/><stop offset="1" stop-color="#0b1427"/></linearGradient>
    <linearGradient id="v53metric" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#20304b"/><stop offset=".36" stop-color="#182641"/><stop offset="1" stop-color="#0d1a30"/></linearGradient>
    <linearGradient id="v53observation" x1="0" y1="0" x2=".75" y2="1"><stop stop-color="#303548"/><stop offset=".45" stop-color="#20293e"/><stop offset="1" stop-color="#111d32"/></linearGradient>
    <linearGradient id="v53node" x1="0" y1="0" x2=".35" y2="1"><stop stop-color="#314c6c"/><stop offset=".38" stop-color="#213853"/><stop offset="1" stop-color="#12243e"/></linearGradient>
    <linearGradient id="v63sideEdge" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#bdd9f3" stop-opacity=".6"/><stop offset=".32" stop-color="#789ac6" stop-opacity=".22"/><stop offset=".6" stop-color="#53779e" stop-opacity=".08"/><stop offset="1" stop-color="#7195bd" stop-opacity=".35"/></linearGradient>
    <radialGradient id="v53modelLight" cx="50%" cy="65%" r="60%"><stop stop-color="#7abed1" stop-opacity=".16"/><stop offset=".65" stop-color="#427c96" stop-opacity=".05"/><stop offset="1" stop-color="#142b3f" stop-opacity="0"/></radialGradient>
    <linearGradient id="v53plinth" x1="0" y1="0" x2=".4" y2="1"><stop stop-color="#31466a" stop-opacity=".8"/><stop offset=".5" stop-color="#203553" stop-opacity=".65"/><stop offset="1" stop-color="#0b1930" stop-opacity=".9"/></linearGradient>
    <linearGradient id="v36edge" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#bae2ef" stop-opacity=".75"/><stop offset=".25" stop-color="#5a8ca7" stop-opacity=".4"/><stop offset=".65" stop-color="#1b3b53" stop-opacity=".2"/><stop offset="1" stop-color="#6d9bb4" stop-opacity=".5"/></linearGradient>
    <linearGradient id="v13tray" x2="0" y2="1"><stop stop-color="#314368"/><stop offset=".045" stop-color="#162542"/><stop offset="1" stop-color="#0b1329"/></linearGradient>
    <linearGradient id="v13glass" x1="0" y1="0" x2=".6" y2="1"><stop stop-color="#22375d"/><stop offset=".45" stop-color="#172747"/><stop offset="1" stop-color="#111b35"/></linearGradient>
    <linearGradient id="v13rim" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#c4daff" stop-opacity=".75"/><stop offset=".22" stop-color="#6178a2" stop-opacity=".3"/><stop offset=".65" stop-color="#223050"/><stop offset="1" stop-color="#8ba4d1" stop-opacity=".45"/></linearGradient>
    <linearGradient id="v13tab" x2="0" y2="1"><stop stop-color="#5977ab" stop-opacity=".33"/><stop offset=".7" stop-color="#203355" stop-opacity=".12"/><stop offset="1" stop-color="#647ead" stop-opacity=".2"/></linearGradient>
    <linearGradient id="v13bar"><stop stop-color="#507f9e"/><stop offset=".7" stop-color="#87c2d5"/><stop offset="1" stop-color="#c0edf3"/></linearGradient>
    <linearGradient id="v7panel" x2="0" y2="1"><stop stop-color="#253858"/><stop offset="1" stop-color="#121d35"/></linearGradient>
    <linearGradient id="v7node" x2="0" y2="1"><stop stop-color="#263c62"/><stop offset="1" stop-color="#172440"/></linearGradient>
    <linearGradient id="v7rule"><stop stop-color="#9acbff"/><stop offset="1" stop-color="#354968"/></linearGradient>
    <marker id="v7arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#9fbce9"/></marker>
  </defs>`;}
  window.GovArtwork = {render,exportSvg,background,svgStyle,names,layout};
})();
