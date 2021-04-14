"use strict";
import { gl, IngeniumWeb, Time, Input } from "./WebGL.js";
import { loadFile } from "./Utils.js";
import { Geometry, ReferenceGeometry } from "./Geometry.js";
import { Vec3, Vec2, Mat4, degToRad } from "./Math.js";
export class Vert {
    constructor(point = new Vec3(), UV = new Vec2(), rgb = new Vec3(1, 1, 1), normal = new Vec3()) {
        this.rgb = new Vec3(1, 1, 1); // 4
        this.p = point;
        this.t = UV;
        this.rgb = rgb;
        this.n = normal;
    }
}
Vert.tSize = 17;
export class Tri {
    constructor(points = [new Vert(), new Vert(), new Vert()]) {
        this.v = [points[0], points[1], points[2]];
    }
}
export class Material {
    constructor(diffuseTexture = gl.NONE, specularTexture = gl.NONE, normalTexture = gl.NONE, shininess = 0.5) {
        this.parallaxTexture = gl.NONE;
        this.hasNormalTexture = false;
        this.hasParallaxTexture = false;
        this.shininess = 0.5;
        this.parallaxScale = 0;
        this.diffuseTexture = diffuseTexture;
        this.specularTexture = specularTexture;
        this.normalTexture = normalTexture;
        this.shininess = shininess;
    }
}
export class ReferenceMaterial {
    constructor() {
        this.diffuseTexture = gl.NONE;
        this.specularTexture = gl.NONE;
        this.normalTexture = gl.NONE;
        this.parallaxTexture = gl.NONE;
        this.hasNormalTexture = false;
        this.hasParallaxTexture = false;
    }
}
export class Camera {
    constructor(fov = 75, clipNear = 0.1, clipFar = 500) {
        this.position = new Vec3();
        this.rotation = new Vec3();
        this.FOV = fov;
        this.clipNear = clipNear;
        this.clipFar = clipFar;
    }
    lookVector() {
        var target = new Vec3(0, 0, 1);
        var up = new Vec3(0, 1, 0);
        var mRotation = Mat4.mul(Mat4.mul(Mat4.rotationX(this.rotation.x), Mat4.rotationY(this.rotation.y)), Mat4.rotationZ(this.rotation.z));
        target = Vec3.mulMat(target, mRotation);
        return target;
    }
    perspective() {
        return Mat4.perspective(this.FOV, IngeniumWeb.window.aspectRatio, this.clipNear, this.clipFar);
    }
    cameraMatrix() {
        var vUp = new Vec3(0, 1, 0);
        var vTarget = new Vec3(0, 0, 1);
        var matCameraRotY = Mat4.rotationY(this.rotation.y);
        var matCameraRotX = Mat4.rotationX(this.rotation.x);
        var matCameraRotZ = Mat4.rotationZ(this.rotation.z);
        var camRot = Vec3.mulMat(vTarget, Mat4.mul(Mat4.mul(matCameraRotX, matCameraRotY), matCameraRotZ));
        vTarget = Vec3.add(this.position, camRot);
        var matCamera = Mat4.pointedAt(this.position, vTarget, vUp);
        return matCamera;
    }
    stdControl(speed = 0.01, cameraMoveSpeed = 0.0015) {
        var cLV = this.lookVector();
        var forward = new Vec3();
        var up = new Vec3(0, 1, 0);
        var rotate = new Vec3();
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
        if (this.rotation.x >= degToRad(87))
            this.rotation.x = degToRad(87);
        if (this.rotation.x <= -degToRad(87))
            this.rotation.x = -degToRad(87);
        if (Math.abs(this.rotation.y) >= degToRad(360))
            this.rotation.y = 0;
        if (Math.abs(this.rotation.z) >= degToRad(360))
            this.rotation.z = 0;
    }
}
var loadedImages = {};
var loadedGeometry = {};
var loadedReferenceTextures = {};
var loadedReferenceGeometry = {};
export class Mesh {
    constructor(position = new Vec3(), rotation = new Vec3(), rotationCenter = new Vec3(), scale = new Vec3(1, 1, 1), material = new Material()) {
        this.tint = new Vec3(1, 1, 1);
        this.triangles = 0;
        this.useGeometryReferenceCache = false;
        this.useTextureReferenceCache = true;
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
    make(objPath, diffTexPath = "NONE", specTexPath = "NONE", normalPath = "NONE", parallaxPath = "NONE") {
        if (this.useGeometryReferenceCache && Object.keys(loadedReferenceGeometry).includes(objPath)) {
            var geom = loadedReferenceGeometry[objPath];
            this.mVBO = geom.VBO;
            this.mVAO = geom.VAO;
            this.triangles = geom.triangles;
            this.loaded = true;
        }
        else if (Object.keys(loadedGeometry).includes(objPath)) {
            this.loadFromObjData(loadedGeometry[objPath].data);
        }
        else {
            var obGeometry = new Geometry(loadFile(objPath), "USER_GEOMETRY");
            loadedGeometry[objPath] = obGeometry;
            this.loadFromObjData(obGeometry.data);
        }
        this.setTexture(diffTexPath, specTexPath, normalPath, parallaxPath);
        this.load();
        if (!Object.keys(loadedReferenceGeometry).includes(objPath)) {
            var refG = new ReferenceGeometry();
            refG.VBO = this.mVBO;
            refG.VAO = this.mVAO;
            refG.triangles = this.triangles;
            loadedReferenceGeometry[objPath] = refG;
        }
    }
    loadFromObjData(raw) {
        var verts = [];
        var normals = [];
        var texs = [];
        var lines = raw.split("\n");
        var hasNormals = raw.includes("vn");
        var hasTexture = raw.includes("vt");
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if (line[0] == 'v') {
                if (line[1] == 't') {
                    var v = new Vec2();
                    var seg = line.split(" ");
                    v.x = parseFloat(seg[1]);
                    v.y = parseFloat(seg[2]);
                    texs.push(v);
                }
                else if (line[1] == 'n') {
                    var normal = new Vec3();
                    var seg = line.split(" ");
                    normal.x = parseFloat(seg[1]);
                    normal.y = parseFloat(seg[2]);
                    normal.z = parseFloat(seg[3]);
                    normals.push(normal);
                }
                else {
                    var ve = new Vec3();
                    var seg = line.split(" ");
                    ve.x = parseFloat(seg[1]);
                    ve.y = parseFloat(seg[2]);
                    ve.z = parseFloat(seg[3]);
                    verts.push(ve);
                }
            }
            if (line[0] == 'f') {
                var params = 1;
                if (hasNormals)
                    params++;
                if (hasTexture)
                    params++;
                var vals = [];
                var seg = line.replace("f", "").split(/[\/\s]+/g);
                for (var l = 1; l < seg.length; l++)
                    vals.push(parseInt(seg[l]));
                var push = new Tri();
                for (var k = 0; k < 3; k++) {
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
    addTriangle(triangle) {
        var tangent = Mesh.calcTangents(triangle); // Calculate tangent and bittangent
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
    createTextureFromPath(path, texSlot = gl.TEXTURE0, useRefCache, wrap = [gl.REPEAT, gl.REPEAT], minFilter = gl.LINEAR_MIPMAP_LINEAR, magFilter = gl.LINEAR) {
        if (useRefCache && Object.keys(loadedReferenceTextures).includes(path)) {
            return loadedReferenceTextures[path];
        }
        var tex = gl.NONE;
        tex = gl.createTexture();
        gl.activeTexture(texSlot);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([1, 1, 1, 255]));
        if (path != "NONE") {
            var image;
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
            }
            else {
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
                });
            }
            ;
        }
        if (!Object.keys(loadedReferenceTextures).includes(path))
            return (loadedReferenceTextures[path] = tex);
        return tex;
    }
    setTexture(diffusePath, specularPath = "NONE", normalPath = "NONE", parallaxPath = "NONE") {
        this.material.diffuseTexture = this.createTextureFromPath(diffusePath, gl.TEXTURE0, this.useTextureReferenceCache);
        this.material.specularTexture = this.createTextureFromPath(specularPath, gl.TEXTURE1, this.useTextureReferenceCache);
        this.material.normalTexture = this.createTextureFromPath(normalPath, gl.TEXTURE2, this.useTextureReferenceCache);
        this.material.parallaxTexture = this.createTextureFromPath(specularPath, gl.TEXTURE3, this.useTextureReferenceCache);
        this.material.hasNormalTexture = normalPath != "NONE";
        this.material.hasParallaxTexture = parallaxPath != "NONE";
    }
    modelMatrix() {
        var matRot = Mat4.rotationOnPoint(this.rotation.x, this.rotation.y, this.rotation.z, this.rotationCenter);
        var matTrans = Mat4.translation(this.position.x, this.position.y, this.position.z);
        var matScale = Mat4.scale(this.scale.x, this.scale.y, this.scale.z);
        var matWorld = Mat4.mul(Mat4.mul(matScale, matRot), matTrans);
        return matWorld;
    }
    load(drawType = gl.DYNAMIC_DRAW) {
        if (!this.loaded) {
            this.mVBO = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.mVBO);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.data), drawType);
            this.mVAO = gl.createVertexArray();
            gl.bindVertexArray(this.mVAO);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.mVBO);
            var size = Vert.tSize;
            var floatSize = 4;
            var stride = size * floatSize; // Num of array elements resulting from a Vert
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
    static calcTangents(triangle) {
        var edge1 = Vec3.sub(triangle.v[1].p, triangle.v[0].p);
        var edge2 = Vec3.sub(triangle.v[2].p, triangle.v[0].p);
        var dUV1 = Vec2.sub(triangle.v[1].t, triangle.v[0].t);
        var dUV2 = Vec2.sub(triangle.v[2].t, triangle.v[0].t);
        var f = 1.0 / (dUV1.x * dUV2.y - dUV2.x * dUV1.y);
        var tan = new Vec3();
        tan.x = f * (dUV2.y * edge1.x - dUV1.y * edge2.x);
        tan.y = f * (dUV2.y * edge1.y - dUV1.y * edge2.y);
        tan.z = f * (dUV2.y * edge1.z - dUV1.y * edge2.z);
        var bitTan = new Vec3();
        bitTan.x = f * (-dUV2.x * edge1.x + dUV1.x * edge2.x);
        bitTan.y = f * (-dUV2.x * edge1.y + dUV1.x * edge2.y);
        bitTan.z = f * (-dUV2.x * edge1.z + dUV1.x * edge2.z);
        return [tan, bitTan];
    }
    static renderAll(shader, camera, meshes, dirLight, pointLights = []) {
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
        for (var j = 0; j < pointLights.length; j++) {
            shader.setUVec3("pointLights[" + j + "].position", pointLights[j].position);
            shader.setUVec3("pointLights[" + j + "].ambient", pointLights[j].ambient);
            shader.setUVec3("pointLights[" + j + "].diffuse", Vec3.mulFloat(pointLights[j].diffuse, pointLights[j].intensity));
            shader.setUVec3("pointLights[" + j + "].specular", Vec3.mulFloat(pointLights[j].specular, pointLights[j].intensity));
            shader.setUFloat("pointLights[" + j + "].constant", pointLights[j].constant);
            shader.setUFloat("pointLights[" + j + "].linear)", pointLights[j].linear);
            shader.setUFloat("pointLights[" + j + "].quadratic", pointLights[j].quadratic);
        }
        for (var i = 0; i < meshes.length; i++) {
            gl.bindVertexArray(meshes[i].mVAO);
            var model = meshes[i].modelMatrix();
            shader.setUMat4("model", model);
            shader.setUBool("hasNormalTexture", meshes[i].material.hasNormalTexture);
            shader.setUBool("hasParallaxTexture", meshes[i].material.hasParallaxTexture);
            shader.setUMat4("invModel", Mat4.inverse(model));
            shader.setUFloat("material.shininess", meshes[i].material.shininess);
            shader.setUFloat("heightScale", meshes[i].material.parallaxScale);
            shader.setUVec4("meshTint", meshes[i].tint);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, meshes[i].material.diffuseTexture);
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, meshes[i].material.specularTexture);
            gl.activeTexture(gl.TEXTURE2);
            gl.bindTexture(gl.TEXTURE_2D, meshes[i].material.normalTexture);
            var verts = meshes[i].triangles * 3;
            gl.drawArrays(gl.TRIANGLES, 0, verts);
        }
    }
}
export class PointLight {
    constructor(ambient = new Vec3(0.05, 0.05, 0.05), diffuse = new Vec3(0.8, 0.8, 0.8), specular = new Vec3(0.2, 0.2, 0.2), position = new Vec3(), intensity = 1) {
        this.constant = 1;
        this.linear = 0.09;
        this.quadratic = 0.032;
        this.ambient = ambient;
        this.diffuse = diffuse;
        this.specular = specular;
        this.position = position;
        this.intensity = intensity;
    }
}
export class DirectionalLight {
    constructor(ambient = new Vec3(0.05, 0.05, 0.05), diffuse = new Vec3(0.8, 0.8, 0.8), specular = new Vec3(0.2, 0.2, 0.2), direction = new Vec3(0, -1, 0.2), intensity = 1) {
        this.intensity = 1;
        this.ambient = ambient;
        this.diffuse = diffuse;
        this.specular = specular;
        this.direction = direction;
        this.intensity = intensity;
    }
}
//# sourceMappingURL=3D.js.map