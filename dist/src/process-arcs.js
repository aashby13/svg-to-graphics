"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const arc_to_lines_1 = __importDefault(require("./arc-to-lines"));
function replaceArc(cmdArr, arcReplace) {
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
}
;
function processArcs(arcToLinesArgsArr, cmdArr, arcReplace) {
    return new Promise((resolve, reject) => {
        if (arcToLinesArgsArr.length === 0) {
            resolve('success');
        }
        arcToLinesArgsArr.forEach(atl => {
            arc_to_lines_1.default(atl[0], atl[1], atl[2], atl[3]).then((response) => {
                if (response.processed) {
                    replaceArc(cmdArr, arcReplace);
                    arcReplace.complete = true;
                    resolve('success');
                }
            }, (error) => {
                reject(error);
            });
        });
    });
}
exports.default = processArcs;
;
