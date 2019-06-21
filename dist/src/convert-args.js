"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_map_1 = require("./command-map");
let x;
let y;
let arcToLinesArgsArr;
let arcReplace;
let prevQArgs;
let prevCArgs;
const toOneDec = (num) => Math.round(num * 10) / 10;
const removeBlanks = (str) => str !== '';
const breakupMultiDecimals = (str, i, arr) => {
    if (!str)
        return;
    const split = str.split('.');
    if (split.length > 2) {
        arr.splice(i, 1, `${split[0]}.${split[1]}`, '0.' + split.slice(2));
    }
};
function argsToNumArray(dta) {
    const split = dta.args.split(' ').filter(removeBlanks);
    for (let i = 0; i < split.length; i++) {
        breakupMultiDecimals(split[i], i, split);
    }
    const args = split.map((arg) => parseFloat(arg));
    return Object.assign({}, dta, { args });
}
/*
  makeCommandsFromLongArgs():
    Break up strung together svg commands into individual commands
    and insert them into newCmdArr at the proper index.
    Must be used in for loop (not forEach) in order to splice array being looped.
*/
function makeCommandsFromLongArgs(dta, i, arr) {
    const origLC = dta.original.toLowerCase();
    if (origLC === 'a')
        return;
    const args = dta.longArgs || dta.args;
    const origArgsLength = command_map_1.map[origLC].origArgsLength;
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
function makeArgsAbsolute(dta) {
    const origLC = dta.original.toLowerCase();
    let args = dta.args;
    let prevX = x;
    let prevY = y;
    // reset current xy values if args values are already absolute
    if (!dta.relative) {
        x = 0;
        y = 0;
    }
    /* console.log(x, y); */
    // map args to absolute values
    const newArgs = args.map((val, idx, arr) => {
        let dif = 0;
        switch (origLC) {
            case 'a':
                dif = 0;
                break;
            case 'h':
                dif = x;
                break;
            case 'v':
                dif = y;
                break;
            default:
                dif = idx % 2 === 0 ? x : y;
                break;
        }
        return toOneDec(val + dif);
    });
    // update current xy values
    if (newArgs.length > 1) {
        if (origLC === 'a') {
            x = args[args.length - 2] + (dta.relative ? x : 0);
            y = args[args.length - 1] + (dta.relative ? y : 0);
        }
        else {
            x = newArgs[newArgs.length - 2];
            y = newArgs[newArgs.length - 1];
        }
    }
    else if (newArgs.length === 1) {
        if (origLC === 'h') {
            x = newArgs[0];
            y = prevY;
        }
        else if (origLC === 'v') {
            y = newArgs[0];
            x = prevX;
        }
    }
    //
    return Object.assign({}, dta, { args: newArgs });
}
// startIndex is for making sure arcs are put in the right place when more than 1 path is being drawn
function addMissingArgs(dta, i, arr, startIndex) {
    if (i === 0)
        return dta;
    const args = dta.args;
    const origLC = dta.original.toLowerCase();
    const prevCmd = arr[i - 1];
    const prevOrigLC = prevCmd.original.toLowerCase();
    let prevX;
    let prevY;
    //
    if (prevCmd.original === 'a') {
        // calculate prevXY since relative a cmd args are not made absolute
        const back2Cmd = arr[i - 2];
        prevX = prevCmd.args[prevCmd.args.length - 2] + back2Cmd.args[back2Cmd.args.length - 2];
        prevY = prevCmd.args[prevCmd.args.length - 1] + back2Cmd.args[back2Cmd.args.length - 1];
    }
    else {
        prevX = prevCmd.args[prevCmd.args.length - 2];
        prevY = prevCmd.args[prevCmd.args.length - 1];
    }
    //
    if (origLC === 's' && prevOrigLC !== 'c' && prevOrigLC !== 's') {
        prevCArgs = [0, 0, prevX, prevY, prevX, prevY];
    }
    else if (origLC === 't' && prevOrigLC !== 'q' && prevOrigLC !== 't') {
        prevQArgs = [0, 0, prevX, prevY];
    }
    /* console.log(i, 'prevX', prevX, 'prevY', prevY); */
    //
    switch (origLC) {
        case 'h':
            // add y
            args.push(prevY);
            break;
        case 'v':
            // add x
            args.unshift(prevX);
            break;
        case 's':
            // calculate first control point from last S or C cmd
            args.unshift(toOneDec((2 * prevX) - prevCArgs[2]), toOneDec((2 * prevY) - prevCArgs[3]));
            prevCArgs = args;
            break;
        case 't':
            // calculate first control point from last Q or T cmd
            args.unshift(toOneDec((2 * prevX) - prevQArgs[0]), toOneDec((2 * prevY) - prevQArgs[1]));
            prevQArgs = args;
            break;
        case 'c':
            prevCArgs = dta.args;
            break;
        case 'q':
            prevQArgs = dta.args;
            break;
        case 'a':
            const obj = { index: startIndex + i, arr: [], processed: false, replaced: false };
            arcToLinesArgsArr.push([
                dta.original,
                prevX,
                prevY,
                args,
                obj
            ]);
            arcReplace.curIndex++;
            arcReplace.arr.push(obj);
            break;
        default:
            break;
    }
    return Object.assign({}, dta, { args });
}
function convertArgs(cmdArr, startIndex) {
    x = 0;
    y = 0;
    prevQArgs = [];
    prevCArgs = [];
    arcToLinesArgsArr = [];
    arcReplace = { curIndex: -1, complete: false, arr: [] };
    let newCmdArr = cmdArr.map(argsToNumArray);
    for (let i = 0; i < newCmdArr.length; i++) {
        makeCommandsFromLongArgs(newCmdArr[i], i, newCmdArr);
    }
    newCmdArr = newCmdArr.map(makeArgsAbsolute).map((data, i, arr) => addMissingArgs(data, i, arr, startIndex));
    return Object.assign({}, { cmdArr: newCmdArr, arcToLinesArgsArr, arcReplace });
}
exports.default = convertArgs;
