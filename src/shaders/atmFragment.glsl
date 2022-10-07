uniform float uTime;
uniform sampler2D t;
uniform sampler2D globeTexture;

varying vec3 vertexNormal;
varying vec3 vPosition;

void main()
{
   float intensity = pow( 0.65 - dot(vertexNormal, vec3(0.0, 0.0, 1.0)), 2.0);
   
    gl_FragColor =  vec4(0.3, 0.6, 1.0, 1.0) * intensity;
}