#version 300 es

layout (location = 0) in vec3 position;
layout (location = 1) in vec3 velocity;
uniform mat4 mvpMatrix;
uniform float time;
out vec3 vColor;

#define T time

void main(void) {
  vec4 pos = mvpMatrix * vec4(position, 1.);

  vColor = vec3(
    abs(sin(pos.x + T)) * 1.5,
    abs(cos(pos.y + T)) * 1.5,
    sin(length(pos) + T) * .75 + velocity.z
  );

  gl_Position = pos;
  gl_PointSize = 1.;
}
