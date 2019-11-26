#version 300 es

in vec3 position;
in vec2 uv;
in vec3 offset;
uniform mat4 mvpMatrix;
out vec2 vUv;

void main(void) {
  vec4 pos = mvpMatrix * vec4(position + offset * .5, 1.);

  vUv = uv;

  gl_Position = pos;
}
