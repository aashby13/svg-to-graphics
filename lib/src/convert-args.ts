import { SvgCmdData, ArcReplace, CommandMap, ConvertArgsData, ArcToLineArgs } from './svg-to-graphics-types';
import { map as cmdMap } from './command-map';

let x: number;
let y: number;
let arcToLinesArgsArr: ArcToLineArgs[];
let arcReplace: ArcReplace;
let prevQ: SvgCmdData;
let prevC: SvgCmdData;

const toOneDec = (num: number) => Math.round(num * 10) / 10;

const removeBlanks = (str: string) => str !== '';

const breakupMultiDecimals = (str: string, i: number, arr: string[]) => {
  if (!str) return;
  /* console.log('breakupMultiDecimals str', str); */
  const split = str.split('.');
  if(split.length > 2) {
  /* console.log('breakupMultiDecimals split', split); */
    arr.splice(i, 1, `${split[0]}.${split[1]}`, '0.' + split[3]);
  }
};

function argsToNumArray(dta: SvgCmdData): SvgCmdData {
  const split = (dta.args as string).split(' ').filter(removeBlanks);
  for (let i = 0; i < split.length; i++) {
    breakupMultiDecimals(split[i], i, split);
  }
  const args = split.map((arg: string) => parseFloat(arg));
  return Object.assign({}, dta, {args});
}

/*
  makeCommandsFromLongArgs():
    Break up strung together svg commands into individual commands
    and insert them into newCmdArr at the proper index.
    Must be used in for loop (not forEach) in order to splice array being looped.
*/
function makeCommandsFromLongArgs(dta: SvgCmdData, i: number, arr: SvgCmdData[]) {
  const lowerCaseSvgCmd = (dta.original as string).toLowerCase();
  if (lowerCaseSvgCmd === 'a') return;
  const args = dta.longArgs || dta.args as number[];
  const origArgsLength = cmdMap[lowerCaseSvgCmd as keyof CommandMap].origArgsLength;
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

function makeArgsAbsolute(dta: SvgCmdData): SvgCmdData {
  const origLC = (dta.original as string).toLowerCase();
  let args = dta.args as number[];
  let prevX = x
  let prevY = y;
  // reset current xy values if args values are already absolute
  if (!dta.relative) {
    x = 0;
    y = 0;
  }
  /* console.log(x, y); */
  // map args to absolute values
  const newArgs = args.map((val: number, idx: number, arr: number[]) => {
    let dif = 0;
    switch (origLC) {
      case 'a':
        dif = 0;
        break;

      case 'h':
        dif = x;
        break

      case 'v':
        dif = y;
        break

      default:
        dif = idx % 2 === 0 ? x : y;
        break;
    }
    return toOneDec(val + dif);
  });
  // update current xy values
  console.log(newArgs.length);
  if (newArgs.length > 1) {
    if (origLC === 'a') {
      x = args[args.length -2] + (dta.relative ? x : 0);
      y = args[args.length - 1] + (dta.relative ? y : 0);
    } else {
      x = newArgs[newArgs.length - 2];
      y = newArgs[newArgs.length - 1];
    }
  } else if (newArgs.length === 1) {
    if (origLC === 'h') {
      x = newArgs[0];
      y = prevY;
    } else if (origLC === 'v') {
      y = newArgs[0];
      x = prevX;
    }
  }
  //
  return Object.assign({}, dta, { args: newArgs });
}

function addMissingArgs(dta: SvgCmdData, i: number, arr: SvgCmdData[]): SvgCmdData {
  if (i === 0) return dta;
  const args = dta.args as number[];
  const lowerCaseSvgCmd = (dta.original as string).toLowerCase();
  const prevCmd = arr[i - 1];
  const prevX = prevCmd.args[prevCmd.args.length - 2] as number;
  const prevY = prevCmd.args[prevCmd.args.length - 1] as number;
  /* console.log(i, 'prevX', prevX, 'prevY', prevY); */
  //
  switch (lowerCaseSvgCmd) {
    case 'h':
      // add y
      args.push(prevY);
      break;

    case 'v':
      // add x
      args.unshift(prevX);
      break;

    case 's':
      // add last control point from previous C or S cmd as first control point of current cmd
      args.unshift(prevC.args[2] as number, prevC.args[3] as number);
      prevC.args = args;
      break;

    case 't':
      // add last control point from previous Q or T cmd as first control point of current cmd
      args.unshift(prevQ.args[2] as number, prevQ.args[3] as number);
      prevQ.args = args;
      break;  

    case 'c':
      prevC = dta;
      break;

    case 'q':
      prevQ = dta;
      break;  

    case 'a':
      const obj = { index: i, arr: [], processed: false, replaced: false };
      arcToLinesArgsArr.push([
        dta.original as string, 
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

export default function convertArgs(cmdArr: SvgCmdData[]): ConvertArgsData {
  x = 0;
  y = 0;
  arcToLinesArgsArr = [];
  arcReplace = { curIndex: -1, complete: false, arr: [] };
  let newCmdArr = cmdArr.map(argsToNumArray);
  for (let i = 0; i < newCmdArr.length; i++) {
    makeCommandsFromLongArgs(newCmdArr[i], i, newCmdArr);
  }
  console.log(newCmdArr);
  newCmdArr = newCmdArr.map(makeArgsAbsolute).map(addMissingArgs);
  /* console.log(newCmdArr, arcToLinesArgsArr, arcReplace ); */
  return Object.assign({}, { cmdArr: newCmdArr, arcToLinesArgsArr, arcReplace });
}
