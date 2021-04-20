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

struct Camera {
    mat4 projection;
    mat4 view;
};
struct Mesh {
    mat4 transform;
    mat4 inverseTransform;
    vec4 tint;
    vec2 scaleUV;
};

uniform Mesh mesh;
uniform Camera camera;

out vec2 UV;
out vec4 tint;
out vec3 normal;
out vec3 fragPos;
out mat3 TBN;

mat3 getTBN (vec3 norm, vec3 tangentTheta) {
    norm = normalize(norm);
    vec3 tangent = normalize(tangentTheta);
    tangent = normalize(tangent - dot(tangent, norm) * norm);
    vec3 bitangent = cross(tangent, norm);
    return mat3(tangent, bitangent, norm);
}

void main () {
    vec4 transformed = camera.projection * camera.view * mesh.transform * vertexPosition;
    transformed.x = -transformed.x;
    gl_Position = transformed;
    UV = vertexUV.xy * mesh.scaleUV;
#if VERTEX_RGB
    tint = vertexRGB * mesh.tint;
#else
    tint = mesh.tint;
#endif
    normal = mat3(transpose(mesh.inverseTransform)) * vertexNormal;
    fragPos = vec3(mesh.transform * vertexPosition);

#if NORMAL_MAP || PARALLAX_MAP
    vec3 tangentTheta = (mesh.transform * vec4(vertexTangent, 0.0)).xyz;   
    TBN = getTBN(normal, tangentTheta);
#endif
}