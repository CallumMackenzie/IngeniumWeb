$version$
$precision$

#define NR_POINT_LIGHTS $nlights$

struct Material {
    sampler2D diffuse;
    sampler2D specular;
    float shininess;
};
struct DirLight {
    vec3 direction;
  
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};  
struct PointLight {    
    vec3 position;
    
    float constant;
    float linear;
    float quadratic;  

    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};  

vec3 CalcDirLight(DirLight light, vec3 cnormal, vec3 viewDir, vec2 coordUV);  
vec3 CalcPointLight(PointLight light, vec3 cnormal, vec3 fragPos, vec3 viewDir, vec2 coordUV);  


layout (location = 0) out vec4 color;

uniform float u_time;
uniform Material material;
uniform DirLight dirLight;
#if NR_POINT_LIGHTS > 0
uniform PointLight pointLights[NR_POINT_LIGHTS];
#endif
uniform vec3 viewPos;

in vec3 UV;
in vec4 tint;
in vec3 normal;
in vec3 fragPos;

void main () 
{
    // vec2 cUV = vec2(UV.x / UV.z, 1 - (UV.y / UV.z));
    vec2 cUV = vec2(UV.x, 1.0 - UV.y);
    color = vec4(texture(material.diffuse, cUV) * tint);
}
