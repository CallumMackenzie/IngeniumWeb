"use strict";

export var PI: number = 355 / 113;

export class Vec2 {
    x: number = 0;
    y: number = 0;
    w: number = 1;


    static filledWith(num: number): Vec2 {
        return new Vec2(num, num);
    }

    static sub(v1: Vec2, v2: Vec2): Vec2 {
        return new Vec2(v1.x - v2.x, v1.y - v2.y);
    }
    static add(v1: Vec2, v2: Vec2): Vec2 {
        return new Vec2(v1.x + v2.x, v1.y + v2.y);
    }
    static mul(v1: Vec2, v2: Vec2): Vec2 {
        return new Vec2(v1.x * v2.x, v1.y * v2.y);
    }
    static div(v1: Vec2, v2: Vec2): Vec2 {
        return new Vec2(v1.x / v2.x, v1.y / v2.y);
    }
    static mulFloat(v1: Vec2, float: number): Vec2 {
        return new Vec2(v1.x * float, v1.y * float);
    }
    static divFloat(v1: Vec2, float: number): Vec2 {
        return new Vec2(v1.x / float, v1.y / float);
    }
    static len(v: Vec2): number {
        return Math.sqrt(v.x * v.x + v.y * v.y);
    }
    static normalize(v: Vec2): Vec2 {
        var l = Vec2.len(v);
        return new Vec2(v.x / l, v.y / l);
    }

    constructor(x: number = 0, y: number = 0, w: number = 1) {
        this.x = x;
        this.y = y;
        this.w = w;
    }
}

export class Vec3 {
    x: number = 0;
    y: number = 0;
    z: number = 0;
    w: number = 1;

    static filledWith(num: number): Vec3 {
        return new Vec3(num, num, num);
    }

    static sub(v1: Vec3, v2: Vec3): Vec3 {
        return new Vec3(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
    }
    static add(v1: Vec3, v2: Vec3): Vec3 {
        return new Vec3(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
    }
    static mul(v1: Vec3, v2: Vec3): Vec3 {
        return new Vec3(v1.x * v2.x, v1.y * v2.y, v1.z * v2.z);
    }
    static div(v1: Vec3, v2: Vec3): Vec3 {
        return new Vec3(v1.x / v2.x, v1.y / v2.y, v1.z / v2.z);
    }
    static mulFloat(v1: Vec3, float: number): Vec3 {
        return new Vec3(v1.x * float, v1.y * float, v1.z * float);
    }
    static divFloat(v1: Vec3, float: number): Vec3 {
        return new Vec3(v1.x / float, v1.y / float, v1.z / float);
    }
    static dot(v1: Vec3, v2: Vec3): number {
        return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    }
    static len(v: Vec3): number {
        return Math.sqrt(Vec3.dot(v, v));
    }
    static normalize(v: Vec3): Vec3 {
        var l = Vec3.len(v);
        if (l != 0)
            return new Vec3(v.x / l, v.y / l, v.z / l);
        return new Vec3();
    }
    static cross(v1: Vec3, v2: Vec3): Vec3 {
        var v = new Vec3();
        v.x = v1.y * v2.z - v1.z * v2.y;
        v.y = v1.z * v2.x - v1.x * v2.z;
        v.z = v1.x * v2.y - v1.y * v2.x;
        return v;
    }
    static mulMat(i: Vec3, m: Mat4): Vec3 {
        var v = new Vec3();
        v.x = i.x * m.m[0][0] + i.y * m.m[1][0] + i.z * m.m[2][0] + i.w * m.m[3][0];
        v.y = i.x * m.m[0][1] + i.y * m.m[1][1] + i.z * m.m[2][1] + i.w * m.m[3][1];
        v.z = i.x * m.m[0][2] + i.y * m.m[1][2] + i.z * m.m[2][2] + i.w * m.m[3][2];
        v.w = i.x * m.m[0][3] + i.y * m.m[1][3] + i.z * m.m[2][3] + i.w * m.m[3][3];
        return v;
    }

    constructor(x: number = 0, y: number = 0, z: number = 0, w: number = 1) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }
    add(v: Vec3): Vec3 {
        return new Vec3(this.x + v.x, this.y + v.y, this.z + v.z);
    }
    sub(v: Vec3): Vec3 {
        return new Vec3(this.x - v.x, this.y - v.y, this.z - v.z);
    }
    mul(v: Vec3): Vec3 {
        return new Vec3(this.x * v.x, this.y * v.y, this.z * v.z);
    }
    div(v: Vec3): Vec3 {
        return new Vec3(this.x / v.x, this.y / v.y, this.z / v.z);
    }
    mulFloat(n: number): Vec3 {
        return new Vec3(this.x * n, this.y * n, this.z * n);
    }
    divFloat(n: number): Vec3 {
        return new Vec3(this.x / n, this.y / n, this.z / n);
    }
}

export class Mat4 {
    m: number[][];

    static perspective(fovDeg: number, aspectRatio: number, near: number, far: number): Mat4 {
        var fovRad = 1.0 / Math.tan(degToRad(fovDeg * 0.5));
        var matrix = new Mat4();
        matrix.m[0][0] = aspectRatio * fovRad;
        matrix.m[1][1] = fovRad;
        matrix.m[2][2] = far / (far - near);
        matrix.m[3][2] = (-far * near) / (far - near);
        matrix.m[2][3] = 1.0;
        matrix.m[3][3] = 0.0;
        return matrix;
    };
    static inverse(m: Mat4): Mat4 {
        var matrix: Mat4 = new Mat4();
        matrix.m[0][0] = m.m[0][0]; matrix.m[0][1] = m.m[1][0]; matrix.m[0][2] = m.m[2][0]; matrix.m[0][3] = 0.0;
        matrix.m[1][0] = m.m[0][1]; matrix.m[1][1] = m.m[1][1]; matrix.m[1][2] = m.m[2][1]; matrix.m[1][3] = 0.0;
        matrix.m[2][0] = m.m[0][2]; matrix.m[2][1] = m.m[1][2]; matrix.m[2][2] = m.m[2][2]; matrix.m[2][3] = 0.0;
        matrix.m[3][0] = -(m.m[3][0] * matrix.m[0][0] + m.m[3][1] * matrix.m[1][0] + m.m[3][2] * matrix.m[2][0]);
        matrix.m[3][1] = -(m.m[3][0] * matrix.m[0][1] + m.m[3][1] * matrix.m[1][1] + m.m[3][2] * matrix.m[2][1]);
        matrix.m[3][2] = -(m.m[3][0] * matrix.m[0][2] + m.m[3][1] * matrix.m[1][2] + m.m[3][2] * matrix.m[2][2]);
        matrix.m[3][3] = 1.0;
        return matrix;
    }
    static identity(): Mat4 {
        var matrix = new Mat4();
        matrix.m[0][0] = 1.0;
        matrix.m[1][1] = 1.0;
        matrix.m[2][2] = 1.0;
        matrix.m[3][3] = 1.0;
        return matrix;
    }
    static pointedAt(pos: Vec3, target: Vec3, up: Vec3 = new Vec3(0, 1, 0)): Mat4 {
        var newForward = Vec3.sub(target, pos);
        newForward = Vec3.normalize(newForward);

        var a = Vec3.mulFloat(newForward, Vec3.dot(up, newForward));
        var newUp = Vec3.sub(up, a);
        newUp = Vec3.normalize(newUp);

        var newRight = Vec3.cross(newUp, newForward);
        var matrix = new Mat4();
        matrix.m[0][0] = newRight.x; matrix.m[0][1] = newRight.y; matrix.m[0][2] = newRight.z; matrix.m[0][3] = 0.0;
        matrix.m[1][0] = newUp.x; matrix.m[1][1] = newUp.y; matrix.m[1][2] = newUp.z; matrix.m[1][3] = 0.0;
        matrix.m[2][0] = newForward.x; matrix.m[2][1] = newForward.y; matrix.m[2][2] = newForward.z; matrix.m[2][3] = 0.0;
        matrix.m[3][0] = pos.x; matrix.m[3][1] = pos.y; matrix.m[3][2] = pos.z; matrix.m[3][3] = 1.0;
        return matrix;
    }
    static scale(x: number = 1, y: number = 1, z: number = 1): Mat4 {
        var matrix = Mat4.identity();
        matrix.m[0][0] = x;
        matrix.m[1][1] = y;
        matrix.m[2][2] = z;
        return matrix;
    }
    static translation(x: number = 0, y: number = 0, z: number = 0): Mat4 {
        var matrix = new Mat4();
        matrix.m[0][0] = 1.0;
        matrix.m[1][1] = 1.0;
        matrix.m[2][2] = 1.0;
        matrix.m[3][3] = 1.0;
        matrix.m[3][0] = x;
        matrix.m[3][1] = y;
        matrix.m[3][2] = z;
        return matrix;
    }
    static mul(m1: Mat4, m2: Mat4): Mat4 {
        var matrix: Mat4 = new Mat4();
        for (var c: number = 0; c < 4; c++)
            for (var r: number = 0; r < 4; r++)
                matrix.m[r][c] = m1.m[r][0] * m2.m[0][c] + m1.m[r][1] * m2.m[1][c] + m1.m[r][2] * m2.m[2][c] + m1.m[r][3] * m2.m[3][c];
        return matrix;
    }
    static rotationX(xRad: number): Mat4 {
        var matrix: Mat4 = new Mat4();
        matrix.m[0][0] = 1;
        matrix.m[1][1] = Math.cos(xRad);
        matrix.m[1][2] = Math.sin(xRad);
        matrix.m[2][1] = -Math.sin(xRad);
        matrix.m[2][2] = Math.cos(xRad);
        matrix.m[3][3] = 1;
        return matrix;
    }
    static rotationY(yRad: number): Mat4 {
        var matrix: Mat4 = new Mat4();
        matrix.m[0][0] = Math.cos(yRad);
        matrix.m[0][2] = Math.sin(yRad);
        matrix.m[2][0] = -Math.sin(yRad);
        matrix.m[1][1] = 1;
        matrix.m[2][2] = Math.cos(yRad);
        matrix.m[3][3] = 1;
        return matrix;
    }
    static rotationZ(zRad: number): Mat4 {
        var matrix: Mat4 = new Mat4();
        matrix.m[0][0] = Math.cos(zRad);
        matrix.m[0][1] = Math.sin(zRad);
        matrix.m[1][0] = -Math.sin(zRad);
        matrix.m[1][1] = Math.cos(zRad);
        matrix.m[2][2] = 1;
        matrix.m[3][3] = 1;
        return matrix;
    }
    static rotationOnPoint(xRad: number, yRad: number, zRad: number, pt: Vec3): Mat4 {
        var mat: Mat4 = Mat4.mul(
            Mat4.mul(Mat4.translation(pt.x, pt.y, pt.z),
                Mat4.mul(Mat4.mul(Mat4.rotationX(xRad), Mat4.rotationY(yRad)), Mat4.rotationZ(zRad))),
            Mat4.translation(-pt.x, -pt.y, -pt.z));
        return mat;
    }

    constructor() {
        this.m = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
    }
}

export function radToDeg(rad: number): number {
    return rad * 180 / PI;
}

export function degToRad(deg: number): number {
    return deg * PI / 180;
}