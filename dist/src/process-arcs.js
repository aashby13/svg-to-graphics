"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const arc_to_lines_1 = __importDefault(require("./arc-to-lines"));
function replaceArc(cmdArr, arcReplace) {
    /* console.log('replaceArc', arcReplace); */
    let addToIndex = 0;
    arcReplace.arr.forEach(dta => {
        /* console.log(dta); */
        const index = dta.index + addToIndex;
        const arr = dta.arr;
        cmdArr.splice(index, 1);
        addToIndex += arr.length - 1;
        arr.forEach((cmdDta, i) => {
            cmdArr.splice(index + i, 0, cmdDta);
        });
        dta.replaced = true;
    });
    arcReplace.complete = true;
}
;
function process(arcToLinesArgsArr, cmdArr, arcReplace) {
    /* console.log('arcToLinesArgsArr.length', arcToLinesArgsArr.length, arcReplace); */
    if (arcToLinesArgsArr.length === 0) {
        replaceArc(cmdArr, arcReplace);
    }
    else {
        const atl = arcToLinesArgsArr.splice(0, 1)[0];
        arc_to_lines_1.default(...atl).then((response) => {
            /* console.log(response); */
            processArcs(arcToLinesArgsArr, cmdArr, arcReplace);
        }, (error) => {
            throw (error);
        });
    }
}
function processArcs(arcToLinesArgsArr, cmdArr, arcReplace) {
    return new Promise((resolve, reject) => {
        process(arcToLinesArgsArr, cmdArr, arcReplace);
        const to = setTimeout(() => {
            if (!arcReplace.complete) {
                /* console.log('timeout') */
                clearInterval(int);
                clearTimeout(to);
                reject('failed to process arcs');
            }
        }, 2000);
        const int = setInterval(() => {
            if (arcReplace.complete) {
                /* console.log('int') */
                clearInterval(int);
                clearTimeout(to);
                resolve('success');
            }
        }, 100);
    });
}
exports.default = processArcs;
;
