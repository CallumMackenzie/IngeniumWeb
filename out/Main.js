"use strict";
import { ShaderSource, ShaderSourceTypes } from "./Shaders.js";
import { Time, IngeniumWeb, Shader, Scene } from "./WebGL.js";
import { Mesh, Camera, DirectionalLight, PointLight } from "./3D.js";
import { loadFile } from "./Utils.js";
import { Vec3 } from "./Math.js";
class GBody extends Mesh {
    constructor(pos = new Vec3()) {
        super(pos);
        this.velocity = new Vec3();
        this.angularVelocity = new Vec3();
        this.mass = 1;
        this.radius = 0.5;
        this.elasticity = 1;
    }
}
var shader;
var camera = new Camera(70, 0.1, 1000);
var d = new DirectionalLight();
var p = [new PointLight(new Vec3(0.01, 0.01, 0.01), new Vec3(1, 1, 1), new Vec3(1, 1, 1), new Vec3(0, 0, -3))];
var m = [];
var simSpeed = 0.1;
var meterScale = 9e11;
function onGlobalCreate() {
    new ShaderSource({ version: "#version 300 es", precision: "precision highp float;" }, ShaderSourceTypes.vert, "vtp", loadFile("./shaders/3D/vert3d.vs"));
    new ShaderSource({ version: "#version 300 es", precision: "precision mediump float;", nlights: 0 }, ShaderSourceTypes.frag, "bfp", loadFile("./shaders/3D/blinnphong.fs"));
    Time.setFPS(60);
    IngeniumWeb.createWindow(16, 9, "My App");
    IngeniumWeb.window.setClearColour(0x050505, 1);
    shader = new Shader(ShaderSource.shaderWithParams("vtp"), ShaderSource.shaderWithParams("bfp", { nlights: 0 }));
    d.intensity = 1;
    p[0].intensity = 8;
    var objPath = "./resource/uvsmoothnt.obj";
    var scale = 0.1;
    var randomPos = new Vec3(10, 10, 10);
    var randomAVS = 0.01;
    camera.position = new Vec3(randomPos.x * 0.5, randomPos.y * 0.5, -1);
    var rRot = 6.28319;
    var sun = new GBody(new Vec3(0, 0, 1));
    sun.scale = new Vec3(0.5, 0.5, 0.5);
    sun.mass = 1.989e30;
    sun.useGeometryReferenceCache = true;
    sun.position = randomPos.mulFloat(0.5);
    sun.rotation = new Vec3(Math.random() * rRot, Math.random() * rRot, Math.random() * rRot);
    sun.angularVelocity = new Vec3(Math.random() * randomAVS);
    sun.make(objPath, "./resource/sun/b.jpg", "NONE", "./resource/sun/n.jpg");
    m.push(sun);
    for (var i = 0; i < 20; i++) {
        var gby = new GBody(new Vec3(Math.random() * randomPos.x, Math.random() * randomPos.y, Math.random() * randomPos.z));
        gby.useGeometryReferenceCache = true;
        gby.make(objPath, "./resource/paper/b.jpg", "NONE", "./resource/paper/n.jpg");
        var axes = 0;
        var randAVS = function () {
            return (axes < 1 ? Math.random() * randomAVS + (++axes - axes) : 0);
        };
        var randVel = function () {
            var diff = sun.position.sub(gby.position);
            var rand = new Vec3(Math.random() * randomPos.x, Math.random() * randomPos.y, Math.random() * randomPos.z);
            var vecIndex = Math.floor(Math.random() * 3);
            if (vecIndex == 0)
                rand.x = (-diff.y * rand.y - diff.z * rand.z) / diff.x;
            else if (vecIndex == 1)
                rand.y = (-diff.x * rand.x - diff.z * rand.z) / diff.y;
            else if (vecIndex == 2)
                rand.z = (-diff.x * rand.x - diff.y * rand.y) / diff.z;
            console.log(Vec3.dot(rand, diff));
            rand = Vec3.normalize(rand).mulFloat(0.01);
            return rand;
        };
        gby.angularVelocity = new Vec3(randAVS(), randAVS(), randAVS());
        var col = i / 40 + 0.5;
        gby.tint = new Vec3(col, col, col);
        gby.rotation = new Vec3(Math.random() * rRot, Math.random() * rRot, Math.random() * rRot);
        gby.scale = new Vec3(scale, scale, scale);
        gby.velocity = randVel();
        gby.mass = 1.0e4;
        m.push(gby);
    }
}
function onUpdate() {
    camera.stdControl();
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