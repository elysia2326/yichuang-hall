/* Original relief objects for the application/back-office case diagram.
 * Paper marks and interface rails are illustrative, not observed form fields,
 * equipment, software screenshots, record counts or completed workflow states.
 * Both systems remain separate; evidence text and routes come from artwork.js.
 */
(() => {
  'use strict';
  const revision='chatgpt-v77';
  const tag=(kind,body)=>`<g data-semantic-object="${kind}" data-semantic-revision="${revision}" aria-hidden="true">${body}</g>`;
  function defs(){return `<defs>
    <linearGradient id="v77-paper" x1="0" y1="0" x2=".7" y2="1"><stop stop-color="#e1e9f4"/><stop offset=".4" stop-color="#cbd8e8"/><stop offset="1" stop-color="#a7bacf"/></linearGradient>
    <linearGradient id="v77-paper-edge" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#c5d6e6"/><stop offset=".48" stop-color="#a2b5c9"/><stop offset="1" stop-color="#6e859c"/></linearGradient>
    <linearGradient id="v77-fold" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f4f8ff"/><stop offset=".42" stop-color="#b7c8dc"/><stop offset="1" stop-color="#6c8aac"/></linearGradient>
    <linearGradient id="v77-titanium" x1="0" y1="0" x2="1" y2=".2"><stop stop-color="#1c2f4c"/><stop offset=".14" stop-color="#486a91"/><stop offset=".34" stop-color="#9bb6d5"/><stop offset=".48" stop-color="#2a476d"/><stop offset="1" stop-color="#0c1c34"/></linearGradient>
    <linearGradient id="v77-screen" x1="0" y1="0" x2=".6" y2="1"><stop stop-color="#1c3f67"/><stop offset=".4" stop-color="#10253e"/><stop offset="1" stop-color="#091627"/></linearGradient>
    <linearGradient id="v77-toolbar" x1="0" y1="0" x2="1" y2=".25"><stop stop-color="#426e99"/><stop offset=".3" stop-color="#2b4f79"/><stop offset=".64" stop-color="#1e395e"/><stop offset="1" stop-color="#142b48"/></linearGradient>
    <linearGradient id="v77-screen-rim"><stop stop-color="#bfd8f2" stop-opacity=".85"/><stop offset=".2" stop-color="#91b2db" stop-opacity=".6"/><stop offset=".57" stop-color="#3c5e85" stop-opacity=".2"/><stop offset="1" stop-color="#a4c1de" stop-opacity=".7"/></linearGradient>
    <linearGradient id="v77-screen-glass" x1="0" y1="0" x2="1" y2=".7"><stop stop-color="#e4f0ff" stop-opacity=".02"/><stop offset=".24" stop-color="#c5ddff" stop-opacity=".06"/><stop offset=".3" stop-color="#c5ddff" stop-opacity=".012"/><stop offset="1" stop-color="#c5ddff" stop-opacity="0"/></linearGradient>
  </defs>`;}
  function form(x,y,w,h){
    const cut=27,edge=4,right=w-edge,bottom=h-edge,shape=`M0 0H${right-cut}L${right} ${cut}V${bottom}H0Z`;
    return tag('unified-application-sheet',`<g transform="translate(${x} ${y})" data-application-material="pearl-paper-relief">
      <path d="M2 8H${right-cut+4}L${w} ${cut+9}V${h}H4Z" fill="#020b17" fill-opacity=".8"/>
      <path d="M0 ${bottom}H${right}L${w} ${h}H7Z" fill="url(#v77-paper-edge)"/>
      <path d="M${right} ${cut}L${w} ${cut+4}V${h}L${right} ${bottom}Z" fill="url(#v77-paper-edge)"/>
      <path d="${shape}" fill="url(#v77-paper)" stroke="#d2e5f5" stroke-width="1.1"/>
      <path d="M${right-cut} 0V${cut}H${right}" fill="url(#v77-fold)" stroke="#7595b5" stroke-opacity=".46"/>
      <path d="M${right-cut+1} ${cut+1}H${right-1}" stroke="#254364" stroke-opacity=".24"/>
      <path d="M1 1H${right-cut-1}M1 38V${bottom-1}" stroke="#f7fbff" stroke-opacity=".8"/>
      <path d="M24 35H${right-24}" stroke="#486584" stroke-opacity=".3"/>
      ${[53,82,111].map((top,i)=>`<rect x="25" y="${top}" width="53" height="5" rx="1" fill="#375775" fill-opacity=".75"/><rect x="94" y="${top-8}" width="${i===1?175:208}" height="22" rx="2" fill="#f2f6fc" fill-opacity=".28" stroke="#45637f" stroke-opacity=".3"/><path d="M97 ${top+12}H${i===1?265:298}" stroke="#748faa" stroke-opacity=".22"/>`).join('')}
      <path d="M25 139H${right-25}" stroke="#56718d" stroke-opacity=".24"/>
      <path d="M25 ${h-56}H${right-25}" stroke="#56718d" stroke-opacity=".22"/>
      <path d="M${right-18} ${h-29}v10h-20" fill="none" stroke="#284c70" stroke-opacity=".45"/>
      <path d="M9 ${bottom+1}H${right-7}M12 ${bottom+2}H${right-3}" stroke="#d2e3f4" stroke-opacity=".22" stroke-width=".65"/>
    </g>`);
  }
  function system(x,y,w,h){
    const edge=8,right=w-edge,bottom=h-edge,shape=`M8 0H${right-9}L${right} 9V${bottom-7}L${right-7} ${bottom}H0V8Z`;
    return tag('independent-business-interface',`<g transform="translate(${x} ${y})" data-system-material="independent-glass-relief">
      <path d="M4 6H${right}L${w} 15V${h-8}L${w-8} ${h}H8L0 ${bottom}Z" fill="#020914" fill-opacity=".9"/>
      <path d="M${right} 9L${w} 15V${h-8}L${right-7} ${bottom}L${right} ${bottom-7}Z" fill="url(#v77-titanium)"/>
      <path d="M0 ${bottom}H${right-7}L${w-8} ${h}H8Z" fill="url(#v77-titanium)"/>
      <path d="${shape}" fill="url(#v77-screen)" stroke="url(#v77-screen-rim)" stroke-width="1.2"/>
      <path d="M8 0H${right-9}L${right} 9V42H0V8Z" fill="url(#v77-toolbar)"/>
      <path d="${shape}" fill="url(#v77-screen-glass)"/>
      <path d="M12 2H${right-11}L${right-2} 10" fill="none" stroke="#c3e2ff" stroke-opacity=".6" stroke-width=".9"/>
      <path d="M1 42H${right-1}" stroke="#a3c7e9" stroke-opacity=".28"/>
      <path d="M1 49V${bottom-7}" stroke="#8db5de" stroke-width="2" stroke-opacity=".6"/>
      <rect x="${w-159}" y="20" width="7" height="7" rx="1" fill="none" stroke="#a9c9d9" stroke-opacity=".5"/>
      <path d="M${w-177} 26h7" stroke="#a9c9d9" stroke-opacity=".5"/>
      <path d="M17 ${bottom-3}H${right-17}" stroke="#6e92b7" stroke-opacity=".27"/>
      <path d="M10 ${h-2}H${w-12}" stroke="#a4c6e6" stroke-opacity=".26"/>
    </g>`);
  }
  window.GovApplicationExhibit=Object.freeze({revision,defs,form,system,paperInk:'#172e49',paperMuted:'#2c4561'});
})();
