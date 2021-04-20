"use strict";
import * as IW from "./Ingenium.js";
class GBody extends IW.Mesh3D {
    constructor(pos = new IW.Vec3()) {
        super(pos);
        this.velocity = new IW.Vec3();
        this.angularVelocity = new IW.Vec3();
        this.mass = 1;
        this.radius = 1;
        this.name = "NONE";
        this.useGeometryReferenceCache = true;
    }
}
GBody.locked = 0;
class ISCamera extends IW.Camera3D {
    constructor(fov, cn, cf) {
        super(fov, cn, cf);
        this.refPos = new IW.Position3D();
    }
    setToLockedGBody() {
        this.refPos.position = this.refPos.position.normalized().mul(m[GBody.locked].scale.mulFloat(2));
    }
}
let shader;
let emissionShader;
let camera = new ISCamera(70, 0.01, 2000);
let d = new IW.DirectionalLight();
let p = [new IW.PointLight(new IW.Vec3(0.01, 0.01, 0.01), new IW.Vec3(1, 1, 1), new IW.Vec3(1, 1, 1), new IW.Vec3(0, 0, -3))];
let m = [];
let l = [];
let simSpeed = 1; //3600 * 24; // 1 day
let meterScale = 1; // 1 km
function perpVelocity(sunObj, gby, randomPos) {
    let diff = sunObj.position.sub(gby.position);
    if (diff.equals(new IW.Vec3()))
        return new IW.Vec3();
    let rand = new IW.Vec3(Math.random() * randomPos.x, Math.random() * randomPos.y, Math.random() * randomPos.z);
    if (diff.x != 0)
        rand.x = (-diff.y * rand.y - diff.z * rand.z) / diff.x;
    else if (diff.y != 0)
        rand.y = (-diff.x * rand.x - diff.z * rand.z) / diff.y;
    else if (diff.z != 0)
        rand.z = (-diff.x * rand.x - diff.y * rand.y) / diff.z;
    rand = IW.Vec3.normalize(rand).mulFloat(0.01);
    return rand;
}
function onGlobalCreate() {
    let gParams = {
        version: "300 es",
        normalMap: 1,
        parallaxMap: 0
    };
    IW.ShaderSource.makeFromFile(Object.assign(gParams, {
        precision: "highp",
        vertexRGB: 0
    }), IW.ShaderSource.types.vert, "defVert", "./shaders/3D/asn.vs");
    IW.ShaderSource.makeFromFile(Object.assign(gParams, {
        precision: "mediump",
        maxPointLights: 1,
        lightModel: "NONE",
        parallaxClipEdge: 0,
        parallaxInvert: 1
    }), IW.ShaderSource.types.frag, "defFrag", "./shaders/3D/asn.fs");
    IW.ShaderSource.makeFromFile({
        version: "300 es",
        normalMap: 1,
        parallaxMap: 0,
        precision: "mediump",
        maxPointLights: 0,
        lightModel: "NONE",
        parallaxClipEdge: 0,
        parallaxInvert: 1
    }, IW.ShaderSource.types.frag, "emission", "./shaders/3D/asn.fs");
    IW.IngeniumWeb.createWindow(16, 9, "Gravity Demo");
    shader = new IW.Shader(IW.ShaderSource.shaderWithParams("defVert"), IW.ShaderSource.shaderWithParams("defFrag", {}));
    emissionShader = new IW.Shader(IW.ShaderSource.shaderWithParams("defVert"), IW.ShaderSource.shaderWithParams("emission", {}));
    IW.IngeniumWeb.window.setClearColour(0x303030, 1);
    IW.gl.enable(IW.gl.CULL_FACE);
    IW.gl.cullFace(IW.gl.BACK);
    IW.Time.setFPS(40);
    IW.Time.setFixedFPS(5);
    d.intensity = 0.6;
    d.diffuse = IW.Vec3.filledWith(1);
    d.specular = IW.Vec3.filledWith(0.8);
    d.direction = new IW.Vec3(-0.4, -1, 0);
    d.ambient = IW.Vec3.filledWith(0.2);
    let objPath = "./resource/cubent.obj";
    let rpos = new IW.Vec3(2, 2, 2);
    for (let i = 0; i < 0; i++) {
        let rn = function () { return Math.random(); };
        let gb = new GBody(new IW.Vec3(rn() * rpos.x, rn() * rpos.y, rn() * rpos.z));
        gb.mass = 10000;
        gb.scale = IW.Vec3.filledWith(1);
        gb.radius = gb.scale.x;
        gb.tint = new IW.Vec3(1.2, 0.3, 0.3);
        gb.angularVelocity = new IW.Vec3(1, 0, 0);
        gb.make(objPath, "./resource/moon/b.jpg", "./resource/moon/s.jpg", "./resource/moon/n.jpg", "./resource/moon/h.png");
        p[i].intensity = 0.1;
        p[i].constant = 0.3;
        p[i].linear = 0;
        p[i].quadratic = 0.00002;
        p[i].diffuse = new IW.Vec3(1, 1, 0.7);
        p[i].specular = p[0].diffuse;
        p[i].ambient = IW.Vec3.filledWith(0);
        l.push(gb);
    }
    for (let i = 0; i < 4; i++) {
        let rn = function () { return Math.random(); };
        let gb = new GBody(new IW.Vec3(rn() * rpos.x, rn() * rpos.y, rn() * rpos.z));
        gb.mass = 10000;
        gb.scale = IW.Vec3.filledWith(0.25);
        gb.radius = gb.scale.x;
        gb.tint = new IW.Vec3(1, 1, 1, (i + 1) / 10);
        // gb.angularVelocity = new IW.Vec3(1, 1, 1);
        gb.material.parallaxScale = 0.1;
        gb.material.shininess = 2;
        gb.material.UVScale = IW.Vec2.filledWith(1);
        gb.position = new IW.Vec3(0, 0, i);
        gb.make(objPath, "./resource/sbrick/b.jpg", "./resource/sbrick/s.jpg", "./resource/sbrick/n.jpg", "./resource/sbrick/h.png");
        m.push(gb);
    }
}
function onUpdate() {
    for (let i = 0; i < m.length; i++) {
        let force = new IW.Vec3();
        for (let j = 0; j < m.length; j++) {
            if (i == j)
                continue;
            let diff = m[i].position.sub(m[j].position);
            let dist = IW.Vec3.len(diff) * meterScale;
            if (dist < m[i].radius + m[j].radius)
                continue;
            let fg = (6.67e-11 * m[i].mass * m[j].mass) / (dist * dist);
            let forceDir = IW.Vec3.normalize(diff).mulFloat(fg);
            force = force.add(forceDir);
        }
        let acceleration = force.mulFloat(1 / m[i].mass);
        m[i].velocity = m[i].velocity.sub(acceleration.mulFloat(IW.Time.deltaTime * simSpeed));
        m[i].position = m[i].position.add(m[i].velocity);
        m[i].rotation = m[i].rotation.add(m[i].angularVelocity.mulFloat(IW.Time.deltaTime * simSpeed));
    }
    camera.refPos = IW.Camera3D.stdController(camera, camera.refPos, 1, IW.PI);
    camera.rotation = camera.refPos.rotation;
    camera.position = camera.refPos.position;
    for (let k = 0; k < l.length; k++) {
        p[k].position = l[k].position;
    }
    IW.Mesh3D.renderAll(shader, camera, m, d, p);
    IW.Mesh3D.renderAll(emissionShader, camera, l, d, p);
}
let scene = new IW.Scene(function () { }, onUpdate);
IW.IngeniumWeb.start([scene], onGlobalCreate);
//# sourceMappingURL=Main.js.map