import KLineGraphComH5 from './kLineGraphH5'
import KLineGraphCom from './kLineGraphPC'
import TimeSharingH5 from './timeSharingH5'
import TimeSharing from './timeSharingPC'

const Stock= {
  install (app) {
    app.component(KLineGraphComH5.name, KLineGraphComH5)
    app.component(KLineGraphCom.name, KLineGraphCom)
    app.component(TimeSharingH5.name, TimeSharingH5)
    app.component(TimeSharing.name, TimeSharing)
  }
}

export default Stock