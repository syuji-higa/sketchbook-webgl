precision mediump float;

uniform float time;
uniform vec2 resolution;
uniform float power;
uniform sampler2D texture;
varying vec2 vUv;

#define T time
#define R resolution

const int maxStep = 32;

float df(vec3 p, vec3 c) {
    return length(p) * power - length(c);
}

vec3 norm(vec3 p, vec3 c) {
    vec2 e = vec2(.001, 0.);
    return normalize(vec3(
        df(p + e.xyy, c) - df(p - e.xyy, c),
        df(p + e.yxy, c) - df(p - e.yxy, c),
        df(p + e.yyx, c) - df(p - e.yyx, c)
    ));
}

void main(void) {
  vec2 p = (gl_FragCoord.xy * 2. - R) / max(R.x, R.y);

  vec2 uv = vUv * 2. - 1.;
  uv.x *= -1.;
  uv = uv * .5 + .5;

  vec4 smpColor = texture2D(texture, uv);

  vec3 cp = vec3(0., 0., -1.);
  vec3 cf = vec3(0., 0., 1.);
  vec3 cu = vec3(0., 1., 0.);
  vec3 cl = cross(cu, cf);
  float td = 1.;

  vec3 ray = normalize(p.x * cl + p.y * cu + td * cf);

  bool hit = false;
  vec3 hp = vec3(0.);
  vec3 hn = vec3(0.);
  int st = 0;
  float t = 0.;
  
  for(int i = 0; i < maxStep; i++) {
    vec3 rp = cp + t * ray;
    float d = df(rp, smpColor.rgb);
    if(d < .001) {
      hit = true;
      hp = rp;
      hn = norm(rp, smpColor.rgb);
      st = i;
      break;
    }
    t += d;
  }

  vec3 c = vec3(0.);
  if(hit) {
    vec3 lp = vec3(0., 0., -1.);
    vec3 ld = normalize(lp - hp);
    float dif = max(dot(hn, ld), .0);
    c = (vec3(1.)) * dif;
  }

  float cc = step(1., vec3(length(c))).x;

  vec3 color = 1. > cc ? vec3(0.) : smpColor.xyz;

  gl_FragColor = vec4(color, 1.);
}
