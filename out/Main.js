"use strict";
import { ShaderSource, ShaderSourceTypes } from "./Shaders.js";
import { Time, IngeniumWeb, Shader, Input, Scene } from "./WebGL.js";
import { Mesh, Camera, DirectionalLight, PointLight } from "./3D.js";
import { loadFile } from "./Utils.js";
import { Vec3, degToRad, PI } from "./Math.js";
class GBody extends Mesh {
    constructor(pos = new Vec3()) {
        super(pos);
        this.velocity = new Vec3();
        this.angularVelocity = new Vec3();
        this.mass = 1;
        this.radius = 0.5;
        this.useGeometryReferenceCache = true;
    }
}
var shader;
var camera = new Camera(70, 0.3, 2000);
var d = new DirectionalLight();
var p = [new PointLight(new Vec3(0.01, 0.01, 0.01), new Vec3(1, 1, 1), new Vec3(1, 1, 1), new Vec3(0, 0, -3))];
var m = [];
var simSpeed = 3600 * 24; // 1 day
var meterScale = 1000; // 1 km
function perpVelocity(sunObj, gby, randomPos) {
    var diff = sunObj.position.sub(gby.position);
    var rand = new Vec3(Math.random() * randomPos.x, Math.random() * randomPos.y, Math.random() * randomPos.z);
    var vecIndex = Math.floor(Math.random() * 3);
    if (vecIndex == 0)
        rand.x = (-diff.y * rand.y - diff.z * rand.z) / diff.x;
    else if (vecIndex == 1)
        rand.y = (-diff.x * rand.x - diff.z * rand.z) / diff.y;
    else if (vecIndex == 2)
        rand.z = (-diff.x * rand.x - diff.y * rand.y) / diff.z;
    rand = Vec3.normalize(rand).mulFloat(0.01);
    return rand;
}
function onGlobalCreate() {
    new ShaderSource({ version: "#version 300 es", precision: "precision highp float;" }, ShaderSourceTypes.vert, "vtp", loadFile("./shaders/3D/vert3d.vs"));
    new ShaderSource({ version: "#version 300 es", precision: "precision mediump float;", nlights: 0 }, ShaderSourceTypes.frag, "bfp", loadFile("./shaders/3D/blinnphong.fs"));
    Time.setFPS(60);
    IngeniumWeb.createWindow(16, 9, "My App");
    IngeniumWeb.window.setClearColour(0x050505, 1);
    shader = new Shader(ShaderSource.shaderWithParams("vtp"), ShaderSource.shaderWithParams("bfp", { nlights: 1 }));
    d.intensity = 0;
    p[0].intensity = 1;
    p[0].ambient = Vec3.filledWith(0);
    var objPath = "./resource/uvsmoothnt.obj";
    var sun = new GBody(new Vec3(0, 0, 1));
    sun.scale = Vec3.filledWith(10);
    sun.mass = 1.989e30; // kg
    sun.radius = 696340; // km
    sun.rotation = new Vec3(0, 0, degToRad(7.25));
    sun.angularVelocity = new Vec3(0, PI / 4);
    sun.tint = Vec3.filledWith(7);
    sun.make(objPath, "./resource/sun/b.jpg", "NONE", "./resource/sun/n.jpg");
    m.push(sun);
    var earth = new GBody();
    earth.radius = 6371; // km
    earth.scale = sun.scale.mulFloat(earth.radius / sun.radius);
    earth.tint = new Vec3(0.1, 1, 1);
    earth.velocity = perpVelocity(sun, earth, new Vec3(1, 1, 1));
    earth.angularVelocity = new Vec3(0, 0.01 * Math.random());
    earth.position = new Vec3(200 - sun.position.x);
    earth.make(objPath, "./resource/metal/b.jpg", "./resource/metal/s.jpg", "./resource/metal/n.jpg");
    m.push(earth);
    camera.position = sun.position.add(new Vec3(0, 0, -200));
}
function onUpdate() {
    camera.stdControl();
    if (Input.getKeyState('1')) {
        camera.position = m[1].position.add(new Vec3(0, 0, -2));
        camera.rotation = new Vec3();
    }
    if (Input.getKeyState('0')) {
        camera.position = m[0].position.add(new Vec3(0, 0, -200));
        camera.rotation = new Vec3();
    }
    for (var i = 0; i < m.length; i++) {
        var force = new Vec3();
        for (var j = 0; j < m.length; j++) {
            if (i == j)
                continue;
            var diff = m[i].position.sub(m[j].position);
            var dist = Vec3.len(diff) * meterScale;
            if (dist < m[i].radius + m[j].radius)
                continue;
            var fg = (6.67e-11 * m[i].mass * m[j].mass) / (dist * dist);
            var forceDir = Vec3.normalize(diff).mulFloat(fg);
            force = force.add(forceDir);
        }
        var acceleration = force.mulFloat(1 / m[i].mass);
        m[i].velocity = m[i].velocity.sub(acceleration.mulFloat(Time.deltaTime * simSpeed));
        m[i].position = m[i].position.add(m[i].velocity);
        m[i].rotation = m[i].rotation.add(m[i].angularVelocity.mulFloat(Time.deltaTime * simSpeed));
    }
    p[0].position = m[0].position;
    Mesh.renderAll(shader, camera, m, d, p);
}
var scene = new Scene(function () { }, onUpdate);
IngeniumWeb.start([scene], onGlobalCreate);
//# sourceMappingURL=Main.js.map