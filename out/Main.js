"use strict";
import { ShaderSource, ShaderSourceTypes } from "./Shaders.js";
import { Time, IngeniumWeb, Shader, Input, Scene } from "./WebGL.js";
import { Mesh, Camera, DirectionalLight, PointLight } from "./3D.js";
import { loadFile } from "./Utils.js";
import { Vec3 } from "./Math.js";
class GBody extends Mesh {
    constructor(pos) {
        super(pos);
        this.velocity = new Vec3();
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
var meterScale = 1;
function onGlobalCreate() {
    new ShaderSource({ version: "#version 300 es", precision: "precision highp float;" }, ShaderSourceTypes.vert, "vtp", loadFile("./shaders/3D/vert3d.vs"));
    new ShaderSource({ version: "#version 300 es", precision: "precision mediump float;", nlights: 0 }, ShaderSourceTypes.frag, "bfp", loadFile("./shaders/3D/blinnphong.fs"));
    Time.setFPS(25);
    IngeniumWeb.createWindow(16, 9, "My App");
    IngeniumWeb.window.setClearColour(0x303030, 1);
    shader = new Shader(ShaderSource.shaderWithParams("vtp"), ShaderSource.shaderWithParams("bfp", { nlights: 1 }));
    d.intensity = 0;
    p[0].intensity = 10;
    var objPath = "./resource/uvsmoothnt.obj";
    var scale = 0.5;
    var randomVS = 0.01;
    var randomPos = new Vec3(10, 10, 10);
    for (var i = 0; i < 20; i++) {
        var gby = new GBody(new Vec3(Math.random() * randomPos.x, Math.random() * randomPos.y, Math.random() * randomPos.z));
        m.push(gby);
        m[i].useGeometryReferenceCache = true;
        var col = i / 40 + 0.5;
        m[i].tint = new Vec3(col, col, col);
        m[i].make(objPath, "./resource/paper/b.jpg", "NONE", "./resource/paper/n.jpg");
        m[i].scale = new Vec3(scale, scale, scale);
        m[i].velocity = new Vec3(Math.random() * randomVS, Math.random() * randomVS, Math.random() * randomVS);
        m[i].mass = 1.0e4;
    }
}
function onUpdate() {
    camera.stdControl();
    var mv = new Vec3();
    var int = 0;
    if (Input.getKeyState('i'))
        mv = mv.add(new Vec3(0, 0, 0.1));
    if (Input.getKeyState('k'))
        mv = mv.sub(new Vec3(0, 0, 0.1));
    if (Input.getKeyState('j'))
        mv = mv.add(new Vec3(0.1, 0, 0));
    if (Input.getKeyState('l'))
        mv = mv.sub(new Vec3(0.1, 0, 0));
    if (Input.getKeyState('u'))
        mv = mv.add(new Vec3(0, 0.1, 0));
    if (Input.getKeyState('o'))
        mv = mv.sub(new Vec3(0, 0.1, 0));
    if (Input.getKeyState('='))
        int += 0.01;
    if (Input.getKeyState('-'))
        int -= 0.01;
    p[0].position = p[0].position.add(mv.mulFloat(Time.deltaTime * 0.5));
    p[0].intensity += int * Time.deltaTime * 0.5;
    for (var i = 0; i < m.length; i++) {
        // m[i].rotation = Vec3.add(m[i].rotation, Vec3.mulFloat(new Vec3(0.01, 0.015, 0.01), Time.deltaTime * 0.07));
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
        m[i].velocity = m[i].velocity.sub(acceleration.mulFloat(Time.deltaTime));
        m[i].position = m[i].position.add(m[i].velocity);
    }
    Mesh.renderAll(shader, camera, m, d, p);
}
var scene = new Scene(function () { }, onUpdate);
IngeniumWeb.start([scene], onGlobalCreate);
//# sourceMappingURL=Main.js.map