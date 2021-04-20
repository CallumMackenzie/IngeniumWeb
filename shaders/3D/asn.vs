#version $version$

#ifdef GL_ES
precision $precision$ float;
#endif

#define NORMAL_MAP $normalmap$
#define PARALLAX_MAP $parallaxmap$
#define VERTEX_RGB $vertexrgb$

layout (location = 0) in vec4 vertexPosition;
layout (location = 1) in vec3 vertexUV;
#if VERTEX_RGB
layout (location = 2) in vec4 vertexRGB;
layout (location = 3) in vec3 vertexNormal;
#else
layout (location = 2) in vec3 vertexNormal;
#endif

#if NORMAL_MAP || PARALLAX_MAP
layout (location = 4) in vec3 vertexTangent;
#endif

uniform mat4 projection;
uniform mat4 model;
uniform mat4 view;
uniform mat4 invModel;
uniform bool hasNormalTexture;
uniform vec4 meshTint;
uniform vec2 UVScale;

out vec3 UV;
out vec4 tint;
out vec3 normal;
out vec3 fragPos;
out vec3 Tangent0;

void main () {
    vec4 transformed = projection * view * model * vertexPosition;
    transformed.x = - transformed.x;
    gl_Position = transformed;
    UV = vertexUV * vec3(UVScale, 1.0);
#if VERTEX_RGB
    tint = vertexRGB * meshTint;
#else
    tint = meshTint;
#endif
    normal = mat3(transpose(invModel)) * vertexNormal.xyz;
    fragPos = vec3(model * vertexPosition);

#if NORMAL_MAP || PARALLAX_MAP
    Tangent0 = (model * vec4(vertexTangent, 0.0)).xyz;   
#endif
}