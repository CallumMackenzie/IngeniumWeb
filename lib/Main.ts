"use strict";
import * as IW from "./Ingenium.js";

let shaders = {
    three: null,
    two: null
};
let camera3D: IW.Camera3D = new IW.Camera3D();
let am: IW.AnimatedMesh3D;

const onCreate = () => {
    IW.IngeniumWeb.defaultInit(0x000000);
    shaders.three = IW.Shader.make3D();
    shaders.two = IW.Shader.make2D();
    console.log(IW.Shader.getAllShaderInfo());
    let tmpMshs: IW.Mesh3D[] = [];
    for (let i = 0; i < 2; i++)
        tmpMshs.push(IW.Mesh3D.createAndMake("./resource/cubeanim/" + i.toString() + ".obj"));
    am = new IW.AnimatedMesh3D(IW.Mesh3D.createEmpty(36), tmpMshs, 1, 500);
    am.primaryMesh.position = new IW.Vec3(0, 0, 3);
}

const onUpdate = () => {
    camera3D.stdControl(4, IW.PI);
    am.checkAdvanceFrame();
    am.primaryMesh.rotation.addEquals(IW.Vec3.filledWith(0.4).mulFloat(IW.Time.deltaTime));
    am.render(shaders.three, camera3D);
}

IW.IngeniumWeb.start([], onCreate, onUpdate);