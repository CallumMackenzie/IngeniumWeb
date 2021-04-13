"use strict";

import { Shader } from "./WebGL.js";

var version: string = "300 es";

export class ShaderSourceTypes {
    static vert: string = "vertex";
    static frag: string = "fragment";
};

var defaults: string[] = ["vert3d", "phong"];

export class ShaderSource {
    static shaders: any = {};
    static shaderWithParams(shaderName: string, paramDict: { [id: string]: any; } = {}): string {
        var keys: string[] = Object.keys(paramDict);
        var ss: ShaderSource = ShaderSource.shaders[shaderName];
        var src: string = ss.source;
        var exp = ss.getExpectedParams();
        for (var j: number = 0; j < exp.length; j++) {
            if (keys.includes(exp[j])) {
                var pName: string = keys[keys.indexOf(exp[j])];
                src = src.replace("$" + pName.toString() + "$", paramDict[pName.toString()].toString());
            } else {
                src = src.replace("$" + exp[j].toString() + "$", ss.params[exp[j]].toString());
            }
        }
        return src;
    }
    static getShader(name: string): ShaderSource {
        return ShaderSource.shaders[name];
    }
    static getAllShaderNames(): string[] {
        return Object.keys(ShaderSource.shaders);
    }
    static defVert(): string {
        return ShaderSource.shaderWithParams(defaults[0]);
    }
    static defFrag(numLights: string | number = 0): string {
        return ShaderSource.shaderWithParams(defaults[1], { "nLights": numLights });
    }

    source: string;
    type: string;
    params: any[];
    constructor(paramDict: any, type: string, name: string, src: string) {
        this.params = paramDict;
        this.source = src;
        this.type = type;
        ShaderSource.shaders[name] = this;
    }
    getExpectedParams(): string[] {
        return Object.keys(this.params);
    }
}

var vShaderHead: string = `#version ${version}
precision $fPrecision$ float;

layout (location = 0) in vec4 vertexPosition;
layout (location = 1) in vec3 vertexUV;
layout (location = 2) in vec4 vertexRGB;
layout (location = 3) in vec3 vertexNormal;

uniform mat4 projection;
uniform mat4 model;
uniform mat4 view;
uniform mat4 invModel;

out vec3 UV;
out vec4 tint;
out vec3 normal;
out vec3 fragPos;
`;
var nShaderHead: string = vShaderHead + `
layout (location = 4) in vec3 vertexTangent;
uniform bool hasNormalTexture;
out vec3 Tangent0;
`;
var pShaderHead: string = vShaderHead + `
layout (location = 4) in vec3 vertexTangent;

uniform bool hasNormalTexture;
uniform bool hasParallaxTexture;
uniform vec3 viewPos;

out vec3 TangentViewPos;
out vec3 TangentFragPos;
`;

new ShaderSource({ fPrecision: "highp" }, ShaderSourceTypes.vert, "vert3d", nShaderHead + `
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
new ShaderSource({ fPrecision: "mediump" }, ShaderSourceTypes.vert, "vert3dpf", vShaderHead + `
void main () {
    vec4 transformed = projection * view * model * vertexPosition;
    transformed.x = - transformed.x;
    gl_Position = transformed;
    UV = vec3(vertexUV.x, vertexUV.y, 1);
    tint = vertexRGB.rgba;
    normal =  mat3(transpose(invModel)) * vertexNormal.xyz;
    fragPos = vec3(model * vertexPosition);
}
`);
new ShaderSource({ fPrecision: "highp" }, ShaderSourceTypes.vert, "vert3d+", pShaderHead + `
out vec3 viewPosF;
out mat3 TBNF;
out vec3 Tangent0;

void main () {
    vec4 transformed = projection * view * model * vertexPosition;
    transformed.x = - transformed.x;
    gl_Position = transformed;
    UV = vec3(vertexUV.x, vertexUV.y, 1);
    tint = vertexRGB.rgba;
    normal =  mat3(transpose(invModel)) * vertexNormal.xyz;
    fragPos = vec3(model * vertexPosition);

    if (hasNormalTexture || hasParallaxTexture) {
        vec3 T   = normalize(mat3(model) * vertexTangent);
        vec3 N   = normalize(mat3(model) * normal);
        vec3 B   = normalize(mat3(model) * cross(N, T));
        mat3 TBN = transpose(mat3(T, B, N));
        TangentViewPos = TBN * viewPos;
        TangentFragPos = TBN * fragPos;
        TBNF = TBN;
        Tangent0 = (model * vec4(vertexTangent, 0.0)).xyz;  
    }
    viewPosF = viewPos;
}
`);

var partialFragShaderPF: string = `#version ${version}
precision $fPrecision$ float;

#define NR_POINT_LIGHTS $nLights$

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
    vec2 cUV = vec2(UV.x, 1.0 - UV.y);
    vec3  norm = normalize(normal); 
    vec3 viewDir = normalize(viewPos - fragPos);
    vec3 result = CalcDirLight(dirLight, norm, viewDir, cUV);

#if NR_POINT_LIGHTS > 0
    for(int i = 0; i < NR_POINT_LIGHTS; i++)
        result += CalcPointLight(pointLights[i], norm, fragPos, viewDir, cUV);
#endif

    color = vec4(result, 1.0);
}
`;
var partialFragShader: string = `#version ${version}
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
var partialFragShaderParallax: string = `#version ${version}

precision $fPrecision$ float;

#define NR_POINT_LIGHTS $nLights$

struct Material {
    sampler2D diffuse;
    sampler2D specular;
    sampler2D normal;
    sampler2D parallax;
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
vec2 ParallaxMapping(vec2 texCoords, vec3 viewDirT);
vec3 CalcBumpedNormal(vec2 cUV);

layout (location = 0) out vec4 color;

uniform float u_time;
uniform Material material;
uniform DirLight dirLight;
#if NR_POINT_LIGHTS > 0
uniform PointLight pointLights[NR_POINT_LIGHTS];
#endif
uniform bool hasNormalTexture;
uniform bool hasParallaxTexture;
uniform float heightScale;

in vec3 TangentViewPos;
in vec3 TangentFragPos;
in vec3 TangentLightPos;
in vec3 UV;
in vec4 tint;
in vec3 normal;
in vec3 fragPos;
in vec3 viewPosF;
in vec3 Tangent0;

in mat3 TBNF;

void main () 
{
    vec2 cUV = UV.xy; //vec2(UV.x, 1.0 - UV.y);
    vec3 norm;
    vec3 viewDir;
    if (hasNormalTexture && hasParallaxTexture) {
        viewDir = normalize(TangentViewPos - TangentFragPos);
        cUV = ParallaxMapping(cUV, viewDir);
        // if(cUV.x > 1.0 || cUV.y > 1.0 || cUV.x < 0.0 || cUV.y < 0.0)
        //    discard;
        norm  = CalcBumpedNormal(cUV);
    } else if (hasNormalTexture) {
        norm =  CalcBumpedNormal(cUV);
        viewDir = normalize(viewPosF - fragPos);
    } else {
        norm = normalize(normal);
    }
    vec3 result = CalcDirLight(dirLight, norm, viewDir, cUV);

#if NR_POINT_LIGHTS > 0
    for(int i = 0; i < NR_POINT_LIGHTS; i++)
        result += CalcPointLight(pointLights[i], norm, fragPos, viewDir, cUV);
#endif

    color = vec4(result, 1.0);
}


vec2 ParallaxMapping(vec2 texCoords, vec3 viewDir)
{ 
    float height =  texture(material.parallax, texCoords).r;    
    vec2 p = viewDir.xy / viewDir.z * (height * heightScale);
    return texCoords - p; 
} 
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
`;
var phongMethod: string = `
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
`;
var blinnPhongMethod: string = `
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
}`;

new ShaderSource({ nLights: 0, fPrecision: "mediump" },
    ShaderSourceTypes.frag, "blinnphongpf", partialFragShaderPF.concat(blinnPhongMethod));
new ShaderSource({ nLights: 0, fPrecision: "mediump" },
    ShaderSourceTypes.frag, "phongpf", partialFragShaderPF.concat(phongMethod));
new ShaderSource({ nLights: 0, fPrecision: "mediump" },
    ShaderSourceTypes.frag, "blinnphong", partialFragShader.concat(blinnPhongMethod));
new ShaderSource({ nLights: 0, fPrecision: "mediump" },
    ShaderSourceTypes.frag, "phong", partialFragShader.concat(phongMethod));
new ShaderSource({ nLights: 0, fPrecision: "mediump" },
    ShaderSourceTypes.frag, "phong+", partialFragShaderParallax.concat(phongMethod));
new ShaderSource({ nLights: 0, fPrecision: "mediump" },
    ShaderSourceTypes.frag, "blinnphong+", partialFragShaderParallax.concat(blinnPhongMethod));
new ShaderSource({ nLights: 0, fPrecision: "mediump" },
    ShaderSourceTypes.frag, "exp+", partialFragShaderParallax);



new ShaderSource({}, ShaderSourceTypes.vert, "vEXP+", `#version ${version}

precision highp float;

layout (location = 0) in vec3 aPos;
layout (location = 1) in vec3 aNormal;
layout (location = 2) in vec2 aTexCoords;
layout (location = 3) in vec3 aTangent;
layout (location = 4) in vec3 aBitTangent;


    out vec3 FragPos;
    out vec2 TexCoords;
    out vec3 TangentLightPos;
    out vec3 TangentViewPos;
    out vec3 TangentFragPos;
    out vec3 norma;

uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;

uniform vec3 lightPos;
uniform vec3 viewPos;

void main()
{
    FragPos = vec3(model * vec4(aPos, 1.0));   
    TexCoords = aTexCoords;   
    
    vec3 T = normalize(mat3(model) * aTangent);
    vec3 N = normalize(mat3(model) * aNormal);
    vec3 B = normalize(mat3(model) * aBitTangent);
    mat3 TBN = transpose(mat3(T, B, N));

    TangentLightPos = TBN * lightPos;
    TangentViewPos  = TBN * viewPos;
    TangentFragPos  = TBN * FragPos;

    norma = normalize(aNormal);
    
    gl_Position = projection * view * model * vec4(aPos, 1.0);
}
`);
new ShaderSource({}, ShaderSourceTypes.frag, "fEXP+", `#version ${version}
precision mediump float;


in   vec3 FragPos;
in   vec2 TexCoords;
in   vec3 TangentLightPos;
in   vec3 TangentViewPos;
in   vec3 TangentFragPos;
in vec3 norma;

layout (location = 0) out vec4 FragColor;

uniform sampler2D diffuseMap;
uniform sampler2D normalMap;
uniform sampler2D depthMap;

uniform float heightScale;

vec2 ParallaxMapping(vec2 texCoords, vec3 viewDir)
{ 
    // number of depth layers
    const float minLayers = 8.0;
    const float maxLayers = 32.0;
    float numLayers = mix(maxLayers, minLayers, abs(dot(norma, viewDir)));  
    // calculate the size of each layer
    float layerDepth = 1.0 / numLayers;
    // depth of current layer
    float currentLayerDepth = 0.0;
    // the amount to shift the texture coordinates per layer (from vector P)
    vec2 P = viewDir.xy / viewDir.z * heightScale; 
    vec2 deltaTexCoords = P / numLayers;
  
    // get initial values
    vec2  currentTexCoords     = texCoords;
    float currentDepthMapValue = texture(depthMap, currentTexCoords).r;
      
    while(currentLayerDepth < currentDepthMapValue)
    {
        // shift texture coordinates along direction of P
        currentTexCoords -= deltaTexCoords;
        // get depthmap value at current texture coordinates
        currentDepthMapValue = texture(depthMap, currentTexCoords).r;  
        // get depth of next layer
        currentLayerDepth += layerDepth;  
    }
    
    // get texture coordinates before collision (reverse operations)
    vec2 prevTexCoords = currentTexCoords + deltaTexCoords;

    // get depth after and before collision for linear interpolation
    float afterDepth  = currentDepthMapValue - currentLayerDepth;
    float beforeDepth = texture(depthMap, prevTexCoords).r - currentLayerDepth + layerDepth;
 
    // interpolation of texture coordinates
    float weight = afterDepth / (afterDepth - beforeDepth);
    vec2 finalTexCoords = prevTexCoords * weight + currentTexCoords * (1.0 - weight);

    return finalTexCoords;
}

void main()
{           
    // offset texture coordinates with Parallax Mapping
    vec3 viewDir = normalize(TangentViewPos - TangentFragPos);
    vec2 texCoords = TexCoords;
    
    texCoords = ParallaxMapping(TexCoords,  viewDir);       
    if(texCoords.x > 1.0 || texCoords.y > 1.0 || texCoords.x < 0.0 || texCoords.y < 0.0)
        discard;

    // obtain normal from normal map
    vec3 normal = texture(normalMap, texCoords).rgb;
    normal = normalize(normal * 2.0 - 1.0);   
   
    // get diffuse color
    vec3 color = texture(diffuseMap, texCoords).rgb;
    // ambient
    vec3 ambient = 0.1 * color;
    // diffuse
    vec3 lightDir = normalize(TangentLightPos - TangentFragPos);
    float diff = max(dot(lightDir, normal), 0.0);
    vec3 diffuse = diff * color;
    // specular    
    vec3 reflectDir = reflect(-lightDir, normal);
    vec3 halfwayDir = normalize(lightDir + viewDir);  
    float spec = pow(max(dot(normal, halfwayDir), 0.0), 32.0);

    vec3 specular = vec3(0.2) * spec;
    FragColor = vec4(ambient + diffuse + specular, 1.0);
}
`);