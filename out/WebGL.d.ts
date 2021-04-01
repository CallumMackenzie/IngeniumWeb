import { Mat4, Vec3 } from "./3D.js";
export declare var gl: WebGL2RenderingContext;
export declare class Time {
    static deltaTime: number;
    static fixedDeltaTime: number;
    static targetDeltaTime: number;
    static targetFixedDeltaTime: number;
    static lastFrame: number;
    static lastFixedFrame: number;
    static setFPS(newfps: number): void;
    static setFixedFPS(newfps: number): void;
    static nextFixedFrameReady(): boolean;
    static nextFrameReady(): boolean;
}
export declare class WebGLWindow {
    parent: Element | null;
    canvas: HTMLCanvasElement;
    width: number;
    height: number;
    aspectRatio: number;
    constructor(width: number, height: number, parentName: string, name: string, set?: boolean);
    setGL(): void;
}
export declare class IngeniumWeb {
    static window: WebGLWindow | null;
    static running: boolean;
    static glVersion: string;
    static intervalCode: any;
    static onCreate: Function;
    static onUpdate: Function;
    static onClose: Function;
    static onFixedUpdate: Function;
    static start(onCreate?: () => void, onUpdate?: () => void, onClose?: () => void, onFixedUpdate?: () => void, webGL?: string): void;
    static createWindow: (width: number, height: number, id: string, parentName: string) => void;
    static refresh(): void;
    static init(): void;
    static terminate(message: string): void;
}
export declare class Shader {
    program: WebGLProgram;
    static compile(source: string, type: number): WebGLShader | null;
    constructor(vertSource: string, fragSource: string);
    use(): void;
    getULoc(name: string): WebGLUniformLocation;
    setUInt(name: string, value: number): void;
    setUInt2(name: string, value1: number, value2: number): void;
    setUInt3(name: string, value1: number, value2: number, value3: number): void;
    setUInt4(name: string, value1: number, value2: number, value3: number, value4: number): void;
    setUFloat(name: string, value: number): void;
    setUFloat2(name: string, value1: number, value2: number): void;
    setUFloat3(name: string, value1: number, value2: number, value3: number): void;
    setUFloat4(name: string, value1: number, value2: number, value3: number, value4: number): void;
    setUMat4(name: string, mat4: Mat4): void;
    setUVec2(name: string, v: Vec3): void;
    setUVec3(name: string, v: Vec3): void;
    setUVec4(name: string, v: Vec3): void;
    setUBool(name: string, b: boolean): void;
}
