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
    return vec2(rand(n), fract(sin(dot(n, vec2(9.145, 2.124))) * 437.0));
}

float voronoiNoise(vec2 st, vec2 offset, float size, float dots) {
  vec2 i_st = floor(st);
  vec2 f_st = fract(st);

  float min_dist = 1.;

  for (float i = -dots*2.; i < dots*2.; i++) {
      vec2 point = rand2(i_st + vec2((i)));
      float dist = distance(f_st, fract(point + offset)*1.5 - .1)/size;
      min_dist = min(min_dist, dist);
  }

  return min_dist * 1.0;
}

float starNoise(vec2 uv, float layer)
{
    // generate a random star pattern
    vec2 offset = vec2(-time*.015*layer, 0.);
    float t = time * 3.;
    float fadeNoice = pow(perlinNoise(vec2(uv.x*4., uv.y*15. + t*.3)*2.), 3.5);
    //fadeNoice *= pow(perlinNoise(vec2(uv.x*3., uv.y*5. + time*.5)*2.), 1.5);

    float starNoise = 1.0 - (voronoiNoise(vec2(uv.x, uv.y),offset, 0.01 * fadeNoice * layer * .25, 20. / layer));
    starNoise *= fadeNoice;

    return starNoise;
}

void main() {
    vec2 uv = gl_FragCoord.xy / vec2(resolution.y); // normalized coordinates

    vec3 color = vec3(0.04, 0.04, 0.05); // initialize color to black

    vec2 points[10];
    for (int i = 0; i < 10; i++)
    {
        points[i] = normalize(rand2(resolution + vec2(float(i))));
    }

    // if (uv.y >= .5){
    //     color += vec3(starNoise(uv, 4.));
    //     color += vec3(starNoise(uv, 3.));
    //     color += vec3(starNoise(uv, 2.));
    //     color += vec3(starNoise(uv, 1.));
    // }
    // else{
    //     color += vec3(starNoise(vec2(uv.x, 1.-uv.y), 4.)) * 0.8;
    //     color += vec3(starNoise(vec2(uv.x, 1.-uv.y), 3.)) * 0.8;
    //     color += vec3(starNoise(vec2(uv.x, 1.-uv.y), 2.)) * 0.8;
    //     color += vec3(starNoise(vec2(uv.x, 1.-uv.y), 1.)) * 0.8;
    // }

    if (distance(uv, points[0]) < 0.01)
    {
        color = vec3(1.);
    }

    gl_FragColor = vec4(color, 1.0);  
}