"use strict";

import { gl, Shader, IngeniumWeb, Time, Input } from "./WebGL.js";
import { degToRad, loadFile, radToDeg } from "./Utils.js";
import { Geometry } from "./geometry.js";

export class Vec2 {
    x: number;
    y: number;
    w: number;

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
    x: number;
    y: number;
    z: number;
    w: number;

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
    add (v : Vec3) : Vec3 {
        return new Vec3(this.x + v.x, this.y + v.y, this.z + v.z);
    }
    sub (v : Vec3) : Vec3 {
        return new Vec3(this.x - v.x, this.y - v.y, this.z - v.z);
    }
    mul (v : Vec3) : Vec3 {
        return new Vec3(this.x * v.x, this.y * v.y, this.z * v.z);
    }
    div (v : Vec3) : Vec3 {
        return new Vec3(this.x / v.x, this.y / v.y, this.z / v.z);
    }
    mulFloat (n : number) : Vec3 {
        return new Vec3(this.x * n, this.y * n, this.z * n);
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

export class Vert {
    static tSize: number = 17;

    p: Vec3; // 4
    t: Vec2; // 3
    rgb: Vec3; // 4
    n: Vec3; // 3
    tan: Vec3; // 3

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
    diffuseTexture: WebGLTexture;
    specularTexture: WebGLTexture;
    normalTexture: WebGLTexture;
    parallaxTexture: WebGLTexture = gl.NONE;
    hasNormalTexture: boolean = false;
    hasParallaxTexture: boolean = false;
    shininess: number = 0.5;
    parallaxScale: number = 0;
    constructor(diffuseTexture: WebGLTexture = gl.NONE, specularTexture: WebGLTexture = gl.NONE, normalTexture: WebGLTexture = gl.NONE, shininess: number = 0.5) {
        this.diffuseTexture = diffuseTexture;
        this.specularTexture = specularTexture;
        this.normalTexture = normalTexture;
        this.shininess = shininess;
    }
}

export class Camera {
    position: Vec3 = new Vec3();
    rotation: Vec3 = new Vec3();

    FOV: number;
    clipNear: number;
    clipFar: number;

    constructor(fov: number = 75, clipNear: number = 0.1, clipFar: number = 500) {
        this.FOV = fov;
        this.clipNear = clipNear;
        this.clipFar = clipFar;
    }
    lookVector(): Vec3 {
        var target: Vec3 = new Vec3(0, 0, 1);
        var up: Vec3 = new Vec3(0, 1, 0);
        var mRotation: Mat4 = Mat4.mul(Mat4.mul(Mat4.rotationX(this.rotation.x), Mat4.rotationY(this.rotation.y)), Mat4.rotationZ(this.rotation.z));
        target = Vec3.mulMat(target, mRotation);
        return target;
    }
    perspective(): Mat4 {
        return Mat4.perspective(this.FOV, IngeniumWeb.window.aspectRatio, this.clipNear, this.clipFar);
    }
    cameraMatrix(): Mat4 {
        var vUp: Vec3 = new Vec3(0, 1, 0);
        var vTarget: Vec3 = new Vec3(0, 0, 1);
        var matCameraRotY: Mat4 = Mat4.rotationY(this.rotation.y);
        var matCameraRotX: Mat4 = Mat4.rotationX(this.rotation.x);
        var matCameraRotZ: Mat4 = Mat4.rotationZ(this.rotation.z);
        var camRot: Vec3 = Vec3.mulMat(vTarget, Mat4.mul(Mat4.mul(matCameraRotX, matCameraRotY), matCameraRotZ));
        vTarget = Vec3.add(this.position, camRot);
        var matCamera: Mat4 = Mat4.pointedAt(this.position, vTarget, vUp);
        return matCamera;
    }
    stdControl(speed: number = 0.01, cameraMoveSpeed: number = 0.0015): void {
        var cLV: Vec3 = this.lookVector();

        var forward: Vec3 = new Vec3();
        var up: Vec3 = new Vec3(0, 1, 0);
        var rotate: Vec3 = new Vec3();
        if (Input.getKeyState('w'))
            forward = Vec3.add(forward, cLV);
        if (Input.getKeyState('s'))
            forward = Vec3.mulFloat(Vec3.add(forward, cLV), -1);
        if (Input.getKeyState('d'))
            forward = Vec3.add(forward, Vec3.cross(cLV, up));
        if (Input.getKeyState('a'))
            forward = Vec3.add(forward, Vec3.mulFloat(Vec3.cross(cLV, up), -1));
        if (Input.getKeyState('q') || Input.getKeyState(' '))
            forward.y = forward.y + 1;
        if (Input.getKeyState('e'))
            forward.y = forward.y - 1;

        if (Input.getKeyState('ArrowLeft'))
            rotate.y = -cameraMoveSpeed;
        if (Input.getKeyState('ArrowRight'))
            rotate.y = cameraMoveSpeed;
        if (Input.getKeyState('ArrowUp'))
            rotate.x = -cameraMoveSpeed;
        if (Input.getKeyState('ArrowDown'))
            rotate.x = cameraMoveSpeed;
        // if (Input.getKeyState('Shift') || Input.getKeyState('ShiftLeft'))
        //     speed *= 5;

        this.rotation = Vec3.add(this.rotation, Vec3.mulFloat(rotate, Time.deltaTime));
        this.position = Vec3.add(this.position, Vec3.mulFloat(Vec3.normalize(forward), speed * Time.deltaTime));

        if (this.rotation.x >= degToRad(87)) this.rotation.x = degToRad(87);
        if (this.rotation.x <= -degToRad(87)) this.rotation.x = -degToRad(87);
        if (Math.abs(this.rotation.y) >= degToRad(360)) this.rotation.y = 0;
        if (Math.abs(this.rotation.z) >= degToRad(360)) this.rotation.z = 0;
    }
}

var loadedImages: { [id: string]: HTMLImageElement } = {};
var loadedGeometry: { [id: string]: Geometry } = {};

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
    tint: Vec3 = new Vec3();
    triangles : number = 0;

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
    make(objPath: string, diffTexPath: string = "NONE", specTexPath: string = "NONE",
        normalPath: string = "NONE", parallaxPath = "NONE") {
        var obGeometry: Geometry;
        if (Object.keys(loadedGeometry).includes(objPath))
            obGeometry = loadedGeometry[objPath];
        else {
            obGeometry = new Geometry(loadFile(objPath), "USER_GEOMETRY");
            loadedGeometry[objPath] = obGeometry;
        }
        this.makeFromGeometry(obGeometry, diffTexPath, specTexPath, normalPath, parallaxPath);
    }
    makeFromGeometry(geom: Geometry, diffTexPath: string = "NONE",
        specTexPath: string = "NONE", normalPath: string = "NONE",
        parallaxPath: string = "NONE") {
        this.loadFromObjData(geom.data);
        this.setTexture(diffTexPath, specTexPath, normalPath, parallaxPath);
        this.load();
    }
    loadFromObjData(raw: string): void {
        var verts: Vec3[] = [];
        var normals: Vec3[] = [];
        var texs: Vec2[] = [];
        var lines: string[] = raw.split("\n");

        var hasNormals: boolean = raw.includes("vn");
        var hasTexture: boolean = raw.includes("vt");

        for (var i = 0; i < lines.length; i++) {
            var line: string = lines[i];
            if (line[0] == 'v') {
                if (line[1] == 't') {
                    var v: Vec2 = new Vec2();
                    var seg: string[] = line.split(" ");
                    v.x = parseFloat(seg[1]);
                    v.y = parseFloat(seg[2]);
                    texs.push(v);
                }
                else if (line[1] == 'n') {
                    var normal: Vec3 = new Vec3();
                    var seg: string[] = line.split(" ");
                    normal.x = parseFloat(seg[1]);
                    normal.y = parseFloat(seg[2]);
                    normal.z = parseFloat(seg[3]);
                    normals.push(normal);
                }
                else {
                    var ve: Vec3 = new Vec3();
                    var seg: string[] = line.split(" ");
                    ve.x = parseFloat(seg[1]);
                    ve.y = parseFloat(seg[2]);
                    ve.z = parseFloat(seg[3]);
                    verts.push(ve);
                }
            }
            if (line[0] == 'f') {
                var params: number = 1;
                if (hasNormals)
                    params++;
                if (hasTexture)
                    params++

                var vals = [];
                var seg: string[] = line.replace("f", "").split(/[\/\s]+/g);

                for (var l: number = 1; l < seg.length; l++)
                    vals.push(parseInt(seg[l]));

                var push: Tri = new Tri();
                for (var k: number = 0; k < 3; k++) {
                    push.v[k].p = verts[vals[params * k] - 1];
                    if (hasTexture)
                        push.v[k].t = texs[vals[(params * k) + 1] - 1];
                    if (hasNormals && !hasTexture)
                        push.v[k].n = normals[vals[(params * k) + 1] - 1];
                    if (hasNormals && hasTexture)
                        push.v[k].n = normals[vals[(params * k) + 2] - 1];
                }

                this.addTriangle(push);
            }
        }
    }
    addTriangle(triangle: Tri): void {
        var tangent: Vec3[] = Mesh.calcTangents(triangle); // Calculate tangent and bittangent
        for (var i = 0; i < 3; i++) {
            this.data.push(triangle.v[i].p.x);
            this.data.push(triangle.v[i].p.y);
            this.data.push(triangle.v[i].p.z);
            this.data.push(triangle.v[i].p.w);

            this.data.push(triangle.v[i].t.x);
            this.data.push(triangle.v[i].t.y);
            this.data.push(triangle.v[i].t.w);

            this.data.push(triangle.v[i].rgb.x + this.tint.x);
            this.data.push(triangle.v[i].rgb.y + this.tint.y);
            this.data.push(triangle.v[i].rgb.z + this.tint.z);
            this.data.push(triangle.v[i].rgb.w);

            this.data.push(triangle.v[i].n.x);
            this.data.push(triangle.v[i].n.y);
            this.data.push(triangle.v[i].n.z);

            this.data.push(tangent[0].x);
            this.data.push(tangent[0].y);
            this.data.push(tangent[0].z);
        }
        this.triangles++;
    }
    createTextureFromPath(path: string, texSlot: number = gl.TEXTURE0, wrap: number[] = [gl.REPEAT, gl.REPEAT],
        minFilter: number = gl.LINEAR_MIPMAP_LINEAR, magFilter: number = gl.LINEAR): WebGLTexture {

        var tex: WebGLTexture = gl.NONE;
        tex = gl.createTexture();
        gl.activeTexture(texSlot);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([1, 1, 1, 255]));

        if (path != "NONE") {
            var image: HTMLImageElement;
            if (Object.keys(loadedImages).includes(path) && loadedImages[path].complete) {
                image = loadedImages[path];
                gl.activeTexture(texSlot);
                gl.bindTexture(gl.TEXTURE_2D, tex);

                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap[0]);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap[1]);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter);

                gl.generateMipmap(gl.TEXTURE_2D);
            } else {
                image = new Image();
                image.src = path;
                loadedImages[path] = image;
                image.addEventListener('load', function () {
                    gl.activeTexture(texSlot);
                    gl.bindTexture(gl.TEXTURE_2D, tex);

                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap[0]);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap[1]);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter);

                    gl.generateMipmap(gl.TEXTURE_2D);
                })
            };
        }
        return tex;
    }
    setTexture(diffusePath: string, specularPath: string = "NONE", normalPath: string = "NONE",
        parallaxPath: string = "NONE"): void {
        this.material.diffuseTexture = this.createTextureFromPath(diffusePath, gl.TEXTURE0);
        this.material.specularTexture = this.createTextureFromPath(specularPath, gl.TEXTURE1);
        this.material.normalTexture = this.createTextureFromPath(normalPath, gl.TEXTURE2);
        this.material.parallaxTexture = this.createTextureFromPath(specularPath, gl.TEXTURE3);
        this.material.hasNormalTexture = normalPath != "NONE";
        this.material.hasParallaxTexture = parallaxPath != "NONE";
    }
    modelMatrix(): Mat4 {
        var matRot: Mat4 = Mat4.rotationOnPoint(this.rotation.x, this.rotation.y, this.rotation.z, this.rotationCenter);
        var matTrans: Mat4 = Mat4.translation(this.position.x, this.position.y, this.position.z);
        var matScale: Mat4 = Mat4.scale(this.scale.x, this.scale.y, this.scale.z);
        var matWorld: Mat4 = Mat4.mul(Mat4.mul(matScale, matRot), matTrans);
        return matWorld;
    }
    load(drawType: number = gl.DYNAMIC_DRAW): void {
        if (!this.loaded) {
            this.mVBO = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.mVBO);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.data), drawType);

            this.mVAO = gl.createVertexArray();
            gl.bindVertexArray(this.mVAO);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.mVBO);

            var size: number = Vert.tSize;

            var floatSize: number = 4;
            var stride: number = size * floatSize; // Num of array elements resulting from a Vert

            gl.vertexAttribPointer(0, 4, gl.FLOAT, false, stride, 0); // Vertex data
            gl.enableVertexAttribArray(0);

            gl.vertexAttribPointer(1, 3, gl.FLOAT, false, stride, 4 * floatSize); // UV data
            gl.enableVertexAttribArray(1);

            gl.vertexAttribPointer(2, 4, gl.FLOAT, false, stride, 7 * floatSize); // RGB tint data
            gl.enableVertexAttribArray(2);

            gl.vertexAttribPointer(3, 4, gl.FLOAT, false, stride, 11 * floatSize); // Normal data
            gl.enableVertexAttribArray(3);

            gl.vertexAttribPointer(4, 3, gl.FLOAT, false, stride, 14 * floatSize); // Tangent data
            gl.enableVertexAttribArray(4);

            gl.bindBuffer(gl.ARRAY_BUFFER, null); // Unbind buffer
            this.loaded = true;
        }
    }

    static calcTangents(triangle: Tri): Vec3[] {
        var edge1: Vec3 = Vec3.sub(triangle.v[1].p, triangle.v[0].p);
        var edge2: Vec3 = Vec3.sub(triangle.v[2].p, triangle.v[0].p);
        var dUV1: Vec2 = Vec2.sub(triangle.v[1].t, triangle.v[0].t);
        var dUV2: Vec2 = Vec2.sub(triangle.v[2].t, triangle.v[0].t);

        var f: number = 1.0 / (dUV1.x * dUV2.y - dUV2.x * dUV1.y);

        var tan: Vec3 = new Vec3();

        tan.x = f * (dUV2.y * edge1.x - dUV1.y * edge2.x);
        tan.y = f * (dUV2.y * edge1.y - dUV1.y * edge2.y);
        tan.z = f * (dUV2.y * edge1.z - dUV1.y * edge2.z);

        var bitTan: Vec3 = new Vec3();
        bitTan.x = f * (-dUV2.x * edge1.x + dUV1.x * edge2.x);
        bitTan.y = f * (-dUV2.x * edge1.y + dUV1.x * edge2.y);
        bitTan.z = f * (-dUV2.x * edge1.z + dUV1.x * edge2.z);

        return [tan, bitTan];
    }

    static renderAll(shader: Shader, camera: Camera, meshes: Mesh[], dirLight: DirectionalLight, pointLights: PointLight[] = []) {
        shader.use();
        shader.setUInt("material.diffuse", 0);
        shader.setUInt("material.specular", 1);
        shader.setUInt("material.normal", 2);
        shader.setUInt("material.parallax", 3);
        shader.setUFloat("u_time", Date.now());
        shader.setUMat4("view", Mat4.inverse(camera.cameraMatrix()));
        shader.setUVec3("viewPos", camera.position);
        shader.setUMat4("projection", camera.perspective());

        shader.setUVec3("dirLight.direction", dirLight.direction);
        shader.setUVec3("dirLight.ambient", dirLight.ambient);
        shader.setUVec3("dirLight.specular", dirLight.specular.mulFloat(dirLight.intensity));
        shader.setUVec3("dirLight.diffuse", dirLight.diffuse.mulFloat(dirLight.intensity));


        for (var j: number = 0; j < pointLights.length; j++) {
            shader.setUVec3("pointLights[" + j + "].position", pointLights[j].position);
            shader.setUVec3("pointLights[" + j + "].ambient", pointLights[j].ambient);
            shader.setUVec3("pointLights[" + j + "].diffuse", Vec3.mulFloat(pointLights[j].diffuse, pointLights[j].intensity));
            shader.setUVec3("pointLights[" + j + "].specular", Vec3.mulFloat(pointLights[j].specular, pointLights[j].intensity));
            shader.setUFloat("pointLights[" + j + "].constant", pointLights[j].constant);
            shader.setUFloat("pointLights[" + j + "].linear)", pointLights[j].linear);
            shader.setUFloat("pointLights[" + j + "].quadratic", pointLights[j].quadratic);
        }

        for (var i: number = 0; i < meshes.length; i++) {
            gl.bindVertexArray(meshes[i].mVAO);

            var model: Mat4 = meshes[i].modelMatrix();
            shader.setUMat4("model", model);
            shader.setUBool("hasNormalTexture", meshes[i].material.hasNormalTexture);
            shader.setUBool("hasParallaxTexture", meshes[i].material.hasParallaxTexture);
            shader.setUMat4("invModel", Mat4.inverse(model));
            shader.setUFloat("material.shininess", meshes[i].material.shininess);
            shader.setUFloat("heightScale", meshes[i].material.parallaxScale);
            gl.activeTexture(gl.TEXTURE0);
            if (meshes[i].material.diffuseTexture != gl.NONE) {
                gl.bindTexture(gl.TEXTURE_2D, meshes[i].material.diffuseTexture);
            }
            gl.activeTexture(gl.TEXTURE1);
            if (meshes[i].material.specularTexture != gl.NONE) {
                gl.bindTexture(gl.TEXTURE_2D, meshes[i].material.specularTexture)
            }
            gl.activeTexture(gl.TEXTURE2);
            if (meshes[i].material.normalTexture != gl.NONE) {
                gl.bindTexture(gl.TEXTURE_2D, meshes[i].material.normalTexture)
            }

            gl.drawArrays(gl.TRIANGLES, 0, meshes[i].data.length / Vert.tSize);
        }
    }
}

export class PointLight {
    intensity: number;
    ambient: Vec3;
    diffuse: Vec3;
    specular: Vec3;
    position: Vec3;

    constant: number = 1;
    linear: number = 0.09;
    quadratic: number = 0.032;

    constructor(ambient: Vec3 = new Vec3(0.05, 0.05, 0.05),
        diffuse: Vec3 = new Vec3(0.8, 0.8, 0.8),
        specular: Vec3 = new Vec3(0.2, 0.2, 0.2),
        position: Vec3 = new Vec3(), intensity: number = 1) {

        this.ambient = ambient;
        this.diffuse = diffuse;
        this.specular = specular;
        this.position = position;
        this.intensity = intensity;
    }
}

export class DirectionalLight {

    intensity: number = 1;
    ambient: Vec3;
    diffuse: Vec3;
    specular: Vec3;
    direction: Vec3;

    constructor(ambient: Vec3 = new Vec3(0.05, 0.05, 0.05),
        diffuse: Vec3 = new Vec3(0.8, 0.8, 0.8),
        specular: Vec3 = new Vec3(0.2, 0.2, 0.2),
        direction: Vec3 = new Vec3(0, -1, 0.2), intensity: number = 1) {
        this.ambient = ambient;
        this.diffuse = diffuse;
        this.specular = specular;
        this.direction = direction;
        this.intensity = intensity;
    }
}