#ifdef GL_ES
precision highp float;
#endif

uniform vec2 resolution; // resolution of the screen
uniform float time; // time in seconds

uniform sampler2D u_tex_base;
uniform sampler2D u_tex_flower1;
uniform sampler2D u_tex_flower2;
uniform sampler2D u_tex_flower3;
uniform sampler2D u_tex_flower4;
uniform sampler2D u_tex_flower5;
uniform vec2 u_tex_resolution; 

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
        float s_noise = pow(perlinNoise((uv + vec2(t, 0.93 + z))*44.*z), 3. / z);
        s_noise *= pow(perlinNoise((uv + vec2(t*1.1, 12.78 + z))*33.*z), 3. / z);

        noise += pow(smoothstep(.68 + (z)*.046, 1.,s_noise), 0.7 + z*.1);
    }
    return noise;
}

void main() {
    vec2 uv = gl_FragCoord.xy / vec2(resolution.y); // normalized coordinates

    vec3 color = vec3(0.04, 0.04, 0.05); // initialize color to black

    //petals
    if (uv.y >= .5)
        color += vec3(pow(starNoise(vec2(uv.x, uv.y)), 1.1));
    else
        color += vec3(pow(starNoise(vec2(uv.x, 1.-uv.y)), 1.5));

    ///////////////////textures///////////////////
    vec2 tex_uv = gl_FragCoord.xy/u_tex_resolution;
    vec2 tex_offset = vec2(.5, .65);
    vec2 scale = vec2(0.45, 0.45); // Adjust this value to scale the texture
    // Calculate the aspect ratios
    float screenAspect = resolution.x / resolution.y;
    float textureAspect = u_tex_resolution.x / u_tex_resolution.y;

    // Calculate the scaling factors
    vec2 scaleFactors;
    if (screenAspect > textureAspect) {
        scaleFactors = vec2(screenAspect / textureAspect, 1.0);
    } else {
        scaleFactors = vec2(1.0, textureAspect / screenAspect);
    }

    // Calculate the final UV coordinates
    vec2 final_uv = (gl_FragCoord.xy / resolution - tex_offset) * scaleFactors / scale + 0.5;

    // Check if we're within the texture bounds
    if (final_uv.x >= 0.0 && final_uv.x <= 1.0 && final_uv.y >= 0.0 && final_uv.y <= 1.0) {

        //base 
        vec3 n_color = texture2D(u_tex_base, final_uv).rgb;
        if (length(n_color) > 0.1)
            color = n_color;

        //flower1        
        color += texture2D(u_tex_flower1, final_uv).rgb;
        //flower2        
        color += texture2D(u_tex_flower2, final_uv).rgb;
        //flower3        
        color += texture2D(u_tex_flower3, final_uv).rgb;
        //flower4        
        color += texture2D(u_tex_flower4, final_uv).rgb;
        //flower5        
        color += texture2D(u_tex_flower5, final_uv).rgb;

    }

    //////////glowing effect///////////////////

    vec2 flowerCoords[5];
    flowerCoords[0] = vec2(0.3, 0.5);
    flowerCoords[1] = vec2(0.7, 0.5);
    flowerCoords[2] = vec2(0.3, 0.3);
    flowerCoords[3] = vec2(0.7, 0.3);
    flowerCoords[4] = vec2(0.7, 0.5);

    const int i = 0;
    //for (int i = 0; i < 5; i++) 
    {
        float dist = length(flowerCoords[i] - uv);
        if (dist > 0.5) {
            //continue;
        }
        else
        {
            float red = 1. - dist*3.6;
            color += vec3(red,.0,.0);
        }
    }

    gl_FragColor = vec4(color, 1.0);
}


