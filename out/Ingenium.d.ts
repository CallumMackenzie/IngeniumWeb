export declare var gl: WebGL2RenderingContext;
export declare class Input {
    static keys: {
        [id: string]: boolean;
    };
    static setup(): void;
    static getKeyState(key: string): boolean;
}
export declare class Time {
    static deltaTime: number;
    static fixedDeltaTime: number;
    static targetDeltaTime: number;
    static targetFixedDeltaTime: number;
    static lastFrame: number;
    static lastFixedFrame: number;
    static setFPS(newfps: number): void;
    static setFixedFPS(newfps: number): void;
    static updateDeltaTime(): void;
    static updateFixedDeltaTime(): void;
    static nextFixedFrameReady(): boolean;
    static nextFrameReady(): boolean;
}
export declare class WebGLWindow {
    parent: HTMLElement | null;
    canvas: HTMLCanvasElement;
    width: number;
    height: number;
    aspectRatio: number;
    takeUpAsepct: boolean;
    constructor(width: number, height: number, parentName: string, name: string);
    sizeToWindow(aspect: number): void;
    setGL(): void;
    setClearColour(hex: number, alpha: number): void;
    clear(): void;
}
export declare class Scene {
    onCreate: Function;
    onUpdate: Function;
    onFixedUpdate: Function;
    onClose: Function;
    constructor(onCreate?: Function, onUpdate?: Function, onClose?: Function, onFixedUpdate?: Function);
}
export declare class IngeniumWeb {
    static window: WebGLWindow | null;
    static running: boolean;
    static glVersion: string;
    static intervalCode: number;
    static fixedIntervalCode: number;
    static onCreate: Function;
    static onUpdate: Function;
    static onClose: Function;
    static onFixedUpdate: Function;
    static scenes: Scene[];
    static currentScene: number;
    static start(scenes: Scene[], onCreate?: Function, onUpdate?: Function, onClose?: Function, onFixedUpdate?: Function, webGL?: string): void;
    static createWindow(width: number, height: number, id: string, parentName?: string, takeUpAsepct?: boolean): void;
    static update(): void;
    static fixedUpdate(): void;
    static init(): void;
    static refreshLoops(): void;
    static terminate(message: string): void;
    static enterScene(index: number): void;
}
export declare class Shader {
    program: WebGLProgram;
    static compile(source: string, type: number): WebGLShader | null;
    constructor(vertSource: string, fragSource: string);
    use(): void;
    getULoc(name: string): WebGLUniformLocation;
    setUInt(name: string, value: number): void;
    setUInt2(name: string, value1: number, value2: number): void;
    setUInt3(name: string, value1: number, value2: number, value3: number): void;
    setUInt4(name: string, value1: number, value2: number, value3: number, value4: number): void;
    setUFloat(name: string, value: number): void;
    setUFloat2(name: string, value1: number, value2: number): void;
    setUFloat3(name: string, value1: number, value2: number, value3: number): void;
    setUFloat4(name: string, value1: number, value2: number, value3: number, value4: number): void;
    setUMat4(name: string, mat4: Mat4): void;
    setUVec2(name: string, v: Vec3): void;
    setUVec3(name: string, v: Vec3): void;
    setUVec4(name: string, v: Vec3): void;
    setUBool(name: string, b: boolean): void;
}
export declare var PI: number;
export declare class Vec2 {
    x: number;
    y: number;
    w: number;
    static filledWith(num: number): Vec2;
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
    static filledWith(num: number): Vec3;
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
    divFloat(n: number): Vec3;
    addFloat(n: number): Vec3;
    len(): number;
    mulMat(mat: Mat4): Vec3;
    normalized(): Vec3;
    isNaN(): boolean;
    equals(v2: Vec3): boolean;
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
export declare class Rotation {
    static radToDeg(rad: number): number;
    static degToRad(deg: number): number;
}
export declare class ShaderSourceTypes {
    static vert: string;
    static frag: string;
}
export declare class ShaderSource {
    static shaders: any;
    static shaderWithParams(shaderName: string, paramDict?: {
        [id: string]: any;
    }): string;
    static getShader(name: string): ShaderSource;
    static getAllShaderNames(): string[];
    source: string;
    type: string;
    params: any[];
    constructor(paramDict: any, type: string, name: string, src: string);
    getExpectedParams(): string[];
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
export declare class ReferenceMaterial {
    diffuseTexture: WebGLTexture;
    specularTexture: WebGLTexture;
    normalTexture: WebGLTexture;
    parallaxTexture: WebGLTexture;
    hasNormalTexture: boolean;
    hasParallaxTexture: boolean;
}
export declare class Position3D {
    position: Vec3;
    rotation: Vec3;
    constructor(position?: Vec3, rotation?: Vec3);
}
export declare class Camera extends Position3D {
    constructor(fov?: number, clipNear?: number, clipFar?: number);
    FOV: number;
    clipNear: number;
    clipFar: number;
    lookVector(): Vec3;
    perspective(): Mat4;
    cameraMatrix(): Mat4;
    stdControl(speed?: number, cameraMoveSpeed?: number): void;
    static stdController(cam: Camera, pos: Position3D, speed?: number, cameraMoveSpeed?: number): Position3D;
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
export declare class Light {
    constructor(ambient: Vec3, diffuse: Vec3, specular: Vec3, intensity: number);
    intensity: number;
    ambient: Vec3;
    diffuse: Vec3;
    specular: Vec3;
}
export declare class PointLight extends Light {
    position: Vec3;
    constant: number;
    linear: number;
    quadratic: number;
    constructor(ambient?: Vec3, diffuse?: Vec3, specular?: Vec3, position?: Vec3, intensity?: number);
}
export declare class DirectionalLight extends Light {
    direction: Vec3;
    constructor(ambient?: Vec3, diffuse?: Vec3, specular?: Vec3, direction?: Vec3, intensity?: number);
}
export declare class Geometry {
    static makeCube(): Geometry;
    name: string;
    data: string;
    constructor(data: string, name?: string);
}
export declare class ReferenceGeometry {
    VBO: WebGLBuffer;
    VAO: WebGLVertexArrayObject;
    triangles: number;
}
export declare class Utils {
    static loadFile(filePath: string): string | null;
    static typeCheck(value: any, type: any, loc: string): boolean;
    static argCheck(fargs: any, loc: string, types: any): boolean;
}
