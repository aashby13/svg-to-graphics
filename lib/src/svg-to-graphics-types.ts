export interface SvgCmdData {
  cmd: string;
  args: string | string[] | number[];
  original: string;
  relative?: boolean;
  arcPoint?: number;
}

export interface SvgConvertData {
  text: string;
  graphic: createjs.Graphics;
  instructions: SvgCmdData[];
}

export interface DrawPathReturnedData {
  0: createjs.Graphics;
  1: SvgCmdData[];
}

export interface CommandMapData {
  cmd: string;
  origArgsLength: number
}

export interface CommandMap {
  a: CommandMapData;
  c: CommandMapData;
  h: CommandMapData;
  l: CommandMapData;
  m: CommandMapData;
  q: CommandMapData;
  s: CommandMapData;
  t: CommandMapData;
  v: CommandMapData;
  z: CommandMapData;
}

export interface CommandArrayObj {
  array: CommandObj[];
  path: string;
  startIndex?: number;
}

export interface CommandObj {
  cmd: string;
  args: string;
  original: string;
  relative: boolean;
}

export interface ArcReplace {
  curIndex: number;
  complete: boolean;
  arr: any[];
}
