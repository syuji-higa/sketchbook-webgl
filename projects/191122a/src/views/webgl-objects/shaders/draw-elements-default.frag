#version 300 es

precision highp float;

uniform float time;
uniform vec2 resolution;
uniform sampler2D texture2dSampler;
in vec2 vUv;
out vec4 outColor;

#define T time
#define R resolution

void main(void) {
  vec2 pos = (gl_FragCoord.xy * 2. - R) / max(R.x, R.y);

  vec2 st = vUv * 2. - 1.;
  st = st * length(vec2(pos.x + sin(T), pos.y + cos(T)) * .5);
  st = st * .5 + .5;

  vec4 smpColor = texture(texture2dSampler, st);

  outColor = smpColor;
}
