import { Shader } from "./WebGL.js";
import { Geometry } from "./geometry.js";
export declare class Vec2 {
    x: number;
    y: number;
    w: number;
    static sub(v1: Vec2, v2: Vec2): Vec2;
    static add(v1: Vec2, v2: Vec2): Vec2;
    static mul(v1: Vec2, v2: Vec2): Vec2;
    static div(v1: Vec2, v2: Vec2): Vec2;
    static mulFloat(v1: Vec2, float: number): Vec2;
    static divFloat(v1: Vec2, float: number): Vec2;
    static len(v: Vec2): number;
    static normalize(v: Vec2): Vec2;
    constructor(x?: number, y?: number, w?: number);
}
export declare class Vec3 {
    x: number;
    y: number;
    z: number;
    w: number;
    static sub(v1: Vec3, v2: Vec3): Vec3;
    static add(v1: Vec3, v2: Vec3): Vec3;
    static mul(v1: Vec3, v2: Vec3): Vec3;
    static div(v1: Vec3, v2: Vec3): Vec3;
    static mulFloat(v1: Vec3, float: number): Vec3;
    static divFloat(v1: Vec3, float: number): Vec3;
    static dot(v1: Vec3, v2: Vec3): number;
    static len(v: Vec3): number;
    static normalize(v: Vec3): Vec3;
    static cross(v1: Vec3, v2: Vec3): Vec3;
    static mulMat(i: Vec3, m: Mat4): Vec3;
    constructor(x?: number, y?: number, z?: number, w?: number);
    add(v: Vec3): Vec3;
    sub(v: Vec3): Vec3;
    mul(v: Vec3): Vec3;
    div(v: Vec3): Vec3;
    mulFloat(n: number): Vec3;
}
export declare class Mat4 {
    m: number[][];
    static perspective(fovDeg: number, aspectRatio: number, near: number, far: number): Mat4;
    static inverse(m: Mat4): Mat4;
    static identity(): Mat4;
    static pointedAt(pos: Vec3, target: Vec3, up?: Vec3): Mat4;
    static scale(x?: number, y?: number, z?: number): Mat4;
    static translation(x?: number, y?: number, z?: number): Mat4;
    static mul(m1: Mat4, m2: Mat4): Mat4;
    static rotationX(xRad: number): Mat4;
    static rotationY(yRad: number): Mat4;
    static rotationZ(zRad: number): Mat4;
    static rotationOnPoint(xRad: number, yRad: number, zRad: number, pt: Vec3): Mat4;
    constructor();
}
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
    constructor(position?: Vec3, rotation?: Vec3, rotationCenter?: Vec3, scale?: Vec3, material?: Material);
    make(objPath: string, diffTexPath?: string, specTexPath?: string, normalPath?: string, parallaxPath?: string): void;
    makeFromGeometry(geom: Geometry, diffTexPath?: string, specTexPath?: string, normalPath?: string, parallaxPath?: string): void;
    loadFromObjData(raw: string): void;
    addTriangle(triangle: Tri): void;
    createTextureFromPath(path: string, texSlot?: number, wrap?: number[], minFilter?: number, magFilter?: number): WebGLTexture;
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
