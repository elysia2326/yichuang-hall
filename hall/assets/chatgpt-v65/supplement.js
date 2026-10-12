/* V65 supplementary structures, shared node materials; V62 content and controls retained. Reads GOV_V7 and GovCaseStory; no ledger mutation.
 * Solid ice-blue connections describe procedural/structural relationships; gold dashed connections
 * are research comparisons/questions, never event logs, measured traffic or effects.
 */
(() => {
  'use strict';
  const names = Object.freeze({
    overview: '组织接续的四种边界', items: '统一表单与双系统审批',
    process: '公开联办与后台接续', data: '入学材料调用的四个角色',
    regulation: '检查闭环与跨区后续', evidence: '从出处到主张，再对读现场'
  });
  const P = Object.freeze({ ink: '#e7f1f8', muted: '#a5b9cb', blue: '#9cbcd5', ice: '#97dce9', gold: '#dfc28e', navy: '#091a2b', line: '#39546d' });
  const record = (key, id) => {
    const r = window.GOV_V7?.[key]?.find(x => x.id === id);
    if (!r) throw new Error('GovSupplement: missing ledger record ' + key + '/' + id);
    return r;
  };
  const story = () => {
    if (!window.GovCaseStory?.eventChains) throw new Error('GovSupplement requires GovCaseStory');
    return window.GovCaseStory;
  };
  const E = value => {
    if (!window.GovCharts?.esc) throw new Error('GovSupplement requires GovCharts.esc');
    return window.GovCharts.esc(value);
  };
  const date = id => record('sources', id).publishedDate.replaceAll('-', '.');
  const T = (x, y, copy, size = 20, color = P.ink, weight = 400, anchor = 'start') =>
    `<text x="${x}" y="${y}" font-size="${size}" fill="${color}" font-weight="${weight}" text-anchor="${anchor}">${E(copy)}</text>`;
  const split = (copy, max) => {
    const chars = Array.from(String(copy)), rows = [];
    while (chars.length) rows.push(chars.splice(0, max).join(''));
    return rows;
  };
  const L = (x, y, rows, size = 20, color = P.muted, gap = 28, weight = 400, anchor = 'start') =>
    rows.map((v, i) => T(x, y + i * gap, v, size, color, weight, anchor)).join('');
  const box = (x, y, w, h, color = P.line, fill = '#11283c') =>
    window.GovDiagramMaterial.tile(x,y,w,h,{prefix:'graph-v65',accent:color,warm:color===P.gold,quiet:h<80});
  function node(action, content) {
    if(!action)return content;
    const [kind,id]=action.split(':');
    const label=kind==='article'?story().excerptMeta[id]?.object:record(kind==='claim'?'claims':'sources',id).title;
    if(!label)throw new Error('Missing node destination '+action);
    return `<g class="gs-node" data-action="${E(action)}" role="button" tabindex="0" aria-haspopup="dialog" aria-label="${E('核读 '+id+' · '+label)}"><title>${E('点击核读 '+id+' · '+label)}</title>${content}</g>`;
  }
  const card = (x, y, w, h, title, copy, type = '公开程序', color = P.ice, action = '') => {
    const rows = Array.isArray(copy) ? copy : split(copy, Math.floor((w - 40) / 20));
    return node(action,`<g data-node-kind="${E(type)}">${box(x,y,w,h,color)}<path d="M${x+20} ${y+42}H${x+w-20}" stroke="${color}" stroke-opacity=".18"/>${T(x+20,y+28,type,18,color,500)}${action?T(x+w-17,y+28,'↗',18,color,500,'end'):''}${T(x+20,y+74,title,25,P.ink,700)}${L(x+20,y+108,rows,20,P.muted,28)}</g>`);
  };
  const path = (d, color = P.ice, dash = false, arrow = false, topic = '') =>
    `<path d="${d}" fill="none" stroke="${color}" stroke-width="2"${dash?' stroke-dasharray="6 7"':''}${arrow?` marker-end="url(#gs-${topic}-${color===P.gold?'gold':'ice'})"`:''}/>`;
  const tag = (x, y, w, text, color = P.gold) => box(x,y,w,38,color,'#172c3b') + T(x+w/2,y+26,text,19,color,500,'middle');
  function frame(topic, title, subtitle, body, notes, description) {
    const id = 'gs-' + topic;
    return `<svg class="gs-svg" data-supplement-svg="${topic}" data-frame-material="chatgpt-v65" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600" role="group" aria-labelledby="${id}-title ${id}-desc" style="font-family:ReformSans,'Microsoft YaHei',sans-serif">
      <title id="${id}-title">${E(title)}</title><desc id="${id}-desc">${E(description)}</desc>
      ${window.GovDiagramMaterial.defs('graph-v65')}<defs><linearGradient id="${id}-surface" x1="0" y1="0" x2=".7" y2="1"><stop stop-color="#233654"/><stop offset=".45" stop-color="#162840"/><stop offset="1" stop-color="#0a182c"/></linearGradient><radialGradient id="${id}-light" cx="9%" cy="0%" r="85%"><stop stop-color="#b8d6f4" stop-opacity=".12"/><stop offset=".45" stop-color="#90acd3" stop-opacity=".025"/><stop offset="1" stop-color="#627ba3" stop-opacity="0"/></radialGradient>
      <marker id="${id}-ice" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10Z" fill="${P.ice}"/></marker>
      <marker id="${id}-gold" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10Z" fill="${P.gold}"/></marker></defs>
      <g data-graph-frame="layered-sapphire" aria-hidden="true"><rect width="1200" height="600" rx="14" fill="#030c1c"/><rect x="1" y="1" width="1198" height="594" rx="13" fill="url(#${id}-surface)" stroke="#93b5d4" stroke-opacity=".38"/><rect x="2" y="2" width="1196" height="531" rx="12" fill="url(#${id}-light)"/><path d="M17 3H1182Q1196 3 1196 17" fill="none" stroke="#d7e8f6" stroke-opacity=".24"/><path d="M3 22V568" stroke="#8db6d7" stroke-opacity=".18"/><path d="M8 597H1180Q1195 597 1195 578" fill="none" stroke="#1c3854" stroke-width="1"/><path d="M17 599H1183" stroke="#6f8bad" stroke-opacity=".12"/><path d="M43 537H1157V594H43Z" fill="#071426" fill-opacity=".26"/></g><path d="M32 30V83" stroke="${P.ice}" stroke-width="3"/>${T(50,54,title,31,P.ink,700)}${T(50,85,subtitle,19,P.muted)}<path d="M40 105H1160M40 538H1160" stroke="${P.line}" stroke-opacity=".75"/>
      ${body}${L(44,560,notes,18,P.muted,24)}</svg>`;
  }

  function overview() {
    const constraints = window.GOV_V7.constraints;
    const labels = ['authority','procedure','responsibility','platform'].map(id => {
      const c = constraints.find(x=>x.id===id);
      if (!c) throw new Error('GovSupplement: missing constraint '+id);
      return c.label;
    });
    let s = path('M330 224H395V295H435',P.ice) + path('M870 224H805V295H765',P.ice)
      + path('M330 421H395V320H435',P.gold,true) + path('M870 421H805V320H765',P.gold,true);
    s += card(60,144,270,155,labels[0],['原系统分别审批','稿内 P104'],'稿内观察',P.ice,'article:P104')
      + card(870,144,270,155,labels[1],['审查条件仍需满足','稿内 P106'],'稿内分析',P.ice,'article:P106')
      + card(60,343,270,155,labels[2],['调用后的责任追问','稿内 P113'],'研究追问',P.gold,'article:P113')
      + card(870,343,270,155,labels[3],['综窗平台对接观察','稿内 P123 · 另一对象'],'稿内观察',P.gold,'article:P123');
    s += node('source:V05',box(435,242,330,137,P.ice,'#1c4054') + T(600,274,'公开模式 × 稿内机制',19,P.ice,500,'middle')
      + T(600,315,'统一受理入口',30,P.ink,700,'middle') + T(600,352,'组织完整办事需求',22,P.muted,400,'middle'));
    s += T(600,453,'连线表示组织关系',20,P.blue,500,'middle') + T(600,485,'不表示办理顺序或责任已经归集',18,P.muted,400,'middle');
    return frame('overview','入口合一，组织接续仍有四个方向','前台入口整合 / 后台的权限、程序、责任与接口',s,
      [`公开模式 V05 · ${date('V05')}；稿内 P104 / P106 / P113 / P123。`,'P123对象为综窗申办受理平台；不能据此判断综合检查系统发生故障。'],
      '以统一受理入口为中心，对读四种组织边界。四种边界取自台账constraints；没有绘制实际流量或固定办理顺序。综窗平台是独立对象。');
  }

  function items() {
    const sc = story();
    if (!sc.excerpts.P104 || !sc.excerpts.P134) throw new Error('GovSupplement: missing P104/P134');
    let s = card(55,206,265,177,'统一申请信息',['统一字段','组织完整需求'],'稿内 P104',P.ice,'article:P104');
    s += path('M320 294H365V213H420',P.ice,false,true,'items') + path('M365 294V411H420',P.ice,false,true,'items');
    s += T(372,270,'分别',18,P.ice,500) + T(372,299,'推送',18,P.ice,500);
    s += card(420,142,320,155,'原业务系统 A',['依原权限审批','审批模式继续保留'],'稿内 P104',P.ice,'article:P104')
      + card(420,340,320,155,'原业务系统 B',['依原权限审批','审批模式继续保留'],'稿内 P104',P.blue,'article:P104');
    s += path('M740 220H782V297H825',P.gold,true,true,'items') + path('M740 417H782V323H825',P.gold,true,true,'items');
    s += card(825,232,320,177,'答复与解释接续',['窗口按部门规则答复','最终解释权仍在部门'],'稿内 P134',P.gold,'article:P134');
    s += T(165,449,'前台 / 入口整合',20,P.ice,500,'middle') + T(985,460,'追问 / 谁接审批进度？',20,P.gold,500,'middle');
    return frame('items','同一张表，进入两个原业务系统','组织剖面 / 一般机制访谈，A、B为示意名称',s,
      ['出处：稿内 P104 / P134；没有指定某一家企业的逐笔流转记录。','虚线表示研究对读；不同系统的审批与解释职责不能由统一表单自动推定已归集。'],
      'P104描述统一字段分别推送原业务系统；P134说明受理窗口和审批部门的解释知识层级。A与B只是图示名称，未给部门虚构职责。虚线不表示真实反馈日志。');
  }

  function process() {
    const road = record('cases','road'), stages = road.stages;
    const sc = story();
    let s = T(50,139,'公开程序 / 道路开口“四个一”',22,P.ice,700)
      + T(1150,139,date('V01')+' · V01',18,P.muted,400,'end');
    const copies = ['服务专窗统一接件','统一标准联合踏勘','跨部门核定征收','全流程帮办指导'];
    stages.forEach((label,i) => {
      const x=50+i*282;
      s += card(x,159,252,145,label,copies[i],'公开程序',P.ice,'source:V01');
      if(i<3) s += path(`M${x+255} 235H${x+277}`,P.ice,false,true,'process');
    });
    s += path('M50 333H1150',P.gold,true) + T(600,357,'上下层对读 / 不拼接为同一事件',19,P.gold,500,'middle');
    const rows = [['审查条件',sc.stories.process.backSteps[0],'P106'],['签批与进度',sc.stories.process.backSteps[1],'P106 / P107'],['协调与补救',sc.stories.process.backSteps[2],'P107 / P109']];
    rows.forEach(([title,copy],i) => {s+=card(50+i*377,378,346,131,title,[copy+'仍需接续'], '稿内一般观察',P.gold,'article:'+['P106','P107','P109'][i]);});
    return frame('process','一次联办，怎样成为稳定的后台接续','程序图与机制观察分层；下层不是后台耗时测量',s,
      [`V01公开范围：60平方公里 · ${date('V01')}；容缺受理、专题会商、常态反馈已有记录。`,'稿内 P106 / P107 / P109为一般机制观察；不能据此认定道路开口协同机制尚未建立。'],
      '上层依道路开口案例的四个一模式绘制，下层是稿内法定审查、签批及人工协调的一般观察。两层不构成某一个道路项目的完整事件日志，也不测量后台劳动。');
  }

  function data() {
    const chain = story().eventChains.data, plan = record('claims','C013');
    let s = T(50,142,'公开调用示例 / 义务教育入学',22,P.ice,700)
      + T(1150,142,date('V06')+' · V06',18,P.muted,400,'end');
    chain.steps.forEach(([actor,operation],i) => {
      const x=50+i*282;
      s += card(x,194,252,175,actor,operation,i===1?'公开示例 / 数据调用':'公开示例 / 办理动作',P.ice,'source:V06');
      if(i<3)s+=path(`M${x+255} 278H${x+277}`,P.ice,false,true,'data');
      s+=T(x+126,175,'0'+(i+1),22,P.blue,700,'middle');
    });
    s += node('claim:C013',box(50,410,530,95,P.blue,'#0c2033') + T(72,441,'另一个对象 / 试点推进计划',19,P.blue,500)
      + T(72,479,plan.value[0]+' 项事项 / '+plan.value[1]+' 种证照',26,P.ink,700)
      + T(558,479,'计划数',19,P.blue,500,'end'));
    s += node('article:P113',box(611,410,535,95,P.gold,'#172a36') + T(633,441,'一般责任访谈 / P113',19,P.gold,500)
      + T(633,479,'追问：调用后归谁管、错了谁负责？',22,P.ink,500));
    return frame('data','材料调用：四个角色分别做什么','公开条件性示例 / 连线表示动作关系，不表示数据流量',s,
      [`V06 · ${date('V06')}；入学示例与${plan.value[0]}事项/${plan.value[1]}证照的推进计划分别呈现。`,'P113是跨部门共享责任的一般访谈；不等于入学示例已发生错误或全部事项均已落地。'],
      '根据V06的入学示例绘制家长、电子证照库、审核人员、申请人四个角色及动作。未增加身份核验机关或无来源的责任分配。另行隔离试点计划规模及P113一般访谈。');
  }

  function regulation() {
    const chain = story().eventChains.regulation, progress = record('claims','C032');
    if(!chain) throw new Error('GovSupplement: missing regulation chain');
    const stages = [['查前 / 计划统筹',['汇集并合并安排','安全部门计划优先']],['查中 / 扫码记录',['记录主体、时间、内容','企业可评价和反馈']],['查后 / 追踪问效',['结果可查询追溯','执法主体接续处置']]];
    let s = '';
    stages.forEach(([label,copy],i) => {const x=80+i*365;s+=card(x,144,310,172,label,copy,'公开程序 / V07',P.ice,'source:V07');if(i<2)s+=path(`M${x+315} 230H${x+355}`,P.ice,false,true,'regulation');});
    s += path('M1050 320V354H235V320',P.ice,false,true,'regulation') + tag(426,337,350,'公开闭环示意 / 非实时监控',P.blue);
    s += T(55,413,'后续公开进展 / 与早期统计分期',21,P.blue,700);
    const eventDates = String(progress.value).split('/').map(v=>v.replace('-','.'));
    const ticks = [[eventDates[0],'首例通州联合检查','事件'],[eventDates[1],'协作覆盖165平方公里','事件'],[date('V11'),'公开披露改革进展','报道']];
    ticks.forEach(([when,label,type],i) => {
      const x=70+i*384;
      s += node(i===2?'source:V11':'claim:C032',`<rect x="${x-12}" y="425" width="350" height="100" rx="5" fill="#10283c" fill-opacity=".2" stroke="${P.line}" stroke-opacity=".35"/><circle cx="${x}" cy="440" r="5" fill="${i===2?P.gold:P.ice}"/>` + T(x+16,447,type,18,i===2?P.gold:P.ice) + T(x,482,when,24,P.ink,700) + T(x,512,label,20,P.muted));
      if(i<2)s+=path(`M${x+342} 440H${x+370}`,P.line);
    });
    return frame('regulation','从统筹计划到结果接续：一个公开闭环','检查对象 / 三阶段机制与后续跨区进展分别呈现',s,
      [`机制出处 V07 · ${date('V07')}；后续事件出处 V11 · ${date('V11')}。`,'连线为公开程序关系；P123的综窗申办受理平台访谈不作为检查系统故障证据。'],
      '三阶段采用V07综合检查公开模式；下方采用C032/V11的事件及报道日期。查后的接续属于执法对象，未把综窗申办受理平台P123引入这一闭环。');
  }

  function evidence() {
    const c = record('claims','C006');
    const max=30, left=515, width=233;
    let s = card(50,163,320,162,'原始出处',['V04 / 超市便利店报道',date('V04')],'公开记录',P.ice,'source:V04');
    let comparison = box(421,163,375,259,P.ice,'#102c3f') + T(447,192,'具体主张 / C006',19,P.ice,500)
      + T(447,231,c.value.join(' → ')+' '+c.unit,29,P.ink,700);
    s += path('M374 243H413',P.ice,false,true,'evidence');
    s += T(390,155,'出处支持',18,P.ice,500,'middle');
    [0,15,30].forEach(n=>comparison+=path(`M${left+width*n/max} 263V345`,P.line)+T(left+width*n/max,371,n,18,P.muted,400,'middle'));
    c.value.forEach((v,i)=>{const y=277+i*48;comparison+=T(447,y+15,i?'改革后':'改革前',18,P.muted)+`<rect x="${left}" y="${y}" width="${width*v/max}" height="20" rx="3" fill="${i?P.ice:P.blue}"/>`;});
    s += node('claim:C006',comparison + T(447,404,'同一刻度 / '+c.unit+' / 特定联办场景',18,P.muted));
    s += card(856,227,295,181,'研究现场',['P104 / 一般机制访谈','字段统一，分别审批'],'稿内观察',P.gold,'article:P104')
      + path('M800 299H847',P.gold,true,false,'evidence') + T(826,284,'对读',18,P.gold,500,'middle');
    s += tag(66,464,728,'公开办理变化与稿内组织观察 / 各自保留证据对象',P.blue)
      + T(1003,480,'不是同一企业日志',20,P.gold,500,'middle');
    return frame('evidence','一条数值主张，怎样回到出处与研究现场','出处支持数值主张；主张与访谈另行对读',s,
      [`V04 · ${date('V04')}；C006 · ${c.period} · ${c.scope}。`,'P104并未指定这一超市办理事件；对读不能证明该个案后台失败，亦非独立政策效果评估。'],
      'V04支持C006的29至5工作日主张，条图使用0至30工作日共用刻度。P104是同类机制的一般访谈，金色虚线只表示研究对读而非事件连续性或因果证据。');
  }

  const drawers = Object.freeze({overview,items,process,data,regulation,evidence});
  const references = Object.freeze({
    overview: [['source','V05'],['article','P104'],['article','P106'],['article','P113'],['article','P123']],
    items: [['article','P104'],['article','P134']],
    process: [['source','V01'],['article','P106'],['article','P107'],['article','P109']],
    data: [['source','V06'],['claim','C013'],['article','P113']],
    regulation: [['source','V07'],['source','V11'],['claim','C032']],
    evidence: [['source','V04'],['claim','C006'],['article','P104']]
  });
  const explanations = Object.freeze({
    overview: '把“已经发生的入口整合”与“仍需组织的接续”放在同一张结构图中。四类边界来自现有研究台账，核读时应回到各自业务对象。',
    items: '合并表单把办事需求组织到统一入口；审批职责是否同步归集，仍需核对授权与部门规则。图中没有把部门权限或最终解释权交给窗口。',
    process: '公开报道已经记载协同会商与反馈安排。研究关注的是这些安排怎样稳定运行；一般访谈不足以否认某个道路项目的具体联办成果。',
    data: '用角色与动作还原一个公开示例，比用试点规模代替调用链更接近材料本身。计划覆盖多少事项，与某一次调用是否完成，属于不同问题。',
    regulation: '闭环图帮助定位每个环节产生的记录与后续接续。跨区事件需要按发生时间阅读，不能因报道较晚而将事件日期改写为发布日期。',
    evidence: '同一主线可以有两种证据对象：公开报道回答办理变化，稿内访谈回答组织机制。共同阅读有助于提出问题，不能自动组成同一企业的完整事件链。'
  });
  function refButton([kind,id]) {
    let title, metadata;
    if(kind==='article') {
      const m=story().excerptMeta[id];
      if(!m || !story().excerpts[id]) throw new Error('GovSupplement: missing paragraph '+id);
      title=m.object; metadata=m.label+' / 用户稿件非空段落';
    } else {
      const r=record(kind==='source'?'sources':'claims',id);
      title=r.title; metadata=kind==='source'?r.publisher+' · '+r.publishedDate:r.period+' · '+r.unit;
    }
    return `<button type="button" class="gs-reference" data-action="${kind}:${id}" aria-label="${E('核读 '+id+' '+title)}"><span class="gs-reference-id">${id} ↗</span><strong>${E(title)}</strong><small>${E(metadata)}</small></button>`;
  }
  function assertTopic(topic) {
    if(!Object.hasOwn(drawers,topic)) throw new Error('GovSupplement: unknown topic '+String(topic));
  }
  function svg(topic) { assertTopic(topic); return drawers[topic](); }
  function render(topic) {
    assertTopic(topic);
    return `<section class="gs-board dv-panel" data-supplement-topic="${topic}"><div class="gs-toolbar" role="group" aria-label="结构图查看尺寸"><span>结构图 <small>点击节点核读材料</small></span><div class="gs-zoom-controls">${[1,1.25,1.5].map(z=>`<button type="button" data-gs-control="zoom" data-gs-scale="${z}" aria-label="结构图显示为${Math.round(z*100)}%" aria-pressed="${z===1}">${Math.round(z*100)}%</button>`).join('')}</div></div><figure class="gs-figure"><div class="gs-scroll" tabindex="0" role="region" aria-label="${E(names[topic])}；可放大后横向滚动查看">${svg(topic)}</div><figcaption><span class="gs-legend-solid">实线 / 已描述的关系</span><span class="gs-legend-dashed">虚线 / 研究对读</span><span>连线宽度不表示业务量</span></figcaption></figure><aside class="gs-reading" aria-label="本图阅读说明"><span>怎样读这张图</span><p>${E(explanations[topic])}</p></aside><section class="gs-sources" aria-label="原始出处与稿内语境"><h4>沿图核读原始材料</h4><div class="gs-references">${references[topic].map(refButton).join('')}</div></section></section>`;
  }
  window.GovSupplement = Object.freeze({ names, render, svg });
})();
