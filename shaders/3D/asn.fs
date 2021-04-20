#version $version$

#ifdef GL_ES
precision $precision$ float;
#endif

#define $model$ 1
#define NORMAL_MAP $normalmap$
#define PARALLAX_MAP $parallaxmap$

#define MAX_POINT_LIGHTS $nlights$

layout (location = 0) out vec4 color;

struct Material {
    sampler2D diffuse;
    sampler2D specular;
    sampler2D normal;
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

uniform float u_time;
uniform Material material;
uniform DirLight dirLight;
uniform vec3 viewPos;
uniform int numlights;

#if (MAX_POINT_LIGHTS > 0)
uniform PointLight pointLights[MAX_POINT_LIGHTS];
#endif

in vec3 UV;
in vec4 tint;
in vec3 normal;
in vec3 fragPos;

#if PARALLAX_MAP || NORMAL_MAP
in vec3 Tangent0;
#endif


vec3 CalcBumpedNormal(vec2 cUV)
{
    vec3 Normal = normalize(normal);
    vec3 Tangent = normalize(Tangent0);
    Tangent = normalize(Tangent - dot(Tangent, Normal) * Normal);
    vec3 Bitangent = cross(Tangent, Normal);
    vec3 BumpMapNormal = texture(material.normal, cUV).xyz;
    BumpMapNormal = 2.0 * BumpMapNormal - vec3(1.0, 1.0, 1.0);
    vec3 NewNormal;
    mat3 TBN = mat3(Tangent, Bitangent, Normal);
    NewNormal = TBN * BumpMapNormal;
    NewNormal = normalize(NewNormal);
    return NewNormal;
}
vec3 CalcDirLight(DirLight light, vec3 cnormal, vec3 viewDir, vec2 coordUV)
{
    vec3 lightDir = normalize(-light.direction);
    float diff = max(dot(cnormal, lightDir), 0.0);
    vec3 reflectDir = reflect(-lightDir, cnormal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);
    vec3 ambient  = light.ambient  * vec3(texture(material.diffuse, coordUV.xy).rgba * tint.rgba);
    vec3 diffuse  = light.diffuse  * diff * vec3(texture((material.diffuse), coordUV.xy).rgba * tint.rgba);
    vec3 specular = light.specular * spec * vec3(texture(material.specular, coordUV.xy).rgba * tint.rgba);
    return (ambient + diffuse + specular);
} 
vec3 CalcPointLight(PointLight light, vec3 cnormal, vec3 cfragPos, vec3 viewDir, vec2 coordUV)
{
    vec3 lightDir = normalize(light.position - cfragPos);
    float diff = max(dot(cnormal, lightDir), 0.0);
#if defined(PHONG)
    vec3 reflectDir = reflect(-lightDir, cnormal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);
#endif
#if defined(BLINN)
    vec3 halfwayDir = normalize(lightDir + viewDir);
    float spec = pow(max(dot(normal, halfwayDir), 0.0), material.shininess);
#endif
    float distance    = length(light.position - cfragPos);
    float attenuation = 1.0 / (light.constant + light.linear * distance + light.quadratic * (distance * distance));    
    vec3 ambient  = light.ambient  * vec3(texture(material.diffuse, coordUV.xy).rgba * tint.rgba);
    vec3 diffuse  = light.diffuse  * diff * vec3(texture(material.diffuse, coordUV.xy).rgba * tint.rgba);
    vec3 specular = light.specular * spec * vec3(texture(material.specular, coordUV.xy).rgba * tint.rgba);
    ambient  *= attenuation;
    diffuse  *= attenuation;
    specular *= attenuation;
    return (ambient + diffuse + specular);
}

void main () 
{
    vec2 cUV = vec2(UV.x, UV.y);
#if NORMAL_MAP
    vec3 norm = CalcBumpedNormal(cUV);
#else
    vec3 norm = normalize(normal);
#endif
    vec3 viewDir = normalize(viewPos - fragPos);
    vec3 result = CalcDirLight(dirLight, norm, viewDir, cUV);
#if MAX_POINT_LIGHTS > 0
    for(int i = 0; i < numlights; i++)
        result += CalcPointLight(pointLights[i], norm, fragPos, viewDir, cUV);
#endif
    color = vec4(result, 1.0);
}