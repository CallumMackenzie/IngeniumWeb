#version $version$

#ifdef GL_ES
precision $precision$ float;
#endif

#define $lightModel$ 1
#define NORMAL_MAP $normalMap$
#define PARALLAX_MAP $parallaxMap$
#define PARALLAX_CLIP_EDGE $parallaxClipEdge$
#define PARALLAX_INVERT $parallaxInvert$
#define MAX_POINT_LIGHTS $maxPointLights$

layout (location = 0) out vec4 color;

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

uniform float u_time;
uniform Material material;
uniform DirLight dirLight;
uniform vec3 viewPos;
uniform int numlights;

#if (MAX_POINT_LIGHTS > 0)
uniform PointLight pointLights[MAX_POINT_LIGHTS];
#endif

in vec2 UV;
in vec4 tint;
in vec3 normal;
in vec3 fragPos;

#if PARALLAX_MAP || NORMAL_MAP
in mat3 TBN;
#endif

#if NORMAL_MAP
vec3 CalcBumpedNormal(vec2 cUV)
{
    vec3 BumpMapNormal = texture(material.normal, cUV).xyz;
    BumpMapNormal = 2.0 * BumpMapNormal - vec3(1.0, 1.0, 1.0);
    vec3 NewNormal = TBN * BumpMapNormal;
    NewNormal = normalize(NewNormal);
    return NewNormal;
}
#endif // NORMAL_MAP

#if !defined(NONE)
vec4 CalcDirLight(DirLight light, vec3 cnormal, vec3 viewDir, vec2 coordUV)
{
    vec3 lightDir = normalize(-light.direction);
    float diff = max(dot(cnormal, lightDir), 0.0);
    vec3 reflectDir = reflect(-lightDir, cnormal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);
    vec4 ambient  = vec4(light.ambient, 1.0)  * (texture(material.diffuse, coordUV).rgba * tint.rgba);
    vec4 diffuse  = vec4(light.diffuse  * diff, 1.0) * (texture((material.diffuse), coordUV).rgba * tint.rgba);
    vec4 specular = vec4(light.specular * spec, 1.0) * (texture(material.specular, coordUV).rgba * tint.rgba);
    return vec4(ambient.rgb + diffuse.rgb + specular.rgb, (ambient.a + diffuse.a + specular.a) * 0.333);
} 

vec4 CalcPointLight(PointLight light, vec3 cnormal, vec3 cfragPos, vec3 viewDir, vec2 coordUV)
{
    vec3 lightDir = normalize(light.position - cfragPos);
    float diff = max(dot(cnormal, lightDir), 0.0);
    #if defined(PHONG)  
    vec3 reflectDir = reflect(-lightDir, cnormal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);
    #endif // defined(PHONG)
    #if defined(BLINN)
    vec3 halfwayDir = normalize(lightDir + viewDir);
    float spec = pow(max(dot(normal, halfwayDir), 0.0), material.shininess);
    #endif // defined(BLINN)
    float distance    = length(light.position - cfragPos);
    float attenuation = 1.0 / (light.constant + light.linear * distance + light.quadratic * (distance * distance));    
    vec4 ambient  = vec4(light.ambient, 1.0)  * texture(material.diffuse, coordUV).rgba * tint.rgba;
    vec4 diffuse  = vec4(light.diffuse * diff, 1.0) * texture(material.diffuse, coordUV).rgba * tint.rgba;
    vec4 specular = vec4(light.specular * spec, 1.0) * texture(material.specular, coordUV).rgba * tint.rgba;
    ambient  *= attenuation;
    diffuse  *= attenuation;
    specular *= attenuation;
    return vec4(ambient.rgb + diffuse.rgb + specular.rgb, (ambient.a * diffuse.a * specular.a) * 0.333);
}
#endif // !defined(NONE)

#if PARALLAX_MAP
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
    #if PARALLAX_INVERT
    float currentDepthMapValue = 1.0 - texture(material.parallax, currentTexCoords).r;
    #else
    float currentDepthMapValue = texture(material.parallax, currentTexCoords).r;
    #endif
      
    while(currentLayerDepth < currentDepthMapValue)
    {
        currentTexCoords -= deltaTexCoords;
    #if PARALLAX_INVERT
        currentDepthMapValue = 1.0 - texture(material.parallax, currentTexCoords).r; 
    #else
        currentDepthMapValue = texture(material.parallax, currentTexCoords).r; 
    #endif 
        currentLayerDepth += layerDepth;  
    }
    
    vec2 prevTexCoords = currentTexCoords + deltaTexCoords;

    float afterDepth  = currentDepthMapValue - currentLayerDepth;
    #if PARALLAX_INVERT
    float beforeDepth = 1.0 - texture(material.parallax, prevTexCoords).r - currentLayerDepth + layerDepth;
    #else
    float beforeDepth = texture(material.parallax, prevTexCoords).r - currentLayerDepth + layerDepth;
    #endif // PARALLAX_INVERT
    float weight = afterDepth / (afterDepth - beforeDepth);
    vec2 finalTexCoords = prevTexCoords * weight + currentTexCoords * (1.0 - weight);

    return finalTexCoords;
}
#endif // PARALLAX_MAP

void main () 
{
    vec2 cUV = UV;
    vec3 viewDir = normalize(viewPos - fragPos);
#if PARALLAX_MAP
    vec3 tangentViewDir = normalize(TBN * viewDir);
    cUV = ParallaxMapping(cUV, tangentViewDir);
    #if PARALLAX_CLIP_EDGE
    if(cUV.x > 1.0 || cUV.y > 1.0 || cUV.x < 0.0 || cUV.y < 0.0)
        discard;
    #endif
#endif

#if NORMAL_MAP
    vec3 norm = CalcBumpedNormal(cUV);
#else
    vec3 norm = normalize(normal);
#endif
#if PARALLAX_MAP
    vec4 result = CalcDirLight(dirLight, norm, tangentViewDir, cUV);
#else
    #if !defined(NONE)
    vec4 result = CalcDirLight(dirLight, norm, viewDir, cUV);
    #else
    vec4 result = texture(material.diffuse, cUV).rgba * tint.rgba;
    #endif
#endif
#if !defined(NONE)
    #if MAX_POINT_LIGHTS > 0
    for(int i = 0; i < numlights; i++) {
        #if PARALLAX_MAP
        result += CalcPointLight(pointLights[i], norm, fragPos, tangentViewDir, cUV);
        #else
        result += CalcPointLight(pointLights[i], norm, fragPos, viewDir, cUV);
        #endif
    }
    result.a /= float(numlights);
    #endif
#endif
    color = result;
}