import { isObject, type } from "../utils";
import { MA } from "../transformCal";

export const allGraph = Object.freeze({
    line: "line",
    dealMount: "dealMount",
    text: "text",
    rectLine: "rectLine",
    rectDealMount: "rectDealMount",
})
const kLineGraphConfig = {
    showMinData: 10,//最少 canvas 显示的 数据条数
    showMaxData: 200,//最多 canvas 显示 的 数据条数
    scaleOrSkewN: 6,//没缩放 一次 需要 减少 或者 增多 的个数
    kLineGap: 4,//图形之间的间距
    [`${allGraph.rectLine}Height`]: 3 / 4,//k线的 走势图
    [`${allGraph.rectDealMount}Height`]: 1 / 4,//k线的 量图
    sort: [allGraph.text, allGraph.rectLine, allGraph.text, allGraph.rectDealMount],//在 canvas中 对于 不同模块在 纵轴方向的 排列
    initShowN: 20,//这里可能 到时候 获取 屏幕 尺寸 进行 调整，canvas 需要 展示的 多少数量 

    /* 标准均线需要的配置 */
    MAConfig: [MA.ma5, MA.ma10, MA.ma30], // 默认配置 MA 均线的 数据展示 数
    MAkey: "close",
};

export const calcConfig = {
    get upAndDown() { return 0.05 },//存储 最大 最小 范围的 上浮和下浮的 比例
    get lineGap() { return 20; },//统一 在 canvas 中 对于 文字 的 留白 高度

    get timeSharingDiagram() { //分时图 的 配置信息
        return ({
            [`${allGraph.line}Height`]: 7 / 12, //曲线 占比
            [`${allGraph.dealMount}Height`]: 5 / 12,//成交量占比
            sort: [allGraph.line, allGraph.text, allGraph.dealMount/* , allGraph.text */],//在 canvas中 对于 不同模块在 纵轴方向的 排列
        });
    },

    get kLineGraph() { //k线图 包括 n 日的 配置信息 
        return kLineGraphConfig;
    },
    set kLineGraph(nv) { // {key:value}
        if (!isObject(nv)) { return };
        Object.keys(nv).forEach(key => {
            // 存在这个值 并且数据类型要一样
            if (kLineGraphConfig[key] && type(kLineGraphConfig[key]) === type(nv[key])) {
                kLineGraphConfig[key] = nv[key];
            }
        });
    }
};