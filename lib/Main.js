"use strict";

var onCreate = function () {
    Time.setFPS(30);
    IngeniumWeb.createWindow(400, 300, "main");
    var gl = IngeniumWeb.window.gl;
    var shader = new Shader(vertShader3D, fragShader3D);
    shader.use(gl);
}
var onUpdate = function () {

}
var onClose = function () {

}

function main () {
    console.log("Init");
    IngeniumWeb.start(onCreate, onUpdate, onClose);
}