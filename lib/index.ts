/// <reference path="../node_modules/@types/easeljs/index.d.ts" />
import convert from './src/convert';
import drawPath from './src/draw-path';

class SvgToGraphics {
  public convert = convert;
  public drawPath = drawPath;
}

export default new SvgToGraphics()