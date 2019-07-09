attribute vec3  position;
attribute vec2  uv;
uniform   mat4  mvpMatrix;
varying   vec2  vUv;

#define T time

void main(void) {
  vec4 pos = mvpMatrix * vec4(position, 1.);

  vUv = uv;

  gl_Position = pos;
}
