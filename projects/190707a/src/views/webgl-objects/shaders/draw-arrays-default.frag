precision mediump float;

varying vec3 vColor;

void main(void) {
  vec2 pos = gl_PointCoord.xy * 2. - 1.;

  vec4 color = vec4(vColor, 1.) * step(length(pos), 1.);

  gl_FragColor = color;
}
