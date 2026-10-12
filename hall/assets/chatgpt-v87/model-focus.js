import * as THREE from 'three';

// Observation feedback only: this marks existing objects, never draws workflow links.
export function createModelFocus(model){
 const object=new THREE.Group();object.name='OBSERVATION_FOCUS';object.userData.isObservationOverlay=true;
 let overrides=[],disposed=false;
 function clear(){
  for(const [mesh,original] of overrides){
   for(const material of Array.isArray(mesh.material)?mesh.material:[mesh.material]){
    if(!(Array.isArray(original)?original:[original]).includes(material))material.dispose();
   }
   mesh.material=original;
  }
  overrides=[];
  for(const child of [...object.children]){child.geometry?.dispose();child.material?.dispose();object.remove(child);}
 }
 function set(names=[],color=0xa4cede){
  if(disposed)return;
  clear();model.updateMatrixWorld(true);const seen=new Set(),tint=new THREE.Color(color);
  for(const name of [...new Set(names)]){
   const role=model.getObjectByName(name);if(!role)continue;
   role.traverse(mesh=>{
    if(!mesh.isMesh||seen.has(mesh))return;seen.add(mesh);
    const original=mesh.material,materials=Array.isArray(original)?original:[original];let changed=false;
    const next=materials.map(material=>{
     // Glass stays transparent; existing lettering and emissive highlights retain their appearance.
     if(!material?.isMeshStandardMaterial||material.transmission>0||material.emissive&&(material.emissive.r>0||material.emissive.g>0||material.emissive.b>0))return material;
     const clone=material.clone();clone.emissive.copy(tint).multiplyScalar(.045);clone.emissiveIntensity=1;changed=true;return clone;
    });
    if(changed){overrides.push([mesh,original]);mesh.material=Array.isArray(original)?next:next[0];}
   });
   const box=new THREE.Box3().setFromObject(role);if(box.isEmpty())continue;
   const span=box.getSize(new THREE.Vector3()),arm=Math.min(.42,Math.max(.10,Math.min(span.x,span.z)*.18)),y=box.min.y+.035,points=[];
   for(const [x,z,sx,sz] of [[box.min.x,box.min.z,1,1],[box.max.x,box.min.z,-1,1],[box.max.x,box.max.z,-1,-1],[box.min.x,box.max.z,1,-1]]){
    points.push(x+arm*sx,y,z,x,y,z,x,y,z,x,y,z+arm*sz);
   }
   const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(points,3));
   const material=new THREE.LineBasicMaterial({color,transparent:true,opacity:.9,depthTest:true,depthWrite:false,toneMapped:false});
   const corners=new THREE.LineSegments(geometry,material);corners.name='FOCUS_'+name;corners.userData.role=name;corners.renderOrder=1;object.add(corners);
  }
 }
 function dispose(){if(disposed)return;clear();object.removeFromParent();disposed=true;}
 return {object,set,clear,dispose};
}
