"use strict";

var gl;

class Time {
    static deltaTime = 0.1;
    static targetDeltaTime = 1000 / 2;
    static lastFrame = Date.now();
    static setFPS (newfps) {
        if (newfps == 0) {
            newfps = 0.1;
        }
        Time.deltaTime = 1000 / newfps;
    };
    static nextFrameReady () {
        if (Date.now() - Time.lastFrame >= Time.targetDeltaTime) {
            Time.deltaTime = Date.now() - Time.lastFrame;
            Time.lastFrame = Date.now();
            return true;
        }
        return false;
    };
};

class WebGLWindow 
{
    constructor (width, height, parentName, name, set = true) {
        this.parent = document.getElementById(parentName);
        this.canvas = document.createElement("canvas");
        this.canvas.setAttribute("width", width);
        this.canvas.setAttribute("height", height);
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

class IngeniumWeb 
{
    static start (onCreate, onUpdate, onClose, maxDelta = 0, webGL = "webgl2") {
        IngeniumWeb.window = null;
        IngeniumWeb.running = true;
        IngeniumWeb.onCreate = onCreate;
        IngeniumWeb.onUpdate = onUpdate;
        IngeniumWeb.onClose = onClose;
        IngeniumWeb.glVersion = webGL;
        
        IngeniumWeb.init(maxDelta);
    };
    static createWindow = function (width, height, parentName) {
        IngeniumWeb.window = new WebGLWindow(width, height, parentName);
    };
    static refresh = function () {
        if (Time.nextFrameReady()) {
            IngeniumWeb.onUpdate();  
        }
        if (!IngeniumWeb.running) {
            IngeniumWeb.onClose();
            clearInterval(IngeniumWeb.intervalCode);
        }
    }
    static init = function (maxDelta) {
        IngeniumWeb.onCreate();
        if (maxDelta === undefined || maxDelta === null) {
            maxDelta = 0;
        }
        
        IngeniumWeb.intervalCode = setInterval(IngeniumWeb.refresh, maxDelta);
    }
};