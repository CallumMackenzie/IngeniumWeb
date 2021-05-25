"use strict";

import * as IW from "./Ingenium.js";


let shaders: { [id: string]: IW.Shader } = {};

let camera3D: IW.Camera3D = new IW.Camera3D(70, 0.01, 2000);
let d: IW.DirectionalLight = new IW.DirectionalLight();
let p: IW.PointLight[] = [new IW.PointLight(new IW.Vec3(0.01, 0.01, 0.01),
    new IW.Vec3(1, 1, 1), new IW.Vec3(1, 1, 1), new IW.Vec3(0, 0, -3))];
let am: IW.AnimatedMesh3D[] = [];
let m: IW.Mesh3D[] = [];

function onGlobalCreate() {
    let gParams: any = {
        version: "300 es",
        normalMap: 0,
        parallaxMap: 0
    };
    IW.ShaderSource.makeFromFile(
        Object.assign(gParams, {
            precision: "highp",
            vertexRGB: 0
        }), IW.ShaderSource.types.vert, "defVert", "./shaders/3D/asn.vs");
    IW.ShaderSource.makeFromFile(
        Object.assign(gParams, {
            precision: "mediump",
            maxPointLights: 1,
            lightModel: "BLINN",
            parallaxClipEdge: 0,
            parallaxInvert: 1,
            normalMap: 1
        }), IW.ShaderSource.types.frag, "defFrag", "./shaders/3D/asn.fs");


    IW.IngeniumWeb.createWindow(16, 9, "Gravity Demo");
    IW.IngeniumWeb.defaultSetup();
    IW.IngeniumWeb.window.setClearColour(0x303030, 1);


    shaders.asn = new IW.Shader(IW.ShaderSource.shaderWithParams("defVert"),
        IW.ShaderSource.shaderWithParams("defFrag"));

    IW.Time.setFPS(40);
    IW.Time.setFixedFPS(5);

    d.intensity = 0.6;
    d.diffuse = IW.Vec3.filledWith(1);
    d.specular = IW.Vec3.filledWith(0.8);
    d.direction = new IW.Vec3(-0.4, -1, 0);
    d.ambient = IW.Vec3.filledWith(0.2);

    IW.gl.enable(IW.gl.CULL_FACE);
    IW.gl.cullFace(IW.gl.BACK);

    let tmpMshs: IW.Mesh3D[] = [];
    for (let i = 0; i < 2; i++)
        tmpMshs.push(IW.Mesh3D.createAndMake("./resource/cubeanim/" + i.toString() + ".obj"));
    am.push(new IW.AnimatedMesh3D(IW.Mesh3D.createEmpty(36), tmpMshs, 1, 300));
    am[0].primaryMesh.position = new IW.Vec3(0, -2, 5);
}

function onUpdate() {
    camera3D.stdControl(1, IW.PI);
    for (let i = 0; i < am.length; i++) {
        am[i].checkAdvanceFrame();
        IW.Mesh3D.renderAll(shaders.asn, camera3D, [am[i].primaryMesh], d, p);
    }
    IW.Mesh3D.renderAll(shaders.asn, camera3D, m, d, p);
}

let scene: IW.Scene = new IW.Scene(function () { }, onUpdate);
IW.IngeniumWeb.start([scene], onGlobalCreate);