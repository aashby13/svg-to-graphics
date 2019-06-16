"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function drawPath(cmdArr, graphics, arcThresh = 5) {
    const gfx = graphics || new createjs.Graphics();
    const usedCmds = [];
    let d;
    let x = 0;
    let y = 0;
    cmdArr.forEach(cmd => {
        d = 1000;
        if (cmd.arcPoint) {
            d = Math.sqrt(Math.pow(cmd.args[0] - x, 2) + Math.pow(cmd.args[1] - y, 2));
        }
        // reduce points if less than 5px apart (or user set arcThresh). traced arc adds alot of points
        if (d > arcThresh) {
            const command = cmd.cmd;
            gfx[command].apply(gfx, cmd.args);
            x = cmd.args[0];
            y = cmd.args[1];
            usedCmds.push({ cmd: command, args: cmd.args });
        }
    });
    // see dif in length
    /* console.log(`cmdArr.length reduced from ${cmdArr.length} to ${usedCmds.length}.`); */
    return [gfx, usedCmds];
}
exports.default = drawPath;
