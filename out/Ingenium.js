"use strict";
/**
 * The OpenGL object of the program.
 */
export let gl;
/**
 * Automatic input manager.
 */
export class Input {
    /**
     * Initializes the input system.
     */
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
    /**
     *
     * @param key the key to check for.
     * @returns whether the key is currently pressed.
     */
    static getKeyState(key) {
        return (Input.keys[key] === undefined ? false : Input.keys[key]);
    }
}
/**
 * Dictionary of keys.
 */
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
        Time.deltaTime = (Date.now() - Time.lastFrame) / 1000;
        Time.lastFrame = Date.now();
    }
    static updateFixedDeltaTime() {
        Time.fixedDeltaTime = (Date.now() - Time.lastFixedFrame) / 1000;
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
    static deltaTimeToFPS(delta) {
        return (1 / delta);
    }
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
    }
    ;
    sizeToWindow(aspect) {
        aspect = 1 / aspect;
        let win_width = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
        let win_height = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
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
            FrameBuffer.bindDefault();
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        }
    }
    setGL() {
        gl = this.canvas.getContext(IngeniumWeb.glVersion);
    }
    setClearColour(hex, alpha) {
        gl.clearDepth(1.0);
        let r = (hex & 0xFF0000) >> 16;
        let g = (hex & 0x00FF00) >> 8;
        let b = (hex & 0x0000FF);
        gl.clearColor(r / 255, g / 255, b / 255, alpha);
        let col = {
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
/**
 * A set of methods to be executed by Ingenium Web.
 */
export class Scene {
    /**
     *
     * @param onCreate the function executed when the scene is created.
     * @param onUpdate the function executed when the scene is updated.
     * @param onClose the function executed when the scene is closed.
     * @param onFixedUpdate the function executed when the scene is updated on the fixed loop.
     */
    constructor(onCreate = function () { }, onUpdate = function () { }, onClose = function () { }, onFixedUpdate = function () { }) {
        this.onCreate = onCreate;
        this.onClose = onClose;
        this.onUpdate = onUpdate;
        this.onFixedUpdate = onFixedUpdate;
    }
}
export class IngeniumWeb {
    /**
     * Starts the engine.
     *
     * @param scenes the scenes to use.
     * @param onCreate the global creation function.
     * @param onUpdate the global update function.
     * @param onClose the global closing function.
     * @param onFixedUpdate the global fixed update function.
     * @param webGL the WebGl version to use.
     */
    static start(scenes, onCreate = function () { }, onUpdate = function () { }, onClose = function () { }, onFixedUpdate = function () { }, webGL = "webgl2") {
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
    static defaultSetup() {
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.BLEND);
        gl.enable(gl.DEPTH_TEST);
        gl.depthMask(true);
        gl.depthFunc(gl.LEQUAL);
        gl.depthRange(0.0, 1.0);
        // gl.enable(gl.CULL_FACE);
        // gl.cullFace(gl.BACK);
    }
}
IngeniumWeb.scenes = [];
IngeniumWeb.currentScene = 0;
IngeniumWeb.startTime = 0;
;
/**
 * An approximation of PI (355 / 113);
 */
export let PI = 355 / 113;
/**
 * A 2 component vector with a third w component.
 */
export class Vec2 {
    /**
     * Creates a new two component vector with a w component.
     *
     * @param x the x component of the vector.
     * @param y the y component of the vector.
     * @param w the w component of the vector.
     */
    constructor(x = 0, y = 0, w = 1) {
        /**
        * The x component of the vector.
        */
        this.x = 0;
        /**
         * The y component of the vector.
         */
        this.y = 0;
        /**
         * The w component of the vector.
         */
        this.w = 1;
        this.x = x;
        this.y = y;
        this.w = w;
    }
    /**
     *
     * @param num the number to fill the vector with.
     * @returns a vector filled with num.
     */
    static filledWith(num) {
        return new Vec2(num, num);
    }
    /**
     * Subtracts 2 vectors.
     *
     * @param v1 the first vector.
     * @param v2 the second vector.
     * @returns the difference of the passed vectors.
     */
    static sub(v1, v2) {
        return new Vec2(v1.x - v2.x, v1.y - v2.y);
    }
    /**
     * Adds 2 vectors.
     *
     * @param v1 the first vector.
     * @param v2 the second vector.
     * @returns the sum of the passed vectors.
     */
    static add(v1, v2) {
        return new Vec2(v1.x + v2.x, v1.y + v2.y);
    }
    /**
     * Multiplies 2 vectors.
     *
     * @param v1 the first vector.
     * @param v2 the second vector.
     * @returns the product of the passed vectors.
     */
    static mul(v1, v2) {
        return new Vec2(v1.x * v2.x, v1.y * v2.y);
    }
    /**
     * Divides 2 vectors.
     *
     * @param v1 the first vector.
     * @param v2 the second vector.
     * @returns the quotient of the passed vectors.
     */
    static div(v1, v2) {
        return new Vec2(v1.x / v2.x, v1.y / v2.y);
    }
    /**
     * Multiplies all components of the vector by the passed number.
     *
     * @param v1 the vector.
     * @param float the number to multiply by.
     * @returns the product.
     */
    static mulFloat(v1, float) {
        return new Vec2(v1.x * float, v1.y * float);
    }
    /**
     * Divides all components of the vector by the passed number.
     *
     * @param v1 the vector.
     * @param float the number to divide by.
     * @returns the quotient.
     */
    static divFloat(v1, float) {
        return new Vec2(v1.x / float, v1.y / float);
    }
    /**
     *
     * @param v a vector.
     * @returns the length of the vector.
     */
    static len(v) {
        return Math.sqrt(v.x * v.x + v.y * v.y);
    }
    /**
     *
     * @param v a vector.
     * @returns the normalized vector.
     */
    static normalize(v) {
        let l = Vec2.len(v);
        return new Vec2(v.x / l, v.y / l);
    }
    /**
     *
     * @param v2 the vector to subtract.
     * @returns the difference.
     */
    sub(v2) {
        return Vec2.sub(this, v2);
    }
    /**
     *
     * @param v2 the vector to add.
     * @returns the sum.
     */
    add(v2) {
        return Vec2.add(this, v2);
    }
    /**
     *
     * @param v2 the vector to multiply by.
     * @returns the product.
     */
    mul(v2) {
        return Vec2.mul(this, v2);
    }
    /**
     *
     * @param v2 the vector to divide by.
     * @returns the quotient.
     */
    div(v2) {
        return Vec2.div(this, v2);
    }
    /**
     * Multiplies all components of the vector by the passed number.
     *
     * @param float the number to multiply by.
     * @returns the product.
     */
    mulFloat(float) {
        return Vec2.mulFloat(this, float);
    }
    /**
     * Divides all components of the vector by the passed number.
     *
     * @param float the number to divide by.
     * @returns the quotient.
     */
    divFloat(float) {
        return Vec2.divFloat(this, float);
    }
    /**
     *
     * @returns the length of the vector.
     */
    len() {
        return Vec2.len(this);
    }
    /**
     *
     * @returns the normalized vector.
     */
    normalized() {
        return Vec2.normalize(this);
    }
}
/**
 * A 3 component vector with a fourth w component.
 */
export class Vec3 {
    /**
     *
     * @param x the x component of the vector.
     * @param y the y component of the vector.
     * @param z the z component of the vector.
     * @param w the w component of the vector.
     */
    constructor(x = 0, y = 0, z = 0, w = 1) {
        /**
         * The x component of the vector.
         */
        this.x = 0;
        /**
         * The y component of the vector.
         */
        this.y = 0;
        /**
         * The z component of the vector.
         */
        this.z = 0;
        /**
         * The w component of the vector.
         */
        this.w = 1;
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }
    /**
     * Creates a new vector with the number as the x, y, and z values.
     *
     * @param num the number to fill the vector with.
     * @returns a filled vector.
     */
    static filledWith(num) {
        return new Vec3(num, num, num);
    }
    /**
     * Subtracts 2 vectors.
     *
     * @param v1 the first vector.
     * @param v2 the second vector.
     * @returns the difference of the passed vectors.
     */
    static sub(v1, v2) {
        return new Vec3(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
    }
    /**
     * Adds 2 vectors.
     *
     * @param v1 the first vector.
     * @param v2 the second vector.
     * @returns the sum of the passed vectors.
     */
    static add(v1, v2) {
        return new Vec3(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
    }
    /**
     * Multiplies 2 vectors.
     *
     * @param v1 the first vector.
     * @param v2 the second vector.
     * @returns the product of the passed vectors.
     */
    static mul(v1, v2) {
        return new Vec3(v1.x * v2.x, v1.y * v2.y, v1.z * v2.z);
    }
    /**
     * Divides 2 vectors.
     *
     * @param v1 the first vector.
     * @param v2 the second vector.
     * @returns the quotient of the passed vectors.
     */
    static div(v1, v2) {
        return new Vec3(v1.x / v2.x, v1.y / v2.y, v1.z / v2.z);
    }
    /**
     * Multiplies all components of the vector by the passed number.
     *
     * @param v1 the vector.
     * @param float the number to multiply by.
     * @returns the product.
     */
    static mulFloat(v1, float) {
        return new Vec3(v1.x * float, v1.y * float, v1.z * float);
    }
    /**
     * Divides all components of the vector by the passed number.
     *
     * @param v1 the vector.
     * @param float the number to divide by.
     * @returns the quotient.
     */
    static divFloat(v1, float) {
        return new Vec3(v1.x / float, v1.y / float, v1.z / float);
    }
    /**
     * Adds the passed number to all components of the vector.
     *
     * @param v1 the vector.
     * @param float the number to add.
     * @returns the sum.
     */
    static addFloat(v1, float) {
        return new Vec3(v1.x + float, v1.y + float, v1.z + float);
    }
    /**
     * Subtracts the passed number from all components of the vector.
     *
     * @param v1 the vector.
     * @param float the number to subtract.
     * @returns the difference.
     */
    static subFloat(v1, float) {
        return new Vec3(v1.x - float, v1.y - float, v1.z - float);
    }
    /**
     *
     * @param v1 the first vector.
     * @param v2 the second vector.
     * @returns the dot product of the passed vectors.
     */
    static dot(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    }
    /**
     *
     * @param v a vector.
     * @returns the length of the vector.
     */
    static len(v) {
        return Math.sqrt(Vec3.dot(v, v));
    }
    /**
     *
     * @param v a vector.
     * @returns the normalized vector.
     */
    static normalize(v) {
        let l = Vec3.len(v);
        if (l != 0)
            return new Vec3(v.x / l, v.y / l, v.z / l);
        return new Vec3();
    }
    /**
     *
     * @param v1 the first vector.
     * @param v2 the second vector.
     * @returns the cross product of the passed vectors.
     */
    static cross(v1, v2) {
        let v = new Vec3();
        v.x = v1.y * v2.z - v1.z * v2.y;
        v.y = v1.z * v2.x - v1.x * v2.z;
        v.z = v1.x * v2.y - v1.y * v2.x;
        return v;
    }
    /**
     *
     * @param i a vector.
     * @param m a 4x4 matrix.
     * @returns the product.
     */
    static mulMat(i, m) {
        let v = new Vec3();
        v.x = i.x * m.m[0][0] + i.y * m.m[1][0] + i.z * m.m[2][0] + i.w * m.m[3][0];
        v.y = i.x * m.m[0][1] + i.y * m.m[1][1] + i.z * m.m[2][1] + i.w * m.m[3][1];
        v.z = i.x * m.m[0][2] + i.y * m.m[1][2] + i.z * m.m[2][2] + i.w * m.m[3][2];
        v.w = i.x * m.m[0][3] + i.y * m.m[1][3] + i.z * m.m[2][3] + i.w * m.m[3][3];
        return v;
    }
    /**
     *
     * @param v the vector to add.
     * @returns a new vector with the sum.
     */
    add(v) {
        return Vec3.add(this, v);
    }
    /**
     *
     * @param v the vector to subtract.
     * @returns a new vector with the difference.
     */
    sub(v) {
        return Vec3.sub(this, v);
    }
    /**
    *
    * @param v the vector to multiply with.
    * @returns a new vector with the product.
    */
    mul(v) {
        return Vec3.mul(this, v);
    }
    /**
     *
     * @param v the vector to divide by.
     * @returns a new vector with the quotient.
     */
    div(v) {
        return Vec3.div(this, v);
    }
    /**
     *
     * @param n the number to multiply with.
     * @returns a new vector with the product.
     */
    mulFloat(n) {
        return Vec3.mulFloat(this, n);
    }
    /**
     *
     * @param n the number to divide by.
     * @returns a new vector with the quotient.
     */
    divFloat(n) {
        return Vec3.divFloat(this, n);
    }
    /**
     *
     * @param n the number to add.
     * @returns a new vector with the sum.
     */
    addFloat(n) {
        return Vec3.addFloat(this, n);
    }
    /**
     *
     * @param n the number to subtract.
     * @returns a new vector with the difference.
     */
    subFloat(n) {
        return Vec3.subFloat(this, n);
    }
    /**
     *
     * @returns the length of the vector.
     */
    len() {
        return Vec3.len(this);
    }
    /**
     *
     * @param mat the 4x4 matrix to multiply by.
     * @returns the product.
     */
    mulMat(mat) {
        return Vec3.mulMat(this, mat);
    }
    /**
     *
     * @returns the vector normalized.
     */
    normalized() {
        return Vec3.normalize(this);
    }
    /**
     *
     * @returns whether the vector has components which are NaN.
     */
    isNaN() {
        return isNaN(this.x) || isNaN(this.y) || isNaN(this.z) || isNaN(this.w);
    }
    /**
     *
     * @param v2 the vector to compare.
     * @returns whether the vectors have equal x, y, and z components.
     */
    equals(v2) {
        return this.x == v2.x && this.y == v2.y && this.z == v2.z;
    }
}
/**
 * Repersents a 2x2 matrix
 */
export class Mat2 {
    constructor(m = [[0, 0], [0, 0]]) {
        this.m = m;
    }
    /**
     *
     * @return the flattened matrix
     */
    flatten() {
        return [this.m[0][0], this.m[0][1], this.m[1][0], this.m[1][1]];
    }
    /**
     *
     * @return the determinant of the matrix
     */
    determinant() {
        return (this.m[0][0] * this.m[1][1]) - (this.m[0][1] * this.m[1][0]);
    }
    /**
     *
     * @return the inverse of the matrix
     */
    inverse() {
        return Mat2.inverse(this);
    }
    mul(mats) {
        let m1 = new Mat2(this.m);
        for (let i = 0; i < mats.length; i++) {
            let m2 = mats[i];
            let matrix = new Mat2();
            for (let c = 0; c < 2; c++)
                for (let r = 0; r < 2; r++)
                    matrix.m[r][c] = m1.m[r][0] * m2.m[0][c] + m1.m[r][1] * m2.m[1][c];
            m1 = matrix;
        }
        return m1;
    }
    /**
     *
     * @param x the x scale
     * @param y the y scale
     * @return the scaling matrix
     */
    static scale(scale) {
        let mat = new Mat2();
        mat.m[0][0] = scale.x;
        mat.m[1][1] = scale.y;
        return mat;
    }
    /**
     *
     * @param radians the clockwise rotation in radians
     * @return the 2D rotation matrix
     */
    static rotation(radians) {
        let mat = new Mat2();
        mat.m[0][0] = Math.cos(radians);
        mat.m[0][1] = Math.sin(radians);
        mat.m[1][0] = -Math.sin(radians);
        mat.m[1][1] = Math.cos(radians);
        return mat;
    }
    /**
     *
     * @return a 2D identity matrix
     */
    static identity() {
        let m = new Mat2();
        m.m[0][0] = 1;
        m.m[1][1] = 0;
        return m;
    }
    /**
     *
     * @return the inverse of the matrix
     */
    static inverse(mat) {
        let determinant = mat.determinant();
        let m = new Mat2();
        m.m[0][0] = mat.m[0][0] / determinant;
        m.m[1][1] = mat.m[1][1] / determinant;
        m.m[1][0] = mat.m[1][0] / determinant;
        m.m[0][1] = mat.m[0][1] / determinant;
        return m;
    }
}
/**
 * A 4x4 matrix.
 */
export class Mat4 {
    /**
     * Creates a new 4x4 matrix.
     */
    constructor() {
        this.m = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
    }
    /**
     * Creates a perspective projection matrix.
     *
     * @param fovDeg the field of view.
     * @param aspectRatio the aspect ratio.
     * @param near the near clip distance.
     * @param far the far clip distance.
     * @returns the perspective projection matrix.
     */
    static perspective(fovDeg, aspectRatio, near, far) {
        let fovRad = 1.0 / Math.tan(Rotation.degToRad(fovDeg * 0.5));
        let matrix = new Mat4();
        matrix.m[0][0] = aspectRatio * fovRad;
        matrix.m[1][1] = fovRad;
        matrix.m[2][2] = far / (far - near);
        matrix.m[3][2] = (-far * near) / (far - near);
        matrix.m[2][3] = 1.0;
        matrix.m[3][3] = 0.0;
        return matrix;
    }
    ;
    /**
     *
     * @param m a matrix.
     * @returns the inverse of the matrix.
     */
    static inverse(m) {
        let matrix = new Mat4();
        matrix.m[0][0] = m.m[0][0];
        matrix.m[0][1] = m.m[1][0];
        matrix.m[0][2] = m.m[2][0];
        matrix.m[0][3] = 0.0;
        matrix.m[1][0] = m.m[0][1];
        matrix.m[1][1] = m.m[1][1];
        matrix.m[1][2] = m.m[2][1];
        matrix.m[1][3] = 0.0;
        matrix.m[2][0] = m.m[0][2];
        matrix.m[2][1] = m.m[1][2];
        matrix.m[2][2] = m.m[2][2];
        matrix.m[2][3] = 0.0;
        matrix.m[3][0] = -(m.m[3][0] * matrix.m[0][0] + m.m[3][1] * matrix.m[1][0] + m.m[3][2] * matrix.m[2][0]);
        matrix.m[3][1] = -(m.m[3][0] * matrix.m[0][1] + m.m[3][1] * matrix.m[1][1] + m.m[3][2] * matrix.m[2][1]);
        matrix.m[3][2] = -(m.m[3][0] * matrix.m[0][2] + m.m[3][1] * matrix.m[1][2] + m.m[3][2] * matrix.m[2][2]);
        matrix.m[3][3] = 1.0;
        return matrix;
    }
    /**
     *
     * @returns an identity matrix.
     */
    static identity() {
        let matrix = new Mat4();
        matrix.m[0][0] = 1.0;
        matrix.m[1][1] = 1.0;
        matrix.m[2][2] = 1.0;
        matrix.m[3][3] = 1.0;
        return matrix;
    }
    /**
     *
     * @param pos the position to start at.
     * @param target the target to point at.
     * @param up the direction to use as up.
     * @returns a matrix that repersents a transformation to point at a position.
     */
    static pointedAt(pos, target, up = new Vec3(0, 1, 0)) {
        let newForward = Vec3.sub(target, pos);
        newForward = Vec3.normalize(newForward);
        let a = Vec3.mulFloat(newForward, Vec3.dot(up, newForward));
        let newUp = Vec3.sub(up, a);
        newUp = Vec3.normalize(newUp);
        let newRight = Vec3.cross(newUp, newForward);
        let matrix = new Mat4();
        matrix.m[0][0] = newRight.x;
        matrix.m[0][1] = newRight.y;
        matrix.m[0][2] = newRight.z;
        matrix.m[0][3] = 0.0;
        matrix.m[1][0] = newUp.x;
        matrix.m[1][1] = newUp.y;
        matrix.m[1][2] = newUp.z;
        matrix.m[1][3] = 0.0;
        matrix.m[2][0] = newForward.x;
        matrix.m[2][1] = newForward.y;
        matrix.m[2][2] = newForward.z;
        matrix.m[2][3] = 0.0;
        matrix.m[3][0] = pos.x;
        matrix.m[3][1] = pos.y;
        matrix.m[3][2] = pos.z;
        matrix.m[3][3] = 1.0;
        return matrix;
    }
    /**
     *
     * @param x the x scale.
     * @param y the y scale.
     * @param z the z scale.
     * @returns a scaling matrix.
     */
    static scale(x = 1, y = 1, z = 1) {
        let matrix = Mat4.identity();
        matrix.m[0][0] = x;
        matrix.m[1][1] = y;
        matrix.m[2][2] = z;
        return matrix;
    }
    /**
     *
     * @param x the x translation.
     * @param y the y translation.
     * @param z the z translation.
     * @returns a translation matrix.
     */
    static translation(x = 0, y = 0, z = 0) {
        let matrix = new Mat4();
        matrix.m[0][0] = 1.0;
        matrix.m[1][1] = 1.0;
        matrix.m[2][2] = 1.0;
        matrix.m[3][3] = 1.0;
        matrix.m[3][0] = x;
        matrix.m[3][1] = y;
        matrix.m[3][2] = z;
        return matrix;
    }
    /**
     *
     * @param m1 the first matrix.
     * @param m2 the second matrix.
     * @returns the product of the matrices.
     */
    static mul(m1, m2) {
        let matrix = new Mat4();
        for (let c = 0; c < 4; c++)
            for (let r = 0; r < 4; r++)
                matrix.m[r][c] = m1.m[r][0] * m2.m[0][c] + m1.m[r][1] * m2.m[1][c] + m1.m[r][2] * m2.m[2][c] + m1.m[r][3] * m2.m[3][c];
        return matrix;
    }
    /**
     *
     * @param xRad the x rotation in radians.
     * @returns a rotation matrix.
     */
    static rotationX(xRad) {
        let matrix = new Mat4();
        matrix.m[0][0] = 1;
        matrix.m[1][1] = Math.cos(xRad);
        matrix.m[1][2] = Math.sin(xRad);
        matrix.m[2][1] = -Math.sin(xRad);
        matrix.m[2][2] = Math.cos(xRad);
        matrix.m[3][3] = 1;
        return matrix;
    }
    /**
     *
     * @param yRad the y rotation in radians.
     * @returns a rotation matrix.
     */
    static rotationY(yRad) {
        let matrix = new Mat4();
        matrix.m[0][0] = Math.cos(yRad);
        matrix.m[0][2] = Math.sin(yRad);
        matrix.m[2][0] = -Math.sin(yRad);
        matrix.m[1][1] = 1;
        matrix.m[2][2] = Math.cos(yRad);
        matrix.m[3][3] = 1;
        return matrix;
    }
    /**
     *
     * @param zRad the z rotation in radians.
     * @returns a rotation matrix.
     */
    static rotationZ(zRad) {
        let matrix = new Mat4();
        matrix.m[0][0] = Math.cos(zRad);
        matrix.m[0][1] = Math.sin(zRad);
        matrix.m[1][0] = -Math.sin(zRad);
        matrix.m[1][1] = Math.cos(zRad);
        matrix.m[2][2] = 1;
        matrix.m[3][3] = 1;
        return matrix;
    }
    /**
     *
     * @param r the rotation in radians.
     * @param pt the point to rotate around.
     * @returns a rotation matrix.
     */
    static rotationOnPoint(r, pt) {
        let mat = Mat4.mul(Mat4.mul(Mat4.translation(pt.x, pt.y, pt.z), Mat4.mul(Mat4.mul(Mat4.rotationX(r.x), Mat4.rotationY(r.y)), Mat4.rotationZ(r.z))), Mat4.translation(-pt.x, -pt.y, -pt.z));
        return mat;
    }
}
/**
 * Contains methods for manipulating rotations.
 */
export class Rotation {
    /**
     * Converts a radian measure to a degree measure.
     *
     * @param rad the radian value.
     * @returns the degree value.
     */
    static radToDeg(rad) {
        return rad * 180 / PI;
    }
    /**
    * Converts a degree measure to a radian measure.
    *
    * @param deg the degree value.
    * @returns the radian value.
    */
    static degToRad(deg) {
        return deg * PI / 180;
    }
}
/**
 * Manage shaders and their uniforms.
 */
export class Shader {
    /**
     * Creates a new shader.
     *
     * @param vertSource the vertex shader source code.
     * @param fragSource the fragment shader source code.
     */
    constructor(vertSource, fragSource) {
        /**
         * The shader program.
         */
        this.program = gl.NONE;
        let vShader = Shader.compile(vertSource, gl.VERTEX_SHADER);
        let fShader = Shader.compile(fragSource, gl.FRAGMENT_SHADER);
        this.program = gl.createProgram();
        gl.attachShader(this.program, vShader);
        gl.attachShader(this.program, fShader);
        gl.linkProgram(this.program);
    }
    /**
     * Compiles shader source code.
     *
     * @param source the shader source code to compile.
     * @param type the shader type.
     * @returns the compiled shader location.
     */
    static compile(source, type, name = "not provided") {
        let shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            let err = {
                type: "SHADER_COMPILE_ERROR",
                id: name,
                shaderInt: type,
                shaderType: (type == gl.VERTEX_SHADER) ? "vertex shader" : "fragment shader",
                error: gl.getShaderInfoLog(shader)
            };
            console.log(err);
            return null;
        }
        return shader;
    }
    /**
     * Sets the shader to be used in rendering.
     */
    use() {
        gl.useProgram(this.program);
    }
    /**
     *
     * @param name the uniform name.
     * @returns the location of the uniform.
     */
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
    setUMat2(name, m) {
        gl.uniformMatrix2fv(this.getULoc(name), false, m.flatten());
    }
}
/**
 * The supported types of shaders.
 */
class ShaderSourceTypes {
    constructor() {
        /**
         * Vertex shader type.
         */
        this.vert = "vertex";
        /**
         * Fragment shader type.
         */
        this.frag = "fragment";
    }
}
;
/**
 * Shader source code manager.
 */
export class ShaderSource {
    /**
     * Creates a new shader source object.
     *
     * @param paramDict the parameter dictionary of the shader with default values.
     * @param type the shader type.
     * @param name the shader name.
     * @param src the shader source code.
     */
    constructor(paramDict, type, name, src) {
        this.params = paramDict;
        this.source = src;
        this.type = type;
        ShaderSource.shaders[name] = this;
    }
    /**
     * Replaces keywords in a shader with others, allowing for more dynamic shaders.
     *
     * @param shaderName the name of the shader.
     * @param paramDict the parameters to pass to the shader.
     * @returns the proper shader source code.
     */
    static shaderWithParams(shaderName, paramDict = {}) {
        let keys = Object.keys(paramDict);
        let ss = ShaderSource.shaders[shaderName];
        let src = ss.source;
        let exp = ss.getExpectedParams();
        for (let j = 0; j < exp.length; j++) {
            if (keys.includes(exp[j])) {
                let pName = keys[keys.indexOf(exp[j])];
                src = src.replace("$" + pName.toString() + "$", paramDict[pName.toString()].toString());
            }
            else {
                src = src.replace("$" + exp[j].toString() + "$", ss.params[exp[j]].toString());
            }
        }
        return src;
    }
    /**
     *
     * @param name the name of the shader.
     * @returns the shader under the passed name.
     */
    static getShader(name) {
        return ShaderSource.shaders[name];
    }
    /**
     *
     * @returns all shader sources loaded.
     */
    static getAllShaderNames() {
        return Object.keys(ShaderSource.shaders);
    }
    /**
     *
     * @returns the parameters that this shader expects.
     */
    getExpectedParams() {
        return Object.keys(this.params);
    }
    /**
     *
     * @param paramDict the parameter dictionary of the shader with default values.
     * @param type the shader type.
     * @param name the shader name.
     * @param src the shader source file path.
     * @returns the shader source object.
     */
    static makeFromFile(paramDict, type, name, srcPath) {
        return new ShaderSource(paramDict, type, name, Utils.loadFile(srcPath));
    }
}
ShaderSource.types = new ShaderSourceTypes();
/**
 * All shaders.
 */
ShaderSource.shaders = {};
/**
 * A vertex in 3D space.
 */
export class Vert3D {
    /**
     * Creates a new vertex.
     *
     * @param point the vertex location.
     * @param UV the vertex UV coordinates.
     * @param rgb the RGB tint of the vertex.
     * @param normal the vertex normal.
     */
    constructor(point = new Vec3(), UV = new Vec2(), rgb = new Vec3(1, 1, 1), normal = new Vec3()) {
        /**
         * The RGB tint of the vertex.
         */
        this.rgb = new Vec3(1, 1, 1); // 4
        this.p = point;
        this.t = UV;
        this.rgb = rgb;
        this.n = normal;
    }
}
/**
 * The number of floats in a processed vertex.
 */
Vert3D.tSize = 17;
export class Vert2D {
    /**
     * Creates a new vertex.
     *
     * @param point the vertex location.
     * @param UV the vertex UV coordinates.
     * @param rgb the RGB tint of the vertex.
     * @param normal the vertex normal.
     */
    constructor(point = new Vec2(), UV = new Vec2()) {
        this.p = point;
        this.t = UV;
    }
}
/**
 * The number of floats in a processed vertex.
 */
Vert2D.tSize = 4;
/**
 * A triangle in 3D space.
 */
export class Tri3D {
    /**
     * Creates a new triangle.
     *
     * @param points the points in the triangle.
     */
    constructor(points = [new Vert3D(), new Vert3D(), new Vert3D()]) {
        this.v = [points[0], points[1], points[2]];
    }
}
export class Tri2D {
    /**
     * Creates a new triangle.
     *
     * @param points the points in the triangle.
     */
    constructor(points = [new Vert2D(), new Vert2D(), new Vert2D()]) {
        this.v = [points[0], points[1], points[2]];
    }
}
/**
 * A material with albedo (diffuse), specular (shininess), normal, and parallax (bump) maps.
 */
export class Material {
    /**
     * Creates a new material.
     *
     * @param diffuseTexture the diffuse texture.
     * @param specularTexture the specular texture.
     * @param normalTexture the normal texture.
     * @param shininess the shininess of the material.
     */
    constructor(diffuseTexture = null, specularTexture = null, normalTexture = null, shininess = 0.5) {
        /**
         * The shininess of the material.
         */
        this.shininess = 0.5;
        /**
         * The scale of the parallax texture.
         */
        this.parallaxScale = 0;
        /**
         * The scale for the UV coordinates.
         */
        this.UVScale = Vec2.filledWith(1);
        this.diffuseTexture = diffuseTexture;
        this.specularTexture = specularTexture;
        this.normalTexture = normalTexture;
        this.parallaxTexture = null;
        this.shininess = shininess;
    }
    bindTextures() {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.diffuseTexture);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.specularTexture);
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, this.normalTexture);
        gl.activeTexture(gl.TEXTURE3);
        gl.bindTexture(gl.TEXTURE_2D, this.parallaxTexture);
    }
    static sendToShader(shader) {
        shader.setUInt(Material.diffuseLoc, 0);
        shader.setUInt(Material.specularLoc, 1);
        shader.setUInt(Material.normalLoc, 2);
        shader.setUInt(Material.parallaxLoc, 3);
        shader.setUInt("screenTexture", 0);
    }
}
Material.diffuseLoc = "material.diffuse";
Material.specularLoc = "material.specular";
Material.normalLoc = "material.normal";
Material.parallaxLoc = "material.parallax";
Material.heightScaleLoc = "material.heightScale";
Material.shininessLoc = "material.shininess";
Material.scaleUVLoc = "mesh.scaleUV";
/**
 * A material with references to textures only.
 */
export class ReferenceMaterial {
    constructor() {
        /**
         * The diffuse texture.
         */
        this.diffuseTexture = gl.NONE;
        /**
         * The specular texture.
         */
        this.specularTexture = gl.NONE;
        /**
         * The normal texture.
         */
        this.normalTexture = gl.NONE;
        /**
         * The parallax texture.
         */
        this.parallaxTexture = gl.NONE;
    }
}
/**
 * Repersents a point in 3D space.
 */
export class Position3D {
    /**
     * Creates a new 3D position.
     *
     * @param position The position.
     * @param rotation The rotation.
     */
    constructor(position = new Vec3(), rotation = new Vec3()) {
        this.position = position;
        this.rotation = rotation;
    }
}
export class Position2D {
    constructor(position = new Vec2(), rotation = 0) {
        this.position = position;
        this.rotation = rotation;
    }
}
/**
 * The view position to render from.
 */
export class Camera3D extends Position3D {
    /**
     * Creates a new camera.
     *
     * @param fov the field of view.
     * @param clipNear the near clip distance.
     * @param clipFar the far clip distance.
     */
    constructor(fov = 75, clipNear = 0.1, clipFar = 500, aspect = 9 / 16) {
        super();
        this.FOV = fov;
        this.clipNear = clipNear;
        this.clipFar = clipFar;
        this.aspect = aspect;
    }
    /**
     *
     * @returns a vector repersenting the direction the camera is looking.
     */
    lookVector() {
        let target = new Vec3(0, 0, 1);
        let up = new Vec3(0, 1, 0);
        let mRotation = Mat4.mul(Mat4.mul(Mat4.rotationX(this.rotation.x), Mat4.rotationY(this.rotation.y)), Mat4.rotationZ(this.rotation.z));
        target = Vec3.mulMat(target, mRotation);
        return target;
    }
    /**
     *
     * @returns the perspective projection matrix of the camera.
     */
    perspective() {
        return Mat4.perspective(this.FOV, this.aspect, this.clipNear, this.clipFar);
    }
    /**
     *
     * @returns the camera transformation matrix.
     */
    cameraMatrix() {
        let vUp = new Vec3(0, 1, 0);
        let vTarget = new Vec3(0, 0, 1);
        let matCameraRotY = Mat4.rotationY(this.rotation.y);
        let matCameraRotX = Mat4.rotationX(this.rotation.x);
        let matCameraRotZ = Mat4.rotationZ(this.rotation.z);
        let camRot = Vec3.mulMat(vTarget, Mat4.mul(Mat4.mul(matCameraRotX, matCameraRotY), matCameraRotZ));
        vTarget = Vec3.add(this.position, camRot);
        let matCamera = Mat4.pointedAt(this.position, vTarget, vUp);
        return matCamera;
    }
    /**
     * Basic movement controls for debugging.
     *
     * @param speed the speed of the camera.
     * @param cameraMoveSpeed the rotation speed of the camera.
     */
    stdControl(speed = 1, cameraMoveSpeed = 1) {
        let p3d = Camera3D.stdController(this, this, speed, cameraMoveSpeed);
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
    static stdController(cam, pos, speed = 1, cameraMoveSpeed = 1) {
        let cLV = cam.lookVector();
        let p3 = pos;
        let forward = new Vec3();
        let up = new Vec3(0, 1, 0);
        let rotate = new Vec3();
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
        if (p3.rotation.x >= Rotation.degToRad(87))
            p3.rotation.x = Rotation.degToRad(87);
        if (p3.rotation.x <= -Rotation.degToRad(87))
            p3.rotation.x = -Rotation.degToRad(87);
        if (Math.abs(p3.rotation.y) >= Rotation.degToRad(360))
            p3.rotation.y = 0;
        if (Math.abs(p3.rotation.z) >= Rotation.degToRad(360))
            p3.rotation.z = 0;
        return p3;
    }
}
export class Camera2D extends Position2D {
    constructor(aspect, position = new Vec2(), rotation = 0) {
        super(position, rotation);
        this.rotationPoint = new Vec2();
        this.aspect = aspect;
    }
    cameraMatrix() {
        return Mat2.rotation(this.rotation);
    }
    sendToShader(shader) {
        shader.setUMat2("camera.rotation", this.cameraMatrix());
        shader.setUVec2("camera.translation", this.position);
        shader.setUFloat("camera.aspect", this.aspect);
        shader.setUVec2("camera.rotationPoint", this.rotationPoint);
    }
    stdControl(speed, rotateSpeed) {
        let move = new Vec2();
        let cLV = new Vec2(Math.sin(this.rotation), Math.cos(this.rotation));
        let rotate = 0;
        if (Input.getKeyState('w')) // w
            move = move.sub(cLV);
        if (Input.getKeyState('s')) // s
            move = move.add(cLV);
        if (Input.getKeyState('d')) // d
            move = move.add(new Vec2(Math.sin(this.rotation - 1.5708), Math.cos(this.rotation - 1.5708)));
        if (Input.getKeyState('a')) // a
            move = move.add(new Vec2(Math.sin(this.rotation + 1.5708), Math.cos(this.rotation + 1.5708)));
        if (Input.getKeyState('ArrowLeft')) // left arrow
            rotate -= rotateSpeed;
        if (Input.getKeyState('ArrowRight')) // right arrow
            rotate += rotateSpeed;
        this.position = this.position.add(move.normalized().mulFloat(Time.deltaTime * speed));
        this.rotation = this.rotation + rotate * Time.deltaTime;
    }
}
let loadedImages = {};
let loadedGeometry = {};
let loadedReferenceTextures = {};
let loadedReferenceGeometry = {};
/**
 * A 3D object.
 */
export class Mesh3D extends Position3D {
    /**
     * Creates a new mesh.
     *
     * @param position the position of the mesh.
     * @param rotation  the rotation of the mesh.
     * @param rotationCenter the rotation center of the mesh.
     * @param scale the scale of the mesh
     * @param material the material of the mesh
     */
    constructor(position = new Vec3(), rotation = new Vec3(), rotationCenter = new Vec3(), scale = new Vec3(1, 1, 1), material = new Material()) {
        super(position, rotation);
        /**
         * The tint of the mesh.
         */
        this.tint = new Vec3(1, 1, 1);
        /**
         * The number of triangles in the mesh
         */
        this.triangles = 0;
        /**
         * Whether to check the geometry reference cache.
         */
        this.useGeometryReferenceCache = false;
        /**
        * Whether to check the texture reference cache.
        */
        this.useTextureReferenceCache = true;
        /**
         * Whether to render this mesh as transparent.
         */
        this.renderTransparent = false;
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
    make(objPath, diffTexPath = "NONE", specTexPath = "NONE", normalPath = "NONE", parallaxPath = "NONE") {
        if (this.useGeometryReferenceCache && Object.keys(loadedReferenceGeometry).includes(objPath)) {
            let geom = loadedReferenceGeometry[objPath];
            this.mVBO = geom.VBO;
            this.mVAO = geom.VAO;
            this.triangles = geom.triangles;
            this.loaded = true;
        }
        else if (Object.keys(loadedGeometry).includes(objPath)) {
            this.loadFromObjData(loadedGeometry[objPath].data);
        }
        else {
            let obGeometry = new Geometry(Utils.loadFile(objPath), "USER_GEOMETRY");
            loadedGeometry[objPath] = obGeometry;
            this.loadFromObjData(obGeometry.data);
        }
        this.setTexture(diffTexPath, specTexPath, normalPath, parallaxPath);
        this.load();
        if (!Object.keys(loadedReferenceGeometry).includes(objPath)) {
            let refG = new ReferenceGeometry();
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
    loadFromObjData(raw) {
        let verts = [];
        let normals = [];
        let texs = [];
        let lines = raw.split("\n");
        let hasNormals = raw.includes("vn");
        let hasTexture = raw.includes("vt");
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            if (line[0] == 'v') {
                if (line[1] == 't') {
                    let v = new Vec2();
                    let seg = line.split(" ");
                    v.x = parseFloat(seg[1]);
                    v.y = parseFloat(seg[2]);
                    texs.push(v);
                }
                else if (line[1] == 'n') {
                    let normal = new Vec3();
                    let seg = line.split(" ");
                    normal.x = parseFloat(seg[1]);
                    normal.y = parseFloat(seg[2]);
                    normal.z = parseFloat(seg[3]);
                    normals.push(normal);
                }
                else {
                    let ve = new Vec3();
                    let seg = line.split(" ");
                    ve.x = parseFloat(seg[1]);
                    ve.y = parseFloat(seg[2]);
                    ve.z = parseFloat(seg[3]);
                    verts.push(ve);
                }
            }
            if (line[0] == 'f') {
                let params = 1;
                if (hasNormals)
                    params++;
                if (hasTexture)
                    params++;
                let vals = [];
                let seg = line.replace("f", "").split(/[\/\s]+/g);
                for (let l = 1; l < seg.length; l++)
                    vals.push(parseInt(seg[l]));
                let push = new Tri3D();
                for (let k = 0; k < 3; k++) {
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
    addTriangle(triangle) {
        let tangent = Mesh3D.calcTangents(triangle); // Calculate tangent and bittangent
        for (let i = 0; i < 3; i++) {
            this.data.push(triangle.v[i].p.x);
            this.data.push(triangle.v[i].p.y);
            this.data.push(triangle.v[i].p.z);
            this.data.push(triangle.v[i].p.w);
            this.data.push(triangle.v[i].t.x);
            this.data.push(triangle.v[i].t.y);
            this.data.push(triangle.v[i].t.w);
            this.data.push(triangle.v[i].rgb.x);
            this.data.push(triangle.v[i].rgb.y);
            this.data.push(triangle.v[i].rgb.z);
            this.data.push(triangle.v[i].rgb.w);
            this.data.push(triangle.v[i].n.x);
            this.data.push(triangle.v[i].n.y);
            this.data.push(triangle.v[i].n.z);
            this.data.push(tangent[i].x);
            this.data.push(tangent[i].y);
            this.data.push(tangent[i].z);
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
    createTextureFromPath(path, texSlot = gl.TEXTURE0, useRefCache, wrap = [gl.REPEAT, gl.REPEAT], minFilter = gl.LINEAR_MIPMAP_LINEAR, magFilter = gl.LINEAR) {
        if (useRefCache && Object.keys(loadedReferenceTextures).includes(path)) {
            return loadedReferenceTextures[path];
        }
        let tex = gl.NONE;
        tex = gl.createTexture();
        gl.activeTexture(texSlot);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([1, 1, 1, 255]));
        if (path != "NONE") {
            let image;
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
            }
            else {
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
                });
            }
            ;
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
    setTexture(diffusePath, specularPath = "NONE", normalPath = "NONE", parallaxPath = "NONE") {
        this.material.diffuseTexture = this.createTextureFromPath(diffusePath, gl.TEXTURE0, this.useTextureReferenceCache);
        this.material.specularTexture = this.createTextureFromPath(specularPath, gl.TEXTURE1, this.useTextureReferenceCache);
        this.material.normalTexture = this.createTextureFromPath(normalPath, gl.TEXTURE2, this.useTextureReferenceCache);
        this.material.parallaxTexture = this.createTextureFromPath(parallaxPath, gl.TEXTURE3, this.useTextureReferenceCache);
    }
    /**
     * Creates a model transformation matrix based on the scale, rotation, and position of the mesh.
     * @returns the model transformation matrix.
     */
    modelMatrix() {
        let matRot = Mat4.rotationOnPoint(this.rotation, this.rotationCenter);
        let matTrans = Mat4.translation(this.position.x, this.position.y, this.position.z);
        let matScale = Mat4.scale(this.scale.x, this.scale.y, this.scale.z);
        let matWorld = Mat4.mul(Mat4.mul(matScale, matRot), matTrans);
        return matWorld;
    }
    /**
     * Loads the data in the data array to the GPU.
     *
     * @param drawType the access type of the data on the GPU.
     */
    load(drawType = gl.DYNAMIC_DRAW) {
        if (!this.loaded) {
            this.mVBO = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.mVBO);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.data), drawType);
            this.mVAO = gl.createVertexArray();
            gl.bindVertexArray(this.mVAO);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.mVBO);
            let size = Vert3D.tSize;
            let floatSize = 4;
            let stride = size * floatSize; // Num of array elements resulting from a Vert3D
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
    static calcTangents(triangle) {
        let v1 = triangle.v[0].p;
        let v2 = triangle.v[1].p;
        let v3 = triangle.v[2].p;
        let w1 = triangle.v[0].t;
        let w2 = triangle.v[1].t;
        let w3 = triangle.v[2].t;
        let x1 = v2.x - v1.x;
        let x2 = v3.x - v1.x;
        let y1 = v2.y - v1.y;
        let y2 = v3.y - v1.y;
        let z1 = v2.z - v1.z;
        let z2 = v3.z - v1.z;
        let s1 = w2.x - w1.x;
        let s2 = w3.x - w1.x;
        let t1 = w2.y - w1.y;
        let t2 = w3.y - w1.y;
        let r = 1.0 / (s1 * t2 - s2 * t1);
        let sdir = new Vec3((t2 * x1 - t1 * x2) * r, (t2 * y1 - t1 * y2) * r, (t2 * z1 - t1 * z2) * r);
        let tdir = new Vec3((s1 * x2 - s2 * x1) * r, (s1 * y2 - s2 * y1) * r, (s1 * z2 - s2 * z1) * r);
        let tan = [sdir, sdir, sdir];
        for (var i = 0; i < 3; i++) {
            let t = tan[i];
            let n = triangle.v[i].n;
            t = t.sub(n).mulFloat(Vec3.dot(n, t)).normalized();
            t.w = (Vec3.dot(Vec3.cross(n, t), tdir) < 0.0) ? -1.0 : 1.0;
        }
        return tan;
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
    static renderAll(shader, camera, meshes, dirLight, pointLights = []) {
        shader.use();
        Material.sendToShader(shader);
        shader.setUFloat(Mesh3D.timeLoc, (Date.now() - IngeniumWeb.startTime) / 1000);
        shader.setUMat4("camera.view", Mat4.inverse(camera.cameraMatrix()));
        shader.setUMat4("camera.projection", camera.perspective());
        shader.setUVec3("viewPos", camera.position);
        shader.setUInt("numlights", pointLights.length);
        dirLight.sendToShader(shader);
        for (let j = 0; j < pointLights.length; j++) {
            pointLights[j].sendToShader(shader, j);
        }
        let transparents = [];
        for (let i = 0; i < meshes.length; i++) {
            if (meshes[i].tint.w != 1.0 || meshes[i].renderTransparent) {
                transparents.push(meshes[i]);
                continue;
            }
            Mesh3D.renderMeshRaw(meshes[i], shader);
        }
        transparents.sort(function (a, b) {
            let aDist = camera.position.sub(a.position).len();
            let bDist = camera.position.sub(b.position).len();
            if (aDist < bDist) {
                return 1;
            }
            if (aDist > bDist) {
                return -1;
            }
            return 0;
        });
        for (let i = 0; i < transparents.length; i++)
            Mesh3D.renderMeshRaw(transparents[i], shader);
    }
    static renderMeshRaw(mesh, shader) {
        gl.bindVertexArray(mesh.mVAO);
        let model = mesh.modelMatrix();
        shader.setUMat4(Mesh3D.modelMatrixLoc, model);
        shader.setUMat4(Mesh3D.invModelMatrixLoc, Mat4.inverse(model));
        shader.setUVec4(Mesh3D.tintLoc, mesh.tint);
        shader.setUFloat(Material.shininessLoc, mesh.material.shininess);
        shader.setUFloat(Material.heightScaleLoc, mesh.material.parallaxScale);
        shader.setUVec2(Material.scaleUVLoc, mesh.material.UVScale);
        mesh.material.bindTextures();
        let verts = mesh.triangles * 3;
        gl.drawArrays(gl.TRIANGLES, 0, verts);
    }
}
// TODO: dynamic shader location names
Mesh3D.modelMatrixLoc = "mesh.transform";
Mesh3D.invModelMatrixLoc = "mesh.inverseTransform";
Mesh3D.tintLoc = "mesh.tint";
Mesh3D.timeLoc = "u_time";
export class Mesh2D extends Position2D {
    /**
     *
     * @param position      the position
     * @param rotation      the rotation
     * @param scale         the scale
     * @param rotationPoint the relative point rotation is done around
     * @param material      the material
     */
    constructor(position = new Vec2(), rotation = 0, scale = Vec2.filledWith(1), rotationPoint = new Vec2(), material = new Material()) {
        super(position, rotation);
        /**
         * The tint of the mesh.
         */
        this.tint = new Vec3(1, 1, 1);
        /**
         * The number of triangles in the mesh
         */
        this.triangles = 0;
        /**
         * Whether to check the geometry reference cache.
         */
        this.useGeometryReferenceCache = false;
        /**
        * Whether to check the texture reference cache.
        */
        this.useTextureReferenceCache = true;
        /**
         * Whether to render this mesh as transparent.
         */
        this.renderTransparent = false;
        /**
         * The z index of the 2D mesh.
         */
        this.zIndex = 0;
        this.scale = scale;
        this.rotationCenter = rotationPoint;
        this.material = material;
    }
    /**
     * Loads all the data onto the GPU
     *
     */
    load(drawType = gl.STATIC_DRAW) {
        if (!this.loaded) {
            this.mVBO = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.mVBO);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.data), drawType);
            this.mVAO = gl.createVertexArray();
            gl.bindVertexArray(this.mVAO);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.mVBO);
            let size = Vert2D.tSize;
            let floatSize = 4;
            let stride = size * floatSize; // Num of array elements resulting from a Vert3D
            gl.vertexAttribPointer(0, 2, gl.FLOAT, false, stride, 0); // Vertex data
            gl.enableVertexAttribArray(0);
            gl.vertexAttribPointer(1, 2, gl.FLOAT, false, stride, 2 * floatSize); // UV data
            gl.enableVertexAttribArray(1);
            this.loaded = true;
        }
    }
    modelMatrix() {
        return Mat2.rotation(this.rotation);
    }
    sendToShader(shader) {
        shader.setUVec4("model.tint", this.tint);
        shader.setUVec2("model.translation", this.position);
        shader.setUMat2("model.rotation", this.modelMatrix());
        shader.setUVec2("model.rotationPoint", this.rotationCenter);
        shader.setUVec2("model.scale", this.scale);
        shader.setUFloat("model.zIndex", this.zIndex);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.material.diffuseTexture);
    }
    bindVBO() {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.mVBO);
    }
    bindVAO() {
        gl.bindVertexArray(this.mVAO);
    }
    static renderAll(shader, camera, meshes) {
        shader.use();
        Material.sendToShader(shader);
        camera.sendToShader(shader);
        shader.setUFloat("u_time", Date.now());
        for (let i = 0; i < meshes.length; i++) {
            meshes[i].bindVAO();
            shader.setUVec2("translation", meshes[i].position.add(camera.position));
            meshes[i].sendToShader(shader);
            gl.drawArrays(gl.TRIANGLES, 0, meshes[i].triangles * 3);
        }
    }
}
// TODO: dynamic shader location names
Mesh2D.renderTranslationName = "translation";
/**
 * The base properties of a light.
 */
export class Light {
    /**
     * Creates a new light.
     *
     * @param ambient the ambient light value.
     * @param diffuse the diffuse light value.
     * @param specular the specular light value.
     * @param intensity the intensity of the light.
     */
    constructor(ambient, diffuse, specular, intensity) {
        this.ambient = ambient;
        this.diffuse = diffuse;
        this.specular = specular;
        this.intensity = intensity;
    }
}
/**
 * A light at a point.
 */
export class PointLight extends Light {
    /**
     * Creates a new point light.
     *
     * @param ambient the ambient light value.
     * @param diffuse the diffuse light value.
     * @param specular the specular light value.
     * @param direction the direction the light comes from.
     * @param intensity the intensity of the light.
     */
    constructor(ambient = new Vec3(0.05, 0.05, 0.05), diffuse = new Vec3(0.8, 0.8, 0.8), specular = new Vec3(0.2, 0.2, 0.2), position = new Vec3(), intensity = 1) {
        super(ambient, diffuse, specular, intensity);
        /**
         * The position of the light.
         */
        /**
         * The constant in the light attentuation equation.
         */
        this.constant = 1;
        /**
         * The linear coefficient in the light attentuation equation.
         */
        this.linear = 0.09;
        /**
        * The quadratic coefficient in the light attentuation equation.
        */
        this.quadratic = 0.032;
        this.position = position;
    }
    sendToShader(shader, index) {
        shader.setUVec3(PointLight.structName + "[" + index + "]." + PointLight.positionLoc, this.position);
        shader.setUVec3(PointLight.structName + "[" + index + "]." + PointLight.ambientLoc, this.ambient);
        shader.setUVec3(PointLight.structName + "[" + index + "]." + PointLight.diffuseLoc, Vec3.mulFloat(this.diffuse, this.intensity));
        shader.setUVec3(PointLight.structName + "[" + index + "]." + PointLight.specularLoc, Vec3.mulFloat(this.specular, this.intensity));
        shader.setUFloat(PointLight.structName + "[" + index + "]." + PointLight.constantLoc, this.constant);
        shader.setUFloat(PointLight.structName + "[" + index + "]." + PointLight.linearLoc, this.linear);
        shader.setUFloat(PointLight.structName + "[" + index + "]." + PointLight.quadraticLoc, this.quadratic);
    }
}
PointLight.structName = "pointLights";
PointLight.positionLoc = "position";
PointLight.ambientLoc = "ambient";
PointLight.diffuseLoc = "diffuse";
PointLight.specularLoc = "specular";
PointLight.constantLoc = "constant";
PointLight.linearLoc = "linear";
PointLight.quadraticLoc = "quadratic";
/**
 * A light coming from one direction.
 */
export class DirectionalLight extends Light {
    /**
     * Creates a new directional light.
     *
     * @param ambient the ambient light value.
     * @param diffuse the diffuse light value.
     * @param specular the specular light value.
     * @param direction the direction the light comes from.
     * @param intensity the intensity of the light.
     */
    constructor(ambient = new Vec3(0.05, 0.05, 0.05), diffuse = new Vec3(0.8, 0.8, 0.8), specular = new Vec3(0.2, 0.2, 0.2), direction = new Vec3(0, -1, 0.2), intensity = 1) {
        super(ambient, diffuse, specular, intensity);
        this.direction = direction;
    }
    sendToShader(shader) {
        shader.setUVec3(DirectionalLight.directionLoc, this.direction);
        shader.setUVec3(DirectionalLight.ambientLoc, this.ambient);
        shader.setUVec3(DirectionalLight.specularLoc, this.specular.mulFloat(this.intensity));
        shader.setUVec3(DirectionalLight.diffuseLoc, this.diffuse.mulFloat(this.intensity));
    }
}
DirectionalLight.directionLoc = "dirLight.direction";
DirectionalLight.ambientLoc = "dirLight.ambient";
DirectionalLight.specularLoc = "dirLight.specular";
DirectionalLight.diffuseLoc = "dirLight.diffuse";
/**
 * Deals with obj files.
 */
export class Geometry {
    /**
     * Creates a new geometry object.
     *
     * @param data The .obj raw data of the geometry.
     * @param name The name of the geometry.
     */
    constructor(data, name = "NONE") {
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
Geometry.quadData = [
    -1, 1, 0, 1,
    -1, -1, 0, 0,
    1, 1, 1, 1,
    -1, -1, 0, 0,
    1, -1, 1, 0,
    1, 1, 1, 1
];
Geometry.triData = [
    0, 1, 0.5, 1,
    -1, -1, 0, 0,
    1, -1, 1, 0
];
/**
 * Contains a reference to geometry on the GPU.
 */
export class ReferenceGeometry {
}
let cubeData = "v -1.000000 1.000000 -1.000000\nv 1.000000 1.000000 1.000000\nv 1.000000 1.000000 -1.000000\nv -1.000000 -1.000000 1.000000\nv 1.000000 -1.000000 1.000000\nv -1.000000 1.000000 1.000000\nv -1.000000 -1.000000 -1.000000\nv 1.000000 -1.000000 -1.000000\nvt 1.000000 0.000000\nvt 0.666667 0.333333\nvt 0.666667 0.000000\nvt 0.333333 0.333333\nvt 0.000000 0.000000\nvt 0.333333 0.000000\nvt 0.333333 0.666667\nvt 0.000000 0.333333\nvt 0.333333 0.333333\nvt 0.666667 0.000000\nvt 0.333333 0.000000\nvt 0.666667 0.666667\nvt 0.333333 0.333333\nvt 0.666667 0.333333\nvt 0.333333 1.000000\nvt 0.000000 0.666667\nvt 0.333333 0.666667\nvt 1.000000 0.333333\nvt 0.000000 0.333333\nvt 0.000000 0.666667\nvt 0.666667 0.333333\nvt 0.333333 0.666667\nvt 0.000000 1.000000\nvn 0.0000 1.0000 0.0000\nvn 0.0000 -0.0000 1.0000\nvn -1.0000 0.0000 0.0000\nvn 0.0000 -1.0000 -0.0000\nvn 1.0000 0.0000 0.0000\nvn 0.0000 0.0000 -1.0000\ns off\nf 1/1/1 2/2/1 3/3/1\nf 2/4/2 4/5/2 5/6/2\nf 6/7/3 7/8/3 4/9/3\nf 8/10/4 4/9/4 7/11/4\nf 3/12/5 5/13/5 8/14/5\nf 1/15/6 8/16/6 7/17/6\nf 1/1/1 6/18/1 2/2/1\nf 2/4/2 6/19/2 4/5/2\nf 6/7/3 1/20/3 7/8/3\nf 8/10/4 5/21/4 4/9/4\nf 3/12/5 2/22/5 5/13/5\nf 1/15/6 3/23/6 8/16/6";
/**
 * Contains various utility functions.
 */
export class Utils {
    /**
     * Loads the string data of a file.
     *
     * @param filePath the path to the file.
     * @returns the string data of the file, or null if the file isn't found.
     */
    static loadFile(filePath) {
        let result = null;
        let xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET", filePath, false);
        xmlhttp.send();
        if (xmlhttp.status == 200) {
            result = xmlhttp.responseText;
        }
        else {
            console.error("XMLHTTP error (", filePath, "): ", xmlhttp.status);
        }
        return result;
    }
}
export class FrameBuffer {
    constructor() {
        this.properties = {};
        this.FBO = gl.createFramebuffer();
        this.RBO = gl.createRenderbuffer();
        this.type = gl.FRAMEBUFFER;
    }
    bind() {
        gl.bindFramebuffer(this.type, this.FBO);
        gl.bindRenderbuffer(gl.RENDERBUFFER, this.RBO);
    }
    addTexture(name, width, height, slot = gl.TEXTURE0, minFilter = gl.LINEAR, magFilter = gl.LINEAR) {
        gl.activeTexture(slot);
        this.bind();
        let tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        this.properties[name] = tex;
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    }
    static bindDefault() {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    static createRenderTexture(width, height) {
        let fb = new FrameBuffer();
        fb.bind();
        fb.properties.width = width;
        fb.properties.height = height;
        fb.properties.texture = null;
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH24_STENCIL8, fb.properties.width, fb.properties.height);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, fb.RBO);
        fb.addTexture("texture", fb.properties.width, fb.properties.height);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        return fb;
    }
    static renderToRenderTexture(fb, onRender) {
        fb.bind();
        IngeniumWeb.window.clear();
        gl.viewport(0, 0, fb.properties.width, fb.properties.height);
        onRender();
    }
    static setDefaultRenderBuffer() {
        FrameBuffer.bindDefault();
        IngeniumWeb.window.clear();
        gl.viewport(0, 0, IngeniumWeb.window.width, IngeniumWeb.window.height);
    }
}
FrameBuffer.buffers = [];
//# sourceMappingURL=Ingenium.js.map