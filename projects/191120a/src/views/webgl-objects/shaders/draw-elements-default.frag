precision mediump float;

uniform vec2  resolution;
uniform float texture;
varying vec4  vColor;
varying vec2  vUv;
varying float vTime;

#define R resolution
#define T vTime

void main(void) {
  vec2 pos = (gl_FragCoord.xy * 2. - R) / max(R.x, R.y);

  vec2 uv = vUv;

  uv.x += sin(pos.y * 30. * texture + T) * length(pos);
  uv.y += cos(pos.x * 30. * texture + T) * length(pos);

  vec3 color = vColor.rgb * vec3(floor(uv * 2.) * .5, 1.);

  gl_FragColor = vec4(color, 1.);
}
