"use strict";
import { vertShader3D, fragShader3D } from "./shaders.js";
import { Time, IngeniumWeb, Shader, Input, Scene } from "./WebGL.js";
import { Vec3, Mesh, Camera, DirectionalLight, PointLight } from "./3D.js";
var aspect = 9 / 16;
var camera = new Camera();
var m;
var shader;
var dLight;
var pLights = [];
function onGlobalCreate() {
    Time.setFPS(60);
    Time.setFixedFPS(7);
    IngeniumWeb.createWindow(1066, 600, "root", "Ingenium");
    IngeniumWeb.window.setGL();
    IngeniumWeb.window.setClearColour(0x000000, 1);
    shader = new Shader(vertShader3D, fragShader3D);
    dLight = new DirectionalLight(new Vec3(0.01, 0.01, 0.01), new Vec3(0.0, 0.0, 0.0), new Vec3(0, 0, 0), new Vec3(0, 0, 0), 0);
    pLights.push(new PointLight(new Vec3(0.01, 0.01, 0.01), new Vec3(1, 1, 1), new Vec3(1, 1, 1), new Vec3(0, 2, 3.2)));
    camera.FOV = 75;
    shader.use();
}
function onCreateDefScene() {
    m = new Mesh();
    m.loadFromObj("./resource/cubenormaltex.obj");
    m.setTexture("./resource/brick.png", "./resource/brick.png");
    m.load();
    m.scale = new Vec3(2, 2, 2);
    m.position = new Vec3(0, 0, 3);
}
function onUpdateDefScene() {
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
    m.rotation = Vec3.add(m.rotation, Vec3.mulFloat(new Vec3(0.000, 0.0001, 0.000), Time.deltaTime));
    if (Math.abs(m.rotation.x) > 360)
        m.rotation.x = 0;
    if (Math.abs(m.rotation.y) > 360)
        m.rotation.y = 0;
    if (Math.abs(m.rotation.z) > 360)
        m.rotation.z = 0;
    IngeniumWeb.window.clear();
    Mesh.renderAll(shader, camera, camera.perspective(aspect), [m], dLight, pLights);
}
function onCreateMonkeyScene() {
    m = new Mesh();
    m.loadFromObj("./resource/monkeynormal.obj");
    m.setTexture("./resource/brick.png", "./resource/brick.png");
    m.load();
    m.material.shininess = 1;
    m.position = new Vec3(0, 0, 3);
    m.scale = new Vec3(2, 2, 2);
}
var defScene = new Scene(onCreateDefScene, onUpdateDefScene);
var monkeyScene = new Scene(onCreateMonkeyScene, onUpdateDefScene);
IngeniumWeb.start([defScene], onGlobalCreate);
//# sourceMappingURL=Main.js.map