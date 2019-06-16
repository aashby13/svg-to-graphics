"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path="../node_modules/@types/easeljs/index.d.ts" />
const convert_1 = __importDefault(require("./src/convert"));
const draw_path_1 = __importDefault(require("./src/draw-path"));
class SvgToGraphics {
    constructor() {
        this.convert = convert_1.default;
        this.drawPath = draw_path_1.default;
    }
}
exports.default = new SvgToGraphics();
