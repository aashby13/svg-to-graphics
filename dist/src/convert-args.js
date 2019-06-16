"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_map_1 = require("./command-map");
let x;
let y;
let arcToLinesArgsArr;
let arcReplace;
const toOneDec = (num) => Math.round(num * 10) / 10;
const removeBlanks = (str) => str !== '';
function argsToNumArray(dta) {
    const args = dta.args.split(' ').filter(removeBlanks).map((arg) => parseFloat(arg));
    return Object.assign({}, dta, { args });
}
/*
  makeCommandsFromLongArgs():
    Break up strung together svg commands into individual commands
    and insert them into newCmdArr at the proper index.
    Must be used in for loop (not forEach) in order to splice array being looped.
*/
function makeCommandsFromLongArgs(dta, i, arr) {
    const args = dta.longArgs || dta.args;
    const lowerCaseSvgCmd = dta.original.toLowerCase();
    const origArgsLength = command_map_1.map[lowerCaseSvgCmd].origArgsLength;
    //
    if (args.length > origArgsLength) {
        /* console.log('too long', args.length); */
        const newArgs = args.splice(0, origArgsLength);
        /* console.log('aftersplice', args); */
        const newCmd = {
            cmd: dta.cmd,
            args: newArgs,
            original: dta.original,
            relative: dta.relative,
            longArgs: args.slice(),
            // add index for debug purposes
            index: i
        };
        /* console.log(newCmd); */
        arr.splice(i, 0, newCmd);
    }
}
function makeArgsAbsolute(dta, i, arr) {
    let args = dta.args;
    const isArc = dta.original === 'a' || dta.original === 'A';
    // reset current xy values if args values are already absolute
    if (!dta.relative) {
        x = 0;
        y = 0;
    }
    // map args to absolute values
    const newArgs = args.map((val, idx) => {
        let dif = idx % 2 === 0 ? x : y;
        if (isArc) {
            // dont add dif to index 2,3, & 4 of arc args. they are not xy values
            if (idx === 2 || idx === 3 || idx === 4)
                dif = 0;
            // svg arc has 7 values so flip even/odd logic to properly set xy values of end point
            else if (idx > 4)
                dif = idx % 2 === 0 ? y : x;
        }
        return toOneDec(val + dif);
    });
    // update current xy values
    if (newArgs.length >= 2) {
        x = newArgs[newArgs.length - 2];
        y = newArgs[newArgs.length - 1];
    }
    //
    return Object.assign({}, dta, { args: newArgs });
}
function addMissingArgs(dta, i, arr) {
    if (i === 0)
        return dta;
    const args = dta.args;
    const lowerCaseSvgCmd = dta.original.toLowerCase();
    const prevCmd = arr[i - 1];
    const prevX = prevCmd.args[prevCmd.args.length - 2];
    const prevY = prevCmd.args[prevCmd.args.length - 1];
    //
    switch (lowerCaseSvgCmd) {
        case 'h':
            // add y
            args.push(prevX);
            break;
        case 'v':
            // add x
            args.unshift(prevY);
            break;
        case 's' || 't':
            // add last control point from previous cmd as first control point of current cmd
            args.unshift(prevCmd.args[2], prevCmd.args[3]);
            break;
        case 'a':
            const obj = { index: i, arr: [], processed: false, replaced: false };
            arcToLinesArgsArr.push([prevX, prevY, args, obj]);
            arcReplace.curIndex++;
            arcReplace.arr.push(obj);
            break;
        default:
            break;
    }
    return Object.assign({}, dta, { args });
}
function convertArgs(cmdArr) {
    x = 0;
    y = 0;
    arcToLinesArgsArr = [];
    arcReplace = { curIndex: -1, complete: false, arr: [] };
    let newCmdArr = cmdArr.map(argsToNumArray);
    for (let i = 0; i < newCmdArr.length; i++) {
        makeCommandsFromLongArgs(newCmdArr[i], i, newCmdArr);
    }
    newCmdArr = newCmdArr.map(makeArgsAbsolute).map((cmd, i, arr) => addMissingArgs(cmd, i, arr));
    return { cmdArr: newCmdArr, arcToLinesArgsArr, arcReplace };
}
exports.default = convertArgs;
