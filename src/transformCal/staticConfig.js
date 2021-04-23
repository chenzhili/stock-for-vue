/* 周期  */
// 转换目标
const periodConfig = Object.freeze({
    m5: 5,
    m15: 15,
    m30: 30,
    m60: 60,
    w: 70,
    q: 80,
    hy: 90,
    y: 100
});

// 元数据列表
const staticPeriod = Object.freeze({
    m1: 1,
    m15: 15,
    d: 65,
    M: 75
});
export { periodConfig, staticPeriod }

/* 指标线 */
// MA 指标线
const MA = Object.freeze({
    ma5: 5,
    ma10: 10,
    ma30: 30,
});
const RSI = Object.freeze({
    MA: "MA"
});


export { MA, RSI }