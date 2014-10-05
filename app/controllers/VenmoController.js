

/**
 * Venmo verifies our API endpoint by sending a query parameter,
 * venmo_challenge, and expecting us to return the parameter as plain text.
 */
var venmoVerify = function(req, res) {
  var venmo_challenge = req.param('venmo_challenge');
  res.set('Content-Type', 'text/plain');
  res.send(venmo_challenge);
};

var venmoWebHook = function(req, res) {
  // TODO: Do something with the venmoWebHook... (I think we check for payments
  // going through with this?)
};

module.exports = {
  venmoVerify: venmoVerify,
  venmoWebHook: venmoWebHook,
};
