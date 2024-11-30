
var _instance;

class Plane {
  constructor() {
    this.uniforms = {
      time : { type: 'f', value: 0 },
      ucolor : { type: 'v3', value: new THREE.Vector3(1.,1.,1.) },
      uopacity : { type: 'f', value: 1.0 },
      resolution : { type: 'v2', value: new THREE.Vector2(window.innerWidth, window.innerHeight) },

      
      u_tex_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight), type: "v2" },
      u_tex_base: { type: "t" },
      u_tex_flower1: { type: "t" },
      u_tex_flower2: { type: "t" },
      u_tex_flower3: { type: "t" },
      u_tex_flower4: { type: "t" },
      u_tex_flower5: { type: "t" },
      u_tex_water: { type: "t" },
    
    };
    this.material = this.createMaterial();
    this.time = 1;
    this.fillTexture();
    _instance = this;
  }
  createMesh() {
    return new THREE.Mesh(
      new THREE.PlaneGeometry(256, 256, 256, 256),
      this.material
    );
  }

  createMaterial() {
    return new THREE.RawShaderMaterial({
        uniforms: this.uniforms,
        transparent: true
      });
  }

  fillTexture() {
    let mat = this.material;
    new THREE.TextureLoader().load("media/sword/base.png", function (tex) {
      mat.uniforms.u_tex_resolution.value = new THREE.Vector2(tex.image.width, tex.image.height);
      mat.uniforms.u_tex_base.value = tex;
    });
    new THREE.TextureLoader().load("media/sword/flower1.png", function (tex) {
      mat.uniforms.u_tex_flower1.value = tex;
    });
    new THREE.TextureLoader().load("media/sword/flower2.png", function (tex) {
      mat.uniforms.u_tex_flower2.value = tex;
    });
    new THREE.TextureLoader().load("media/sword/flower3.png", function (tex) {
      mat.uniforms.u_tex_flower3.value = tex;
    });
    new THREE.TextureLoader().load("media/sword/flower4.png", function (tex) {
      mat.uniforms.u_tex_flower4.value = tex;
    });
    new THREE.TextureLoader().load("media/sword/flower5.png", function (tex) {
      mat.uniforms.u_tex_flower5.value = tex;
    });
    new THREE.TextureLoader().load("media/sword/water.png", function (tex) {
      mat.uniforms.u_tex_water.value = tex;
    });
  }

  render(time) {
    this.uniforms.time.value += time * this.time;
  }
}

//const container = document.getElementById("container");
const canvas = document.getElementById('canvas-webgl');
const renderer = new THREE.WebGLRenderer({
  antialias: false,
  canvas: canvas,
});
//container.appendChild(renderer.domElement);
const scene = new THREE.Scene();
//const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
const camera = new THREE.OrthographicCamera(-1, 100, 1, -1, 0, 1);
const clock = new THREE.Clock();

const plane = new Plane();

const resizeWindow = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight, 2);
}
const on = () => {
  $(window).on('resize', () => {
    resizeWindow();
  });
}
const render = () => {
  plane.render(clock.getDelta());
  renderer.render(scene, camera);
}
let raf;
const renderLoop = () => {
  render();
  raf=requestAnimationFrame(renderLoop);
}

let background = "#1e1e1e";
async function init(){
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(parseInt(background.replace('#','0x')), 1.0);
  //camera.position.set(0, 16, 128);
  //camera.lookAt(new THREE.Vector3(0, 28, 0));
  
  while(scene.children.length > 0){ 
    scene.remove(scene.children[0]); 
  }
  if(raf){
    cancelAnimationFrame(raf);
  }


    plane.material.fragmentShader = await (await fetch("./shaders/petals.frag")).text();
    plane.material.vertexShader = await (await fetch("./shaders/empty.vert")).text();

    
//   new THREE.TextureLoader().load("./media/sword_t.png", function (tex) {
//     material.uniforms.u_tex0_resolution.value = new THREE.Vector2(tex.image.width, tex.image.height);
//     material.uniforms.u_tex0.value = tex;
//   });

    scene.add(plane.createMesh());

    on();
    resizeWindow();
    renderLoop();
}
init();

function livelyPropertyListener(name, val)
{
  switch(name) {
    case "petalsColor":
      tmp = hexToRgb(val);
      _instance.uniforms.ucolor.value  = new THREE.Vector3(tmp.r/255, tmp.g/255, tmp.b/255);
      break;
    case "bgColor":
      background = val;
      init();
      break; 
  }
}

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}