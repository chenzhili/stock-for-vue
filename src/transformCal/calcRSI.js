import { MA, RSI } from "./staticConfig";
import { isArray, type } from "../utils";

/**
 * 统一 的方法
 * @param {*} data 
 * @param {type,[MaN:MaN日均线],*} config 
 */
function uniformDealData(data, config) {
    if (!isArray(data) && data.length) { return data; }

    // MA均线的 算法
    if (config.type === RSI.MA) {
        return calcMA(data, config.MaN, config.key);
    }
}

/**
 * MA均线 
 * @param {*} data 数据源
 * @param {*} MaN  周期值 可能是数组 或者 是 number
 * @param {*} key  计算的键值
 */
// 说明，运用的元数据参照物，不一定用 close值，用可配置的 值，这层 这个值必须传，默认值 不在计算这层;
function calcMA(data, MaN, key) {
    let index = data.length - 1,
        item;
    if (type(MaN) === "number") {
        MaN = [MaN];
    }
    let arrN = [],
        arrCycleTotal = [];

    MaN.forEach(n => {
        arrN.push(1);
        arrCycleTotal.push(0);
    });
    if (arrN.length) {
        while (index >= 0) {
            item = data[index];
            arrCycleTotal = arrCycleTotal.map(i => (i + (+item[key])));

            MaN.forEach((n, i) => {
                if (arrN[i] === n) {
                    data[index + n - 1][`MA${n}`] = arrCycleTotal[i] / n;
                    arrN[i] = n - 1;
                    arrCycleTotal[i] -= data[index + n - 1][key];
                }
            });

            arrN = arrN.map(n => (++n))
            index--;
        }
    }
    // console.log(data);
    return data;
}



export default uniformDealData;