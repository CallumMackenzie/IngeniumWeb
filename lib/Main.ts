"use strict";
import * as IW from "./Ingenium.js";

let shader3D: IW.Shader;
let camera3D: IW.Camera3D = new IW.Camera3D();
let am: IW.AnimatedMesh3D[] = [];
let m: IW.Mesh3D[] = [];

const onCreate = () => {
	IW.IngeniumWeb.defaultInit(0x000000, undefined, 60);
	shader3D = IW.Shader.make3D({
		"lightModel": "PHONG",
		"normalMap": "1"
	});
	let nCubes = 1;
	for (let j = 0; j < nCubes; j++) {
		let tmpMshs: IW.Mesh3D[] = [];
		for (let i = 0; i < 2; i++)
			tmpMshs.push(IW.Mesh3D.createAndMake("./resource/cubeanim/" + i.toString() + ".obj",
				"./resource/paper/b.jpg", "./resource/paper/s.jpg", "./resource/paper/n.jpg"));
		am.push(new IW.AnimatedMesh3D(IW.Mesh3D.createEmpty(36), tmpMshs, 1, 500));
		am[j].primaryMesh.position = new IW.Vec3((j - (nCubes >> 1)) * 3, 0, 3);
	}

	let sphere = IW.Mesh3D.createAndMake("./resource/uvsmoothnt.obj",
		"./resource/metal/b.jpg", "./resource/metal/s.jpg", "./resource/paper/n.jpg");
	sphere.position = new IW.Vec3(5, 0, 5);
	m.push(sphere);
}

let ctr = 0;

const onUpdate = () => {
	camera3D.stdControl(4, IW.PI);
	for (let i = 0; i < am.length; ++i) {
		am[i].checkAdvanceFrame();
		am[i].primaryMesh.rotation.addEquals(IW.Vec3.filledWith(0.4).mulFloat(IW.Time.deltaTime));
		am[i].render(shader3D, camera3D);
	}
	for (let i = 0; i < m.length; ++i) {
		m[i].rotation.addEquals(IW.Vec3.filledWith(0.3).mulFloat(IW.Time.deltaTime));
		m[i].render(shader3D, camera3D);
	}
}

IW.IngeniumWeb.start([], onCreate, onUpdate);