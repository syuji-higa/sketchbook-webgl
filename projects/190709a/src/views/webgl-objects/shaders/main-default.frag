precision mediump float;

uniform float time;
uniform vec2 resolution;
uniform sampler2D texture;
uniform float power;
uniform float wave;
varying vec2 vUv;

#define T time
#define R resolution

void main(void) {
  vec2 pos = (gl_FragCoord.xy * 2. - R) / max(R.x, R.y);

  vec4 color = vec4(0.);

  for(int i = 0; i < 20; i++) {
    vec2 st = vUv * 2. - 1.;
    st.x *= -1.;
    st *= (1. - power) + (length(st) * (20. / float(i)) + sin(fract(T) * 3.14 * 2. + atan(pos.x, pos.y) * 36.) * pow(length(pos), 2.) * .2 * wave) * power;
    st = st * .5 + .5;

    vec4 smpColor = texture2D(texture, st);
    float rate = length(pos);
    color = (color * rate + smpColor * (1. - rate));
  }

  gl_FragColor = color;
}
