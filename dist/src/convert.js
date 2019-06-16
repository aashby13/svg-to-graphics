"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const build_cmd_arr_1 = __importDefault(require("./build-cmd-arr"));
const convert_args_1 = __importDefault(require("./convert-args"));
const draw_path_1 = __importDefault(require("./draw-path"));
const process_arcs_1 = __importDefault(require("./process-arcs"));
/*
  cleanPath():
    get rid of all newlines, returns, & tabs from string
    replace commas with space
    add space in front of negative numbers
    make sure negative numbers less than 1 have a 0 in front: ie -.3 to -0.3
*/
function cleanPath(path) {
    return path.replace(/[\n\r\t]/g, '').replace(/,/g, ' ').replace(/-/g, ' -').replace(/'-.'/g, '-0.').trim();
}
function convert(pathData, graphics, arcThresh) {
    let cmdArr = [];
    let arcToLinesArgsArr = [];
    let arcReplace = { curIndex: -1, complete: false, arr: [] };
    const pathArr = [];
    // cleanup path to make easier to work with
    if (typeof pathData === 'string') {
        pathArr.push(cleanPath(pathData));
    }
    else {
        pathData.forEach(path => pathArr.push(cleanPath(path)));
    }
    // process path(s) to build cmdArr, arcToLinesArgsArr, & arcReplace
    pathArr.forEach(path => {
        const arr = build_cmd_arr_1.default(path);
        /* console.log(arr); */
        const convertedData = convert_args_1.default(arr);
        const newArcReplaceArr = arcReplace.arr.concat(convertedData.arcReplace.arr);
        cmdArr = cmdArr.concat(convertedData.cmdArr);
        arcToLinesArgsArr = arcToLinesArgsArr.concat(convertedData.arcToLinesArgsArr);
        arcReplace = Object.assign(arcReplace, convertedData.arcReplace, { arr: newArcReplaceArr });
    });
    return new Promise((resolve, reject) => {
        process_arcs_1.default(arcToLinesArgsArr, cmdArr, arcReplace).then(response => {
            const results = draw_path_1.default(cmdArr, graphics, arcThresh);
            const returnData = {
                text: response,
                graphic: results[0],
                instructions: results[1]
            };
            resolve(returnData);
        }, (error) => {
            reject(error);
        });
    });
}
exports.default = convert;
