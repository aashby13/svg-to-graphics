import { ArcReplace, SvgCmdData, ArcToLineArgs, SvgConvertData } from './svg-to-graphics-types';
import buildCommandArray from './build-cmd-arr';
import convertArgs from './convert-args';
import drawPath from './draw-path';
import processArcs from './process-arcs';

/* 
  cleanPath():
    get rid of all newlines, returns, & tabs from string
    replace commas with space
    add space in front of negative numbers
    make sure negative numbers less than 1 have a 0 in front: ie -.3 to -0.3
*/
function cleanPath(path: string): string {
  return path.replace(/[\n\r\t]/g, '').replace(/,/g, ' ').replace(/-/g, ' -').replace(/'-.'/g, '-0.').trim();
}

export default function convert(pathData: string | string[], graphics?: createjs.Graphics, arcThresh?: number): Promise<SvgConvertData> {
  let cmdArr: SvgCmdData[] = [];
  let arcToLinesArgsArr: ArcToLineArgs[] = [];
  let arcReplace: ArcReplace = { curIndex: -1, complete: false, arr: [] };
  const pathArr: string[] = [];
  // cleanup path to make easier to work with
  if (typeof pathData === 'string') {
    pathArr.push(cleanPath(pathData));
  } else {
    pathData.forEach(path => pathArr.push(cleanPath(path)));
  }
  // process path(s) to build cmdArr, arcToLinesArgsArr, & arcReplace
  pathArr.forEach(path => {
    const arr = buildCommandArray(path);
    /* console.log(arr); */
    const convertedData = convertArgs(arr);
    const newArcReplaceArr = arcReplace.arr.concat(convertedData.arcReplace.arr);
    cmdArr = cmdArr.concat(convertedData.cmdArr);
    arcToLinesArgsArr = arcToLinesArgsArr.concat(convertedData.arcToLinesArgsArr);
    arcReplace = Object.assign(arcReplace, convertedData.arcReplace, { arr: newArcReplaceArr });
  })

  return new Promise((resolve, reject) => {
    processArcs(arcToLinesArgsArr, cmdArr, arcReplace).then(response => {
      const results = drawPath(cmdArr, graphics, arcThresh);
      const returnData = {
        text: response as string,
        graphic: results[0],
        instructions: results[1]
      };
      resolve(returnData as SvgConvertData);
    }, (error: Error) => {
      reject(error);
    });
  });
}