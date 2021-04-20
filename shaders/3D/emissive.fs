#version $version$

#ifdef GL_ES
precision $precision$ float;
#endif

#define NR_POINT_LIGHTS $nlights$

layout (location = 0) out vec4 color;

struct Material {
    sampler2D diffuse;
};

uniform float u_time;
uniform Material material;
uniform vec3 viewPos;

in vec3 UV;
in vec4 tint;
in vec3 normal;
in vec3 fragPos;

void main () 
{
    vec2 cUV = UV.xy;
    color = vec4(texture(material.diffuse, cUV) * tint);
}
