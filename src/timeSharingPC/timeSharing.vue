<template>
  <div
    :style="{width:width,height:height}"
    :class="[styles.container,styles[`${theme}Bg`]]"
  >
    <div :class="styles.leftMess">
      <span
        v-for="(item,index) of QLStockMarketIns._paintConfig.valueRange.actuallyValue"
        :key="index"
        :class="[styles.valueItem,{[styles[`${theme}DownColor`]]:index>valueBorder,[styles[`${theme}UpColor`]]:index<valueBorder}]"
        :style="{top:`${QLStockMarketIns._paintConfig.valueRange.valueYPos[index] || 0}px`}"
      >{{ item }}</span>
    </div>
    <div :class="styles.content">
      <div :class="[styles.marketMess,styles[`${theme}GenText`]]">
        <span>{{ upToData.time || curData.time }}</span>
        <span
          v-for="(item,index) of showMess"
          :key="index"
        >
          {{ item.name }}:
          <span
            v-if="item.key==='rateUpDown'"
            :class="{[styles[`${theme}DownColor`]]:upOrDown === 'down',[styles[`${theme}UpColor`]]:upOrDown === 'up'}"
          >{{ formatNumber((upToData.curPrice?upToData.curPrice:curData.curPrice) - dataGraph.preClosePrice,decimal) }}</span>

          <span
            v-else-if="item.key==='dealMount' || item.key==='totalMoney'"
            :class="{[styles[`${theme}DownColor`]]:upOrDown === 'down',[styles[`${theme}UpColor`]]:upOrDown === 'up'}"
          >{{ splitNumber(upToData[item.key] == null ? curData[item.key] : upToData[item.key]) }}</span>

          <span
            v-else-if="item.key==='rate'"
            :class="{[styles[`${theme}DownColor`]]:upOrDown === 'down',[styles[`${theme}UpColor`]]:upOrDown === 'up'}"
          >{{ splitNumber(upToData[item.key] == null ? curData[item.key] : upToData[item.key]) }}%</span>

          <span
            v-else-if="item.key==='curPrice'||item.key==='avPrice'"
            :class="{[styles[`${theme}DownColor`]]:upOrDown === 'down',[styles[`${theme}UpColor`]]:upOrDown === 'up'}"
          >{{ formatNumber(upToData[item.key] == null ? curData[item.key] : upToData[item.key],decimal) }}</span>
        </span>
      </div>
      <div
        id="qlStockMarketT"
        :class="styles.qlContainer"
      >
        <div
          v-if="upToData.curPrice"
          :class="styles.updateValue"
          :style="{background:'#f00',top:upToData.actuallyY+'px'}"
        >
          {{ upToData.curPrice }}
        </div>
        <div
          v-if="upToData.rate"
          :class="styles.updateRate"
          :style="{background:'#f00',top:upToData.actuallyY+'px'}"
        >
          {{ formatNumber(upToData.rate,QLStockMarketIns._decimal) }}%
        </div>
        <div
          :class="[styles.dealMount,styles[`${theme}GenText`]]"
          :style="{top:QLStockMarketIns._paintConfig.dealMountPos+'px'}"
        >
          成交量:{{ splitNumber(upToData.dealMount == null ? curData.dealMount : upToData.dealMount) }}
        </div>
      </div>
      <div :class="styles.marketTime">
        <span
          v-for="(item,index) of QLStockMarketIns._paintConfig.paintTimeX"
          :key="index"
          :class="[styles.marketTimeItem,styles[`${theme}GenText`]]"
          :style="{left:item+'px'}"
        >{{ timeArr[index] }}</span>
      </div>
    </div>
    <div :class="styles.rightMess">
      <span
        v-for="(item,index) of QLStockMarketIns._paintConfig.valueRange.factorInc"
        :key="index"
        :class="[styles.valueItem,{[styles[`${theme}DownColor`]]:index>valueBorder,[styles[`${theme}UpColor`]]:index<valueBorder}]"
        :style="{top:`${QLStockMarketIns._paintConfig.valueRange.valueYPos[index] || 0}px`}"
      >{{ item+"%" }}</span>
      <!-- QLStockMarketIns._paintConfig.dealRange.valueYPos.length-1-index -->
      <span
        v-for="(item,index) of QLStockMarketIns._paintConfig.dealRange.actuallyValue"
        :key="index+'bottom'"
        :class="[styles.valueItem,styles[`${theme}DealMount`]]"
        :style="{top:`${QLStockMarketIns._paintConfig.dealRange.valueYPos[index] || 0}px`}"
      >{{ splitNumber(item) }}</span>
    </div>
  </div>
</template>
<script>
import styles from "../common/pc/timeSharing.scss";

import QLStockMarket from "../core";
import { splitNumber, formatNumber } from "../utils/index";

// const timeArr = ["09:30", "10:30", "11:30/13:00", "14:00", "15:00"];
const showMess = [
  { key: "curPrice", name: "现价" },
  { key: "avPrice", name: "均价" },
  { key: "rateUpDown", name: "涨跌" },
  { key: "rate", name: "涨幅" },
  { key: "dealMount", name: "量" },
  { key: "totalMoney", name: "额" }
];

export default {
  name: "TimeSharing",
  props: {
    width: {
      type: String,
      default: "100%"
    },
    height: {
      type: String,
      default: "100%"
    },
    frameName: {
      type: String,
      default: "a"
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
    }
  },
  data: function() {
    return {
      styles,

      curData: {},
      stockMarketMess: {}, //存储 所有的 动态 走势 信息
      QLStockMarketIns: {
        _paintConfig: {
          paintTimeX: [],
          valueRange: {
            actuallyValue: [],
            valueYPos: [],
            factorInc: []
          },
          dealRange: {
            actuallyValue: [],
            valueYPos: []
          }
        }
      }, //存储 实例化的 走势 对象
      valueBorder: null,
      upToData: {}, //时时数据
      upOrDown: false, //看看当前 是 涨还是跌
      decimal: 100 // 默认的保留位数
    };
  },
  computed: {
    showMess() {
      return showMess;
    },
    timeArr() {
      return this.QLStockMarketIns._paintConfig.timeFrame;
    },
    theme() {
      return this.config.theme ? this.config.theme : "light";
    }
  },
  watch: {
    dataGraph: {
      deep: true,
      handler(nv) {
        // console.log("============");
        this.QLStockMarketIns._data = {
          data: nv.data,
          preClosePrice: nv.preClosePrice
        };
      }
      // immediate: true,
    }
  },
  async mounted() {
    // console.log(this.$emit); //用这个进行 子组件向 父组件 传值
    let QLStockMarketIns = new QLStockMarket({
      selector: "#qlStockMarketT",
      data: {
        chartData: this.dataGraph
      },
      frameName: this.frameName,
      config: this.config,
      emit: {
        getUpToDataData: this.getUpToDataData.bind(this)
      }
    });

    /* 动态加入 感觉没意义 */
    /* let {Theme} = await import("../../../enums");
    console.log(Theme); */

    this.valueBorder =
      Math.ceil(
        QLStockMarketIns._paintConfig.valueRange.actuallyValue.length / 2
      ) - 1;
      this.QLStockMarketIns = QLStockMarketIns;
      this.curData = QLStockMarketIns._data.data[QLStockMarketIns._data.data.length - 1];
    // this.$set(this, "QLStockMarketIns", QLStockMarketIns);
    // this.$set(
    //   this,
    //   "curData",
    //   QLStockMarketIns._data.data[QLStockMarketIns._data.data.length - 1]
    // );
    // 判定当前 是 涨还是 跌;
    this.upOrDown = this.curData.rate < 0 ? "down" : "up";
    this.decimal = this.QLStockMarketIns._decimal;
  },
  unmounted() {
    this.QLStockMarketIns.cancelEventListener();
  },
  methods: {
    splitNumber,
    formatNumber,
    getUpToDataData(data) {
      // console.log("==============", data);
      this.upToData = data;
      // 判定当前 是 涨还是 跌;
      this.upOrDown = this.upToData.rate < 0 ? "down" : "up";
    }
  }
};
</script>

