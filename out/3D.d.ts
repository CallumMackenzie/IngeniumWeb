import { Shader } from "./WebGL.js";
import { Vec3, Vec2, Mat4 } from "./Math.js";
export declare class Vert {
    static tSize: number;
    p: Vec3;
    t: Vec2;
    rgb: Vec3;
    n: Vec3;
    tan: Vec3;
    constructor(point?: Vec3, UV?: Vec2, rgb?: Vec3, normal?: Vec3);
}
export declare class Tri {
    v: Vert[];
    constructor(points?: Vert[]);
}
export declare class Material {
    diffuseTexture: WebGLTexture;
    specularTexture: WebGLTexture;
    normalTexture: WebGLTexture;
    parallaxTexture: WebGLTexture;
    hasNormalTexture: boolean;
    hasParallaxTexture: boolean;
    shininess: number;
    parallaxScale: number;
    constructor(diffuseTexture?: WebGLTexture, specularTexture?: WebGLTexture, normalTexture?: WebGLTexture, shininess?: number);
}
export declare class ReferenceMaterial {
    diffuseTexture: WebGLTexture;
    specularTexture: WebGLTexture;
    normalTexture: WebGLTexture;
    parallaxTexture: WebGLTexture;
    hasNormalTexture: boolean;
    hasParallaxTexture: boolean;
}
export declare class Camera {
    position: Vec3;
    rotation: Vec3;
    FOV: number;
    clipNear: number;
    clipFar: number;
    constructor(fov?: number, clipNear?: number, clipFar?: number);
    lookVector(): Vec3;
    perspective(): Mat4;
    cameraMatrix(): Mat4;
    stdControl(speed?: number, cameraMoveSpeed?: number): void;
}
export declare class Mesh {
    rotation: Vec3;
    rotationCenter: Vec3;
    position: Vec3;
    scale: Vec3;
    material: Material;
    loaded: boolean;
    mVBO: WebGLBuffer;
    mVAO: WebGLVertexArrayObject;
    mTVBO: WebGLBuffer;
    data: number[];
    tint: Vec3;
    triangles: number;
    useGeometryReferenceCache: boolean;
    useTextureReferenceCache: boolean;
    constructor(position?: Vec3, rotation?: Vec3, rotationCenter?: Vec3, scale?: Vec3, material?: Material);
    make(objPath: string, diffTexPath?: string, specTexPath?: string, normalPath?: string, parallaxPath?: string): void;
    loadFromObjData(raw: string): void;
    addTriangle(triangle: Tri): void;
    createTextureFromPath(path: string, texSlot: number, useRefCache: boolean, wrap?: number[], minFilter?: number, magFilter?: number): WebGLTexture;
    setTexture(diffusePath: string, specularPath?: string, normalPath?: string, parallaxPath?: string): void;
    modelMatrix(): Mat4;
    load(drawType?: number): void;
    static calcTangents(triangle: Tri): Vec3[];
    static renderAll(shader: Shader, camera: Camera, meshes: Mesh[], dirLight: DirectionalLight, pointLights?: PointLight[]): void;
}
export declare class PointLight {
    intensity: number;
    ambient: Vec3;
    diffuse: Vec3;
    specular: Vec3;
    position: Vec3;
    constant: number;
    linear: number;
    quadratic: number;
    constructor(ambient?: Vec3, diffuse?: Vec3, specular?: Vec3, position?: Vec3, intensity?: number);
}
export declare class DirectionalLight {
    intensity: number;
    ambient: Vec3;
    diffuse: Vec3;
    specular: Vec3;
    direction: Vec3;
    constructor(ambient?: Vec3, diffuse?: Vec3, specular?: Vec3, direction?: Vec3, intensity?: number);
}
