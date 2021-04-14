"use strict";

import * as IW from "./Ingenium.js";


class GBody extends IW.Mesh {
    static locked: number = 0;
    constructor(pos: IW.Vec3 = new IW.Vec3()) {
        super(pos);
        this.useGeometryReferenceCache = true;
    }
    makeTwoTex(o: string, d: string, dd: string, s: string, n: string) {
        this.make(o, d, s, n);
        this.dTexture = this.createTextureFromPath(dd, IW.gl.TEXTURE4, true);
    }
    bindDTexture (sh: IW.Shader) {
        sh.use();
        sh.setUInt("material.darkDiffuse", 4);
        IW.gl.activeTexture(IW.gl.TEXTURE4);
        IW.gl.bindTexture(IW.gl.TEXTURE_2D, this.dTexture);
    }

    velocity: IW.Vec3 = new IW.Vec3();
    angularVelocity: IW.Vec3 = new IW.Vec3();
    mass: number = 1;
    radius: number = 1;
    name: string = "NONE";
    dTexture : WebGLTexture = IW.gl.NONE;
}

class ISCamera extends IW.Camera {
    constructor(fov: number, cn: number, cf: number) {
        super(fov, cn, cf);
    }

    refPos: IW.Position3D = new IW.Position3D();

    setToLockedGBody() {
        this.refPos.position = this.refPos.position.normalized().mul(m[GBody.locked].scale.mulFloat(2));
    }
}

var shader: IW.Shader;
var earthShader: IW.Shader;
var camera: ISCamera = new ISCamera(70, 0.05, 2000);
var d: IW.DirectionalLight = new IW.DirectionalLight();
var p: IW.PointLight[] = [new IW.PointLight(new IW.Vec3(0.01, 0.01, 0.01),
    new IW.Vec3(1, 1, 1), new IW.Vec3(1, 1, 1), new IW.Vec3(0, 0, -3))];
var m: GBody[] = [];

var simSpeed: number = 3600;//3600 * 24; // 1 day
var meterScale: number = 1000; // 1 km

function perpVelocity(sunObj: GBody, gby: GBody, randomPos: IW.Vec3): IW.Vec3 {
    var diff: IW.Vec3 = sunObj.position.sub(gby.position);
    if (diff.equals(new IW.Vec3()))
        return new IW.Vec3();
    var rand: IW.Vec3 = new IW.Vec3(Math.random() * randomPos.x, Math.random() * randomPos.y, Math.random() * randomPos.z);
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
    new IW.ShaderSource({ version: "#version 300 es", precision: "precision highp float;" }, IW.ShaderSourceTypes.vert,
        "defVert", IW.Utils.loadFile("./shaders/3D/vert3d.vs"));
    new IW.ShaderSource({ version: "#version 300 es", precision: "precision mediump float;", nlights: 0 }, IW.ShaderSourceTypes.frag,
        "defFrag", IW.Utils.loadFile("./shaders/3D/blinnphong.fs"));
    new IW.ShaderSource({ version: "#version 300 es", precision: "precision mediump float;", nlights: 0 }, IW.ShaderSourceTypes.frag,
        "earthFrag", IW.Utils.loadFile("./shaders/Earth.fs"));
    IW.IngeniumWeb.createWindow(16, 9, "Gravity Demo");
    shader = new IW.Shader(IW.ShaderSource.shaderWithParams("defVert"),
        IW.ShaderSource.shaderWithParams("defFrag", { nlights: 1 }));

    earthShader = new IW.Shader(IW.ShaderSource.shaderWithParams("defVert"),
        IW.ShaderSource.shaderWithParams("earthFrag", { nlights: 1 }));

    IW.IngeniumWeb.window.setClearColour(0x101010, 1);

    IW.Time.setFPS(25);
    IW.Time.setFixedFPS(5);

    d.intensity = 0;
    p[0].intensity = 2;
    p[0].constant = 0.3;
    p[0].linear = 0;
    p[0].quadratic = 0.00002;
    p[0].diffuse = new IW.Vec3(1, 1, 0.7);
    p[0].specular = p[0].diffuse;
    p[0].ambient = IW.Vec3.filledWith(0);

    var objPath: string = "./resource/uvsmoothnt.obj";

    var sun: GBody = new GBody();
    sun.scale = IW.Vec3.filledWith(10);
    sun.mass = 1.989e30; // kg
    sun.radius = 696340; // km
    sun.rotation = new IW.Vec3(0, 0, IW.Rotation.degToRad(7.25));
    sun.angularVelocity = new IW.Vec3(0, IW.Rotation.degToRad(0.0042881942));
    sun.tint = IW.Vec3.filledWith(7);
    sun.name = "Sun";
    sun.make(objPath, "./resource/sun/b.jpg", "NONE", "./resource/sun/n.jpg");
    m.push(sun);

    var earth: GBody = new GBody();
    earth.radius = 6371; // km
    earth.scale = sun.scale.mulFloat(earth.radius / sun.radius);
    earth.position = new IW.Vec3(sun.position.x - 700);
    earth.velocity = perpVelocity(sun, earth, new IW.Vec3(1, 1, 1));
    earth.angularVelocity = new IW.Vec3(0, IW.Rotation.degToRad(0.004166666));
    earth.name = "Earth";
    earth.material.shininess = 0.9;
    earth.makeTwoTex(objPath, "./resource/earth/b.jpg", "./resource/earth/db.jpg", "./resource/earth/s.png", "./resource/earth/n.png");
    m.push(earth);

    camera.position = sun.position.add(new IW.Vec3(0, 0, -100));
}
function onUpdate() {
    if (IW.Input.getKeyState('1')) {
        GBody.locked = 1;
        camera.setToLockedGBody();
    }
    if (IW.Input.getKeyState('0')) {
        GBody.locked = 0;
        camera.setToLockedGBody();
    }
    for (var i: number = 0; i < m.length; i++) {
        var force: IW.Vec3 = new IW.Vec3();
        for (var j: number = 0; j < m.length; j++) {
            if (i == j) continue;
            var diff: IW.Vec3 = m[i].position.sub(m[j].position);
            var dist: number = IW.Vec3.len(diff) * meterScale;
            if (dist < m[i].radius + m[j].radius) continue;
            var fg = (6.67e-11 * m[i].mass * m[j].mass) / (dist * dist);
            var forceDir = IW.Vec3.normalize(diff).mulFloat(fg);
            force = force.add(forceDir);
        }
        var acceleration = force.mulFloat(1 / m[i].mass);
        m[i].velocity = m[i].velocity.sub(acceleration.mulFloat(IW.Time.deltaTime * simSpeed));
        m[i].position = m[i].position.add(m[i].velocity);
        m[i].rotation = m[i].rotation.add(m[i].angularVelocity.mulFloat(IW.Time.deltaTime * simSpeed));
    }
    camera.refPos = IW.Camera.stdController(camera, camera.refPos, 1, IW.PI);
    camera.rotation = camera.refPos.rotation;
    camera.position = m[GBody.locked].position.add(camera.refPos.position);
    p[0].position = m[0].position;
    IW.Mesh.renderAll(shader, camera, [m[0]], d, p);
    m[1].bindDTexture(earthShader);
    IW.Mesh.renderAll(earthShader, camera, [m[1]], d, p);
}

var scene: IW.Scene = new IW.Scene(function () { }, onUpdate);
IW.IngeniumWeb.start([scene], onGlobalCreate);