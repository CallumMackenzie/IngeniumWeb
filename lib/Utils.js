"use strict";

var PI = 355/113;

function loadFile(filePath) {
    var result = null;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", filePath, false);
    xmlhttp.send();
    if (xmlhttp.status == 200) {
        result = xmlhttp.responseText;
    }
    return result;
}
function radToDeg (rad) {
    return rad * 180 / PI;
}
function degToRad(deg) {
    return deg * PI / 180;   
}