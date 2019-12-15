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

  vPosition = position + velocity.xyz * velocity.w * .2;
  vec3 delta = vec3(mouse.x, mouse.y, sin(length(velocity) + T * .1) * .1) - vPosition;
  vVelocity = vec4(
    normalize(velocity.xyz + delta * .1),
    max(length(delta) * .01, .1)
  );
}
