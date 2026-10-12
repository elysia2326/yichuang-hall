/* Work-object diagrams match the V83 mechanism props; they contain no business quantities. */
(()=>{'use strict';
const titles=['受理条件与审查标准的材料核对示意','保留的签批记录与层级接续示意','电话与协调记录的沟通补救示意'];
const paths=[
 'M4 5H24V33H4ZM8 12H19M8 18H19M8 24H16M20 13H39V39H20M25 20H34M25 26H32M39 32L48 43',
 'M5 5H32V24H5ZM10 29H37V10M15 34H42V15M20 39H47V20M10 11H27M10 17H22',
 'M4 8C2 18 9 33 20 39L28 32L22 26L17 29C11 24 9 21 9 17L13 13L9 7ZM29 6H47V24H29ZM33 11H43M33 16H42M33 21H39'
];
window.GovProcessObjects=Object.freeze({anchors:[0.14820846915245056, 0.3827361762523651, 0.6172638535499573, 0.851791501045227],render(i,x,y){return '<g data-backend-work-object="'+['review','signoff','coordination'][i]+'" role="img" aria-label="'+titles[i]+'"><title>'+titles[i]+'</title><g transform="translate('+x+' '+y+')"><rect x="-5" y="-4" width="60" height="52" rx="4" fill="#cbb58c0b"/><path d="'+paths[i]+'" fill="none" stroke="#cfbe9b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></g></g>';}});
})();
