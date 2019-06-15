import buildCommandArray from './buildCommandArray';
import { ArcReplace } from './svg-to-graphics-types';

export default function convert(pathData: string | string[], graphics?: createjs.Graphics)/* : Promise<SvgConvertData> */ {
  let finalArr = [];
  const pathArr: string[] = [];
  const arcReplace: ArcReplace = { curIndex: -1, complete: false, arr: [] };
  const arcToLinesArgsArr = [];
  // get rid of all newlines, returns, & tabs from string
  if (typeof pathData === 'string') {
    pathArr.push(pathData.replace(/[\n\r\t]/g, ''));
  } else {
    pathData.forEach(path => pathArr.push(path.replace(/[\n\r\t]/g, '')))
  }

  pathArr.forEach(path => {
    const arr = buildCommandArray(path);
    console.log(arr);
    /* finalArr = finalArr.concat(convertArgs(arr, arcReplace, arcToLinesArgsArr, finalArr.length > 0 ? finalArr.length - 1 : 0)); */
  })

  /* return new Promise((resolve, reject) => {
    processArcs(arcToLinesArgsArr, finalArr, arcReplace).then((response) => {
      const results = this.drawPath(finalArr, graphics);
      const returnData = {
        text: response as string,
        graphic: results[0],
        instructions: results[1]
      };
      resolve(returnData as SvgConvertData);
    }, (error) => {
      reject(error);
    });
  }); */
}