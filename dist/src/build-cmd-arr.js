"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_map_1 = require("./command-map");
function build(obj) {
    const cmdArr = obj.array;
    let path = obj.path;
    let cmdIndex = obj.startIndex || obj.startIndex === 0 ? obj.startIndex : -1;
    let cmdStart = false;
    //
    for (let i = 0; i < path.length; i++) {
        const str = path.substr(i, 1);
        const strLC = str.toLowerCase();
        const cmd = command_map_1.map[strLC] ? command_map_1.map[strLC].cmd : undefined;
        //
        if (!cmdStart && cmd) {
            cmdArr.push({
                cmd,
                args: '',
                original: str,
                relative: str === strLC
            });
            cmdIndex++;
            cmdStart = true;
        }
        else if (cmdStart && !cmd) {
            cmdArr[cmdIndex].args += str;
        }
        else {
            path = path.substring(i);
            build({
                array: cmdArr,
                path,
                startIndex: cmdIndex
            });
            break;
        }
    }
    return cmdArr.map(obj => {
        obj.args = obj.args.trim();
        return obj;
    });
}
;
function buildCommandArray(path) {
    return build({ array: [], path });
}
exports.default = buildCommandArray;
