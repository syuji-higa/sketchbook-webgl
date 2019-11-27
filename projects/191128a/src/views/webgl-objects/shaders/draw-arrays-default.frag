#version 300 es

precision highp float;

in vec3 vColor;
out vec4 outColor;

void main(void) {
  vec2 pos = gl_PointCoord.xy * 2. - 1.;

  vec4 color = vec4(vColor, 1.) * step(length(pos), 1.);

  outColor = color;
}
