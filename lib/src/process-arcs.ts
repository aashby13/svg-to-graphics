import { ArcReplace, ArcToLineArgs, SvgCmdData, ArcReplaceObj } from './svg-to-graphics-types';
import arcToLines from './arc-to-lines';

function replaceArc(cmdArr: SvgCmdData[], arcReplace: ArcReplace) {
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
};

function process(arcToLinesArgsArr: ArcToLineArgs[], cmdArr: SvgCmdData[], arcReplace: ArcReplace) {
  /* console.log('arcToLinesArgsArr.length', arcToLinesArgsArr.length, arcReplace); */
  if (arcToLinesArgsArr.length === 0){
    replaceArc(cmdArr, arcReplace);
  } else {
    const atl = arcToLinesArgsArr.splice(0, 1)[0];
    arcToLines(...atl).then((response: ArcReplaceObj) => {
      /* console.log(response); */
      processArcs(arcToLinesArgsArr, cmdArr, arcReplace);
    }, (error: Error) => {
      throw (error);
    });
  }
}

export default function processArcs(arcToLinesArgsArr: ArcToLineArgs[], cmdArr: SvgCmdData[], arcReplace: ArcReplace): Promise<string> {
  return new Promise((resolve, reject) => {
    process(arcToLinesArgsArr, cmdArr, arcReplace);
    const to = setTimeout(() => {
      if (!arcReplace.complete) {
        /* console.log('timeout') */
        clearInterval(int);
        clearTimeout(to);
        reject('failed to process arcs');
      }
    }, 2000)
    const int = setInterval(() => {
      if (arcReplace.complete){
        /* console.log('int') */
        clearInterval(int);
        clearTimeout(to);
        resolve('success');
      } 
    }, 100);
  });
};
