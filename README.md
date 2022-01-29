# 项目描述

面向**股市走势**开发的**k 线 和 分时线** 插件，并且分别适配 **h5 和 pc** 版本和支持自定义主题，此插件主要面向**vue-next(vue3)**用户，如果是**vue2**用户[**请点击**](https://www.npmjs.com/package/stock-market-graph)

# [项目存放地址](https://github.com/chenzhili/stock-for-vue)

测试地址在 /example 里

# 主要用法

```shell
# 安装
# npm
npm i stock-for-vue --save
# yarn
yarn add stock-for-vue
```

## 1. js 引入

```javascript
//1、 拿到 Vue 的 实例
const app = createApp({
  render: () => h(App),
})
//2、 全局引入
import StockForVue from 'stock-for-vue'
app.install(StockForVue)
//或者 按需引入
import { kLineGraphPC } from 'stock-for-vue/kLineGraphPC' // 相关插件都是这样引入
app.install(StockForVue)
```

## 2. 引用地方

```md
> 1.  PC

<!-- 分时线 -->

<TimeSharing :dataGraph="dataGraphForTime" :config="configForTime" :frameName="frame"></TimeSharing>

<!-- k线 -->

<KLineGraphCom :dataGraph="dataGraphForK" :config="configForK" :sTt="sTt"></KLineGraphCom>

> 2.  H5

<!-- 分时线 -->

<TimeSharingH5 :dataGraph="dataGraphForTime" :config="configForTime" :frameName="frame"></TimeSharingH5>

<!-- k线 -->

<KLineGraphComH5 :dataGraph="dataGraphForK" :config="configForK" :sTt="sTt"></KLineGraphComH5>
```

```typescript
// 对应的 数据结构及意义
/* 1、 k线相关 */
interface KDataObj {
    date: string,               // 格式化的 日期
    dealMount: number|string,   // 成交量，string也是 数值的 字符串
    open: number|string,        // 开盘价，string也是 数值的 字符串
    high: number|string,        // 最高价，string也是 数值的 字符串
    low: number|string,         // 最低价，string也是 数值的 字符串
    close: number|string,       // 收盘价，string也是 数值的 字符串
    rate: number|string         // 收益率，string也是 数值的 字符串
}
interface KDataGraph {
    data: Array<KDataObj>
}
const dataGraphForK: KDataGraph; // 数据结构在上面

/* 2、分时线相关 */
interface TDatObj {
    time: string,               // 格式化的 时间，string也是 数值的 字符串
    curPrice: number|string,    // 当前加，string也是 数值的 字符串
    rate: number|string,        // 收益率，string也是 数值的 字符串
    totalMoney: number|string,  // 成交总价，string也是 数值的 字符串
    avPrice: number|string,     // 成交均价，string也是 数值的 字符串
    dealMount: number|string    // 成交量，string也是 数值的 字符串
}
interface TDataGraph {
    data: Array<TDatObj>,
    preClosePrice: number|string // 昨结价，string也是 数值的 字符串
}
const dataGraphForTime: TDataGraph; // 数据结构在上面

/* 统一参数 */
// 1、config 参数
type Color = string;    // 只能是 颜色 相关的 rgba,rgb,#xxx 相关表现颜色的
interface Theme {
    time: {
        dealMount: {
            even: Color,    // 偶数
            odd: Color,     // 奇数
        },
        text: {
            asend: Color,   // 升序
            desc: Color     // 降序
        },
        line: {
            curPrice: Color,// 现价
            avPrice: Color, // 均价
        },
    },
    k: {
        descFill: Color,    // 下降的填充色
        descStroke: Color,  // 下降的轮廓颜色
        asendFill: Color,   // 上升的填充色
        asendStroke: Color, // 上升的轮廓颜色
        MAColor: [Color, Color, Color] // 均线的颜色
    },
    bg: Color, // 背景色
    maskLine: Color // 操作线的颜色
}
interface Config {
    insType: '1' | '0',             // 实例化的类型 '0'：分时线， '1'： k线
    theme?: 'light' | 'dark' | Theme,// 不填默认为 light
    initShowN?: number,              // 初始展现 k线的个数，不填默认为 20
    hideDealGrid?: bool,             // 是否显示 交易量
    MAConfig?: Array<number>          // 均线相关
}
const config: Config; // 配置 相关参数

// 2、frameName 相关 ------------ 用于 控制不同 市场 时间范围的 绘制，包括 A股相关，港股，夜间期货等
type FrameName = 'a' | 'hk' | 'night1' | 'night2';
const frame?:FrameName; // 可不传，默认是 A股相关时间区域

// 3、sTt 可以用小的时间转换 为 大的 时间，如 一分钟 转 五分钟， 可不传
    /*
        source:
            m1: 1,  //1分钟
            m15: 15, //15分钟
            d: 65, //  日
            M: 75  // 月
    */
    type Source = 'm1' | 'm15' | 'd' : 'M';
    /*
        target:
            m5: 5,  //五分钟
            m30: 30, //30分钟
            m60: 60, //60分钟
            w: 70,   //周
            q: 80,   // 季度
            hy: 90,  //半年
            y: 100  // 年
    */
type Target = 'm5' | 'm30' | 'm60' | 'w' | 'q' | 'hy' | 'y'

const sTt?:Array[Source, Target]; // 并且注意 转换上 source 必须 小于 target

// 4、 对于插件的 容器 尺寸-----可不传
const width?: string;   // 默认是 100%
const height?: string;  // 默认是 100%

```

# 相关插件名

kLineGraphPC,TimeSharingPC,kLineGraphForH5,TimeSharingH5
