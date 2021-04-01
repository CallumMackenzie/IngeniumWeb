"use strict";
import { vertShader3D, fragShader3D } from "./shaders.js";
import { Time, IngeniumWeb, Shader } from "./WebGL.js";
import { Mesh } from "./3D.js";
function onCreate() {
    console.log("Init");
    Time.setFPS(45);
    Time.setFixedFPS(20);
    IngeniumWeb.createWindow(400, 300, "root", "Ingenium");
    IngeniumWeb.window.setGL();
    var shader = new Shader(vertShader3D, fragShader3D);
    shader.use();
    var m = new Mesh();
    m.loadFromObj("./resource/cubenormaltex.obj");
    m.setTexture("./resource/Cube Map.png");
    m.load();
}
function onUpdate() {
}
function onFixedUpdate() {
}
function onClose() {
}
IngeniumWeb.start(onCreate, onUpdate, onClose, onFixedUpdate);
//# sourceMappingURL=Main.js.map