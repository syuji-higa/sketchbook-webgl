#version 300 es

layout (location = 0) in vec3 position;
out vec3 vPosition;

void main(void) {
  vec4 pos = vec4(position, 1.);

  pos.x = pos.x + sin(dot(pos.xy, pos.yz));
  pos.y = pos.y + cos(dot(pos.xy, pos.xz));

  gl_Position = pos;

  vPosition = pos.xyz;
}
