"use strict";

import * as IW from "./Ingenium.js";


let shader : IW.Shader;
let camera3D: IW.Camera3D = new IW.Camera3D();
let am: IW.AnimatedMesh3D;

function onCreate() {
    IW.IngeniumWeb.defaultInit();
    shader = IW.Shader.make3D();

    let tmpMshs: IW.Mesh3D[] = [];
    for (let i = 0; i < 2; i++)
        tmpMshs.push(IW.Mesh3D.createAndMake("./resource/cubeanim/" + i.toString() + ".obj"));
    am = new IW.AnimatedMesh3D(IW.Mesh3D.createEmpty(36), tmpMshs, 1, 500);
    am.primaryMesh.position = new IW.Vec3(0, 0, 1);
    am.primaryMesh.scale = IW.Vec3.filledWith(0.1);
}

function onUpdate() {
    camera3D.stdControl(1, IW.PI);
    am.checkAdvanceFrame();
    am.primaryMesh.rotation.addEquals(IW.Vec3.filledWith(1).mulFloat(IW.Time.deltaTime));
    am.render(shader, camera3D);
}

IW.IngeniumWeb.start([], onCreate, onUpdate);