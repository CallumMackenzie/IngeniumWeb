export declare class Geometry {
    static makeCube(): Geometry;
    name: string;
    data: string;
    constructor(data: string, name?: string);
}
export declare class ReferenceGeometry {
    VBO: WebGLBuffer;
    VAO: WebGLVertexArrayObject;
    triangles: number;
}
