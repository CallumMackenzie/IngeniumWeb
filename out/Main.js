"use strict";
import { ShaderSource } from "./Shaders.js";
import { Time, IngeniumWeb, Shader, Input, Scene } from "./WebGL.js";
import { Mesh, Camera, DirectionalLight, PointLight } from "./3D.js";
import { Vec3 } from "./Math.js";
var shader;
var camera = new Camera(70, 0.1, 1000);
var d = new DirectionalLight();
var p = [new PointLight(new Vec3(0.01, 0.01, 0.01), new Vec3(1, 1, 1), new Vec3(1, 1, 1), new Vec3(0, 0, -3))];
var m = [];
function onGlobalCreate() {
    Time.setFPS(25);
    IngeniumWeb.createWindow(16, 9, "My App");
    IngeniumWeb.window.setClearColour(0x303030, 1);
    shader = new Shader(ShaderSource.shaderWithParams("vert3dpf"), ShaderSource.shaderWithParams("blinnphongpf", { nLights: 1 }));
    d.intensity = 0.5;
    p[0].intensity = 1;
    var objPath = "./resource/icont.obj";
    for (var i = 0; i < 100; i++) {
        m.push(new Mesh(new Vec3(0, 0, i * 1.5 + 2)));
        m[i].useGeometryReferenceCache = true;
        m[i].tint = new Vec3(.4, .2, .7);
        m[i].make(objPath);
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
        var scale = 0.5;
        m[i].scale = new Vec3(scale, scale, scale);
        m[i].rotation = Vec3.add(m[i].rotation, Vec3.mulFloat(new Vec3(0.01, 0.015, 0.01), Time.deltaTime * 0.07));
    }
    Mesh.renderAll(shader, camera, m, d, p);
}
var scene = new Scene(function () { }, onUpdate);
IngeniumWeb.start([scene], onGlobalCreate);
//# sourceMappingURL=Main.js.map