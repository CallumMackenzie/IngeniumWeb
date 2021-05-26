"use strict";
import * as IW from "./Ingenium.js";
let shader;
let camera3D = new IW.Camera3D();
let am;
function onCreate() {
    IW.IngeniumWeb.defaultInit();
    shader = IW.Shader.make3D();
    let tmpMshs = [];
    for (let i = 0; i < 2; i++)
        tmpMshs.push(IW.Mesh3D.createAndMake("./resource/cubeanim/" + i.toString() + ".obj"));
    am = new IW.AnimatedMesh3D(IW.Mesh3D.createEmpty(36), tmpMshs, 1, 500);
    am.primaryMesh.position = new IW.Vec3(0, 0, 3);
}
function onUpdate() {
    camera3D.stdControl(4, IW.PI);
    am.checkAdvanceFrame();
    am.primaryMesh.rotation.addEquals(IW.Vec3.filledWith(0.4).mulFloat(IW.Time.deltaTime));
    am.render(shader, camera3D);
}
IW.IngeniumWeb.start([], onCreate, onUpdate);
