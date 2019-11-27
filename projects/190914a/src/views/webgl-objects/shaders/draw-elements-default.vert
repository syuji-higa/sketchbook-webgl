attribute vec3 position;
attribute vec3 normal;
uniform mat4  mvpMatrix;
uniform mat4 invMatrix;
uniform float time;
uniform vec3 lightDirection;
varying vec4 vColor;

#define T time

mat2 rotate(float a){
  float s = sin(a), c = cos(a);
  return mat2(c, -s, s, c);
}

void main(void) {
  vec3 invLight = normalize(invMatrix * vec4(lightDirection, 0.)).xyz;
  float dif = max(dot(normal, invLight), 0.);
  vColor = vec4(vec3(.5) * vec3(dif), 1.);

  vec3 p = position;

  p *= .3;
  // p.xy *= rotate(T);
  // p.yz *= rotate(T);

  gl_Position = mvpMatrix * vec4(p, 1.);
}
