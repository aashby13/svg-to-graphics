"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const arc_to_lines_1 = __importDefault(require("./arc-to-lines"));
function replaceArc(cmdArr, arcReplace) {
    let addToIndex = 0;
    arcReplace.arr.forEach(dta => {
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
    if (arcToLinesArgsArr.length === 0) {
        replaceArc(cmdArr, arcReplace);
    }
    else {
        const atl = arcToLinesArgsArr.shift();
        arc_to_lines_1.default(...atl).then(() => {
            processArcs(arcToLinesArgsArr, cmdArr, arcReplace);
        }, (error) => {
            arcReplace.fail = true;
            throw (error);
        });
    }
}
function processArcs(arcToLinesArgsArr, cmdArr, arcReplace) {
    return new Promise((resolve, reject) => {
        process(arcToLinesArgsArr, cmdArr, arcReplace);
        const int = setInterval(() => {
            if (arcReplace.complete) {
                clearInterval(int);
                resolve('success');
            }
            else if (arcReplace.fail) {
                clearInterval(int);
                reject('failed to process arcs');
            }
        }, 100);
    });
}
exports.default = processArcs;
;
