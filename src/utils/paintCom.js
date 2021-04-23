import { isObject } from "./types"
import { strokeOrFill } from "../enums"

/* 画线段图 */
export function paintLine({ ctx, sx, sy, ex, ey, style: { lineWidth = 1, color = "#000", setLineDash = [] } = {} }) {
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = color;
    ctx.lineCap = "round";
    ctx.beginPath();
    setLineDash && ctx.setLineDash(setLineDash);
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.stroke();
    ctx.closePath();
}

/* 画矩形图 */
export function paintRect({ ctx, sx, sy, width, height, style: { strokeColor = "#000", fillColor = "#000", color = "#000", fillOrStroke = strokeOrFill.fill } = {} }) {
    if (fillOrStroke === strokeOrFill.fill) {
        ctx.fillStyle = color;
        ctx.fillRect(sx, sy, width, height);
    }
    if (fillOrStroke === strokeOrFill.stroke) {
        ctx.strokeStyle = color;
        ctx.strokeRect(sx, sy, width, height);
    }
    if (fillOrStroke === strokeOrFill.all) {
        ctx.strokeStyle = strokeColor;
        ctx.fillStyle = fillColor;
        ctx.fillRect(sx, sy, width, height);
        ctx.strokeRect(sx, sy, width, height);
    }
    ctx.closePath();
}
