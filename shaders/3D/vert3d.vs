$version$
$precision$

// Includes normal mapping

layout (location = 0) in vec4 vertexPosition;
layout (location = 1) in vec3 vertexUV;
layout (location = 2) in vec4 vertexRGB;
layout (location = 3) in vec3 vertexNormal;
layout (location = 4) in vec3 vertexTangent;

uniform mat4 projection;
uniform mat4 model;
uniform mat4 view;
uniform mat4 invModel;
uniform bool hasNormalTexture;
uniform vec4 meshTint;

out vec3 UV;
out vec4 tint;
out vec3 normal;
out vec3 fragPos;
out vec3 Tangent0;

void main () {
    vec4 transformed = projection * view * model * vertexPosition;
    transformed.x = - transformed.x;
    gl_Position = transformed;
    UV = vec3(vertexUV.x, vertexUV.y, 1);
    tint = vertexRGB * meshTint;
    normal =  mat3(transpose(invModel)) * vertexNormal.xyz;
    fragPos = vec3(model * vertexPosition);
    Tangent0 = (model * vec4(vertexTangent, 0.0)).xyz;   
}