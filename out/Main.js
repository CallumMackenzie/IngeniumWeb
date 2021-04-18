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
let camera = new ISCamera(70, 0.05, 2000);
let d = new IW.DirectionalLight();
let p = [new IW.PointLight(new IW.Vec3(0.01, 0.01, 0.01), new IW.Vec3(1, 1, 1), new IW.Vec3(1, 1, 1), new IW.Vec3(0, 0, -3))];
let m = [];
let l = [];
let simSpeed = 3600; //3600 * 24; // 1 day
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
    new IW.ShaderSource({ version: "#version 300 es", precision: "precision highp float;" }, IW.ShaderSourceTypes.vert, "defVert", IW.Utils.loadFile("./shaders/3D/vert3d.vs"));
    new IW.ShaderSource({ version: "#version 300 es", precision: "precision mediump float;", nlights: 0 }, IW.ShaderSourceTypes.frag, "defFrag", IW.Utils.loadFile("./shaders/3D/blinnphong.fs"));
    new IW.ShaderSource({ version: "#version 300 es", precision: "precision mediump float;", nlights: 0 }, IW.ShaderSourceTypes.frag, "emission", IW.Utils.loadFile("./shaders/3D/emissive.fs"));
    IW.IngeniumWeb.createWindow(16, 9, "Gravity Demo");
    shader = new IW.Shader(IW.ShaderSource.shaderWithParams("defVert"), IW.ShaderSource.shaderWithParams("defFrag", { nlights: 1 }));
    emissionShader = new IW.Shader(IW.ShaderSource.shaderWithParams("defVert"), IW.ShaderSource.shaderWithParams("emission", {}));
    IW.IngeniumWeb.window.setClearColour(0x101010, 1);
    IW.Time.setFPS(40);
    IW.Time.setFixedFPS(5);
    d.intensity = 0;
    let objPath = "./resource/uvsmoothnt.obj";
    let rpos = new IW.Vec3(10, 10, 10);
    for (let i = 0; i < 1; i++) {
        let rn = function () { return Math.random(); };
        let gb = new GBody(new IW.Vec3(rn() * rpos.x, rn() * rpos.y, rn() * rpos.z));
        gb.mass = 10000;
        gb.scale = IW.Vec3.filledWith(0.25);
        gb.radius = gb.scale.x;
        gb.tint = new IW.Vec3(1.2, 0.3, 0.3);
        gb.angularVelocity = new IW.Vec3(1, 0, 0);
        gb.make(objPath, "./resource/paper/b.jpg");
        p[i].intensity = 0.7;
        p[i].constant = 0.3;
        p[i].linear = 0;
        p[i].quadratic = 0.00002;
        p[i].diffuse = new IW.Vec3(1, 1, 0.7);
        p[i].specular = p[0].diffuse;
        p[i].ambient = IW.Vec3.filledWith(0);
        l.push(gb);
    }
    for (let i = 0; i < 10; i++) {
        let rn = function () { return Math.random(); };
        let gb = new GBody(new IW.Vec3(rn() * rpos.x, rn() * rpos.y, rn() * rpos.z));
        gb.mass = 10000;
        gb.scale = IW.Vec3.filledWith(0.25);
        gb.radius = gb.scale.x;
        gb.angularVelocity = new IW.Vec3(1, 0, 0);
        gb.make(objPath, "./resource/paper/b.jpg", "NONE", "./resource/paper/n.jpg");
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