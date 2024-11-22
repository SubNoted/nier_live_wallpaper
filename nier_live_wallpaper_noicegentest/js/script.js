
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
#define GLSLIFY 1

varying vec3 vPosition;

uniform vec3 ucolor;

uniform float time;

float rand(vec2 n) {
  return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

void main() {
  float r = rand(vPosition.xy * 0.5);
  if (r < 0.1) {
    gl_FragColor = vec4(ucolor, 1.0); // white
  } else {
    gl_FragColor = vec4(ucolor, 0.0); // black
  }
}
`;

const vertexShaderSource1 = `
  #define GLSLIFY 1

  attribute vec3 position;
  uniform mat4 projectionMatrix;
  uniform mat4 modelViewMatrix;

  void main(void) {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShaderSource1 = `
precision highp float;
  #define GLSLIFY 1
 uniform vec3 resolution;

  uniform float time;
    uniform vec3 ucolor;

  float rand(vec2 n) { 
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
  }

  float noise(vec2 p){
    vec2 ip = floor(p);
    vec2 fp = fract(p);
    fp = fp * fp * (3.0 - 2.0 * fp);
    float res = mix(mix(rand(ip),rand(ip+vec2(1.0,0.0)),fp.x),mix(rand(ip+vec2(0.0,1.0)),rand(ip+vec2(1.0,1.0)),fp.x),fp.y);
    return res;
  }

  void main(void) {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec2 center = vec2(0.5, 0.5);
    float angle = time * 0.1;
    float radius = 0.1 + sin(time * 0.05) * 0.05;
    float diameter = radius * 2.0;
    float distance = distance(uv, center);
    float noiseValue = noise(uv * 10.0 + time);
    float circle = step(distance, radius + noiseValue * 0.1);
    gl_FragColor = vec4(vec3(circle), 1.0);
  }
`;

const vertexShaderSource = `
    #define GLSLIFY 1
    attribute vec3 position;
    uniform mat4 projectionMatrix;
    uniform mat4 modelViewMatrix;
    uniform float time;

    varying vec3 vPosition;
    mat4 rotateMatrixX(float radian) {
        return mat4(
            1.0, 0.0, 0.0, 0.0,
            0.0, cos(radian), -sin(radian), 0.0,
            0.0, sin(radian), cos(radian), 0.0,
            0.0, 0.0, 0.0, 1.0
        );
    }

    mat4 rotateMatrixY(float radian) {
        return mat4(
            cos(radian), 0.0, sin(radian), 0.0,
            0.0, 1.0, 0.0, 0.0,
            -sin(radian), 0.0, cos(radian), 0.0,
            0.0, 0.0, 0.0, 1.0
        );
    }

    mat4 rotateMatrixZ(float radian) {
        return mat4(
            cos(radian), -sin(radian), 0.0, 0.0,
            sin(radian), cos(radian), 0.0, 0.0,
            0.0, 0.0, 1.0, 0.0,
            0.0, 0.0, 0.0, 1.0
        );
    }
        
    //
    //See LICENSE file.
    // https://github.com/ashima/webgl-noise 
    //
    vec3 mod289(vec3 x)
    {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
    }
    vec4 mod289(vec4 x)
    {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
    }
    vec4 permute(vec4 x)
    {
        return mod289(((x*34.0)+1.0)*x);
    }
    vec4 taylorInvSqrt(vec4 r)
    {
        return 1.79284291400159 - 0.85373472095314 * r;
    }
    vec3 fade(vec3 t) {
        return t*t*t*(t*(t*6.0-15.0)+10.0);
    }

    // Classic Perlin noise
    float cnoise(vec3 P)
    {
        vec3 Pi0 = floor(P); // Integer part for indexing
        vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
        Pi0 = mod289(Pi0);
        Pi1 = mod289(Pi1);
        vec3 Pf0 = fract(P); // Fractional part for interpolation
        vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
        vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
        vec4 iy = vec4(Pi0.yy, Pi1.yy);
        vec4 iz0 = Pi0.zzzz;
        vec4 iz1 = Pi1.zzzz;
    
        vec4 ixy = permute(permute(ix) + iy);
        vec4 ixy0 = permute(ixy + iz0);
        vec4 ixy1 = permute(ixy + iz1);
    
        vec4 gx0 = ixy0 * (1.0 / 7.0);
        vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
        gx0 = fract(gx0);
        vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
        vec4 sz0 = step(gz0, vec4(0.0));
        gx0 -= sz0 * (step(0.0, gx0) - 0.5);
        gy0 -= sz0 * (step(0.0, gy0) - 0.5);
    
        vec4 gx1 = ixy1 * (1.0 / 7.0);
        vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
        gx1 = fract(gx1);
        vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
        vec4 sz1 = step(gz1, vec4(0.0));
        gx1 -= sz1 * (step(0.0, gx1) - 0.5);
        gy1 -= sz1 * (step(0.0, gy1) - 0.5);
    
        vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
        vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
        vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
        vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
        vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
        vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
        vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
        vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);
    
        vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
        g000 *= norm0.x;
        g010 *= norm0.y;
        g100 *= norm0.z;
        g110 *= norm0.w;
        vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
        g001 *= norm1.x;
        g011 *= norm1.y;
        g101 *= norm1.z;
        g111 *= norm1.w;
    
        float n000 = dot(g000, Pf0);
        float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
        float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
        float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
        float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
        float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
        float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
        float n111 = dot(g111, Pf1);
    
        vec3 fade_xyz = fade(Pf0);
        vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
        vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
        float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
        return 2.2 * n_xyz;
    }
    void main(void) {
        vec3 updatePosition = (rotateMatrixX(radians(90.0)) * vec4(position, 1.0)).xyz;
        float sin1 = sin(radians(updatePosition.x / 128.0 * 90.0));
        vec3 noisePosition = updatePosition + vec3(0.0, 0.0, time * -30.0);
        float noise1 = cnoise(noisePosition * 0.08);
        float noise2 = cnoise(noisePosition * 0.06);
        float noise3 = cnoise(noisePosition * 0.4);
        vec3 lastPosition = updatePosition + vec3(0.0, noise1 * sin1 * 32.0 + noise2 * sin1 * 8.0 + noise3 * (abs(sin1) * 2.0 + 0.5) + pow(sin1, 2.0) * 40.0, 0.0);
    
        vPosition = lastPosition;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(lastPosition, 1.0);
    }
`;

const fragmentShaderSource = `
precision highp float;
#define GLSLIFY 1

varying vec3 vPosition;

uniform vec3 ucolor;

uniform float uopacity;

void main(void) 
{
    float opacity = (96.0 - length(vPosition)) / 256.0 * 0.6;
    gl_FragColor = vec4(ucolor, opacity*uopacity);
}
`;

class Plane {
  constructor() {
    this.uniforms = {
      time : { type: 'f', value: 0 },
      ucolor : { type: 'v3', value: new THREE.Vector3(1.,1.,1.) },
      uopacity : { type: 'f', value: 1.0 },
      resolution : { type: 'v2', value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
    };
    this.mesh = this.createMesh();
    this.time = 1;
    _instance = this;
  }
  createMesh() {
    return new THREE.Mesh(
      new THREE.PlaneGeometry(256, 256, 256, 256),
      new THREE.RawShaderMaterial({
        uniforms: this.uniforms,
        vertexShader: vertexShaderSource0,
        fragmentShader: fragmentShaderSource1,
        transparent: true
      })
    );
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
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
const clock = new THREE.Clock();

const plane = new Plane();

const resizeWindow = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
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
const init = () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(parseInt(background.replace('#','0x')), 1.0);
  camera.position.set(0, 16, 128);
  camera.lookAt(new THREE.Vector3(0, 28, 0));
  
  while(scene.children.length > 0){ 
    scene.remove(scene.children[0]); 
  }
  if(raf){
    cancelAnimationFrame(raf);
  }
  scene.add(plane.mesh);
  on();
  resizeWindow();
  renderLoop();
}
init();

window.onresize = e =>{
  clockPos();
}

function livelyPropertyListener(name, val)
{
  switch(name) {
    case "timeToggle":
      noClock=!val;
      break;
    case "dateToggle":
      noDate=!val;
      break;
    case "_12hour":
      _12hour=val;
      break;
    case "mmddyy":
      mmddyy=!val;
      break;
    case "fontColor":
      document.querySelector(".p-summary").style.color = val; 
      break;
    case "hillColor":
      tmp = hexToRgb(val);
      _instance.uniforms.ucolor.value  = new THREE.Vector3(tmp.r/255, tmp.g/255, tmp.b/255);
      break;
    case "bgColor":
      background = val;
      init();
      break; 
    case "hillOpacityFac":
      _instance.uniforms.uopacity.value = val/100;
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