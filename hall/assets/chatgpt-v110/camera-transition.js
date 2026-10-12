import * as THREE from 'three';

// Demand-rendered camera motion: no timer, independent RAF or idle animation.
export function createCameraTransition({camera,controls,requestFrame,canAnimate=()=>true,reducedMotion=()=>false,duration=680}){
 let flight=null,disposed=false;
 const apply=(position,target)=>{controls.target.copy(target);camera.position.copy(position);controls.update();};
 const valid=v=>v&&Number.isFinite(v.x)&&Number.isFinite(v.y)&&Number.isFinite(v.z);
 const stop=({finish=false}={})=>{const old=flight;flight=null;if(old&&finish&&!disposed){apply(old.position,old.target);requestFrame();}return Boolean(old);};
 function move(position,target,{animate=true}={}){
  if(disposed||!valid(position)||!valid(target))return false;
  const destination=position.clone(),aim=target.clone(),offset=destination.clone().sub(aim);
  if(offset.lengthSq()<1e-12)return false;
  const currentTarget=controls.target.clone(),currentOffset=camera.position.clone().sub(currentTarget);
  flight=null;
  if(!animate||!canAnimate()||reducedMotion()||duration<=0||currentOffset.lengthSq()<1e-12||(camera.position.distanceToSquared(destination)<1e-12&&currentTarget.distanceToSquared(aim)<1e-12)){
   apply(destination,aim);requestFrame();return true;
  }
  const from=new THREE.Spherical().setFromVector3(currentOffset),to=new THREE.Spherical().setFromVector3(offset);
  const thetaDelta=THREE.MathUtils.euclideanModulo(to.theta-from.theta+Math.PI,Math.PI*2)-Math.PI;
  flight={position:destination,target:aim,originTarget:currentTarget,from,to,thetaDelta,start:null};
  requestFrame();return true;
 }
 function update(timestamp){
  if(disposed||!flight)return false;
  if(!canAnimate()){stop();return false;}
  if(reducedMotion()){stop({finish:true});return false;}
  const now=Number.isFinite(timestamp)?timestamp:0;
  if(flight.start===null)flight.start=now;
  const t=THREE.MathUtils.clamp((now-flight.start)/duration,0,1),e=t*t*(3-2*t),f=flight;
  if(t<=0)return true;
  if(t>=1){flight=null;apply(f.position,f.target);return false;}
  const spherical=new THREE.Spherical(THREE.MathUtils.lerp(f.from.radius,f.to.radius,e),THREE.MathUtils.lerp(f.from.phi,f.to.phi,e),f.from.theta+f.thetaDelta*e);
  const target=f.originTarget.clone().lerp(f.target,e),position=new THREE.Vector3().setFromSpherical(spherical).add(target);
  apply(position,target);return true;
 }
 return Object.freeze({move,update,stop,dispose:()=>{flight=null;disposed=true;},get moving(){return Boolean(flight);}});
}
