import * as THREE from 'three';

// Exclude exhibition framing, never semantic props such as telephone/stamp bases.
export const processRoles=Object.freeze(['UNIFIED_SUBMISSION','JOINT_SITE_SURVEY','COORDINATED_PAYMENT','ASSISTED_RESULT','ENTERPRISE_SERVICE_WINDOW','REVIEW_CONDITIONS','SIGNOFF_PROGRESS','MANUAL_COORDINATION','SEPARATE_SYSTEM_ROUTING']);
const framing=/^(?:Readable_enamel_sign|Role_title|Role_explanation|Mechanism_exhibit_backplate)\d*$/;
export function isObservationMesh(mesh){return mesh.isMesh&&!framing.test(mesh.name)&&mesh.name!=='Enterprise_approach_base';}
export function readObservationBounds(model,role){
 const node=typeof role==='string'?model?.getObjectByName(role):role,box=new THREE.Box3();
 node?.traverse(mesh=>{if(isObservationMesh(mesh))box.expandByObject(mesh);});
 return box.isEmpty()&&node?new THREE.Box3().setFromObject(node):box;
}
