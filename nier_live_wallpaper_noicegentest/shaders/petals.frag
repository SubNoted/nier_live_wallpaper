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
    vec2 uvy = gl_FragCoord.xy / vec2(resolution.y); // normalized coordinates

    vec3 color = vec3(0.04, 0.04, 0.05); // initialize color to black

    //water distortion
    float water_distortionX = (perlinNoise(vec2(uvy.x*2. + time * 0.1, uvy.y*.5) * 6.0) * perlinNoise(vec2(uvy.x + time * 0.1, uvy.y * 10. + time * 0.16) * 8.0) - .5)*.015;
    float water_distortionY = (perlinNoise(vec2(uvy.x + time * 0.07, uvy.y*6.) * 20.0) * perlinNoise(vec2(uvy.x, uvy.y*4. + time * 0.15) * 20.0) - .5)*.008;
    //color += water_distortionY * 50.5;

    ///////petals////////////////////////////////
    if (uvy.y >= .5)
        color += vec3(pow(starNoise(vec2(uvy.x, uvy.y)), 1.0));
    else
        color += vec3(pow(starNoise(vec2(uvy.x, 1.-uvy.y)), 1.5));

    vec2 uv = gl_FragCoord.xy / resolution;
    uv += vec2(water_distortionX, water_distortionY);

    ///////////////////textures///////////////////
    {
        vec2 normal_tex_offset = vec2(.5, .65);
        vec2 scale = vec2(0.45, 0.45); // Adjust this value to scale the texture

        vec2 normalFlowerCoords[5];
        normalFlowerCoords[0] = vec2(0.515, 0.223);
        normalFlowerCoords[1] = vec2(0.36, 0.27);
        normalFlowerCoords[2] = vec2(0.52, 0.37);
        normalFlowerCoords[3] = vec2(0.345, 0.47);
        normalFlowerCoords[4] = vec2(0.418, 0.49);

        // Calculate the aspect ratios
        float screenAspect = resolution.x / resolution.y;
        float textureAspect = u_tex_resolution.x / u_tex_resolution.y;
        vec2 scaleFactors = vec2(screenAspect / textureAspect, 1.0);

        // Calculate the final UV coordinates
        vec2 final_uv = (uv - normal_tex_offset) * scaleFactors / scale + 0.5;

        // Rotation transformation
        float anim0 = pow(sin(time*1.7),1.) * pow(cos(time*0.3),1.) * pow(cos(time*0.4),1.);
        float anim1 = pow(sin((time+0.3)*1.7),1.) * pow(cos((time+0.3)*0.3),1.) * pow(cos((time+0.3)*0.4),1.);
        float angle0 = anim0*radians(15.); // Rotation angle based on time
        float angle1 = anim1*radians(15.); // Rotation angle based on time
        // work with texture
        if (final_uv.x >= 0.0 && final_uv.x <= 1.0 && final_uv.y >= 0.0 && final_uv.y <= 1.0) 
        {

            //base 
            vec3 n_color = texture2D(u_tex_base, final_uv).rgb;
            if (length(n_color) > 0.1)
                color = n_color;

            //flower1
            float dist = distance(final_uv, normalFlowerCoords[0]);
            float Alpha = angle1 * dist * 30.;
            mat2 rotation = mat2(cos(Alpha), -sin(Alpha), sin(Alpha), cos(Alpha));
            vec2 rotated_uv = (rotation * ((final_uv - normalFlowerCoords[0])) + normalFlowerCoords[0]);
            color += texture2D(u_tex_flower1, rotated_uv).rgb;

            //flower2
            dist = distance(final_uv, normalFlowerCoords[2]);
            Alpha = angle1 * dist * 15.;
            rotation = mat2(cos(Alpha), -sin(Alpha), sin(Alpha), cos(Alpha));
            rotated_uv = rotation * ((final_uv - normalFlowerCoords[2])) + normalFlowerCoords[2];
            color += texture2D(u_tex_flower2, rotated_uv).rgb;

            //flower3        
            dist = distance(final_uv, normalFlowerCoords[4]);
            Alpha = angle0 * dist * 40.;
            rotation = mat2(cos(Alpha), -sin(Alpha), sin(Alpha), cos(Alpha));
            rotated_uv = rotation * ((final_uv - normalFlowerCoords[4])) + normalFlowerCoords[4];
            color += texture2D(u_tex_flower3, rotated_uv).rgb;

            //flower4
            dist = distance(final_uv, normalFlowerCoords[3]);
            Alpha = angle0 * dist * 15.;
            rotation = mat2(cos(Alpha), -sin(Alpha), sin(Alpha), cos(Alpha));       
            rotated_uv = rotation * ((final_uv - normalFlowerCoords[3])) + normalFlowerCoords[3];
            color += texture2D(u_tex_flower4, rotated_uv).rgb;

            //flower5        
            dist = distance(final_uv, normalFlowerCoords[1]);
            Alpha = angle0 * dist * 20.;
            rotation = mat2(cos(Alpha), -sin(Alpha), sin(Alpha), cos(Alpha));
            rotated_uv = rotation * ((final_uv - normalFlowerCoords[1])) + normalFlowerCoords[1];
            color += texture2D(u_tex_flower5, rotated_uv).rgb;

            //////////////////glowing effect//////////////////
            float glowAnim = pow(sin(time),2.) * pow(cos(time*1.3),2.)*.7;
            float glowingScale[5];
            glowingScale[0] = 19.0;
            glowingScale[1] = 16.0;
            glowingScale[2] = 14.0;
            glowingScale[3] = 13.0;
            glowingScale[4] = 17.0;

            for (int i = 0; i < 5; i++)
            {
                vec2 flowerCoords = (normalFlowerCoords[i] - 0.5) * scale / scaleFactors + normal_tex_offset;
                float dist = distance(uvy, flowerCoords * resolution / resolution.y);
                float light = 1.0 - dist * glowingScale[i];
                if (light > 0.) 
                    color += vec3(pow(light, 3. + glowAnim));
            }
        }
    }

    gl_FragColor = vec4(color, 1.0);
}

