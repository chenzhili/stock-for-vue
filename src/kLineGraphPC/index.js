import KLineGraphPC from './kLineGraph';


KLineGraphPC.install = function(app) {
  app.component(KLineGraphPC.name, KLineGraphPC);
};

export default KLineGraphPC;