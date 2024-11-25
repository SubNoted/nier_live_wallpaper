
var _instance;

const vertexShaderSource0 = `
    attribute vec3 position;
    uniform mat4 projectionMatrix;
    uniform mat4 modelViewMatrix;

    varying vec3 vPosition;

void main() {
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShaderSource0 = `

precision highp float;

uniform vec2 resolution; // resolution of the screen
uniform float time; // time in seconds
uniform vec3 ucolor;

uniform sampler2D u_tex0;
uniform vec2 u_tex0_resolution; 

float rand(vec2 n) {
  return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}
float perlinNoise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);

  float u = f.x * f.x * (3.0 - 2.0 * f.x);
  float v = f.y * f.y * (3.0 - 2.0 * f.y);

  float n00 = rand(i);
  float n01 = rand(i + vec2(0.0, 1.0));
  float n10 = rand(i + vec2(1.0, 0.0));
  float n11 = rand(i + vec2(1.0, 1.0));

  float x1 = mix(n00, n10, u);
  float x2 = mix(n01, n11, u);

  return mix(x1, x2, v);
}

float starNoise(vec2 uv)
{
    float noise = 0.;
    for (float z = 1.; z < 6.; z++)
    {
        float t = time*.11/z;
        float s_noise = pow(perlinNoise((uv + vec2(t, 0.93 + z))*44.*z), 3. / z);
        s_noise *= pow(perlinNoise((uv + vec2(t*1.1, 12.78 + z))*33.*z), 3. / z);

        noise += pow(smoothstep(.68 + (z)*.046, 1.,s_noise), 0.7 + z*.1);
    }
    return noise;
}

void main() {
    vec2 uv = gl_FragCoord.xy / vec2(resolution.y); // normalized coordinates

    vec3 color = vec3(.04, 0.04, 0.05); // initialize color to black

    if (uv.y >= .5)
        color += vec3(pow(starNoise(vec2(uv.x, uv.y)), 1.1));
    else
        color += vec3(pow(starNoise(vec2(uv.x, 1.-uv.y)), 1.5));

    color += texture2D(u_tex0, uv*0.5).rgb;

    gl_FragColor = vec4(color, 1.0);
}
`;

class Plane {
  constructor() {
    this.uniforms = {
      time : { type: 'f', value: 0 },
      ucolor : { type: 'v3', value: new THREE.Vector3(1.,1.,1.) },
      uopacity : { type: 'f', value: 1.0 },
      resolution : { type: 'v2', value: new THREE.Vector2(window.innerWidth, window.innerHeight) },

      
      u_tex0_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight), type: "v2" },
      u_tex0: { type: "t" },
    
    };
    this.mesh = this.createMesh();
    this.time = 1;
    this.fillTexture();
    _instance = this;
  }
  createMesh() {
    return new THREE.Mesh(
      new THREE.PlaneGeometry(256, 256, 256, 256),
      new THREE.RawShaderMaterial({
        uniforms: this.uniforms,
        vertexShader: vertexShaderSource0,
        fragmentShader: fragmentShaderSource0,
        transparent: true
        
      })
    );
  }
  fillTexture() {
    
    new THREE.TextureLoader().load("media/sword_t (2).png", function (tex) {
      this.uniforms.u_tex0_resolution.value = new THREE.Vector2(tex.image.width, tex.image.height);
      this.uniforms.u_tex0.value = tex;
    });
  }

  render(time) {
    this.uniforms.time.value += time * this.time;
  }
}

const canvas = document.getElementById('canvas-webgl');
const renderer = new THREE.WebGLRenderer({
  antialias: false,
  canvas: canvas,
});
const scene = new THREE.Scene();
//const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
const camera = new THREE.OrthographicCamera(-1, 100, 1, -1, 0, 1);
const clock = new THREE.Clock();
let material;

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

//   material = new THREE.ShaderMaterial({
//     uniforms: {
//         time : { type: 'f', value: 0 },
//         ucolor : { type: 'v3', value: new THREE.Vector3(1.,1.,1.) },
//         uopacity : { type: 'f', value: 1.0 },
//         resolution : { type: 'v2', value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
//       },
//       vertexShader: vertexShaderSource0,
//       fragmentShader: fragmentShaderSource0,
//       transparent: true
//   });
//   plane.mesh.fragmentShader = await (await fetch("shaders/petals.frag")).text();

//   new THREE.TextureLoader().load("media/image.jpg", function (tex) {
//     material.uniforms.u_tex0_resolution.value = new THREE.Vector2(tex.image.width, tex.image.height);
//     material.uniforms.u_tex0.value = tex;
//   });

//   const quad = new THREE.Mesh(new THREE.PlaneGeometry(256, 256, 256, 256), material);
//   scene.add(quad);

  

 scene.add(plane.mesh);


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

window.addEventListener("resize", function (e) {
    renderer.setSize(window.innerWidth, window.innerHeight, 2);
  
    material.uniforms.u_resolution.value = new THREE.Vector2(window.innerWidth, window.innerHeight);
  });

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}