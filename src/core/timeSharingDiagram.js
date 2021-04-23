import { paintLine, isObject, isArray, calValuePos } from "../utils"
import { calcConfig, allGraph, timeFrame} from "../enums"


import style from "./index.scss"

// 初始化 分时图
export function initTimeSharingDiagram(QL, data) {
    // 统一 做一个 canvas
    if (!isObject(data)) return "initTimeSharingDiagram:数据格式不对";
    const canvas = document.createElement("canvas");
    canvas.innerHTML = "不支持canvas";
    canvas.width = QL._DOMWidth * QL._defulatSale, canvas.height = QL._DOMHeight * QL._defulatSale;

    canvas.style.width = `${QL._DOMWidth}px`, canvas.style.height = `${QL._DOMHeight}px`;

    canvas.style.background = QL._theme.bg || "transparent";

    const ctx = canvas.getContext("2d");

    if (!ctx) return "initTimeSharingDiagram:canvas不支持";

    ctx.scale(QL._defulatSale, QL._defulatSale);
    Object.defineProperty(QL, "_mainCtx", {
        get() {
            return ctx;
        }
    });

    /* 主要的 页面 绘制的 组合 */
    QL.paintTimeSharingDiagram(data);

    const maskCanvas = genMaskCav(QL);


    const fragment = document.createDocumentFragment();
    fragment.appendChild(canvas);
    fragment.appendChild(maskCanvas);
    QL._DOM.appendChild(fragment);
}


/* 测算 最大值 和 最小值，并且 实际 绘制 的 上浮和下浮 值 在这里 定义 */
/* 
    获取的 值 包括 curPrice,avPrice

    这里的逻辑是：中线 是以 昨日收盘价为基准，然后对应的 上下值的 判定，需要 以当前 所有 值 为 参照物进行 浮动；
*/
function calRangeValue(targetValue, closePrice) {
    if (!isArray(targetValue) || !targetValue.length) return "calRangeValue：没数据";
    const newTargetArr = targetValue.concat();
    const len = newTargetArr.length;
    // 按照 curPrice 排序
    const temArrByCur = newTargetArr.map(a => a.curPrice).sort((a, b) => a - b);
    // 按照 avPrice 排序
    const tempArrByav = newTargetArr.map(a => a.avPrice).sort((a, b) => a - b);
    let max = null, min = null, dValue = null;
    const curMax = temArrByCur[len - 1],
        curMin = temArrByCur[0],
        avMax = tempArrByav[len - 1],
        avMin = tempArrByav[0];

    /*这里的 逻辑 需要重写
        对于 上下界限 为了有 容错性，把 最大值 和 最小值，以及 默认 浮动 比例 ，来做这块；
    */
    const floatRate = 0.1; // 以 内陆 股市 为基准；
    const floatUp = closePrice * (1 + floatRate), floatDown = closePrice * (1 - floatRate);

    /* 对于 max 值 的 判定 */
    if (closePrice >= Math.max(curMax, avMax)) { // 说明 基准线的 上面沒值
        max = floatUp;
    } else {
        max = Math.max(curMax, avMax);
    }

    /* 对于 min 值 的判定 */
    if (closePrice <= Math.min(curMin, avMin)) {
        min = floatDown;
    } else {
        min = Math.min(curMin, avMin);
    }

    const dUpValue = max - closePrice, dDownValue = closePrice - min;
    max += dUpValue * calcConfig.upAndDown;
    min -= dDownValue * calcConfig.upAndDown;

    return { max, min }
}


function dealCalRangeValue(targetValue) {
    if (!isArray(targetValue) || !targetValue.length) return "dealCalRangeValue：没数据";
    const newTargetArr = targetValue.concat();
    const len = newTargetArr.length;

    newTargetArr.sort((a, b) => a.dealMount - b.dealMount);
    let max = null, min = null;
    max = newTargetArr[len - 1].dealMount - 0, min = newTargetArr[0].dealMount;

    /* 上浮 */
    const dTotal = max - min;
    max += dTotal * calcConfig.upAndDown;

    return { max, min }
}

/* 计算 实际 每个图 的 实际 高度 */
function calActuallyHeight(QL, config) {
    const height = QL._DOMHeight;
    const textArea = config.sort.filter(item => item === allGraph.text);
    const heightExpText = height - textArea.length * calcConfig.lineGap;
    let baseHeight = 0;
    return config.sort.reduce((prev, next, index) => {
        const name = prev[next] ? `${next}-${index}` : next,
            regExp = new RegExp(`^${allGraph.text}`, "ig")
        prev[name] = prev[name] || {};
        prev[name].totalHeight = regExp.test(name) ? calcConfig.lineGap : (heightExpText * config[`${next}Height`]);
        prev[name].baseHeight = baseHeight
        baseHeight += prev[name].totalHeight;
        return prev;
    }, {})
}

function genMaskCav(QL) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.innerHTML = "不支持canvas";

    canvas.width = QL._DOMWidth * QL._defulatSale, canvas.height = QL._DOMHeight * QL._defulatSale;
    canvas.style.width = `${QL._DOMWidth}px`, canvas.style.height = `${QL._DOMHeight}px`;


    canvas.className = style["mask-cav"];

    ctx.scale(QL._defulatSale, QL._defulatSale);
    /* 把 遮罩层 的 canvas 的 ctx 存储到 实例上,可能这个 canvas 会提取到  外部 让 两个 实例 共用 */
    Object.defineProperty(QL, "_maskCtx", {
        get() {
            return ctx
        },
        configurable: true
    })

    return canvas;

}
// 计算 走势 对应 的 布局数据
function calTimeValuePos({ min, max, prevClose, totalHeight, baseHeight, n, decimal = 100 }) {
    const yPosIncrement = totalHeight / (n - 1);
    const halfN = Math.floor(n / 2);

    const factorInc = [], // rate 值
        actuallyValue = [], // 现价
        valueYPos = []; // 实际 纵坐标

    const upFactor = (max - prevClose) / halfN, downFactor = (prevClose - min) / halfN;

    let i = 0, actuallyFactor = null, curAct = null, curInc = null;
    while (i < n) {
        valueYPos.push(parseInt((baseHeight + i * yPosIncrement) * 100) / 100);

        // 处理 现价 和  rate 值
        if (i === halfN) {
            curAct = prevClose;
            curInc = 0;
        } else {
            actuallyFactor = i < halfN ? upFactor : downFactor;
            curAct = +prevClose + (halfN - i) * actuallyFactor;
            curAct = parseInt(curAct * decimal) / decimal.toFixed((decimal + '').length-1);
            curInc = parseInt((curAct - prevClose) / prevClose * decimal * 100) / decimal.toFixed((decimal + '').length);
            // console.log(curInc);
        }
        actuallyValue.push(curAct);
        factorInc.push(curInc);
        i++;
    }
    return { factorInc, actuallyValue, valueYPos };
}
export function paintTimeSharingDiagram(data) {
    const QL = this;

    data = data || QL._data;
    
    const { _mainCtx: ctx } = QL;

    ctx.clearRect(0, 0, QL._DOMWidth, QL._DOMHeight);

    const config = calActuallyHeight(QL, calcConfig.timeSharingDiagram);

    const { data: chartData, preClosePrice } = data;

    // 用于外部 绘制 ui 用的信息 
    const paintConfig = {};

    let LMin = null, LMax = null, LYFactor = null, LYUpFactor = null, LYDownFator = null,//这是 line图的,需要对于 基准线上下进行区分

        DMin = null, DMax = null, DYFactor = null, // deal 图
        xFactor = QL._DOMWidth / 240; //这里的 240 是指 分成了 4段 ，每段 分为 60min


    // 时分的 line 图
    if (config[allGraph.line]) {
        let lineRange = calRangeValue(chartData, preClosePrice);
        LMin = lineRange.min, LMax = lineRange.max;

        /* LYFactor 新的逻辑 */
        LYUpFactor = config[allGraph.line].totalHeight / 2 / (LMax - preClosePrice);
        LYDownFator = config[allGraph.line].totalHeight / 2 / (preClosePrice - LMin);

        if (!QL._gapD) {
            Object.defineProperty(QL, "_gapD", {
                get() {
                    return xFactor;
                }
            })
        }


        paintConfig.dealMountPos = config[allGraph.line].totalHeight;


        paintConfig.valueRange = calTimeValuePos({ min: LMin, max: LMax, prevClose: preClosePrice, totalHeight: config[allGraph.line].totalHeight, baseHeight: config[allGraph.line].baseHeight, n: 5, decimal: QL._decimal });

        /* 这跟线 对应的就是 昨日收盘价 */
        paintLine({
            ctx,
            sx: 0,
            sy: config[allGraph.line].totalHeight / 2,
            ex: QL._DOMWidth,
            ey: config[allGraph.line].totalHeight / 2,
            style: {
                color: "#CCCCCC"
            }
        })
    }
    paintLine({
        ctx,
        sx: 0,
        sy: config[allGraph.text].baseHeight,
        ex: QL._DOMWidth,
        ey: config[allGraph.text].baseHeight,
        style: {
            color: "#eee"
        }
    })
    paintLine({
        ctx,
        sx: 0,
        sy: config[allGraph.text].baseHeight + config[allGraph.text].totalHeight,
        ex: QL._DOMWidth,
        ey: config[allGraph.text].baseHeight + config[allGraph.text].totalHeight,
        style: {
            color: "#eee"
        }
    })

    // 时分 的 deal 图
    if (config[allGraph.dealMount]) {
        let dealRange = dealCalRangeValue(chartData);
        DMin = dealRange.min, DMax = dealRange.max;
        DYFactor = config[allGraph.dealMount].totalHeight / (DMax - DMin);

        // 计算 指数 对应 位置的值
        paintConfig.dealRange = calValuePos({ min: DMin, max: DMax, totalHeight: config[allGraph.dealMount].totalHeight, baseHeight: config[allGraph.dealMount].baseHeight, n: 3, decimal: QL._decimal });
        console.log(paintConfig.dealRange);
    }

    /* 初始化 时间的 位置信息 */
    console.log(QL._frameName);
    let curTimeFram=timeFrame[QL._frameName]
    let totalLength=((curTimeFram.length-1)*60);
    paintConfig.timeFrame=curTimeFram
    paintConfig.paintTimeX = [0];
    xFactor = QL._DOMWidth / totalLength

    /* 如果到时候 需要 绘制 区域 面积，重新 绘制一个 */
    let curX = null, actuallyItem;

    /**
     * 绘制线 的 方法
     * @param {*} param0 
     */
    const paintLineFun = ({ i, paintType, cx }) => {
        let cy, sy;
        if (chartData[i][paintType] - preClosePrice >= 0) {
            cy = config[allGraph.line].baseHeight + LYUpFactor * (LMax - chartData[i][paintType]);
        } else {
            cy = config[allGraph.line].baseHeight + config[allGraph.line].totalHeight / 2 + LYDownFator * (preClosePrice - chartData[i][paintType]);
        }
        if (chartData[i - 1][paintType] - preClosePrice >= 0) {
            sy = config[allGraph.line].baseHeight + LYUpFactor * (LMax - chartData[i - 1][paintType]);
        } else {
            sy = config[allGraph.line].baseHeight + config[allGraph.line].totalHeight / 2 + LYDownFator * (preClosePrice - chartData[i - 1][paintType]);
        }

        // 这个是 现价需要的值
        /* chartData[i].actuallyX = cx;
        chartData[i].actuallyY = cy; */
        i > 0 && paintLine({
            ctx,
            sx: xFactor * (i - 1),
            sy: sy,
            ex: cx,
            ey: cy,
            style: {
                color: QL._theme.time.line[paintType] || "#000",
            }
        });
        return { actuallyX: cx, actuallyY: cy }
    }

    for (let i = 0, len = chartData.length; i < len; i++) {
        curX = xFactor * i;
        /* 放入实际 开盘的 时间以及图 */
        if (i % 60 === 0 && i != totalLength && i !== 0) {
            paintConfig.paintTimeX.push(curX);
            // console.log({
            //     ctx,
            //     sx: curX,//xFactor * i,
            //     sy: config[allGraph.line].baseHeight,
            //     ex: curX,
            //     ey: config[allGraph.line].baseHeight + config[allGraph.line].totalHeight,
            //     style: {
            //         color: "#ddd",
            //         setLineDash: [4],
            //     }
            // });
            paintLine({
                ctx,
                sx: curX,//xFactor * i,
                sy: config[allGraph.line].baseHeight,
                ex: curX,
                ey: config[allGraph.line].baseHeight + config[allGraph.line].totalHeight,
                style: {
                    color: "#ddd",
                    setLineDash: [4],
                }
            })
            paintLine({
                ctx,
                sx: curX,//xFactor * i,
                sy: config[allGraph.dealMount].baseHeight,
                ex: curX,
                ey: config[allGraph.dealMount].baseHeight + config[allGraph.dealMount].totalHeight,
                style: {
                    color: "#ddd",
                    setLineDash: [4],
                }
            })
        }
        if (i > 0 && LYUpFactor && LYDownFator) {
            actuallyItem = paintLineFun({ i, paintType: "curPrice", cx: curX });
            chartData[i].actuallyX = actuallyItem.actuallyX;
            chartData[i].actuallyY = actuallyItem.actuallyY;
            paintLineFun({ i, paintType: "avPrice", cx: curX });
        }
        /* 画成交量 */
        DYFactor && paintLine({
            ctx,
            sx: curX,
            sy: config[allGraph.dealMount].baseHeight + config[allGraph.dealMount].totalHeight - DYFactor * (chartData[i].dealMount - DMin),
            ex: curX,
            ey: config[allGraph.dealMount].baseHeight + config[allGraph.dealMount].totalHeight,
            style: {
                color: i % 2 === 0 ? (QL._theme.time.dealMount.even || "#000") : QL._theme.time.dealMount.odd || "#000"
            }
        })
    }
    /* 对于当前 的 走势图的 值 不够 对应 的 区间 需要自动补全 */
    const tempLen = chartData.length, range = 60, maxRange = totalLength;
    let n = Math.ceil(tempLen / range), tempSX = 0;
    
    while ((tempLen < (range * n)) && (range * n < maxRange)) {
        paintConfig.paintTimeX.push(xFactor * range * n);
        tempSX = xFactor * range * n;
        paintLine({
            ctx,
            sx: tempSX,
            sy: config[allGraph.line].baseHeight,
            ex: tempSX,
            ey: config[allGraph.line].baseHeight + config[allGraph.line].totalHeight,
            style: {
                color: "#ddd",
                setLineDash: [4],
            }
        })
        paintLine({
            ctx,
            sx: tempSX,
            sy: config[allGraph.dealMount].baseHeight,
            ex: tempSX,
            ey: config[allGraph.dealMount].baseHeight + config[allGraph.dealMount].totalHeight,
            style: {
                color: "#ddd",
                setLineDash: [4],
            }
        })
        n++;
    }
    paintConfig.paintTimeX.push(totalLength * xFactor);

    Object.defineProperty(QL, "_paintConfig", {
        get() {
            return paintConfig;
        },
        configurable: true
    });
    /* 重新 配置 data 的 值 */
    // QL._data = {...data,data:chartData}
    Object.defineProperty(QL, "_data", {
        get() {
            return { ...data, data: chartData }
        },
        configurable: true
    })

}