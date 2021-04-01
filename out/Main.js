"use strict";
import { vertShader3D, fragShader3D } from "./shaders.js";
import { Time, IngeniumWeb, Shader, Input } from "./WebGL.js";
import { Vec3, Mesh, Camera } from "./3D.js";
var camera;
var m;
var shader;
function onCreate() {
    Time.setFPS(60);
    Time.setFixedFPS(20);
    IngeniumWeb.createWindow(800, 500, "root", "Ingenium");
    IngeniumWeb.window.setGL();
    IngeniumWeb.window.setClearColour(0x000000, 1);
    camera = new Camera();
    camera.FOV = 75;
    m = new Mesh();
    shader = new Shader(vertShader3D, fragShader3D);
    shader.use();
    m.loadFromObj("./resource/cubenormaltex.obj");
    m.setTexture("./resource/Cube Map.png", "./resource/Cube Map.png");
    m.load();
    m.scale = new Vec3(2, 2, 2);
    m.position = new Vec3(0, 0, 3);
}
function onUpdate() {
    var speed = 0.03;
    var cameraMoveSpeed = 0.001;
    var cLV = camera.lookVector();
    var forward = new Vec3();
    var up = new Vec3(0, 1, 0);
    var rotate = new Vec3();
    if (Input.getKeyState('w'))
        forward = Vec3.add(forward, cLV);
    if (Input.getKeyState('s'))
        forward = Vec3.mulFloat(Vec3.add(forward, cLV), -1);
    if (Input.getKeyState('d'))
        forward = Vec3.add(forward, Vec3.cross(cLV, up));
    if (Input.getKeyState('a'))
        forward = Vec3.add(forward, Vec3.mulFloat(Vec3.cross(cLV, up), -1));
    if (Input.getKeyState('q') || Input.getKeyState(' '))
        forward.y = forward.y + 1;
    if (Input.getKeyState('e'))
        forward.y = forward.y - 1;
    if (Input.getKeyState('ArrowLeft'))
        rotate.y = -cameraMoveSpeed;
    if (Input.getKeyState('ArrowRight'))
        rotate.y = cameraMoveSpeed;
    if (Input.getKeyState('ArrowUp'))
        rotate.x = -cameraMoveSpeed;
    if (Input.getKeyState('ArrowDown'))
        rotate.x = cameraMoveSpeed;
    if (Input.getKeyState('Shift') || Input.getKeyState('ShiftLeft'))
        speed *= 5;
    camera.rotation = Vec3.add(camera.rotation, Vec3.mulFloat(rotate, Time.deltaTime));
    camera.position = Vec3.add(camera.position, Vec3.mulFloat(Vec3.normalize(forward), speed * Time.deltaTime));
    IngeniumWeb.window.clear();
    shader.setUVec3("dirLight.direction", new Vec3(0, -1, 0));
    shader.setUVec3("dirLight.ambient", new Vec3(0.01, 0.01, 0.01));
    shader.setUVec3("dirLight.specular", new Vec3(0.2, 0.2, 0.2));
    shader.setUVec3("dirLight.diffuse", new Vec3(1, 1, 1));
    Mesh.renderAll(shader, camera, camera.perspective(3 / 4), [m]);
}
function onFixedUpdate() {
}
function onClose() {
}
IngeniumWeb.start(onCreate, onUpdate, onClose, onFixedUpdate);
//# sourceMappingURL=Main.js.map