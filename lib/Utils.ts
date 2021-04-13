"use strict";

import { IngeniumWeb } from "./WebGL.js";

export function loadFile(filePath: string): string | null {
    var result = null;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", filePath, false);
    xmlhttp.send();
    if (xmlhttp.status == 200) {
        result = xmlhttp.responseText;
    }
    return result;
}
export function typeCheck(value: any, type: any, loc: string): boolean {
    if (!(value instanceof type)) {
        IngeniumWeb.terminate("Error in " + loc + ": Cannot convert " + typeof (value) + " to " + type.name);
        return true;
    }
    return false;
}
export function argCheck(fargs: any, loc: string, types: any): boolean {
    var ret = false;
    for (var arg = 0; arg < fargs.length; arg++) {
        var arr = fargs[arg];
        ret = ret || typeCheck(arr, types[arg], loc);
        if (ret) return ret;
    }
    return ret;
}