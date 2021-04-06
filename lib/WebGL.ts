"use strict";

import { Mat4, Vec3, Vec2 } from "./3D.js";
export var gl: WebGL2RenderingContext;

export class Input {
    static keys: { [id: string]: boolean; } = {};
    static setup(): void {
        window.addEventListener("keydown", function (event) {
            if (event.ctrlKey == true && (event.which === 61 || event.which === 107 || event.which === 173 || event.which === 109 || event.which === 187 || event.which === 189)) {
                event.preventDefault();
            }
            Input.keys[event.key] = true;
        }, true);
        window.addEventListener("keyup", function (event) {
            Input.keys[event.key] = false;
        }, true);
    }
    static getKeyState(key: string): boolean {
        return (Input.keys[key] === undefined ? false : Input.keys[key]);
    }
}

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
    static updateDeltaTime(): void {
        Time.deltaTime = Date.now() - Time.lastFrame;
        Time.lastFrame = Date.now();
    }
    static updateFixedDeltaTime(): void {
        Time.fixedDeltaTime = Date.now() - Time.lastFixedFrame;
        Time.lastFixedFrame = Date.now();
    }
    static nextFixedFrameReady(): boolean {
        if (Date.now() - Time.lastFixedFrame >= Time.targetFixedDeltaTime) {
            Time.updateFixedDeltaTime();
            return true;
        }
        return false;
    }
    static nextFrameReady(): boolean {
        if (Date.now() - Time.lastFrame >= Time.targetDeltaTime) {
            Time.updateDeltaTime();
            return true;
        }
        return false;
    };
};

export class WebGLWindow {
    parent: HTMLElement | null;
    canvas: HTMLCanvasElement;
    width: number;
    height: number;
    aspectRatio: number;
    takeUpAsepct: boolean = true;

    constructor(width: number, height: number, parentName: string, name: string) {
        this.parent = document.getElementById(parentName);
        this.canvas = document.createElement("canvas");
        this.canvas.setAttribute("width", width.toString() + "px");
        this.canvas.setAttribute("height", height.toString() + "px");
        this.canvas.setAttribute("id", name);
        this.parent.appendChild(this.canvas);
        this.width = width;
        this.height = height;
        this.aspectRatio = height / width;

        this.setGL();
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.BLEND);
        gl.enable(gl.DEPTH_TEST);
        gl.depthMask(true);
        gl.depthFunc(gl.LEQUAL);
        gl.depthRange(0.0, 1.0);
    };
    sizeToWindow(aspect: number) {
        aspect = 1 / aspect;
        var win_width: number = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
        var win_height: number = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
        if (win_width / win_height != aspect) {
            if (win_height * aspect < win_width) {
                this.canvas.width = win_height * aspect;
                this.canvas.height = win_height;
                this.canvas.style.setProperty("height", this.canvas.height + "px");
                this.canvas.style.setProperty("width", this.canvas.width.toString() + "px");
            } else if (win_height * aspect > win_width) {
                this.canvas.width = win_width;
                this.canvas.height = win_width / aspect;
                this.canvas.style.setProperty("width", this.canvas.width + "px");
                this.canvas.style.setProperty("height", this.canvas.height.toString() + "px");
            }
            this.width = this.canvas.width;
            this.height = this.canvas.height;
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        }
    }
    setGL(): void {
        gl = <WebGL2RenderingContext>this.canvas.getContext(IngeniumWeb.glVersion);
    }
    setClearColour(hex: number, alpha: number): void {
        gl.clearDepth(1.0);
        var r = (hex & 0xFF0000) >> 16;
        var g = (hex & 0x00FF00) >> 8;
        var b = (hex & 0x0000FF);
        gl.clearColor(r / 255, g / 255, b / 255, alpha);
        var col = {
            prop : "background",
            val : "rgb(" + r.toString() + "," + g.toString() + "," + b.toString() + ")"
        };
        this.parent.style.setProperty(col.prop, col.val);
        document.body.style.setProperty(col.prop, col.val);
    }
    clear(): void {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }
};

export class Scene {
    onCreate: Function;
    onUpdate: Function;
    onFixedUpdate: Function;
    onClose: Function;

    constructor(onCreate: Function = function () { }, onUpdate: Function = function () { },
        onClose: Function = function () { }, onFixedUpdate: Function = function () { }) {
        this.onCreate = onCreate;
        this.onClose = onClose;
        this.onUpdate = onUpdate;
        this.onFixedUpdate = onFixedUpdate;
    }
}

export class IngeniumWeb {
    static window: WebGLWindow | null;
    static running: boolean;
    static glVersion: string;
    static intervalCode: number;
    static fixedIntervalCode: number;
    static onCreate: Function;
    static onUpdate: Function;
    static onClose: Function;
    static onFixedUpdate: Function;
    static scenes: Scene[] = [];
    static currentScene: number = 0;

    static start(scenes: Scene[],
        onCreate: Function = function () { }, onUpdate: Function = function () { },
        onClose: Function = function () { }, onFixedUpdate: Function = function () { },
        webGL = "webgl2"): void {
        IngeniumWeb.window = null;
        IngeniumWeb.running = true;
        IngeniumWeb.scenes = scenes;

        IngeniumWeb.onCreate = onCreate;
        IngeniumWeb.onUpdate = onUpdate;
        IngeniumWeb.onClose = onClose;
        IngeniumWeb.onFixedUpdate = onFixedUpdate;
        IngeniumWeb.glVersion = webGL;

        Input.setup();
        IngeniumWeb.init();
    };
    static createWindow(width: number, height: number, id: string, parentName: string = "root", takeUpAsepct: boolean = true): void {
        IngeniumWeb.window = new WebGLWindow(width, height, parentName, id);
        IngeniumWeb.window.takeUpAsepct = takeUpAsepct;
        if (takeUpAsepct) {
            window.addEventListener('resize', function () {
                IngeniumWeb.window.sizeToWindow(IngeniumWeb.window.aspectRatio);
            });
        }
    };
    static update(): void {
        Time.updateDeltaTime();
        IngeniumWeb.onUpdate();
        IngeniumWeb.scenes[IngeniumWeb.currentScene].onUpdate();
    }
    static fixedUpdate(): void {
        Time.updateFixedDeltaTime();
        IngeniumWeb.onFixedUpdate();
        IngeniumWeb.scenes[IngeniumWeb.currentScene].onFixedUpdate();
        if (!IngeniumWeb.running) {
            IngeniumWeb.scenes[IngeniumWeb.currentScene].onClose();
            IngeniumWeb.onClose();
            clearInterval(IngeniumWeb.intervalCode);
            clearInterval(IngeniumWeb.fixedIntervalCode);
        }
    }
    static init(): void {
        Time.updateDeltaTime();
        Time.updateFixedDeltaTime();
        IngeniumWeb.onCreate();
        IngeniumWeb.scenes[IngeniumWeb.currentScene].onCreate();
        IngeniumWeb.refreshLoops();
        if (IngeniumWeb.window.takeUpAsepct) {
            IngeniumWeb.window.sizeToWindow(IngeniumWeb.window.aspectRatio);
        }
    }
    static refreshLoops(): void {
        clearInterval(IngeniumWeb.intervalCode);
        clearInterval(IngeniumWeb.fixedIntervalCode);
        IngeniumWeb.intervalCode = setInterval(IngeniumWeb.update, Time.targetDeltaTime);
        IngeniumWeb.fixedIntervalCode = setInterval(IngeniumWeb.fixedUpdate, Time.targetFixedDeltaTime);
    }
    static terminate(message: string): void {
        console.error("Fatal: " + message);
        IngeniumWeb.running = false;
        clearInterval(IngeniumWeb.intervalCode);
        clearInterval(IngeniumWeb.fixedIntervalCode);
    }
    static enterScene(index: number): void {
        IngeniumWeb.currentScene = index;
        IngeniumWeb.scenes[IngeniumWeb.currentScene].onCreate();
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