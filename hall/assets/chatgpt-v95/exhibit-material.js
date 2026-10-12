/* V95 original exhibition plates with narrow specular rims and quieter faces. All lighting, machining lines and
 * glints are decorative: no values, process states, new hit areas or animations.
 * v72 gradient IDs remain stable for the existing drawing API. Revision is V95; optical highlights no longer sweep across content.
 * No filters, remote textures or additional render loop are required.
 */
(() => {
  'use strict';
  const revision='chatgpt-v95';
  function surface(x,y,w,h,accent='#8db4cf',role='support') {
    const main=role==='main',warm=role==='observation',metric=role==='metric',cut=main?16:8;
    const shape=`M${cut} 0H${w-cut}L${w} ${cut}V${h-cut}L${w-cut} ${h}H${cut}L0 ${h-cut}V${cut}Z`;
    const face=main?'v72-main':warm?'v72-observation':metric?'v72-metric':'v72-support';
    const rim=main?'v72-main-edge':'v72-side-edge';
    const signal=warm?'#d7bf94':main?'#a9d9fb':accent;
    return `<g transform="translate(${x} ${y})" data-material="layered-sapphire" data-surface-revision="${revision}" data-surface-role="${role}" data-exhibition-light="${main?'primary':warm?'interpretation':'secondary'}">
      <path data-recessed-shadow="decorative" d="M${cut} 3H${w-cut}L${w} ${cut+3}V${h-cut+3}L${w-cut} ${h+3}H${cut}L0 ${h-cut+3}V${cut+3}Z" fill="#020512" fill-opacity=".88"/>
      <path d="${shape}" fill="url(#${face})" stroke="url(#${rim})" stroke-width="${main?1.1:.8}"/>
      <path data-optical-bevel="upper" d="M${cut+1} 2H${w-cut-1}L${w-3} ${cut+1}L${w-7} ${cut+4}L${w-cut-5} 6H${cut+5}Z" fill="url(#v80-bevel-top)" fill-opacity="${main?.68:.34}"/>
      <path data-optical-bevel="left" d="M2 ${cut+1}L4 ${cut+3}V${h-cut-4}L2 ${h-cut-2}Z" fill="url(#v80-bevel-left)" fill-opacity="${main?.42:.18}"/>
      <path data-optical-bevel="lower" d="M${cut+3} ${h-4}H${w-cut-3}L${w-3} ${h-cut-1}L${w-1} ${h-cut}L${w-cut-1} ${h-1}H${cut+1}Z" fill="url(#v80-bevel-bottom)" fill-opacity="${main?.5:.24}"/>
      <path d="${shape}" fill="url(#v76-glass-reflection)" fill-opacity="${main?.8:.28}"/>
      <path data-polished-rim="top" d="M${cut+1} 1H${w-cut-1}L${w-1} ${cut+1}" fill="none" stroke="url(#v76-rim-specular)" stroke-width="${main?1:.7}" stroke-opacity="${main?.85:.4}"/>
      <path data-polished-rim="side" d="M${w-1} ${cut+7}V${h-cut-1}L${w-cut-1} ${h-1}" fill="none" stroke="#759bc5" stroke-width=".8" stroke-opacity="${main?.4:.17}"/>
      <path data-machined-base="true" d="M${cut+1} ${h-3}H${w-cut-2}L${w-2} ${h-cut-1}" fill="none" stroke="url(#v76-base-metal)" stroke-width="1" stroke-opacity="${main?.64:.36}"/>
      <path data-material-brush="decorative" d="M${cut+5} 4H${w-cut-8}" stroke="url(#v76-brush)" stroke-width="2" stroke-opacity=".4"/>
      <path data-local-specular="decorative" d="M${cut+3} 1H${Math.min(w-42,main?168:80)}" stroke="${signal}" stroke-width="1.1" stroke-opacity="${main?.7:.38}"/>
      <path d="M14 22V43" stroke="${signal}" stroke-width="${main?2.5:2}" stroke-opacity=".8"/>
      <path d="M28 ${Math.min(58,h*.3)}H${w-28}" stroke="${accent}" stroke-opacity="${main?.14:.08}"/>
    </g>`;
  }
  function defs(){return `<defs>
    <linearGradient id="v80-bevel-top" x2="0" y2="1"><stop stop-color="#b3c9e7" stop-opacity=".62"/><stop offset=".38" stop-color="#738db8" stop-opacity=".3"/><stop offset="1" stop-color="#142544" stop-opacity=".04"/></linearGradient>
    <linearGradient id="v80-bevel-left" x2="1" y2="0"><stop stop-color="#78b8fb" stop-opacity=".6"/><stop offset=".5" stop-color="#4e79c1" stop-opacity=".18"/><stop offset="1" stop-color="#142849" stop-opacity="0"/></linearGradient>
    <linearGradient id="v80-bevel-bottom" x2="0" y2="1"><stop stop-color="#071020"/><stop offset=".45" stop-color="#1b3056"/><stop offset=".85" stop-color="#709ad2" stop-opacity=".42"/><stop offset="1" stop-color="#102447"/></linearGradient>
    <linearGradient id="v72-main" x1="0" y1="0" x2=".65" y2="1"><stop stop-color="#1c3158"/><stop offset=".16" stop-color="#162446"/><stop offset=".52" stop-color="#101b35"/><stop offset="1" stop-color="#0b1429"/></linearGradient>
    <linearGradient id="v72-support" x1="0" y1="0" x2=".5" y2="1"><stop stop-color="#15223b"/><stop offset=".3" stop-color="#101a2f"/><stop offset="1" stop-color="#0c1426"/></linearGradient>
    <linearGradient id="v72-metric" x1="0" y1="0" x2=".7" y2="1"><stop stop-color="#193450"/><stop offset=".35" stop-color="#12253e"/><stop offset="1" stop-color="#0b192e"/></linearGradient>
    <linearGradient id="v72-observation" x1="0" y1="0" x2=".75" y2="1"><stop stop-color="#292b3f"/><stop offset=".22" stop-color="#202338"/><stop offset=".65" stop-color="#161b2f"/><stop offset="1" stop-color="#101627"/></linearGradient>
    <linearGradient id="v72-main-edge" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#b9e7fc" stop-opacity=".88"/><stop offset=".2" stop-color="#639cd2" stop-opacity=".55"/><stop offset=".58" stop-color="#294f83" stop-opacity=".3"/><stop offset="1" stop-color="#78a1c4" stop-opacity=".7"/></linearGradient>
    <linearGradient id="v72-side-edge" x1="0" y1="0" x2=".85" y2="1"><stop stop-color="#afcceb" stop-opacity=".45"/><stop offset=".3" stop-color="#6393c4" stop-opacity=".22"/><stop offset=".68" stop-color="#29416b" stop-opacity=".18"/><stop offset="1" stop-color="#739ac4" stop-opacity=".4"/></linearGradient>
    <linearGradient id="v76-glass-reflection" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#c2d7fa" stop-opacity=".035"/><stop offset=".08" stop-color="#bed5f6" stop-opacity=".013"/><stop offset=".28" stop-color="#7c9acc" stop-opacity="0"/><stop offset="1" stop-color="#7c9acc" stop-opacity="0"/></linearGradient>
    <linearGradient id="v76-rim-specular"><stop stop-color="#d5f0ff" stop-opacity=".9"/><stop offset=".18" stop-color="#85bbef" stop-opacity=".6"/><stop offset=".52" stop-color="#7d9dcb" stop-opacity=".16"/><stop offset=".9" stop-color="#83afdf" stop-opacity=".32"/><stop offset="1" stop-color="#c5e8ff" stop-opacity=".8"/></linearGradient>
    <linearGradient id="v76-base-metal" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#355b84"/><stop offset=".18" stop-color="#1c3658"/><stop offset=".48" stop-color="#101b31"/><stop offset=".75" stop-color="#213b5a"/><stop offset="1" stop-color="#477197"/></linearGradient>
    <pattern id="v76-brush" patternUnits="userSpaceOnUse" width="8" height="3"><path d="M0 .5H5M2 2H7" stroke="#cee4ff" stroke-opacity=".11" stroke-width=".5"/></pattern>
  </defs>`;}
  function shadeNodeDefs(svg){return svg
    .replace(/#304867/g,'#233b56').replace(/#233650/g,'#192b43').replace(/#15253e/g,'#112138').replace(/#0d192d/g,'#0c192d')
    .replace(/#353c50/g,'#2b3042').replace(/#283145/g,'#222a3d').replace(/#1a263b/g,'#182237').replace(/#111d31/g,'#101a2e')
    .replace(/stop-opacity="\.62"/g,'stop-opacity=".4"').replace(/stop-opacity="\.38"/g,'stop-opacity=".24"')
    .replace(/stop-opacity="\.13"/g,'stop-opacity=".045"').replace(/stop-opacity="\.025"/g,'stop-opacity=".012"');}
  function shadeConditionalDefs(svg){return svg
    .replace(/#245672/g,'#1b3a50').replace(/#183c55/g,'#152d42').replace(/#102b41/g,'#102338')
    .replace(/#2c6989/g,'#25516a').replace(/#235673/g,'#1d3f58').replace(/#12344f/g,'#142e45').replace(/#112a41/g,'#102237')
    .replace(/stop-opacity="\.7"/g,'stop-opacity=".5"').replace(/stop-opacity="\.065"/g,'stop-opacity=".025"').replace(/stop-opacity="\.035"/g,'stop-opacity=".012"');}
  function background(topic='overview'){
    const orbit=topic==='overview'?`<g data-exhibition-orbit="model-only" aria-hidden="true"><ellipse cx="960" cy="640" rx="590" ry="190" fill="none" stroke="url(#v76-orbit)" stroke-width="1.5"/><ellipse cx="960" cy="640" rx="610" ry="196" fill="none" stroke="url(#v76-orbit)" stroke-opacity=".26"/><path d="M382 672A590 190 0 0 0 1508 710" fill="none" stroke="#5c86b9" stroke-opacity=".14"/></g>`:'';
    return `<defs><radialGradient id="v76-space" cx="51%" cy="45%" r="71%"><stop stop-color="#162746"/><stop offset=".4" stop-color="#0d172c"/><stop offset="1" stop-color="#070e20"/></radialGradient><radialGradient id="v76-top-light" cx="50%" cy="0%" r="70%"><stop stop-color="#7c9bda" stop-opacity=".13"/><stop offset=".38" stop-color="#274a89" stop-opacity=".04"/><stop offset="1" stop-color="#071323" stop-opacity="0"/></radialGradient><linearGradient id="v76-orbit"><stop stop-color="#6997d2" stop-opacity=".03"/><stop offset=".25" stop-color="#bddafb" stop-opacity=".27"/><stop offset=".65" stop-color="#728ec6" stop-opacity=".14"/><stop offset="1" stop-color="#405f96" stop-opacity=".03"/></linearGradient></defs><g data-background-revision="${revision}" aria-hidden="true"><rect width="1920" height="1080" fill="url(#v76-space)"/><rect width="1920" height="1080" fill="url(#v76-top-light)"/><g data-optical-background="decorative-only" aria-hidden="true"><path d="M0 1006L520 946M1920 1006L1400 946M0 1042L590 946M1920 1042L1330 946" fill="none" stroke="#8295d1" stroke-opacity=".065"/><path d="M20 194V150L44 126H365M1900 194V150L1876 126H1555" fill="none" stroke="#94b7f2" stroke-opacity=".2"/><path d="M0 113H1920" stroke="#94b7f2" stroke-opacity=".05"/></g>${orbit}<path d="M400 984H1520" stroke="#89a8df" stroke-opacity=".09"/></g>`;
  }
  window.GovExhibitMaterial=Object.freeze({revision,surface,defs,shadeNodeDefs,shadeConditionalDefs,background});
})();
