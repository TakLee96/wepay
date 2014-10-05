var model = require('../models/MongoDBModel');

// Adds a user to the database
// req.body : {
//   userid: the unique facebook user id,
//   name: the user's full name
// }
// return : {
//   userid: Strin,
//   name: String,
//   venmo_username: String
// }
var addUser = function(req, res) {
  var user = req.body;
  console.log("[UserController] Try to create User: %s", JSON.stringify(user));
  MongoDBModel.addUser(user, function(new_user) {
    if (new_user) {
      console.log('[UserController] Added new_user: %s', JSON.stringify(new_user));
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
  MongoDBModel.getUser(userid, function(user) {
    if (user) {
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
  var update = req.body;
  MongoDBModel.updateUser(update, function(user) {
    if (user) {
      res.json(user[0]);
    } else {
      // TODO: Add error handling
    }
  });
};

//var clean = function(req, res) {
//    model.clean(function() {
//        res.json({data: "[Controller] Clean!"});
//    });
//};
//
//var find = function(req, res) {
//    model.findAll(function(data1, data2) {
//        res.json({data: "[Controller] Clean!", data1: data1, data2: data2});
//    })
//};
//
//var test = function(req, res){
//    model.unit_testing();
//    res.json({data: "shit"});
//};

module.exports = {
  addUser: addUser,
  getUser: getUser,
  updateUser: updateUser,
//  clean: clean
//  find: find,
//  test: test
};
