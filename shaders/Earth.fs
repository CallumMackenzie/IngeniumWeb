$version$
$precision$

#define NR_POINT_LIGHTS $nlights$

struct Material {
    sampler2D diffuse;
    sampler2D specular;
    sampler2D normal;
    sampler2D darkDiffuse;
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
vec3 CalcBumpedNormal(vec2 cUV);
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

float random (in float x) {
    return fract(sin(x)*1e4);
}

float random (in vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233)))* 43758.5453123);
}

float pattern(vec2 st, vec2 v, float t) {
    vec2 p = floor(st+v);
    return step(t, random(100.+p*.000001)+random(p.x)*0.5 );
}

void main () 
{
    vec2 cUV = vec2(UV.x, 1.0 - UV.y);
    vec3 norm = CalcBumpedNormal(cUV);
    vec3 viewDir = normalize(viewPos - fragPos);
    vec3 result = CalcDirLight(dirLight, norm, viewDir, cUV);
#if NR_POINT_LIGHTS > 0
    for(int i = 0; i < NR_POINT_LIGHTS; i++)
        result += CalcPointLight(pointLights[i], norm, fragPos, viewDir, cUV);
#endif
    vec3 spc = texture((material.specular), cUV).rgb;
    if (length(spc) > 0.5) {
            vec2 st = fragPos.xy;
            vec2 grid = vec2(100.0,50.0);
            st *= grid;

            vec2 ipos = floor(st);
            vec2 fpos = fract(st);

            vec2 vel = vec2(u_time*2.0*max(grid.x, grid.y)); // time
            vel *= vec2(-1.0,0.0) * random(1.0 + ipos.y); // direction

            vec2 offset = vec2(0.1,0.0);

            vec3 c = vec3(0.0);
            c.r = pattern(st+offset,vel,0.5);
            c.g = pattern(st,vel,0.5);
            c.b = pattern(st-offset,vel,0.5);
            c *= step(0.2,fpos.y);
            result = c;
    }
    color = vec4(result, 1.0);
}

vec3 CalcBumpedNormal(vec2 cUV)
{
    vec3 Normal = normalize(normal);
    vec3 Tangent = normalize(Tangent0);
    Tangent = normalize(Tangent - dot(Tangent, Normal) * Normal);
    vec3 Bitangent = cross(Tangent, Normal);
    vec3 BumpMapNormal = texture(material.normal, cUV).rgb;
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
    vec3 diffuse;
    if (diff > 1.0) {
        diffuse  = light.diffuse  * diff * vec3(texture((material.darkDiffuse), coordUV.xy).rgba * tint.rgba);
    } else {
        diffuse  = light.diffuse  * diff * vec3(texture((material.diffuse), coordUV.xy).rgba * tint.rgba);
    }
    vec3 ambient  = light.ambient  * vec3(texture(material.diffuse, coordUV.xy).rgba * tint.rgba);
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
    vec3 diffuse;
    if (diff * attenuation > 1.0) {
        diffuse  = light.diffuse  * diff * vec3(texture((material.darkDiffuse), coordUV.xy).rgba * tint.rgba);
    } else {
        diffuse  = light.diffuse  * diff * vec3(texture((material.diffuse), coordUV.xy).rgba * tint.rgba);
    }
    vec3 ambient  = light.ambient  * vec3(texture(material.diffuse, coordUV.xy).rgba * tint.rgba);
    vec3 specular = light.specular * spec * vec3(texture(material.specular, coordUV.xy).rgba * tint.rgba);
    ambient  *= attenuation;
    diffuse  *= attenuation;
    specular *= attenuation;
    return (ambient + diffuse + specular);
} 
