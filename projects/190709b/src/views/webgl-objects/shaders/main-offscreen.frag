precision mediump float;

uniform float time;
uniform vec2 resolution;
uniform float power;
uniform sampler2D beforeTexture;
uniform sampler2D currentTexture;
varying vec2 vUv;

#define T time
#define R resolution

void main(void) {
  vec2 pos = (gl_FragCoord.xy * 2. - R) / max(R.x, R.y);

  vec2 st = vUv * 2. - 1.;
  st.y *= -1.;
  st = st * .5 + .5;

  vec4 beforeSmpColor = texture2D(beforeTexture, st);
  vec4 currentSmpColor = texture2D(currentTexture, st);

  float bp = 0. + power;
  float cp = 1. - power;
  vec4 color = beforeSmpColor * bp + currentSmpColor * cp;

  gl_FragColor = color;
}
