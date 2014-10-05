var model = require('../models/model');

// device : {
//   userid : user's id,
//   device_token : token of device we can send push notifs to
// }
var registerDevice = function (req, res) {
  var device = req.body;
  model.registerDevice(device, function (device) {
    res.json(device);
  });
};

module.exports = {
  registerDevice: registerDevice,
};
