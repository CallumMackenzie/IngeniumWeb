"use strict";
import { ShaderSource } from "./shaders.js";
import { Time, IngeniumWeb, Shader, Input, Scene } from "./WebGL.js";
import { Vec3, Mesh, Camera, DirectionalLight, PointLight } from "./3D.js";
var shader;
var camera = new Camera(70);
var d = new DirectionalLight();
var p = [new PointLight(new Vec3(0.01, 0.01, 0.01), new Vec3(1, 1, 1), new Vec3(1, 1, 1), new Vec3(0, 0, -3))];
var m = [];
function onGlobalCreate() {
    Time.setFPS(25);
    IngeniumWeb.createWindow(16, 9, "My App");
    IngeniumWeb.window.setClearColour(0x303030, 1);
    shader = new Shader(ShaderSource.shaderWithParams("vert3d"), ShaderSource.shaderWithParams("phong", { nLights: 1 }));
    d.intensity = 0;
    p[0].intensity = 1;
    var objPath = "./resource/suzanne.obj";
    m.push(new Mesh(new Vec3(-1.5, 0, 3)));
    m[0].material.shininess = 0.4;
    m[0].material.parallaxScale = 1;
    m[0].make(objPath, "./resource/sbrick/b.jpg", "NONE", "./resource/sbrick/n.jpg", "./resource/sbrick/h.png");
    m.push(new Mesh(new Vec3(1.5, 0, 3)));
    m[1].material.shininess = 0.1;
    m[1].make(objPath, "./resource/metal/b.jpg", "./resource/metal/s.jpg", "./resource/metal/n.jpg");
    m.push(new Mesh(new Vec3(-4.5, 0, 3)));
    m[2].material.shininess = 0.2;
    m[2].make(objPath, "./resource/paper/b.jpg", "NONE", "./resource/paper/n.jpg");
    m.push(new Mesh(new Vec3(4.5, 0, 3)));
    m[3].material.shininess = 50;
    m[3].make(objPath, "./resource/scrmetal/b.jpg", "./resource/scrmetal/s.jpg", "./resource/scrmetal/n.jpg");
    m.push(new Mesh(new Vec3(-1.5, 3, 3)));
    m[4].material.shininess = 1;
    m[4].make(objPath, "./resource/gate/b.jpg", "./resource/gate/s.jpg", "./resource/gate/n.jpg");
    m.push(new Mesh(new Vec3(1.5, 3, 3)));
    m[5].material.shininess = 0.6;
    m[5].make(objPath, "./resource/mtrim/b.jpg", "./resource/mtrim/s.jpg", "./resource/mtrim/n.jpg");
    m.push(new Mesh(new Vec3(4.5, 3, 3)));
    m[6].material.shininess = 10;
    m[6].make(objPath, "./resource/woodp/b.jpg", "NONE", "./resource/woodp/n.jpg");
    m.push(new Mesh(new Vec3(-4.5, 3, 3)));
    m[7].material.shininess = 0.4;
    m[7].make(objPath, "./resource/mplate/b.jpg", "./resource/mplate/s.jpg", "./resource/mplate/n.jpg");
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
        m[i].rotation = Vec3.add(m[i].rotation, Vec3.mulFloat(new Vec3(0.01, 0.015, 0.01), Time.deltaTime * 0.07));
    }
    Mesh.renderAll(shader, camera, m, d, p);
}
var scene = new Scene(function () { }, onUpdate);
IngeniumWeb.start([scene], onGlobalCreate);
//# sourceMappingURL=Main.js.map
