$version$
$precision$

struct Camera2D {
    mat2 rotation;
    vec2 translation;
    float aspect;
    vec2 rotationPoint;
};

struct Mesh2D {
    mat2 rotation;
    vec2 scale;
    vec2 translation;
    vec2 rotationPoint;
    float zIndex;
    vec4 tint;
};

layout (location = 0) in vec2 vertexPos;
layout (location = 1) in vec2 vertexUV;
layout (location = 2) in vec4 vertexRGB;

uniform Camera2D camera;
uniform Mesh2D model;

out vec2 UV;
out vec4 tint;

void main () {
    UV = vertexUV;
    tint = vertexRGB * model.tint;
    vec2 postRotationTranslation = model.translation + camera.rotationPoint + camera.translation;
    vec2 transformed =  camera.rotation * (model.rotation * ((model.scale * vertexPos) + model.rotationPoint) + postRotationTranslation);
    gl_Position = vec4(transformed.x * camera.aspect, transformed.y, model.zIndex, 1.0);
}