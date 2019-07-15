precision mediump float;

uniform float time;
uniform vec2 resolution;
uniform vec4 eyes;
uniform float size;
uniform float darkMode;
uniform sampler2D texture;
varying vec2 vUv;

#define T time
#define R resolution

void main(void) {
  vec2 pos = (gl_FragCoord.xy * 2. - R) / min(R.x, R.y);

  vec2 st = vUv * 2. - 1.;
  st.x *= -1.;
  st = st * .5 + .5;

  vec4 smpColor = texture2D(texture, st);

  float eyeL = length(vec2(eyes.x - pos.x, eyes.y - pos.y));
  float eyeR = length(vec2(eyes.z - pos.x, eyes.w - pos.y));
  float dist = abs(eyeL - eyeR);
  float eyesSize = max(.05 * size * dist / eyeL, .05 * size * dist / eyeR) * (exp(sin(T * 4.) * 4.) / exp(4.)) * darkMode;
  vec4 eyesColor = vec4(vec3(eyesSize), 1.);

  gl_FragColor = smpColor + eyesColor;
}
