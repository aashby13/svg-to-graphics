import { SvgCmdData, DrawPathReturnedData } from './svg-to-graphics-types';

export default function drawPath(cmdArr: SvgCmdData[], graphics?: createjs.Graphics): DrawPathReturnedData {
  const gfx = graphics || new createjs.Graphics();
  const usedCmds: SvgCmdData[] = [];
  let d: number;
  let x = 0;
  let y = 0;
  
  cmdArr.forEach(cmd => {
    d = 1000;
    if (cmd.arcPoint) {
      d = Math.sqrt(Math.pow(cmd.args[0] - x, 2) + Math.pow(cmd.args[1] - y, 2));
    }
    if (d > 5) {
      const command = cmd.cmd as keyof createjs.Graphics;
      (gfx[command] as any).apply(gfx, cmd.args);
      x = cmd.args[0];
      y = cmd.args[1];
      usedCmds.push({ cmd: command, args: cmd.args });
    }
  });
  // see dif in length
  /* console.log(`cmdArr.length reduced from ${cmdArr.length} to ${usedCmds.length}.`); */
  return [gfx, usedCmds];
}
