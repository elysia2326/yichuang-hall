/* Shared SVG material for hall nodes and expanded diagrams. Decorative only;
 * no filter, image dependency, business data, new event sequence or animation.
 */
(() => {
  'use strict';
  const safe = value => {
    if (!/^[a-zA-Z][a-zA-Z0-9-]*$/.test(value)) throw Error('Invalid material namespace');
    return value;
  };
  function defs(prefix) {
    const p=safe(prefix);
    return `<defs>
      <linearGradient id="${p}-face" x1="0" y1="0" x2=".65" y2="1"><stop stop-color="#304867"/><stop offset=".22" stop-color="#233650"/><stop offset=".64" stop-color="#15253e"/><stop offset="1" stop-color="#0d192d"/></linearGradient>
      <linearGradient id="${p}-warm" x1="0" y1="0" x2=".65" y2="1"><stop stop-color="#353c50"/><stop offset=".24" stop-color="#283145"/><stop offset=".65" stop-color="#1a263b"/><stop offset="1" stop-color="#111d31"/></linearGradient>
      <linearGradient id="${p}-edge" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#c2d9eb" stop-opacity=".62"/><stop offset=".3" stop-color="#91a9c2" stop-opacity=".24"/><stop offset=".7" stop-color="#526e91" stop-opacity=".12"/><stop offset="1" stop-color="#92b2d1" stop-opacity=".38"/></linearGradient>
      <radialGradient id="${p}-reflection" cx="10%" cy="0%" r="88%"><stop stop-color="#e2f0ff" stop-opacity=".13"/><stop offset=".36" stop-color="#b6cce7" stop-opacity=".025"/><stop offset="1" stop-color="#91aaca" stop-opacity="0"/></radialGradient>
      <linearGradient id="${p}-lip" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#7194b2" stop-opacity=".25"/><stop offset=".35" stop-color="#2d4766" stop-opacity=".4"/><stop offset="1" stop-color="#071426" stop-opacity=".9"/></linearGradient>
    </defs>`;
  }
  function tile(x,y,w,h,{prefix='hall-v65',accent='#a4e3f4',warm=false,quiet=false}={}) {
    const p=safe(prefix);
    if (![x,y,w,h].every(Number.isFinite)||w<24||h<24) throw Error('Invalid diagram tile geometry');
    const cut=Math.min(6,h*.12),shape=`M${cut} 0H${w-cut}L${w} ${cut}V${h-cut}L${w-cut} ${h}H0V${cut}Z`;
    return `<g transform="translate(${x} ${y})" data-diagram-material="glass-bevel" data-diagram-material-revision="chatgpt-v65" aria-hidden="true">
      <path d="M0 ${h-cut}V${h+4}H${w-cut}L${w+2} ${h-cut+3}V${cut+3}L${w} ${cut}V${h-cut}L${w-cut} ${h}H0Z" fill="#020b19" fill-opacity=".65"/>
      <path d="${shape}" fill="url(#${p}-${warm?'warm':'face'})" stroke="url(#${p}-edge)" stroke-width="1" stroke-opacity="${quiet?.65:.95}"/>
      <path d="${shape}" fill="url(#${p}-reflection)" opacity="${quiet?.55:1}"/>
      <path d="M${cut+2} 2H${w-cut-3}L${w-2} ${cut+2}" fill="none" stroke="#d9edf9" stroke-opacity="${quiet?.16:.3}" stroke-width=".75"/>
      <path d="M2 ${cut+8}V${h-cut-3}" stroke="${accent}" stroke-opacity="${quiet?.18:.36}" stroke-width="1.3"/>
      ${h>=64?`<path d="M5 ${h-3}H${w-cut-2}L${w-3} ${h-cut-1}" fill="none" stroke="#7091b4" stroke-opacity=".18" stroke-width=".7"/>`:''}
      <path d="M1 ${h}H${w-cut}L${w+1} ${h-cut+1}V${h-cut+4}L${w-cut} ${h+3}H1Z" fill="url(#${p}-lip)"/>
    </g>`;
  }
  window.GovDiagramMaterial=Object.freeze({defs,tile});
})();
