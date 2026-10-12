/* Equal-sized conditional exhibits. Layout is a presentation choice, not
 * sequence, priority, quantity or an observed business system arrangement.
 * All evidence text comes from GOV_V7; this module supplies vector geometry.
 */
(() => {
  'use strict';
  const revision='chatgpt-v75';
  const stands=Object.freeze([[502,230],[796,230],[1090,230],[649,360],[943,360]].map(([x,y])=>Object.freeze({x,y,w:270,h:114})));
  function defs(){return `<defs>
    <linearGradient id="v75-glass" x1="0" y1="0" x2=".65" y2="1"><stop stop-color="#245672"/><stop offset=".36" stop-color="#183c55"/><stop offset="1" stop-color="#102b41"/></linearGradient>
    <linearGradient id="v75-base" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#2c6989"/><stop offset=".14" stop-color="#235673"/><stop offset=".7" stop-color="#12344f"/><stop offset="1" stop-color="#112a41"/></linearGradient>
    <linearGradient id="v75-rim"><stop stop-color="#b9e7f3" stop-opacity=".7"/><stop offset=".6" stop-color="#84bad1" stop-opacity=".26"/><stop offset="1" stop-color="#b3e0eb" stop-opacity=".7"/></linearGradient>
    <linearGradient id="v75-reflection" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#b1e7f1" stop-opacity=".065"/><stop offset=".47" stop-color="#9fd9ec" stop-opacity="0"/><stop offset=".51" stop-color="#9fd9ec" stop-opacity=".035"/><stop offset="1" stop-color="#9fd9ec" stop-opacity="0"/></linearGradient>
  </defs>`;}
  function source({x,y,w}){return `<g transform="translate(${x} ${y})" data-diagram-material="stand-condition-source" data-diagram-material-revision="${revision}" data-semantic-object="stand-condition-source" aria-hidden="true">
    <path d="M0 1H${w-12}L${w} 13V56H0Z" fill="url(#v75-glass)" stroke="url(#v75-rim)" stroke-width=".8"/>
    <path d="M0 1H${w-12}L${w} 13V56H0Z" fill="url(#v75-reflection)"/>
    <path d="M1 1H${w-13}L${w-1} 13" fill="none" stroke="#bce8f5" stroke-opacity=".45"/>
    <path d="M51 13V49" stroke="#a4d5e5" stroke-opacity=".2"/>
    <path d="M16 57H${w-16}" stroke="#7badc6" stroke-opacity=".16"/>
  </g>`;}
  function result({x,y,w}){return `<g transform="translate(${x} ${y+70})" data-diagram-material="stand-method-base" data-diagram-material-revision="${revision}" data-semantic-object="stand-method-base" aria-hidden="true">
    <path d="M0 38L10 44H${w-10}L${w} 38V6H0Z" fill="#071624"/>
    <path d="M9 0H${w-9}L${w} 6V38H0V6Z" fill="url(#v75-base)" stroke="url(#v75-rim)" stroke-width="1"/>
    <path d="M9 0H${w-9}L${w} 6H0Z" fill="#b6dcec" fill-opacity=".09"/>
    <path d="M0 38L10 44H${w-10}L${w} 38" fill="none" stroke="#5d8da7" stroke-opacity=".5"/>
    <path d="M17 1H${w-17}" stroke="#c0edf4" stroke-opacity=".7"/>
    <path d="M12 41H${w-12}" stroke="#61a9c3" stroke-opacity=".21"/>
  </g>`;}
  function junction({x,y,w}){return `<g data-semantic-object="stand-conditional-junction" aria-hidden="true"><path d="M${x+w-42} ${y+54}h12" fill="none" stroke="#a8d8e5" stroke-opacity=".55"/></g>`;}
  function support(x,y,w,h){return `<g data-semantic-object="parallel-question-support" aria-hidden="true"><path d="M${x} ${y+13}V${y+h}H${x+w}V${y+13}" fill="#ddbe8e" fill-opacity=".025" stroke="#d4b78e" stroke-opacity=".2"/><path d="M${x+18} ${y+h}H${x+w-18}" stroke="#cab492" stroke-opacity=".44"/><path d="M${x+20} ${y+2}H${x+w-20}" stroke="#a69882" stroke-opacity=".09"/></g>`;}
  function conditionLines(raw,index){
    const token=({1:'且',2:'复用模板',4:'告知承诺制度'})[index];
    if(!token)return [raw];
    const at=raw.indexOf(token);if(at<1)throw Error('Source condition changed; review its line break.');
    return [raw.slice(0,at),raw.slice(at)];
  }
  window.GovConditionalExhibit=Object.freeze({revision,stands,defs,source,result,junction,support,conditionLines});
})();
