/**
 * The OpenGL object of the program.
 */
export declare var gl: WebGL2RenderingContext;
/**
 * Automatic input manager.
 */
export declare class Input {
    static keys: {
        [id: string]: boolean;
    };
    static setup(): void;
    /**
     *
     * @param key the key to check for.
     * @returns whether the key is currently pressed.
     */
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
    static deltaTimeToFPS(delta: number): number;
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
    static startTime: number;
    static start(scenes: Scene[], onCreate?: Function, onUpdate?: Function, onClose?: Function, onFixedUpdate?: Function, webGL?: string): void;
    static createWindow(width: number, height: number, id: string, parentName?: string, takeUpAsepct?: boolean): void;
    static update(): void;
    static fixedUpdate(): void;
    static init(): void;
    static refreshLoops(): void;
    static terminate(message: string): void;
    static enterScene(index: number): void;
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
export declare class Camera3D extends Position3D {
    /**
     * The field of view of the camera.
     */
    FOV: number;
    /**
     * The near clip distance of the camera.
     */
    clipNear: number;
    /**
     * The far clip distance of the camera.
     */
    clipFar: number;
    /**
     * Creates a new camera.
     *
     * @param fov the field of view.
     * @param clipNear the near clip distance.
     * @param clipFar the far clip distance.
     */
    constructor(fov?: number, clipNear?: number, clipFar?: number);
    /**
     *
     * @returns a vector repersenting the direction the camera is looking.
     */
    lookVector(): Vec3;
    /**
     *
     * @returns the perspective projection matrix of the camera.
     */
    perspective(): Mat4;
    /**
     *
     * @returns the camera transformation matrix.
     */
    cameraMatrix(): Mat4;
    /**
     * Basic movement controls for debugging.
     *
     * @param speed the speed of the camera.
     * @param cameraMoveSpeed the rotation speed of the camera.
     */
    stdControl(speed?: number, cameraMoveSpeed?: number): void;
    /**
     * Standard controls applied to a seperate position.
     *
     * @param cam the camera.
     * @param pos the position.
     * @param speed the speed.
     * @param cameraMoveSpeed the rotation speed.
     * @returns an updated 3D position.
     */
    static stdController(cam: Camera3D, pos: Position3D, speed?: number, cameraMoveSpeed?: number): Position3D;
}
/**
 * A 3D object.
 */
export declare class Mesh3D extends Position3D {
    /**
     * Relative point the mesh rotates around.
     */
    rotationCenter: Vec3;
    /**
     * The scale of the mesh.
     */
    scale: Vec3;
    /**
     * The material of the mesh.
     */
    material: Material;
    /**
     * Whether the mesh has been loaded to the GPU.
     */
    loaded: boolean;
    /**
     * The vertex buffer location of the mesh data on the GPU.
     */
    mVBO: WebGLBuffer;
    /**
     * The vertex array location of the mesh data on the GPU.
     */
    mVAO: WebGLVertexArrayObject;
    /**
     * The loaded float vertex data of the mesh.
     */
    data: number[];
    /**
     * The tint of the mesh.
     */
    tint: Vec3;
    /**
     * The number of triangles in the mesh
     */
    triangles: number;
    /**
     * Whether to check the geometry reference cache.
     */
    useGeometryReferenceCache: boolean;
    /**
    * Whether to check the texture reference cache.
    */
    useTextureReferenceCache: boolean;
    /**
     * Creates a new mesh.
     *
     * @param position the position of the mesh.
     * @param rotation  the rotation of the mesh.
     * @param rotationCenter the rotation center of the mesh.
     * @param scale the scale of the mesh
     * @param material the material of the mesh
     */
    constructor(position?: Vec3, rotation?: Vec3, rotationCenter?: Vec3, scale?: Vec3, material?: Material);
    /**
     * Loads the textures and obj file to the GPU.
     *
     * @param objPath the path to the obj file
     * @param diffTexPath the path to the diffuse texture
     * @param specTexPath the path to the specular texture
     * @param normalPath the path to the normal texture
     * @param parallaxPath the path to the parallax texture
     */
    make(objPath: string, diffTexPath?: string, specTexPath?: string, normalPath?: string, parallaxPath?: string): void;
    /**
     * Populates the data of the mesh.
     *
     * @param raw the raw obj data
     */
    loadFromObjData(raw: string): void;
    /**
     * Adds the data from a triangle to the data array.
     *
     * @param triangle the triangle to add.
     */
    addTriangle(triangle: Tri): void;
    /**
     * Loads a texture to the GPU from the specified path.
     *
     * @param path the path to the texture.
     * @param texSlot the texture slot to use.
     * @param useRefCache whether to use the texture reference texture cache.
     * @param wrap the wrap type of the texture.
     * @param minFilter the min filter type of the texture.
     * @param magFilter the mag filter type of the texture.
     * @returns the texture location on the GPU.
     */
    createTextureFromPath(path: string, texSlot: number, useRefCache: boolean, wrap?: number[], minFilter?: number, magFilter?: number): WebGLTexture;
    /**
     * Sets the textures of the mesh.
     *
     * @param diffusePath the path to the diffuse texture
     * @param specularPath the path to the specular texture
     * @param normalPaththe path to the normal texture
     * @param parallaxPath the path to the parallax texture
     */
    setTexture(diffusePath: string, specularPath?: string, normalPath?: string, parallaxPath?: string): void;
    /**
     * Creates a model transformation matrix based on the scale, rotation, and position of the mesh.
     * @returns the model transformation matrix.
     */
    modelMatrix(): Mat4;
    /**
     * Loads the data in the data array to the GPU.
     *
     * @param drawType the access type of the data on the GPU.
     */
    load(drawType?: number): void;
    /**
     * Calculates the tangent and bitangent of the input triangle.
     *
     * @param triangle the triangle.
     * @returns the tangent and bitangent in a vector array.
     */
    static calcTangents(triangle: Tri): Vec3[];
    /**
     * Renders meshes.
     *
     * @param shader the shader to use.
     * @param camera the camera to use.
     * @param meshes the meshes to render.
     * @param dirLight the directional light to use.
     * @param pointLights the point lights to use.
     */
    static renderAll(shader: Shader, camera: Camera3D, meshes: Mesh3D[], dirLight: DirectionalLight, pointLights?: PointLight[]): void;
}
export declare class Light {
    /**
    * The intensity of the light.
    */
    intensity: number;
    /**
     * The ambient light value.
     */
    ambient: Vec3;
    /**
    * The diffuse light value.
    */
    diffuse: Vec3;
    /**
    * The specular light value.
    */
    specular: Vec3;
    /**
     * Creates a new light.
     *
     * @param ambient the ambient light value.
     * @param diffuse the diffuse light value.
     * @param specular the specular light value.
     * @param intensity the intensity of the light.
     */
    constructor(ambient: Vec3, diffuse: Vec3, specular: Vec3, intensity: number);
}
export declare class PointLight extends Light {
    /**
     * The position of the light.
     */
    position: Vec3;
    /**
     * The constant in the light attentuation equation.
     */
    constant: number;
    /**
     * The linear coefficient in the light attentuation equation.
     */
    linear: number;
    /**
    * The quadratic coefficient in the light attentuation equation.
    */
    quadratic: number;
    /**
     * Creates a new point light.
     *
     * @param ambient the ambient light value.
     * @param diffuse the diffuse light value.
     * @param specular the specular light value.
     * @param direction the direction the light comes from.
     * @param intensity the intensity of the light.
     */
    constructor(ambient?: Vec3, diffuse?: Vec3, specular?: Vec3, position?: Vec3, intensity?: number);
}
export declare class DirectionalLight extends Light {
    /**
     * The direction of the light.
     */
    direction: Vec3;
    /**
     * Creates a new directional light.
     *
     * @param ambient the ambient light value.
     * @param diffuse the diffuse light value.
     * @param specular the specular light value.
     * @param direction the direction the light comes from.
     * @param intensity the intensity of the light.
     */
    constructor(ambient?: Vec3, diffuse?: Vec3, specular?: Vec3, direction?: Vec3, intensity?: number);
}
export declare class Geometry {
    /**
     * The name of the geometry.
     */
    name: string;
    /**
     * The .obj raw data of the geometry.
     */
    data: string;
    /**
     * Creates a new geometry object.
     *
     * @param data The .obj raw data of the geometry.
     * @param name The name of the geometry.
     */
    constructor(data: string, name?: string);
    /**
    *
    * @returns the geometry of a 3D cube.
    */
    static makeCube(): Geometry;
}
export declare class ReferenceGeometry {
    /**
     * The vertex buffer.
     */
    VBO: WebGLBuffer;
    /**
     * The vertex array.
     */
    VAO: WebGLVertexArrayObject;
    /**
     * The number of triangles.
     */
    triangles: number;
}
export declare class Utils {
    /**
     * Loads the string data of a file.
     *
     * @param filePath the path to the file.
     * @returns the string data of the file, or null if the file isn't found.
     */
    static loadFile(filePath: string): string | null;
}
