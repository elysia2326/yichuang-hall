/* Original architectural mechanism illustration. Image is Blender-built,
 * not a reconstructed government hall or an observed enterprise workflow.
 * Facts, source links and responsibility relationships remain vector labels.
 */
(() => {
  'use strict';
  function scene({image,text:T,colors:V}) {
    const asset=image||'assets/chatgpt-v106-items/organization_lettering_v106_wide.png?rev=chatgpt-v123';
    let s=T(60,171,'组织剖面 / 前台合 → 后台分',18,V.ink,700)+T(1358,171,'稿内访谈 / A、B为系统示意',14,V.muted,400,'end');
    s+='<path d="M60 190H1358" stroke="#7893ae" stroke-opacity=".3"/>';
    s+=T(84,226,'前台 / 按完整需求组织',21,V.cyan,700)+T(997,226,'后台 / 按原系统分别审批',21,V.gold,700);
    s+='<g data-spatial-mechanism="items" role="img" aria-label="案例机制的原创建筑剖面示意：统一柜台与两间独立审批工作区，人员及纸张属于设计示意，非实际建筑或企业日志">';
    s+='<image data-spatial-render="blender-v106" x="318" y="244" width="700" height="250" href="'+asset+'" preserveAspectRatio="xMidYMid meet" aria-hidden="true"/>';
    s+='</g>';
    s+=T(84,287,'统一申请信息',22,V.ink,700)+T(84,332,'统一告知 · 收件 · 流转',19,V.ink,500)+T(84,429,'入口组织成一个办事场景',15,V.muted);
    s+='<path d="M84 350H312M84 403H312" stroke="'+V.cyan+'" stroke-opacity=".18"/>';
    s+='<g data-items-parallel-routing="P104" role="img" aria-label="统一字段分别推送到原系统A与B；两支并列，不表示先后，也不是指定企业日志"><path data-routing-branch="A" d="M338 326H355Q366 326 366 312V250Q366 238 378 238H1000Q1014 238 1014 252V312H1022" fill="none" stroke="'+V.cyan+'" stroke-width="1.7" stroke-dasharray="6 6" marker-end="url(#v7arrow)"/><path data-routing-branch="B" d="M366 326V498Q366 510 378 510H1000Q1014 510 1014 496V443H1022" fill="none" stroke="'+V.cyan+'" stroke-width="1.7" stroke-dasharray="6 6" marker-end="url(#v7arrow)"/></g>';
    s+=T(442,232,'字段统一',16,V.cyan,500)+T(747,232,'分别推送',16,V.cyan,500)+T(562,531,'组织交接',13,V.muted,400,'middle')+T(758,504,'空间为机制示意',13,V.muted,400,'middle');
    [267,399].forEach((y,i)=>{
      const system=i?'B':'A';
      s+='<g data-items-system="'+system+'" data-observation-source="P104" role="group" aria-label="原业务系统'+system+'：依相应权限审查；进度与结果需衔接；A、B为访谈机制示意"><rect x="1022" y="'+y+'" width="330" height="100" rx="3" fill="#0a1b2d" fill-opacity=".72" stroke="'+V.blue+'" stroke-opacity=".26"/>';
      s+=T(1038,y+28,'原业务系统 '+system,21,V.ink,700)+T(1334,y+27,'P104',12,V.gold,500,'end')+T(1334,y+83,'↗',14,V.cyan,500,'end');
      s+='<g data-system-role="review">'+T(1038,y+59,'依相应权限审查',18,V.gold,500)+'</g><g data-system-role="handoff">'+T(1038,y+85,'进度与结果需衔接',17,V.muted)+'</g></g>';
    });
    s+='<g data-result-handoff="items" role="img" aria-label="职责关系示意：两套后台按各自权限分别审批，审批节奏与责任分属原部门（稿内P103）"><path d="M1352 312H1368V516H970V540M1352 444H1368" fill="none" stroke="'+V.gold+'" stroke-opacity=".7" stroke-width="1.8"/>';
    s+=T(1002,532,'分别审批 · 责任分属',16,V.gold,500)+T(683,531,'职责关系示意',12,V.muted,400,'start','data-semantic-caption="responsibility"')+'</g>';
    s+='<rect x="76" y="540" width="1269" height="40" rx="3" fill="#5fd4ff" fill-opacity=".06" stroke="#9ff3ff" stroke-opacity=".25" data-result-band="items"/>';
    s+=T(92,566,'成效 / P074',17,V.cyan,700)+T(266,566,'围绕“开办一家企业”，各部门事项被拆解重组，企业只需对应单一事项即可办结。',20,V.ink,500)+T(1329,565,'读原文 ↗',16,V.cyan,500,'end');
    s+='<g data-responsibility-source="P103">';
    s+=T(1000,504,'放大观察 ↗',14,V.cyan,500,'end','data-spatial-open="items"');
    s+='</g>';
    return s;
  }
  window.GovSpatialCase=Object.freeze({revision:'chatgpt-v79',scene,mainHits:[
    {x:68,y:253,w:269,h:224,label:'统一受理如何接续后台',action:'tension:items'},
    {x:1022,y:267,w:330,h:100,label:'核对原业务系统分别运行的访谈',action:'article:P104'},
    {x:1022,y:399,w:330,h:100,label:'核对原业务系统分别运行的访谈',action:'article:P104'},
    {x:76,y:541,w:1269,h:39,label:'事项之越：核对稿内 P074',action:'article:P074'},
    {x:337,y:244,w:681,h:267,label:'放大前后台三维剖面',action:'model:items'}
  ]});
})();
