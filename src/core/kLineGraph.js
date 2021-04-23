import { paintLine, paintRect, isObject, isArray, isFunction, calValuePos } from "../utils"
import { strokeOrFill, calcConfig, allGraph } from "../enums"

import style from "./index.scss"

export function initkLineGraph(QL, data) {
    if (!isObject(data)) return "initkLineGraph:数据格式不对";
    const canvas = document.createElement("canvas");
    canvas.innerHTML = "不支持canvas";

    canvas.width = QL._DOMWidth * QL._defulatSale, canvas.height = QL._DOMHeight * QL._defulatSale;
    canvas.style.width = `${QL._DOMWidth}px`, canvas.style.height = `${QL._DOMHeight}px`;

    canvas.style.background = QL._theme.bg || "transparent";

    const ctx = canvas.getContext("2d");

    if (!ctx) return "initkLineGraph:canvas不支持";

    ctx.scale(QL._defulatSale, QL._defulatSale);

    Object.defineProperty(QL, "_mainCtx", {
        get() {
            return ctx;
        }
    });

    /* 初始化 展示的 数量 的 区间 范围,并存储到 实例中，为了 做 事件的 时候使用 */
    let startI = data.data.length - calcConfig.kLineGraph.initShowN, endI = data.data.length;
    /* 如果 总长度 小于 initShowN 的时候 */
    startI = startI < 0 ? 0 : startI;
    endI = endI < calcConfig.kLineGraph.initShowN ? calcConfig.kLineGraph.initShowN : endI;
    Object.defineProperty(QL, "_kMess", {
        get() {
            return {
                startI,
                endI,
                showNumber: calcConfig.kLineGraph.initShowN
            }
        },
        configurable: true
    })

    /* 开始绘制 */
    QL.kLineGraphPaint(data);



    const maskCanvas = genMaskCav(QL);


    const fragment = document.createDocumentFragment();
    fragment.appendChild(canvas);
    fragment.appendChild(maskCanvas);
    QL._DOM.appendChild(fragment);
}

/* 计算 柱状图的 范围 
    最大值的产生可能是:高，收，开，均线的值
    最小值的 产生：低，收，开，均线的值
*/
function calRangeRect(targetValue) {
    if (!isArray(targetValue) || !targetValue.length) return "calRangeRect：没数据";
    const newTargetArr = targetValue.concat();
    const len = newTargetArr.length;

    /* 寻求最值可以进行优化 */
    const highArr = newTargetArr.map(a => a.high).sort((a, b) => a - b);
    const lowArr = newTargetArr.map(a => a.low).sort((a, b) => a - b);
    const openArr = newTargetArr.map(a => a.open).sort((a, b) => a - b);
    const closeArr = newTargetArr.map(a => a.close).sort((a, b) => a - b);

    // MA指标线的 值的排序
    const MAReg = /^MA/;
    const MAArr = newTargetArr.reduce((prev, next) => {
        Object.keys(next).forEach(item => {
            if (MAReg.test(item)) {
                prev.push(next[item]);
            }
        });
        return prev;
    }, []).sort((a, b) => a - b);

    /* 可能 指标线上 不存在值 */
    if (!MAArr.length) {
        MAArr.push(0);
    }

    let max = null, min = null;
    max = Math.max(highArr[len - 1], openArr[len - 1], closeArr[len - 1], MAArr[MAArr.length - 1]),
        min = Math.min(lowArr[0], openArr[0], closeArr[0], MAArr[0]);

    /* 进行 上浮 和 下浮 比例计算 */
    const dTotal = max - min;

    max += dTotal * calcConfig.upAndDown;
    min -= dTotal * calcConfig.upAndDown;

    return { max, min }
}

/* 计算 成交量的 范围 */
function dealCalRangeValue(targetValue) {
    if (!isArray(targetValue) || !targetValue.length) return "dealCalRangeValue：没数据";
    const newTargetArr = targetValue.concat();
    const len = newTargetArr.length;

    newTargetArr.sort((a, b) => a.dealMount - b.dealMount);
    let max = null, min = null;
    max = (newTargetArr[len - 1].dealMount - 0);
    min = newTargetArr[0].dealMount;

    const dTotal = max - min;
    /* 上浮 */
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

/* 绘制 图形的 主要方法 */
export function kLineGraphPaint(data) {
    const QL = this;
    data = data || QL._data;

    const { _kMess: { startI, endI }, _mainCtx: ctx } = QL;

    ctx.clearRect(0, 0, QL._DOMWidth, QL._DOMHeight);

    const config = calActuallyHeight(QL, calcConfig.kLineGraph);
    // console.log(config);

    const showData = data.data.slice(startI, endI);

    // 用于外部 绘制 ui 用的信息 
    const paintConfig = {
        dealRange: {},
        valueRange: {}
    };

    let RLMin = null, RLMax = null, RYFactor = null,//这是 k 线的 走势图
        RDMin = null, RDMax = null, DDFactor = null,//这是成交量 的 图
        perRectWidth = ((QL._DOMWidth - 0) - QL._kMess.showNumber * calcConfig.kLineGraph.kLineGap) / QL._kMess.showNumber;

    Object.defineProperty(QL, "_perRectWidth", {
        get() {
            return perRectWidth
        },
        configurable: true
    })

    // 这是 开收盘图
    if (config[allGraph.rectLine]) {
        const RLRange = calRangeRect(showData);
        RLMin = RLRange.min, RLMax = RLRange.max;
        RYFactor = config[allGraph.rectLine].totalHeight / (RLMax - RLMin);

        if (!QL._gapD) {
            Object.defineProperty(QL, "_gapD", {
                get() {
                    return (perRectWidth + calcConfig.kLineGraph.kLineGap) / 2;
                },
                configurable: true
            })
        }

        // 计算 指数 对应 位置的值
        paintConfig.valueRange = calValuePos({ min: RLMin, max: RLMax, totalHeight: config[allGraph.rectLine].totalHeight, baseHeight: config[allGraph.rectLine].baseHeight, n: 5,decimal:QL._decimal });
    }
    // 这是 量图
    if (config[allGraph.rectDealMount]) {
        const RDRange = dealCalRangeValue(showData);
        RDMin = RDRange.min, RDMax = RDRange.max;
        DDFactor = config[allGraph.rectDealMount].totalHeight / (RDMax - RDMin);

        // 计算 指数 对应 位置的值
        paintConfig.dealRange = calValuePos({ min: RDMin, max: RDMax, totalHeight: config[allGraph.rectDealMount].totalHeight, baseHeight: config[allGraph.rectDealMount].baseHeight, n: 3 });

    }
    /* 
        统一绘制 分割线 --- 这里就是 对应的 时间值显示的地方
        逻辑：拿到 开收盘图 后的第一个 text 图；
    */
    (() => {
        const configKeys = Object.keys(config);
        let rectKey = configKeys.indexOf(allGraph.rectLine) + 1;
        const textReg = "text";
        while (rectKey < configKeys.length) {
            if (configKeys[rectKey].indexOf(textReg) !== -1) {
                break;
            }
            rectKey++;
        }
        const resultObj = rectKey < configKeys.length ? config[configKeys[rectKey]] : null;
        if (resultObj) {
            paintLine({
                ctx,
                sx: 0,
                sy: resultObj.baseHeight,
                ex: QL._DOMWidth,
                ey: resultObj.baseHeight,
                style: {
                    color: "#CCCCCC"
                }
            })
            paintLine({
                ctx,
                sx: 0,
                sy: resultObj.baseHeight + resultObj.totalHeight,
                ex: QL._DOMWidth,
                ey: resultObj.baseHeight + resultObj.totalHeight,
                style: {
                    color: "#CCCCCC"
                }
            })
        }
    })()
    // 绘制均线
    const paintFun = (item, x, index) => {
        calcConfig.kLineGraph.MAConfig.forEach((ma, i) => {
            // 如果 已经出现了 当前的值，就可以绘制线了
            if (MaArr[i]) {
                paintLine({
                    ctx,
                    sx: (perRectWidth + calcConfig.kLineGraph.kLineGap) * (index - 1) + perRectWidth / 2,
                    sy: config[allGraph.rectLine].baseHeight + config[allGraph.rectLine].totalHeight - (showData[index - 1][`MA${ma}`] - RLMin) * RYFactor,
                    ex: x,
                    ey: config[allGraph.rectLine].baseHeight + config[allGraph.rectLine].totalHeight - (item[`MA${ma}`] - RLMin) * RYFactor,
                    style: {
                        color: QL._theme.k.MAColor[i],
                        lineWidth: 1.5
                    }
                });
            }
            if (item[`MA${ma}`] && MaArr[i] === false) {
                MaArr[i] = true;
            }
        });
    }


    let showItem = null,
        ax, // 实际的 绘制的 中心 坐标值
        colorStroke = "#000", // 描边的 颜色
        colorFill = "#000", // rect 填充的颜色
        MaArr = calcConfig.kLineGraph.MAConfig.map(i => false); // 存储 当前 是否 可以 绘制 均线

    for (let i = 0, len = showData.length; i < len; i++) {
        showItem = showData[i];
        ax = (perRectWidth + calcConfig.kLineGraph.kLineGap) * i + perRectWidth / 2;
        showData[i].actuallyX = ax;
        showData[i].actuallyY = config[allGraph.rectLine].baseHeight + config[allGraph.rectLine].totalHeight - (showItem.close - RLMin) * RYFactor;

        const asend = showItem.close > showItem.open ? true : false;


        try {
            colorStroke = asend ? QL._theme.k.asendStroke : QL._theme.k.descStroke;
            colorFill = asend ? QL._theme.k.asendFill : QL._theme.k.descFill;
        } catch (error) {
            console.log(error);
        }

        /* 绘制 k线 走势图 */
        if (config[allGraph.rectLine]) {
            paintLine({
                ctx,
                sx: ax,
                sy: config[allGraph.rectLine].baseHeight + config[allGraph.rectLine].totalHeight - (showItem.high - RLMin) * RYFactor,
                ex: ax,
                ey: config[allGraph.rectLine].baseHeight + config[allGraph.rectLine].totalHeight - (showItem.low - RLMin) * RYFactor,
                style: {
                    color: colorStroke
                }
            })
            paintRect({
                ctx,
                sx: (perRectWidth + calcConfig.kLineGraph.kLineGap) * i,
                sy: config[allGraph.rectLine].baseHeight + config[allGraph.rectLine].totalHeight - (Math.max(showItem.close, showItem.open) - RLMin) * RYFactor,//收盘 和 开盘的最大值
                width: perRectWidth,
                height: Math.abs((showItem.close - 0) - (showItem.open - 0)) * RYFactor,
                style: {
                    fillOrStroke: strokeOrFill.all,
                    strokeColor: colorStroke,
                    fillColor: colorFill
                }
            });
            /* 绘制 指标线 */
            paintFun(showItem, ax, i);
        }
        /* 绘制 k线 成交量 */
        if (config[allGraph.rectDealMount]) {
            paintRect({
                ctx,
                sx: (perRectWidth + calcConfig.kLineGraph.kLineGap) * i,
                sy: config[allGraph.rectDealMount].baseHeight + config[allGraph.rectDealMount].totalHeight - (showItem.dealMount - RDMin) * DDFactor,
                width: perRectWidth,
                height: (showItem.dealMount - RDMin) * DDFactor,
                style: {
                    fillOrStroke: strokeOrFill.all,
                    strokeColor: colorStroke,
                    fillColor: colorFill
                }
            });
        }
    }

    /* 配置 绘制信息 */
    Object.defineProperty(QL, "_paintConfig", {
        get() {
            return paintConfig;
        },
        configurable: true
    });
    /* 暴露 给 ui 层 的 数据 */
    if (isFunction(QL.getChangeData)) {
        QL.getChangeData(showData);
    }

    Object.defineProperty(QL, "_kPaintData", {
        get() {
            return showData
        },
        configurable: true
    })
}