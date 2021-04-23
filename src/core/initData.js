import { insType, Theme, calcConfig, allGraph } from "../enums"
import { isObject, isString, isFunction, isArray } from "../utils"
import { uniformDealData, MA, RSI } from "../transformCal"


export default function initData(QLStockMarket) {
    // 产出数据
    QLStockMarket.prototype.outputData = function (options) {
        // console.log(options);
        // 如果 数据格式 不满足条件
        if (!isObject(options)) { return {}; }

        const QL = this;
        const { data, config } = options;


        // 走势图
        if (config.insType === insType.timeSharingDiagram) {
            return { chartData: data.chartData };
        }

        // k线图
        if (config.insType === insType.kLineGraph) {
            /* 初始化配置数据 */
            initKLineGraphConfig(config, calcConfig);
            // 初始化外部的配置项
            calcConfig.kLineGraph = config;

            // MA均线配置
            Object.defineProperties(QL, {
                _MAConfig: {
                    get() {
                        return calcConfig.kLineGraph.MAConfig
                    },
                    configurable: true
                },
            });

            /* 配置需要绘制的指标线 */
            const RSIConfig = {
                [RSI.MA]: {
                    type: RSI.MA,
                    key: calcConfig.kLineGraph.MAkey,
                    MaN: calcConfig.kLineGraph.MAConfig
                }
            }
            // 计算 均线MA
            return { kData: { data: uniformDealData(data.kData.data, RSIConfig[RSI.MA]) } };
        }

        return {};

    }
}


/**
 * 初始化k线config配置
 * @param {*} config 目标config
 * @param {*} staticConfig 参照config
 */
function initKLineGraphConfig(config, staticConfig) {
    // 对于显示区域的grid的配置
    const i = staticConfig.kLineGraph.sort.indexOf(allGraph.rectDealMount);
    config.sort = [...staticConfig.kLineGraph.sort];
    if (config.hideDealGrid) {
        if (i !== -1) {
            config.sort.splice(i, 1);
            config[`${allGraph.rectLine}Height`] = 1;
        }
    } else {
        if (i === -1) {
            config.sort.push(allGraph.rectDealMount);
            config[`${allGraph.rectLine}Height`] = 3 / 4;
        }
    }
}