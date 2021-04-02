"use strict";

import { ShaderSource, ShaderSourceTypes } from "./shaders.js";
import { Time, IngeniumWeb, Shader, gl, Input, Scene } from "./WebGL.js";
import { Tri, Vert, Vec2, Vec3, Mesh, Mat4, Material, Camera, DirectionalLight, PointLight } from "./3D.js";
import { Geometry } from "./geometry.js";
import { degToRad } from "./Utils.js";


var shader: Shader;
var camera: Camera = new Camera(70);
var d: DirectionalLight = new DirectionalLight();
var p : PointLight[] = [ new PointLight(new Vec3(0.01, 0.01, 0.01), 
    new Vec3(1, 0.1, 0.6), new Vec3(1, 0.1, 0.6), new Vec3(0, 0, -3)) ];
var m: Mesh[] = [];

function onGlobalCreate () {
    Time.setFPS(60);
    IngeniumWeb.createWindow(16, 9, "My App");
    IngeniumWeb.window.setClearColour(0x303030, 1);
    shader = new Shader(ShaderSource.shaderWithParams("vert3d"), 
        ShaderSource.shaderWithParams("phong", { nLights: 1 }));
    d.ambient = new Vec3(0.2, 0.2, 0.2);

    var objPath : string = "./resource/uvsmoothnt.obj";

    m.push(new Mesh(new Vec3(-1.5, 0, 3)));
    m[0].material.shininess = 0.4;
    m[0].make(objPath, "./resource/sbrick/basecolour.jpg", "./resource/sbrick/height.png", "./resource/sbrick/normal.jpg");

    m.push(new Mesh(new Vec3(1.5, 0, 3)));
    m[1].material.shininess = 0.1;
    m[1].make(objPath, "./resource/metal/basecolour.jpg", "./resource/metal/specular.jpg", "./resource/metal/normal.jpg");

    m.push(new Mesh(new Vec3(-4.5, 0, 3)));
    m[2].material.shininess = 0.2;
    m[2].make(objPath, "./resource/paper/base.jpg", "./resource/paper/rough.png", "./resource/paper/normal.jpg");

    m.push(new Mesh(new Vec3(4.5, 0, 3)));
    m[3].material.shininess = 50;
    m[3].make(objPath, "./resource/scrmetal/base.jpg", "./resource/scrmetal/specular.jpg",
    "./resource/scrmetal/normal.jpg");

    m.push (new Mesh(new Vec3(-1.5, 3, 3)));
    m[4].make(objPath, "./resource/gate/base.jpg", "./resource/gate/specular.jpg", 
    "./resource/gate/normal.jpg");
}
function onUpdate() {
    camera.stdControl();
    for (var i : number = 0; i < m.length; i++) {
        m[i].rotation = Vec3.add(m[i].rotation, Vec3.mulFloat(new Vec3(0.01, 0.015, 0.01), Time.deltaTime * 0.07));
    }
    Mesh.renderAll(shader, camera, m, d, p);
}

var scene: Scene = new Scene(function () {}, onUpdate);
IngeniumWeb.start([scene], onGlobalCreate);