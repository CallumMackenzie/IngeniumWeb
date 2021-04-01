"use strict";

import { vertShader3D, fragShader3D } from "./shaders.js";
import { Time, IngeniumWeb, Shader, gl, Input } from "./WebGL.js";
import { Tri, Vert, Vec2, Vec3, Mesh, Mat4, Material, Camera } from "./3D.js";

var cam : Camera;
var m : Mesh;
var shader : Shader;

function onCreate () {
    console.log("Init");

    Time.setFPS(45);
    Time.setFixedFPS(20);
    IngeniumWeb.createWindow(800, 500, "root", "Ingenium");
    IngeniumWeb.window.setGL();
    IngeniumWeb.window.setClearColour(0xd0d0d0, 1);

    cam = new Camera();
    m = new Mesh();

    shader = new Shader(vertShader3D, fragShader3D);
    shader.use();

    m.loadFromObj("./resource/cubenormaltex.obj");
    m.setTexture("./resource/Cube Map.png");
    m.load();
    m.position = new Vec3 (0, 0, 3);
    Mesh.renderAll(shader, cam, cam.perspective(3 / 4), [m]);
    IngeniumWeb.window.clear();
}
function onUpdate () {
    if (Input.getKeyState('w')) {
        m.rotation.y += 0.2;
    }
    IngeniumWeb.window.clear();
    Mesh.renderAll(shader, cam, cam.perspective(3 / 4), [m]);
}
function onFixedUpdate () {

}
function onClose () {

}

IngeniumWeb.start(onCreate, onUpdate, onClose, onFixedUpdate);