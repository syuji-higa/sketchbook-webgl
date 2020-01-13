#version 300 es

layout (location = 0) in vec3 position;
layout (location = 1) in vec4 velocity;
uniform float time;
uniform vec2 mouse;
out vec3 vPosition;
out vec4 vVelocity;

#define T time

void main(void) {
  vec4 pos = vec4(position, 1.);

  gl_Position = pos;

  vPosition = position + (1. - abs(pos.x)) * (1. - abs(pos.y));
  vVelocity = vec4(0.);
}
