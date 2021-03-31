"use strict";

import { gl } from "./WebGL";

export class Vec2 {
    x: number;
    y: number;
    w: number;

    static sub(v1: Vec2, v2: Vec2) {
        return new Vec2(v1.x - v2.x, v1.y - v2.y);
    }
    static add(v1: Vec2, v2: Vec2) {
        return new Vec2(v1.x + v2.x, v1.y + v2.y);
    }
    static mul(v1: Vec2, v2: Vec2) {
        return new Vec2(v1.x * v2.x, v1.y * v2.y);
    }
    static div(v1: Vec2, v2: Vec2) {
        return new Vec2(v1.x / v2.x, v1.y / v2.y);
    }
    static mulFloat(v1: Vec2, float: number) {
        return new Vec2(v1.x * float, v1.y * float);
    }
    static divFloat(v1: Vec2, float: number) {
        return new Vec2(v1.x / float, v1.y / float);
    }
    static len(v: Vec2) {
        return Math.sqrt(v.x * v.x + v.y * v.y);
    }
    static normalize(v: Vec2) {
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
    x: number;
    y: number;
    z: number;
    w: number;

    static sub(v1: Vec3, v2: Vec3) {
        return new Vec3(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
    }
    static add(v1: Vec3, v2: Vec3) {
        return new Vec3(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
    }
    static mul(v1: Vec3, v2: Vec3) {
        return new Vec3(v1.x * v2.x, v1.y * v2.y, v1.z * v2.z);
    }
    static div(v1: Vec3, v2: Vec3) {
        return new Vec3(v1.x / v2.x, v1.y / v2.y, v1.z / v2.z);
    }
    static mulFloat(v1: Vec3, float: number) {
        return new Vec3(v1.x * float, v1.y * float, v1.z * float);
    }
    static divFloat(v1: Vec3, float: number) {
        return new Vec3(v1.x / float, v1.y / float, v1.z / float);
    }
    static dot(v1: Vec3, v2: Vec3) {
        return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    }
    static len(v: Vec3) {
        return Math.sqrt(Vec3.dot(v, v));
    }
    static normalize(v: Vec3) {
        var l = Vec3.len(v);
        return new Vec3(v.x / l, v.y / l, v.z / l);
    }
    static cross(v1: Vec3, v2: Vec3) {
        var v = new Vec3();
        v.x = v1.y * v2.z - v1.z * v2.y;
        v.y = v1.z * v2.x - v1.x * v2.z;
        v.z = v1.x * v2.y - v1.y * v2.x;
        return v;
    }
    static mulMat(i: Vec3, m: Mat4) {
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
}

export class Mat4 {
    m: number[][];;

    static perspective(fovDeg: number, aspectRatio: number, near: number, far: number) {
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
    static identity() {
        var matrix = new Mat4();
        matrix.m[0][0] = 1.0;
        matrix.m[1][1] = 1.0;
        matrix.m[2][2] = 1.0;
        matrix.m[3][3] = 1.0;
        return matrix;
    }
    static pointedAt(pos: Vec3, target: Vec3, up: Vec3 = new Vec3(0, 1, 0)) {
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
    static scale(x: number = 1, y: number = 1, z: number = 1) {
        var matrix = Mat4.identity();
        matrix.m[0][0] = x;
        matrix.m[1][1] = y;
        matrix.m[2][2] = z;
        return matrix;
    }
    static translation(x: number = 0, y: number = 0, z: number = 0) {
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

    constructor() {
        this.m = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
    }
}

export class Vert {
    p: Vec3;
    t: Vec2;
    rgb: Vec3;
    n: Vec3;

    constructor(point: Vec3 = new Vec3(), UV: Vec2 = new Vec2(), rgb: Vec3 = new Vec3(), normal: Vec3 = new Vec3()) {
        this.p = point;
        this.t = UV;
        this.rgb = rgb;
        this.n = normal;
    }
}

export class Tri {
    v: Vert[];

    constructor(points: Vert[] = [new Vert(), new Vert(), new Vert()]) {
        this.v = [points[0], points[1], points[2]];
    }
}

export class Material {
    diffuseTex: WebGLTexture;
    specularTexture: WebGLTexture;
    shininess: number;
    constructor(diffuseTexture = gl.NONE, specularTexture = gl.NONE, shininess = 0.5) {
        this.diffuseTex = diffuseTexture;
        this.specularTexture = specularTexture;
        this.shininess = shininess;
    }
}

export class Mesh {
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

    constructor(position: Vec3 = new Vec3(), rotation: Vec3 = new Vec3(), rotationCenter: Vec3 = new Vec3(), scale: Vec3 = new Vec3(1, 1, 1), material: Material = new Material()) {
        this.rotation = rotation;
        this.rotationCenter = rotationCenter;
        this.position = position;
        this.scale = scale;
        this.material = material;
        this.loaded = false;
        this.mVBO = gl.NONE;
        this.mVAO = gl.NONE;
        this.mTVBO = gl.NONE;
        this.data = [];
    }
    loadFromObj() {

    };
    addTriangle(triangle: Tri) {
        for (var i = 0; i < 3; i++) {
            this.data.push(triangle.v[i].p.x);
            this.data.push(triangle.v[i].p.y);
            this.data.push(triangle.v[i].p.z);
            this.data.push(triangle.v[i].p.w);

            this.data.push(triangle.v[i].t.x);
            this.data.push(triangle.v[i].t.y);
            this.data.push(triangle.v[i].t.w);

            this.data.push(triangle.v[i].rgb.x);
            this.data.push(triangle.v[i].rgb.y);
            this.data.push(triangle.v[i].rgb.z);
            this.data.push(triangle.v[i].rgb.w);

            this.data.push(triangle.v[i].n.x);
            this.data.push(triangle.v[i].n.y);
            this.data.push(triangle.v[i].n.z);
            this.data.push(triangle.v[i].n.w);
        }
    }
}