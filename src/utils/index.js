import { pcOrH5 } from "../enums"

/* 统一 文件 出口 */
// import {} from "./calculation"
import { paintLine, paintRect } from "./paintCom"
import { isString, isNumber, isBoolean, isArray, isObject, isFunction, isNull, isUndefined, type } from "./types"

export {
    paintLine, paintRect,
    isString, isNumber, isBoolean, isArray, isObject, isFunction, isNull, isUndefined, type
}

/* 判断 当前 是 pc 还是 h5 */
export function browserRedirect() {
    var sUserAgent = navigator.userAgent.toLowerCase();
    if (/ipad|iphone|midp|rv:1.2.3.4|ucweb|android|windows ce|windows mobile/.test(sUserAgent)) {
        return pcOrH5.h5
    } else {
        return pcOrH5.pc
    }
}
// 1 0000 0000 0000 0000 
/* 判断当前的 数值的 大小进行 不同 的格式化 */
export function splitNumber(num) {
    num = parseFloat(num);
    if (isNaN(num)) {
        return "无效数据";
    }
    num = Math.round(num * 100) / 100;
    const len = num.toString().split(".")[0].length;
    if (len > 16) {
        num = Math.round(num / (1e16) * 100) / 100 + "兆";
    } else if (len > 12) {
        num = Math.round(num / (1e12) * 100) / 100 + "万亿";
    } else if (len > 8) {
        num = Math.round(num / (1e8) * 100) / 100 + "亿";
    } else if (len > 4) {
        num = Math.round(num / (1e4) * 100) / 100 + "万";
    }
    return num;
}

/* 计算 对应的 坐标 系数 */
export function calValuePos({ min, max, factorMaxInc, totalHeight, baseHeight, n, decimal = 100 }) {
    // console.log(totalHeight);
    decimal = decimal == 0 ? 1 : decimal;
    const valueIncrement = (max - min) / (n - 1), yPosIncrement = totalHeight / (n - 1);
    const config = {
        actuallyValue: [],
        valueYPos: [],
    };
    let f = null;
    if (factorMaxInc) {
        f = factorMaxInc / ((n - 1) / 2);
        config.factorInc = [];
    }
    
    return new Array(n).fill(1).reduce((prev, next, index) => {
        let tempValue = max - index * valueIncrement;
        tempValue = (parseInt(tempValue * decimal) / decimal).toFixed((decimal + '').length-1);
        let tempPos = parseInt((baseHeight + index * yPosIncrement) * 100) / 100;
        let tempF = f ? parseInt((factorMaxInc - f * index) * 100) / 100 : null;
        prev.actuallyValue.push(tempValue);
        prev.valueYPos.push(tempPos);
        f && prev.factorInc.push(tempF);
        return prev;
    }, config);
}

/* 统一处理需要的位数 */
export function getDecimalValue(value) {
    value += "";
    if (!value.split(".")[1]) {
        return 0;
    }
    let len = value.split(".")[1].length;
    value = "1";
    while (len > 0) {
        value += 0;
        len--;
    }
    return (+value);
}
/* 格式化 数 */
export function formatNumber(number, decimal) {
    if (decimal === 0) {
        return '' + number;
    }
    return ((parseInt(number * decimal) / decimal).toFixed((decimal + '').length - 1));
}