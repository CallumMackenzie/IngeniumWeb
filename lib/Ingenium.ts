"use strict";
/**
 * The OpenGL object of the program.
 */
export var gl: WebGL2RenderingContext;

/**
 * Automatic input manager.
 */
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
    /**
     * 
     * @param key the key to check for.
     * @returns whether the key is currently pressed.
     */
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
        Time.deltaTime = (Date.now() - Time.lastFrame) / 1000;
        Time.lastFrame = Date.now();
    }
    static updateFixedDeltaTime(): void {
        Time.fixedDeltaTime = (Date.now() - Time.lastFixedFrame) / 1000;
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
    static deltaTimeToFPS(delta: number): number {
        return (1 / delta);
    }
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
            prop: "background",
            val: "rgb(" + r.toString() + "," + g.toString() + "," + b.toString() + ")"
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
    static startTime: number = 0;

    static start(scenes: Scene[],
        onCreate: Function = function () { }, onUpdate: Function = function () { },
        onClose: Function = function () { }, onFixedUpdate: Function = function () { },
        webGL = "webgl2"): void {
        this.startTime = Date.now();
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

export var PI: number = 355 / 113;

export class Vec2 {
    x: number = 0;
    y: number = 0;
    w: number = 1;


    static filledWith(num: number): Vec2 {
        return new Vec2(num, num);
    }

    static sub(v1: Vec2, v2: Vec2): Vec2 {
        return new Vec2(v1.x - v2.x, v1.y - v2.y);
    }
    static add(v1: Vec2, v2: Vec2): Vec2 {
        return new Vec2(v1.x + v2.x, v1.y + v2.y);
    }
    static mul(v1: Vec2, v2: Vec2): Vec2 {
        return new Vec2(v1.x * v2.x, v1.y * v2.y);
    }
    static div(v1: Vec2, v2: Vec2): Vec2 {
        return new Vec2(v1.x / v2.x, v1.y / v2.y);
    }
    static mulFloat(v1: Vec2, float: number): Vec2 {
        return new Vec2(v1.x * float, v1.y * float);
    }
    static divFloat(v1: Vec2, float: number): Vec2 {
        return new Vec2(v1.x / float, v1.y / float);
    }
    static len(v: Vec2): number {
        return Math.sqrt(v.x * v.x + v.y * v.y);
    }
    static normalize(v: Vec2): Vec2 {
        var l = Vec2.len(v);
        return new Vec2(v.x / l, v.y / l);
    }

    constructor(x: number = 0, y: number = 0, w: number = 1) {
        this.x = x;
        this.y = y;
        this.w = w;
    }
}

export class Vec3 {
    x: number = 0;
    y: number = 0;
    z: number = 0;
    w: number = 1;

    static filledWith(num: number): Vec3 {
        return new Vec3(num, num, num);
    }

    static sub(v1: Vec3, v2: Vec3): Vec3 {
        return new Vec3(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
    }
    static add(v1: Vec3, v2: Vec3): Vec3 {
        return new Vec3(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
    }
    static mul(v1: Vec3, v2: Vec3): Vec3 {
        return new Vec3(v1.x * v2.x, v1.y * v2.y, v1.z * v2.z);
    }
    static div(v1: Vec3, v2: Vec3): Vec3 {
        return new Vec3(v1.x / v2.x, v1.y / v2.y, v1.z / v2.z);
    }
    static mulFloat(v1: Vec3, float: number): Vec3 {
        return new Vec3(v1.x * float, v1.y * float, v1.z * float);
    }
    static divFloat(v1: Vec3, float: number): Vec3 {
        return new Vec3(v1.x / float, v1.y / float, v1.z / float);
    }
    static dot(v1: Vec3, v2: Vec3): number {
        return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    }
    static len(v: Vec3): number {
        return Math.sqrt(Vec3.dot(v, v));
    }
    static normalize(v: Vec3): Vec3 {
        var l = Vec3.len(v);
        if (l != 0)
            return new Vec3(v.x / l, v.y / l, v.z / l);
        return new Vec3();
    }
    static cross(v1: Vec3, v2: Vec3): Vec3 {
        var v = new Vec3();
        v.x = v1.y * v2.z - v1.z * v2.y;
        v.y = v1.z * v2.x - v1.x * v2.z;
        v.z = v1.x * v2.y - v1.y * v2.x;
        return v;
    }
    static mulMat(i: Vec3, m: Mat4): Vec3 {
        var v = new Vec3();
        v.x = i.x * m.m[0][0] + i.y * m.m[1][0] + i.z * m.m[2][0] + i.w * m.m[3][0];
        v.y = i.x * m.m[0][1] + i.y * m.m[1][1] + i.z * m.m[2][1] + i.w * m.m[3][1];
        v.z = i.x * m.m[0][2] + i.y * m.m[1][2] + i.z * m.m[2][2] + i.w * m.m[3][2];
        v.w = i.x * m.m[0][3] + i.y * m.m[1][3] + i.z * m.m[2][3] + i.w * m.m[3][3];
        return v;
    }

    constructor(x: number = 0, y: number = 0, z: number = 0, w: number = 1) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }
    add(v: Vec3): Vec3 {
        return new Vec3(this.x + v.x, this.y + v.y, this.z + v.z);
    }
    sub(v: Vec3): Vec3 {
        return new Vec3(this.x - v.x, this.y - v.y, this.z - v.z);
    }
    mul(v: Vec3): Vec3 {
        return new Vec3(this.x * v.x, this.y * v.y, this.z * v.z);
    }
    div(v: Vec3): Vec3 {
        return new Vec3(this.x / v.x, this.y / v.y, this.z / v.z);
    }
    mulFloat(n: number): Vec3 {
        return new Vec3(this.x * n, this.y * n, this.z * n);
    }
    divFloat(n: number): Vec3 {
        return new Vec3(this.x / n, this.y / n, this.z / n);
    }
    addFloat(n: number): Vec3 {
        return new Vec3(this.x + n, this.y + n, this.z + n);
    }
    len(): number {
        return Vec3.len(this);
    }
    mulMat(mat: Mat4): Vec3 {
        return Vec3.mulMat(this, mat);
    }
    normalized(): Vec3 {
        return Vec3.normalize(this);
    }
    isNaN(): boolean {
        return isNaN(this.x) || isNaN(this.y) || isNaN(this.z) || isNaN(this.w);
    }
    equals(v2: Vec3): boolean {
        return this.x == v2.x && this.y == v2.y && this.z == v2.z;
    }
}

export class Mat4 {
    m: number[][];

    static perspective(fovDeg: number, aspectRatio: number, near: number, far: number): Mat4 {
        var fovRad = 1.0 / Math.tan(Rotation.degToRad(fovDeg * 0.5));
        var matrix = new Mat4();
        matrix.m[0][0] = aspectRatio * fovRad;
        matrix.m[1][1] = fovRad;
        matrix.m[2][2] = far / (far - near);
        matrix.m[3][2] = (-far * near) / (far - near);
        matrix.m[2][3] = 1.0;
        matrix.m[3][3] = 0.0;
        return matrix;
    };
    static inverse(m: Mat4): Mat4 {
        var matrix: Mat4 = new Mat4();
        matrix.m[0][0] = m.m[0][0]; matrix.m[0][1] = m.m[1][0]; matrix.m[0][2] = m.m[2][0]; matrix.m[0][3] = 0.0;
        matrix.m[1][0] = m.m[0][1]; matrix.m[1][1] = m.m[1][1]; matrix.m[1][2] = m.m[2][1]; matrix.m[1][3] = 0.0;
        matrix.m[2][0] = m.m[0][2]; matrix.m[2][1] = m.m[1][2]; matrix.m[2][2] = m.m[2][2]; matrix.m[2][3] = 0.0;
        matrix.m[3][0] = -(m.m[3][0] * matrix.m[0][0] + m.m[3][1] * matrix.m[1][0] + m.m[3][2] * matrix.m[2][0]);
        matrix.m[3][1] = -(m.m[3][0] * matrix.m[0][1] + m.m[3][1] * matrix.m[1][1] + m.m[3][2] * matrix.m[2][1]);
        matrix.m[3][2] = -(m.m[3][0] * matrix.m[0][2] + m.m[3][1] * matrix.m[1][2] + m.m[3][2] * matrix.m[2][2]);
        matrix.m[3][3] = 1.0;
        return matrix;
    }
    static identity(): Mat4 {
        var matrix = new Mat4();
        matrix.m[0][0] = 1.0;
        matrix.m[1][1] = 1.0;
        matrix.m[2][2] = 1.0;
        matrix.m[3][3] = 1.0;
        return matrix;
    }
    static pointedAt(pos: Vec3, target: Vec3, up: Vec3 = new Vec3(0, 1, 0)): Mat4 {
        var newForward = Vec3.sub(target, pos);
        newForward = Vec3.normalize(newForward);

        var a = Vec3.mulFloat(newForward, Vec3.dot(up, newForward));
        var newUp = Vec3.sub(up, a);
        newUp = Vec3.normalize(newUp);

        var newRight = Vec3.cross(newUp, newForward);
        var matrix = new Mat4();
        matrix.m[0][0] = newRight.x; matrix.m[0][1] = newRight.y; matrix.m[0][2] = newRight.z; matrix.m[0][3] = 0.0;
        matrix.m[1][0] = newUp.x; matrix.m[1][1] = newUp.y; matrix.m[1][2] = newUp.z; matrix.m[1][3] = 0.0;
        matrix.m[2][0] = newForward.x; matrix.m[2][1] = newForward.y; matrix.m[2][2] = newForward.z; matrix.m[2][3] = 0.0;
        matrix.m[3][0] = pos.x; matrix.m[3][1] = pos.y; matrix.m[3][2] = pos.z; matrix.m[3][3] = 1.0;
        return matrix;
    }
    static scale(x: number = 1, y: number = 1, z: number = 1): Mat4 {
        var matrix = Mat4.identity();
        matrix.m[0][0] = x;
        matrix.m[1][1] = y;
        matrix.m[2][2] = z;
        return matrix;
    }
    static translation(x: number = 0, y: number = 0, z: number = 0): Mat4 {
        var matrix = new Mat4();
        matrix.m[0][0] = 1.0;
        matrix.m[1][1] = 1.0;
        matrix.m[2][2] = 1.0;
        matrix.m[3][3] = 1.0;
        matrix.m[3][0] = x;
        matrix.m[3][1] = y;
        matrix.m[3][2] = z;
        return matrix;
    }
    static mul(m1: Mat4, m2: Mat4): Mat4 {
        var matrix: Mat4 = new Mat4();
        for (var c: number = 0; c < 4; c++)
            for (var r: number = 0; r < 4; r++)
                matrix.m[r][c] = m1.m[r][0] * m2.m[0][c] + m1.m[r][1] * m2.m[1][c] + m1.m[r][2] * m2.m[2][c] + m1.m[r][3] * m2.m[3][c];
        return matrix;
    }
    static rotationX(xRad: number): Mat4 {
        var matrix: Mat4 = new Mat4();
        matrix.m[0][0] = 1;
        matrix.m[1][1] = Math.cos(xRad);
        matrix.m[1][2] = Math.sin(xRad);
        matrix.m[2][1] = -Math.sin(xRad);
        matrix.m[2][2] = Math.cos(xRad);
        matrix.m[3][3] = 1;
        return matrix;
    }
    static rotationY(yRad: number): Mat4 {
        var matrix: Mat4 = new Mat4();
        matrix.m[0][0] = Math.cos(yRad);
        matrix.m[0][2] = Math.sin(yRad);
        matrix.m[2][0] = -Math.sin(yRad);
        matrix.m[1][1] = 1;
        matrix.m[2][2] = Math.cos(yRad);
        matrix.m[3][3] = 1;
        return matrix;
    }
    static rotationZ(zRad: number): Mat4 {
        var matrix: Mat4 = new Mat4();
        matrix.m[0][0] = Math.cos(zRad);
        matrix.m[0][1] = Math.sin(zRad);
        matrix.m[1][0] = -Math.sin(zRad);
        matrix.m[1][1] = Math.cos(zRad);
        matrix.m[2][2] = 1;
        matrix.m[3][3] = 1;
        return matrix;
    }
    static rotationOnPoint(xRad: number, yRad: number, zRad: number, pt: Vec3): Mat4 {
        var mat: Mat4 = Mat4.mul(
            Mat4.mul(Mat4.translation(pt.x, pt.y, pt.z),
                Mat4.mul(Mat4.mul(Mat4.rotationX(xRad), Mat4.rotationY(yRad)), Mat4.rotationZ(zRad))),
            Mat4.translation(-pt.x, -pt.y, -pt.z));
        return mat;
    }

    constructor() {
        this.m = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
    }
}

export class Rotation {
    static radToDeg(rad: number): number {
        return rad * 180 / PI;
    }

    static degToRad(deg: number): number {
        return deg * PI / 180;
    }
}

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

export class ShaderSourceTypes {
    static vert: string = "vertex";
    static frag: string = "fragment";
};

export class ShaderSource {
    static shaders: any = {};
    static shaderWithParams(shaderName: string, paramDict: { [id: string]: any; } = {}): string {
        var keys: string[] = Object.keys(paramDict);
        var ss: ShaderSource = ShaderSource.shaders[shaderName];
        var src: string = ss.source;
        var exp = ss.getExpectedParams();
        for (var j: number = 0; j < exp.length; j++) {
            if (keys.includes(exp[j])) {
                var pName: string = keys[keys.indexOf(exp[j])];
                src = src.replace("$" + pName.toString() + "$", paramDict[pName.toString()].toString());
            } else {
                src = src.replace("$" + exp[j].toString() + "$", ss.params[exp[j]].toString());
            }
        }
        return src;
    }
    static getShader(name: string): ShaderSource {
        return ShaderSource.shaders[name];
    }
    static getAllShaderNames(): string[] {
        return Object.keys(ShaderSource.shaders);
    }

    source: string;
    type: string;
    params: any[];
    constructor(paramDict: any, type: string, name: string, src: string) {
        this.params = paramDict;
        this.source = src;
        this.type = type;
        ShaderSource.shaders[name] = this;
    }
    getExpectedParams(): string[] {
        return Object.keys(this.params);
    }
}

export class Vert {
    static tSize: number = 17;

    p: Vec3; // 4
    t: Vec2; // 3
    rgb: Vec3 = new Vec3(1, 1, 1); // 4
    n: Vec3; // 3
    tan: Vec3; // 3

    constructor(point: Vec3 = new Vec3(), UV: Vec2 = new Vec2(), rgb: Vec3 = new Vec3(1, 1, 1), normal: Vec3 = new Vec3()) {
        this.p = point;
        this.t = UV;
        this.rgb = rgb;
        this.n = normal;
    }
}

export class Tri {
    v: Vert[];

    constructor(points: Vert[] = [new Vert(), new Vert(), new Vert()]) {
        this.v = [points[0], points[1], points[2]];
    }
}

export class Material {
    diffuseTexture: WebGLTexture;
    specularTexture: WebGLTexture;
    normalTexture: WebGLTexture;
    parallaxTexture: WebGLTexture = gl.NONE;
    hasNormalTexture: boolean = false;
    hasParallaxTexture: boolean = false;
    shininess: number = 0.5;
    parallaxScale: number = 0;
    constructor(diffuseTexture: WebGLTexture = gl.NONE, specularTexture: WebGLTexture = gl.NONE, normalTexture: WebGLTexture = gl.NONE, shininess: number = 0.5) {
        this.diffuseTexture = diffuseTexture;
        this.specularTexture = specularTexture;
        this.normalTexture = normalTexture;
        this.shininess = shininess;
    }
}

export class ReferenceMaterial {
    diffuseTexture: WebGLTexture = gl.NONE;
    specularTexture: WebGLTexture = gl.NONE;
    normalTexture: WebGLTexture = gl.NONE;
    parallaxTexture: WebGLTexture = gl.NONE;
    hasNormalTexture: boolean = false;
    hasParallaxTexture: boolean = false;
}

export class Position3D {
    position: Vec3;
    rotation: Vec3;

    constructor(position: Vec3 = new Vec3(), rotation: Vec3 = new Vec3()) {
        this.position = position;
        this.rotation = rotation;
    }
}

export class Camera3D extends Position3D {
    /**
     * The field of view of the camera.
     */
    FOV: number;
    /**
     * The near clip distance of the camera.
     */
    clipNear: number;
    /**
     * The far clip distance of the camera.
     */
    clipFar: number;
    /**
     * Creates a new camera.
     * 
     * @param fov the field of view.
     * @param clipNear the near clip distance.
     * @param clipFar the far clip distance.
     */
    constructor(fov: number = 75, clipNear: number = 0.1, clipFar: number = 500) {
        super();
        this.FOV = fov;
        this.clipNear = clipNear;
        this.clipFar = clipFar;
    }
    /**
     * 
     * @returns a vector repersenting the direction the camera is looking.
     */
    lookVector(): Vec3 {
        var target: Vec3 = new Vec3(0, 0, 1);
        var up: Vec3 = new Vec3(0, 1, 0);
        var mRotation: Mat4 = Mat4.mul(Mat4.mul(Mat4.rotationX(this.rotation.x), Mat4.rotationY(this.rotation.y)), Mat4.rotationZ(this.rotation.z));
        target = Vec3.mulMat(target, mRotation);
        return target;
    }
    /**
     * 
     * @returns the perspective projection matrix of the camera.
     */
    perspective(): Mat4 {
        return Mat4.perspective(this.FOV, IngeniumWeb.window.aspectRatio, this.clipNear, this.clipFar);
    }
    /**
     * 
     * @returns the camera transformation matrix.
     */
    cameraMatrix(): Mat4 {
        var vUp: Vec3 = new Vec3(0, 1, 0);
        var vTarget: Vec3 = new Vec3(0, 0, 1);
        var matCameraRotY: Mat4 = Mat4.rotationY(this.rotation.y);
        var matCameraRotX: Mat4 = Mat4.rotationX(this.rotation.x);
        var matCameraRotZ: Mat4 = Mat4.rotationZ(this.rotation.z);
        var camRot: Vec3 = Vec3.mulMat(vTarget, Mat4.mul(Mat4.mul(matCameraRotX, matCameraRotY), matCameraRotZ));
        vTarget = Vec3.add(this.position, camRot);
        var matCamera: Mat4 = Mat4.pointedAt(this.position, vTarget, vUp);
        return matCamera;
    }
    /**
     * Basic movement controls for debugging.
     * 
     * @param speed the speed of the camera.
     * @param cameraMoveSpeed the rotation speed of the camera.
     */
    stdControl(speed: number = 1, cameraMoveSpeed: number = 1): void {
        var p3d: Position3D = Camera3D.stdController(this, this, speed, cameraMoveSpeed);
        this.position = p3d.position;
        this.rotation = p3d.rotation;
    }
    /**
     * Standard controls applied to a seperate position.
     * 
     * @param cam the camera.
     * @param pos the position.
     * @param speed the speed.
     * @param cameraMoveSpeed the rotation speed.
     * @returns an updated 3D position.
     */
    static stdController(cam: Camera3D, pos: Position3D, speed: number = 1, cameraMoveSpeed: number = 1): Position3D {
        var cLV: Vec3 = cam.lookVector();
        var p3: Position3D = pos;

        var forward: Vec3 = new Vec3();
        var up: Vec3 = new Vec3(0, 1, 0);
        var rotate: Vec3 = new Vec3();
        if (Input.getKeyState('w'))
            forward = Vec3.add(forward, cLV);
        if (Input.getKeyState('s'))
            forward = Vec3.mulFloat(Vec3.add(forward, cLV), -1);
        if (Input.getKeyState('d'))
            forward = Vec3.add(forward, Vec3.cross(cLV, up));
        if (Input.getKeyState('a'))
            forward = Vec3.add(forward, Vec3.mulFloat(Vec3.cross(cLV, up), -1));
        if (Input.getKeyState('q') || Input.getKeyState(' '))
            forward.y = forward.y + 1;
        if (Input.getKeyState('e'))
            forward.y = forward.y - 1;

        if (Input.getKeyState('ArrowLeft'))
            rotate.y = -cameraMoveSpeed;
        if (Input.getKeyState('ArrowRight'))
            rotate.y = cameraMoveSpeed;
        if (Input.getKeyState('ArrowUp'))
            rotate.x = -cameraMoveSpeed;
        if (Input.getKeyState('ArrowDown'))
            rotate.x = cameraMoveSpeed;
        // if (Input.getKeyState('Shift') || Input.getKeyState('ShiftLeft'))
        //     speed *= 5;

        p3.rotation = Vec3.add(p3.rotation, Vec3.mulFloat(rotate, Time.deltaTime));
        p3.position = Vec3.add(p3.position, Vec3.mulFloat(Vec3.normalize(forward), speed * Time.deltaTime));

        if (p3.rotation.x >= Rotation.degToRad(87)) p3.rotation.x = Rotation.degToRad(87);
        if (p3.rotation.x <= -Rotation.degToRad(87)) p3.rotation.x = -Rotation.degToRad(87);
        if (Math.abs(p3.rotation.y) >= Rotation.degToRad(360)) p3.rotation.y = 0;
        if (Math.abs(p3.rotation.z) >= Rotation.degToRad(360)) p3.rotation.z = 0;
        return p3;
    }
}

var loadedImages: { [id: string]: HTMLImageElement } = {};
var loadedGeometry: { [id: string]: Geometry } = {};
var loadedReferenceTextures: { [id: string]: WebGLTexture } = {};
var loadedReferenceGeometry: { [id: string]: ReferenceGeometry } = {};

/**
 * A 3D object.
 */
export class Mesh3D extends Position3D {

    /**
     * Relative point the mesh rotates around.
     */
    rotationCenter: Vec3;
    /**
     * The scale of the mesh.
     */
    scale: Vec3;
    /**
     * The material of the mesh.
     */
    material: Material;
    /**
     * Whether the mesh has been loaded to the GPU.
     */
    loaded: boolean;
    /**
     * The vertex buffer location of the mesh data on the GPU.
     */
    mVBO: WebGLBuffer;
    /**
     * The vertex array location of the mesh data on the GPU.
     */
    mVAO: WebGLVertexArrayObject;
    /**
     * The loaded float vertex data of the mesh.
     */
    data: number[];
    /**
     * The tint of the mesh.
     */
    tint: Vec3 = new Vec3(1, 1, 1);
    /**
     * The number of triangles in the mesh
     */
    triangles: number = 0;
    /**
     * Whether to check the geometry reference cache.
     */
    useGeometryReferenceCache: boolean = false;
    /**
    * Whether to check the texture reference cache.
    */
    useTextureReferenceCache: boolean = true;
    /**
     * Creates a new mesh.
     * 
     * @param position the position of the mesh.
     * @param rotation  the rotation of the mesh.
     * @param rotationCenter the rotation center of the mesh.
     * @param scale the scale of the mesh
     * @param material the material of the mesh
     */
    constructor(position: Vec3 = new Vec3(), rotation: Vec3 = new Vec3(), rotationCenter: Vec3 = new Vec3(), scale: Vec3 = new Vec3(1, 1, 1), material: Material = new Material()) {
        super(position, rotation);
        this.rotationCenter = rotationCenter;
        this.scale = scale;
        this.material = material;
        this.loaded = false;
        this.mVBO = gl.NONE;
        this.mVAO = gl.NONE;
        this.data = [];
    }
    /**
     * Loads the textures and obj file to the GPU.
     * 
     * @param objPath the path to the obj file
     * @param diffTexPath the path to the diffuse texture
     * @param specTexPath the path to the specular texture
     * @param normalPath the path to the normal texture
     * @param parallaxPath the path to the parallax texture
     */
    make(objPath: string, diffTexPath: string = "NONE", specTexPath: string = "NONE",
        normalPath: string = "NONE", parallaxPath = "NONE") {
        if (this.useGeometryReferenceCache && Object.keys(loadedReferenceGeometry).includes(objPath)) {
            var geom: ReferenceGeometry = loadedReferenceGeometry[objPath];
            this.mVBO = geom.VBO;
            this.mVAO = geom.VAO;
            this.triangles = geom.triangles;
            this.loaded = true;
        } else if (Object.keys(loadedGeometry).includes(objPath)) {
            this.loadFromObjData(loadedGeometry[objPath].data);
        } else {
            var obGeometry: Geometry = new Geometry(Utils.loadFile(objPath), "USER_GEOMETRY");
            loadedGeometry[objPath] = obGeometry;
            this.loadFromObjData(obGeometry.data);
        }
        this.setTexture(diffTexPath, specTexPath, normalPath, parallaxPath);
        this.load();
        if (!Object.keys(loadedReferenceGeometry).includes(objPath)) {
            var refG: ReferenceGeometry = new ReferenceGeometry();
            refG.VBO = this.mVBO;
            refG.VAO = this.mVAO;
            refG.triangles = this.triangles;
            loadedReferenceGeometry[objPath] = refG;
        }
    }
    /**
     * Populates the data of the mesh.
     * 
     * @param raw the raw obj data
     */
    loadFromObjData(raw: string): void {
        var verts: Vec3[] = [];
        var normals: Vec3[] = [];
        var texs: Vec2[] = [];
        var lines: string[] = raw.split("\n");

        var hasNormals: boolean = raw.includes("vn");
        var hasTexture: boolean = raw.includes("vt");

        for (var i = 0; i < lines.length; i++) {
            var line: string = lines[i];
            if (line[0] == 'v') {
                if (line[1] == 't') {
                    var v: Vec2 = new Vec2();
                    var seg: string[] = line.split(" ");
                    v.x = parseFloat(seg[1]);
                    v.y = parseFloat(seg[2]);
                    texs.push(v);
                }
                else if (line[1] == 'n') {
                    var normal: Vec3 = new Vec3();
                    var seg: string[] = line.split(" ");
                    normal.x = parseFloat(seg[1]);
                    normal.y = parseFloat(seg[2]);
                    normal.z = parseFloat(seg[3]);
                    normals.push(normal);
                }
                else {
                    var ve: Vec3 = new Vec3();
                    var seg: string[] = line.split(" ");
                    ve.x = parseFloat(seg[1]);
                    ve.y = parseFloat(seg[2]);
                    ve.z = parseFloat(seg[3]);
                    verts.push(ve);
                }
            }
            if (line[0] == 'f') {
                var params: number = 1;
                if (hasNormals)
                    params++;
                if (hasTexture)
                    params++

                var vals = [];
                var seg: string[] = line.replace("f", "").split(/[\/\s]+/g);

                for (var l: number = 1; l < seg.length; l++)
                    vals.push(parseInt(seg[l]));

                var push: Tri = new Tri();
                for (var k: number = 0; k < 3; k++) {
                    push.v[k].p = verts[vals[params * k] - 1];
                    if (hasTexture)
                        push.v[k].t = texs[vals[(params * k) + 1] - 1];
                    if (hasNormals && !hasTexture)
                        push.v[k].n = normals[vals[(params * k) + 1] - 1];
                    if (hasNormals && hasTexture)
                        push.v[k].n = normals[vals[(params * k) + 2] - 1];
                }

                this.addTriangle(push);
            }
        }
    }
    /**
     * Adds the data from a triangle to the data array.
     * 
     * @param triangle the triangle to add.
     */
    addTriangle(triangle: Tri): void {
        var tangent: Vec3[] = Mesh3D.calcTangents(triangle); // Calculate tangent and bittangent
        for (var i = 0; i < 3; i++) {
            this.data.push(triangle.v[i].p.x);
            this.data.push(triangle.v[i].p.y);
            this.data.push(triangle.v[i].p.z);
            this.data.push(triangle.v[i].p.w);

            this.data.push(triangle.v[i].t.x);
            this.data.push(triangle.v[i].t.y);
            this.data.push(triangle.v[i].t.w);

            this.data.push(triangle.v[i].rgb.x + this.tint.x);
            this.data.push(triangle.v[i].rgb.y + this.tint.y);
            this.data.push(triangle.v[i].rgb.z + this.tint.z);
            this.data.push(triangle.v[i].rgb.w);

            this.data.push(triangle.v[i].n.x);
            this.data.push(triangle.v[i].n.y);
            this.data.push(triangle.v[i].n.z);

            this.data.push(tangent[0].x);
            this.data.push(tangent[0].y);
            this.data.push(tangent[0].z);
        }
        this.triangles++;
    }
    /**
     * Loads a texture to the GPU from the specified path.
     * 
     * @param path the path to the texture.
     * @param texSlot the texture slot to use.
     * @param useRefCache whether to use the texture reference texture cache.
     * @param wrap the wrap type of the texture.
     * @param minFilter the min filter type of the texture.
     * @param magFilter the mag filter type of the texture.
     * @returns the texture location on the GPU.
     */
    createTextureFromPath(path: string, texSlot: number = gl.TEXTURE0, useRefCache: boolean, wrap: number[] = [gl.REPEAT, gl.REPEAT],
        minFilter: number = gl.LINEAR_MIPMAP_LINEAR, magFilter: number = gl.LINEAR): WebGLTexture {

        if (useRefCache && Object.keys(loadedReferenceTextures).includes(path)) {
            return loadedReferenceTextures[path];
        }

        var tex: WebGLTexture = gl.NONE;
        tex = gl.createTexture();
        gl.activeTexture(texSlot);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([1, 1, 1, 255]));

        if (path != "NONE") {
            var image: HTMLImageElement;
            if (Object.keys(loadedImages).includes(path) && loadedImages[path].complete) {
                image = loadedImages[path];
                gl.activeTexture(texSlot);
                gl.bindTexture(gl.TEXTURE_2D, tex);

                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap[0]);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap[1]);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter);

                gl.generateMipmap(gl.TEXTURE_2D);
            } else {
                image = new Image();
                image.src = path;
                loadedImages[path] = image;
                image.addEventListener('load', function () {
                    gl.activeTexture(texSlot);
                    gl.bindTexture(gl.TEXTURE_2D, tex);

                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap[0]);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap[1]);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter);

                    gl.generateMipmap(gl.TEXTURE_2D);
                })
            };
        }
        if (!Object.keys(loadedReferenceTextures).includes(path))
            return (loadedReferenceTextures[path] = tex);
        return tex;
    }
    /**
     * Sets the textures of the mesh.
     * 
     * @param diffusePath the path to the diffuse texture
     * @param specularPath the path to the specular texture
     * @param normalPaththe path to the normal texture
     * @param parallaxPath the path to the parallax texture
     */
    setTexture(diffusePath: string, specularPath: string = "NONE", normalPath: string = "NONE",
        parallaxPath: string = "NONE"): void {
        this.material.diffuseTexture = this.createTextureFromPath(diffusePath, gl.TEXTURE0, this.useTextureReferenceCache);
        this.material.specularTexture = this.createTextureFromPath(specularPath, gl.TEXTURE1, this.useTextureReferenceCache);
        this.material.normalTexture = this.createTextureFromPath(normalPath, gl.TEXTURE2, this.useTextureReferenceCache);
        this.material.parallaxTexture = this.createTextureFromPath(specularPath, gl.TEXTURE3, this.useTextureReferenceCache);
        this.material.hasNormalTexture = normalPath != "NONE";
        this.material.hasParallaxTexture = parallaxPath != "NONE";
    }
    /**
     * Creates a model transformation matrix based on the scale, rotation, and position of the mesh.
     * @returns the model transformation matrix.
     */
    modelMatrix(): Mat4 {
        var matRot: Mat4 = Mat4.rotationOnPoint(this.rotation.x, this.rotation.y, this.rotation.z, this.rotationCenter);
        var matTrans: Mat4 = Mat4.translation(this.position.x, this.position.y, this.position.z);
        var matScale: Mat4 = Mat4.scale(this.scale.x, this.scale.y, this.scale.z);
        var matWorld: Mat4 = Mat4.mul(Mat4.mul(matScale, matRot), matTrans);
        return matWorld;
    }
    /**
     * Loads the data in the data array to the GPU.
     * 
     * @param drawType the access type of the data on the GPU.
     */
    load(drawType: number = gl.DYNAMIC_DRAW): void {
        if (!this.loaded) {
            this.mVBO = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.mVBO);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.data), drawType);

            this.mVAO = gl.createVertexArray();
            gl.bindVertexArray(this.mVAO);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.mVBO);

            var size: number = Vert.tSize;

            var floatSize: number = 4;
            var stride: number = size * floatSize; // Num of array elements resulting from a Vert

            gl.vertexAttribPointer(0, 4, gl.FLOAT, false, stride, 0); // Vertex data
            gl.enableVertexAttribArray(0);

            gl.vertexAttribPointer(1, 3, gl.FLOAT, false, stride, 4 * floatSize); // UV data
            gl.enableVertexAttribArray(1);

            gl.vertexAttribPointer(2, 4, gl.FLOAT, false, stride, 7 * floatSize); // RGB tint data
            gl.enableVertexAttribArray(2);

            gl.vertexAttribPointer(3, 4, gl.FLOAT, false, stride, 11 * floatSize); // Normal data
            gl.enableVertexAttribArray(3);

            gl.vertexAttribPointer(4, 3, gl.FLOAT, false, stride, 14 * floatSize); // Tangent data
            gl.enableVertexAttribArray(4);

            gl.bindBuffer(gl.ARRAY_BUFFER, null); // Unbind buffer

            this.loaded = true;
        }
    }
    /**
     * Calculates the tangent and bitangent of the input triangle.
     * 
     * @param triangle the triangle.
     * @returns the tangent and bitangent in a vector array.
     */
    static calcTangents(triangle: Tri): Vec3[] {
        var edge1: Vec3 = Vec3.sub(triangle.v[1].p, triangle.v[0].p);
        var edge2: Vec3 = Vec3.sub(triangle.v[2].p, triangle.v[0].p);
        var dUV1: Vec2 = Vec2.sub(triangle.v[1].t, triangle.v[0].t);
        var dUV2: Vec2 = Vec2.sub(triangle.v[2].t, triangle.v[0].t);

        var f: number = 1.0 / (dUV1.x * dUV2.y - dUV2.x * dUV1.y);

        var tan: Vec3 = new Vec3();

        tan.x = f * (dUV2.y * edge1.x - dUV1.y * edge2.x);
        tan.y = f * (dUV2.y * edge1.y - dUV1.y * edge2.y);
        tan.z = f * (dUV2.y * edge1.z - dUV1.y * edge2.z);

        var bitTan: Vec3 = new Vec3();
        bitTan.x = f * (-dUV2.x * edge1.x + dUV1.x * edge2.x);
        bitTan.y = f * (-dUV2.x * edge1.y + dUV1.x * edge2.y);
        bitTan.z = f * (-dUV2.x * edge1.z + dUV1.x * edge2.z);

        return [tan, bitTan];
    }
    /**
     * Renders meshes.
     * 
     * @param shader the shader to use.
     * @param camera the camera to use.
     * @param meshes the meshes to render.
     * @param dirLight the directional light to use.
     * @param pointLights the point lights to use.
     */
    static renderAll(shader: Shader, camera: Camera3D, meshes: Mesh3D[], dirLight: DirectionalLight, pointLights: PointLight[] = []) {
        shader.use();
        shader.setUInt("material.diffuse", 0);
        shader.setUInt("material.specular", 1);
        shader.setUInt("material.normal", 2);
        shader.setUInt("material.parallax", 3);
        shader.setUFloat("u_time", (Date.now() - IngeniumWeb.startTime) / 1000);
        shader.setUMat4("view", Mat4.inverse(camera.cameraMatrix()));
        shader.setUVec3("viewPos", camera.position);
        shader.setUMat4("projection", camera.perspective());

        shader.setUVec3("dirLight.direction", dirLight.direction);
        shader.setUVec3("dirLight.ambient", dirLight.ambient);
        shader.setUVec3("dirLight.specular", dirLight.specular.mulFloat(dirLight.intensity));
        shader.setUVec3("dirLight.diffuse", dirLight.diffuse.mulFloat(dirLight.intensity));


        for (var j: number = 0; j < pointLights.length; j++) {
            shader.setUVec3("pointLights[" + j + "].position", pointLights[j].position);
            shader.setUVec3("pointLights[" + j + "].ambient", pointLights[j].ambient);
            shader.setUVec3("pointLights[" + j + "].diffuse", Vec3.mulFloat(pointLights[j].diffuse, pointLights[j].intensity));
            shader.setUVec3("pointLights[" + j + "].specular", Vec3.mulFloat(pointLights[j].specular, pointLights[j].intensity));
            shader.setUFloat("pointLights[" + j + "].constant", pointLights[j].constant);
            shader.setUFloat("pointLights[" + j + "].linear)", pointLights[j].linear);
            shader.setUFloat("pointLights[" + j + "].quadratic", pointLights[j].quadratic);
        }

        for (var i: number = 0; i < meshes.length; i++) {
            gl.bindVertexArray(meshes[i].mVAO);

            var model: Mat4 = meshes[i].modelMatrix();
            shader.setUMat4("model", model);
            shader.setUBool("hasNormalTexture", meshes[i].material.hasNormalTexture);
            shader.setUBool("hasParallaxTexture", meshes[i].material.hasParallaxTexture);
            shader.setUMat4("invModel", Mat4.inverse(model));
            shader.setUFloat("material.shininess", meshes[i].material.shininess);
            shader.setUFloat("heightScale", meshes[i].material.parallaxScale);
            shader.setUVec4("meshTint", meshes[i].tint);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, meshes[i].material.diffuseTexture);
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, meshes[i].material.specularTexture)
            gl.activeTexture(gl.TEXTURE2);
            gl.bindTexture(gl.TEXTURE_2D, meshes[i].material.normalTexture);

            var verts = meshes[i].triangles * 3;
            gl.drawArrays(gl.TRIANGLES, 0, verts);
        }
    }
}

export class Light {
    /**
    * The intensity of the light.
    */
    intensity: number;
    /**
     * The ambient light value.
     */
    ambient: Vec3;
    /**
    * The diffuse light value.
    */
    diffuse: Vec3;
    /**
    * The specular light value.
    */
    specular: Vec3;
    /**
     * Creates a new light.
     * 
     * @param ambient the ambient light value.
     * @param diffuse the diffuse light value.
     * @param specular the specular light value.
     * @param intensity the intensity of the light.
     */
    constructor(ambient: Vec3, diffuse: Vec3, specular: Vec3, intensity: number) {
        this.ambient = ambient;
        this.diffuse = diffuse;
        this.specular = specular;
        this.intensity = intensity;
    }
}

export class PointLight extends Light {
    /**
     * The position of the light.
     */
    position: Vec3;
    /**
     * The constant in the light attentuation equation.
     */
    constant: number = 1;
    /**
     * The linear coefficient in the light attentuation equation.
     */
    linear: number = 0.09;
    /**
    * The quadratic coefficient in the light attentuation equation.
    */
    quadratic: number = 0.032;
    /**
     * Creates a new point light.
     * 
     * @param ambient the ambient light value.
     * @param diffuse the diffuse light value.
     * @param specular the specular light value.
     * @param direction the direction the light comes from.
     * @param intensity the intensity of the light.
     */
    constructor(ambient: Vec3 = new Vec3(0.05, 0.05, 0.05),
        diffuse: Vec3 = new Vec3(0.8, 0.8, 0.8),
        specular: Vec3 = new Vec3(0.2, 0.2, 0.2),
        position: Vec3 = new Vec3(), intensity: number = 1) {
        super(ambient, diffuse, specular, intensity);
        this.position = position;
    }
}

export class DirectionalLight extends Light {
    /**
     * The direction of the light.
     */
    direction: Vec3;
    /**
     * Creates a new directional light.
     * 
     * @param ambient the ambient light value.
     * @param diffuse the diffuse light value.
     * @param specular the specular light value.
     * @param direction the direction the light comes from.
     * @param intensity the intensity of the light.
     */
    constructor(ambient: Vec3 = new Vec3(0.05, 0.05, 0.05),
        diffuse: Vec3 = new Vec3(0.8, 0.8, 0.8),
        specular: Vec3 = new Vec3(0.2, 0.2, 0.2),
        direction: Vec3 = new Vec3(0, -1, 0.2), intensity: number = 1) {
        super(ambient, diffuse, specular, intensity);
        this.direction = direction;
    }
}

export class Geometry {
    /**
     * The name of the geometry.
     */
    name: string;
    /**
     * The .obj raw data of the geometry.
     */
    data: string;
    /**
     * Creates a new geometry object.
     * 
     * @param data The .obj raw data of the geometry.
     * @param name The name of the geometry.
     */
    constructor(data: string, name: string = "NONE") {
        this.data = data;
        this.name = name;
    }

    /**
    * 
    * @returns the geometry of a 3D cube.
    */
    static makeCube() {
        return new Geometry(cubeData, "Default Cube");
    }
}

export class ReferenceGeometry {
    /**
     * The vertex buffer.
     */
    VBO: WebGLBuffer;
    /**
     * The vertex array.
     */
    VAO: WebGLVertexArrayObject;
    /**
     * The number of triangles.
     */
    triangles: number;
}

var cubeData: string = "v -1.000000 1.000000 -1.000000\nv 1.000000 1.000000 1.000000\nv 1.000000 1.000000 -1.000000\nv -1.000000 -1.000000 1.000000\nv 1.000000 -1.000000 1.000000\nv -1.000000 1.000000 1.000000\nv -1.000000 -1.000000 -1.000000\nv 1.000000 -1.000000 -1.000000\nvt 1.000000 0.000000\nvt 0.666667 0.333333\nvt 0.666667 0.000000\nvt 0.333333 0.333333\nvt 0.000000 0.000000\nvt 0.333333 0.000000\nvt 0.333333 0.666667\nvt 0.000000 0.333333\nvt 0.333333 0.333333\nvt 0.666667 0.000000\nvt 0.333333 0.000000\nvt 0.666667 0.666667\nvt 0.333333 0.333333\nvt 0.666667 0.333333\nvt 0.333333 1.000000\nvt 0.000000 0.666667\nvt 0.333333 0.666667\nvt 1.000000 0.333333\nvt 0.000000 0.333333\nvt 0.000000 0.666667\nvt 0.666667 0.333333\nvt 0.333333 0.666667\nvt 0.000000 1.000000\nvn 0.0000 1.0000 0.0000\nvn 0.0000 -0.0000 1.0000\nvn -1.0000 0.0000 0.0000\nvn 0.0000 -1.0000 -0.0000\nvn 1.0000 0.0000 0.0000\nvn 0.0000 0.0000 -1.0000\ns off\nf 1/1/1 2/2/1 3/3/1\nf 2/4/2 4/5/2 5/6/2\nf 6/7/3 7/8/3 4/9/3\nf 8/10/4 4/9/4 7/11/4\nf 3/12/5 5/13/5 8/14/5\nf 1/15/6 8/16/6 7/17/6\nf 1/1/1 6/18/1 2/2/1\nf 2/4/2 6/19/2 4/5/2\nf 6/7/3 1/20/3 7/8/3\nf 8/10/4 5/21/4 4/9/4\nf 3/12/5 2/22/5 5/13/5\nf 1/15/6 3/23/6 8/16/6";

export class Utils {
    /**
     * Loads the string data of a file.
     * 
     * @param filePath the path to the file.
     * @returns the string data of the file, or null if the file isn't found.
     */
    static loadFile(filePath: string): string | null {
        var result = null;
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET", filePath, false);
        xmlhttp.send();
        if (xmlhttp.status == 200) {
            result = xmlhttp.responseText;
        } else {
            console.error("XMLHTTP error (", filePath, "): ", xmlhttp.status);
        }
        return result;
    }
}