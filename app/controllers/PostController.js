var model = require('./app/models/model');

// Add a post to the database
// req.body : {
//   title: the post's title,
//   money_requested: how much money the user needs to buy the thing,
//   creator_id: the userid of the creator
// }
// return : post object as json
var addPost = function(req, res) {

};

// Gets a post from the database given the postid
// req.params.postid : the unique post id
// return : post object as json
var getPost = function(req, res) {

};

// Updates a post given the post id
// req.params.postid : the post id of the post to update
// req.body : {
//   new post object
// }
var updatePost = function(req, res) {

};

// Gets the posts associated with a userid
// request.params.userid : the user id to filter by
// return : array of post objects as json
var getPostsUserID = function(req, res) {

};

module.exports = {
  addPost: addPost,
  getPost: getPost,
  updatePost: updatePost,
  getPostsUserID: getPostsUserID,
};
