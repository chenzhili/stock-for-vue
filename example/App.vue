<template>
   <div class="container">
      <KLineGraphComH5 :dataGraph="dataGraphForK" :config="configForK" :sTt="sTt"></KLineGraphComH5>
    <!-- <h2 class="title">{{title}}</h2>
    <div class="content">
      <div class="left">
        左侧内容：Lorem ipsum, dolor sit amet consectetur adipisicing elit. Debitis perspiciatis provident, necessitatibus quae labore, similique id dignissimos sit mollitia vero ullam repudiandae veniam molestias, ratione possimus magnam nihil nobis enim.
        <div class="btn" @click="click">点击</div>
      </div>
      <div class="main">
        <TimeSharingH5 :dataGraph="dataGraphForTime" :config="configForTime" :frameName="frame"></TimeSharingH5> -->
         <!-- <TimeSharing :dataGraph="dataGraphForTime" :config="configForTime" :frameName="frame"></TimeSharing> -->
       <!-- <KLineGraphCom :dataGraph="dataGraphForK" :config="configForK" :sTt="sTt"></KLineGraphCom> -->
      <!-- </div>
      <div
        class="right"
      >右侧内容：Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam nobis ullam voluptate. A maxime autem velit ducimus quos modi, natus esse molestias id officia inventore odit doloribus quod maiores deserunt?</div>
    </div> -->
  </div>
</template>
<script>
import { timeSharing, prevPrice, kData } from "./enums/dataJSON";
import { insType } from "./enums";

// k线周期 转换的数据
import { mData, dData } from "./enums/response";
export default {
  name: "App",
  components: {},
  data() {
    return {
      title: "Lorem ipsum dolor sit amet consectetur",
      dataGraphForTime: {
        data: timeSharing.slice(0,50),
        preClosePrice: prevPrice
      },
      dataGraphForK: { 
        data: kData//dData //mData//kData
      },
      frame:'hk',// a hk  night1  nigh2
      sTt: [],
      isShow: true
    };
  },
  mounted() {
    // console.log('kData', kData)
    setTimeout(() => {
      this.dataGraphForK.data = kData.slice(0, 9);
      // console.log(this.dataGraphForK.data.kData)
    }, 1000)
  },
  methods: {
    click() {
      // this.$set(this.dataGraphForTime, "data", timeSharing.slice(0, 100));
      // this.$set(this.dataGraphForK, "data", kData.slice(0, 500));
      this.isShow = !this.isShow;

      this.sTt = this.isShow ? [] : ["d", "w"];
    },
    changeSize() {
      this.height = "400px";
      // this.width = "300px";
    }
  },
  computed: {
    configForTime() {
      return {
        insType: insType.timeSharingDiagram,
        theme: "light"
      };
    },
    configForK() {
      return {
        insType: insType.kLineGraph,
        theme: "light",
        // initShowN:40
      };
    }
  }
};
</script>
<style scoped>
.container {
  border: 1px solid #ddd;
  height: 100%;
}
.btn {
  padding: 4px 6px;
  border: 1px solid #ddd;
  border-radius: 5px;
}
.title {
  text-align: center;
}
.content {
  display: flex;
  height: 100%;
  align-items: flex-start;
  text-align: center;
  
}
.main {
  width: 578px;
  height: 555px;
  border: 1px solid #f00;
}
.left,
.right {
  flex: 2;
}
</style>
