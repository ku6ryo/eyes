export default `
precision highp float;
varying vec2 vUV;
uniform sampler2D textureSampler;
uniform float time;

const float CHECK_SIZE = 50.0;
void main(void) {
  float x_thing = step(CHECK_SIZE / 2.0 / sin(time) / sin(time), mod(gl_FragCoord.x, CHECK_SIZE));
  float y_thing = step(CHECK_SIZE / 2.0 / cos(time) / cos(time), mod(gl_FragCoord.y, CHECK_SIZE));

  bool condition1 = x_thing > 0.5 && y_thing < 0.5;
  bool condition2 = x_thing < 0.5 && y_thing > 0.5;

  vec3 color;
  if (condition1 || condition2) {
    color = vec3(sin(time), cos(time * 0.5), cos(time * 0.2));
  } else {
    color = vec3(1.0, 1.0, 1.0);
  }

  gl_FragColor = vec4(color, 1.0);
}
` 