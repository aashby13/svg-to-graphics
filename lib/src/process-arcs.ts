import { ArcReplace, ArcToLineArgs, SvgCmdData, ArcReplaceObj } from './svg-to-graphics-types';
import arcToLines from './arc-to-lines';

function replaceArc(cmdArr: SvgCmdData[], arcReplace: ArcReplace) {
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
};

export default function processArcs(arcToLinesArgsArr: ArcToLineArgs[], cmdArr: SvgCmdData[], arcReplace: ArcReplace): Promise<string> {
  return new Promise((resolve, reject) => {
    if (arcToLinesArgsArr.length === 0) {
      resolve('success');
    }
    arcToLinesArgsArr.forEach( atl => {
      arcToLines(atl[0], atl[1], atl[2], atl[3]).then((response: ArcReplaceObj) => {
        if (response.processed) {
          replaceArc(cmdArr, arcReplace);
          arcReplace.complete = true;
          resolve('success');
        }
      }, (error: Error) => {
        reject(error);
      });
    });
  });
};
