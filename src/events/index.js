import $ from "jquery";
// import { debounce } from "lodash"
import debounce from '../utils/debounce'
import Hammer from "hammerjs"
import { isFunction } from "../utils/types"

import { pcOrH5 } from "../enums/device"
import { insType } from "../enums"
import { paintLine } from "../utils/paintCom"
import { calcConfig } from "../enums/calcEnum"

export default function initEvent (QLStockMarket) {
    QLStockMarket.prototype.eventInit = async function () {
        const QL = this;
        const DOM = QL._DOM, device = QL._device, ins = QL._insType;
        /* 记录 上一个位置 */
        QL.prevX = null;
        /* 判断 不同的 客户端 */
        if (device === pcOrH5.pc) {
            // 最后合并
            Object.defineProperty(QL, "_isLeave", {
                get () {
                    return false
                },
                configurable: true
            })
            $(DOM).on(`mouseenter.${ins}`, mouseEnter.bind(QL));
            /* 监听 事件 是否 移除画布 */
            $(QL._DOM).on(`mouseleave.${ins}`, mouseLeave.bind(QL));
        }

        if (device === pcOrH5.h5) {
            // console.log("=======", "h5");
            const hammer = new Hammer(DOM);

            Object.defineProperty(QL, "_hammer", {
                get () {
                    return hammer
                },
                configurable: true
            })

            hammer.on("press", touchPress.bind(QL));

            if (QL._insType === insType.kLineGraph) {
                hammer.on("panstart", mouseDown.bind(QL));

                hammer.get('pinch').set({ enable: true });
                hammer.on("pinchstart", touchPinch.bind(QL))
            }
        }
    }
    QLStockMarket.prototype.cancelEventListener = function () {
        const QL = this;
        if (QL._device === pcOrH5.pc) {
            // 最后合并
            $(QL.DOM).off(`mouseenter.${QL._insType}`);
            $(QL.DOM).off(`mousemove.${QL._insType}`);
            $(QL.DOM).off(`mouseleave.${QL._insType}`);
            if (QL._insType === insType.kLineGraph) {
                $(QL._DOM).off(`wheel.${QL._insType}`);

                $(QL._DOM).off(`mousedown.${QL._insType}`);
                $(document).off("mouseup.QL");
                $(QL._DOM).off(`mousemove.${QL._insType}2`);
            }
            return;
        }
        if (QL._device === pcOrH5.h5) {
            QL._hammer.off("panstart panmove panend press tap");
        }

    }
}
/* 
    H5
*/
/* 判定当前 是 长按 */
function touchPress (e) {
    const QL = this;
    const hammer = QL._hammer;
    hammer.off("panstart panmove panend");
    mouseMove.call(QL, e);
    const move = function (e) {
        if (e.type === "tap") {
            // console.log("=====","tap");
            QL._maskCtx.clearRect(0, 0, QL._DOMWidth, QL._DOMHeight);
            if (isFunction(QL.getUpToDataData)) {
                QL.getUpToDataData({});
            }
            hammer.off("tap");
        }
        if (e.type === "panstart") {
            mouseMove.call(QL, e);
            return
        }
        if (e.type === "panmove") {
            mouseMove.call(QL, e);
            return
        }
        if (e.type === "panend") {
            hammer.off("panmove panend");
            hammer.off("panstart", move);
            hammer.on("panstart", mouseDown.bind(QL));
            return
        }
    }
    hammer.on("panstart panmove panend tap", move)
}
/* 判定当前位 pinch 事件 */
function touchPinch () {
    const QL = this;
    QL._hammer.on("pinchout pinchin pinchend", function (e) {
        if (e.type === "pinchout") {
            scalOrSkewForH5.call(QL, e);
        }
        if (e.type === "pinchin") {
            scalOrSkewForH5.call(QL, e);
        }
        if (e.type === "pinchend") {
            QL._hammer.off("pinchout pinchin pinchend");
        }
    })
}

/* 

    PC
*/
/* 需要 绑定一系列事件，来取消 绑定，防止 内存溢出 */
function mouseEnter (e) {
    // console.log("enter");
    /* 这里 进行 重新 绑定 move 事件 */
    const QL = this;
    Object.defineProperty(QL, "_isLeave", {
        get () {
            return false
        },
        configurable: true
    })
    $(QL._DOM).on(`mousemove.${QL._insType}`, mouseMove.bind(QL));
    if (QL._insType === insType.kLineGraph) {

        $(QL._DOM).on(`wheel.${QL._insType}`, scalOrSkew.bind(QL));

        $(QL._DOM).on(`mousedown.${QL._insType}`, mouseDown.bind(QL));
    }
}
function mouseLeave (e) {
    // console.log("leave");
    /* 清楚 move 事件 */
    const QL = this;
    if (QL._isLeave) return;
    Object.defineProperty(QL, "_isLeave", {
        get () {
            return true
        },
        configurable: true
    })
    if (isFunction(QL.getUpToDataData)) {
        QL.getUpToDataData({});
    }
    QL._maskCtx.clearRect(0, 0, QL._DOMWidth, QL._DOMHeight);
    $(QL._DOM).off(`mousemove.${QL._insType}`);
    if (QL._insType === insType.kLineGraph) {

        $(QL._DOM).off(`wheel.${QL._insType}`)

        $(QL._DOM).off(`mousedown.${QL._insType}`);
    }

}

/*

    public
*/
/* pc 画布上的 mousemove 的事件 ,h5 上的 长按 然后 move 事件 */
function mouseMove (e) {
    // console.log("move", e);
    const QL = this;
    // 这里 根据 设备端 的不同
    const x = QL._device === pcOrH5.pc ? e.offsetX : e.center[QL._rotate ? 'y' : 'x'];

    // 如果 对应的 x 的变动 不在 刷新范围内，就直接退出
    if (Math.abs(QL.prevX - x) <= QL._gapD) {
        return "不需要重绘";
    }

    /* 实际 需要 查找的 数据 */
    const actuallyData = QL._insType === insType.timeSharingDiagram ? QL._data.data : QL._kPaintData;
    // 需要 判定的 实际 坐标系 
    const existObj = actuallyData.find(z => Math.abs(z.actuallyX - x) <= QL._gapD);
    if (existObj) {
        QL._maskCtx.clearRect(0, 0, QL._DOMWidth, QL._DOMHeight);
        paintLine({
            ctx: QL._maskCtx,
            sx: existObj.actuallyX,
            sy: 0,
            ex: existObj.actuallyX,
            ey: QL._DOMHeight,
            style: {
                setLineDash: [2],
                color: QL._theme.maskLine || "#000"
            }
        });
        paintLine({
            ctx: QL._maskCtx,
            sx: 0,
            sy: existObj.actuallyY,
            ex: QL._DOMWidth,
            ey: existObj.actuallyY,
            style: {
                setLineDash: [2],
                color: QL._theme.maskLine || "#000"
            }
        });
        if (isFunction(QL.getUpToDataData)) {
            QL.getUpToDataData(existObj);
        }

    }
    QL.prevX = x;
}

/* 对于 k 线图 需要的 缩放 方法 */
// 这是对于 pc 的
function scalOrSkew (e) {
    e.preventDefault();

    const QL = this;

    const { layerX: x } = e.originalEvent;

    // 判定当前缩放
    const delta = (e.originalEvent.wheelDelta && (e.originalEvent.wheelDelta > 0 ? -1 : 1)) ||  // chrome & ie

        (e.originalEvent.detail && (e.originalEvent.detail > 0 ? -1 : 1));              // firefox

    calSES(QL, calcConfig.kLineGraph.scaleOrSkewN * delta, x);
}
// 这是 h5 的 
function scalOrSkewForH5 (e) {
    e.preventDefault();
    const QL = this;
    const { scale, center: { x } } = e;
    const ssValue = Math.floor(calcConfig.kLineGraph.scaleOrSkewN * (1 - scale));
    calSES(QL, ssValue, x);
}
/* 计算  startI,endI,showNumber 的值 */
/* 
ssValue:是带有 符号的 放大缩小倍数
    负数 变少,是 将 showNumber 减少
    整数 变多 , 是 将 showNumber 增多
    showMinData: 10,//最少 canvas 显示的 数据条数
    showMaxData: 200,//最多 canvas 显示 的 数据条数
    initShowN = showNumber = 20; 初始值
*/
function calSES (QL, ssValue, posX) {
    let { _kMess: { startI, endI, showNumber }, _DOMWidth: width, _data: data } = QL;

    const { kLineGraph: { showMaxData, showMinData } } = calcConfig;

    const borderRight = data.data.length, borderLeft = 0;
    /* 
        判断逻辑：
        1、先判断当前是 放大 还是 缩小，再用 现有的 showNumber 和 showMaxData 或者 showMinData 这个两个 范围值进行比较，如果在范围内 再有 后续操作；
        2、如果在范围内(有放大或者缩小的空间)，在 计算 用现有的 比例 计算出对应的值；
        3、判定 两个边界值，如果 都超出了 边界值或者有另一边超出，就删去超出的部分进行 放大 缩小；
    */
    //    这块逻辑处理有问题，到时候看看；
    if ((ssValue > 0 && (showNumber >= Math.min(showMaxData, borderRight))) || (ssValue < 0 && Math.min(showNumber, borderRight) <= showMinData)) {
        return "不能进行操作了";
    }

    let leftN = Math.ceil(posX / width * ssValue); //带符号，左边界移动的个数
    let rightN = ssValue - leftN;//带符号，有边界移动的个数

    startI -= leftN, endI += rightN;

    let leftDValue = 0, rightDValue = 0;


    if (ssValue > 0) {
        // console.log("整数 变多");
        /* 变多的逻辑 */
        if (startI < borderLeft) {
            // console.log("startI", startI, leftN);
            leftDValue = Math.abs(startI);
            startI = borderLeft;
        }
        if (endI > borderRight) {
            // console.log("endI", endI, rightN);
            rightDValue = Math.abs(endI - borderRight);
            endI = borderRight;
        }

    } else {
        // console.log("负数 变少");
        /* 这是变少的逻辑 */
        if (endI > startI) {
            if ((endI - startI) < showMinData) {
                const moreN = showMinData - (endI - startI);
                leftDValue = Math.ceil(posX / width * moreN);
                rightDValue = moreN - leftDValue;
                startI -= leftDValue;
                endI += rightDValue;
            }
        } else {
            return "放大的量出问题了";
        }
    }
    showNumber = endI - startI;
    Object.defineProperty(QL, "_kMess", {
        get () {
            return {
                startI,
                endI,
                showNumber
            }
        },
        configurable: true
    })

    QL._mainCtx.clearRect(0, 0, QL._DOMWidth, QL._DOMHeight);
    QL._maskCtx.clearRect(0, 0, QL._DOMWidth, QL._DOMHeight);
    QL.kLineGraphPaint();
}

/* 页面 进行 translate 的 逻辑 */
function mouseDown (e) {
    const QL = this;

    // 这里 根据 设备端 的不同
    const eventPos = QL._device === pcOrH5.pc ? 'offsetX' : (QL._rotate ? 'deltaY' : 'deltaX');
    let preX = e[eventPos];

    const mousemove2 = function mousemove2 (e) {

        const curX = e[eventPos];

        let { _kMess: { startI, endI, showNumber }, _perRectWidth: perRectWidth, _data: data } = QL;

        /* 这的计算可能 还要考虑下 */
        const n = Math.abs(curX - preX) / perRectWidth,
            delta = curX - preX > 0 ? 1 : -1;

        // console.log(n);

        const borderRight = data.data.length, borderLeft = 0;

        startI -= n * delta, endI -= n * delta;
        if (startI < borderLeft) {
            // console.log(startI, borderLeft, "不能左移了");
            return "不能左移了"
        }
        if (Math.floor(endI) > borderRight) {
            // console.log(endI, borderRight,"不能右移了");
            return "不能右移了"
        }

        Object.defineProperty(QL, "_kMess", {
            get () {
                return {
                    startI,
                    endI,
                    showNumber
                }
            },
            configurable: true
        })

        preX = curX;

        QL._mainCtx.clearRect(0, 0, QL._DOMWidth, QL._DOMHeight);
        QL._maskCtx.clearRect(0, 0, QL._DOMWidth, QL._DOMHeight);
        QL.kLineGraphPaint();


        // console.log("第二个 mousemove");
    };
    if (QL._device === pcOrH5.pc) {
        $(QL._DOM).on(`mousemove.${QL._insType}2`, debounce(mousemove2.bind(QL)));
        $(document).on("mouseup.QL", function () {
            $(QL._DOM).off(`mousemove.${QL._insType}2`)
        })
    }

    if (QL._device === pcOrH5.h5) {
        QL._hammer.on("panmove", mousemove2.bind(QL))
        QL._hammer.on("panend", function () {
            QL._hammer.off("panmove panend");
        })
    }

}
