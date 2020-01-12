precision mediump float;

uniform float time;
uniform vec2 resolution;
uniform vec4 hands;
uniform vec4 elbows;
uniform sampler2D videoTexture;
uniform sampler2D maskTexture;
varying vec2 vUv;

#define T time
#define R resolution

float rand(vec2 co){
  return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main(void) {
  vec2 pos = (gl_FragCoord.xy * 2. - R) / R;

  vec2 st = vUv * 2. - 1.;
  st.x *= -1.;
  vec4 frameColor = vec4(vec3(1. - smoothstep(1., max(abs(st.x), abs(st.y)), .95)), 1.);
  st = st * .5 + .5;

  float rate =
    max(1. - distance(hands.xy, hands.zw), .3)
    * step(min(-elbows.y, -elbows.w), min(-hands.y, -hands.w))
  ;

  vec4 maskColor = texture2D(maskTexture, st) * frameColor;
  vec4 smpColor = texture2D(videoTexture,
    (st + (rand(vec2(T) + pos) - .5) * .05 * pow(rate, 2.)) * (1. - maskColor.r) +
    maskColor.r *
      vec2(
        st.x
          + sin(T * 20. * rate - pos.y * 50. * rate) * .04 * pow(rate, 2.)
        ,
        st.y
          + sin(T * 30. * rate - pos.x * 50. * rate) * .03 * pow(rate, 2.)
      )
  );

  gl_FragColor = smpColor
    + vec4(vec3(.8, .3, .1) * .2 * rate / length(pos + hands.xy), 1.)
    + vec4(vec3(.1, .8, .3) * .2 * rate / length(pos + hands.zw), 1.)
  ;
}
