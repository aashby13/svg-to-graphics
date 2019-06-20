import { ArcReplace, ArcToLineArgs, SvgCmdData, ArcReplaceObj } from './svg-to-graphics-types';
import arcToLines from './arc-to-lines';

function replaceArc(cmdArr: SvgCmdData[], arcReplace: ArcReplace) {
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
};

function process(arcToLinesArgsArr: ArcToLineArgs[], cmdArr: SvgCmdData[], arcReplace: ArcReplace) {
  if (arcToLinesArgsArr.length === 0){
    replaceArc(cmdArr, arcReplace);
  } else {
    const atl = arcToLinesArgsArr.shift() as ArcToLineArgs;
    arcToLines(...atl).then(() => {
      processArcs(arcToLinesArgsArr, cmdArr, arcReplace);
    }, (error: Error) => {
      arcReplace.fail = true;
      throw (error);
    });
  }
}

export default function processArcs(arcToLinesArgsArr: ArcToLineArgs[], cmdArr: SvgCmdData[], arcReplace: ArcReplace): Promise<string> {
  return new Promise((resolve, reject) => {
    process(arcToLinesArgsArr, cmdArr, arcReplace);
    const int = setInterval(() => {
      if (arcReplace.complete){
        clearInterval(int);
        resolve('success');
      } else if (arcReplace.fail) {
        clearInterval(int);
        reject('failed to process arcs');
      }
    }, 100);
  });
};
