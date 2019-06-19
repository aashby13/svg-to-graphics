"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const svgNS = 'http://www.w3.org/2000/svg';
const extra = 10;
const color = 'rgb(0,0,0)';
let bbox;
function getSvgAsImage(cmd, startX, startY, args) {
    const tempSVG = document.createElementNS(svgNS, 'svg');
    const tempPath = document.createElementNS(svgNS, 'path');
    tempPath.setAttributeNS(null, 'd', `M${startX} ${startY} ${cmd}${args.join(' ')}`);
    tempPath.setAttributeNS(null, 'fill', 'none');
    tempPath.setAttributeNS(null, 'stroke', color);
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
function traceImage(img, arcReplaceObj) {
    let x = 0, y = 0, pointIndex = -1;
    const tempCanvas = document.createElement('canvas');
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
            arcReplaceObj.arr.push({
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
}
function sortAndBuidCommands(startX, startY, arcReplaceObj) {
    const l = arcReplaceObj.arr.length;
    let newArr = [];
    let nX = startX;
    let nY = startY;
    //
    while (newArr.length !== l) {
        // console.log(nX,nY);
        arcReplaceObj.arr.sort((a, b) => {
            const d1 = Math.sqrt(Math.pow(a.args[0] - nX, 2) + Math.pow(a.args[1] - nY, 2));
            const d2 = Math.sqrt(Math.pow(b.args[0] - nX, 2) + Math.pow(b.args[1] - nY, 2));
            return d1 - d2;
        });
        newArr = newArr.concat(arcReplaceObj.arr.splice(0, 1));
        nX = newArr[newArr.length - 1].args[0];
        nY = newArr[newArr.length - 1].args[1];
    }
    /* newArr.push({ cmd: 'lt', args: [endX, endY] }); */
    arcReplaceObj.arr = newArr;
    arcReplaceObj.processed = true;
    /* console.log('complete', arcReplaceObj.arr); */
}
function arcToLines(cmd, startX, startY, args, arcReplaceObj) {
    /* console.log('arcToLines begin'); */
    const img = getSvgAsImage(cmd, startX, startY, args);
    //
    return new Promise((resolve, reject) => {
        img.onload = () => {
            traceImage(img, arcReplaceObj);
            sortAndBuidCommands(startX, startY, arcReplaceObj);
            resolve(arcReplaceObj);
        };
        img.onerror = () => {
            reject(Error('Unable to convert arc to lines.'));
        };
    });
}
exports.default = arcToLines;
