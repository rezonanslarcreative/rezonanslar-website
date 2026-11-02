import * as T from './three.module.min.js';

// Each costume and silhouette follows the corresponding original pet portrait.
const cast = {
  hazan:        ['cat', 'plume', '#e4a45c', '#ffedcc', '#84243a', '#945829', 'scarf'],
  'lucian-cross':['dog','point', '#33323b', '#514d55', '#292833', '#ac7038', 'vest'],
  'vivian-hale':['dog','spaniel','#c78c53', '#fff2de', '#792450', '#76462d', 'bow'],
  'seren-vega': ['cat','tuxedo','#2d3034', '#fff6e8', '#ba3843', '#81a946', 'plaid'],
  'layla-rezonans':['cat','sleek','#e9bc80', '#fff1cc', '#208e92', '#37a9a1', 'jewel'],
  'aurelia-nox':['dog','poodle','#eee6d7', '#fffaf0', '#203659', '#537ca0', 'beret'],
  'clara-stone':['cat','plume','#857f91', '#c8bfcc', '#785292', '#8864ab', 'scarf'],
  'deniz-ekin':['dog','retriever','#d99a44', '#ffe1a2', '#2e5379', '#765035', 'sailor'],
  'aras-demir':['dog','corgi','#d9893c', '#fff1dc', '#257f82', '#537d80', 'vest'],
  'mahir-koz':['dog','shepherd','#bda485', '#e5d4b9', '#9c452f', '#715544', 'woven']
};

export function makePetViewer(host) {
  const renderer = new T.WebGLRenderer({alpha:true, antialias:true, powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0, 0);
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.domElement.className = 'pet-model';
  renderer.domElement.setAttribute('aria-hidden','true');
  const scene = new T.Scene();
  const camera = new T.OrthographicCamera(-2,2,2,-2,.1,50);
  camera.position.set(0,2,12);
  camera.lookAt(0,1.8,0);
  scene.add(new T.HemisphereLight(0xfff5e5,0xc0a9a4,2));
  for (const [x,y,z,power] of [[-4,6,7,2.4],[4,4,-4,2]]) {
    const light = new T.DirectionalLight(0xffedd5,power);
    light.position.set(x,y,z); scene.add(light);
  }
  const sphere = new T.SphereGeometry(1,32,24);
  const materials = new Map();
  function material(color) {
    if (!materials.has(color)) materials.set(color,new T.MeshStandardMaterial({color,roughness:.72}));
    return materials.get(color);
  }
  function group(parent,x=0,y=0,z=0) {
    const part=new T.Group();parent.add(part);part.position.set(x,y,z);return part;
  }
  function oval(parent,color,x,y,z,w,h,d) {
    const part=new T.Mesh(sphere,material(color));parent.add(part);
    part.position.set(x,y,z);part.scale.set(w,h,d);return part;
  }
  function taperedEar(parent,x,side,fur) {
    const ear=group(parent,x,.62,.02);ear.rotation.z=-side*.20;
    const shape=new T.Shape();shape.moveTo(-.33,0);shape.quadraticCurveTo(-.25,.52,.04,.86);
    shape.quadraticCurveTo(.23,.75,.32,0);shape.closePath();
    const geometry=new T.ExtrudeGeometry(shape,{depth:.13,bevelEnabled:true,bevelSize:.08,bevelThickness:.08,bevelSegments:4});
    const outer=new T.Mesh(geometry,material(fur));ear.add(outer);
    const inner=new T.Mesh(geometry,material('#d99889'));inner.scale.set(.58,.67,.35);inner.position.set(0,.09,.23);ear.add(inner);
  }
  let model,head,body,tail,tip,eyes=[],legs=[],angle=.42,clock=0;
  let frameHeight=4,frameCenter=2;
  function select(id) {
    if(model){scene.remove(model);model.traverse(o=>{if(o.geometry&&o.geometry!==sphere)o.geometry.dispose();});}
    let [species,breed,fur,cream,accent,iris,outfit]=cast[id]||cast.hazan;
    model=group(scene);body=group(model);eyes=[];legs=[];
    oval(body,fur,0,1.17,-.28,.70,.86,.98);
    oval(body,cream,0,1.24,.39,.56,.73,.42);
    head=group(body,0,2.15,.49);
    oval(head,fur,0,.04,0,1.01,.92,.79);
    for(const side of [-1,1]){
      if(species==='cat'||['point','corgi'].includes(breed)) taperedEar(head,side*.59,side,fur);
      else {
        const ear=oval(head,fur,side*.86,-.03,-.02,.32,breed==='spaniel'?.78:.51,.30);
        ear.rotation.z=side*.19;
        if(breed==='poodle'||breed==='spaniel') for(let n=0;n<5;n++)
          oval(head,fur,side*(.82+.09*Math.sin(n*2)),-.08-n*.10,.13,.24,.20,.20);
      }
      const eye=group(head,side*.40,.14,.675);eyes.push(eye);
      oval(eye,'#44302b',0,0,0,.259,.310,.126);
      oval(eye,iris,0,-.012,.066,.223,.272,.115);
      oval(eye,'#201919',0,.019,.13,.145,.206,.079);
      oval(eye,'#fffbee',-.071,.135,.20,.070,.081,.030);
      oval(eye,'#fffbee',.070,-.075,.205,.029,.029,.017);
      oval(head,cream,side*.20,-.20,.735,.30,.205,.23);
      const cheek=oval(head,fur,side*.82,-.20,0,.24,.29,.33);cheek.rotation.z=side*.5;
    }
    oval(head,'#312525',0,-.33,.86,.13,.072,.07);
    oval(head,species==='cat'?'#c17d77':'#332b2d',0,-.115,.94,.145,.098,.082);
    const collar=oval(body,accent,0,1.73,.39,.72,.22,.62);
    for(let i=0;i<7;i++)oval(collar,'#ddba71',(i-3)*.19,-.10,Math.sqrt(1-((i-3)*.19)**2),.035,.12,.027);
    if(outfit==='bow'||outfit==='beret'){
      for(const side of [-1,1])oval(body,accent,side*.21,1.69,1.00,.27,.19,.12).rotation.z=side*.4;
      oval(body,'#d6ac63',0,1.69,1.09,.10,.11,.07);
    }else if(outfit==='vest') {
      for(const side of [-1,1])oval(body,accent,side*.42,1.30,.48,.30,.49,.23).rotation.z=-side*.2;
    }else if(outfit==='jewel'){
      oval(body,'#d8ac4d',0,1.62,.99,.21,.26,.09);
      oval(body,accent,0,1.64,1.07,.145,.19,.05);
    }else{
      const scarf=oval(body,accent,-.44,1.35,.80,.24,.49,.11);scarf.rotation.z=-.32;
      const trim=outfit==='sailor'?'#fff8e9':outfit==='plaid'?'#522934':'#ecc47a';
      for(const y of [-.65,-.42])oval(scarf,trim,0,y,.82,.72,.055,.07);
    }
    if(outfit==='beret')oval(head,accent,-.19,.91,0,.85,.28,.68).rotation.z=.22;
    for(const z of [-.72,.34])for(const side of [-1,1]){
      const hip=group(body,side*.40,.97,z);const shin=group(hip,0,-.41,0);
      oval(hip,fur,0,-.21,0,.22,.37,.24);oval(shin,fur,0,-.17,0,.18,.26,.19);
      oval(shin,cream,0,-.32,.085,.235,.16,.29);legs.push({hip,shin,phase:(z>0?Math.PI:0)+(side>0?Math.PI:0)});
    }
    tail=group(body,0,1.11,-1.03);tip=group(tail,0,.52,-.51);
    const fluff=breed==='plume'||breed==='retriever'?.43:.255;
    oval(tail,fur,0,.25,-.29,fluff,.54,fluff).rotation.x=-.65;
    oval(tip,fur,0,.26,-.06,fluff*.94,.50,fluff*.92);
    oval(tip,cream,0,.57,-.02,fluff*.78,.28,fluff*.75);
    model.rotation.y=.5;model.updateMatrixWorld(true);
    const bounds=new T.Box3().setFromObject(model);
    frameCenter=(bounds.max.y+bounds.min.y)/2;frameHeight=(bounds.max.y-bounds.min.y)*1.10;
    host.replaceChildren(renderer.domElement);resize();draw(0,'idle',false,false);
  }
  function resize(){
    const w=host.clientWidth||120,h=host.clientHeight||150;
    // Fit the actual model's bounds rather than the transparent padding of an image.
    const height=Math.max(frameHeight,2.85*h/w);
    camera.left=-height*w/h/2;camera.right=-camera.left;camera.top=height/2;camera.bottom=-camera.top;
    camera.position.y=frameCenter+.28;camera.lookAt(0,frameCenter,0);camera.updateProjectionMatrix();
    renderer.setSize(w,h,false);
  }
  const observer=new ResizeObserver(resize);observer.observe(host);
  function draw(dt,action,active,left){
    if(!model)return;
    if(active)clock+=dt;
    const walk=active&&action==='walk',wave=clock*8;
    const turn=action==='spin'&&active?clock*3:left?-.95:.95;
    angle+=Math.atan2(Math.sin(turn-angle),Math.cos(turn-angle))*Math.min(1,dt*6);
    model.rotation.y=angle;
    body.position.y=active&&action==='jump'?Math.abs(Math.sin(clock*4))*.30:walk?Math.cos(2*wave)*.028:0;
    for(const leg of legs){leg.hip.rotation.x=walk?Math.sin(wave+leg.phase)*.48:0;
      leg.shin.rotation.x=walk?Math.max(0,Math.cos(wave+leg.phase))*.52:0;}
    tail.rotation.z=-.43+Math.sin(clock*(action==='wag'?6:2.4))*.34;
    tip.rotation.z=Math.sin(clock*2.4-.75)*.34;
    head.rotation.z=Math.sin(clock*1.7)*.035;
    const blink=Math.abs((clock%4.2)-3.94);for(const eye of eyes)eye.scale.y=Math.min(1,.07+blink*10);
    renderer.render(scene,camera);
  }
  return {select,draw};
}
