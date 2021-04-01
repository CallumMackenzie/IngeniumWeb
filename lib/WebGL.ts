"use strict";

import { Mat4, Vec3, Vec2 } from "./3D.js";

export var gl: WebGL2RenderingContext;

export class Time {
    static deltaTime = 0.1;
    static fixedDeltaTime = 0.1;
    static targetDeltaTime = 1000 / 45;
    static targetFixedDeltaTime = 1000 / 35;
    static lastFrame = Date.now();
    static lastFixedFrame = Date.now();
    static setFPS(newfps: number): void {
        if (newfps <= 0)
            IngeniumWeb.terminate("Error: FPS cannot be less than or equal to 0.");
        Time.targetDeltaTime = 1000 / newfps;
    };
    static setFixedFPS(newfps: number): void {
        if (newfps <= 0)
            IngeniumWeb.terminate("Error: FPS cannot be less than or equal to 0.");
        Time.targetFixedDeltaTime = 1000 / newfps;
    }
    static nextFixedFrameReady(): boolean {
        if (Date.now() - Time.lastFixedFrame >= Time.targetFixedDeltaTime) {
            Time.fixedDeltaTime = Date.now() - Time.lastFixedFrame;
            Time.lastFixedFrame = Date.now();
            return true;
        }
        return false;
    }
    static nextFrameReady(): boolean {
        if (Date.now() - Time.lastFrame >= Time.targetDeltaTime) {
            Time.deltaTime = Date.now() - Time.lastFrame;
            Time.lastFrame = Date.now();
            return true;
        }
        return false;
    };
};

export class WebGLWindow {
    parent: Element | null;
    canvas: HTMLCanvasElement;
    width: number;
    height: number;
    aspectRatio: number;

    constructor(width: number, height: number, parentName: string, name: string, set: boolean = true) {
        this.parent = document.getElementById(parentName);
        this.canvas = document.createElement("canvas");
        this.canvas.setAttribute("width", width.toString());
        this.canvas.setAttribute("height", height.toString());
        this.canvas.setAttribute("id", name);
        this.parent.appendChild(this.canvas);
        this.width = width;
        this.height = height;
        this.aspectRatio = width / height;

        if (set)
            this.setGL();
    };
    setGL(): void {
        gl = <WebGL2RenderingContext>this.canvas.getContext(IngeniumWeb.glVersion);
    }
};

export class IngeniumWeb {
    static window: WebGLWindow | null;
    static running: boolean;
    static glVersion: string;
    static intervalCode: any;
    static onCreate: Function;
    static onUpdate: Function;
    static onClose: Function;
    static onFixedUpdate: Function;

    static start(onCreate = function () { }, onUpdate = function () { }, onClose = function () { }, onFixedUpdate = function () { }, webGL = "webgl2"): void {
        IngeniumWeb.window = null;
        IngeniumWeb.running = true;
        IngeniumWeb.onCreate = onCreate;
        IngeniumWeb.onUpdate = onUpdate;
        IngeniumWeb.onClose = onClose;
        IngeniumWeb.onFixedUpdate = onFixedUpdate;
        IngeniumWeb.glVersion = webGL;

        IngeniumWeb.init();
    };
    static createWindow = function (width: number, height: number, id: string, parentName: string) {
        IngeniumWeb.window = new WebGLWindow(width, height, id, parentName);
    };
    static refresh(): void {
        if (Time.nextFrameReady())
            IngeniumWeb.onUpdate();
        if (Time.nextFixedFrameReady())
            IngeniumWeb.onFixedUpdate();
        if (!IngeniumWeb.running) {
            IngeniumWeb.onClose();
            clearInterval(IngeniumWeb.intervalCode);
        }
    }
    static init(): void {
        IngeniumWeb.onCreate();
        IngeniumWeb.intervalCode = setInterval(IngeniumWeb.refresh, Time.targetDeltaTime);
    }
    static terminate(message: string): void {
        console.error("Fatal: " + message);
        IngeniumWeb.running = false;
        clearInterval(IngeniumWeb.intervalCode);
    }
};

export class Shader {
    program: WebGLProgram = gl.NONE;

    static compile(source: string, type: number): WebGLShader | null {
        var shader: WebGLShader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            var err = {
                type: "SHADER_COMPILE_ERROR",
                shaderInt: type,
                shaderType: (type == gl.VERTEX_SHADER) ? "vertex shader" : "fragment shader",
                error: gl.getShaderInfoLog(shader)
            };
            console.log(err);
            return null;
        }
        return shader;
    }

    constructor(vertSource: string, fragSource: string) {
        var vShader: WebGLShader | null = Shader.compile(vertSource, gl.VERTEX_SHADER);
        var fShader: WebGLShader | null = Shader.compile(fragSource, gl.FRAGMENT_SHADER);
        this.program = gl.createProgram();
        gl.attachShader(this.program, vShader);
        gl.attachShader(this.program, fShader);
        gl.linkProgram(this.program);
    }
    use(): void {
        gl.useProgram(this.program);
    }
    getULoc(name: string): WebGLUniformLocation {
        return gl.getUniformLocation(this.program, name);
    }
    setUInt(name: string, value: number): void {
        gl.uniform1i(this.getULoc(name), value);
    }
    setUInt2(name: string, value1: number, value2: number): void {
        gl.uniform2i(this.getULoc(name), value1, value2);
    }
    setUInt3(name: string, value1: number, value2: number, value3: number): void {
        gl.uniform3i(this.getULoc(name), value1, value2, value3);
    }
    setUInt4(name: string, value1: number, value2: number, value3: number, value4: number): void {
        gl.uniform4i(this.getULoc(name), value1, value2, value3, value4);
    }
    setUFloat(name: string, value: number): void {
        gl.uniform1f(this.getULoc(name), value);
    }
    setUFloat2(name: string, value1: number, value2: number): void {
        gl.uniform2f(this.getULoc(name), value1, value2);
    }
    setUFloat3(name: string, value1: number, value2: number, value3: number): void {
        gl.uniform3f(this.getULoc(name), value1, value2, value3);
    }
    setUFloat4(name: string, value1: number, value2: number, value3: number, value4: number): void {
        gl.uniform4f(this.getULoc(name), value1, value2, value3, value4);
    }
    setUMat4(name: string, mat4: Mat4): void {
        gl.uniformMatrix4fv(this.getULoc(name), false, mat4.m.flat());
    }
    setUVec2(name: string, v: Vec3): void {
        this.setUFloat2(name, v.x, v.y);
    }
    setUVec3(name: string, v: Vec3): void {
        this.setUFloat3(name, v.x, v.y, v.z);
    }
    setUVec4(name: string, v: Vec3): void {
        this.setUFloat4(name, v.x, v.y, v.z, v.w);
    }
    setUBool(name: string, b: boolean): void {
        this.setUInt(name, b ? 1 : 0);
    }
}