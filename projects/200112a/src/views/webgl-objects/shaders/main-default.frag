precision mediump float;

uniform float time;
uniform vec2 resolution;
uniform vec2 offset;
uniform sampler2D videoTexture;
uniform sampler2D maskTexture;
varying vec2 vUv;

#define T time
#define R resolution

void main(void) {
  vec2 pos = (gl_FragCoord.xy * 2. - R) / R;

  vec2 st = vUv * 2. - 1.;
  st.x *= -1.;
  vec4 frameColor = vec4(vec3(1. - smoothstep(1., max(abs(st.x), abs(st.y)), .95)), 1.);
  vec4 offset1FrameColor = vec4(vec3(1. - smoothstep(1., max(abs(st.x + offset.x * 2.), abs(st.y + offset.y * 2.)), .95)), 1.);
  vec4 offset2FrameColor = vec4(vec3(1. - smoothstep(1., max(abs(st.x - offset.x * 2.), abs(st.y - offset.y * 2.)), .95)), 1.);
  st = st * .5 + .5;

  vec4 maskColor = texture2D(maskTexture, st) * frameColor;
  vec4 baseColor = texture2D(videoTexture, st);

  vec4 offset1VideoColor = texture2D(videoTexture, vec2(st.x + offset.x, st.y + offset.y));
  vec4 offset1MaskColor =
    texture2D(maskTexture, vec2(st.x + offset.x, st.y + offset.y))
    * offset1FrameColor
    * vec4(vec3(
      min(step(offset.x, 1. - st.x), step(offset.y, 1. - st.y))
    ), 1.);

  vec4 offset2VideoColor = texture2D(videoTexture, vec2(st.x - offset.x, st.y - offset.y));
  vec4 offset2MaskColor =
    texture2D(maskTexture, vec2(st.x - offset.x, st.y - offset.y))
    * offset2FrameColor
    * vec4(vec3(
      min(step(offset.x, st.x), step(offset.y, st.y))
    ), 1.);
    
  vec4 smpColor =
    baseColor * (1. - max(offset1MaskColor.r, offset2MaskColor.r))
    + offset1VideoColor * offset1MaskColor
    + offset2VideoColor * offset2MaskColor
  ;

  gl_FragColor = smpColor;
}
