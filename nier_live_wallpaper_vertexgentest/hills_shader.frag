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