"use strict";
import { ShaderSource } from "./shaders.js";
import { Time, IngeniumWeb, Shader, Input, Scene } from "./WebGL.js";
import { Vec3, Mesh, Camera, DirectionalLight } from "./3D.js";
var shader;
var camera = new Camera(70);
var d = new DirectionalLight();
var m;
var lastTransition = Date.now();
function onGlobalCreate() {
    Time.setFPS(45);
    IngeniumWeb.createWindow(16, 9, "My App");
    IngeniumWeb.window.setClearColour(0xffa500, 1);
    shader = new Shader(ShaderSource.defVert(), ShaderSource.defFrag());
    m = new Mesh(new Vec3(0, 0, 3));
    m.make("./resource/cubenormaltex.obj", "./resource/brick.png", "./resource/brick.png");
}
function onUpdate() {
    camera.stdControl();
    m.rotation = Vec3.add(m.rotation, Vec3.mulFloat(new Vec3(0.01, 0.01, 0.01), Time.deltaTime * 0.07));
    Mesh.renderAll(shader, camera, [m], d);
    if (Input.getKeyState("r") && Date.now() - lastTransition > 1000) {
        lastTransition = Date.now();
        IngeniumWeb.enterScene(IngeniumWeb.currentScene == 0 ? 1 : 0);
    }
}
var s = new Scene(function () {
    IngeniumWeb.window.setClearColour(0xffa500, 1);
}, onUpdate);
var s2 = new Scene(function () {
    IngeniumWeb.window.setClearColour(0x000000, 1);
}, onUpdate);
IngeniumWeb.start([s, s2], onGlobalCreate);
//# sourceMappingURL=Main.js.map