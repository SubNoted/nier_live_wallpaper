#version 300 es

precision highp float;

uniform vec2 resolution; // resolution of the screen
uniform float time; // time in seconds

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
vec2 rand2(vec2 n) {
//   int index = int(n.x) + int(n.y) * 256;
//   int seed = index * 1103515245 + 12345;
//   return vec2(float(seed % 256) / 255.0, float(seed % 256) / 255.0);

    return vec2(rand(n), fract(sin(dot(n, vec2(9.14571, 2.12444))) * 4.0));
}
float voronoiNoise(vec2 st, vec2 offset) {
  vec2 i_st = floor(st);
  vec2 f_st = fract(st);

  float min_dist = 1.0;

  for (int j = -3; j <= 3; j++) {
    for (int k = -3; k <= 3; k++) {
      vec2 neighbor = vec2(float(j), float(k));
      vec2 point = rand2(i_st + neighbor)*1.5;
      float dist = distance(f_st, fract(point + offset)) - rand(i_st + neighbor) * .2;
      min_dist = min(min_dist, dist);
    }
  }

  return min_dist * 2.0;
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy; // normalized coordinates
  vec3 color = vec3(0.0, 0.3, 0.5); // initialize color to black

  // generate a random star pattern
  float starNoise = (voronoiNoise(vec2(uv.x, uv.y),vec2(time * 0.1)));
  float starThreshold = 0.1; // adjust this value to control the density of stars
  float starSize = 1.0;//smoothstep(0.0, 0.1, starNoise);
  if (starNoise > starThreshold) {
    color = vec3(1.0) * starSize; // white star
  }
else
  color += vec3((starNoise)); // white star

  // add some twinkling to the stars
//   float twinkleNoise = noise(uv);
//   color *= 0.5 + twinkleNoise;

  // output the final color
  gl_FragColor = vec4(color, 1.0);
}