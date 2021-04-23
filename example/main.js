import { createApp, h } from 'vue'
// import Vue from 'vue'
import App from './App.vue'
// 局部引入
// 样式引入
// import '../lib/timeSharingPC/index.css'
// import TimeSharingPC from '../lib/timeSharingPC/index'
import '../lib/index.css'
import StockCom from  '../lib/index'


const app = createApp({
  render: () => h(App)
})
// console.log(app);
// app.component(Test.name, Test)
/* 全局引入方式 */
app.use(StockCom)
/* 局部引入方式 */
// app.use(Test)

app.mount('#app');
