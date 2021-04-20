#version $version$

#ifdef GL_ES
precision $precision$ float;
#endif

layout(location = 0) in vec2 vertexPos;
layout(location = 1) in vec2 vertexUV;

out vec2 UV;

void main() {
    gl_Position = vec4(vertexPos.xy, 0.0, 1.0); 
    UV = vertexUV;
}