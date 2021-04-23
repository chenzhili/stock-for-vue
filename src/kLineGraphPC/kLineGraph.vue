<template>
  <div
    :style="{width:width,height:height}"
    :class="[styles.container,styles[`${theme}Bg`]]"
  >
    <div :class="styles.content">
      <div :class="[styles.marketMess,styles[`${theme}GenText`]]">
        <span>{{ upToData.date == null ? curData.data : upToData.date }}</span>
        <span
          v-for="(item,index) of showMess"
          :key="index"
        >
          {{ item.name || curData.date }}:
          <span
            v-if="(item.key !== 'rateUpDown'&&item.key !== 'dealMount'&&item.key!=='amount')"
            :class="{[styles[`${theme}DownColor`]]:upOrDown === 'down',[styles[`${theme}UpColor`]]:upOrDown === 'up'}"
          >{{ formatNumber(upToData[item.key] == null ? curData[item.key] : upToData[item.key],decimal) }}{{ item.key === 'rate' ? '%' : '' }}</span>
          <span
            v-if="(item.key === 'dealMount'||item.key === 'amount')"
            :class="{[styles[`${theme}DownColor`]]:upOrDown === 'down',[styles[`${theme}UpColor`]]:upOrDown === 'up'}"
          >{{ splitNumber(upToData[item.key] == null ? curData[item.key] : upToData[item.key]) }}</span>
          <!-- <span
              v-if="item.key === 'rateUpDown'"
              :class="{[styles[`${theme}DownColor`]]:upOrDown === 'down',[styles[`${theme}UpColor`]]:upOrDown === 'up'}"
            >{{formatNumber(upToData[item.key] || curData[item.key],decimal)}}</span>-->
        </span>
      </div>
      <div
        id="qlStockMarketK"
        :class="styles.qlContainer"
      >
        <!-- 添加模态框 -->
        <div
          v-if="upToData.date"
          ref="modalRef"
          :class="styles.modalMess"
          :style="{left:(upToData.reverse ? upToData.actuallyX - modalDOMMess.width: upToData.actuallyX) +'px',top:upToData.actuallyY + upToData.yValue+'px'}"
        >
          <div>
            日期:
            <span>{{ upToData.date }}</span>
          </div>
          <div
            v-for="(item,index) of showMess"
            :key="index"
          >
            {{ item.name }}:
            <span
              v-if="(item.key !== 'rateUpDown'&&item.key !== 'dealMount'&&item.key!=='amount')"
              :class="{[styles[`${theme}DownColor`]]:upOrDown === 'down',[styles[`${theme}UpColor`]]:upOrDown === 'up'}"
            >{{ formatNumber(upToData[item.key] == null ? curData[item.key] : upToData[item.key],decimal) }}{{ item.key === 'rate' ? '%' : '' }}</span>
            <span
              v-if="(item.key === 'dealMount'||item.key === 'amount')"
              :class="{[styles[`${theme}DownColor`]]:upOrDown === 'down',[styles[`${theme}UpColor`]]:upOrDown === 'up'}"
            >{{ splitNumber(upToData[item.key] == null ? curData[item.key] : upToData[item.key]) }}</span>
          </div>
        </div>
        <div
          v-if="upToData.close"
          :class="[styles.updateValue,styles[upToData.rate>0?`${theme}UpColorBg`:`${theme}DownColorBg`]]"
          :style="{top:upToData.actuallyY+'px'}"
        >
          {{ upToData.close }}
        </div>
        <!-- 显示的日期 -->
        <!-- <div
          :class="styles.updateDate"
          v-if="upToData.date"
          :style="{background:'#000',color:'#fff',top:upToDateY+'px',left:upToData.actuallyX+'px'}"
        >{{upToData.date}}</div>-->
        <!-- MA均线 -->
        <div :class="styles.updateMA">
          <template v-for="(item,index) of QLStockMarketIns._MAConfig">
            <span
              v-if="Object.keys(upToData).length?upToData[`MA${item}`]: curData[`MA${item}`]"
              :key="index"
              :class="styles.ma"
              :style="{color:QLStockMarketIns._theme.k.MAColor[index]}"
            >MA{{ item }}:{{ Object.keys(upToData).length ? formatNumber(upToData[`MA${item}`],decimal): formatNumber(curData[`MA${item}`],decimal) }}</span>
          </template>
        </div>
      </div>
      <div :class="[styles.marketMess,styles[`${theme}GenText`]]" />
      <!--预留地方-->
    </div>
    <div :class="styles.rightMess">
      <span
        v-for="(item,index) of QLStockMarketIns._paintConfig.valueRange.actuallyValue"
        :key="index"
        :class="[styles.valueItem,{[styles[`${theme}DownColor`]]:index>valueBorder,[styles[`${theme}UpColor`]]:index<valueBorder}]"
        :style="{top:`${QLStockMarketIns._paintConfig.valueRange.valueYPos[index] || 0}px`}"
      >{{ item }}</span>
      <!-- QLStockMarketIns._paintConfig.dealRange.valueYPos.length-1-index -->
      <span
        v-for="(item,index) of QLStockMarketIns._paintConfig.dealRange.actuallyValue"
        :key="QLStockMarketIns._paintConfig.valueRange.actuallyValue.length+index"
        :class="[styles.valueItem,styles[`${theme}DealMount`]]"
        :style="{top:`${QLStockMarketIns._paintConfig.dealRange.valueYPos[index] || 0}px`}"
      >{{ splitNumber(item) }}</span>
    </div>
  </div>
</template>
<script>
import styles from "../common/pc/kLineGraph.scss";

import QLStockMarket from "../core";
import { splitNumber, formatNumber } from "../utils/index";

import dealData from "../transformCal";

// 周期转换

const showMess = [
  { key: "open", name: "开" },
  { key: "high", name: "高" },
  { key: "low", name: "低" },
  { key: "close", name: "收" },
  // { key: "rateUpDown", name: "涨跌" },
  { key: "rate", name: "涨幅" },
  { key: "dealMount", name: "成交量" },
  { key: "amount", name: "成交额" }
];

/* 如果 在 传入的参数 有 需要转换 */
function preDealCurData(data, sTt = []) {
  if (data.curData && data.curData.length) {
    if (sTt.length && sTt.length === 2) {
      return dealData({ curData: data.curData }, sTt);
    } else {
      return data.curData;
    }
  } else {
    return [];
  }
}

export default {
  name: "KLineGraphCom",
  props: {
    width: {
      type: String,
      default: "100%"
    },
    height: {
      type: String,
      default: "100%"
    },
    dataGraph: {
      type: Object,
      default: function() {
        return {};
      }
    },
    config: {
      type: Object,
      default: function() {
        return {};
      }
    },
    sTt: {
      // source 到 target 的转换 ，数组(模拟字典)的格式 ['m1','m5']
      type: Array,
      default: function() {
        return [];
      }
    },
    curSTT: {
      type: Array,
      default: function() {
        return [];
      }
    }
  },
  data: function() {
    return {
      styles,

      curData: {},
      upOrDown: false, //看看当前 是 涨还是跌
      QLStockMarketIns: {
        _paintConfig: {
          valueRange: {
            actuallyValue: [],
            valueYPos: []
          },
          dealRange: {
            actuallyValue: [],
            valueYPos: []
          }
        }
      },
      valueBorder: null,
      upToData: {},
      upToDateY: 0, //就是 页面中时间显示的位置
      decimal: 100, // 默认的保留位数
      modalDOMMess: {
        width: 120,
        height: 210
      },
      freshTime: null
    };
  },
  computed: {
    showMess() {
      return showMess;
    },
    theme() {
      return this.config.theme ? this.config.theme : "light";
    }
  },
  watch: {
    'dataGraph.data': {
      // deep: true,
      handler(nv) {
        const me = this;
        const dataGraph = { data: nv } 
        const curData = preDealCurData(dataGraph, this.curSTT);
        this.QLStockMarketIns._data = {
          data: dealData({ ...dataGraph, curData }, me.sTt)
        };
      }
      // immediate: true,
    },
    sTt: {
      deep: true,
      handler(nv) {
        const me = this;
        const curData = preDealCurData(me.dataGraph, this.curSTT);
        this.QLStockMarketIns._data = {
          // data: nv.data
          data: dealData({ ...me.dataGraph, curData }, nv)
        };
      }
      // immediate: true,
    },
    curSTT: {
      deep: true,
      handler(nv) {
        const me = this;
        const curData = preDealCurData(me.dataGraph, nv);
        this.QLStockMarketIns._data = {
          // data: nv.data
          data: dealData({ ...me.dataGraph, curData }, me.sTt)
        };
      }
      // immediate: true,
    }
  },
  async mounted() {
    const curData = preDealCurData(this.dataGraph, this.curSTT);
    const dataGraph = {
      data: dealData({ ...this.dataGraph, curData }, this.sTt)
    };
    let QLStockMarketIns = new QLStockMarket({
      selector: "#qlStockMarketK",
      data: {
        kData: dataGraph
      },
      config: this.config,
      emit: {
        getUpToDataData: this.getUpToDataData.bind(this),
        getChangeData: this.getChangeData
      }
    });
    this.valueBorder =
      Math.ceil(
        QLStockMarketIns._paintConfig.valueRange.actuallyValue.length / 2
      ) - 1;
    this.upToDateY =
      QLStockMarketIns._paintConfig.valueRange.valueYPos[
        QLStockMarketIns._paintConfig.valueRange.valueYPos.length - 1
      ];
    // this.$set(this, "QLStockMarketIns", QLStockMarketIns);
    this.QLStockMarketIns = QLStockMarketIns;
    this.decimal = QLStockMarketIns._decimal;
  },
  unmounted() {
    this.QLStockMarketIns.cancelEventListener();
  },
  methods: {
    splitNumber,
    formatNumber,
    /* 在 hover 事件 的运用 */
    getUpToDataData(data) {
      this.freshTime || clearTimeout(this.freshTime);
      this.upToData = data;
      // console.log('this.upToData', this.upToData)
      // 判定当前 是 涨还是 跌;
      this.upOrDown = this.upToData.rate - 0 < 0 ? "down" : "up";
      this.freshTime = setTimeout(() => {
        const modalDOM = this.$refs.modalRef;
        let width = this.modalDOMMess.width;
        let height = this.modalDOMMess.height;
        debugger;
        if (modalDOM) {
          const mess = getComputedStyle(modalDOM);
          /* width操作 */
          width = parseFloat(mess.width);
          if (width > this.modalDOMMess.width) {
            // this.$set(this.modalDOMMess, "width", width);
            this.modalDOMMess.width = width;
          } else {
            width = this.modalDOMMess.width;
          }

          /* height 操作 */
          height = parseFloat(mess.height);
          // this.$set(this.modalDOMMess, "height", height);
          this.modalDOMMess.height = height;
        }
        /* 对于模态 上的 显示问题 */
        // width
        if (this.QLStockMarketIns._DOMWidth - data.actuallyX <= width) {
          // this.$set(this.upToData, "reverse", true);
          this.upToData.reverse = true;
        }
        // height
        let dValue = 0;
        if (
          (dValue =
            this.QLStockMarketIns._DOMHeight -
            this.upToData.actuallyY -
            height) < 0
        ) {
          // this.$set(this.upToData, "yValue", dValue);
          this.upToData.yValue = dValue;
        } else {
          // this.$set(this.upToData, "yValue", 0);
          this.upToData.yValue = 0;
        }
      });
    },
    /* 当页面 发生移动 或者 缩放的时候 做的 */
    getChangeData(data) {
        // console.log("=======sdfsdfdsf========", data);
      // this.$set(this, "curData", data[data.length - 1]);
      if (data.length) {
        this.curData = data[data.length - 1];
        this.upOrDown = this.curData.rate < 0 ? "down" : "up";
      }
    }
  }
};
</script>

