#version 300 es

precision highp float;

uniform vec2 resolution; // resolution of the screen
uniform float time; // time in seconds

float noise(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

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


void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy; // normalized coordinates
  vec3 color = vec3(0.0, 0.3, 0.5); // initialize color to black

  // generate a random star pattern
  float starNoise = pow(perlinNoise(vec2(uv.x + time * .3, uv.y) * 15.0), 2.0) * pow(perlinNoise(vec2(uv.x - time * .5, uv.y) * 10.0), 2.0) * pow(perlinNoise(vec2(uv.x, uv.y - time * .3) * 10.0), 2.0);
  float starThreshold = 0.1; // adjust this value to control the density of stars
  float starSize = 1.0;//smoothstep(0.0, 0.1, starNoise);
  if (starNoise > starThreshold) {
    color = vec3(1.0) * starSize; // white star
  }
else
  color += vec3(.0,(starNoise)*5.0,(starNoise)*10.0); // white star

  // add some twinkling to the stars
//   float twinkleNoise = noise(uv);
//   color *= 0.5 + twinkleNoise;

  // output the final color
  gl_FragColor = vec4(color, 1.0);
}