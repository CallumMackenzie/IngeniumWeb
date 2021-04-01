"use strict";

import { IngeniumWeb } from "./WebGL";

var PI = 355 / 113;

export function loadFile(filePath: string) {
    var result = null;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", filePath, false);
    xmlhttp.send();
    if (xmlhttp.status == 200) {
        result = xmlhttp.responseText;
    }
    return result;
}
export function typeCheck(value: any, type: any, loc: string) {
    if (!(value instanceof type)) {
        IngeniumWeb.terminate("Error in " + loc + ": Cannot convert " + typeof (value) + " to " + type.name);
        return true;
    }
    return false;
}
export function argCheck(fargs: any, loc: string, types: any) {
    var ret = false;
    for (var arg = 0; arg < fargs.length; arg++) {
        var arr = fargs[arg];
        ret = ret || typeCheck(arr, types[arg], loc);
        if (ret) return ret;
    }
    return ret;
}
export function radToDeg(rad: number) {
    return rad * 180 / PI;
}
export function degToRad(deg: number) {
    return deg * PI / 180;
}