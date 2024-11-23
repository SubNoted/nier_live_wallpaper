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

float starNoise(vec2 uv)
{
    float noise = 0.;
    for (float z = 1.; z < 5.; z++)
    {
        float t = time*.11/z;
        float s_noise = pow(perlinNoise((uv + vec2(t, 0.93 + z))*43.*z), 3. / z);
        s_noise *= pow(perlinNoise((uv + vec2(t*1.1, 12.78 + z))*33.*z), 3. / z);

        noise += pow(smoothstep(.67 + (z)*.046, 1.,s_noise), 0.7 + z*.1);
    }
    return noise;
}

void main() {
    vec2 uv = gl_FragCoord.xy / vec2(resolution.y); // normalized coordinates

    vec3 color = vec3(0.04, 0.04, 0.05); // initialize color to black

    if (uv.y >= .5)
        color += vec3(pow(starNoise(vec2(uv.x, uv.y)), 1.1));
    else
        color += vec3(pow(starNoise(vec2(uv.x, 1.-uv.y)), 1.5));

    gl_FragColor = vec4(color, 1.0);
}