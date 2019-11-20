attribute vec3  position;
attribute vec3  normal;
attribute vec2  uv;
uniform   float time;
uniform   mat4  mvpMatrix;
uniform   mat4  invMatrix;
varying   vec4  vColor;
varying   vec2  vUv;
varying   float vTime;

#define T time

void main(void) {
  vec3 lightPos = vec3(-2., 2., 2.);
  vec3 cameraPos = vec3(0., 0., 2.);
  
  vec3 lightDir = normalize(invMatrix * vec4(lightPos, 0.)).xyz;
  vec3 cameraDir = normalize(invMatrix * vec4(cameraPos, 0.)).xyz;
  
  vec3 halfLE = normalize(lightDir + cameraDir);

  float dif = max(dot(normal, lightDir), 0.);
  float spe = pow(max(dot(normal, halfLE), 0.), 8.) * .02;

  vColor = vec4(vec3(.8) * dif + spe + vec3(.1, .1, .2), 1.);

  vUv = uv;
  vTime = time;

  vec3 p = position;

  gl_Position = mvpMatrix * vec4(p, 1.);
}
