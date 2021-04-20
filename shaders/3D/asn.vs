#version $version$

#ifdef GL_ES
precision $precision$ float;
#endif

#define NORMAL_MAP $normalMap$
#define PARALLAX_MAP $parallaxMap$
#define VERTEX_RGB $vertexRGB$

layout (location = 0) in vec4 vertexPosition;
layout (location = 1) in vec3 vertexUV;
layout (location = 2) in vec4 vertexRGB;
layout (location = 3) in vec3 vertexNormal;

#if NORMAL_MAP || PARALLAX_MAP
layout (location = 4) in vec3 vertexTangent;
#endif

uniform mat4 projection;
uniform mat4 model;
uniform mat4 view;
uniform mat4 invModel;
uniform vec4 meshTint;
uniform vec2 UVScale;

out vec3 UV;
out vec4 tint;
out vec3 normal;
out vec3 fragPos;
out mat3 TBN;

mat3 getTBN (vec3 norm, vec3 tangentTheta) {
    vec3 Normal = normalize(norm);
    vec3 Tangent = normalize(tangentTheta);
    Tangent = normalize(Tangent - dot(Tangent, Normal) * Normal);
    vec3 Bitangent = cross(Tangent, Normal);
    return mat3(Tangent, Bitangent, Normal);
}

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
    vec3 tangentTheta = (model * vec4(vertexTangent, 0.0)).xyz;   
    TBN = getTBN(normal, tangentTheta);
#endif
}