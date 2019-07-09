precision mediump float;

uniform float time;
uniform vec2 resolution;
uniform sampler2D texture;
varying vec2 vUv;

#define T time
#define R resolution

void main(void) {
  vec2 pos = (gl_FragCoord.xy * 2. - R) / max(R.x, R.y);
  
  vec2 st = vUv * 2. - 1.;
  st.x *= -1.;
  st = st * .5 + .5;

  vec4 smpColor = texture2D(texture, st);

  gl_FragColor = smpColor;
}
