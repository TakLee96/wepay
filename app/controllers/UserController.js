var model = require('./app/models/model');

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

};

// Gets a user from the database given the userid
// req.params.userid : the facebook user id
// return : user object as json
var getUser = function(req, res) {

};

// Updates a user given the user id
// req.params.userid : the user id of the user to update
// req.body : {
//   new user object
// }
// return : new user object
var updateUser = function(req, res) {

};

module.exports = {
  addUser: addUser,
  getUser: getUser,
  updateUser: updateUser
};
