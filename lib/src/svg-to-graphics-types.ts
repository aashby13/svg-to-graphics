export interface SvgCmdData {
  cmd: string;
  args: string | string[] | number[];
  longArgs?: number[];
  original?: string;
  relative?: boolean;
  arcPoint?: boolean;
  index?: number;
}

export interface SvgConvertData {
  text: string;
  graphics: createjs.Graphics;
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
  array: SvgCmdData[];
  path: string;
  startIndex?: number;
}

export interface ArcReplaceObj {
  index: number;
  arr: SvgCmdData[];
  processed: boolean;
  replaced: boolean;
}

export interface ArcReplace {
  curIndex: number;
  complete: boolean;
  arr: ArcReplaceObj[];
}

export interface ArcToLineArgs extends Array<any> {
  0: number;
  1: number;
  2: number[];
  3: ArcReplaceObj;
}

export interface ConvertArgsData {
  cmdArr: SvgCmdData[];
  arcToLinesArgsArr: ArcToLineArgs[];
  arcReplace: ArcReplace;
}
