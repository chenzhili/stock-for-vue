
import initCanvas from "./init"
import initEvent from "../events"
import initData from "./initData"

function QLStockMarket(options) {
    const tempData = this.outputData(options);
    options.data = tempData;
    this.init(options);
}
initCanvas(QLStockMarket);
initEvent(QLStockMarket);
initData(QLStockMarket);


export default QLStockMarket;


