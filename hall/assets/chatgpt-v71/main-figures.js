/* Original vector figures identify existing case objects. No statistics or completion states. */
(()=>{'use strict';
 const esc=s=>window.GovCharts.esc(s);
 const labels={submission:'统一提交的申请材料',survey:'联合踏勘与现场定位',payment:'核定与缴费',result:'办结文件',claim:'具体主张的数值与条件记录',certificate:'核发的证照证明',internal:'内部流转批复文件',submitted:'申请人已提交材料',report:'社会机构报告',system:'分属的原业务系统',plan:'检查计划',record:'检查扫码与记录',feedback:'跟踪与反馈',statistics:'运行统计',source:'原始公开出处',interview:'稿内组织机制访谈'};
 const paper='fill="url(#v71paper)" stroke="currentColor" stroke-width="1.2"';
 const sheet=`<path d="M9 5H27L35 13V35H9Z" ${paper}/><path d="M27 5V13H35" fill="none" stroke="currentColor" stroke-width="1.2"/>`;
 const line=d=>`<path d="${d}" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"/>`;
 const shapes={
  submission:sheet+line('M14 16H24M14 21H28M14 26H23')+`<path d="M5 32H39L36 40H8Z" fill="url(#v71glass)" stroke="currentColor" stroke-width="1.2"/>`,
  survey:`<path d="M5 27L16 23L27 28L39 24V37L27 41L16 36L5 40Z" ${paper}/>`+line('M16 24V36M27 29V40')+`<path d="M22 3C15 3 12 12 16 17L22 25L28 17C33 11 29 3 22 3Z" fill="url(#v71glass)" stroke="currentColor" stroke-width="1.4"/><circle cx="22" cy="11" r="3" fill="none" stroke="currentColor" stroke-width="1.4"/>`,
  payment:`<rect x="5" y="7" width="27" height="28" rx="3" ${paper}/>`+line('M10 13H25M10 19H21M10 25H19')+`<circle cx="32" cy="31" r="9" fill="url(#v71glass)" stroke="currentColor" stroke-width="1.4"/>`+line('M28 26L32 30L36 26M32 30V36M28 31H36M28 34H36'),
  result:sheet+line('M14 16H24M14 21H24')+`<path d="M31 24L40 28V33C40 38 34 41 31 42C27 40 22 38 22 33V28Z" fill="url(#v71glass)" stroke="currentColor" stroke-width="1.3"/>`+line('M26 32L30 35L36 29'),
  claim:sheet+line('M14 16H25M14 21H27M14 26H23')+`<path d="M25 27H41V40H25Z" fill="url(#v71glass)" stroke="currentColor" stroke-width="1.2"/>`+line('M29 31H37M29 35H34'),
  certificate:sheet+line('M14 16H29M14 21H24')+`<circle cx="27" cy="29" r="6" fill="url(#v71glass)" stroke="currentColor" stroke-width="1.3"/>`+line('M24 34L23 41L27 39L31 41L30 34'),
  internal:`<path d="M13 3H31L39 11V31H13Z" fill="#1c3448" stroke="currentColor" stroke-opacity=".5" stroke-width="1.2"/>`+sheet+line('M14 17H26M14 22H23M3 38H20M16 34L20 38L16 42'),
  submitted:sheet+line('M14 16H28M14 21H25M14 26H20')+`<path d="M5 29H16L20 33H39V41H5Z" fill="url(#v71glass)" stroke="currentColor" stroke-width="1.3"/>`,
  report:sheet+line('M14 16H28M14 30V24M20 30V19M26 30V23')+`<path d="M30 35H42V42H30Z" fill="url(#v71glass)" stroke="currentColor" stroke-width="1.1"/>`+line('M33 35V42M37 35V42'),
  system:`<rect x="4" y="5" width="36" height="25" rx="3" ${paper}/>`+line('M4 12H40M10 9H10.1M15 9H15.1M10 18H21M10 23H29M22 30V36M15 37H29')+`<rect x="30" y="22" width="11" height="19" rx="2" fill="url(#v71glass)" stroke="currentColor" stroke-width="1.2"/>`+line('M33 27H38M33 31H38M33 35H38'),
  plan:sheet+line('M14 16H28M14 21H23M14 27H25M12 3H24V8H12')+`<rect x="29" y="28" width="12" height="13" rx="2" fill="url(#v71glass)" stroke="currentColor"/>`+line('M32 33H38M32 37H36'),
  record:`<rect x="7" y="3" width="24" height="38" rx="4" ${paper}/>`+line('M13 8H24M15 36H23M12 15H17V20H12ZM21 15H26V20H21ZM12 24H17V29H12ZM21 25H26V29')+`<path d="M29 18H40V29H29Z" fill="url(#v71glass)" stroke="currentColor"/>`+line('M28 23H41'),
  feedback:`<path d="M4 8H34V29H20L13 35V29H4Z" ${paper}/>`+line('M10 15H27M10 21H22')+`<path d="M25 27H41V39H34L29 43V39H25Z" fill="url(#v71glass)" stroke="currentColor" stroke-width="1.2"/>`+line('M29 32H37'),
  statistics:`<path d="M5 5H39V35H5Z" ${paper}/>`+line('M11 28V22H16V28M20 28V16H25V28M29 28V11H34V28M22 35V40M15 41H29'),
  source:sheet+line('M14 16H28M14 21H24M14 26H26')+`<circle cx="32" cy="31" r="7" fill="url(#v71glass)" stroke="currentColor" stroke-width="1.3"/>`+line('M37 36L42 41'),
  interview:`<path d="M3 6H31V25H17L9 32V25H3Z" ${paper}/>`+line('M8 13H25M8 18H20')+`<circle cx="32" cy="26" r="5" fill="url(#v71glass)" stroke="currentColor"/><path d="M23 41V38C23 28 41 28 41 38V41Z" fill="url(#v71glass)" stroke="currentColor"/>`
 };
 function figure(x,y,type,size=36,color='#a4e3f4'){
  if(!shapes[type])throw Error('Unknown business figure '+type);
  return `<g data-main-object="${esc(type)}" role="img" aria-label="${esc(labels[type])}" transform="translate(${x} ${y}) scale(${size/44})" color="${color}"><title>${esc(labels[type])} / 业务对象示意</title><ellipse cx="22" cy="42" rx="20" ry="2" fill="#020b15" fill-opacity=".4"/>${shapes[type].replaceAll('currentColor',color)}</g>`;
 }
 function relation(x,y,id,color='#e8cea0'){
  const start=`<rect x="2" y="4" width="15" height="14" rx="2" fill="#a4e3f4" fill-opacity=".1" stroke="#a4e3f4" stroke-width="1"/>`;
  const associations={items:line('M18 11H28M28 4V18M28 4H40M28 18H40')+`<rect x="40" y="0" width="22" height="8" rx="1" fill="none" stroke="currentColor"/><rect x="40" y="14" width="22" height="8" rx="1" fill="none" stroke="currentColor"/>`,process:line('M18 11H35')+`<path d="M37 2H62V20H37Z" fill="none" stroke="currentColor"/>`+line('M42 7H55M42 12H55M42 17H50'),data:line('M18 11H34')+`<path d="M47 1L61 5V11C61 17 54 21 47 23C40 21 34 17 34 11V5Z" fill="none" stroke="currentColor"/>`+line('M40 11L45 16L54 7'),regulation:line('M18 11H35')+`<rect x="36" y="3" width="26" height="17" rx="2" fill="none" stroke="currentColor"/>`+line('M36 8H62M43 13H47M51 13H56')};
  if(!associations[id])throw Error('Unknown organization association '+id);
  return `<g data-main-association="${id}" transform="translate(${x} ${y})" color="${color}" aria-hidden="true">${start}${associations[id].replaceAll('currentColor',color)}</g>`;
 }
 function defs(){return `<defs><linearGradient id="v71paper" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#c1dbea" stop-opacity=".2"/><stop offset="1" stop-color="#46728f" stop-opacity=".05"/></linearGradient><linearGradient id="v71glass" x2=".6" y2="1"><stop stop-color="#5d9bae" stop-opacity=".3"/><stop offset="1" stop-color="#183b50" stop-opacity=".35"/></linearGradient></defs>`;}
 window.GovMainFigures=Object.freeze({figure,relation,defs});
})();
