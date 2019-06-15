import { CommandArrayObj, CommandObj, CommandMap } from './svg-to-graphics-types';
import { map as cmdMap } from './command-map';

function build(obj: CommandArrayObj): CommandObj[] {
  const cmdArr: CommandObj[] = obj.array;
  let path: string = obj.path;
  let cmdIndex = obj.startIndex || obj.startIndex === 0 ? obj.startIndex : -1;
  let cmdStart = false;
  //
  for (let i = 0; i < path.length; i++) {
    const str = path.substr(i, 1);
    const strLC = str.toLowerCase() as keyof CommandMap;
    const cmd = cmdMap[strLC] ? cmdMap[strLC].cmd : undefined;
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
    } else if (cmdStart && !cmd) {
      cmdArr[cmdIndex].args += str;
    } else {
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
};

export default function buildCommandArray(path: string): CommandObj[] {
  return build({ array: [], path })
}
