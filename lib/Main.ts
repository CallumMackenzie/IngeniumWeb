"use strict";

import { vertShader3D, fragShader3D } from "./shaders.js";
import { Time, IngeniumWeb, Shader, gl, Input } from "./WebGL.js";
import { Tri, Vert, Vec2, Vec3, Mesh, Mat4, Material, Camera, DirectionalLight, PointLight } from "./3D.js";

var aspect : number = 9 / 16;
var camera: Camera;
var m: Mesh;
var shader: Shader;
var dLight: DirectionalLight;
var pLights : PointLight[] = [];

function onCreate() {
    Time.setFPS(45);
    Time.setFixedFPS(1);
    IngeniumWeb.createWindow(1066, 600, "root", "Ingenium");
    IngeniumWeb.window.setGL();
    IngeniumWeb.window.setClearColour(0x000000, 1);

    camera = new Camera();
    camera.FOV = 75;
    m = new Mesh();

    shader = new Shader(vertShader3D, fragShader3D);
    shader.use();

    m.loadFromObj("./resource/cubenormaltex.obj");
    m.setTexture("./resource/brick.png", "./resource/brick.png");
    m.load();

    m.scale = new Vec3(2, 2, 2);
    m.position = new Vec3(0, 0, 3);

    dLight = new DirectionalLight(new Vec3(0.1, 0.1, 0.1), new Vec3(0.4, 0.4, 0.4), 
        new Vec3(0.2, 0.2, 0.1), new Vec3(0.25, -1, 0.25), 0);

    // pLights.push(new PointLight(new Vec3(0.01, 0.01, 0.01), new Vec3(0.3, 0.3, 0.3),
    //    new Vec3(0.2, 0.2, 0.2), new Vec3(0, 2, 1)));
}
function onUpdate() {
    var speed: number = 0.03;
    var cameraMoveSpeed: number = 0.001;
    var cLV: Vec3 = camera.lookVector();

    var forward: Vec3 = new Vec3();
    var up: Vec3 = new Vec3(0, 1, 0);
    var rotate: Vec3 = new Vec3();
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
    camera.position = Vec3.add(camera.position,
        Vec3.mulFloat(Vec3.normalize(forward), speed * Time.deltaTime));

    m.rotation = Vec3.add(m.rotation, Vec3.mulFloat(new Vec3(0.001, 0.001, 0.0015), Time.deltaTime));
    if (Math.abs(m.rotation.x) > 360) m.rotation.x = 0;
    if (Math.abs(m.rotation.y) > 360) m.rotation.y = 0;
    if (Math.abs(m.rotation.z) > 360) m.rotation.z = 0;

    IngeniumWeb.window.clear();
    Mesh.renderAll(shader, camera, camera.perspective(aspect), [m], dLight, pLights);
}
function onFixedUpdate() {

}
function onClose() {

}

IngeniumWeb.start(onCreate, onUpdate, onClose, onFixedUpdate);