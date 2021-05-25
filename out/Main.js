"use strict";
import * as IW from "./Ingenium.js";
let shaders = {};
let camera3D = new IW.Camera3D(70, 0.01, 2000);
let camera2D = new IW.Camera2D(9 / 16);
let d = new IW.DirectionalLight();
let p = [new IW.PointLight(new IW.Vec3(0.01, 0.01, 0.01), new IW.Vec3(1, 1, 1), new IW.Vec3(1, 1, 1), new IW.Vec3(0, 0, -3))];
let m = [];
let fbMesh;
let lowResBuffer;
function onGlobalCreate() {
    let gParams = {
        version: "300 es",
        normalMap: 0,
        parallaxMap: 0
    };
    IW.ShaderSource.makeFromFile(Object.assign(gParams, {
        precision: "highp",
        vertexRGB: 0
    }), IW.ShaderSource.types.vert, "defVert", "./shaders/3D/asn.vs");
    IW.ShaderSource.makeFromFile(Object.assign(gParams, {
        precision: "mediump",
        maxPointLights: 1,
        lightModel: "BLINN",
        parallaxClipEdge: 0,
        parallaxInvert: 1,
        normalMap: 1
    }), IW.ShaderSource.types.frag, "defFrag", "./shaders/3D/asn.fs");
    IW.ShaderSource.makeFromFile(Object.assign(gParams, { precision: "highp" }), IW.ShaderSource.types.vert, "postvs", "./shaders/post/fbo.vs");
    IW.ShaderSource.makeFromFile(Object.assign(gParams, { precision: "mediump" }), IW.ShaderSource.types.frag, "postfs", "./shaders/post/fbo.fs");
    IW.IngeniumWeb.createWindow(16, 9, "Gravity Demo");
    IW.IngeniumWeb.defaultSetup();
    IW.IngeniumWeb.window.setClearColour(0x303030, 1);
    lowResBuffer = IW.FrameBuffer.createRenderTexture(720, 480);
    fbMesh = new IW.Mesh2D();
    fbMesh.triangles = 2;
    fbMesh.data = IW.Geometry.quadData;
    fbMesh.load();
    fbMesh.material = new IW.Material(lowResBuffer.properties.texture);
    shaders.asn = new IW.Shader(IW.ShaderSource.shaderWithParams("defVert"), IW.ShaderSource.shaderWithParams("defFrag"));
    shaders.post = new IW.Shader(IW.ShaderSource.shaderWithParams("postvs"), IW.ShaderSource.shaderWithParams("postfs"));
    IW.Time.setFPS(40);
    IW.Time.setFixedFPS(5);
    d.intensity = 0.6;
    d.diffuse = IW.Vec3.filledWith(1);
    d.specular = IW.Vec3.filledWith(0.8);
    d.direction = new IW.Vec3(-0.4, -1, 0);
    d.ambient = IW.Vec3.filledWith(0.2);
    IW.gl.enable(IW.gl.CULL_FACE);
    IW.gl.cullFace(IW.gl.BACK);
    let objPath = "./resource/planent.obj";
}
function onUpdate() {
    camera3D.stdControl(1, IW.PI);
    IW.FrameBuffer.renderToRenderTexture(lowResBuffer, () => {
        IW.Mesh3D.renderAll(shaders.asn, camera3D, m, d, p);
    });
    IW.FrameBuffer.setDefaultRenderBuffer();
    IW.Mesh2D.renderAll(shaders.post, camera2D, [fbMesh]);
}
let scene = new IW.Scene(function () { }, onUpdate);
IW.IngeniumWeb.start([scene], onGlobalCreate);
