#version 300 es

in vec3 position;
in vec3 offset;
uniform mat4 mvpMatrix;
uniform float time;
out vec3 vColor;

#define T time

void main(void) {
  vec4 pos = mvpMatrix * vec4(
    position.xyz + offset * vec3(.8, .8, .1) - vec3(0., 0., .1)
    , 1.
  );

  vColor = vec3(
    abs(sin(pos.x + T)) * 1.5,
    abs(cos(pos.y + T)) * 1.5,
    sin(length(pos) + T) * .75
  );

  pos.x = pos.x + sin(dot(pos.xy, pos.yz) + T * .97) * .5;
  pos.y = pos.y + cos(dot(pos.xy, pos.xz) + T * .79) * .5;

  gl_Position = pos;
  gl_PointSize = (1. - pos.z) * 32.;
}
