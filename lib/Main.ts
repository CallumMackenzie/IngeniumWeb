"use strict";

import { vertShader3D, fragShader3D } from "./shaders";
import { Time, IngeniumWeb, Shader } from "./WebGL";
import { Tri, Vert, Vec2, Vec3, Mesh, Mat4, Material } from "./3D";

var onCreate = function () {
    Time.setFPS(30);
    IngeniumWeb.createWindow(400, 300, "main", "Ingenium");
    IngeniumWeb.window.setGL();
    var shader = new Shader(vertShader3D, fragShader3D);
    shader.use();
}
var onUpdate = function () {
    console.log("Loop");
}
var onClose = function () {

}

function main() {
    console.log("Init");
    IngeniumWeb.start(onCreate, onUpdate, onClose);
}