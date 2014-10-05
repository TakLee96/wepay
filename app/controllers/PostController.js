var model = require('../models/model');

// Add a post to the database
// req.body : {
//   title: the post's title,
//   money_requested: how much money the user needs to buy the thing,
//   userid: the userid of the creator,
//   copayers: [ people helping to pay for thing (array of userids)
//     userid: ...,
//   ]
// }
// return : post object as json
var addPost = function(req, res) {
  var post = req.body;
  model.addPost(post, function(new_post) {
    if (new_post) {
      res.json(new_post[0]);
    } else {
      // TODO: Add error handling
    }
  });
};

// Gets a post from the database given the postid
// req.params.postid : the unique post id
// return : post object as json
var getPost = function(req, res) {
  var postid = req.params.postid;
  model.getPost(postid, function(post) {
    if (post) {
      res.json(post[0]);
    } else {
      // TODO: Add error handling
    }
  });
};

// Updates a post given the post id
// req.params.postid : the post id of the post to update
// req.body : {
//   new post object
// }
var updatePost = function(req, res) {
  var postid = req.params.postid;
  model.updatePost(postid, function(post) {
    console.log(postid);
    if (post) {
      res.json(post[0]);
    } else {
      // TODO: Add error handling
    }
  });
};

// Gets the posts associated with a userid
// req.params.userid : the user id to filter by
// return : array of post objects as json
var getPostsUserID = function(req, res) {
  var userid = req.params.userid;
  model.getPostsUserID(userid, function(posts){
    if (posts) {
      res.json(posts);
    } else {
      // TODO: Add error handling
    }
  });
};

var getPosts = function(req, res) {
  var postids = req.param('postids');
  postids = postids.split(',');
  console.log('[PostController] getPosts postids: %s', JSON.stringify(postids));
  model.getPosts(postids, function(posts) {
    if (posts) {
      res.json(posts);
    } else {
      // TODO: Add error handling
    }
  });
};

module.exports = {
  addPost: addPost,
  getPost: getPost,
  updatePost: updatePost,
  getPostsUserID: getPostsUserID,
  getPosts: getPosts,
};
