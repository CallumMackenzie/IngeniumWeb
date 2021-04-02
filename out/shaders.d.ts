export declare class ShaderSourceTypes {
    static vert: string;
    static frag: string;
}
export declare class ShaderSource {
    static shaders: any;
    static shaderWithParams(shaderName: string, paramDict?: {
        [id: string]: any;
    }): string;
    static getShader(name: string): ShaderSource;
    static getAllShaderNames(): string[];
    static defVert(): string;
    static defFrag(nLights?: string | number): string;
    source: string;
    type: string;
    params: any[];
    constructor(paramDict: any, type: string, name: string, src: string);
    getExpectedParams(): string[];
}
