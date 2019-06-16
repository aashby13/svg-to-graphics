# svg-to-graphics
Utility to convert SVG path(s) to EaselJS Graphics.

## Installation NPM
`npm install svg-to-graphics`

## How To Use
SvgToGraphics.convert() returns a Promise. This is due to the fact that this software traces SVG Arcs with several lineTo commands rather than doing the math/trig to convert an SVG Arc to a bezierTo command. The optional arcThresh parameter is essentially the amount of pixels that will limit the amount of lineTo commands used to replicate SVG Arcs. The default arcThresh is 5, so only points that are at least 5px apart will be drawn to replicate the arc. A higher number will result in a rougher looking arc and less drawing commands. A lower number will result in a smoother looking arc and more drawing commands. Generally, a lower number is not needed unless the arc is extremely small or may be zoomed in on.

### Methods
```
SvgToGraphics.convert(pathData: string | string[], graphics?: createjs.Graphics, arcThresh?: number): Promise<SvgConvertData>

// convenience method (rarely used):
// if you need to redraw, feed in instructions returned in convert method
SvgToGraphics.drawPath(cmdArr: SvgCmdData[], graphics?: createjs.Graphics, arcThresh: number = 5): DrawPathReturnedData
```
### Returned Data
```
interface SvgConvertData {
  text: string;
  graphics: createjs.Graphics;
  instructions: SvgCmdData[];
}

interface DrawPathReturnedData {
  0: createjs.Graphics;
  1: SvgCmdData[];
}
```

### Example
```
import SvgToGraphics from 'svg-to-graphics';

....

SvgToGraphics.convert([
  document.querySelector('#some-path-id').getAttribute('d'),
  document.querySelector('#another-path-id').getAttribute('d')
],
  new createjs.Graphics().f('#FFF')
).then( response => {
  // handle response
  const vectorMask = new createjs.Shape(response.graphics);
  wrapper.mask = vectorMask;
  ....
}, error => {
  // handle error
});

```
