$version$
$precision$

#define NR_POINT_LIGHTS $nlights$

struct Material {
    sampler2D diffuse;
    sampler2D specular;
    sampler2D normal;
    sampler2D parallax;
    float heightScale;
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
#if (NR_POINT_LIGHTS > 0)
uniform PointLight pointLights[NR_POINT_LIGHTS];
#endif
uniform vec3 viewPos;
uniform bool hasNormalTexture;

in vec3 UV;
in vec4 tint;
in vec3 normal;
in vec3 fragPos;
in vec3 Tangent0;

vec2 uvCorrect (vec2 uv_) {
    return vec2(uv_.x, 1.0 - uv_.y);
}

vec2 ParallaxMapping(vec2 texCoords, vec3 viewDir)
{ 
    const float minLayers = 8.0;
    const float maxLayers = 32.0;
    float numLayers = mix(maxLayers, minLayers, abs(dot(normal, viewDir)));  
    float layerDepth = 1.0 / numLayers;
    float currentLayerDepth = 0.0;
    vec2 P = viewDir.xy / viewDir.z * material.heightScale; 
    // vec2 P = viewDir.xy * material.heightScale;
    vec2 deltaTexCoords = P / numLayers;
  
    vec2  currentTexCoords     = texCoords;
    float currentDepthMapValue = texture(material.parallax, currentTexCoords).r;
      
    while(currentLayerDepth < currentDepthMapValue)
    {
        currentTexCoords -= deltaTexCoords;
        currentDepthMapValue = texture(material.parallax, currentTexCoords).r;  
        currentLayerDepth += layerDepth;  
    }
    
    vec2 prevTexCoords = currentTexCoords + deltaTexCoords;

    float afterDepth  = currentDepthMapValue - currentLayerDepth;
    float beforeDepth = texture(material.parallax, prevTexCoords).r - currentLayerDepth + layerDepth;
 
    float weight = afterDepth / (afterDepth - beforeDepth);
    vec2 finalTexCoords = prevTexCoords * weight + currentTexCoords * (1.0 - weight);

    return finalTexCoords;
}

mat3 getTBN () {
    vec3 Normal = normalize(normal);
    vec3 Tangent = normalize(Tangent0);
    Tangent = normalize(Tangent - dot(Tangent, Normal) * Normal);
    vec3 Bitangent = cross(Tangent, Normal);
    return mat3(Tangent, Bitangent, Normal);
}

vec3 CalcBumpedNormal(vec2 cUV, mat3 TBN)
{
    vec3 BumpMapNormal = texture(material.normal, cUV).xyz;
    BumpMapNormal = (2.0 * BumpMapNormal) - 1.0;
    vec3 NewNormal = TBN * BumpMapNormal;
    NewNormal = normalize(NewNormal);
    return NewNormal;
}

void main () 
{
    mat3 tbn = getTBN();
    vec2 cUV = vec2(UV.x, UV.y);
    // vec3 viewDir = normalize(viewPos - fragPos);
    vec3 tangentViewDir = normalize((tbn * viewPos) - (tbn * fragPos));
    cUV = ParallaxMapping(cUV, tangentViewDir);
    if(cUV.x > 1.0 || cUV.y > 1.0 || cUV.x < 0.0 || cUV.y < 0.0)
        discard;
    vec3 norm = CalcBumpedNormal(cUV, tbn);
    DirLight dl = dirLight;
    // dl.direction = tbn * dirLight.direction;
    vec3 result = CalcDirLight(dl, norm, tangentViewDir, cUV);
#if NR_POINT_LIGHTS > 0
    for(int i = 0; i < NR_POINT_LIGHTS; i++) {
        result += CalcPointLight(pointLights[i], norm, fragPos, tangentViewDir, cUV);
    }
#endif
    color = vec4(result, 1.0);
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
    vec3 halfwayDir = normalize(lightDir + viewDir);
    float spec = pow(max(dot(normal, halfwayDir), 0.0), material.shininess);
    float distance    = length(light.position - cfragPos);
    float attenuation = 1.0 / (light.constant + light.linear * distance + 
  			     light.quadratic * (distance * distance));    
    vec3 ambient  = light.ambient  * vec3(texture(material.diffuse, coordUV.xy).rgba * tint.rgba);
    vec3 diffuse  = light.diffuse  * diff * vec3(texture(material.diffuse, coordUV.xy).rgba * tint.rgba);
    vec3 specular = light.specular * spec * vec3(texture(material.specular, coordUV.xy).rgba * tint.rgba);
    ambient  *= attenuation;
    diffuse  *= attenuation;
    specular *= attenuation;
    return (ambient + diffuse + specular);
} 
