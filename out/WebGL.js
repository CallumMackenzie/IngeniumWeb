"use strict";
export var gl;
export class Input {
    static setup() {
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
    static getKeyState(key) {
        return (Input.keys[key] === undefined ? false : Input.keys[key]);
    }
}
Input.keys = {};
export class Time {
    static setFPS(newfps) {
        if (newfps <= 0)
            IngeniumWeb.terminate("Error: FPS cannot be less than or equal to 0.");
        Time.targetDeltaTime = 1000 / newfps;
    }
    ;
    static setFixedFPS(newfps) {
        if (newfps <= 0)
            IngeniumWeb.terminate("Error: FPS cannot be less than or equal to 0.");
        Time.targetFixedDeltaTime = 1000 / newfps;
    }
    static updateDeltaTime() {
        Time.deltaTime = Date.now() - Time.lastFrame;
        Time.lastFrame = Date.now();
    }
    static updateFixedDeltaTime() {
        Time.fixedDeltaTime = Date.now() - Time.lastFixedFrame;
        Time.lastFixedFrame = Date.now();
    }
    static nextFixedFrameReady() {
        if (Date.now() - Time.lastFixedFrame >= Time.targetFixedDeltaTime) {
            Time.updateFixedDeltaTime();
            return true;
        }
        return false;
    }
    static nextFrameReady() {
        if (Date.now() - Time.lastFrame >= Time.targetDeltaTime) {
            Time.updateDeltaTime();
            return true;
        }
        return false;
    }
    ;
}
Time.deltaTime = 0.1;
Time.fixedDeltaTime = 0.1;
Time.targetDeltaTime = 1000 / 45;
Time.targetFixedDeltaTime = 1000 / 35;
Time.lastFrame = Date.now();
Time.lastFixedFrame = Date.now();
;
export class WebGLWindow {
    constructor(width, height, parentName, name) {
        this.takeUpAsepct = true;
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
    }
    ;
    sizeToWindow(aspect) {
        aspect = 1 / aspect;
        var main = this.parent;
        var win_width = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
        var win_height = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
        if (win_width / win_height != aspect) {
            if (win_height * aspect < win_width) {
                this.canvas.width = win_height * aspect;
                this.canvas.height = win_height;
                this.canvas.style.setProperty("height", this.canvas.height + "px");
                this.canvas.style.setProperty("width", this.canvas.width.toString() + "px");
            }
            else if (win_height * aspect > win_width) {
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
    setGL() {
        gl = this.canvas.getContext(IngeniumWeb.glVersion);
    }
    setClearColour(hex, alpha) {
        gl.clearDepth(1.0);
        var r = (hex & 0xFF0000) >> 16;
        var g = (hex & 0x00FF00) >> 8;
        var b = (hex & 0x0000FF);
        gl.clearColor(r / 255, g / 255, b / 255, alpha);
        var col = {
            prop: "background",
            val: "rgb(" + r.toString() + "," + g.toString() + "," + b.toString() + ")"
        };
        this.parent.style.setProperty(col.prop, col.val);
        document.body.style.setProperty(col.prop, col.val);
    }
    clear() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }
}
;
export class Scene {
    constructor(onCreate = function () { }, onUpdate = function () { }, onClose = function () { }, onFixedUpdate = function () { }) {
        this.onCreate = onCreate;
        this.onClose = onClose;
        this.onUpdate = onUpdate;
        this.onFixedUpdate = onFixedUpdate;
    }
}
export class IngeniumWeb {
    static start(scenes, onCreate = function () { }, onUpdate = function () { }, onClose = function () { }, onFixedUpdate = function () { }, webGL = "webgl2") {
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
    }
    ;
    static createWindow(width, height, id, parentName = "root", takeUpAsepct = true) {
        IngeniumWeb.window = new WebGLWindow(width, height, parentName, id);
        IngeniumWeb.window.takeUpAsepct = takeUpAsepct;
        if (takeUpAsepct) {
            window.addEventListener('resize', function () {
                IngeniumWeb.window.sizeToWindow(IngeniumWeb.window.aspectRatio);
            });
        }
    }
    ;
    static update() {
        Time.updateDeltaTime();
        IngeniumWeb.onUpdate();
        IngeniumWeb.scenes[IngeniumWeb.currentScene].onUpdate();
    }
    static fixedUpdate() {
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
    static init() {
        Time.updateDeltaTime();
        Time.updateFixedDeltaTime();
        IngeniumWeb.onCreate();
        IngeniumWeb.scenes[IngeniumWeb.currentScene].onCreate();
        IngeniumWeb.refreshLoops();
        if (IngeniumWeb.window.takeUpAsepct) {
            IngeniumWeb.window.sizeToWindow(IngeniumWeb.window.aspectRatio);
        }
    }
    static refreshLoops() {
        clearInterval(IngeniumWeb.intervalCode);
        clearInterval(IngeniumWeb.fixedIntervalCode);
        IngeniumWeb.intervalCode = setInterval(IngeniumWeb.update, Time.targetDeltaTime);
        IngeniumWeb.fixedIntervalCode = setInterval(IngeniumWeb.fixedUpdate, Time.targetFixedDeltaTime);
    }
    static terminate(message) {
        console.error("Fatal: " + message);
        IngeniumWeb.running = false;
        clearInterval(IngeniumWeb.intervalCode);
        clearInterval(IngeniumWeb.fixedIntervalCode);
    }
    static enterScene(index) {
        IngeniumWeb.currentScene = index;
        IngeniumWeb.scenes[IngeniumWeb.currentScene].onCreate();
    }
}
IngeniumWeb.scenes = [];
IngeniumWeb.currentScene = 0;
;
export class Shader {
    constructor(vertSource, fragSource) {
        this.program = gl.NONE;
        var vShader = Shader.compile(vertSource, gl.VERTEX_SHADER);
        var fShader = Shader.compile(fragSource, gl.FRAGMENT_SHADER);
        this.program = gl.createProgram();
        gl.attachShader(this.program, vShader);
        gl.attachShader(this.program, fShader);
        gl.linkProgram(this.program);
    }
    static compile(source, type) {
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
    use() {
        gl.useProgram(this.program);
    }
    getULoc(name) {
        return gl.getUniformLocation(this.program, name);
    }
    setUInt(name, value) {
        gl.uniform1i(this.getULoc(name), value);
    }
    setUInt2(name, value1, value2) {
        gl.uniform2i(this.getULoc(name), value1, value2);
    }
    setUInt3(name, value1, value2, value3) {
        gl.uniform3i(this.getULoc(name), value1, value2, value3);
    }
    setUInt4(name, value1, value2, value3, value4) {
        gl.uniform4i(this.getULoc(name), value1, value2, value3, value4);
    }
    setUFloat(name, value) {
        gl.uniform1f(this.getULoc(name), value);
    }
    setUFloat2(name, value1, value2) {
        gl.uniform2f(this.getULoc(name), value1, value2);
    }
    setUFloat3(name, value1, value2, value3) {
        gl.uniform3f(this.getULoc(name), value1, value2, value3);
    }
    setUFloat4(name, value1, value2, value3, value4) {
        gl.uniform4f(this.getULoc(name), value1, value2, value3, value4);
    }
    setUMat4(name, mat4) {
        gl.uniformMatrix4fv(this.getULoc(name), false, mat4.m.flat());
    }
    setUVec2(name, v) {
        this.setUFloat2(name, v.x, v.y);
    }
    setUVec3(name, v) {
        this.setUFloat3(name, v.x, v.y, v.z);
    }
    setUVec4(name, v) {
        this.setUFloat4(name, v.x, v.y, v.z, v.w);
    }
    setUBool(name, b) {
        this.setUInt(name, b ? 1 : 0);
    }
}
//# sourceMappingURL=WebGL.js.map