import { SvgCmdData, ArcReplace, CommandMap } from './svg-to-graphics-types';
import { map as cmdMap } from './command-map';

const toOneDec = (num: number) => Math.round(num * 10) / 10;

const removeBlanks = (str: string) => str !== '';

function stepOne(cmdArr: SvgCmdData[]) {
  let newArgs: string[] = [];
  //
  cmdArr.forEach((cmdData, i) => {
    let args = cmdData.args;
    const origLC = cmdData.original.toLowerCase();
    //
    if (typeof args === 'string') {
      args = args.replace(/,/g, ' ').replace(/-/g, ' -').trim().split(' ').filter(removeBlanks);
    }
    //
    (args as string[]).forEach( (arg: string) => {
      const split = arg.split('.');
      const dif = split.length - 2;
      if (dif > 0) {
        const concatArr = [];
        let pos: number;
        let str = arg;

        for (let j = 0; j < dif; j++) {
          pos = str.lastIndexOf('.');
          concatArr.unshift(str.slice(pos));
          str = str.slice(0, pos);
        }
        concatArr.unshift(str);
        newArgs = newArgs.concat(concatArr);
      } else {
        newArgs.push(arg);
      }
    });
  });
}

const convertArgs = (cmdArr: SvgCmdData[], arcReplace: ArcReplace, arcToLinesArgsArr: any[], index: number) => {
  let x = 0;
  let y = 0;
  let prevCP1c;
  let prevCP1q;

  cmdArr.forEach((cmdData, i) => {
    // console.log('convertArgs loop', i, l, cmdArr);
    let args = cmdData.args;
    const origLC = cmdData.original.toLowerCase();
    //
    if (typeof args === 'string') {
      args = args.replace(/,/g, ' ').replace(/-/g, ' -').trim().split(' ').filter(removeBlanks);
    }
    console.log(args);
    // check for more than 1 decimal point in number as string
    let newArgs: string[] = [];
    // tslint:disable-next-line:prefer-for-of
    (args as string[]).forEach((arg: string) => {
      const split = arg.split('.');
      const dif = split.length - 2;
      if (dif > 0) {
        const concatArr = [];
        let pos: number;
        let str = arg;

        for (let j = 0; j < dif; j++) {
          pos = str.lastIndexOf('.');
          concatArr.unshift(str.slice(pos));
          str = str.slice(0, pos);
        }
        concatArr.unshift(str);
        newArgs = newArgs.concat(concatArr);
      } else {
        newArgs.push(arg);
      }
    });
    /* console.log('args.forEach complete'); */
    args = newArgs;
    /* console.log('new args', args); */
    // handle commands longer than 6 aka multiple args for command strung together
    if (args.length > cmdMap[origLC as keyof CommandMap].origArgsLength) {
      // console.log('too long');
      cmdData.args = args.splice(0, cmdMap[origLC as keyof CommandMap].origArgsLength);
      const newCmd = {
        cmd: cmdData.cmd,
        args,
        original: cmdData.original,
        relative: cmdData.relative
      };
      args = cmdData.args;
      cmdArr.splice(i + 1, 0, newCmd);
      // console.log(newCmd, cmdData.args);
      l++;
    }
    // console.log('after strung check', args);
    if (origLC === 'h') {
      // insert y into args of what was an svg h command
      args.push(cmdData.relative ? 0 : y);
    } else if (origLC === 'v') {
      // insert x into args of what was an svg v command
      args.unshift(cmdData.relative ? 0 : x);
    }
    // reset current xy values if args values are already absolute
    if (!cmdData.relative) {
      x = 0;
      y = 0;
    }
    // make all args values absolute by adding xy
    args.forEach((val, idx, array) => {
      // array[idx] = Math.round((parseFloat(val) + (idx % 2 === 0 ? x : y)) * 10) / 10;
      let dif = idx % 2 === 0 ? x : y;
      if (origLC === 'a') {
        dif = idx % 2 === 0 ? y : x;
      }
      if (dif > 0 && origLC === 'a' && idx < 5) {
        dif = 0;
      }
      array[idx] = toOneDec(parseFloat(val) + dif);
    });
    // update current xy values
    if (args.length >= 2) {
      x = args[args.length - 2];
      y = args[args.length - 1];
    }
    //
    if (origLC === 'c' || origLC === 's') {
      // insert control point into args of what was an svg s command
      if (origLC === 's') {
        args = prevCP1c.concat(args);
        prevCP1c = args.slice(2, 2);
      } else {
        // save control point of svg c command
        prevCP1c = args.slice(0, 2);
      }
    } else if (origLC === 'q' || origLC === 't') {
      // insert control point into args of what was an svg t command
      if (origLC === 't') {
        args = prevCP1q.concat(args);
      }
      // save control point of svg q command
      prevCP1q = args.slice(0, 2);
    } else if (origLC === 'a') {
      // rX,ry rotation, arc, sweep, eX,eY
      // arc ( x  y  radius  startAngle  endAngle  anticlockwise )
      const obj = { index, arr: [], processed: false, replaced: false };
      arcToLinesArgsArr.push([x, y, args, obj]);
      arcReplace.curIndex++;
      arcReplace.arr.push(obj);
    }
    cmdData.args = args;
    index++;
  }
  return cmdArr;
};