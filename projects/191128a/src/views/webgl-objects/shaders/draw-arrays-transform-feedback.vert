#version 300 es

layout (location = 0) in vec3 position;
layout (location = 1) in vec3 velocity;
uniform float time;
out vec3 vPosition;
out vec3 vVelocity;

void main(void) {
  vec4 pos = vec4(position, 1.);

  gl_Position = pos;

  vPosition = position + velocity * .1;
  vec3 p = vec3(sin(time * 1.5), cos(time * 2.1), sin(time) * 0.25) - position;
  vVelocity = normalize(velocity + p * .2);
}
