import { isObject, isString, isFunction, browserRedirect, getDecimalValue } from "../utils"
import { insType, Theme, calcConfig } from "../enums"

import { initTimeSharingDiagram, paintTimeSharingDiagram } from "./timeSharingDiagram"
import { initkLineGraph, kLineGraphPaint } from "./kLineGraph"

export default function initCanvas(QLStockMarket) {
    QLStockMarket.prototype.init = function (options) {
        const QL = this;
        if (!isObject(options)) return "数据格式不对";

        const { selector, data, config, emit, frameName } = options;
        

        if (isObject(emit) && isFunction(emit.getUpToDataData)) {
            Object.defineProperty(QL, "getUpToDataData", {
                get() {
                    return emit.getUpToDataData;
                }
            })
        }

        if (isObject(emit) && isFunction(emit.getChangeData)) {
            Object.defineProperty(QL, "getChangeData", {
                get() {
                    return emit.getChangeData;
                }
            })
        }

        if (!selector) return "没有入口文件";
        const DOM = document.querySelector(selector);
        if (!DOM) return "入口node未找到";

        const { width: actuallyWidth, height: actuallyHeight } = DOM.getBoundingClientRect();
        let { "border-left-width": leftWidth, "border-right-width": rightWidth, "border-top-width": topWidth, "border-bottom-width": bottomWidth, width, height } = getComputedStyle(DOM);
        width = parseFloat(width);
        height = parseFloat(height);
        const device = browserRedirect();

        /* 判断当前 盒子是否 发生了 旋转，旋转以后 事件上 需要 传入不同的参数 */
        let rotate = false;
        if (Math.ceil(width) !== Math.ceil(actuallyWidth) && Math.ceil(width) === Math.ceil(actuallyHeight)) {
            rotate = true;
        }


        dealTheme(QL, config.theme);

        (function (QL) {
            let tempData = null;
            if (config.insType === insType.timeSharingDiagram) {
                tempData = data.chartData
            }
            if (config.insType === insType.kLineGraph) {
                tempData = data.kData
            }
            // 配置只读属性
            Object.defineProperties(QL, {
                _rotate: {
                    get () {
                        return rotate;
                    }
                },
                // 初始化 小数位数
                _decimal: {
                    get() {
                        if (!tempData.data.length) {
                            return 100;
                        } else {
                            if (config.insType === insType.timeSharingDiagram) {
                                return getDecimalValue(tempData.data[0].curPrice);
                            }
                            if (config.insType === insType.kLineGraph) {
                                return getDecimalValue(tempData.data[0].close);
                            }
                        }
                    },
                    configurable: true
                },
                _defulatSale: {
                    get() {
                        return window.devicePixelRatio || 1;
                    }
                },
                _DOM: {
                    get() {
                        return DOM
                    }
                },
                _DOMWidth: {
                    get() {
                        return width - (parseFloat(leftWidth) + parseFloat(rightWidth))
                    }
                },
                _DOMHeight: {
                    get() {
                        return height - (parseFloat(topWidth) + parseFloat(bottomWidth));
                    }
                },
                _frameName:{
                    get() {
                        return frameName
                    }
                },
                _device: {
                    get() {
                        return device
                    }
                },
                _insType: {
                    get() {
                        return config.insType
                    }
                },
                // 这个值 是 可以 被 配置的
                _data: {
                    get() {
                        return tempData
                    },
                    set(newValue) {
                        /* 出现了指标线 计算，需要在 set的 时候，将获取到的 值 进行 处理 */
                        let typeData = config.insType === insType.timeSharingDiagram ? { chartData: newValue } : { kData: newValue };

                        typeData = QL.outputData({ ...options, data: typeData });

                        if (config.insType === insType.timeSharingDiagram) {
                            // console.log(newValue);
                            tempData = typeData.chartData;

                            // 修改 小数位数
                            Object.defineProperty(QL, "_decimal", {
                                get() {
                                    if (tempData.data.length) {
                                        return 100;
                                    } else {
                                        return getDecimalValue(tempData.data[0].curPrice);
                                    }
                                },
                                configurable: true
                            })

                            /* 这里 进行重绘 */
                            QL.paintTimeSharingDiagram(tempData);
                        }
                        if (config.insType === insType.kLineGraph) {
                            tempData = typeData.kData;
                            /* 初始化 展示的 数量 的 区间 范围,并存储到 实例中，为了 做 事件的 时候使用 */
                            let startI = tempData.data.length - calcConfig.kLineGraph.initShowN, endI = tempData.data.length;
                            Object.defineProperties(QL, {
                                "_kMess": {
                                    get() {
                                        return {
                                            startI,
                                            endI,
                                            showNumber: calcConfig.kLineGraph.initShowN
                                        }
                                    },
                                    configurable: true
                                },
                                "_decimal": {
                                    get() {
                                        if (tempData.data.length) {
                                            return 100;
                                        } else {
                                            return getDecimalValue(tempData.data[0].close);
                                        }
                                    },
                                    configurable: true
                                }
                            })

                            /* 这里 进行重绘 */
                            // console.log('====重绘', tempData);
                            QL.kLineGraphPaint(tempData);
                        }
                    },
                    configurable: true
                }
            })
        })(QL)


        // 这里要对 不同的实例 做 不同的 初始化
        console.log('config.insType === insType.timeSharingDiagram', config.insType, insType.timeSharingDiagram)
        if (config.insType === insType.timeSharingDiagram) {
            initTimeSharingDiagram(QL, data.chartData);
        }
        if (config.insType === insType.kLineGraph) {
            initkLineGraph(QL, data.kData)
        }


        // // 初始化 所有监听事件，在 内部 进行 区分 客户端
        QL.eventInit();
    }

    // 初始化 时分秒 方法 需要 暴露出去
    QLStockMarket.prototype.paintTimeSharingDiagram = paintTimeSharingDiagram;

    // 绘制 k线 图
    QLStockMarket.prototype.kLineGraphPaint = kLineGraphPaint;
}

/* 处理 主题，这里可能 对应的 值 不存在，在内部 初始化的时候需要 设置 默认值 */
function dealTheme(QL, theme) {
    let defaultTheme = "light", paintTheme = null;
    if (isString(theme)) {
        defaultTheme = Theme[theme] ? theme : "light";
        paintTheme = Theme[defaultTheme];
    }

    if (isObject(theme)) {
        paintTheme = theme;
    }
    // console.log(paintTheme);
    Object.defineProperty(QL, "_theme", {
        get() {
            return paintTheme
        }
    })
}