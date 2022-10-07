uniform float uTime;
uniform sampler2D texture1;

varying vec2 vertexUV;
varying vec3 vertexNormal;
varying vec3 vPosition;

void main()
{
    vertexUV = uv;
    vertexNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}