precision mediump float;

uniform vec2 resolution;
varying vec4 vColor;

#define R resolution

void main(void) {
  // vec2 pos = (gl_FragCoord.xy * 2. - R) / max(R.x, R.y);

  // vec3 color = vec3(length(pos));
  vec3 color = vColor.rgb;

  gl_FragColor = vec4(color, 1.);
}
