/* Original vector objects for two case exhibits. Surface marks are decoration,
 * not observed software UI, operating status, record counts, or measured flows.
 * Text and evidence are supplied by the existing drawing, never by this module.
 */
(() => {
  'use strict';
  const revision='chatgpt-v74';
  const tag=(kind,body)=>`<g data-semantic-object="${kind}" data-semantic-revision="${revision}" aria-hidden="true">${body}</g>`;
  function defs(){return `<defs>
    <linearGradient id="v74-paper" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#346984"/><stop offset=".32" stop-color="#234b64"/><stop offset="1" stop-color="#10283e"/></linearGradient>
    <linearGradient id="v74-fold" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#b8e6f2"/><stop offset="1" stop-color="#39728c"/></linearGradient>
    <linearGradient id="v74-interface" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#182f44"/><stop offset=".46" stop-color="#0c1d31"/><stop offset="1" stop-color="#071525"/></linearGradient>
    <linearGradient id="v74-toolbar"><stop stop-color="#326483"/><stop offset=".5" stop-color="#21425c"/><stop offset="1" stop-color="#172f45"/></linearGradient>
    <linearGradient id="v74-edge" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#bdeafa" stop-opacity=".9"/><stop offset=".3" stop-color="#78afc7" stop-opacity=".3"/><stop offset=".66" stop-color="#2d5975" stop-opacity=".15"/><stop offset="1" stop-color="#86bccd" stop-opacity=".6"/></linearGradient>
    <linearGradient id="v74-condition" x1="0" y1="0" x2="1" y2=".5"><stop stop-color="#173b53"/><stop offset=".46" stop-color="#102c41"/><stop offset="1" stop-color="#0e2538"/></linearGradient>
    <linearGradient id="v74-method" x1="0" y1="0" x2=".75" y2="1"><stop stop-color="#246180"/><stop offset=".25" stop-color="#164562"/><stop offset="1" stop-color="#102b43"/></linearGradient>
    <linearGradient id="v74-glint"><stop stop-color="#d5f7ff" stop-opacity="0"/><stop offset=".45" stop-color="#a7e4f6" stop-opacity=".8"/><stop offset="1" stop-color="#d5f7ff" stop-opacity="0"/></linearGradient>
  </defs>`;}
  function form(x,y,w,h){
    const cut=23,shape=`M0 0H${w-cut}L${w} ${cut}V${h}H0Z`;
    return tag('unified-application-sheet',`<g transform="translate(${x} ${y})">
      <path d="M13 -8H${w+7}V${h-9}H13Z" fill="#10253a" stroke="#648eaa" stroke-opacity=".25"/>
      <path d="M6 -4H${w+3}V${h-4}H6Z" fill="#183c54" stroke="#91b5c9" stroke-opacity=".36"/>
      <path d="M3 4H${w-cut+3}L${w+3} ${cut+4}V${h+4}H3Z" fill="#031222" fill-opacity=".8"/>
      <path d="${shape}" fill="url(#v74-paper)" stroke="url(#v74-edge)" stroke-width="1.2"/>
      <path d="M${w-cut} 0V${cut}H${w}" fill="url(#v74-fold)" stroke="#bcdeeb" stroke-opacity=".45"/>
      <path d="M1 1H${w-cut-1}" stroke="#b5eaf6" stroke-opacity=".7"/>
      <path d="M1 39V${h-1}" stroke="#97cee3" stroke-opacity=".36"/>
      <path d="M24 34H${w-24}" stroke="#b3d8e7" stroke-opacity=".35"/>
      ${[53,82,111].map((top,i)=>`<rect x="25" y="${top}" width="53" height="5" rx="1" fill="#b6d6e7" fill-opacity=".8"/><rect x="94" y="${top-8}" width="${i===1?175:208}" height="22" rx="2" fill="#081a2b" fill-opacity=".32" stroke="#90bfda" stroke-opacity=".19"/>`).join('')}
      <path d="M25 139H${w-25}" stroke="#accfdf" stroke-opacity=".15"/>
      <path d="M25 ${h-50}H${w-25}" stroke="#97bdd1" stroke-opacity=".14"/>
      <path d="M${w-18} ${h-29}v10h-20" fill="none" stroke="#9ee2ec" stroke-opacity=".5"/>
    </g>`);
  }
  function system(x,y,w,h){
    return tag('independent-business-interface',`<g transform="translate(${x} ${y})">
      <rect x="3" y="4" width="${w}" height="${h}" rx="5" fill="#020b17" fill-opacity=".8"/>
      <rect width="${w}" height="${h}" rx="5" fill="url(#v74-interface)" stroke="url(#v74-edge)" stroke-width="1.2"/>
      <path d="M5 0H${w-5}Q${w} 0 ${w} 5V42H0V5Q0 0 5 0Z" fill="url(#v74-toolbar)"/>
      <path d="M1 42H${w-1}" stroke="#9dcbdf" stroke-opacity=".28"/>
      <path d="M8 1H${w-8}" stroke="url(#v74-glint)"/>
      <path d="M1 48V${h-7}" stroke="#7ebbcf" stroke-width="2" stroke-opacity=".66"/>
      <rect x="${w-159}" y="20" width="7" height="7" rx="1" fill="none" stroke="#a9c9d9" stroke-opacity=".5"/>
      <path d="M${w-177} 26h7" stroke="#a9c9d9" stroke-opacity=".5"/>
      <path d="M17 ${h-10}H${w-17}" stroke="#416987" stroke-opacity=".28"/>
    </g>`);
  }
  function materialSheet(x,y,w,h,accent){
    const cut=14;
    return tag('material-category-sheet',`<g transform="translate(${x} ${y})">
      <path d="M5 4H${w-cut+4}L${w+4} ${cut+4}V${h+3}H5Z" fill="#020b16" fill-opacity=".7"/>
      <path d="M0 0H${w-cut}L${w} ${cut}V${h}H0Z" fill="url(#v74-interface)" stroke="url(#v74-edge)"/>
      <path d="M${w-cut} 0V${cut}H${w}" fill="#284e65" stroke="#8bb9cc" stroke-opacity=".34"/>
      <path d="M0 1H${w-cut}" stroke="${accent}" stroke-opacity=".36"/>
      <path d="M48 12V${h-12}" stroke="#8bb9cc" stroke-opacity=".17"/>
      <path d="M12 ${h-1}H${w-16}" stroke="#6698b4" stroke-opacity=".19"/>
    </g>`);
  }
  function coupling(x,y,w,h,result=false){
    const cut=10,shape=result?`M${cut} 0H${w}V${h}H${cut}L0 ${h/2}Z`:`M0 0H${w-cut}L${w} ${h/2}L${w-cut} ${h}H0Z`;
    return `<g data-diagram-material="${result?'conditional-method':'conditional-source'}" data-diagram-material-revision="${revision}" data-semantic-object="${result?'method-receiver':'condition-port'}" aria-hidden="true" transform="translate(${x} ${y})">
      <path d="${shape}" transform="translate(0 2)" fill="#030f1e" fill-opacity=".7"/>
      <path d="${shape}" fill="url(#${result?'v74-method':'v74-condition'})" stroke="url(#v74-edge)" stroke-opacity="${result?.9:.56}"/>
      <path d="M${result?cut+8:8} 1H${w-(result?8:cut+8)}" stroke="${result?'#98e7fa':'#799fb4'}" stroke-opacity="${result?.6:.24}"/>
      ${result?`<path d="M${w-16} 10V${h-10}" stroke="#9fe9ef" stroke-opacity=".3"/>`:`<path d="M43 10V${h-10}" stroke="#8bb9cc" stroke-opacity=".19"/>`}
    </g>`;
  }
  function splitEmphasis(){
    // This is the SAME two-branch P104 relationship, not extra events or logs.
    const a='M435 371H510Q527 371 527 348V312Q527 297 547 297H681';
    const b='M527 371V425Q527 438 547 438H681';
    return tag('parallel-field-routing',`<g data-routing-decoration="same-p104-paths">
      ${[a,b].map(d=>`<path d="${d}" fill="none" stroke="#6ddaf2" stroke-width="9" stroke-opacity=".065"/><path d="${d}" fill="none" stroke="#69d6e7" stroke-width="4" stroke-opacity=".13"/>`).join('')}
      <circle cx="527" cy="371" r="9" fill="#0b2b42" stroke="#8ad8e9" stroke-opacity=".75"/>
      <circle cx="527" cy="371" r="3" fill="#cdf1f5"/>
      <path d="M435 363v16M674 289v16M674 430v16" stroke="#92dbea" stroke-opacity=".7"/>
    </g>`);
  }
  function matchPort(y){return tag('conditional-match-junction',`<circle cx="972" cy="${y}" r="17" fill="#76b8ce" fill-opacity=".04" stroke="#83cbdf" stroke-opacity=".27"/><path d="M944 ${y-8}v16M1000 ${y-8}v16" stroke="#88d0e2" stroke-opacity=".6"/>`);}
  function responsibilityGap(){
    // The two existing questions associate with an OPEN responsibility shield.
    // There is no directed workflow, score, completed duty or named responsible unit.
    return tag('open-responsibility-questions',`<g data-question-association="P113">
      <path d="M1674 377H1713Q1732 377 1732 391V399H1757M1740 420H1757" fill="none" stroke="#c6ae84" stroke-opacity=".42"/>
      <path d="M1767 355L1805 341L1843 355V392Q1843 426 1805 449Q1767 426 1767 392V372" fill="#ac8555" fill-opacity=".05" stroke="#dcbd8b" stroke-opacity=".62" stroke-width="1.4"/>
      <path d="M1776 361L1805 350L1834 361V391Q1834 418 1805 438" fill="none" stroke="#dec394" stroke-opacity=".16"/>
      <path d="M1794 380C1794 365 1818 365 1818 380C1818 388 1806 388 1806 398V402" fill="none" stroke="#ead5af" stroke-width="3" stroke-linecap="round"/>
      <circle cx="1806" cy="412" r="2" fill="#ead5af"/>
      <path d="M1756 366h22M1770 354v24" stroke="#dabe96" stroke-opacity=".5" stroke-width="1.2"/>
    </g>`);
  }
  window.GovSemanticObjects=Object.freeze({revision,defs,form,system,materialSheet,coupling,splitEmphasis,matchPort,responsibilityGap});
})();
