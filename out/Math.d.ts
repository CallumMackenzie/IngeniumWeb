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
    divFloat(n: number): Vec3;
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
export declare function radToDeg(rad: number): number;
export declare function degToRad(deg: number): number;
