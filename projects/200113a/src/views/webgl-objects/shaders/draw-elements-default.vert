#version 300 es

layout (location = 0) in vec3 position;
layout (location = 1) in vec4 velocity;
uniform mat4 mvpMatrix;
uniform float time;
out vec3 vColor;

#define T time

void main(void) {
  vec4 pos = mvpMatrix * vec4(position, 1.);

  velocity;

  vColor = vec3(
    sin(pos.x + T + 1.1) * .25 + .75,
    cos(pos.y + T + 1.3) * .25 + .75,
    cos(pos.z + T + 1.7) * .25 + .75
  );

  gl_Position = pos;
}
