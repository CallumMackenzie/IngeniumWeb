"use strict";

export var gl: WebGL2RenderingContext;

export class Time {
    static deltaTime = 0.1;
    static targetDeltaTime = 1000 / 2;
    static lastFrame = Date.now();
    static setFPS(newfps: number) {
        if (newfps == 0) {
            newfps = 0.1;
        }
        Time.deltaTime = 1000 / newfps;
    };
    static nextFrameReady() {
        if (Date.now() - Time.lastFrame >= Time.targetDeltaTime) {
            Time.deltaTime = Date.now() - Time.lastFrame;
            Time.lastFrame = Date.now();
            return true;
        }
        return false;
    };
};

export class WebGLWindow {
    parent: Element;
    canvas: Element;
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
    setGL = function () {
        gl = this.canvas.getContext(IngeniumWeb.glVersion);
    }
};

export class IngeniumWeb {
    static window: WebGLWindow;
    static running: boolean;
    static onCreate: Function;
    static onUpdate: Function;
    static onClose: Function;
    static glVersion: string;
    static intervalCode: any;

    static start(onCreate = function () { }, onUpdate = function () { }, onClose = function () { }, minDelta = 1, webGL = "webgl2") {
        IngeniumWeb.window = null;
        IngeniumWeb.running = true;
        IngeniumWeb.onCreate = onCreate;
        IngeniumWeb.onUpdate = onUpdate;
        IngeniumWeb.onClose = onClose;
        IngeniumWeb.glVersion = webGL;

        IngeniumWeb.init(minDelta);
    };
    static createWindow = function (width: number, height: number, id: string, parentName: string) {
        IngeniumWeb.window = new WebGLWindow(width, height, id, parentName);
    };
    static refresh = function () {
        if (Time.nextFrameReady())
            IngeniumWeb.onUpdate();
        if (!IngeniumWeb.running) {
            IngeniumWeb.onClose();
            clearInterval(IngeniumWeb.intervalCode);
        }
    }
    static init = function (minDelta = 1) {
        IngeniumWeb.onCreate();
        IngeniumWeb.intervalCode = setInterval(IngeniumWeb.refresh, minDelta);
    }
    static terminate(message: string) {
        console.error("Fatal: " + message);
        IngeniumWeb.running = false;
        clearInterval(IngeniumWeb.intervalCode);
    }
};

export class Shader {
    program: WebGLProgram = gl.NONE;

    static compile(source: string, type: number) {
        var shader = gl.createShader(type);
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
        var vShader = Shader.compile(vertSource, gl.VERTEX_SHADER);
        var fShader = Shader.compile(fragSource, gl.FRAGMENT_SHADER);
        this.program = gl.createProgram();
        gl.attachShader(this.program, vShader);
        gl.attachShader(this.program, fShader);
        gl.linkProgram(this.program);
    }
    use = function () {
        gl.useProgram(this.program);
    }
}