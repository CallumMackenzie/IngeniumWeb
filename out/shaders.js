var version = "300 es";
export class ShaderSourceTypes {
}
ShaderSourceTypes.vert = "vertex";
ShaderSourceTypes.frag = "fragment";
;
export class ShaderSource {
    constructor(paramDict, type, name, src) {
        this.params = paramDict;
        this.source = src;
        this.type = type;
        ShaderSource.shaders[name] = this;
    }
    static shaderWithParams(shaderName, paramDict = {}) {
        var keys = Object.keys(paramDict);
        var ss = ShaderSource.shaders[shaderName];
        var src = ss.source;
        var exp = ss.getExpectedParams();
        for (var j = 0; j < exp.length; j++) {
            if (keys.includes(exp[j])) {
                var pName = keys[keys.indexOf(exp[j])];
                src = src.replace("$" + pName + "$", paramDict[pName]);
            }
            else {
                src = src.replace("$" + exp[j] + "$", ss.params[exp[j]]);
            }
        }
        return src;
    }
    static getShader(name) {
        return ShaderSource.shaders[name];
    }
    static getAllShaderNames() {
        return Object.keys(ShaderSource.shaders);
    }
    static defVert() {
        return ShaderSource.shaderWithParams("vert3D");
    }
    static defFrag(nLights = ShaderSource.getShader("blinnPhong").params["nLights"]) {
        return ShaderSource.shaderWithParams("blinnPhong", { nLights: nLights });
    }
    getExpectedParams() {
        return Object.keys(this.params);
    }
}
ShaderSource.shaders = {};
new ShaderSource({ fPrecision: "highp" }, ShaderSourceTypes.vert, "vert3D", `#version ${version}
precision $fPrecision$ float;

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
    tint = vertexRGB.rgba;
    normal =  mat3(transpose(invModel)) * vertexNormal.xyz;
    fragPos = vec3(model * vertexPosition);

    if (hasNormalTexture) {
        Tangent0 = (model * vec4(vertexTangent, 0.0)).xyz;   
    }
}
`);
var partialFragShader = `#version ${version}
precision $fPrecision$ float;

#define NR_POINT_LIGHTS $nLights$

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

vec3 CalcDirLight(DirLight light, vec3 cnormal, vec3 viewDir, vec2 coordUV);  
vec3 CalcPointLight(PointLight light, vec3 cnormal, vec3 fragPos, vec3 viewDir, vec2 coordUV);  
vec3 CalcBumpedNormal(vec2 cUV);

layout (location = 0) out vec4 color;

uniform float u_time;
uniform Material material;
uniform DirLight dirLight;
#if NR_POINT_LIGHTS > 0
uniform PointLight pointLights[NR_POINT_LIGHTS];
#endif
uniform vec3 viewPos;
uniform bool hasNormalTexture;

in vec3 UV;
in vec4 tint;
in vec3 normal;
in vec3 fragPos;
in vec3 Tangent0;

void main () 
{
    vec2 cUV = vec2(UV.x, 1.0 - UV.y);
    vec3 norm;
    if (hasNormalTexture) {
        norm = CalcBumpedNormal(cUV); // normalize(TBN * (texture(material.normal, cUV).rgb * 2.0 - 1.0));
    } else {
        norm = normalize(normal); 
    }
    vec3 viewDir = normalize(viewPos - fragPos);
    vec3 result = CalcDirLight(dirLight, norm, viewDir, cUV);

#if NR_POINT_LIGHTS > 0
    for(int i = 0; i < NR_POINT_LIGHTS; i++)
        result += CalcPointLight(pointLights[i], norm, fragPos, viewDir, cUV);
#endif

    color = vec4(result, 1.0);
}

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
`;
new ShaderSource({ nLights: 0, fPrecision: "mediump" }, ShaderSourceTypes.frag, "blinnPhong", partialFragShader + `
vec3 CalcDirLight(DirLight light, vec3 cnormal, vec3 viewDir, vec2 coordUV)
{
    vec3 lightDir = normalize(-light.direction);
    float diff = max(dot(cnormal, lightDir), 0.0);
    vec3 halfwayDir = normalize(lightDir + viewDir);
    float spec = pow(max(dot(normal, halfwayDir), 0.0), material.shininess);
    vec3 ambient  = light.ambient  * vec3(texture(material.diffuse, coordUV.xy).rgba + tint.rgba);
    vec3 diffuse  = light.diffuse  * diff * vec3(texture((material.diffuse), coordUV.xy).rgba + tint.rgba);
    vec3 specular = light.specular * spec * vec3(texture(material.specular, coordUV.xy).rgba + tint.rgba);
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
    vec3 ambient  = light.ambient  * vec3(texture(material.diffuse, coordUV.xy).rgba + tint.rgba);
    vec3 diffuse  = light.diffuse  * diff * vec3(texture(material.diffuse, coordUV.xy).rgba + tint.rgba);
    vec3 specular = light.specular * spec * vec3(texture(material.specular, coordUV.xy).rgba + tint.rgba);
    ambient  *= attenuation;
    diffuse  *= attenuation;
    specular *= attenuation;
    return (ambient + diffuse + specular);
} 
`);
new ShaderSource({ nLights: 0, fPrecision: "mediump" }, ShaderSourceTypes.frag, "phong", partialFragShader + `
vec3 CalcDirLight(DirLight light, vec3 cnormal, vec3 viewDir, vec2 coordUV)
{
    vec3 lightDir = normalize(-light.direction);
    float diff = max(dot(cnormal, lightDir), 0.0);
    vec3 reflectDir = reflect(-lightDir, cnormal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);
    vec3 ambient  = light.ambient  * vec3(texture(material.diffuse, coordUV.xy).rgba + tint.rgba);
    vec3 diffuse  = light.diffuse  * diff * vec3(texture((material.diffuse), coordUV.xy).rgba + tint.rgba);
    vec3 specular = light.specular * spec * vec3(texture(material.specular, coordUV.xy).rgba + tint.rgba);
    return (ambient + diffuse + specular);
} 

vec3 CalcPointLight(PointLight light, vec3 cnormal, vec3 cfragPos, vec3 viewDir, vec2 coordUV)
{
    vec3 lightDir = normalize(light.position - cfragPos);
    float diff = max(dot(cnormal, lightDir), 0.0);
    vec3 reflectDir = reflect(-lightDir, cnormal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);
    float distance    = length(light.position - cfragPos);
    float attenuation = 1.0 / (light.constant + light.linear * distance + light.quadratic * (distance * distance));    
    vec3 ambient  = light.ambient  * vec3(texture(material.diffuse, coordUV.xy).rgba + tint.rgba);
    vec3 diffuse  = light.diffuse  * diff * vec3(texture(material.diffuse, coordUV.xy).rgba + tint.rgba);
    vec3 specular = light.specular * spec * vec3(texture(material.specular, coordUV.xy).rgba + tint.rgba);
    ambient  *= attenuation;
    diffuse  *= attenuation;
    specular *= attenuation;
    return (ambient + diffuse + specular);
} 
`);
//# sourceMappingURL=shaders.js.map