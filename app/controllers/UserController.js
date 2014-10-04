var model = require('../models/model');

// Adds a user to the database
// req.body : {
//   userid: the unique facebook user id,
//   name: the user's full name
// }
// return : {
//   userid: _,
//   name: _,
//   user_posts: [],
//   associated_posts: []
// }
var addUser = function(req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");

  var user = req.body;
  model.addUser(user, function(new_user) {
    if (new_user !== null && new_user.length != 0) {
      res.json(new_user[0]);
    } else {
     // TODO: Add error handling
    }
  });
};

// Gets a user from the database given the userid
// req.params.userid : the facebook user id
// return : user object as json
var getUser = function(req, res) {
  var userid = req.params.userid;
  model.getUser(userid, function(user) {
    if (user !== null && user.length != 0) {
      res.json(user[0]);
    } else {
     // TODO: Add error handling
    }
  });
};

// Updates a user given the user id
// req.params.userid : the user id of the user to update
// req.body : {
//   new user object
// }
// return : new user object
var updateUser = function(req, res) {
  // TODO: Implement updateUser function
};

module.exports = {
  addUser: addUser,
  getUser: getUser,
  updateUser: updateUser
};
