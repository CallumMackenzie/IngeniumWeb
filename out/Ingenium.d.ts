/**
 * The OpenGL object of the program.
 */
export declare let gl: WebGL2RenderingContext;
/**
 * Automatic input manager.
 */
export declare class Input {
    /**
     * Dictionary of keys.
     */
    static keys: {
        [id: string]: boolean;
    };
    /**
     * Initializes the input system.
     */
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
/**
 * A set of methods to be executed by Ingenium Web.
 */
export declare class Scene {
    /**
     * The function executed when the scene is created.
     */
    onCreate: Function;
    /**
     * The function executed when the scene is updated.
     */
    onUpdate: Function;
    /**
     * The function executed when the scene is updated on the fixed loop.
     */
    onFixedUpdate: Function;
    /**
     * The function executed when the scene is closed.
     */
    onClose: Function;
    /**
     *
     * @param onCreate the function executed when the scene is created.
     * @param onUpdate the function executed when the scene is updated.
     * @param onClose the function executed when the scene is closed.
     * @param onFixedUpdate the function executed when the scene is updated on the fixed loop.
     */
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
    /**
     * Starts the engine.
     *
     * @param scenes the scenes to use.
     * @param onCreate the global creation function.
     * @param onUpdate the global update function.
     * @param onClose the global closing function.
     * @param onFixedUpdate the global fixed update function.
     * @param webGL the WebGl version to use.
     */
    static start(scenes: Scene[], onCreate?: Function, onUpdate?: Function, onClose?: Function, onFixedUpdate?: Function, webGL?: string): void;
    static createWindow(width: number, height: number, id: string, parentName?: string, takeUpAsepct?: boolean): void;
    static update(): void;
    static fixedUpdate(): void;
    static init(): void;
    static refreshLoops(): void;
    static terminate(message: string): void;
    static enterScene(index: number): void;
    static defaultSetup(): void;
}
/**
 * An approximation of PI (355 / 113);
 */
export declare let PI: number;
/**
 * A 2 component vector with a third w component.
 */
export declare class Vec2 {
    /**
    * The x component of the vector.
    */
    x: number;
    /**
     * The y component of the vector.
     */
    y: number;
    /**
     * The w component of the vector.
     */
    w: number;
    /**
     *
     * @param num the number to fill the vector with.
     * @returns a vector filled with num.
     */
    static filledWith(num: number): Vec2;
    /**
     * Subtracts 2 vectors.
     *
     * @param v1 the first vector.
     * @param v2 the second vector.
     * @returns the difference of the passed vectors.
     */
    static sub(v1: Vec2, v2: Vec2): Vec2;
    /**
     * Adds 2 vectors.
     *
     * @param v1 the first vector.
     * @param v2 the second vector.
     * @returns the sum of the passed vectors.
     */
    static add(v1: Vec2, v2: Vec2): Vec2;
    /**
     * Multiplies 2 vectors.
     *
     * @param v1 the first vector.
     * @param v2 the second vector.
     * @returns the product of the passed vectors.
     */
    static mul(v1: Vec2, v2: Vec2): Vec2;
    /**
     * Divides 2 vectors.
     *
     * @param v1 the first vector.
     * @param v2 the second vector.
     * @returns the quotient of the passed vectors.
     */
    static div(v1: Vec2, v2: Vec2): Vec2;
    /**
     * Multiplies all components of the vector by the passed number.
     *
     * @param v1 the vector.
     * @param float the number to multiply by.
     * @returns the product.
     */
    static mulFloat(v1: Vec2, float: number): Vec2;
    /**
     * Divides all components of the vector by the passed number.
     *
     * @param v1 the vector.
     * @param float the number to divide by.
     * @returns the quotient.
     */
    static divFloat(v1: Vec2, float: number): Vec2;
    /**
     *
     * @param v a vector.
     * @returns the length of the vector.
     */
    static len(v: Vec2): number;
    /**
     *
     * @param v a vector.
     * @returns the normalized vector.
     */
    static normalize(v: Vec2): Vec2;
    /**
     * Creates a new two component vector with a w component.
     *
     * @param x the x component of the vector.
     * @param y the y component of the vector.
     * @param w the w component of the vector.
     */
    constructor(x?: number, y?: number, w?: number);
    /**
     *
     * @param v2 the vector to subtract.
     * @returns the difference.
     */
    sub(v2: Vec2): Vec2;
    /**
     *
     * @param v2 the vector to add.
     * @returns the sum.
     */
    add(v2: Vec2): Vec2;
    /**
     *
     * @param v2 the vector to multiply by.
     * @returns the product.
     */
    mul(v2: Vec2): Vec2;
    /**
     *
     * @param v2 the vector to divide by.
     * @returns the quotient.
     */
    div(v2: Vec2): Vec2;
    /**
     * Multiplies all components of the vector by the passed number.
     *
     * @param float the number to multiply by.
     * @returns the product.
     */
    mulFloat(float: number): Vec2;
    /**
     * Divides all components of the vector by the passed number.
     *
     * @param float the number to divide by.
     * @returns the quotient.
     */
    divFloat(float: number): Vec2;
    /**
     *
     * @returns the length of the vector.
     */
    len(): number;
    /**
     *
     * @returns the normalized vector.
     */
    normalized(): Vec2;
}
/**
 * A 3 component vector with a fourth w component.
 */
export declare class Vec3 {
    /**
     * The x component of the vector.
     */
    x: number;
    /**
     * The y component of the vector.
     */
    y: number;
    /**
     * The z component of the vector.
     */
    z: number;
    /**
     * The w component of the vector.
     */
    w: number;
    /**
     * Creates a new vector with the number as the x, y, and z values.
     *
     * @param num the number to fill the vector with.
     * @returns a filled vector.
     */
    static filledWith(num: number): Vec3;
    /**
     * Subtracts 2 vectors.
     *
     * @param v1 the first vector.
     * @param v2 the second vector.
     * @returns the difference of the passed vectors.
     */
    static sub(v1: Vec3, v2: Vec3): Vec3;
    /**
     * Adds 2 vectors.
     *
     * @param v1 the first vector.
     * @param v2 the second vector.
     * @returns the sum of the passed vectors.
     */
    static add(v1: Vec3, v2: Vec3): Vec3;
    /**
     * Multiplies 2 vectors.
     *
     * @param v1 the first vector.
     * @param v2 the second vector.
     * @returns the product of the passed vectors.
     */
    static mul(v1: Vec3, v2: Vec3): Vec3;
    /**
     * Divides 2 vectors.
     *
     * @param v1 the first vector.
     * @param v2 the second vector.
     * @returns the quotient of the passed vectors.
     */
    static div(v1: Vec3, v2: Vec3): Vec3;
    /**
     * Multiplies all components of the vector by the passed number.
     *
     * @param v1 the vector.
     * @param float the number to multiply by.
     * @returns the product.
     */
    static mulFloat(v1: Vec3, float: number): Vec3;
    /**
     * Divides all components of the vector by the passed number.
     *
     * @param v1 the vector.
     * @param float the number to divide by.
     * @returns the quotient.
     */
    static divFloat(v1: Vec3, float: number): Vec3;
    /**
     * Adds the passed number to all components of the vector.
     *
     * @param v1 the vector.
     * @param float the number to add.
     * @returns the sum.
     */
    static addFloat(v1: Vec3, float: number): Vec3;
    /**
     * Subtracts the passed number from all components of the vector.
     *
     * @param v1 the vector.
     * @param float the number to subtract.
     * @returns the difference.
     */
    static subFloat(v1: Vec3, float: number): Vec3;
    /**
     *
     * @param v1 the first vector.
     * @param v2 the second vector.
     * @returns the dot product of the passed vectors.
     */
    static dot(v1: Vec3, v2: Vec3): number;
    /**
     *
     * @param v a vector.
     * @returns the length of the vector.
     */
    static len(v: Vec3): number;
    /**
     *
     * @param v a vector.
     * @returns the normalized vector.
     */
    static normalize(v: Vec3): Vec3;
    /**
     *
     * @param v1 the first vector.
     * @param v2 the second vector.
     * @returns the cross product of the passed vectors.
     */
    static cross(v1: Vec3, v2: Vec3): Vec3;
    /**
     *
     * @param i a vector.
     * @param m a 4x4 matrix.
     * @returns the product.
     */
    static mulMat(i: Vec3, m: Mat4): Vec3;
    /**
     *
     * @param x the x component of the vector.
     * @param y the y component of the vector.
     * @param z the z component of the vector.
     * @param w the w component of the vector.
     */
    constructor(x?: number, y?: number, z?: number, w?: number);
    /**
     *
     * @param v the vector to add.
     * @returns a new vector with the sum.
     */
    add(v: Vec3): Vec3;
    /**
     *
     * @param v the vector to subtract.
     * @returns a new vector with the difference.
     */
    sub(v: Vec3): Vec3;
    /**
    *
    * @param v the vector to multiply with.
    * @returns a new vector with the product.
    */
    mul(v: Vec3): Vec3;
    /**
     *
     * @param v the vector to divide by.
     * @returns a new vector with the quotient.
     */
    div(v: Vec3): Vec3;
    /**
     *
     * @param n the number to multiply with.
     * @returns a new vector with the product.
     */
    mulFloat(n: number): Vec3;
    /**
     *
     * @param n the number to divide by.
     * @returns a new vector with the quotient.
     */
    divFloat(n: number): Vec3;
    /**
     *
     * @param n the number to add.
     * @returns a new vector with the sum.
     */
    addFloat(n: number): Vec3;
    /**
     *
     * @param n the number to subtract.
     * @returns a new vector with the difference.
     */
    subFloat(n: number): Vec3;
    /**
     *
     * @returns the length of the vector.
     */
    len(): number;
    /**
     *
     * @param mat the 4x4 matrix to multiply by.
     * @returns the product.
     */
    mulMat(mat: Mat4): Vec3;
    /**
     *
     * @returns the vector normalized.
     */
    normalized(): Vec3;
    /**
     *
     * @returns whether the vector has components which are NaN.
     */
    isNaN(): boolean;
    /**
     *
     * @param v2 the vector to compare.
     * @returns whether the vectors have equal x, y, and z components.
     */
    equals(v2: Vec3): boolean;
}
/**
 * Repersents a 2x2 matrix
 */
export declare class Mat2 {
    m: number[][];
    constructor(m?: number[][]);
    /**
     *
     * @return the flattened matrix
     */
    flatten(): number[];
    /**
     *
     * @return the determinant of the matrix
     */
    determinant(): number;
    /**
     *
     * @return the inverse of the matrix
     */
    inverse(): Mat2;
    mul(mats: Mat2[]): Mat2;
    /**
     *
     * @param x the x scale
     * @param y the y scale
     * @return the scaling matrix
     */
    static scale(scale: Vec2): Mat2;
    /**
     *
     * @param radians the clockwise rotation in radians
     * @return the 2D rotation matrix
     */
    static rotation(radians: number): Mat2;
    /**
     *
     * @return a 2D identity matrix
     */
    static identity(): Mat2;
    /**
     *
     * @return the inverse of the matrix
     */
    static inverse(mat: Mat2): Mat2;
}
/**
 * A 4x4 matrix.
 */
export declare class Mat4 {
    /**
     * The matrix in a 2 dimensional array.
     */
    m: number[][];
    /**
     * Creates a perspective projection matrix.
     *
     * @param fovDeg the field of view.
     * @param aspectRatio the aspect ratio.
     * @param near the near clip distance.
     * @param far the far clip distance.
     * @returns the perspective projection matrix.
     */
    static perspective(fovDeg: number, aspectRatio: number, near: number, far: number): Mat4;
    /**
     *
     * @param m a matrix.
     * @returns the inverse of the matrix.
     */
    static inverse(m: Mat4): Mat4;
    /**
     *
     * @returns an identity matrix.
     */
    static identity(): Mat4;
    /**
     *
     * @param pos the position to start at.
     * @param target the target to point at.
     * @param up the direction to use as up.
     * @returns a matrix that repersents a transformation to point at a position.
     */
    static pointedAt(pos: Vec3, target: Vec3, up?: Vec3): Mat4;
    /**
     *
     * @param x the x scale.
     * @param y the y scale.
     * @param z the z scale.
     * @returns a scaling matrix.
     */
    static scale(x?: number, y?: number, z?: number): Mat4;
    /**
     *
     * @param x the x translation.
     * @param y the y translation.
     * @param z the z translation.
     * @returns a translation matrix.
     */
    static translation(x?: number, y?: number, z?: number): Mat4;
    /**
     *
     * @param m1 the first matrix.
     * @param m2 the second matrix.
     * @returns the product of the matrices.
     */
    static mul(m1: Mat4, m2: Mat4): Mat4;
    /**
     *
     * @param xRad the x rotation in radians.
     * @returns a rotation matrix.
     */
    static rotationX(xRad: number): Mat4;
    /**
     *
     * @param yRad the y rotation in radians.
     * @returns a rotation matrix.
     */
    static rotationY(yRad: number): Mat4;
    /**
     *
     * @param zRad the z rotation in radians.
     * @returns a rotation matrix.
     */
    static rotationZ(zRad: number): Mat4;
    /**
     *
     * @param r the rotation in radians.
     * @param pt the point to rotate around.
     * @returns a rotation matrix.
     */
    static rotationOnPoint(r: Vec3, pt: Vec3): Mat4;
    /**
     * Creates a new 4x4 matrix.
     */
    constructor();
}
/**
 * Contains methods for manipulating rotations.
 */
export declare class Rotation {
    /**
     * Converts a radian measure to a degree measure.
     *
     * @param rad the radian value.
     * @returns the degree value.
     */
    static radToDeg(rad: number): number;
    /**
    * Converts a degree measure to a radian measure.
    *
    * @param deg the degree value.
    * @returns the radian value.
    */
    static degToRad(deg: number): number;
}
export declare class ShaderUniforms {
    static material_diffuse: string;
    static material_specular: string;
    static material_normal: string;
    static material_parallax: string;
    static material_heightScale: string;
    static material_shininess: string;
    static material_scaleUV: string;
    static pointLight_structName: string;
    static pointLight_position: string;
    static pointLight_ambient: string;
    static pointLight_diffuse: string;
    static pointLight_specular: string;
    static pointLight_constant: string;
    static pointLight_linear: string;
    static pointLight_quadratic: string;
    static directionalLight_direction: string;
    static directionalLight_ambient: string;
    static directionalLight_specular: string;
    static directionalLight_diffuse: string;
    static mesh3D_modelMatrix: string;
    static mesh3D_invModelMatrix: string;
    static mesh3D_tint: string;
    static ingenium_time: string;
    static camera3D_view: string;
    static camera3D_projection: string;
    static camera3D_viewPos: string;
    static shader_numLights: string;
    static camera2D_translation: string;
    static camera2D_rotation: string;
    static camera2D_rotationPoint: string;
    static camera2D_aspect: string;
    static mesh2D_tint: string;
    static mesh2D_translation: string;
    static mesh2D_rotation: string;
    static mesh2D_rotationPoint: string;
    static mesh2D_scale: string;
    static mesh2D_zIndex: string;
}
/**
 * Manage shaders and their uniforms.
 */
export declare class Shader {
    /**
     * The shader program.
     */
    program: WebGLProgram;
    /**
     * Compiles shader source code.
     *
     * @param source the shader source code to compile.
     * @param type the shader type.
     * @returns the compiled shader location.
     */
    static compile(source: string, type: number, name?: string): WebGLShader | null;
    /**
     * Creates a new shader.
     *
     * @param vertSource the vertex shader source code.
     * @param fragSource the fragment shader source code.
     */
    constructor(vertSource: string, fragSource: string);
    /**
     * Sets the shader to be used in rendering.
     */
    use(): void;
    /**
     *
     * @param name the uniform name.
     * @returns the location of the uniform.
     */
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
    setUVec2(name: string, v: Vec2): void;
    setUVec3(name: string, v: Vec3): void;
    setUVec4(name: string, v: Vec3): void;
    setUBool(name: string, b: boolean): void;
    setUMat2(name: string, m: Mat2): void;
}
/**
 * The supported types of shaders.
 */
declare class ShaderSourceTypes {
    /**
     * Vertex shader type.
     */
    vert: string;
    /**
     * Fragment shader type.
     */
    frag: string;
}
/**
 * Shader source code manager.
 */
export declare class ShaderSource {
    static types: ShaderSourceTypes;
    /**
     * All shaders.
     */
    static shaders: any;
    /**
     * Replaces keywords in a shader with others, allowing for more dynamic shaders.
     *
     * @param shaderName the name of the shader.
     * @param paramDict the parameters to pass to the shader.
     * @returns the proper shader source code.
     */
    static shaderWithParams(shaderName: string, paramDict?: {
        [id: string]: any;
    }): string;
    /**
     *
     * @param name the name of the shader.
     * @returns the shader under the passed name.
     */
    static getShader(name: string): ShaderSource;
    /**
     *
     * @returns all shader sources loaded.
     */
    static getAllShaderNames(): string[];
    /**
     * The source code of the shader.
     */
    source: string;
    /**
     * The shader type.
     */
    type: string;
    /**
     * The parameter dictionary of the shader.
     */
    params: any[];
    /**
     * Creates a new shader source object.
     *
     * @param paramDict the parameter dictionary of the shader with default values.
     * @param type the shader type.
     * @param name the shader name.
     * @param src the shader source code.
     */
    constructor(paramDict: any, type: string, name: string, src: string);
    /**
     *
     * @returns the parameters that this shader expects.
     */
    getExpectedParams(): string[];
    /**
     *
     * @param paramDict the parameter dictionary of the shader with default values.
     * @param type the shader type.
     * @param name the shader name.
     * @param src the shader source file path.
     * @returns the shader source object.
     */
    static makeFromFile(paramDict: any, type: string, name: string, srcPath: string): ShaderSource;
}
/**
 * A vertex in 3D space.
 */
export declare class Vert3D {
    /**
     * The number of floats in a processed vertex.
     */
    static tSize: number;
    /**
     * The point that the vertex sits at.
     */
    p: Vec3;
    /**
     * The UV coordinates of the vertex.
     */
    t: Vec2;
    /**
     * The RGB tint of the vertex.
     */
    rgb: Vec3;
    /**
     * The vertex normal.
     */
    n: Vec3;
    /**
     * The vertex tangent.
     */
    tan: Vec3;
    /**
     * Creates a new vertex.
     *
     * @param point the vertex location.
     * @param UV the vertex UV coordinates.
     * @param rgb the RGB tint of the vertex.
     * @param normal the vertex normal.
     */
    constructor(point?: Vec3, UV?: Vec2, rgb?: Vec3, normal?: Vec3);
}
export declare class Vert2D {
    /**
     * The number of floats in a processed vertex.
     */
    static tSize: number;
    /**
     * The point that the vertex sits at.
     */
    p: Vec2;
    /**
    * The UV coordinates of the vertex.
    */
    t: Vec2;
    /**
     * Creates a new vertex.
     *
     * @param point the vertex location.
     * @param UV the vertex UV coordinates.
     * @param rgb the RGB tint of the vertex.
     * @param normal the vertex normal.
     */
    constructor(point?: Vec2, UV?: Vec2);
}
/**
 * A triangle in 3D space.
 */
export declare class Tri3D {
    /**
     * The vertecies in the triangle.
     */
    v: Vert3D[];
    /**
     * Creates a new triangle.
     *
     * @param points the points in the triangle.
     */
    constructor(points?: Vert3D[]);
}
export declare class Tri2D {
    v: Vert2D[];
    /**
     * Creates a new triangle.
     *
     * @param points the points in the triangle.
     */
    constructor(points?: Vert2D[]);
}
/**
 * A material with albedo (diffuse), specular (shininess), normal, and parallax (bump) maps.
 */
export declare class Material {
    /**
     * The diffuse texture.
     */
    diffuseTexture: WebGLTexture;
    /**
     * The specular texture.
     */
    specularTexture: WebGLTexture;
    /**
     * The normal texture.
     */
    normalTexture: WebGLTexture;
    /**
     * The parallax texture.
     */
    parallaxTexture: WebGLTexture;
    /**
     * The shininess of the material.
     */
    shininess: number;
    /**
     * The scale of the parallax texture.
     */
    parallaxScale: number;
    /**
     * The scale for the UV coordinates.
     */
    UVScale: Vec2;
    /**
     * Creates a new material.
     *
     * @param diffuseTexture the diffuse texture.
     * @param specularTexture the specular texture.
     * @param normalTexture the normal texture.
     * @param shininess the shininess of the material.
     */
    constructor(diffuseTexture?: WebGLTexture, specularTexture?: WebGLTexture, normalTexture?: WebGLTexture, shininess?: number);
    bindTextures(): void;
    static sendToShader(shader: Shader): void;
}
/**
 * A material with references to textures only.
 */
export declare class ReferenceMaterial {
    /**
     * The diffuse texture.
     */
    diffuseTexture: WebGLTexture;
    /**
     * The specular texture.
     */
    specularTexture: WebGLTexture;
    /**
     * The normal texture.
     */
    normalTexture: WebGLTexture;
    /**
     * The parallax texture.
     */
    parallaxTexture: WebGLTexture;
}
/**
 * Repersents a point in 3D space.
 */
export declare class Position3D {
    /**
     * The position.
     */
    position: Vec3;
    /**
     * The rotation.
     */
    rotation: Vec3;
    /**
     * Creates a new 3D position.
     *
     * @param position The position.
     * @param rotation The rotation.
     */
    constructor(position?: Vec3, rotation?: Vec3);
}
export declare class Position2D {
    position: Vec2;
    rotation: number;
    constructor(position?: Vec2, rotation?: number);
}
/**
 * The view position to render from.
 */
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
     * The aspect ratio of the camera.
     */
    aspect: number;
    /**
     * Creates a new camera.
     *
     * @param fov the field of view.
     * @param clipNear the near clip distance.
     * @param clipFar the far clip distance.
     */
    constructor(fov?: number, clipNear?: number, clipFar?: number, aspect?: number);
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
export declare class Camera2D extends Position2D {
    rotationPoint: Vec2;
    aspect: number;
    constructor(aspect: number, position?: Vec2, rotation?: number);
    cameraMatrix(): Mat2;
    sendToShader(shader: Shader): void;
    stdControl(speed: number, rotateSpeed: number): void;
}
/**
 * A 3D object.
 */
export declare class Mesh3D extends Position3D {
    static defaultColour: number[];
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
     * Whether to render this mesh as transparent.
     */
    renderTransparent: boolean;
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
    addTriangle(triangle: Tri3D): void;
    static createTextureFromImage(image: HTMLImageElement, texSlot?: number, wrap?: number[], minFilter?: number, magFilter?: number): WebGLTexture;
    static createTextureFromRGBAPixelArray(array: number[], width: number, height: number, texSlot?: number, wrap?: number[], minFilter?: number, magFilter?: number): WebGLTexture;
    static createTextureFromRGBPixelArray(array: number[], width: number, height: number, texSlot?: number, wrap?: number[], minFilter?: number, magFilter?: number): WebGLTexture;
    static createColorTexture(color: number, alpha?: number, texSlot?: number, wrap?: number[], minFilter?: number, magFilter?: number): WebGLTexture;
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
    static createTextureFromPath(path: string, texSlot: number, useRefCache: boolean, wrap?: number[], minFilter?: number, magFilter?: number): WebGLTexture;
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
    static calcTangents(triangle: Tri3D): Vec3[];
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
    static renderMeshRaw(mesh: Mesh3D, shader: Shader): void;
}
export declare class Mesh2D extends Position2D {
    static renderTranslationName: string;
    /**
     * Relative point the mesh rotates around.
     */
    rotationCenter: Vec2;
    /**
     * The scale of the mesh.
     */
    scale: Vec2;
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
     * Whether to render this mesh as transparent.
     */
    renderTransparent: boolean;
    /**
     * The z index of the 2D mesh.
     */
    zIndex: number;
    /**
     *
     * @param position      the position
     * @param rotation      the rotation
     * @param scale         the scale
     * @param rotationPoint the relative point rotation is done around
     * @param material      the material
     */
    constructor(position?: Vec2, rotation?: number, scale?: Vec2, rotationPoint?: Vec2, material?: Material);
    /**
     * Loads all the data onto the GPU
     *
     */
    load(drawType?: number): void;
    modelMatrix(): Mat2;
    sendToShader(shader: Shader): void;
    bindVBO(): void;
    bindVAO(): void;
    static renderAll(shader: Shader, camera: Camera2D, meshes: Mesh2D[]): void;
}
/**
 * The base properties of a light.
 */
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
/**
 * A light at a point.
 */
export declare class PointLight extends Light {
    position: Vec3;
    /**
     * The position of the light.
     */
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
    sendToShader(shader: Shader, index: number): void;
}
/**
 * A light coming from one direction.
 */
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
    sendToShader(shader: Shader): void;
}
/**
 * Deals with obj files.
 */
export declare class Geometry {
    static quadData: number[];
    static triData: number[];
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
/**
 * Contains a reference to geometry on the GPU.
 */
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
/**
 * Contains various utility functions.
 */
export declare class Utils {
    /**
     * Loads the string data of a file.
     *
     * @param filePath the path to the file.
     * @returns the string data of the file, or null if the file isn't found.
     */
    static loadFile(filePath: string): string | null;
}
export declare class FrameBuffer {
    static buffers: FrameBuffer[];
    FBO: WebGLFramebuffer;
    RBO: WebGLRenderbuffer;
    type: number;
    properties: any;
    constructor();
    bind(): void;
    addTexture(name: string, width: number, height: number, slot?: number, minFilter?: number, magFilter?: number): void;
    static bindDefault(): void;
    static createRenderTexture(width: number, height: number): FrameBuffer;
    static renderToRenderTexture(fb: FrameBuffer, onRender: Function): void;
    static setDefaultRenderBuffer(): void;
}
export {};
