import { SvgConvertData } from './svg-to-graphics-types';
export default function convert(pathData: string | string[], graphics?: createjs.Graphics, arcThresh?: number): Promise<SvgConvertData>;
