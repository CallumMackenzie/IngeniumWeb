"use strict";

class Shader {
    static compile (source, type) {
        var shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
         if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            var err = {};
            err.type = "SHADER_COMPILE_ERROR";
            err.shaderInt = type;
            err.shaderType = (type == gl.VERTEX_SHADER) ? "vertex shader" : "fragment shader";
            err.error = gl.getShaderInfoLog(shader); 
            console.log(err);
            return null;
        }
        return shader;
    }
    
    constructor (vertSource, fragSource) {
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

class Vector3D {
    static sub (v1, v2) {
        return new Vector3D(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
    }
    static add (v1, v2) {
        return new Vector3D(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
    }
    static mul (v1, v2) {
        return new Vector3D(v1.x * v2.x, v1.y * v2.y, v1.z * v2.z);
    }
    static div (v1, v2) {
        return new Vector3D(v1.x / v2.x, v1.y / v2.y, v1.z / v2.z);
    }
    static mulFloat (vec, float) {
        return new Vector3D(v1.x * float, v1.y * float, v1.z * float);
    }
    static divFloat (vec, float) {
        return new Vector3D(v1.x / float, v1.y / float, v1.z / float);
    }
    static dot (v1, v2) {
        return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    }
    static length (v) {
	   return Math.sqrt(dotProduct(v, v));
    }
    static normalize (v) {
        var l = length(v);
        return new Vector3D(v.x / l, v.y / l, v.z / l);
    }
    static cross(v1, v2) {
       var v = new Vector3D();
	   v.x = v1.y * v2.z - v1.z * v2.y;
	   v.y = v1.z * v2.x - v1.x * v2.z;
	   v.z = v1.x * v2.y - v1.y * v2.x;
	   return v;
    }
    static mulMat (i, m) {
       var v = new Vector3D();
	   v.x = i.x * m.m[0][0] + i.y * m.m[1][0] + i.z * m.m[2][0] + i.w * m.m[3][0];
	   v.y = i.x * m.m[0][1] + i.y * m.m[1][1] + i.z * m.m[2][1] + i.w * m.m[3][1];
	   v.z = i.x * m.m[0][2] + i.y * m.m[1][2] + i.z * m.m[2][2] + i.w * m.m[3][2];
	   v.w = i.x * m.m[0][3] + i.y * m.m[1][3] + i.z * m.m[2][3] + i.w * m.m[3][3];
	   return v;
    }
    
    constructor (x = 0, y = 0, z = 0, w = 1) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }
}

class Matrix4x4 {
    static perspective (fovDeg, aspectRatio, near, far) 
    {
       var fovRad = 1.0 / Math.tan(degToRad(fovDeg * 0.5));
	   var matrix = new Matrix4x4();
	   matrix.m[0][0] = aspectRatio * fovRad;
	   matrix.m[1][1] = fovRad;
	   matrix.m[2][2] = far_ / (far_ - near_);
	   matrix.m[3][2] = (-far_ * near_) / (far_ - near_);
	   matrix.m[2][3] = 1.0;
	   matrix.m[3][3] = 0.0;
	   return matrix;
    };
    static identity () {
        var matrix = new Matrix4x4();
        matrix.m[0][0] = 1.0;
        matrix.m[1][1] = 1.0;
        matrix.m[2][2] = 1.0;
        matrix.m[3][3] = 1.0;
        return matrix;
    }
    static pointedAt(v3pos, v3target, v3up = new Vector3D(0, 1, 0)) {
        var newForward = Vector3D.sub(target, pos);
        newForward = Vector3D.normalize(newForward);

	   var a = Vector3D.mulFloat(newForward, Vector3D.dotProduct(up, newForward));
	   var newUp = Vector3D.sub(up, a);
	   newUp = Vector3D.normalize(newUp);

	   var newRight = Vector3D.crossProduct(newUp, newForward);
       var matrix = new Matrix4x4();
	   matrix.m[0][0] = newRight.x;	matrix.m[0][1] = newRight.y; matrix.m[0][2] = newRight.z; matrix.m[0][3] = 0.0;
	   matrix.m[1][0] = newUp.x; matrix.m[1][1] = newUp.y; matrix.m[1][2] = newUp.z; matrix.m[1][3] = 0.0;
	   matrix.m[2][0] = newForward.x; matrix.m[2][1] = newForward.y; matrix.m[2][2] = newForward.z; matrix.m[2][3] = 0.0;
	   matrix.m[3][0] = pos.x; matrix.m[3][1] = pos.y; matrix.m[3][2] = pos.z;	matrix.m[3][3] = 1.0;
	   return matrix;
    }
    static scale (x = 1, y = 1, z = 1) {
       var matrix = Matrix4x4.identity();
	   matrix.m[0][0] = x;
	   matrix.m[1][1] = y;
	   matrix.m[2][2] = z;
	   return matrix;
    }
    static translation (x = 0, y = 0, z = 0)
    {
        var matrix = new Matrix4x4();
        matrix.m[0][0] = 1.0;
        matrix.m[1][1] = 1.0;
        matrix.m[2][2] = 1.0;
        matrix.m[3][3] = 1.0;
        matrix.m[3][0] = x;
        matrix.m[3][1] = y;
        matrix.m[3][2] = z;
        return matrix;
    }
    
    constructor () {
        this.m = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];   
    }
}

class Mesh {
    constructor () {
        this.data = [];   
    }
    loadFromObj(filePath) {
        
    };
}