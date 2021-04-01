"use strict";

import { vertShader3D, fragShader3D } from "./shaders.js";
import { Time, IngeniumWeb, Shader } from "./WebGL.js";
import { Tri, Vert, Vec2, Vec3, Mesh, Mat4, Material } from "./3D.js";

function onCreate () {
    console.log("Init");

    Time.setFPS(45);
    Time.setFixedFPS(20);
    IngeniumWeb.createWindow(400, 300, "root", "Ingenium");
    IngeniumWeb.window.setGL();
    var shader = new Shader(vertShader3D, fragShader3D);
    shader.use();

    var m : Mesh = new Mesh();
    m.loadFromObj("./resource/cubenormaltex.obj");
    m.setTexture("./resource/Cube Map.png");
    m.load();
}
function onUpdate () {

}
function onFixedUpdate () {

}
function onClose () {

}

IngeniumWeb.start(onCreate, onUpdate, onClose, onFixedUpdate);