import TimeSharingPC from './timeSharing';

/* istanbul ignore next */
TimeSharingPC.install = function(app) {
  app.component(TimeSharingPC.name, TimeSharingPC);
};

export default TimeSharingPC;