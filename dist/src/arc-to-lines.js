"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const extra = 10;
let bbox;
function getSvgAsImage(cmd, startX, startY, args) {
    const tempSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const tempPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    tempPath.setAttributeNS(null, 'd', `M${startX} ${startY} ${cmd}${args.join(' ')}`);
    tempPath.setAttributeNS(null, 'fill', 'none');
    tempPath.setAttributeNS(null, 'stroke', 'rgb(0,0,0)');
    tempPath.setAttributeNS(null, 'stroke-width', '1');
    tempSVG.appendChild(tempPath);
    document.body.appendChild(tempSVG);
    bbox = tempPath.getBBox();
    if (bbox.x < 0 || bbox.y < 0) {
        tempPath.setAttributeNS(null, 'transform', `translate(${bbox.x < 0 ? Math.abs(bbox.x) + extra : 0},${bbox.y < 0 ? Math.abs(bbox.y) + extra : 0})`);
    }
    tempSVG.setAttributeNS(null, 'width', (bbox.width + (bbox.x > 0 ? bbox.x : 0) + extra).toString());
    tempSVG.setAttributeNS(null, 'height', (bbox.height + (bbox.y > 0 ? bbox.y : 0) + extra).toString());
    //
    const svgUrl = new XMLSerializer().serializeToString(tempSVG);
    const img = new Image();
    img.src = 'data:image/svg+xml; charset=utf8, ' + encodeURIComponent(svgUrl);
    document.body.removeChild(tempSVG);
    return img;
}
function traceImage(img) {
    let x = 0, y = 0, pointIndex = -1;
    const tempCanvas = document.createElement('canvas');
    const arr = [];
    tempCanvas.setAttribute('width', (bbox.width + (bbox.x > 0 ? bbox.x : 0) + extra).toString());
    tempCanvas.setAttribute('height', (bbox.height + (bbox.y > 0 ? bbox.y : 0) + extra).toString());
    document.body.appendChild(tempCanvas);
    //
    const ctx = tempCanvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const image = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const imgData = image.data;
    //
    for (let n = 0, len = imgData.length; n < len; n += 4) {
        if (imgData[n + 3] >= 200) {
            pointIndex++;
            arr.push({
                cmd: 'lt',
                args: [x + (bbox.x < 0 ? bbox.x - extra : 0), y + (bbox.y < 0 ? bbox.y - extra : 0)],
                arcPoint: pointIndex !== 0 || pointIndex !== len - 1
            });
        }
        x++;
        if (x === image.width) {
            y++;
            x = 0;
        }
    }
    document.body.removeChild(tempCanvas);
    return arr;
}
function sortAndBuidCommands(startX, startY, arr) {
    const l = arr.length;
    let newArr = [];
    let nX = startX;
    let nY = startY;
    //
    while (newArr.length !== l) {
        arr.sort((a, b) => {
            const d1 = Math.sqrt(Math.pow(a.args[0] - nX, 2) + Math.pow(a.args[1] - nY, 2));
            const d2 = Math.sqrt(Math.pow(b.args[0] - nX, 2) + Math.pow(b.args[1] - nY, 2));
            return d1 - d2;
        });
        //
        newArr = newArr.concat(arr.splice(0, 1));
        nX = newArr[newArr.length - 1].args[0];
        nY = newArr[newArr.length - 1].args[1];
    }
    return newArr;
}
function arcToLines(cmd, startX, startY, args, arcReplaceObj) {
    const img = getSvgAsImage(cmd, startX, startY, args);
    //
    return new Promise((resolve, reject) => {
        img.onload = () => {
            const arr = sortAndBuidCommands(startX, startY, traceImage(img));
            Object.assign(arcReplaceObj, { arr, processed: true });
            bbox = undefined;
            resolve('success');
        };
        img.onerror = () => {
            reject(Error('Unable to convert arc to lines.'));
        };
    });
}
exports.default = arcToLines;
