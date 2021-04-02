"use strict";
import { ShaderSource } from "./shaders.js";
import { Time, IngeniumWeb, Shader, Scene } from "./WebGL.js";
import { Vec3, Mesh, Camera, DirectionalLight, PointLight } from "./3D.js";
var shader;
var camera = new Camera(70);
var d = new DirectionalLight();
var p = [new PointLight(new Vec3(0.01, 0.01, 0.01), new Vec3(0.0, 0.0, 0.0), new Vec3(0.2, 0.2, 0.2), new Vec3(0, 1, 2.5))];
var m = [];
function onGlobalCreate() {
    Time.setFPS(45);
    IngeniumWeb.createWindow(16, 9, "My App");
    IngeniumWeb.window.setClearColour(0x000000, 1);
    shader = new Shader(ShaderSource.defVert(), ShaderSource.shaderWithParams("phong", { nLights: 1 }));
    d.specular = new Vec3(0.5, 0, 0.4);
    d.diffuse = new Vec3();
    var objPath = "./resource/uvsmoothnt.obj";
    m.push(new Mesh(new Vec3(-1, 0, 3)));
    m[0].material.shininess = 0.01;
    m[0].make(objPath, "./resource/sbrick/basecolour.jpg", "./resource/sbrick/height.png", "./resource/sbrick/normal.jpg");
    m.push(new Mesh(new Vec3(1, 0, 3)));
    m[1].make(objPath, "./resource/metal/basecolour.jpg", "./resource/metal/specular.jpg", "./resource/metal/normal.jpg");
}
function onUpdate() {
    camera.stdControl();
    for (var i = 0; i < m.length; i++) {
        m[i].rotation = Vec3.add(m[i].rotation, Vec3.mulFloat(new Vec3(0.01, 0.015, 0.01), Time.deltaTime * 0.07));
    }
    Mesh.renderAll(shader, camera, m, d, p);
}
var scene = new Scene(function () { }, onUpdate);
IngeniumWeb.start([scene], onGlobalCreate);
//# sourceMappingURL=Main.js.map